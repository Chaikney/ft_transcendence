/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SANParser.hpp                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: gcassi-d <gcassi-d@student.42urduliz.com>  +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/06/02 12:40:08 by gcassi-d          #+#    #+#             */
/*   Updated: 2026/06/02 12:40:08 by gcassi-d         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef SANParser_HPP
#define SANParser_HPP

#include "Piece.hpp"

class SANParser {
	void parse(std::string& san);

	public:
		SANParser(std::string& san);

		int type;

		bool capture;
		bool kc;
		bool qc;

		int file;
    	int rank;

		int neededRank;
		int neededFile;

		bool promotion;
		int  promotedPiece;

		bool check;
		bool mate;

		fmove getMove(std::string& san, Board& board) const;

		class SANError: public std::exception {
			std::string& san;
			const std::string& msg;
			public:
				const char* what() const throw();
				SANError(std::string& san, const std::string& msg);
		};	
};

#endif