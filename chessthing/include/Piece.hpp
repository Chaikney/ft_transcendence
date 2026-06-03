/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Piece.hpp                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@42urduliz.com>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/29 19:13:16 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/05/23 18:57:19 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef PIECE_HPP
#define PIECE_HPP

#include <string>
#include <map>
#include <unordered_map>
#include <vector>
#include <exception>
#include <sstream>
#include <iostream>
#include <algorithm>
#include <cstdint>

#define START_POSITION "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0"
#define FEN 0
#define ALG 1
#define NO -1

enum type {
	NONE,
	PAWN,
	QUEEN,
	ROOK,
	BISHOP,
	KNIGHT,
	KING,
};

enum status {
	BLACK = -1,
	CONTINUE,
	WHITE,
	DRAW
};

typedef enum moveType {
	MOVE,
	CAPTURE,
	Q,
	R,
	B,
	N,
	CAPTURE_Q,
	CAPTURE_R,
	CAPTURE_B,
	CAPTURE_N,
	CASTLE,
	ENPASSANT,
} moveType;

typedef struct position {
	uint32_t board[9];
	uint32_t extra;

	bool operator<(const position& other) const {
        for (int i = 0; i < 9; i++) {
			if (board[i] != other.board[i])
				return (board[i] < other.board[i]);
		}
		return extra < other.extra;
    }

	bool operator>(const position& other) const {
        for (int i = 0; i < 9; i++) {
			if (board[i] != other.board[i])
				return (board[i] > other.board[i]);
		}
		return extra > other.extra;
    }

	bool operator==(const position& other) const {
        for (int i = 0; i < 9; i++) {
			if (board[i] != other.board[i])
				return (false);
		}
		return extra == other.extra;
    }
}	pos;

typedef struct coordinates {
	int rank;
	int file;
}	coords;

typedef struct move {
	coords to;
	moveType t;
} move;

typedef struct fullmove {
	coords to;
	moveType t;
	coords from;
} fmove;

class Board;

class Piece {
	protected:
		int type;
		int col;
		int rank;
		int file;

		int	calculateLegalNoneMoves(Board& board);
		int	calculateLegalPawnMoves(Board& board);
		int	calculateLegalBishopMoves(Board& board);
		int	calculateLegalKnightMoves(Board& board);
		int calculateLegalRookMoves(Board& board);
		int	calculateLegalQueenMoves(Board& board);
		int	calculateLegalKingMoves(Board& board);

		typedef int (Piece::*MoveFunc)(Board&);
		const MoveFunc moves[8];
		std::vector<move> legalMoves;

		void addMove(int rank, int file, moveType type);
		
	public:
		Piece();
		~Piece();
		Piece(const Piece& other);
		Piece(int type, int col, int rank, int file);
		Piece(int piece, int rank, int file);

		Piece& operator=(const Piece& other);

		int	calculateLegalMoves(Board& board);
		const std::vector<move>& getLegalMoves() const;

		void emptyMoves();
		
		bool isLegal(coords coord);
		bool isMoveLegal(move m);

		int getType() const;
		void setType(int type);
		int getCol() const;
		void setCol(int col);
		int getPiece() const;
		void setPiece(int piece);
		int getFile() const;
		void setFile(int piece);
		int getRank() const;
		void setRank(int piece);
		char getletter() const;
		char getletter(int type, int col) const;
};

#endif