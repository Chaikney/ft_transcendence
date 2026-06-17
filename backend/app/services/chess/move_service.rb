module Chess
  class MoveService
    STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    def initialize(game:, ai_client: AiClient.new)
      @game = game
      @ai_client = ai_client
    end

    def request_ai_move
      apply_engine_move(@ai_client.predict_move(fen: current_fen))
    end

    def apply_move(from:, to:, promotion: nil)
      move = [from, to, promotion].compact.join
      apply_engine_move(@ai_client.apply_move(fen: current_fen, move: move))
    end

    private

    attr_reader :game, :ai_client

    def current_fen
      game.current_board.presence || game.initial_board.presence || STARTING_FEN
    end

    def apply_engine_move(engine_payload)
      game.current_board = engine_payload.fetch('next_fen')
      game.status = engine_payload['game_status'] == 'active' ? 'in_progress' : 'finished'
      game.save!

      {
        game_id: game.id.to_s,
        fen: engine_payload.fetch('next_fen'),
        turn: engine_payload.fetch('turn'),
        status: engine_payload.fetch('game_status'),
        last_move: engine_payload['last_move']
      }
    end
  end
end