# piece.rb
require_relative 'chess_types'

class Piece
  attr_accessor :type, :col, :rank, :file, :legal_moves

  def initialize(type = PieceType::NONE, col = GameStatus::CONTINUE, rank = -1, file = -1)
    @type = type.abs
    @col = col
    @rank = rank
    @file = file
    @legal_moves = []
  end

  def empty_moves
    @legal_moves.clear
  end

  def full_copy(other)
    @type = other.type
    @col = other.col
    @rank = other.rank
    @file = other.file
    @legal_moves = other.legal_moves.dup
  end

  def calculate_legal_moves(board)
    case @type
    when PieceType::NONE   then 0
    when PieceType::PAWN   then calculate_legal_pawn_moves(board)
    when PieceType::KNIGHT then calculate_legal_knight_moves(board)
    when PieceType::BISHOP then calculate_legal_bishop_moves(board)
    when PieceType::ROOK   then calculate_legal_rook_moves(board)
    when PieceType::QUEEN  then calculate_legal_queen_moves(board)
    when PieceType::KING   then calculate_legal_king_moves(board)
    else 0
    end
  end

  def is_legal?(coord)
    @legal_moves.any? { |m| m.to.rank == coord.rank && m.to.file == coord.file }
  end

  def is_move_legal?(move)
    @legal_moves.any? { |m| m.to.rank == move.to.rank && m.to.file == move.to.file && m.t == move.t }
  end

  def piece_value
    @col * @type
  end

  def set_piece(val)
    @type = val.abs
    @col = val == 0 ? GameStatus::CONTINUE : (val > 0 ? GameStatus::WHITE : GameStatus::BLACK)
  end

  def get_letter(type_arg = @type, col_arg = @col)
    letter = case type_arg
             when PieceType::PAWN   then 'p'
             when PieceType::BISHOP then 'b'
             when PieceType::ROOK   then 'r'
             when PieceType::KNIGHT then 'n'
             when PieceType::KING   then 'k'
             when PieceType::QUEEN  then 'q'
             else '_'
             end
    col_arg == GameStatus::WHITE ? letter.upcase : letter
  end

  protected

  def add_move(rank, file, move_type)
    @legal_moves << Move.new(Coords.new(rank, file), move_type)
  end

  private

  def calculate_legal_pawn_moves(board)
    count = 0
    dir = @col
    start_rank = (@col == GameStatus::WHITE) ? 1 : 6
    promo_rank = (@col == GameStatus::WHITE) ? 7 : 0
    ep_rank = (@col == GameStatus::WHITE) ? 4 : 3

    if board.board[@rank + dir][@file].type == PieceType::NONE
      copy = board.deep_copy
      copy.board[@rank + dir][@file].set_piece(self.piece_value)
      copy.board[@rank][@file].set_piece(0)
      
      if !copy.is_check?(@col)
        if @rank + dir == promo_rank
          count += 4
          [MoveType::Q, MoveType::R, MoveType::B, MoveType::N].each { |t| add_move(promo_rank, @file, t) }
        else
          count += 1
          add_move(@rank + dir, @file, MoveType::MOVE)
        end
      end

      if @rank == start_rank && board.board[@rank + 2 * dir][@file].type == PieceType::NONE
        copy = board.deep_copy
        copy.board[@rank + 2 * dir][@file].set_piece(self.piece_value)
        copy.board[@rank][@file].set_piece(0)
        if !copy.is_check?(@col)
          count += 1
          add_move(@rank + 2 * dir, @file, MoveType::MOVE)
        end
      end
    end

    [-1, 1].each do |df|
      target_f = @file + df
      if board.on_board?(@rank + dir, target_f) && board.board[@rank + dir][target_f].col == -@col
        copy = board.deep_copy
        copy.board[@rank + dir][target_f].set_piece(self.piece_value)
        copy.board[@rank][@file].set_piece(0)
        
        if !copy.is_check?(@col)
          if @rank + dir == promo_rank
            count += 4
            [MoveType::CAPTURE_Q, MoveType::CAPTURE_R, MoveType::CAPTURE_N, MoveType::CAPTURE_B].each { |t| add_move(promo_rank, target_f, t) }
          else
            count += 1
            add_move(@rank + dir, target_f, MoveType::CAPTURE)
          end
        end
      end
    end

    ep = board.get_en_passant
    if ep.rank == ep_rank && @rank == ep_rank && (@file - ep.file).abs == 1
      copy = board.deep_copy
      copy.board[@rank + dir][ep.file].set_piece(self.piece_value)
      copy.board[@rank][ep.file].set_piece(0)
      copy.board[@rank][@file].set_piece(0)
      
      if !copy.is_check?(@col)
        count += 1
        add_move(@rank + dir, ep.file, MoveType::ENPASSANT)
      end
    end
    count
  end

  def calculate_legal_knight_moves(board)
    count = 0
    offsets = [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]]

    offsets.each do |dr, df|
      r, f = @rank + dr, @file + df
      next unless board.on_board?(r, f)

      target = board.board[r][f]
      next if target.col == @col

      copy = board.deep_copy
      copy.board[r][f].set_piece(self.piece_value)
      copy.board[@rank][@file].set_piece(0)

      if !copy.is_check?(@col)
        add_move(r, f, target.col != 0 ? MoveType::CAPTURE : MoveType::MOVE)
        count += 1
      end
    end
    count
  end

  def calculate_slider_moves(board, directions)
    count = 0
    directions.each do |dr, df|
      (1..7).each do |i|
        r, f = @rank + dr * i, @file + df * i
        break unless board.on_board?(r, f)

        target = board.board[r][f]
        break if target.col == @col 

        copy = board.deep_copy
        copy.board[r][f].set_piece(self.piece_value)
        copy.board[@rank][@file].set_piece(0)

        if !copy.is_check?(@col)
          if target.col != 0
            add_move(r, f, MoveType::CAPTURE)
            count += 1
            break
          else
            add_move(r, f, MoveType::MOVE)
            count += 1
          end
        else
          break if target.col != 0 
        end
      end
    end
    count
  end

  def calculate_legal_bishop_moves(board)
    calculate_slider_moves(board, [[1, 1], [1, -1], [-1, 1], [-1, -1]])
  end

  def calculate_legal_rook_moves(board)
    calculate_slider_moves(board, [[1, 0], [-1, 0], [0, 1], [0, -1]])
  end

  def calculate_legal_queen_moves(board)
    calculate_legal_bishop_moves(board) + calculate_legal_rook_moves(board)
  end

  def calculate_legal_king_moves(board)
    count = 0

    [-1, 0, 1].each do |dr|
      [-1, 0, 1].each do |df|
        next if dr == 0 && df == 0
        r, f = @rank + dr, @file + df
        next unless board.on_board?(r, f)

        target = board.board[r][f]
        next if target.col == @col

        copy = board.deep_copy
        copy.board[r][f].set_piece(self.piece_value)
        copy.board[@rank][@file].set_piece(0)

        if !copy.is_check?(@col)
          add_move(r, f, target.col != 0 ? MoveType::CAPTURE : MoveType::MOVE)
          count += 1
        end
      end
    end

    if @col == GameStatus::WHITE && (board.wkc || board.wqc)
      if @rank != 0 || @file != 4
        board.wkc, board.wqc = false, false
      end
      
      if board.wkc && board.board[0][7].piece_value == PieceType::ROOK
        if board.board[0][5].type == PieceType::NONE && board.board[0][6].type == PieceType::NONE &&
           !board.is_attacked?(@col, Coords.new(0, 4)) && !board.is_attacked?(@col, Coords.new(0, 5)) && !board.is_attacked?(@col, Coords.new(0, 6))
          add_move(0, 6, MoveType::CASTLE)
          count += 1
        end
      else
        board.wkc = false
      end

      if board.wqc && board.board[0][0].piece_value == PieceType::ROOK
        if board.board[0][3].type == PieceType::NONE && board.board[0][2].type == PieceType::NONE && board.board[0][1].type == PieceType::NONE &&
           !board.is_attacked?(@col, Coords.new(0, 4)) && !board.is_attacked?(@col, Coords.new(0, 3)) && !board.is_attacked?(@col, Coords.new(0, 2))
          add_move(0, 2, MoveType::CASTLE)
          count += 1
        end
      else
        board.wqc = false
      end
    end

    if @col == GameStatus::BLACK && (board.bkc || board.bqc)
      if @rank != 7 || @file != 4
        board.bkc, board.bqc = false, false
      end
      
      if board.bkc && board.board[7][7].piece_value == -PieceType::ROOK
        if board.board[7][5].type == PieceType::NONE && board.board[7][6].type == PieceType::NONE &&
           !board.is_attacked?(@col, Coords.new(7, 4)) && !board.is_attacked?(@col, Coords.new(7, 5)) && !board.is_attacked?(@col, Coords.new(7, 6))
          add_move(7, 6, MoveType::CASTLE)
          count += 1
        end
      else
        board.bkc = false
      end

      if board.bqc && board.board[7][0].piece_value == -PieceType::ROOK
        if board.board[7][3].type == PieceType::NONE && board.board[7][2].type == PieceType::NONE && board.board[7][1].type == PieceType::NONE &&
           !board.is_attacked?(@col, Coords.new(7, 4)) && !board.is_attacked?(@col, Coords.new(7, 3)) && !board.is_attacked?(@col, Coords.new(7, 2))
          add_move(7, 2, MoveType::CASTLE)
          count += 1
        end
      else
        board.bqc = false
      end
    end

    count
  end
end