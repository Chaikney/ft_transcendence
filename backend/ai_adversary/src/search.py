import time
import chess
import chess.polyglot

# Constants for Transposition Table flags
EXACT = 0
LOWERBOUND = 1
UPPERBOUND = 2

# Piece values for Move Ordering (MVV-LVA)
PIECE_VALUES = {
    chess.PAWN: 100,
    chess.KNIGHT: 320,
    chess.BISHOP: 330,
    chess.ROOK: 500,
    chess.QUEEN: 900,
    chess.KING: 20000
}

class SearchTimeout(Exception):
    """Exception raised when the search exceeds the allocated time limit."""
    pass

class TranspositionTable:
    """
    Transposition Table storing previously searched positions to avoid redundant search.
    Keyed by board Zobrist hash.
    """
    def __init__(self):
        self.table = {}

    def lookup(self, board_hash: int, depth: int, alpha: float, beta: float) -> tuple[float | None, int | None, chess.Move | None]:
        if board_hash in self.table:
            entry = self.table[board_hash]
            stored_depth, val, flag, best_move = entry
            
            # If we searched this position at a deeper or equal depth
            if stored_depth >= depth:
                if flag == EXACT:
                    return val, flag, best_move
                elif flag == LOWERBOUND and val >= beta:
                    return val, flag, best_move
                elif flag == UPPERBOUND and val <= alpha:
                    return val, flag, best_move
            return None, flag, best_move
        return None, None, None

    def store(self, board_hash: int, depth: int, val: float, flag: int, best_move: chess.Move | None):
        # Store in table (using simple replacement strategy)
        self.table[board_hash] = (depth, val, flag, best_move)

    def clear(self):
        self.table.clear()


def order_moves(board: chess.Board, moves: list[chess.Move], tt_move: chess.Move | None = None) -> list[chess.Move]:
    """
    Orders moves to maximize alpha-beta pruning efficiency.
    Searches checks, promotions, and captures (MVV-LVA) first.
    """
    def score_move(move: chess.Move) -> float:
        # 1. Prioritize the best move stored in the Transposition Table
        if tt_move is not None and move == tt_move:
            return 100000.0

        score = 0.0

        # 2. Prioritize promotions
        if move.promotion:
            score += 90000.0 + (PIECE_VALUES.get(move.promotion, 0) / 10.0)

        # 3. Prioritize captures using MVV-LVA (Most Valuable Victim - Least Valuable Aggressor)
        if board.is_capture(move):
            victim = board.piece_at(move.to_square)
            attacker = board.piece_at(move.from_square)
            
            victim_val = PIECE_VALUES.get(victim.piece_type if victim else chess.PAWN, 100)
            attacker_val = PIECE_VALUES.get(attacker.piece_type if attacker else chess.PAWN, 100)
            
            # Queen capturing pawn = 900 - 9 = 891
            # Pawn capturing queen = 9000 - 1 = 8999
            score += 10000.0 + (victim_val * 10) - (attacker_val / 10.0)

        # 4. Prioritize checks
        if board.gives_check(move):
            score += 5000.0

        # Castling and other positional heuristics can be added here
        return score

    return sorted(moves, key=score_move, reverse=True)


class ChessEngine:
    def __init__(self, evaluator_fn):
        """
        evaluator_fn: A function that takes a chess.Board and returns a float score
                      from the perspective of the side to move.
        """
        self.evaluator = evaluator_fn
        self.tt = TranspositionTable()
        self.nodes_visited = 0
        self.start_time = 0.0
        self.time_limit = 0.0

    def negamax(self, board: chess.Board, depth: int, alpha: float, beta: float) -> float:
        """
        Core Negamax Alpha-Beta search with Transposition Table.
        """
        self.nodes_visited += 1
        
        # Periodic timeout check (every 512 nodes to prevent checking clock too frequently)
        if self.nodes_visited % 512 == 0 and self.time_limit > 0.0:
            if time.time() - self.start_time > self.time_limit:
                raise SearchTimeout()

        board_hash = chess.polyglot.zobrist_hash(board)
        
        # 1. Transposition Table Lookup
        stored_val, stored_flag, tt_move = self.tt.lookup(board_hash, depth, alpha, beta)
        if stored_val is not None:
            return stored_val

        # 2. Terminal base cases
        if board.is_game_over():
            # If in checkmate, return large negative value relative to depth (prefer quicker checkmates)
            if board.is_checkmate():
                return -20000.0 - depth
            # Draw
            return 0.0

        if depth <= 0:
            return self.evaluator(board)

        # 3. Move Ordering & Recursive Search
        legal_moves = list(board.legal_moves)
        ordered_moves = order_moves(board, legal_moves, tt_move)
        
        best_val = -float('inf')
        best_move = None
        original_alpha = alpha

        for move in ordered_moves:
            board.push(move)
            try:
                # Standard Negamax call (flip signs and bounds)
                val = -self.negamax(board, depth - 1, -beta, -alpha)
            finally:
                board.pop()

            if val > best_val:
                best_val = val
                best_move = move

            alpha = max(alpha, val)
            if alpha >= beta:
                # Alpha-Beta Pruning (cutoff)
                break

        # 4. Store search result in Transposition Table
        if best_val <= original_alpha:
            flag = UPPERBOUND
        elif best_val >= beta:
            flag = LOWERBOUND
        else:
            flag = EXACT
            
        self.tt.store(board_hash, depth, best_val, flag, best_move)
        return best_val

    def search(self, board: chess.Board, max_depth: int = 10, time_limit: float = 0.3) -> tuple[chess.Move | None, float]:
        """
        Executes Iterative Deepening search within the specified time_limit (in seconds).
        Returns the best move found and its score.
        """
        self.start_time = time.time()
        self.time_limit = time_limit
        self.nodes_visited = 0
        
        best_move_so_far = None
        best_score_so_far = 0.0
        
        # Clear Transposition Table between moves if it gets too large
        if len(self.tt.table) > 100000:
            self.tt.clear()

        try:
            for depth in range(1, max_depth + 1):
                board_hash = chess.polyglot.zobrist_hash(board)
                
                # Perform search for this depth
                self.negamax(board, depth, -float('inf'), float('inf'))
                
                # Retrieve the best move and score for this depth from the TT
                _, _, best_move = self.tt.lookup(board_hash, depth, -float('inf'), float('inf'))
                
                if best_move is not None:
                    best_move_so_far = best_move
                    
                # Get the score from perspective of side to move
                entry = self.tt.table.get(board_hash)
                if entry is not None:
                    best_score_so_far = entry[1]

                # If we have run out of 80% of our time budget, don't start next depth
                elapsed = time.time() - self.start_time
                if time_limit > 0.0 and elapsed > (time_limit * 0.8):
                    break

        except SearchTimeout:
            # Stopped early due to timeout, return what we found in the last completed depth
            pass

        # If we failed to find any move (e.g. timeout on depth 1), pick first legal move
        if best_move_so_far is None and list(board.legal_moves):
            best_move_so_far = list(board.legal_moves)[0]

        return best_move_so_far, best_score_so_far
