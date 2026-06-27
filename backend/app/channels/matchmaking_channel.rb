class MatchmakingChannel < ApplicationCable::Channel
  @@waiting_players = {}
  @@mutex = Mutex.new

  def subscribed
    stream_from "matchmaking_#{current_user.id}"
    Rails.logger.info "📡 [MATCHMAKING] Usuario #{current_user.id} acaba de conectar el cable."
  end

  def join_queue(data)
    game_type = data['game_type'] || 'chess'
    
    Rails.logger.info "⚔️ [MATCHMAKING] Usuario #{current_user.id} le dio al botón de #{game_type}"

    @@mutex.synchronize do
      opponent_id = @@waiting_players[game_type]
      Rails.logger.info "🔍 [MATCHMAKING] Cola actual de #{game_type}: #{@@waiting_players.inspect}"

      if opponent_id && opponent_id != current_user.id
        Rails.logger.info "🎉 [MATCHMAKING] ¡BINGO! Emparejando a #{opponent_id} con #{current_user.id}"
        
        @@waiting_players.delete(game_type)
        
        # 1. ESTA ES LA VARIABLE QUE FALTABA (Asegúrate de copiar esta línea)
        starting_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

        # 2. Creamos la partida con la variable que acabamos de definir
        game = Game.create!(
          player1_id: opponent_id,
          player2_id: current_user.id,
          status: 'pending',
          initial_board: starting_fen,
          current_board: starting_fen,
          fen_history: [starting_fen]
        )

        room_id = "#{game_type}-#{game.id}"
        opponent_user = User.find(opponent_id)

        # Le mandamos al OPONENTE
        ActionCable.server.broadcast("matchmaking_#{opponent_id}", { 
          action: 'match_found', 
          game_id: room_id,
          room_id: room_id,
          opponent: { id: current_user.id, username: current_user.username, elo: current_user.elo }
        })
        
        # Le mandamos al JUGADOR ACTUAL
        ActionCable.server.broadcast("matchmaking_#{current_user.id}", { 
          action: 'match_found', 
          game_id: room_id,
          room_id: room_id,
          opponent: { id: opponent_user.id, username: opponent_user.username, elo: opponent_user.elo }
        })
      else
        Rails.logger.info "⏳ [MATCHMAKING] No hay nadie más. Usuario #{current_user.id} se queda esperando."
        @@waiting_players[game_type] = current_user.id
      end
    end
  end

  def leave_queue(data)
    game_type = data['game_type']
    @@mutex.synchronize do
      if @@waiting_players[game_type] == current_user.id
        @@waiting_players.delete(game_type)
        Rails.logger.info "🚪 [MATCHMAKING] Usuario #{current_user.id} abortó la secuencia."
      end
    end
  end

  def unsubscribed
    @@mutex.synchronize do
      @@waiting_players.delete_if { |_game, waiting_id| waiting_id == current_user.id }
    end
  end
end