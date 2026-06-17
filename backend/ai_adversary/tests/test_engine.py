import os
import sys
import time
import torch
import numpy as np
import chess
from fastapi.testclient import TestClient

# Add project root to sys.path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.features import get_board_features, get_perspective_features, NUM_FEATURES
from src.nnue import NNUE, NumPyNNUE
from src.classical_eval import evaluate_board
from src.search import ChessEngine
from src.api import app, nnue_evaluator

def test_feature_symmetry():
    """
    Verifies that the feature extraction exhibits perfect color symmetry.
    A mirror position with swapped colors should yield identical active/passive features.
    """
    board = chess.Board()
    # Play some moves to make it asymmetric
    board.push_san("e4")
    board.push_san("e5")
    board.push_san("Nf3")
    board.push_san("Nc6")
    
    # White features in this position
    w_active = get_perspective_features(board, chess.WHITE)
    w_passive = get_perspective_features(board, chess.BLACK)
    
    # Create a mirrored board (colors swapped, ranks flipped)
    # python-chess has board.mirror() which swaps colors and mirrors ranks
    mirrored_board = board.mirror()
    
    # For the mirrored board, Black's perspective should be identical to the original White's perspective,
    # and White's perspective identical to the original Black's perspective.
    mirror_active_black = get_perspective_features(mirrored_board, chess.BLACK)
    mirror_passive_white = get_perspective_features(mirrored_board, chess.WHITE)
    
    assert set(w_active) == set(mirror_active_black), "Active features color symmetry failed"
    assert set(w_passive) == set(mirror_passive_white), "Passive features color symmetry failed"
    print("Test 1 Passed: Feature symmetry holds perfectly.")


def test_model_equivalence():
    """
    Verifies that NumPyNNUE yields identical evaluation scores to PyTorch NNUE
    given the same board features.
    """
    torch.manual_seed(42)
    model = NNUE()
    state_dict = model.state_dict()
    
    # Initialize NumPy version
    numpy_model = NumPyNNUE(state_dict)
    
    # Test on starting board
    board = chess.Board()
    active, passive = get_board_features(board)
    
    # PyTorch evaluation (needs batch dimension)
    active_tensor = torch.tensor(active, dtype=torch.long)
    active_off = torch.tensor([0], dtype=torch.long)
    passive_tensor = torch.tensor(passive, dtype=torch.long)
    passive_off = torch.tensor([0], dtype=torch.long)
    
    model.eval()
    with torch.no_grad():
        pytorch_val = model(active_tensor, active_off, passive_tensor, passive_off).item()
        
    # NumPy evaluation
    numpy_val = numpy_model.evaluate(active, passive)
    
    assert np.isclose(pytorch_val, numpy_val, atol=1e-5), f"Model outputs differ: PyTorch={pytorch_val}, NumPy={numpy_val}"
    print("Test 2 Passed: PyTorch and NumPy NNUE evaluations are identical.")


def test_search_and_time_limit():
    """
    Verifies that the Negamax search runs correctly, chooses legal moves,
    and respects the time budget.
    """
    board = chess.Board()
    engine = ChessEngine(evaluate_board)
    
    # Search with a small time budget
    time_limit = 0.1 # 100ms
    start = time.time()
    best_move, score = engine.search(board, max_depth=6, time_limit=time_limit)
    elapsed = time.time() - start
    
    assert best_move in board.legal_moves, f"Engine searched and picked an illegal move: {best_move}. Legal moves: {list(board.legal_moves)}"
    # Allow some buffer for thread switching / OS overhead, but should be close to time limit
    assert elapsed < time_limit + 0.05, f"Search took too long: {elapsed:.3f}s for limit {time_limit}s"
    print(f"Test 3 Passed: Search completed in {elapsed:.3f}s (budget: {time_limit}s). Move: {best_move}, Score: {score}")


def test_api():
    """
    Tests FastAPI endpoints using FastAPI's built-in TestClient.
    """
    client = TestClient(app)
    
    # 1. Healthcheck endpoint
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    
    # 2. Evaluate endpoint
    test_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    response = client.post("/evaluate", json={"fen": test_fen})
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert data["fen"] == test_fen
    
    # 3. Predict move endpoint
    response = client.post("/predict_move", json={"fen": test_fen, "time_limit_ms": 150})
    assert response.status_code == 200
    data = response.json()
    assert "best_move" in data
    assert "score" in data
    assert data["status"] == "success"
    assert "next_fen" in data
    assert "game_status" in data

    # 4. Apply move endpoint
    response = client.post("/apply_move", json={"fen": test_fen, "move": "e2e4"})
    assert response.status_code == 200
    data = response.json()
    assert data["best_move"] == "e2e4"
    assert data["game_status"] == "active"
    assert data["turn"] == "black"
    assert data["last_move"]["from"] == "e2"
    assert data["last_move"]["to"] == "e4"
    print("Test 4 Passed: FastAPI server endpoints return valid schemas.")


def main():
    print("Running Engine Tests...")
    test_feature_symmetry()
    test_model_equivalence()
    test_search_and_time_limit()
    test_api()
    print("All tests completed successfully!")

if __name__ == "__main__":
    main()
