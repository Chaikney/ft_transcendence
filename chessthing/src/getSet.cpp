/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   getSet.cpp                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@42urduliz.com>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/25 13:14:09 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/05/23 17:02:07 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "Board.hpp"

std::vector<std::vector<int>> Board::getBoard() const {
	std::vector<std::vector<int>> a = std::vector<std::vector<int>>();
	for (int i = 0; i < 8; i++) {
		a.push_back(std::vector<int>());
		for (Piece c: this->board[i]) {
			a[i].push_back(c.getPiece());
		}
	}

	return(a);
}

bool Board::getwkc() const {return this->wkc;}
bool Board::getwqc() const {return this->wqc;}
bool Board::getbkc() const {return this->bkc;}
bool Board::getbqc() const {return this->bkc;}
int Board::getTurn() const {return this->turn;}
int Board::getStatus() const {return this->status;}
int Board::getMoveRule() const {return this->moveRule;}
int Board::getFullMoves() const {return this->fullMoves;}

bool operator==(const coords& a, const coords& b)
{
	return a.file == b.file && a.rank == b.rank;
}

bool operator==(const move& a, const move& b) {
	return (a.t == b.t && a.to == b.to);
}

coords Board::getEnPassant() const {
	return this->enPassant;
}

void Board::setEnPassant(coords c) {
	this->enPassant = c;
}

void Board::setwkc(bool right) {
	this->wkc = right;
}
void Board::setwqc(bool right) {
	this->wqc = right;
}
void Board::setbkc(bool right) {
	this->bkc = right;
}
void Board::setbqc(bool right) {
	this->bqc = right;
}

int Piece::getFile() const {
	return (this->file);
}
void Piece::setFile(int file) {
	if (0 <= file && file <= 7)
		this->file = file;
}
int Piece::getRank() const {
	return (this->rank);
}
void Piece::setRank(int rank) {
	if (0 <= rank && rank <= 7)
		this->rank = rank;
}
