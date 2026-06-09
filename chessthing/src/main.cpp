#include "Board.hpp"

int main() {
		Board chess = Board("1.e4 e5 2.Nf3 d6 3.d4 exd4 4.Qxd4 Be6 5.Nc3 a6 6.Be3 Nc6 7.Qd2 Be7 8.Bd3 Nf6 9.h3 Ne5 10.Nxe5 dxe5 11.O-O O-O 12.f4 exf4 13.Rxf4 Nd7 14.Qe2 Bg5 15.Rff1 Bxe3+ 16.Qxe3 f6 17.Rad1 Qe7 18.Rf2 Rae8 19.a3 Ne5 20.Ne2 Kh8 21.Nd4 Bc8 22.g4 Bxg4 23.hxg4 Nxg4 24.Qg3 Nxf2 25.Qxf2 g6 26.Re1 c5 27.Nf3 b5 28.c3 c4 29.Bb1 Qc7 30.Nd4 Re5 31.Re3 Qd6 32.Bc2 Rfe8 33.Nf3 R5e7 34.Qh4 Qb6 35.Kf2 Rg7 36.Ke2 Qd6 37.Nd4 Re5 38.Qf4 Rd5 39.Rf3 Qxf4 40.Rxf4 Rd6 41.Kf3 Rb7 42.Rg4 a5 43.b4 cxb3 44.Bxb3 b4 45.Bd5 Rb8 46.axb4 axb4 47.cxb4 Rxb4 48.Nc2 Ra4 49.Ne3 Ra3 50.Kf4 g5+ 51.Kf3 h6 52.Rg1 Kh7 53.Rh1 Rd8 54.Be6 Rd2 55.Rc1 h5 56.e5 g4+ 57.Ke4 Re2 58.Bf5+ Kh6 59.exf6 Rexe3+ 60.Kd4 Rf3 61.Rc5 Ra4+ 62.Ke5 Raf4 63.Ke6 g3 64.f7 Kg7  0-1", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.exd5 Qxd5 5.Nf3 Nf6 6.Bd3 Ne4 7.Bd2 Bxc3 8.bxc3 Nxd2 9.Qxd2 O-O 10.O-O f5 11.Ne5 c6 12.f4 Nd7 13.Bc4 Qd6 14.Rae1 Nf6 15.Bb3 Rd8 16.Qd3 g6 17.g4 Kf8 18.gxf5 gxf5 19.Qh3 b5 20.Qh6+  1-0", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1.e4 e5 2.Nf3 Nc6 3.d4 exd4 4.Nxd4 Bc5 5.Be3 Qf6 6.c3 Nh6 7.Be2 O-O 8.O-O Ne5 9.f4 Ng6 10.e5 Qh4 11.Nd2 d6 12.N2f3 Qe7 13.Qd2 Ng4 14.h3 dxe5 15.hxg4 exd4 16.Nxd4 Re8 17.Bf2 Bxd4 18.Qxd4 Qxe2 19.Rae1 Qb5 20.f5 Nf8 21.Rxe8 Qxe8 22.Re1 Qd7 23.Qb4 Qc6 24.Re7 b5 25.Qb3 Ne6 26.fxe6 Bxe6 27.Qb4 Rd8 28.Qf4 Rd1+ 29.Kh2 a6 30.Bd4 h6 31.Rxc7 Qd5 32.Rc5 Qxa2 33.g5 Qb1 34.gxh6 Rh1+ 35.Kg3 Rxh6 36.Rg5 Rg6 37.Rxg6 Qxg6+ 38.Kf2 Qf5 39.Qxf5 Bxf5  1/2-1/2", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1.e4 e5 2.Nf3 Nc6 3.Bb5 a6 4.Ba4 Nf6 5.d4 exd4 6.e5 Ne4 7.O-O Be7 8.Nxd4 Nxd4 9.Qxd4 Nc5 10.Bb3 Nxb3 11.axb3 O-O 12.Bf4 f6 13.Qc4+ Kh8 14.exf6 Bxf6 15.Bxc7 Qe8 16.Bd6 Rf7 17.Nc3 b6 18.Rae1 Qg8 19.Qe4  1-0", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 bxc6 7.Nxe5 Be7 8.f4 O-O 9.f5 f6 10.Ng6 Re8 11.Qh5 Bf8 12.Nc3 Ba6 13.Rf3 Re1+ 14.Kf2 Qe8 15.Rh3 Rf1+ 16.Kg3 Nxf5+ 17.Kg4 Qxg6+ 18.Qxg6 hxg6 19.b3 Bd6 20.Ne4 Be2+  0-1", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1.e4 e6 2.d4 d5 3.Nc3 Bb4 4.Bd3 c5 5.Nf3 dxe4 6.Bxe4 Nf6 7.Bd3 Nd5 8.Bd2 Nc6 9.dxc5 Nxc3 10.Bxc3 Bxc3+ 11.bxc3 Qa5 12.O-O Qxc5 13.Rb1 Qxc3 14.Ng5 g6 15.Ne4 Qd4 16.c3 Qd8 17.Qd2 O-O 18.Qh6 Qe7 19.f4 f6 20.Rfe1 Nd8 21.Nf2 Qg7 22.Qh4 Bd7 23.Re3 Rc8 24.Rg3 f5 25.c4 e5 26.fxe5 Qxe5 27.h3 Rc7 28.Rf1 Ne6 29.Kh1 Bc6 30.Bb1 Qf4 31.Qxf4 Nxf4 32.Nd1 Rd7 33.Kh2 Nh5 34.Rd3 Rfd8 35.Nb2 Rd4 36.Rfd1 Rxd3 37.Rxd3 Re8 38.Rd2 Nf4 39.g3 Ne2 40.Nd1 f4 41.gxf4 Nxf4 42.Kg3 Nh5+ 43.Kg4 Kg7 44.h4 Re1 45.Bc2 Rg1+ 46.Kh3 Nf4+ 47.Kh2 Rg4 48.Ne3 Rxh4+ 49.Kg3 Rh3+ 50.Kxf4 Rf3+ 51.Ke5 Rxe3+ 52.Kd6 h5 53.c5 h4 54.Bb3 Re8 55.Kc7 h3 56.Rd7+ Bxd7 57.Kxd7 h2 58.Bd5 Re1 59.Bxb7 h1=Q 60.Bxh1 Rxh1  0-1", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1.d4 e6 2.c4 f5 3.e3 Nf6 4.Nc3 Be7 5.Bd3 O-O 6.Nf3 b6 7.a3 Bb7 8.b3 Qe8 9.O-O Qh5 10.Ne1 Ng4 11.h3 Bd6 12.Nf3 Nf6 13.Ne5 Qg5 14.e4 f4 15.Nf3 Qh6 16.e5 Be7 17.exf6 gxf6 18.Be4 Nc6 19.d5 Nd8 20.dxe6 Bxe4 21.Nxe4 f5 22.Nc3 dxe6 23.Bb2 Nf7 24.Qe2 Nd6 25.Rae1  1-0", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1. e4 e6 2. d4 d5 3. Nc3 Nf6 4. Bg5 dxe4 5. Nxe4 Be7 6. Bxf6 gxf6 7. g3 f5 8. Nc3 Bf6 9. Nge2 Nc6 10. d5 exd5 11. Nxd5 Bxb2 12. Bg2 O-O 13. O-O Bh8 14. Nef4 Ne5 15. Qh5 Ng6 16. Rad1 c6 17. Ne3 Qf6 18. Kh1 Bg7 19. Bh3 Ne7 20. Rd3 Be6 21. Rfd1 Bh6 22. Rd4 Bxf4 23. Rxf4 Rad8 24. Rxd8 Rxd8 25. Bxf5 Nxf5 26. Nxf5 Rd5 27. g4 Bxf5 28. gxf5 h6 29. h3 Kh7 30. Qe2 Qe5 31. Qh5 Qf6 32. Qe2 Re5 33. Qd3 Rd5 34. Qe2", PGN);
		std::cout << chess << "\n\n";

		chess = Board("1. d4 Nf6 2. c4 e6 3. Nf3 d5 4. Bg5 dxc4 5. Qa4+ c6 6. Qxc4 b5 7. Qc2 Bb7 8. e3 Nbd7 9. Be2 a6 10. O-O Be7 11. Nbd2 c5 12. dxc5 Bxc5 13. Rac1 Rc8 14. Qb1 O-O 15. b4 Be7 16. Rxc8 Qxc8 17. Rc1 Qa8 18. a3 h6 19. Bh4 Rc8 20. Ne1 Bf8 21. f3 Nd5 22. Bf2 Ne5 23. Rxc8 Qxc8 24. Ne4 f5 25. Nc5 Nc3 26. Qb2 Nxe2+ 27. Qxe2 Bxc5 28. bxc5 Qxc5 29. e4 Qc4 30. Qd2 fxe4 31. Qd6 Nd3 32. Qb8+ Qc8 33. Qxc8+ Bxc8 34. fxe4 Nb2 35. Bc5 Kf7 36. Kf2 Bb7 37. e5 Kg6 38. g3 Kf5 39. Bf8 Nc4 40. Nc2 Be4 41. Nd4+ Kxe5 42. Bxg7+ Kd5 43. Ne2 Kc6 44. Bf8 a5 45. g4 e5 46. h4 Bg6 47. Kf3 Nd2+ 48. Ke3 Nc4+ 49. Kf3 b4 50. axb4 a4 51. Nc3 a3 52. b5+ Kb6 53. g5 hxg5 54. hxg5 Bb1 55. Kg4 a2 56. Nxa2 Bxa2 57. g6 Ne3+ 58. Kf3 Nc4 59. Ke4 Kxb5 60. g7 Bb1+ 61. Kd5 Bh7 62. Be7 Bg8+ 63. Ke4 Kc6 64. Bb4 Bh7+ 65. Kf3 Kd5 66. Bc3 Nd6 67. Kg4 Ke6 68. Be1 Kf7 69. Bc3 Nc4 70. Kg5 Kxg7 71. Bxe5+ Nxe5 72. Kf4 Kf6 73. Ke3 Kf5 74. Kd4 Bg8 75. Ke3 Nc6 76. Kf3 Bd5+ 77. Ke3 Be4 78. Ke2 Kf4 79. Kd2 Ne5 80. Kc3 Ke3 81. Kb4 Kd4 82. Kb5 Nd3 83. Kb6 Kc4 84. Kc7 Nc5 85. Kd6 Kd4 86. Ke7 Ke5 87. Kf7 Bd5+ 88. Kg6 Ne6 89. Kh5 Kf6 90. Kh6 Be4 91. Kh5 Kf5 92. Kh4 Kf4 93. Kh5 Bd3 94. Kh6 Bc2 95. Kh5 Kf5 96. Kh6 Bd3 97. Kh5 Ng7+ 98. Kh6 Ne6 99. Kh5 Kf6 100. Kh6 Nc5 101. Kh5 Nd7 102. Kg4 Ne5+ 103. Kf4 Bg6 104. Ke3 Kf5 105. Kd4 Bf7 106. Kc5 Ke4 107. Kd6 Kd4 108. Ke7 Bc4 109. Kd6 Bb3 110. Ke7 Kd5 111. Kf6 Kd6 112. Kf5 Bc2+ 113. Kf4 Ng6+ 114. Kg5 Ke6 115. Kg4 Ke5 116. Kf3 Kd4 117. Kg4 Ke4 118. Kg5 Ke5 119. Kg4 Be4 120. Kg5 Ne7 121. Kg4 Nd5 122. Kg5 Nf6 123. Kh6 Kf5 124. Kg7 Kg5 125. Kf7 Bf5 126. Ke7 Ne4 127. Kf7 Kf4 128. Kg7 Ke5 129. Kh6 Kf6 130. Kh5 Ng3+ 131. Kh4 Ne2 132. Kh5 Be6 133. Kh4 Kf5 134. Kh5 Bg8 135. Kh6 Kf6 136. Kh5 Nd4 137. Kg4 Ke5 138. Kg5 Bf7 139. Kg4 Ne6 140. Kf3 Kd4 141. Kg4 Ke4 142. Kh4 Kf4 143. Kh3 Bh5 144. Kg2 Bf3+ 145. Kf2 Nc5 146. Ke1 Ne4 147. Kf1 Ke3 148. Kg1 Bg4 149. Kf1 Bh5 150. Kg2 Bg4 151. Kf1 Nc5 152. Kg2 Kf4 153. Kf2 Nd3+ 154. Kf1 Kf3 155. Kg1 Bh3 1/2-1/2", PGN);
		std::cout << chess << "\n\n";

}
