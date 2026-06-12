# board.rb
require_relative 'chess_types'
require_relative 'piece'
# require_relative 'san_parser'

class Board
  attr_accessor :wkc, :wqc, :bkc, :bqc, :turn, :move_rule, :full_moves, 
                :board, :status, :en_passant, :draw_tracker

  def initialize(fen = START_POSITION)
    # FIX: Inicializamos la malla física. Las 64 casillas saben exactamente dónde están desde el inicio.
    @board = Array.new(8) do |r| 
      Array.new(8) do |f| 
        Piece.new(PieceType::NONE, GameStatus::CONTINUE, r, f) 
      end 
    end
    @draw_tracker = Hash.new(0)
    from_fen(fen)
    update_legal_moves
  end

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
    
    [[1, 2], [1, -2], [-1, 2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]].each do |dr, df|
      return true if on_board?(r + dr, f + df) && @board[r + dr][f + df].piece_value == -col * PieceType::KNIGHT
    end

    [-1, 1].each do |df|
      return true if on_board?(r + col, f + df) && @board[r + col][f + df].piece_value == -col * PieceType::PAWN
    end

    [-1, 0, 1].each do |dr|
      [-1, 0, 1].each do |df|
        next if dr == 0 && df == 0
        return true if on_board?(r + dr, f + df) && @board[r + dr][f + df].piece_value == -col * PieceType::KING
      end
    end

    [[1, 0], [-1, 0], [0, 1], [0, -1]].each do |dr, df|
      (1..7).each do |i|
        nr, nf = r + dr * i, f + df * i
        break unless on_board?(nr, nf)
        target = @board[nr][nf]
        next if target.type == PieceType::NONE
        return true if target.piece_value == -col * PieceType::ROOK || target.piece_value == -col * PieceType::QUEEN
        break 
      end
    end

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

    @board.each { |row| row.each(&:empty_moves) }

    unless special_move?(from, move)
      place(from, move.to)
      @en_passant = Coords.new(NO, NO)
    end

    @move_rule += 1
    @move_rule = 0 if move.t != MoveType::MOVE && move.t != MoveType::CASTLE || piece.type == PieceType::PAWN
    @full_moves += 1 if @turn == GameStatus::BLACK
    
    if @move_rule == 99
      a = update_legal_moves()
      unless a == GameStatus::WHITE || a == GameStatus::BLACK
        a = GameStatus::DRAW
      end
      @status = a
      return @status
    end

    @turn = -@turn

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
    if @status == GameStatus::WHITE || @status == GameStatus::BLACK || @status == GameStatus::DRAW
      return @status
    end

    # Corrección 1: Uso del Hash Rocket (=>) para constantes
    b = { PieceType::PAWN => 0, PieceType::ROOK => 0, PieceType::KNIGHT => 0, PieceType::BISHOP => 0, PieceType::QUEEN => 0, PieceType::KING => 0 }
    w = { PieceType::PAWN => 0, PieceType::ROOK => 0, PieceType::KNIGHT => 0, PieceType::BISHOP => 0, PieceType::QUEEN => 0, PieceType::KING => 0 }

    7.downto(0) do |i|
      (0..7).each do |j|
        # Limpiamos la legibilidad guardando la pieza en una variable
        piece = @board[i][j]
        
        if piece.type == PieceType::NONE || piece.type == PieceType::KING
          next
        elsif piece.col == GameStatus::WHITE
          w[piece.type] += 1
        else
          b[piece.type] += 1
        end
      end
    end

    # Corrección 2: Explicitamente revisar > 0 (En Ruby el 0 es verdadero)
    if b[PieceType::PAWN] > 0 || b[PieceType::ROOK] > 0 || b[PieceType::QUEEN] > 0 || 
      w[PieceType::PAWN] > 0 || w[PieceType::ROOK] > 0 || w[PieceType::QUEEN] > 0
      return @status
    elsif b[PieceType::KNIGHT] == 2
      if b[PieceType::BISHOP] > 0 || w[PieceType::KNIGHT] > 0 || w[PieceType::BISHOP] > 0
        return @status
      end
    elsif w[PieceType::KNIGHT] == 2
      if w[PieceType::BISHOP] > 0 || b[PieceType::KNIGHT] > 0 || b[PieceType::BISHOP] > 0
        return @status
      end
    elsif b[PieceType::BISHOP] == 2 || w[PieceType::BISHOP] == 2
      return @status
    elsif b[PieceType::BISHOP] == 1
      if b[PieceType::KNIGHT] == 1 || (w[PieceType::BISHOP] == 1 && w[PieceType::KNIGHT] == 1)
        return @status
      end
    # Corrección 3: 'w' en minúscula
    elsif w[PieceType::BISHOP] == 1 && w[PieceType::KNIGHT] == 1 
      return @status 
    end
    @status = GameStatus::DRAW
    return @status
  end

  def get_fen
    res = ""
    7.downto(0) do |i|
      count = 0
      (0..7).each do |j|
        piece = @board[i][j]
        if piece.type != PieceType::NONE
          res << count.to_s if count > 0
          count = 0
          res << piece.get_letter
        else
          count += 1
        end
      end
      res << count.to_s if count > 0
      res << '/' if i > 0
    end

    res << ' '
    res << (@turn == GameStatus::WHITE ? 'w' : 'b')
    res << ' '

    castling = ""
    castling << 'K' if @wkc
    castling << 'Q' if @wqc
    castling << 'k' if @bkc
    castling << 'q' if @bqc
    res << (castling.empty? ? '-' : castling)
    res << ' '

    if @en_passant && @en_passant.rank != NO
      res << (@en_passant.file + 'a'.ord).chr
      res << (@en_passant.rank == 2 ? '3' : '6')
    else
      res << '-'
    end

    res << " #{@move_rule} #{@full_moves}"
    res
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
    elsif move.t <= MoveType::CAPTURE_N 
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
      rook_to = Coords.new(from.rank, rook_from.file == 7 ? 5 : 3) 
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

  def from_fen(fen)
    sections = fen.split(' ')
    raise "FenError: Formato FEN incorrecto" if sections.size != 6

    lines = sections[0].split('/')
    rank = 7
    lines.each do |line|
      file = 0
      line.each_char do |c|
        if c.match?(/\d/)
          # FIX: No creamos piezas nuevas, solo saltamos el archivo
          file += c.to_i
        else
          val = char_to_int(c)
          # FIX: Modificamos el valor, así nunca pierden su rank/file original
          @board[rank][file].set_piece(val)
          file += 1
        end
      end
      rank -= 1
    end

    @turn = sections[1] == 'w' ? GameStatus::WHITE : GameStatus::BLACK

    @wkc = sections[2].include?('K')
    @wqc = sections[2].include?('Q')
    @bkc = sections[2].include?('k')
    @bqc = sections[2].include?('q')

    if sections[3] == '-'
      @en_passant = Coords.new(NO, NO)
    else
      f = sections[3][0].ord - 'a'.ord
      r = sections[3][1] == '3' ? 2 : 5
      @en_passant = Coords.new(r, f)
    end

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