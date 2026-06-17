# Explanation: How the NNUE Chess Engine Works

This document explains the concepts, design decisions, and mechanics of the Efficiently Updatable Neural Network (NNUE) evaluation function, the Minimax search algorithm, and the training pipeline.

---

## 1. What is an NNUE?

In traditional chess engines (like older versions of Stockfish), positions are evaluated using hand-crafted heuristic formulas. These formulas add up points for material (e.g., Pawn = 100, Knight = 320) and apply positional bonuses using **Piece-Square Tables (PSTs)** (e.g., Knights get a bonus for being in the center, Kings get a bonus for being in safety in the corners).

An **NNUE (Efficiently Updatable Neural Network)** replaces these hand-crafted evaluation formulas with a shallow neural network.
* **Neural Network:** It learns chess positional patterns directly from millions of evaluated chess positions.
* **Efficiently Updatable:** During a search tree analysis, the engine makes and unmakes moves one after another. Because a chess move typically only moves one piece (and occasionally captures another), the board state changes very little from one position to the next. The NNUE design allows us to incrementally add/subtract only the weights of the moving pieces rather than recalculating the entire neural network evaluation from scratch. This makes it incredibly fast on a standard CPU.

---

## 2. Feature Representation: `halfKP`

To evaluate a board, we must convert the positions of the chess pieces into numbers that a neural network can process. We use a feature representation called **`halfKP`** (Half-King-Piece).

For each side (White and Black), we define a list of active features:
1. **The Active King's Square:** There are 64 possible squares for the King (from `a1` to `h8`).
2. **Other Pieces:** For each other piece on the board, we track its **Type and Color** (10 possibilities: White/Black Pawns, Knights, Bishops, Rooks, and Queens; Kings are excluded since their squares act as the baseline index) and its **Square** (64 possibilities).

For a given active King square $K$ (index 0 to 63), a piece of type $P$ (index 0 to 9) on square $S$ (index 0 to 63) maps to a unique feature index:
$$\text{Feature Index} = K \times 640 + P \times 64 + S$$

Since $K \in [0, 63]$ and $(P \times 64 + S) \in [0, 639]$, the total number of unique features is:
$$64 \times 640 = 40,960\text{ features}$$

### Color Symmetry & Flipped Perspectives
To make the evaluation consistent and double the learning efficiency of the network, we evaluate the board from two perspectives:
* **White's Perspective (Active King is White's King):**
  * White's King square is used directly.
  * White pieces are mapped to types 0–4 (Pawn, Knight, Bishop, Rook, Queen), and Black pieces to types 5–9.
  * Pieces are mapped to their raw squares.
* **Black's Perspective (Active King is Black's King):**
  * We flip the board vertically (`square ^ 56`) so that Black's first rank looks like White's first rank.
  * Black's King square is flipped and used as the active King square.
  * We swap colors: Black pieces are mapped to types 0–4 (active), and White pieces to types 5–9 (passive).
  * Piece squares are also flipped vertically.

Using this symmetry, a single set of neural network weights evaluates the board from both perspectives.

---

## 3. Network Architecture

The NNUE architecture is deliberately shallow and simple to ensure it executes in microseconds:

```
[Active Features Index List] -----> EmbeddingBag (Sum) ----> [256-dim Accumulator] ---\
                                                                                       ==> Concat (512-dim) ==> Linear (512 -> 1) ==> Evaluation Score
[Passive Features Index List] ----> EmbeddingBag (Sum) ----> [256-dim Accumulator] ---/
```

### A. The Accumulator Layer (Embedding Layer)
The input layer consists of $40,960$ features mapped to a $256$-dimensional vector space.
* For White's perspective, we sum the $256$-dimensional weight vectors for all active features. This creates White's accumulator ($A_W$, size 256).
* For Black's perspective, we do the same using Black's features. This creates Black's accumulator ($A_B$, size 256).
* During training, we use PyTorch's `nn.EmbeddingBag(40960, 256, mode='sum')` to perform this lookup and sum efficiently.

### B. Activation Layer (Clipped ReLU)
We apply a **Clipped ReLU** activation function to both accumulators:
$$\text{CReLU}(x) = \min(\max(x, 0.0), 1.0)$$
This clamps all values in the accumulators between 0 and 1, introducing non-linearity (allowing the network to learn combinations of pieces rather than just summing them up).

### C. Output Layer
If it is the **active player's** turn to move:
* We concatenate the active accumulator and passive accumulator into a single $512$-dimensional vector.
* We feed this vector into a standard Linear layer `Linear(512, 1)` to get the final evaluation score.
* The output score is relative to the side to move (a positive score means a good position for the player whose turn it is).

---

## 4. Search Tree and Pruning

To find the best chess move, the engine uses **Minimax search with Alpha-Beta pruning** in a **Negamax** formulation:

1. **Negamax Formulation:** Since the NNUE evaluation is always relative to the player to move, we can write the minimax search such that each recursive call returns the negative of the opponent's best score: `score = -search(depth - 1, -beta, -alpha)`. This simplifies the code significantly.
2. **Alpha-Beta Pruning:** If a branch of the search tree cannot possibly be better than a move we have already searched, we discard it ("prune" it) early.
3. **Move Ordering (Crucial):** Alpha-Beta pruning works best when we search the best moves first. We order moves before searching them:
   * **Captures:** Sorted using **MVV-LVA** (Most Valuable Victim - Least Valuable Aggressor). For example, capturing a Queen with a Pawn is searched before capturing a Pawn with a Queen.
   * **Promotions:** Promoting a pawn to a Queen is searched first.
   * **Checks:** Moves that put the opponent in check are given high priority.
4. **Transposition Table:** Chess has many transpositions (different sequences of moves leading to the same position). We save previously evaluated positions in a hash table (using Zobrist hashing). If we encounter the same position at the same or deeper depth, we reuse the result instantly, avoiding redundant search.
5. **Iterative Deepening & Time Management:** The engine searches to depth 1, then depth 2, then depth 3, and so on. If the elapsed search time exceeds the time limit (e.g., 300ms), it aborts the search and returns the best move found from the last fully completed depth.

---

## 5. Training Pipeline

How does the network learn to evaluate chess positions?

1. **Dataset Generation:**
   * A Python script plays games against itself.
   * At each move, we select a legal move (often a mixture of random exploration and tactical moves to keep the positions diverse and realistic).
   * For each position encountered, we run a short depth-2 minimax search using a classical heuristic evaluator (piece values + piece-square tables) to calculate an evaluation score.
   * We collect $500,000$ positions and their search evaluations.
2. **Model Training:**
   * We feed the positions and their evaluations into the PyTorch NNUE model.
   * The model uses the Adam optimizer to minimize the **Mean Squared Error (MSE)** between the network's predictions and the search evaluations.
   * Once trained, the model learns to output evaluations similar to a depth-2 search, but instantly (at depth 0).
3. **Serving:**
   * When we search to depth 4 using this trained model as our evaluator, the engine's strength becomes much higher than the original training target!
