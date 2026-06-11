require_relative 'board'

class ChessEngine
  def initialize(game_id)
    # 1. Recuperamos la partida de la BD usando el ID
    # (Asegúrate de que 'Game' sea el nombre de tu modelo en Rails)
    @game_record = Game.find(game_id) 
    
    # 2. Despertamos el tablero con el estado actual
    @board = Board.new(@game_record.fen_actual)
  end

  def move(from_str, to_str)
    # 3. Convertimos los strings del Frontend ("e2", "e4") a coordenadas (Coords)
    from_coord = parse_square(from_str)
    to_coord = parse_square(to_str)

    # 4. El motor ejecuta la jugada y calcula jaques/mates
    estado_nuevo = @board.play_move_coords(from_coord, to_coord)
    
    # 5. Sacamos la nueva foto del tablero
    nuevo_fen = @board.get_fen

    # 6. Actualizamos la BD
    @game_record.update!(fen_actual: nuevo_fen, status: estado_nuevo)

    # 7. Devolvemos el Hash exacto que tu GameService va a escupir por ActionCable
    {
      action: 'move_played',
      nuevo_fen: nuevo_fen,
      estado: estado_nuevo
    }
  end

  private

  # Método ninja para convertir "e2" a Coords.new(1, 4)
  def parse_square(sq)
    file = sq[0].ord - 'a'.ord
    rank = sq[1].ord - '1'.ord
    Coords.new(rank, file)
  end
end