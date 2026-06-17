import numpy as np

try:
    import torch
    import torch.nn as nn
except ImportError:  # pragma: no cover - optional training dependency
    torch = None
    nn = None

if nn is not None:
    class NNUE(nn.Module):
        """
        Efficiently Updatable Neural Network (NNUE) implemented in PyTorch.
        Used for training.
        
        Structure:
        - EmbeddingBag: Maps 40,960 sparse features to 256-dimensional accumulators.
        - Accumulator Bias: Learnable bias vector of size 256.
        - Clipped ReLU: Clamps accumulator values to [0, 1].
        - Output layer: Takes concatenation of active and passive accumulators (512 inputs) 
          and outputs a single evaluation score.
        """
        def __init__(self, feature_dim=40960, accumulator_dim=256):
            super().__init__()
            # Large embedding matrix containing weights for each of the 40,960 features.
            # mode='sum' automatically sums up the weights of all active features on the board.
            self.embedding = nn.EmbeddingBag(feature_dim, accumulator_dim, mode='sum')
            
            # Learnable bias added to the accumulated features
            self.accumulator_bias = nn.Parameter(torch.zeros(accumulator_dim))
            
            # Output fully connected layer: maps (active_crelu + passive_crelu) -> evaluation
            self.fc = nn.Linear(accumulator_dim * 2, 1)

        def forward(self, active_features, active_offsets, passive_features, passive_offsets):
            # Accumulate (sum) weights for all active and passive features
            a_active = self.embedding(active_features, active_offsets) + self.accumulator_bias
            a_passive = self.embedding(passive_features, passive_offsets) + self.accumulator_bias
            
            # Clipped ReLU activation: clamp values between 0.0 and 1.0
            a_active_crelu = torch.clamp(a_active, min=0.0, max=1.0)
            a_passive_crelu = torch.clamp(a_passive, min=0.0, max=1.0)
            
            # Concatenate active and passive perspectives
            x = torch.cat([a_active_crelu, a_passive_crelu], dim=1)
            
            # Map to final output evaluation
            return self.fc(x)
else:
    class NNUE:
        def __init__(self, *args, **kwargs):
            raise ImportError("PyTorch is required for NNUE training, but it is optional for serving NumPyNNUE.")


class NumPyNNUE:
    """
    Optimized NumPy-only implementation of the NNUE evaluation function.
    Loads PyTorch weights and evaluates positions in microseconds on the CPU,
    completely bypassing PyTorch's frame overhead during search.
    """
    def __init__(self, state_dict):
        # Helper to convert PyTorch tensors or NumPy arrays to NumPy arrays
        def to_numpy(v):
            if hasattr(v, 'cpu'):
                return v.cpu().numpy()
            return v

        self.emb_weights = to_numpy(state_dict['embedding.weight'])
        self.accumulator_bias = to_numpy(state_dict['accumulator_bias'])
        
        fc_w = to_numpy(state_dict['fc.weight'])
        self.fc_weight = fc_w.flatten()
        
        fc_bias_val = to_numpy(state_dict['fc.bias'])
        self.fc_bias = float(fc_bias_val.item() if hasattr(fc_bias_val, 'item') else fc_bias_val)

    def evaluate(self, active_features: list[int], passive_features: list[int]) -> float:
        """
        Runs the forward pass using NumPy.
        - active_features: List of feature indices for the player to move.
        - passive_features: List of feature indices for the opponent.
        Returns the score in centipawns (positive = side to move is better).
        """
        # Sum weights of active features and add bias
        if len(active_features) > 0:
            a_active = np.sum(self.emb_weights[active_features], axis=0) + self.accumulator_bias
        else:
            a_active = self.accumulator_bias.copy()
            
        # Sum weights of passive features and add bias
        if len(passive_features) > 0:
            a_passive = np.sum(self.emb_weights[passive_features], axis=0) + self.accumulator_bias
        else:
            a_passive = self.accumulator_bias.copy()
            
        # Clipped ReLU: clamp between 0.0 and 1.0
        a_active_crelu = np.clip(a_active, 0.0, 1.0)
        a_passive_crelu = np.clip(a_passive, 0.0, 1.0)
        
        # Concatenate accumulators
        x = np.concatenate([a_active_crelu, a_passive_crelu])
        
        # Compute dot product and add final bias
        val = np.dot(self.fc_weight, x) + self.fc_bias
        return float(val)
