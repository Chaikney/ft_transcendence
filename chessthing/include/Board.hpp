/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Board.hpp                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@42urduliz.com>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/19 15:39:18 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/06/12 12:39:51 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef BOARD_HPP
#define BOARD_HPP

#include "SANParser.hpp"

class Board {
	protected:
		bool wkc; //these 4 are a flag for each sides castling rights, could make a single char storing each of these in one
		bool wqc;
		bool bkc;
		bool bqc;
		int turn;
		int moveRule; //if 100 half moves have been made without a pawn being pushed or a piece being taken, the game ends in a draw
		int fullMoves;
		std::map<pos, int> drawTracker; //will keep track of positions that happened, positions will be hashed as 8 size_ts wrapped in struct position
		std::map<int, int> matTrack;
		int status;
		coords	enPassant;

		void fromFen(const std::string& fen);
		void fromPgn(const std::string& pgn);
		pos makePos() const;
		void castlingfRightsHandler(const std::string& rights);
		void makePassable(const coords);
		void place(coords from, coords to);
		bool specialMove(coords from, move to);
		bool insufficientMaterial();

	public:
		Board();
		~Board();
		Board(const Board& other);
		Board(const std::string& s, int type);

		Board newGame(std::string fen);
		
		Board& operator=(const Board& other);

		std::string getfen() const;

		std::vector<std::vector<int>> getBoard() const;
		Piece board[8][8];
		bool getwkc() const;
		bool getwqc() const;
		bool getbkc() const;
		bool getbqc() const;
		void setwkc(bool right);
		void setwqc(bool right);
		void setbkc(bool right);
		void setbqc(bool right);
		int getTurn() const;
		int getStatus() const;
		int getMoveRule() const;
		int getFullMoves() const;
		bool isValidFENchar(int c) const;
		int	charToInt(int c) const;
		bool isCheck(int col);
		bool isAtacked(int col, coords c);
		int updateLegalMoves();
		coords getEnPassant() const;
		void setEnPassant(coords c);
		bool onBoard(int rank, int file);
		int play_move(coords from, move to);
		int play_move(std::string san);
		int play_move(coords from, coords destiny);

		const char letters[9];

		class FenError: public std::exception {
			const char* msg;
			public:
				const char* what() const throw();
				FenError(const char* msg);
		};

		class AlgError: public std::exception {
			const char* msg;
			public:
				const char* what() const throw();
				AlgError(const char* msg);
		};

		class UnknownStringRepresentationError: public std::exception {
			public:
				const char* what() const throw();
				UnknownStringRepresentationError();
		};

		class MoveError: public std::exception {
			const char* msg;
			public:
				const char* what() const throw();
				MoveError(const char* msg);
		};
};

coords getCoords(int rank, int file);
std::ostream& operator<<(std::ostream& os, const Board& chess);
std::ostream& operator<<(std::ostream& os, const coords& coord);
std::ostream& operator<<(std::ostream& os, const Piece& piece);
std::ostream& operator<<(std::ostream& os, const move& m);
std::ostream& operator<<(std::ostream& os, const fmove& m);

bool operator==(const coords& a, const coords& b);
bool operator==(const move& a, const move& b);

#endif