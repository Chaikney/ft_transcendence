/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Board.cpp                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@42urduliz.com>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/19 16:06:23 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/06/12 12:50:32 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Board.hpp"

Board::Board(): letters("_pqrbnkp") {
	this->fromFen(START_POSITION);
}

Board::~Board() {}

Board::Board(const Board& other): letters("_pqrbnkp") {
	*this = other;
}

Board::Board(const std::string& s, int type): letters("_pqrbnkp") {
	switch (type) {
		case PGN: {
			this->fromPgn(s);
			break;
		}
		case FEN: {
			this->fromFen(s);
			break;
		}
		default: {throw (UnknownStringRepresentationError());}
	};
}

Board Board::newGame(std::string fen) {
	Board b(fen, FEN);
	int flag = b.updateLegalMoves();
	b.status = flag;

	pos start = this->makePos();
	this->drawTracker.insert({start, 1});
	return b;
}

Board& Board::operator=(const Board& other) {
	this->bkc = other.bkc;
	this->bqc = other.bqc;
	this->wkc = other.wkc;
	this->wqc = other.wqc;
	this->moveRule = other.moveRule;
	this->fullMoves = other.fullMoves;
	this->matTrack = other.matTrack;
	this->drawTracker = other.drawTracker;
	this->status = other.status;
	this->turn = other.turn;

	for (int i = 0; i < 8; i++){
		for (int j = 0; j < 8; j++)
			this->board[i][j].fullCopy(other.board[i][j]);
	}

	return (*this);
}

coords getCoords(int rank, int file) {
	coords p;

	p.rank = rank;
	p.file = file;
	return p;
}

pos Board::makePos() const {
	pos p;

	for (int i = 0; i < 8; i++) {
		p.board[i] = 0;
		for (int j = 0; j < 8; j++) {
			p.board[i] <<= 4;
			p.board[i] += this->board[i][j].getType();
			p.board[8] <<= 1;
			p.board[8] += this->board[i][j].getCol() == WHITE;
		}
	}
	p.extra = ((((((((this->turn == WHITE) << 1) + this->bkc) << 1) + this->bqc) << 1) + this->wkc) << 1) + this->wqc;
	p.extra = (((p.extra << 4) + (enPassant.rank == NO? 0: enPassant.rank)) << 4) + (enPassant.file == NO? 0: enPassant.file);
	return p;
}

Board::AlgError::AlgError(const char* msg): msg(msg) {}
Board::FenError::FenError(const char* msg): msg(msg) {}
Board::MoveError::MoveError(const char* msg): msg(msg) {}
Board::UnknownStringRepresentationError::UnknownStringRepresentationError() {}

const char* Board::AlgError::what() const throw() {return this->msg;}
const char* Board::FenError::what() const throw() {return this->msg;}
const char* Board::MoveError::what() const throw() {return this->msg;}
const char* Board::UnknownStringRepresentationError::what() const throw() {return "Unknown game string representation type";}

bool Board::isCheck(int col) {
	for (int i = 0; i < 8; i++) {
		for (int j = 0; j < 8; j++) {
			if (this->board[i][j].getType() == KING && this->board[i][j].getCol() == col)
				return (this->isAtacked(col, getCoords(i, j)));
		}
	}
	return (false);
} 

int Board::updateLegalMoves() {
	int count = 0;
	
	for (int i = 0; i < 8; i++) {
		for (int j = 0; j < 8; j++) {
			if (this->board[i][j].getCol() == this->turn) {
				count += this->board[i][j].calculateLegalMoves(*this);
			}
		}
	}
	if (count)
		return (CONTINUE);
	if (this->isCheck(this->turn)) {
		this->status = -this->turn;
		return (-this->turn);
	}
	this->status = DRAW;
	return (DRAW);
}

void Board::makePassable(const coords c) {
	if (this->board[c.rank][c.file].getType() == PAWN) {
		if ((c.rank == 4 && this->board[c.rank][c.file].getCol() == WHITE) || (c.rank == 3 && this->board[c.rank][c.file].getCol() == BLACK))
			throw(FenError("wrong colour pawn to make passable in given rank"));
		if (this->board[c.rank == 3? 2: 5][c.file].getType() || this->board[c.rank == 3? 1: 6][c.file].getType())
			throw(FenError("En-Passant-able Pawn could have never gotten to given coordinates, there are pieces in the way"));
		this->enPassant = c;
	}
	else {
		throw(FenError("not a pawn in given passable pawn coordinate"));
	}
}

void Board::place(coords from, coords to) {
	this->board[to.rank][to.file].setPiece(this->board[from.rank][from.file].getPiece());
	this->board[from.rank][from.file].setPiece(0);
}

bool Board::isAtacked(int col, coords c) {
	int r = c.rank;
	int f = c.file;
	int nr[] = {1, 1, -1, -1, 2, -2, 2, -2};
	int nf[] = {2, -2, 2, -2, 1, 1, -1, -1};
	int pf[] = {1, -1};

	//king threat
	for (int i = -1; i < 2; i++) {
		for (int j = -1; j < 2; j++) {
			if (this->onBoard(r + i, f + j) && this->board[r + i][f + j].getPiece() == -col * KING) {
				return (true);
			}
		}
	}

	//knight threat
	for (int i = 0; i < 8; i++) {
		if (this->onBoard(r + nr[i], f + nf[i]) && this->board[r + nr[i]][f + nf[i]].getPiece() == -col * KNIGHT)
			return (true);
	}

	//pawn threat
	for (int i = 0; i < 2; i++) {
		if (this->onBoard(r + col, f  + pf[i]) && this->board[r + col][f + pf[i]].getPiece() == -col * PAWN)
			return (true);
	}

	//rook and queen orthogonal threats
	for (int i = 1; this->onBoard(r + i, f); i++) {
		if (!this->board[r + i][f].getType())
			continue;
		if (this->board[r + i][f].getPiece() == -col * ROOK || this->board[r + i][f].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	for (int i = -1; this->onBoard(r + i, f); i--) {
		if (!this->board[r + i][f].getType())
			continue;
		if (this->board[r + i][f].getPiece() == -col * ROOK || this->board[r + i][f].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	for (int i = 1; this->onBoard(r, f + i); i++) {
		if (!this->board[r][f + i].getType())
			continue;
		if (this->board[r][f + i].getPiece() == -col * ROOK || this->board[r][f + i].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	for (int i = -1; this->onBoard(r, f + i); i--) {
		if (!this->board[r][f + i].getType())
			continue;
		if (this->board[r][f + i].getPiece() == -col * ROOK || this->board[r][f + i].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	//bishops and queen diagonal threats
	for (int i = 1; this->onBoard(r + i, f + i); i++) {
		if (!this->board[r + i][f + i].getType())
			continue;
		if (this->board[r + i][f + i].getPiece() == -col * BISHOP || this->board[r + i][f + i].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	for (int i = 1; this->onBoard(r + i, f - i); i++) {
		if (!this->board[r + i][f - i].getType())
			continue;
		if (this->board[r + i][f - i].getPiece() == -col * BISHOP || this->board[r + i][f - i].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	for (int i = 1; this->onBoard(r - i, f + i); i++) {
		if (!this->board[r - i][f + i].getType())
			continue;
		if (this->board[r - i][f + i].getPiece() == -col * BISHOP || this->board[r - i][f + i].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	for (int i = 1; this->onBoard(r - i, f - i); i++) {
		if (!this->board[r - i][f - i].getType())
			continue;
		if (this->board[r - i][f - i].getPiece() == -col * BISHOP || this->board[r - i][f - i].getPiece() == -col * QUEEN)
			return (true);
		break;
	}

	return (false);
}

int Board::play_move(coords from, move to) {
	int capturedType;

	if (this->status)
		throw (MoveError("attempted to make a move on a finished game"));
	if (!onBoard(from.rank, from.file))
		throw (MoveError("Square outside of the board"));

	Piece& p = this->board[from.rank][from.file];

	if (p.getCol() != this->turn)
		throw (MoveError("Square empty or colour of piece attempted to move of the wrong colour"));
	
	bool found = false;
	for (auto it: p.getLegalMoves()) {
		if (it == to)
			found = true;
	}
	if (!found) {
		throw(MoveError("Attempted to make an illegal move"));
	}

	if (to.t == CAPTURE || (to.t >= CAPTURE_Q  && to.t <= CAPTURE_N)) {
		capturedType = this->board[to.to.rank][to.to.file].getPiece();
		this->matTrack.at(capturedType) -= 1;
	}


	if (to.t == ENPASSANT)
		this->matTrack.at(PAWN * (-this->turn)) -= 1;

	for (int i = 0; i < 8; i++) {
		for (int j = 0; j < 8; j++)
			this->board[i][j].emptyMoves();
	}
	
	if (!this->specialMove(from, to)) {
		this->place(from, to.to);
		this->enPassant = getCoords(NO, NO);
	}

	pos cur = this->makePos();
	if (this->drawTracker.find(cur) != this->drawTracker.end())
	{
		this->drawTracker[cur] += 1;
		if (this->drawTracker.at(cur) == 3) {
			this->status = DRAW;
			this->updateLegalMoves();
			return (DRAW);
		}
	} else{
		this->drawTracker.insert({cur, 1});
	}

	this->moveRule += 1;
	if ((to.t != MOVE && to.t != CASTLE) || p.getType() == PAWN)
		this->moveRule = 0;
	if (this->turn == BLACK)
		this->fullMoves += 1;
	if (this->moveRule == 99) {
		int a = this->updateLegalMoves();
		if (abs(a) != 1)
			a = DRAW;
		this->status = a;
		return (a);
	}
	this->turn = -this->turn;

	if (from == getCoords(0, 4)) {
		this->wkc = false;
		this->wqc = false;
	}
	else if (from == getCoords(7, 4)) {
		this->bkc = false;
		this->bqc = false;
	}
	else if (from == getCoords(0, 0) || to.to == getCoords(0, 0))
		this->wqc = false;
	else if (from == getCoords(0, 7) || to.to == getCoords(0, 7))
		this->wkc = false;
	else if (from == getCoords(7, 0) || to.to == getCoords(7, 0))
		this->bqc = false;
	else if (from == getCoords(7, 7) || to.to == getCoords(7, 7))
		this->bkc = false;

	int flag = this->updateLegalMoves();
	this->status = flag;
	if (this->insufficientMaterial())
		this->status = DRAW;
	return (this->status);
}

bool Board::specialMove(coords from, move to) {
	int piece;
	coords rook;

	if (this->board[from.rank][from.file].getType() == PAWN && abs(from.rank - to.to.rank) == 2) {
		this->enPassant = to.to;
		this->place(from, to.to);
	}
	else if (to.t == MOVE || to.t == CAPTURE)
		return false;
	else if (to.t <= CAPTURE_N) {
		piece = (to.t - 2) % 4;
		this->board[to.to.rank][to.to.file].setPiece(this->turn * (piece + 2));
		this->board[from.rank][from.file].setPiece(0);
		this->enPassant = getCoords(NO, NO);
	}
	else if (to.t == ENPASSANT) {
		this->place(from, to.to);
		this->board[from.rank][to.to.file].setPiece(0);
		this->enPassant = getCoords(NO, NO);
	}
	else {
		this->place(from, to.to);
		rook = getCoords(from.rank, to.to.file == 6? 7: 0);
		this->place(rook, getCoords(rook.rank, rook.file == 7? 5: 2));
		this->enPassant = getCoords(NO, NO);
		if (this->turn == WHITE) {
			this->wkc = false;
			this->wqc = false;
		} else {
			this->bkc = false;
			this->bqc = false;
		}
	}
	return true;
}

int Board::play_move(std::string san) {
	SANParser p(san);
	fmove m = p.getMove(san, *this);
	move mm = {m.to, m.t};
	return (this->play_move(m.from, mm));
}

std::ostream& operator<<(std::ostream& os, const move& m) {
	os << "to " << m.to << "; type: " << m.t;
	return (os);
}

std::ostream& operator<<(std::ostream& os, const fmove& m) {
	os << "from: " << m.from << "; to: " << m.to << "; type: " << m.t;
	return os;
}

int Board::play_move(coords from, coords destiny) {
	Piece& p = this->board[from.rank][from.file];
	if (p.getCol() != this->turn)
		throw (MoveError("Attempted to move a piece of the wrong colour"));
	for (auto it: p.getLegalMoves()) {
		if (it.to == destiny)
			return (this->play_move(from, it));
	}
	throw(MoveError("Attempted to play an illegal move"));
}

bool Board::insufficientMaterial() {
	for (int i = -ROOK; i <= ROOK; i++) {
		if (this->matTrack.at(i))
			return (false);
	}

	int w = this->matTrack.at(KNIGHT) + this->matTrack.at(BISHOP);
	int b = this->matTrack.at(-KNIGHT) + this->matTrack.at(-BISHOP);

	if (w >= 3 || b >= 3)
		return (false);
	
	if ((w == 2 && this->matTrack.at(KNIGHT) != 2) || (b == 2 && this->matTrack.at(-KNIGHT) != 2))
		return (false);
	
	return (true);
}