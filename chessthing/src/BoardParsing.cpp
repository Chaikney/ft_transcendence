/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BoardParsing.cpp                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@42urduliz.com>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/24 22:16:52 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/06/12 12:53:28 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Board.hpp"

std::string Board::getfen() const {
	std::string res = "";
	int count;
	int cur;

	for (int i = 7; i >= 0; i--) {
		count = 0;
		for (int j = 0; j < 8; j++) {
			cur = this->board[i][j].getPiece();
			if (cur) {
				if (count) {
					res.push_back('0' + count);
					count = 0;
				}
				res.push_back(cur > 0? toupper(this->letters[cur]): this->letters[-cur]);
			}
			else {count++;}
		}
		if (count) {res.push_back('0' + count);}
		if (i) {res.push_back('/');}
	}

	res.push_back(' ');

	if (this->turn == 1)
		res.push_back('w');
	else
		res.push_back('b');

	res.push_back(' ');

	if (!(this->bkc || this->bqc || this->wkc || this->wqc))
		res.push_back('-');
	
	if (this->wkc) {res.push_back('K');}
	if (this->wqc) {res.push_back('Q');}
	if (this->bkc) {res.push_back('k');}
	if (this->bqc) {res.push_back('q');}

	res.push_back(' ');

	if (this->enPassant == getCoords(NO, NO))
		res.push_back('-'); 
	else {
		res.push_back(this->enPassant.file + 'a');
		res.push_back(this->enPassant.rank == 3? '3': '6');
	}
	res.push_back(' ');

	res += std::to_string(this->moveRule);
	res.push_back(' ');
	res += std::to_string(this->fullMoves);
	return (res);
}

void Board::castlingfRightsHandler(const std::string& rights) {
	this->wkc = false;
	this->wqc = false;
	this->bkc = false;
	this->bqc = false;

	if (!std::is_sorted(rights.begin(), rights.end()))
		throw("Castling rights must come in order, all optional: KQkq");

	if (rights.size() == 1 && rights[0] == '-')
		return ;

	for (char right: rights) {
		switch (right)
		{
			case 'K':
				this->wkc = true;
				if (this->board[0][4].getPiece() != KING || this->board[0][7].getPiece() != ROOK)
					throw (FenError("Incompatible White kingside castling right"));
				break;
			
			case 'Q':
				this->wqc = true;
				if (this->board[0][4].getPiece() != KING || this->board[0][0].getPiece() != ROOK)
					throw (FenError("Incompatible White queenside castling right"));
				break;
			
			case 'k':
				this->bkc = true;
				if (this->board[7][4].getPiece() != -KING || this->board[7][7].getPiece() != -ROOK)
					throw (FenError("Incompatible Black kingside castling right"));
				break;
			
			case 'q':
				this->bkc = true;
				if (this->board[7][4].getPiece() != -KING || this->board[7][0].getPiece() != -ROOK)
					throw (FenError("Incompatible Black queenside castling right"));
				this->bqc = true;
				break;

		default:
			throw(FenError("Incorrect castling right"));
		}
	}
}

static bool is_number(const std::string& s)
{
    std::string::const_iterator it = s.begin();
    while (it != s.end() && std::isdigit(*it)) ++it;
    return !s.empty() && it == s.end();
}

void Board::fromFen(const std::string& fen) {
	this->status = CONTINUE;
	this->matTrack = std::map<int, int>();
	
	for (int i = -KING; i <= KING; i++)
		this->matTrack.insert({i, 0});
	
	this->matTrack.at(NONE) = 69;

	std::vector<std::string> sections;
    std::istringstream f(fen);
    std::string s;    
    while (getline(f, s, ' ')) {
        sections.push_back(s);
    }

	if (sections.size() != 6)
		throw(FenError("Incorrect amount of sections for given FEN position format"));
	if (std::count(sections[0].begin(), sections[0].end(), '/') != 7) {
		throw(FenError("Incorrect amount of lines for given FEN position format"));
	}

	std::vector<std::string> lines;
	std::istringstream f1(sections[0]);
    while (getline(f1, s, '/')) {
        lines.push_back(s);
    }

	if (lines.size() != 8)
		throw(FenError("Incorrect amount of lines in given FEN representation, a chessboard has 8 ranks"));
		
	int file;
	int rank = 7;
	bool wk = false;
	bool bk = false;
	for (std::string& line: lines) {
		file = 0;
		for (char c: line) {
			if (!this->isValidFENchar(c))
				throw (FenError("Invalid character in given FEN representation"));
			if (file > 7)
				throw (FenError("Line too long in given FEN representation, a chessboard has 8 files"));
			if (isdigit(c)) {
				for (int i = 0; i < c - '0'; i++) {
					if (file > 7)
						throw (FenError("Line too long in given FEN representation, a chessboard has 8 files"));
					this->board[rank][file] = Piece(0, 0, rank, file);
					file++;
				}
			} else {
				this->board[rank][file] = Piece(this->charToInt(c), rank, file);
				this->matTrack.at(this->charToInt(c)) += 1;

				if (c == 'k') {
					if (bk) {
						throw(FenError("Multiple black kings"));
					}
					bk = true;
				}
				if (c == 'K') {
					if (wk) {
						throw(FenError("Multiple white kings"));
					}
					wk = true;
				}
				if ((c == 'p' || c == 'P') && (rank == 0 || rank == 7))
					throw(FenError("Pawn on first or last rank"));
				file++;
			}
		}
		rank--;
		if (file != 8)
			throw(FenError("Line too short in given FEN representation, a chessboard has 8 files"));

	}

	if (!wk || !bk) {throw(FenError("Missing a king"));}

	if (sections[1].size() != 1 || (sections[1][0] != 'b' && sections[1][0] != 'w'))
		throw (FenError("Incorrect current turn, use 'w' for white and 'b' for black"));

	this->turn = sections[1][0] == 'w' ? 1: -1;

	if (sections[2].size() > 4 || sections[2].size() == 0)
		throw (FenError("Incorrect castling rights representation"));
	
	this->castlingfRightsHandler(sections[2]);

	if (sections[3].size() > 2 || sections[3].size() == 0)
		throw (FenError("Incorrect en-passant-able pawn representation"));

	if (sections[3].size() == 1) {
		if (sections[3][0] != '-')
			throw (FenError("Incorrect no en-passant-able pawns flag, use '-'"));
		this->enPassant = getCoords(NO, NO);
	} else {
		if (sections[3][0] > 'h' || sections[3][0] < 'a' || (sections[3][1] != '3' && sections[3][1] != '6'))
			throw (FenError("Incorrect en-passant-able pawn representation"));
		this->makePassable(getCoords(sections[3][1] == '3'? 3: 4, sections[3][0] - 'a'));
	}
	
	if (sections[4].size() > 3 || sections[4].size() == 0)
		throw (FenError("Incorrect half-moves amount for 50 move rule")); 

	try {
		this->moveRule = std::stoi(sections[4]);
		if (this->moveRule < 0)
			throw (FenError("Incorrect half-moves amount for 50 move rule, it must be positive"));
	} catch (std::exception& e) {
		throw (FenError("Non-numeric half-moves amount for 50 move rule"));
	}
	
	if (!is_number(sections[5]))
		throw (FenError("Non-numeric full-moves amount")); 

	try {
		this->fullMoves = std::stoi(sections[5]);
		if (this->fullMoves <= 0)
			throw (FenError("Incorrect full-moves amount"));
	} catch (std::exception& e) {
		this->fullMoves = 100; //if too many moves, simply set the counter to 100
	}

	if (this->isCheck(-this->turn))
		throw(FenError("Bad FEN, cannot be someone's turn if the other player is in check"));
}

std::ostream& operator<<(std::ostream& os, const Board& chess) {
	std::vector<std::vector<int>> board = chess.getBoard();
	char c;

	for (int i = 7; i >= 0; i--) {
		os << (char)('1' + i) << "   ";
		for (int j = 0; j < 8; j++) {
			c = chess.letters[abs(board[i][j])];
			os << (char)((board[i][j] > 0)? toupper(c): c) << " ";
		}
		os << std::endl;
	}
	os << std::endl;
	os << "    a b c d e f g h\n\n";
	os << chess.getfen() << "\n\nPOSSIBLE MOVES\n---------------------------\n";
	for (int i = 0; i < 8; i++) {
		for (int j = 0; j < 8; j++) {
			if (chess.board[i][j].getCol() == chess.getTurn()) {
				os << chess.board[i][j] << "\n";
			}
		}
	}

	os << chess.getStatus();
	return (os);
}

std::ostream& operator<<(std::ostream& os, const coords& coord) {
	os << (char)(coord.file + 'a') << (char)(coord.rank + '1');
	return (os);
}

bool Board::isValidFENchar(int c) const {
	if (isdigit(c)) {
		return (c != '0');
	}
	
	int cc = tolower(c);

	for (int i = 1; i < 8; i++) {
		if (cc == this->letters[i])
			return (true);
	}

	return (false);
}

int Board::charToInt(int c) const{
	if (!this->isValidFENchar(c) || isdigit(c))
		return (0);
	int sign = islower(c) ? -1: 1;
	c = tolower(c);

	switch (c) {
		case 'p': {return (sign * PAWN);}
		case 'r': {return (sign * ROOK);}
		case 'n': {return (sign * KNIGHT);}
		case 'k': {return (sign * KING);}
		case 'q': {return (sign * QUEEN);}
		case 'b': {return (sign * BISHOP);}
		default: {return (NONE);}
	}
}

void Board::fromPgn(const std::string& pgn) {
	std::vector<std::string> turns;
    std::istringstream iss(pgn);
    std::string token;
    while (iss >> token) {
        turns.push_back(token);
    }

	this->fromFen(START_POSITION);
	this->updateLegalMoves();

	for (auto turn: turns) {
		if (turn.find('.') != std::string::npos) {
			turn = turn.substr(turn.find('.') + 1);
			if (turn.empty())
				continue;
		}
		if (turn == "0-1") {
			this->status = BLACK;
			return;
		}
		if (turn == "1-0") {
			this->status = WHITE;
			return;
		}
		if (turn == "1/2-1/2") {
			this->status = DRAW;
			return;
		}
		this->play_move(turn);
	}
}