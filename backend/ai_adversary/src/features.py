import chess

# Total features for one perspective:
# 64 king squares * 10 piece types * 64 piece squares = 40,960 features
NUM_FEATURES = 40960

# Mapping from piece type to index (excluding Kings, which define the accumulator)
# 0-4 are active (own color) pieces, 5-9 are passive (opponent color) pieces.
PIECE_TYPE_MAP = {
    chess.PAWN: 0,
    chess.KNIGHT: 1,
    chess.BISHOP: 2,
    chess.ROOK: 3,
    chess.QUEEN: 4
}

def get_perspective_features(board: chess.Board, perspective_color: chess.Color) -> list[int]:
    """
    Computes the list of active feature indices for a given color's perspective.
    
    For perspective_color:
    - King square K is retrieved (and flipped vertically if perspective_color is Black).
    - For all other pieces on square 'sq':
      - If White perspective: pieces keep original colors, squares are raw.
      - If Black perspective: piece colors are swapped, squares are flipped vertically.
    - Each piece maps to index: K * 640 + PieceTypeIndex * 64 + SquareIndex.
    """
    # Get the king's square for the active perspective
    king_square = board.king(perspective_color)
    if king_square is None:
        # Fallback if no king exists (should not happen in legal chess)
        king_square = 0
        
    if perspective_color == chess.BLACK:
        # Flip king square vertically so Black's home rank matches White's
        king_square = king_square ^ 56

    features = []
    
    # Iterate over all pieces on the board
    for sq in chess.SQUARES:
        piece = board.piece_at(sq)
        if piece is None or piece.piece_type == chess.KING:
            # Skip empty squares and Kings (Kings determine the accumulator index)
            continue
            
        piece_type = piece.piece_type
        piece_color = piece.color
        
        if perspective_color == chess.WHITE:
            # White's perspective:
            # - Own pieces (White) map to 0-4
            # - Opponent pieces (Black) map to 5-9
            # - Squares are unmodified
            if piece_color == chess.WHITE:
                p_idx = PIECE_TYPE_MAP[piece_type]
            else:
                p_idx = PIECE_TYPE_MAP[piece_type] + 5
            s_idx = sq
        else:
            # Black's perspective:
            # - Own pieces (Black) map to 0-4 (color swap!)
            # - Opponent pieces (White) map to 5-9 (color swap!)
            # - Squares are flipped vertically
            if piece_color == chess.BLACK:
                p_idx = PIECE_TYPE_MAP[piece_type]
            else:
                p_idx = PIECE_TYPE_MAP[piece_type] + 5
            s_idx = sq ^ 56
            
        # Calculate unique feature index
        # 640 comes from 10 piece types * 64 squares
        feature_idx = king_square * 640 + p_idx * 64 + s_idx
        features.append(feature_idx)
        
    return features

def get_board_features(board: chess.Board) -> tuple[list[int], list[int]]:
    """
    Returns the active and passive features lists based on whose turn it is.
    - Active features: features from the side-to-move's perspective.
    - Passive features: features from the opponent's perspective.
    """
    if board.turn == chess.WHITE:
        # White to move: White is active, Black is passive
        active = get_perspective_features(board, chess.WHITE)
        passive = get_perspective_features(board, chess.BLACK)
    else:
        # Black to move: Black is active, White is passive
        active = get_perspective_features(board, chess.BLACK)
        passive = get_perspective_features(board, chess.WHITE)
        
    return active, passive
