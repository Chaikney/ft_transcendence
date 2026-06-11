# san_parser.rb
require_relative 'chess_types'
require_relative 'piece'

class SanParser
  attr_accessor :type, :capture, :kc, :qc, :file, :rank,
                :needed_rank, :needed_file, :promotion, :promoted_piece,
                :check, :mate

  def initialize(san)
    @capture = false
    @kc = false
    @qc = false
    @promotion = false
    @check = false
    @mate = false
    @needed_file = NO
    @needed_rank = NO
    @file = NO
    @rank = NO
    @promoted_piece = PieceType::NONE

    parse(san.dup)
  end

  def get_move(san_str, board)
    m = FullMove.new(Coords.new(-1, -1), MoveType::MOVE, Coords.new(-1, -1))

    # 1. Enroques
    if @kc || @qc
      m.t = MoveType::CASTLE
      m.to.rank = board.turn == GameStatus::WHITE ? 0 : 7
      m.to.file = @kc ? 6 : 2
      m.from.rank = board.turn == GameStatus::WHITE ? 0 : 7
      m.from.file = 4
      return m
    end

    m.t = MoveType::MOVE
    m.to.rank = @rank
    m.to.file = @file

    found = false

    # 2. Configurar el tipo de movimiento base
    if @promotion
      m.t = @promoted_piece
      m.t = 4 + @promoted_piece if @capture # Truco matemático para mapear a CAPTURE_Q, etc.
    elsif @capture
      m.t = MoveType::CAPTURE
    end

    # 3. Lógica específica del Peón
    if @type == PieceType::PAWN
      m.from.rank = m.to.rank - board.turn

      m.from.file = @needed_file != NO ? @needed_file : m.to.file

      # En Passant
      if m.t == MoveType::CAPTURE &&
         m.to.rank == (board.turn == GameStatus::WHITE ? 5 : 2) &&
         board.board[m.to.rank - board.turn][m.to.file].piece_value == -board.turn * PieceType::PAWN &&
         board.board[m.to.rank][m.to.file].piece_value == 0
        m.t = MoveType::ENPASSANT
      end

      # Re-aplicar promoción si era En Passant o Captura rara
      if @promotion
        m.t = (m.t == MoveType::CAPTURE ? 4 : 0) + @promoted_piece
      end

      # Movimiento doble inicial
      if m.to.rank == (board.turn == GameStatus::WHITE ? 3 : 4) &&
         m.t == MoveType::MOVE &&
         board.board[m.to.rank - board.turn][m.to.file].piece_value == 0 &&
         board.board[m.to.rank - 2 * board.turn][m.to.file].piece_value == PieceType::PAWN * board.turn
        m.from.rank = m.to.rank - 2 * board.turn
      end

    # 4. Lógica para el resto de piezas (Búsqueda en el tablero)
    else
      temp_to = Coords.new(@rank, @file)
      
      board.board.each_with_index do |row, i|
        row.each_with_index do |piece, j|
          # Filtramos por ambigüedad (ej: si hay dos Caballos que pueden ir a la misma casilla)
          if (@needed_file == NO || @needed_file == j) &&
             (@needed_rank == NO || @needed_rank == i) &&
             piece.piece_value == board.turn * @type

            if piece.is_legal?(temp_to)
              raise "SANError: Múltiples piezas pueden hacer ese movimiento (#{san_str})" if found
              found = true
              m.from.file = j
              m.from.rank = i
            end
          end
        end
      end
      raise "SANError: Movimiento ilegal o pieza no encontrada (#{san_str})" unless found
    end

    m
  end

  private

  def parse(san)
    raise "SANError: Movimiento vacío" if san.empty?

    if san.end_with?('+')
      @check = true
      san.chop!
    elsif san.end_with?('#')
      @mate = true
      san.chop!
    end

    if san == "O-O"
      @kc = true
      return
    end

    if san == "O-O-O"
      @qc = true
      return
    end

    i = 0
    if san[0].match?(/[A-Z]/)
      @type = piece_from_char(san[0])
      i += 1
    else
      @type = PieceType::PAWN
    end

    eq_idx = san.index('=')
    if eq_idx
      @promotion = true
      raise "SANError: Formato de promoción incorrecto" if eq_idx != san.length - 2
      @promoted_piece = piece_from_char(san[eq_idx + 1])
      san = san[0...eq_idx] # Recortamos la parte de la promoción (=Q)
    end

    @capture = true if san.include?('x')

    raise "SANError: Coordenada incompleta" if san.length < 2

    @rank = rank_to_int(san[-1])
    @file = file_to_int(san[-2])

    raise "SANError: Rango de destino fuera del tablero" unless (0..7).cover?(@rank)
    raise "SANError: Columna de destino fuera del tablero" unless (0..7).cover?(@file)

    prefix = san[i...-2] || ""
    prefix.delete!('x')

    if @type == PieceType::PAWN
      @needed_file = file_to_int(prefix[0]) if @capture && !prefix.empty?
    else
      if prefix.length == 1
        if is_file?(prefix[0])
          @needed_file = file_to_int(prefix[0])
        else
          @needed_rank = rank_to_int(prefix[0])
        end
      elsif prefix.length == 2
        @needed_file = file_to_int(prefix[0])
        @needed_rank = rank_to_int(prefix[1])
      end
    end

    raise "SANError: Ambigüedad de rango inválida" if @needed_rank != NO && !((0..7).cover?(@needed_rank))
    raise "SANError: Ambigüedad de columna inválida" if @needed_file != NO && !((0..7).cover?(@needed_file))
  end

  def piece_from_char(c)
    case c
    when 'K' then PieceType::KING
    when 'Q' then PieceType::QUEEN
    when 'R' then PieceType::ROOK
    when 'B' then PieceType::BISHOP
    when 'N' then PieceType::KNIGHT
    else PieceType::PAWN
    end
  end

  def is_file?(c)
    c.between?('a', 'h')
  end

  def file_to_int(c)
    c.ord - 'a'.ord
  end

  def rank_to_int(c)
    c.ord - '1'.ord
  end
end