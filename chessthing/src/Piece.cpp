/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Piece.cpp                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@42urduliz.com>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 19:34:08 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/05/23 17:24:19 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Piece.hpp"
#include "Board.hpp"

bool Board::onBoard(int rank, int file) {
	return(0 <= rank && 7 >= rank && 0 <= file && 7 >= file);
}

Piece::Piece(): type(0), col(0), moves{
	&Piece::calculateLegalNoneMoves,
    &Piece::calculateLegalPawnMoves,
	&Piece::calculateLegalQueenMoves,
	&Piece::calculateLegalRookMoves,
    &Piece::calculateLegalBishopMoves,
    &Piece::calculateLegalKnightMoves,
	&Piece::calculateLegalKingMoves,
} {
	this->legalMoves = std::vector<move>();
}

Piece::~Piece() {}

Piece::Piece(const Piece& other): moves{
	&Piece::calculateLegalNoneMoves,
    &Piece::calculateLegalPawnMoves,
	&Piece::calculateLegalQueenMoves,
	&Piece::calculateLegalRookMoves,
    &Piece::calculateLegalBishopMoves,
    &Piece::calculateLegalKnightMoves,
	&Piece::calculateLegalKingMoves,
} {
	*this = other;
}

Piece::Piece(int type, int col, int rank, int file): type(type), col(col), rank(rank), file(file), moves{
	&Piece::calculateLegalNoneMoves,
    &Piece::calculateLegalPawnMoves,
	&Piece::calculateLegalQueenMoves,
	&Piece::calculateLegalRookMoves,
    &Piece::calculateLegalBishopMoves,
    &Piece::calculateLegalKnightMoves,
	&Piece::calculateLegalKingMoves,
} {
	this->legalMoves = std::vector<move>();
}

Piece::Piece(int piece, int rank, int file): type(abs(piece)), col(piece < 0? -1: piece? 1: 0), rank(rank), file(file), moves{
	&Piece::calculateLegalNoneMoves,
    &Piece::calculateLegalPawnMoves,
	&Piece::calculateLegalQueenMoves,
	&Piece::calculateLegalRookMoves,
    &Piece::calculateLegalBishopMoves,
    &Piece::calculateLegalKnightMoves,
	&Piece::calculateLegalKingMoves,
} {
	this->legalMoves = std::vector<move>();
}

Piece& Piece::operator=(const Piece& other) {
	this->col = other.col;
	this->type = other.type;
	this->legalMoves = std::vector<move>();
	this->rank = other.rank;
	this->file = other.file;
	return (*this);
}

void Piece::fullCopy(const Piece& other) {
	this->col = other.col;
	this->type = other.type;
	this->legalMoves = other.legalMoves;
	this->rank = other.rank;
	this->file = other.file;
}

const std::vector<move>& Piece::getLegalMoves() const {
	return (this->legalMoves);
}

int	Piece::calculateLegalNoneMoves(Board& board) {
	(void)board;
	return (0);
}

void Piece::emptyMoves() {
	this->legalMoves.clear();
}

int	Piece::calculateLegalPawnMoves(Board& board) {
	int count = 0;
	Board copy(board);
	int fi[2] = {1, -1};

	for (int i = 0; i < 8; i++) {
		for (int j = 0; j < 8; j++) {
			if (copy.board[i][j].type == 0 && copy.board[i][j].col != 0)
				std::cout << i << " " << j << " issue" << "\n";
		}
	}
	
	if (this->col == WHITE) {
		if (!board.board[this->rank + 1][this->file].getType()) {
			copy = board;
			copy.board[this->rank + 1][this->file] = *this;
			copy.board[this->rank][this->file] = Piece();
			if (!copy.isCheck(this->col)) {
				if (this->rank == 6) {
					count += 4;
					this->addMove(7, this->file, Q);
					this->addMove(7, this->file, R);
					this->addMove(7, this->file, B);
					this->addMove(7, this->file, N);
				}
				else  {
					count++;
					this->addMove(this->rank + 1, this->file, MOVE);
				}
			}
			if (this->rank == 1 && !board.board[this->rank + 2][this->file].getType()) {
				copy = board;
				copy.board[this->rank + 2][this->file] = *this;
				copy.board[this->rank][this->file] = Piece();
				if (!copy.isCheck(this->col)) {
					count++;
					this->addMove(this->rank + 2, this->file, MOVE);
				}
			}
		}

		for (int i = 0; i < 2; i++) {
			if (board.onBoard(this->rank + 1, this->file + fi[i]) && board.board[this->rank + 1][this->file + fi[i]].getCol() == -this->col) {
				copy = board;
				copy.board[this->rank + 1][this->file + fi[i]] = *this;
				copy.board[this->rank][this->file] = Piece();
				if (this->rank == 6) {
					count += 4;
					this->addMove(7, this->file + fi[i], CAPTURE_Q);
					this->addMove(7, this->file + fi[i], CAPTURE_R);
					this->addMove(7, this->file + fi[i], CAPTURE_N);
					this->addMove(7, this->file + fi[i], CAPTURE_B);
				}
				else  {
					count++;
					this->addMove(this->rank + 1, this->file + fi[i], CAPTURE);
				}
			}
		}

		if (board.getEnPassant().rank == 4 && this->rank == 4 && abs(board.getEnPassant().file - this->file) == 1) {
			copy = board;
			copy.board[5][board.getEnPassant().file] = *this;
			copy.board[4][board.getEnPassant().file] = Piece();
			copy.board[4][this->file] = Piece();
			if (!copy.isCheck(this->col)) {
				count++;
				this->addMove(this->rank + 1, board.getEnPassant().file, ENPASSANT);
			}
		}
	}
	else {
		if (!board.board[this->rank - 1][this->file].getType()) {
			copy = board;
			copy.board[this->rank - 1][this->file] = *this;
			copy.board[this->rank][this->file] = Piece();
			if (!copy.isCheck(this->col)) {
				if (this->rank == 1) {
					count += 4;
					this->addMove(0, this->file, Q);
					this->addMove(0, this->file, R);
					this->addMove(0, this->file, B);
					this->addMove(0, this->file, N);
				}
				else  {
					count++;
					this->addMove(this->rank - 1, this->file, MOVE);
				}
			}
			if (this->rank == 6 && !board.board[this->rank - 2][this->file].getType()) {
				copy = board;
				copy.board[this->rank - 2][this->file] = *this;
				copy.board[this->rank][this->file] = Piece();
				if (!copy.isCheck(this->col)) {
					count++;
					this->addMove(this->rank - 2, this->file, MOVE);
				}
			}
		}

		for (int i = 0; i < 2; i++) {
			if (board.onBoard(this->rank - 1, this->file + fi[i]) && board.board[this->rank - 1][this->file + fi[i]].getCol() == -this->col) {
				copy = board;
				copy.board[this->rank - 1][this->file + fi[i]] = *this;
				copy.board[this->rank][this->file] = Piece();
				if (!copy.isCheck(this->col)) {
					if (this->rank == 1) {
						count += 4;
						this->addMove(0, this->file + fi[i], CAPTURE_Q);
						this->addMove(0, this->file + fi[i], CAPTURE_R);
						this->addMove(0, this->file + fi[i], CAPTURE_N);
						this->addMove(0, this->file + fi[i], CAPTURE_B);
					}
					else  {
						count++;
						this->addMove(this->rank - 1, this->file + fi[i], CAPTURE);
					}
				}
			}
		}

		if (board.getEnPassant().rank == 3 && this->rank == 3 && abs(board.getEnPassant().file - this->file) == 1) {
			copy = board;
			copy.board[2][board.getEnPassant().file] = *this;
			copy.board[3][board.getEnPassant().file] = Piece();
			copy.board[3][this->file] = Piece();
			if (!copy.isCheck(this->col)) {
				count++;
				this->addMove(this->rank - 1, board.getEnPassant().file, ENPASSANT);
			}
		}
	}
	return (count);
}

int	Piece::calculateLegalBishopMoves(Board& board) {
	int count = 0;
	Board copy(board);

	for (int i = 1; board.onBoard(this->rank + i, this->file + i) && board.board[this->rank + i][this->file + i].col != this->col; i++) {
		copy = board;
		copy.board[this->rank + i][this->file + i] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[this->rank + i][this->file + i].col) {
				this->addMove(this->rank + i, this->file + i, CAPTURE);
				count++;
				break;
			}
			this->addMove(this->rank + i, this->file + i, MOVE);
			count++;
		}
	}
	for (int i = 1; board.onBoard(this->rank + i, this->file - i) && board.board[this->rank + i][this->file - i].col != this->col; i++) {
		copy = board;
		copy.board[this->rank + i][this->file - i] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[this->rank + i][this->file - i].col) {
				this->addMove(this->rank + i, this->file - i, CAPTURE);
				count++;
				break;
			}
			this->addMove(this->rank + i, this->file - i, MOVE);
			count++;
		}
	}
	for (int i = 1; board.onBoard(this->rank - i, this->file + i) && board.board[this->rank - i][this->file + i].col != this->col; i++) {
		copy = board;
		copy.board[this->rank - i][this->file + i] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[this->rank - i][this->file + i].col) {
				this->addMove(this->rank - i, this->file + i, CAPTURE);
				count++;
				break;
			}
			this->addMove(this->rank - i, this->file + i, MOVE);
			count++;
		}
	}
	for (int i = 1; board.onBoard(this->rank - i, this->file - i) && board.board[this->rank - i][this->file - i].col != this->col; i++) {
		copy = board;
		copy.board[this->rank - i][this->file - i] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[this->rank - i][this->file - i].col) {
				this->addMove(this->rank - i, this->file - i, CAPTURE);
				count++;
				break;
			}
			this->addMove(this->rank - i, this->file - i, MOVE);
			count++;
		}
	}
	return (count);
}

int	Piece::calculateLegalKnightMoves(Board& board) {
	int count = 0;
	Board copy(board);
	int ra[] = {1, 1, -1, -1, 2, -2, 2, -2};
	int fa[] = {2, -2, 2, -2, 1, 1, -1, -1};
	int r;
	int f;

	for (int i = 0; i < 8; i++) {
		r = ra[i] + this->rank;
		f = fa[i] + this->file;
		if (board.onBoard(r, f)) {
			copy = board;
			copy.board[r][f] = *this;
			copy.board[this->rank][this->file] = Piece();
			if (board.board[r][f].col != this->col && !copy.isCheck(this->col)) {
				if (board.board[r][f].col)
					this->addMove(r, f, CAPTURE);
				else 
					this->addMove(r, f, MOVE);
				count++;
			}
		}
	}

	return (count);
}

int Piece::calculateLegalRookMoves(Board& board) {
	int count = 0;
	Board copy(board);

	for (int i = this->rank + 1; board.onBoard(i, this->file) && board.board[i][this->file].col != this->col; i++) {
		copy = board;
		copy.board[i][this->file] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[i][this->file].col) {
				this->addMove(i, this->file, CAPTURE);
				count++;
				break;
			}
			this->addMove(i, this->file, MOVE);
			count++;
		}
	}
	for (int i = this->rank - 1; board.onBoard(i, this->file) && board.board[i][this->file].col != this->col; i--) {
		copy = board;
		copy.board[i][this->file] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[i][this->file].col) {
				this->addMove(i, this->file, CAPTURE);
				count++;
				break;
			}
			this->addMove(i, this->file, MOVE);
			count++;
		}
	}
	for (int i = this->file + 1; board.onBoard(this->rank, i) && board.board[this->rank][i].col != this->col; i++) {
		copy = board;
		copy.board[this->rank][i] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[this->rank][i].col) {
				this->addMove(this->rank, i, CAPTURE);
				count++;
				break;
			}
			this->addMove(this->rank, i, MOVE);
			count++;
		}
	}
	for (int i = this->file - 1; board.onBoard(this->rank, i) && board.board[this->rank][i].col != this->col; i--) {
		copy = board;
		copy.board[this->rank][i] = *this;
		copy.board[this->rank][this->file] = Piece();
		if (!copy.isCheck(this->col)) {
			if (board.board[this->rank][i].col) {
				this->addMove(this->rank, i, CAPTURE);
				count++;
				break;
			}
			this->addMove(this->rank, i, MOVE);
			count++;
		}
	}
	return (count);
}

int	Piece::calculateLegalQueenMoves(Board& board) {
	return (this->calculateLegalBishopMoves(board) + this->calculateLegalRookMoves(board));
}

int	Piece::calculateLegalKingMoves(Board& board) {
	int count = 0;
	Board copy(board);
	int r, f;

	for (int i = -1; i < 2; i++) {
		for (int j = -1; j < 2; j++) {
			r = this->rank + i;
			f = this->file + j;
			if ((!i && !j) || !board.onBoard(r, f) || copy.board[r][f].col == this->col) 
				continue;
			copy = board;
			copy.board[r][f] = *this;
			copy.board[r - i][f - j] = Piece();
			if (!copy.isCheck(this->col)) {
				if (board.board[r][f].getCol()) 
					this->addMove(r, f, CAPTURE);
				else
					this->addMove(r, f, MOVE);
				count++;
			}
		}
	}

	if (this->col == WHITE && (board.getwkc() || board.getwqc())) {
		if (this->rank || this->file != 4) {
			board.setwkc(false);
			board.setwqc(false);
		}
		if (board.getwkc()) {
			if (board.board[0][7].getPiece() != ROOK) {
				board.setwkc(false);
			}
			else if (!board.board[0][5].getType() && !board.board[0][6].getType() && !board.isAtacked(this->col, getCoords(0, 4)) && !board.isAtacked(this->col, getCoords(0, 5)) && !board.isAtacked(this->col, getCoords(0, 6))) {
				this->addMove(0, 6, CASTLE);
				count++;
			}
		}
		if (board.getwqc()) {
			if (board.board[0][0].getPiece() != ROOK) {
				board.setwqc(false);
			}
			else if (!board.board[0][3].getType() && !board.board[0][2].getType() && !board.board[0][1].getType() && !board.isAtacked(this->col, getCoords(0, 4)) && !board.isAtacked(this->col, getCoords(0, 3)) && !board.isAtacked(this->col, getCoords(0, 2))) {
				this->addMove(0, 2, CASTLE);
				count++;
			}
		}
	}

	if (this->col == BLACK && (board.getbkc() || board.getbqc())) {
		if (this->rank != 7 || this->file != 4) {
			board.setbkc(false);
			board.setbqc(false);
		}
		if (board.getbkc()) {
			if (board.board[7][7].getPiece() != -ROOK) {
				board.setbkc(false);
			}
			else if (!board.board[7][5].getType() && !board.board[7][6].getType() && !board.isAtacked(this->col, getCoords(7, 4)) && !board.isAtacked(this->col, getCoords(7, 5)) && !board.isAtacked(this->col, getCoords(7, 6))) {
				this->addMove(7, 6, CASTLE);
				count++;
			}
		}
		if (board.getbqc()) {
			if (board.board[7][0].getPiece() != -ROOK) {
				board.setbqc(false);
			}
			else if (!board.board[7][3].getType() && !board.board[7][2].getType()  && !board.board[7][1].getType() && !board.isAtacked(this->col, getCoords(7, 4)) && !board.isAtacked(this->col, getCoords(7, 3)) && !board.isAtacked(this->col, getCoords(7, 2))) {
				this->addMove(7, 2, CASTLE);
				count++;
			}
		}
	}
	return (count);
}

int Piece::calculateLegalMoves(Board& board) {
	return (this->*moves[abs(this->type)])(board);
}

bool Piece::isLegal(const coords coord) {
	for (auto m: this->legalMoves) {
		if (m.to == coord)
			return (true);
	}
	return (false);
}

bool Piece::isMoveLegal(const move mm) {
	for (auto m: this->legalMoves) {
		if (m == mm)
			return (true);
	}
	return (false);
}

int Piece::getType() const {
	return (this->type);
}

void Piece::setType(int type) {
	this->type = type;
}

int Piece::getCol() const {
	return (this->col);
}

void Piece::setCol(int col) {
	this->col = col;
}

int Piece::getPiece() const {
	return (this->col * this->type);
}

void Piece::setPiece(int piece) {
	this->type = abs(piece);
	this->col = piece ? (piece > 0? WHITE: BLACK): 0;
}

void Piece::addMove(int rank, int file, moveType type) {
	move n;

	n.to = getCoords(rank, file);
	n.t = type;
	this->legalMoves.push_back(n);
}

char Piece::getletter() const {
	switch (this->type) {
		case PAWN:
			return this->col == WHITE? 'P': 'p';
		case BISHOP:
			return this->col == WHITE? 'B': 'b';
		case ROOK:
			return this->col == WHITE? 'R': 'r';
		case KNIGHT:
			return this->col == WHITE? 'N': 'n';
		case KING:
			return this->col == WHITE? 'K': 'k';
		case QUEEN:
			return this->col == WHITE? 'Q': 'q';
	}
	return '_';
}

char Piece::getletter(int type, int col) const {
	switch (type) {
		case PAWN:
			return col == WHITE? 'P': 'p';
		case BISHOP:
			return col == WHITE? 'B': 'b';
		case ROOK:
			return col == WHITE? 'R': 'r';
		case KNIGHT:
			return col == WHITE? 'N': 'n';
		case KING:
			return col == WHITE? 'K': 'k';
		case QUEEN:
			return col == WHITE? 'Q': 'q';
	}
	return '_';
}

std::ostream& operator<<(std::ostream& os, const Piece& piece) {
	os << (char)('a' + piece.getFile()) << (char)('1' + piece.getRank()) << piece.getletter() << ": ";
	for (move m: piece.getLegalMoves()) {
		if (m.t == CASTLE) {
			os << "O-O";
			if (m.to.file == 2)
				os << "-O";
			os << " ";
			continue;
		}
		os << (char)(m.to.file + 'a') << (char)(m.to.rank + '1');
		if (m.t == CAPTURE || (m.t >= CAPTURE_Q && m.t <= CAPTURE_N))
			os << "x";
		if (m.t >= Q && m.t <= CAPTURE_N) {
			os << "=";
			os << piece.getletter(2 + (m.t - 2) % 4, piece.getCol());
		}
		os << " ";
	}
	return os;
}