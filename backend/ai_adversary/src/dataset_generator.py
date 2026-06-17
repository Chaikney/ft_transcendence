import os
import sys

# Add the project root to sys.path to allow absolute imports of the src package
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

import json
import random
import time
import multiprocessing
import chess
from src.classical_eval import evaluate_board
from src.search import ChessEngine

def generate_positions_worker(worker_id: int, num_positions_needed: int, output_file_path: str):
    """
    Worker process function.
    Plays games against itself using semi-random heuristic moves,
    evaluates positions at depth 2 using classical evaluation, and writes them to a file.
    """
    # Seed the random number generator uniquely for each worker
    random.seed(worker_id + int(time.time()))
    
    # Initialize engine with classical evaluator
    engine = ChessEngine(evaluate_board)
    
    positions_collected = 0
    start_time = time.time()
    
    print(f"Worker {worker_id} started. Target: {num_positions_needed} positions.")
    
    with open(output_file_path, "w") as f:
        while positions_collected < num_positions_needed:
            board = chess.Board()
            move_count = 0
            
            # Play a game up to 100 moves or until game over
            while not board.is_game_over() and move_count < 100:
                legal_moves = list(board.legal_moves)
                if not legal_moves:
                    break
                
                # High-speed tactical move selection:
                # - 50% of the time (if captures exist): pick a random capture (simulating active tactical play)
                # - Otherwise: pick a completely random legal move
                # This runs in microseconds, speeding up position generation by ~300%.
                captures = [m for m in legal_moves if board.is_capture(m)]
                if captures and random.random() < 0.5:
                    move = random.choice(captures)
                else:
                    move = random.choice(legal_moves)
                
                board.push(move)
                move_count += 1
                perfect balance of speed and tactical accuracy)
                    
                # Start collecting after move 8, and only when the board is not in check.
                # Check positions are very volatile and search evaluations can be noisy.
                if move_count >= 8 and not board.is_check():
                    # Evaluate the position to depth 1 (high-speed search)
                    _, score = engine.search(board, max_depth=1, time_limit=0.0)
                    
                    # Store FEN and search score (relative to side to move)
                    f.write(json.dumps({"fen": board.fen(), "eval": score}) + "\n")
                    positions_collected += 1
                    
                    # Log progress periodically
                    if positions_collected % 5000 == 0:
                        elapsed = time.time() - start_time
                        nps = positions_collected / elapsed if elapsed > 0 else 0
                        print(f"Worker {worker_id}: Collected {positions_collected}/{num_positions_needed} positions ({nps:.1f} pos/sec)")
                    
                    if positions_collected >= num_positions_needed:
                        break
                        
    print(f"Worker {worker_id} finished. Collected {positions_collected} positions in {time.time() - start_time:.1f}s.")


import argparse

def main():
    parser = argparse.ArgumentParser(description="Dataset Generator for NNUE Chess")
    parser.add_argument("-n", "--size", type=int, default=500000, help="Total number of positions to generate")
    args = parser.parse_args()
    
    # Target dataset size
    total_positions = args.size
    
    # Use all available CPU cores, leaving one free for system stability
    num_workers = max(1, multiprocessing.cpu_count() - 1)
    positions_per_worker = total_positions // num_workers
    
    print(f"Dataset Generation started.")
    print(f"Target size: {total_positions} positions.")
    print(f"Workers: {num_workers} (each collecting {positions_per_worker} positions).")
    
    # Create directory for data
    os.makedirs("data", exist_ok=True)
    
    workers = []
    temp_files = []
    
    for i in range(num_workers):
        temp_file = f"data/raw_positions_worker_{i}.jsonl"
        temp_files.append(temp_file)
        
        # Spawn the process
        p = multiprocessing.Process(
            target=generate_positions_worker,
            args=(i, positions_per_worker, temp_file)
        )
        workers.append(p)
        p.start()
        
    # Wait for all workers to finish
    for p in workers:
        p.join()
        
    print("All workers finished. Consolidating datasets...")
    
    # Combine all temp worker files into a single master dataset file
    master_file = "data/dataset.jsonl"
    total_written = 0
    
    with open(master_file, "w") as outfile:
        for temp_file in temp_files:
            if os.path.exists(temp_file):
                with open(temp_file, "r") as infile:
                    for line in infile:
                        outfile.write(line)
                        total_written += 1
                # Remove temp file
                os.remove(temp_file)
                
    print(f"Dataset consolidation complete. Master file saved: {master_file}")
    print(f"Total positions written: {total_written}")


if __name__ == "__main__":
    main()
