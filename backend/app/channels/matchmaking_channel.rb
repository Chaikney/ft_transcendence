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
        room_id = "#{game_type}-#{SecureRandom.hex(4)}"
        
        # 1. Buscamos al usuario oponente en la base de datos
        opponent_user = User.find(opponent_id)

        # 2. Le mandamos al OPONENTE los datos del jugador actual
        ActionCable.server.broadcast("matchmaking_#{opponent_id}", { 
          action: 'match_found', 
          room_id: room_id, 
          opponent: { id: current_user.id, username: current_user.username, elo: current_user.elo }
        })
        
        # 3. Le mandamos al JUGADOR ACTUAL los datos del oponente
        ActionCable.server.broadcast("matchmaking_#{current_user.id}", { 
          action: 'match_found', 
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