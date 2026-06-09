/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SANParser.cpp                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@student.42urduliz.com>  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/02 19:04:40 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/06/02 19:04:40 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Board.hpp"

static bool isFile(char c)
{
    return c >= 'a' && c <= 'h';
}

/* static bool isRank(char c)
{
    return c >= '1' && c <= '8';
} */

static int fileToInt(char c)
{
    return c - 'a';
}

static int rankToInt(char c)
{
    return c - '1';
}

static int pieceFromChar(char c)
{
    switch(c)
    {
        case 'K': return KING;
        case 'Q': return QUEEN;
        case 'R': return ROOK;
        case 'B': return BISHOP;
        case 'N': return KNIGHT;
        default:  return PAWN;
    }
}

SANParser::SANParser(std::string& san) {
	this->capture = false;
    this->kc = false;
    this->qc = false;
    this->promotion = false;
    this->check = false;
    this->mate = false;
    this->neededFile = NO;
    this->neededRank = NO;
    this->file = NO;
    this->rank = NO;
    this->promotedPiece = NONE;
    parse(san);
}

void SANParser::parse(std::string& san) {
	size_t i = 0;
	std::string copy = san;

	if (san.empty())
		throw (SANError(san, "empty move"));

	if (copy.back() == '+') {
		this->check = true;
		copy.pop_back();
	}
	else if (copy.back() == '#') {
		this->mate = true;
		copy.pop_back();
	}

	if (copy == "O-O") {
        this->kc = true;
        return;
    }

    if (copy == "O-O-O") {
        this->qc = true;
        return;
    }

	if (std::isupper(copy[i])) {
        this->type = pieceFromChar(copy[i]);
        i++;
    }
    else {this->type = PAWN;}
	
	auto eq = copy.find('=');
    if (eq != std::string::npos) {
        this->promotion = true;
		if (eq != copy.size() - 2) 
			throw (SANError(san, "bad promotion"));
        this->promotedPiece = pieceFromChar(copy[eq + 1]);
        copy.pop_back();
		copy.pop_back();
    }

	auto x = copy.find('x');
    if (x != std::string::npos) {
		this->capture = true;
	}
	
	if (copy.size() < 2)
		throw (SANError(san, "bad coordinate"));
	this->rank = rankToInt(copy[copy.size()-1]);
    this->file = fileToInt(copy[copy.size()-2]);
	if (this->rank < 0 || this->rank > 7)
    	throw SANError(san, "Bad rank destination");
	if (this->file < 0 || this->file > 7)
    	throw SANError(san, "Bad file destination");

	std::string prefix = copy.substr(i, copy.size() - i - 2);

    prefix.erase(std::remove(prefix.begin(), prefix.end(), 'x'), prefix.end());
	
	if (this->type == PAWN) {
        if (this->capture && !prefix.empty())
            this->neededFile = fileToInt(prefix[0]);
    }
    else {
        if (prefix.size() == 1) {
            if (isFile(prefix[0]))
                this->neededFile = fileToInt(prefix[0]);
            else
                this->neededRank = rankToInt(prefix[0]);
        }
        else if (prefix.size() == 2) {
            this->neededFile = fileToInt(prefix[0]);
            this->neededRank = rankToInt(prefix[1]);
        }
    }
	if ((this->neededRank != NO) && (this->neededRank < 0 || this->neededRank > 7))
    	throw SANError(san, "Bad rank disambiguity");
	if ((this->neededFile != NO) && (this->neededFile < 0 || this->neededFile > 7))
    	throw SANError(san, "Bad file disambiguity");
}

SANParser::SANError::SANError(std::string& san, const std::string& msg): san(san), msg(msg){}

const char* SANParser::SANError::what() const throw() {
	std::string m = this->san;
	m.push_back(':');
	m += this->msg;
	return (m.c_str());
}

fmove SANParser::getMove(std::string& san, Board& board) const {
	fmove m;
	move temp;

	if (this->kc || this->qc) {
		m.t = CASTLE;
		m.to.rank = board.getTurn() == WHITE? 0: 7;
		m.to.file = this->kc? 6: 2;
		m.from.rank = board.getTurn() == WHITE? 0: 7;;
		m.from.file = 4;
		return m;
	}
	m.t = MOVE;

	m.to.rank = this->rank;
	m.to.file = this->file;

	bool found = false;

	if (this->promotion) {
		m.t = (moveType)this->promotedPiece;
		if (this->capture)
			m.t = (moveType)(4 + this->promotedPiece);
	} else if (this->capture)
		m.t = CAPTURE;
	
	if (this->type == PAWN) {
		m.from.rank = m.to.rank - board.getTurn();
		
		if (this->neededFile != NO)
			m.from.file = this->neededFile;
		else 
			m.from.file = m.to.file;
		if (m.t == CAPTURE && m.to.rank == (board.getTurn() == WHITE? 5: 2) && board.board[m.to.rank - board.getTurn()][m.to.file].getPiece() == -board.getTurn() * PAWN && board.board[m.to.rank][m.to.file].getPiece() == 0)
			m.t = ENPASSANT;
		
		if (this->promotion)
			m.t = (moveType)((4 * (m.t == CAPTURE)) + this->promotedPiece);
		
		if (m.to.rank == (board.getTurn() == WHITE? 3: 4) && m.t == MOVE && board.board[m.to.rank - board.getTurn()][m.to.file].getPiece() == 0 && board.board[m.to.rank - 2 * board.getTurn()][m.to.file].getPiece() == PAWN * board.getTurn())
			m.from.rank = m.to.rank - 2 * board.getTurn();
	} 

	else {
		temp.to.rank = this->rank;
		temp.to.file = this->file;
		temp.t = m.t;

		for (int i = 0; i < 8; i++) {
			for (int j = 0; j < 8; j++) {
				if ((this->neededFile == NO || this->neededFile == j) && (this->neededRank == NO || this->neededRank == i) && board.board[i][j].getPiece() == board.getTurn() * this->type) {
					if (board.board[i][j].isLegal(temp.to)) {
						if (found)
							throw (SANError(san, "Multiple match found"));
						found = true;
						m.from.file = j;
						m.from.rank = i;
					}
				}
			}
		}
	}

	return m;
}