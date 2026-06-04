class ChessEngine
  attr_reader :game_id, :fen, :turn, :status, :last_move

  def initialize(game_id, fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    @game_id = game_id.to_s
    @fen = fen
    @turn = 'white'
    @status = 'active'
    @last_move = nil
  end

  def state
    {
      game_id: @game_id,
      fen: @fen,
      turn: @turn,
      status: @status,
      last_move: @last_move
    }
  end

  def move(from, to)
    # Datos simulados directamente (Mock)
    @last_move = {
      from: from,
      to: to,
      piece: 'P' 
    }
    
    @turn = @turn == 'white' ? 'black' : 'white'
    
    state
  end
end