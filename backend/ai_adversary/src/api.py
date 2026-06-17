import os
import sys
import time
import chess
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import uvicorn

# Add project root to sys.path to allow absolute imports of the src package
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.classical_eval import evaluate_board
from src.features import get_board_features
from src.nnue import NumPyNNUE
from src.search import ChessEngine

app = FastAPI(title="NNUE Chess Adversary API", description="FastAPI service for a high-performance NNUE-based chess engine.")

# Global references for the evaluator and engine
numpy_nnue = None
evaluator_type = "classical"

def nnue_evaluator(board: chess.Board) -> float:
    """
    Evaluates the board using the trained NNUE model.
    Rescales the network output by 100.0 to return standard centipawns.
    """
    if numpy_nnue is None:
        return evaluate_board(board)
    
    # Check for terminal state
    if board.is_checkmate():
        return -20000.0
    if board.is_stalemate() or board.is_insufficient_material() or board.is_fivefold_repetition():
        return 0.0
        
    active, passive = get_board_features(board)
    # The network is trained on scores / 100.0, so we scale it back up by 100.0
    return numpy_nnue.evaluate(active, passive) * 100.0


def initialize_engine():
    """Loads model weights and initializes the NumPyNNUE evaluator."""
    global numpy_nnue, evaluator_type
    
    npz_path = os.path.join(project_root, "src", "lightweight_chess_model.npz")
    pth_path = os.path.join(project_root, "src", "lightweight_chess_model.pth")
    
    # Try loading NumPy-only compressed format first (does not require PyTorch)
    if os.path.exists(npz_path):
        try:
            print(f"Loading NNUE model weights from {npz_path} (NumPy format)...")
            import numpy as np
            data = np.load(npz_path)
            state_dict = {k: data[k] for k in data.files}
            numpy_nnue = NumPyNNUE(state_dict)
            evaluator_type = "nnue"
            print("NNUE model loaded successfully. Using NumPyNNUE evaluator.")
            return
        except Exception as e:
            print(f"Warning: Failed to load NNUE model from .npz. Error: {e}")
            
    # Fallback to standard PyTorch .pth format (requires torch package)
    if os.path.exists(pth_path):
        try:
            print(f"Loading NNUE model weights from {pth_path} (PyTorch format)...")
            import torch
            state_dict = torch.load(pth_path, map_location=torch.device("cpu"))
            numpy_nnue = NumPyNNUE(state_dict)
            evaluator_type = "nnue"
            print("NNUE model loaded successfully. Using NumPyNNUE evaluator.")
            return
        except Exception as e:
            print(f"Warning: Failed to load NNUE model from .pth. Error: {e}")
            
    print("Warning: No NNUE weights found or failed to load. Falling back to classical evaluator.")
    numpy_nnue = None
    evaluator_type = "classical"


@app.on_event("startup")
def startup_event():
    initialize_engine()


class FENRequest(BaseModel):
    fen: str = Field(..., example="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    time_limit_ms: int = Field(300, ge=10, le=5000, description="Search time limit in milliseconds (10ms to 5000ms)")


class MoveRequest(BaseModel):
    fen: str = Field(..., example="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    move: str = Field(..., example="e2e4")


class FENResponse(BaseModel):
    fen: str
    best_move: str
    score: float
    nodes_searched: int
    evaluator_used: str
    status: str
    next_fen: str | None = None
    game_status: str | None = None
    turn: str | None = None
    last_move: dict | None = None


class EvalResponse(BaseModel):
    fen: str
    score: float
    evaluator_used: str


def _move_response(board: chess.Board, request_fen: str, move: chess.Move | None, score: float = 0.0, nodes_searched: int = 0) -> FENResponse:
    next_fen = request_fen
    next_turn = "white" if board.turn == chess.BLACK else "black"
    game_status = "active"
    last_move = None

    if move:
        board.push(move)
        next_fen = board.fen()
        next_turn = "white" if board.turn == chess.WHITE else "black"

        if board.is_checkmate():
            game_status = "checkmate"
        elif board.is_stalemate() or board.is_insufficient_material() or board.is_fivefold_repetition():
            game_status = "draw"

        moved_piece = board.piece_at(move.to_square)
        last_move = {
            "from": chess.square_name(move.from_square),
            "to": chess.square_name(move.to_square),
            "piece": moved_piece.symbol().upper() if moved_piece else "",
        }

    return FENResponse(
        fen=request_fen,
        best_move=move.uci() if move else "0000",
        score=round(score, 1),
        nodes_searched=nodes_searched,
        evaluator_used=evaluator_type,
        status="success",
        next_fen=next_fen,
        game_status=game_status,
        turn=next_turn,
        last_move=last_move,
    )


@app.get("/")
@app.get("/health")
def health_check():
    """Simple healthcheck endpoint."""
    return {
        "status": "healthy",
        "evaluator": evaluator_type,
        "nnue_loaded": numpy_nnue is not None,
        "timestamp": time.time()
    }


@app.post("/predict_move", response_model=FENResponse)
def predict_move(request: FENRequest):
    """
    Given a FEN, searches for the best legal move within the time limit.
    Returns the UCI string representation of the move and its evaluation.
    """
    try:
        # Re-initialize engine check (helps in case model gets trained/updated while server is running)
        if numpy_nnue is None:
            initialize_engine()
            
        board = chess.Board(request.fen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN string: {e}")

    # Select evaluator function
    eval_fn = nnue_evaluator if evaluator_type == "nnue" else evaluate_board
    
    # Initialize engine search
    engine = ChessEngine(eval_fn)
    
    time_limit_sec = request.time_limit_ms / 1000.0
    
    # Run the iterative deepening Negamax search
    best_move, score = engine.search(board, max_depth=10, time_limit=time_limit_sec)

    return _move_response(board, request.fen, best_move, score=score, nodes_searched=engine.nodes_visited)


@app.post("/apply_move", response_model=FENResponse)
def apply_move(request: MoveRequest):
    """Apply a UCI move to the provided FEN and return the updated board state."""
    try:
        board = chess.Board(request.fen)
        move = chess.Move.from_uci(request.move)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid request payload: {e}")

    if move not in board.legal_moves:
        raise HTTPException(status_code=400, detail="Illegal move for the provided FEN")

    return _move_response(board, request.fen, move)


@app.post("/evaluate", response_model=EvalResponse)
def evaluate_position(request: FENRequest):
    """
    Returns the static evaluation of a position from the perspective of the side to move.
    """
    try:
        if numpy_nnue is None:
            initialize_engine()
        board = chess.Board(request.fen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid FEN string: {e}")

    eval_fn = nnue_evaluator if evaluator_type == "nnue" else evaluate_board
    score = eval_fn(board)
    
    return EvalResponse(
        fen=request.fen,
        score=round(score, 1),
        evaluator_used=evaluator_type
    )
