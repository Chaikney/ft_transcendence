# chess_types.rb

START_POSITION = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
FEN = 0
PGN = 1
NO = -1

module PieceType
  NONE = 0
  PAWN = 1
  QUEEN = 2
  ROOK = 3
  BISHOP = 4
  KNIGHT = 5
  KING = 6
end

module GameStatus
  BLACK = -1
  CONTINUE = 0
  WHITE = 1
  DRAW = 2
end

module MoveType
  MOVE = 0
  CAPTURE = 1
  Q = 2
  R = 3
  B = 4
  N = 5
  CAPTURE_Q = 6
  CAPTURE_R = 7
  CAPTURE_B = 8
  CAPTURE_N = 9
  CASTLE = 10
  ENPASSANT = 11
end

# Los Structs de C++ se convierten en Structs nativos de Ruby
Coords = Struct.new(:rank, :file)
Move = Struct.new(:to, :t)           # 'to' será un Coords, 't' un MoveType
FullMove = Struct.new(:to, :t, :from)

# Nota: El struct 'position' (con el uint32_t) lo adaptaremos cuando 
# toquemos el Board, ya que Ruby maneja los arrays gigantes de otra forma.