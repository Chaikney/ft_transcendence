# board.rb
require_relative 'chess_types'
require_relative 'piece'
# require_relative 'san_parser' # Lo activaremos en el próximo paso

class Board
  attr_accessor :wkc, :wqc, :bkc, :bqc, :turn, :move_rule, :full_moves, 
                :board, :status, :en_passant, :draw_tracker

  def initialize(fen = START_POSITION)
    @board = Array.new(8) { Array.new(8) { Piece.new } }
    @draw_tracker = Hash.new(0)
    from_fen(fen)
    update_legal_moves
  end

  # Necesario para que Piece simule movimientos sin alterar el juego real
  def deep_copy
    copy = Board.allocate
    copy.wkc, copy.wqc = @wkc, @wqc
    copy.bkc, copy.bqc = @bkc, @bqc
    copy.turn = @turn
    copy.en_passant = Coords.new(@en_passant.rank, @en_passant.file) if @en_passant
    copy.board = @board.map { |row| row.map { |piece| p = Piece.new; p.full_copy(piece); p } }
    copy
  end

  def get_en_passant
    @en_passant || Coords.new(NO, NO)
  end

  def on_board?(rank, file)
    rank.between?(0, 7) && file.between?(0, 7)
  end

  def is_check?(col)
    @board.each_with_index do |row, i|
      row.each_with_index do |piece, j|
        if piece.type == PieceType::KING && piece.col == col
          return is_attacked?(col, Coords.new(i, j))
        end
      end
    end
    false
  end

  def is_attacked?(col, coord)
    r, f = coord.rank, coord.file
    
    # Amenaza de Caballo
    [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]].each do |dr, df|
      return true if on_board?(r + dr, f + df) && @board[r + dr][f + df].piece_value == -col * PieceType::KNIGHT
    end

    # Amenaza de Peón
    [-1, 1].each do |df|
      return true if on_board?(r + col, f + df) && @board[r + col][f + df].piece_value == -col * PieceType::PAWN
    end

    # Amenaza de Rey
    [-1, 0, 1].each do |dr|
      [-1, 0, 1].each do |df|
        next if dr == 0 && df == 0
        return true if on_board?(r + dr, f + df) && @board[r + dr][f + df].piece_value == -col * PieceType::KING
      end
    end

    # Amenazas ortogonales (Torre / Reina)
    [[1, 0], [-1, 0], [0, 1], [0, -1]].each do |dr, df|
      (1..7).each do |i|
        nr, nf = r + dr * i, f + df * i
        break unless on_board?(nr, nf)
        target = @board[nr][nf]
        next if target.type == PieceType::NONE
        return true if target.piece_value == -col * PieceType::ROOK || target.piece_value == -col * PieceType::QUEEN
        break # Bloqueado por otra pieza
      end
    end

    # Amenazas diagonales (Alfil / Reina)
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].each do |dr, df|
      (1..7).each do |i|
        nr, nf = r + dr * i, f + df * i
        break unless on_board?(nr, nf)
        target = @board[nr][nf]
        next if target.type == PieceType::NONE
        return true if target.piece_value == -col * PieceType::BISHOP || target.piece_value == -col * PieceType::QUEEN
        break
      end
    end

    false
  end

  def update_legal_moves
    count = 0
    @board.each do |row|
      row.each do |piece|
        if piece.col == @turn
          count += piece.calculate_legal_moves(self)
        end
      end
    end

    if count > 0
      @status = GameStatus::CONTINUE
      return GameStatus::CONTINUE
    end

    if is_check?(@turn)
      @status = -@turn
      return -@turn
    end

    @status = GameStatus::DRAW
    GameStatus::DRAW
  end

  def play_move_coords(from, destiny)
    piece = @board[from.rank][from.file]
    move = piece.legal_moves.find { |m| m.to.rank == destiny.rank && m.to.file == destiny.file }
    raise "MoveError: Intentaste un movimiento ilegal" unless move

    # Limpiar movimientos legales del tablero actual
    @board.each { |row| row.each(&:empty_moves) }

    unless special_move?(from, move)
      place(from, move.to)
      @en_passant = Coords.new(NO, NO)
    end

    @move_rule += 1
    @move_rule = 0 if move.t != MoveType::MOVE && move.t != MoveType::CASTLE || piece.type == PieceType::PAWN
    @full_moves += 1 if @turn == GameStatus::BLACK
    
    if @move_rule == 100
      @status = GameStatus::DRAW
      return @status
    end

    @turn = -@turn

    # Quitar derechos de enroque si se mueven Reyes o Torres
    if from.rank == 0 && from.file == 4
      @wkc = @wqc = false
    elsif from.rank == 7 && from.file == 4
      @bkc = @bqc = false
    elsif (from.rank == 0 && from.file == 0) || (move.to.rank == 0 && move.to.file == 0)
      @wqc = false
    elsif (from.rank == 0 && from.file == 7) || (move.to.rank == 0 && move.to.file == 7)
      @wkc = false
    elsif (from.rank == 7 && from.file == 0) || (move.to.rank == 7 && move.to.file == 0)
      @bqc = false
    elsif (from.rank == 7 && from.file == 7) || (move.to.rank == 7 && move.to.file == 7)
      @bkc = false
    end

    @status = update_legal_moves
  end

  private

  def place(from, to)
    @board[to.rank][to.file].set_piece(@board[from.rank][from.file].piece_value)
    @board[from.rank][from.file].set_piece(0)
  end

  def special_move?(from, move)
    piece = @board[from.rank][from.file]

    if piece.type == PieceType::PAWN && (from.rank - move.to.rank).abs == 2
      @en_passant = move.to
      place(from, move.to)
    elsif move.t == MoveType::MOVE || move.t == MoveType::CAPTURE
      return false
    elsif move.t <= MoveType::CAPTURE_N # Promoción
      promoted_type = (move.t - 2) % 4
      @board[move.to.rank][move.to.file].set_piece(@turn * (promoted_type + 2))
      @board[from.rank][from.file].set_piece(0)
      @en_passant = Coords.new(NO, NO)
    elsif move.t == MoveType::ENPASSANT
      place(from, move.to)
      @board[from.rank][move.to.file].set_piece(0)
      @en_passant = Coords.new(NO, NO)
    elsif move.t == MoveType::CASTLE
      place(from, move.to)
      rook_from = Coords.new(from.rank, move.to.file == 6 ? 7 : 0)
      rook_to = Coords.new(from.rank, rook_from.file == 7 ? 5 : 2)
      place(rook_from, rook_to)
      @en_passant = Coords.new(NO, NO)
      if @turn == GameStatus::WHITE
        @wkc = @wqc = false
      else
        @bkc = @bqc = false
      end
    end
    true
  end

  # Traducción ultrarrápida del parser de FEN de C++
  def from_fen(fen)
    sections = fen.split(' ')
    raise "FenError: Formato FEN incorrecto" if sections.size != 6

    # 1. Posiciones
    lines = sections[0].split('/')
    rank = 7
    lines.each do |line|
      file = 0
      line.each_char do |c|
        if c.match?(/\d/)
          file += c.to_i
        else
          type = char_to_int(c)
          @board[rank][file] = Piece.new(type, type > 0 ? GameStatus::WHITE : GameStatus::BLACK, rank, file)
          file += 1
        end
      end
      rank -= 1
    end

    # 2. Turno
    @turn = sections[1] == 'w' ? GameStatus::WHITE : GameStatus::BLACK

    # 3. Enroques
    @wkc = sections[2].include?('K')
    @wqc = sections[2].include?('Q')
    @bkc = sections[2].include?('k')
    @bqc = sections[2].include?('q')

    # 4. En Passant
    if sections[3] == '-'
      @en_passant = Coords.new(NO, NO)
    else
      f = sections[3][0].ord - 'a'.ord
      r = sections[3][1] == '3' ? 2 : 5
      @en_passant = Coords.new(r, f)
    end

    # 5 & 6. Movimientos
    @move_rule = sections[4].to_i
    @full_moves = sections[5].to_i
    
    @status = GameStatus::CONTINUE
  end

  def char_to_int(c)
    sign = c == c.downcase ? -1 : 1
    case c.downcase
    when 'p' then sign * PieceType::PAWN
    when 'r' then sign * PieceType::ROOK
    when 'n' then sign * PieceType::KNIGHT
    when 'b' then sign * PieceType::BISHOP
    when 'q' then sign * PieceType::QUEEN
    when 'k' then sign * PieceType::KING
    else PieceType::NONE
    end
  end
end