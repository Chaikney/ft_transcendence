# lib/chess_engine/chess_engine.rb
require_relative 'board'

class ChessEngine
  def initialize(game_id)
    @game_record = Game.find(game_id) 
    @board = Board.new(@game_record.fen_actual)
  end

  def move(from_str, to_str)
    from_coord = parse_square(from_str)
    to_coord = parse_square(to_str)

    # 1. El motor ejecuta la jugada y devuelve el número entero (-1, 0, 1, 2)
    estado_numerico = @board.play_move_coords(from_coord, to_coord)
    nuevo_fen = @board.get_fen

    # 2. TRADUCTOR: Acoplamos los números del motor con los estados de texto y el Elo de tu modelo
    case estado_numerico
    when 1 # Gana el Jugador 1 (Blancas)
      @game_record.update!(fen_actual: nuevo_fen)
      @game_record.finalize_match(@game_record.player1_id) # 🏆 Activa tu cálculo de Elo automático
      
    when -1 # Gana el Jugador 2 (Negras)
      @game_record.update!(fen_actual: nuevo_fen)
      @game_record.finalize_match(@game_record.player2_id) # 🏆 Activa tu cálculo de Elo automático
      
    when 2 # Empate / Tablas (Insuficiencia de material o rey ahogado)
      @game_record.update!(fen_actual: nuevo_fen, status: 'finished')
      
    else # La partida continúa (0)
      @game_record.update!(fen_actual: nuevo_fen, status: 'in_progress')
    end

    # 3. Devolvemos el Hash limpio para que tu GameService lo mande por ActionCable
    {
      action: 'move_played',
      nuevo_fen: nuevo_fen,
      estado: @game_record.status # Devolverá 'in_progress' o 'finished' alineado con React
    }
  end

  private

  def parse_square(sq)
    file = sq[0].ord - 'a'.ord
    rank = sq[1].ord - '1'.ord
    Coords.new(rank, file)
  end
end