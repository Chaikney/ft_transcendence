import os
import sys

# Add project root to sys.path to allow absolute imports of the src package
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

import json
import time
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import chess
from src.features import get_board_features
from src.nnue import NNUE

class ChessDataset(Dataset):
    """
    In-memory dataset of chess features and evaluations.
    Pre-computes and caches features to ensure training loops run at maximum CPU/GPU speed.
    """
    def __init__(self, data_list):
        self.samples = []
        start_time = time.time()
        print(f"Caching features for {len(data_list)} positions in memory...")
        
        for idx, item in enumerate(data_list):
            fen = item["fen"]
            raw_score = item["eval"]
            
            # Clamp evaluation score to [-2000, 2000] centipawns (20 pawns)
            # Positions better/worse than 20 pawns are trivial, and clamping prevents outlier gradients.
            score = max(-2000.0, min(2000.0, float(raw_score)))
            
            # Scale score by dividing by 100 (pawns) for numerical stability during training
            scaled_score = score / 100.0
            
            # Extract features from FEN
            board = chess.Board(fen)
            active_features, passive_features = get_board_features(board)
            
            self.samples.append((active_features, passive_features, scaled_score))
            
            if (idx + 1) % 100000 == 0:
                print(f"  Processed {idx + 1}/{len(data_list)} FENs...")
                
        print(f"Finished feature caching in {time.time() - start_time:.1f}s.")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return self.samples[idx]


def collate_fn(batch):
    """
    Custom collate function for EmbeddingBag.
    Combines individual sparse features into single flat tensors with starting offsets.
    """
    active_features = []
    passive_features = []
    active_offsets = [0]
    passive_offsets = [0]
    targets = []
    
    for active, passive, score in batch:
        active_features.extend(active)
        passive_features.extend(passive)
        active_offsets.append(len(active_features))
        passive_offsets.append(len(passive_features))
        targets.append(score)
        
    # Offsets denote the starting index of each item in the 1D feature tensor.
    # We remove the last entry since it's the total length boundary.
    active_offsets = active_offsets[:-1]
    passive_offsets = passive_offsets[:-1]
    
    return (
        torch.tensor(active_features, dtype=torch.long),
        torch.tensor(active_offsets, dtype=torch.long),
        torch.tensor(passive_features, dtype=torch.long),
        torch.tensor(passive_offsets, dtype=torch.long),
        torch.tensor(targets, dtype=torch.float).unsqueeze(1)
    )


import argparse

def train():
    parser = argparse.ArgumentParser(description="Train NNUE Chess Model")
    parser.add_argument("-e", "--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("-b", "--batch-size", type=int, default=16384, help="Batch size for training")
    parser.add_argument("--lr", type=float, default=0.003, help="Learning rate")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    
    dataset_file = "data/dataset.jsonl"
    if not os.path.exists(dataset_file):
        print(f"Error: Dataset file '{dataset_file}' not found. Please run dataset generator first.")
        return
        
    # Read the dataset lines
    data_list = []
    print("Loading dataset file...")
    with open(dataset_file, "r") as f:
        for line in f:
            data_list.append(json.loads(line))
            
    print(f"Loaded {len(data_list)} raw positions.")
    
    # Initialize the Dataset
    full_dataset = ChessDataset(data_list)
    
    # Split into train/validation sets (90% train, 10% validation)
    train_size = int(0.9 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(full_dataset, [train_size, val_size])
    
    # Create DataLoaders
    batch_size = args.batch_size
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, collate_fn=collate_fn, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, collate_fn=collate_fn, num_workers=0)
    
    # Instantiate the NNUE model
    model = NNUE().to(device)
    
    # Loss function and Optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=args.lr)
    
    epochs = args.epochs
    print(f"Starting training for {epochs} epochs...")
    
    best_val_loss = float('inf')
    
    for epoch in range(epochs):
        model.train()
        train_loss = 0.0
        start_time = time.time()
        
        for active_feat, active_off, passive_feat, passive_off, target in train_loader:
            active_feat = active_feat.to(device)
            active_off = active_off.to(device)
            passive_feat = passive_feat.to(device)
            passive_off = passive_off.to(device)
            target = target.to(device)
            
            optimizer.zero_grad()
            
            # Forward pass
            outputs = model(active_feat, active_off, passive_feat, passive_off)
            loss = criterion(outputs, target)
            
            # Backward pass & Optimize
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * target.size(0)
            
        train_loss /= len(train_dataset)
        
        # Validation pass
        model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for active_feat, active_off, passive_feat, passive_off, target in val_loader:
                active_feat = active_feat.to(device)
                active_off = active_off.to(device)
                passive_feat = passive_feat.to(device)
                passive_off = passive_off.to(device)
                target = target.to(device)
                
                outputs = model(active_feat, active_off, passive_feat, passive_off)
                loss = criterion(outputs, target)
                val_loss += loss.item() * target.size(0)
                
        val_loss /= len(val_dataset)
        elapsed = time.time() - start_time
        
        print(f"Epoch {epoch+1:02d}/{epochs:02d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Time: {elapsed:.1f}s")
        
        # Save best model weights
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            model_save_path = "src/lightweight_chess_model.pth"
            torch.save(model.state_dict(), model_save_path)
            print(f"  Model saved to {model_save_path}")
            
            # Export to NumPy format for PyTorch-free serving
            npz_save_path = "src/lightweight_chess_model.npz"
            import numpy as np
            weights_dict = {k: v.cpu().numpy() for k, v in model.state_dict().items()}
            np.savez_compressed(npz_save_path, **weights_dict)
            print(f"  Exported NumPy weights to {npz_save_path}")
            
    print("Training finished.")


if __name__ == "__main__":
    train()
