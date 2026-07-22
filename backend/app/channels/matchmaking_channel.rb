class MatchmakingChannel < ApplicationCable::Channel
  @@waiting_players = {}
  @@mutex = Mutex.new

  def subscribed
    stream_from "matchmaking_#{current_user.id}"
    #Rails.logger.info "📡 [MATCHMAKING] Usuario #{current_user.id} acaba de conectar el cable."
  end

  def join_queue(data)
    game_type = data['game_type'] || 'chess'
    
    Rails.logger.info "⚔️ [MATCHMAKING] Usuario #{current_user.id} busca #{game_type}"

    @@mutex.synchronize do
      # 1. Miramos quién está esperando (ignorando al usuario actual por si acaso)
      opponent_id = @@waiting_players[game_type]
      Rails.logger.info "🔍 [MATCHMAKING] En cola para #{game_type}: #{opponent_id || 'Nadie'}"

      if opponent_id.present? && opponent_id != current_user.id
        Rails.logger.info "🎉 [MATCHMAKING] ¡BINGO! Emparejando #{opponent_id} con #{current_user.id}"
        
        # Lo sacamos de la cola
        @@waiting_players.delete(game_type)
        
        # Creamos la partida con el estado en espera (pendiente de que acepten)
        starting_fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        
        begin
          game = Game.create!(
            player1_id: opponent_id,
            player2_id: current_user.id,
            status: 'pending_acceptance', # El fix de los puntos
            initial_board: starting_fen,
            current_board: starting_fen,
            fen_history: [starting_fen]
          )
          Rails.logger.info "✅ [MATCHMAKING] Partida #{game.id} creada en BD."
        rescue => e
          #Rails.logger.error "❌ [MATCHMAKING ERROR] Fallo al crear partida: #{e.message}"
          return # Si peta la BD, abortamos.
        end

        room_id = "#{game_type}-#{game.id}"
        opponent_user = User.find_by(id: opponent_id)

        # Avisamos al OPONENTE
        ActionCable.server.broadcast("matchmaking_#{opponent_id}", { 
          action: 'match_found', 
          game_id: room_id,
          room_id: room_id,
          opponent: { id: current_user.id, username: current_user.username, elo: current_user.elo }
        })
        
        # Avisamos al JUGADOR ACTUAL
        ActionCable.server.broadcast("matchmaking_#{current_user.id}", { 
          action: 'match_found', 
          game_id: room_id,
          room_id: room_id,
          opponent: { id: opponent_user.id, username: opponent_user.username, elo: opponent_user.elo }
        })
        Rails.logger.info "🚀 [MATCHMAKING] Avisos enviados a ambos jugadores."
        
      else
        # Si no hay nadie (o es él mismo), le metemos en la cola
        @@waiting_players[game_type] = current_user.id
        Rails.logger.info "⏳ [MATCHMAKING] Usuario #{current_user.id} se queda esperando."
      end
    end
  end

  def leave_queue(data)
    game_type = data['game_type']
    @@mutex.synchronize do
      if @@waiting_players[game_type] == current_user.id
        @@waiting_players.delete(game_type)
        #Rails.logger.info "🚪 [MATCHMAKING] Usuario #{current_user.id} abortó la secuencia."
      end
    end
  end

  def unsubscribed
    @@mutex.synchronize do
      @@waiting_players.delete_if { |_game, waiting_id| waiting_id == current_user.id }
    end

    # 🛡️ EL ESCUDO DE LA SALA DE ESPERA
    # Si cierran la pestaña antes de aceptar, buscamos esa partida colgada...
    pending_game = Game.where(status: ['pending_acceptance', 'pending'])
                       .where("player1_id = ? OR player2_id = ?", current_user.id, current_user.id)
                       .last

    if pending_game
      pending_game.update!(status: 'cancelled')
      
      # Y avisamos al oponente a través del canal de Matchmaking (que es donde está escuchando)
      opponent_id = (pending_game.player1_id == current_user.id) ? pending_game.player2_id : pending_game.player1_id
      
      ActionCable.server.broadcast("matchmaking_#{opponent_id}", { 
        action: 'match_cancelled',
        type: 'match_cancelled', # Enviamos ambos por si tu React espera uno u otro
        message: 'El oponente abandonó la sala de espera.' 
      })
    end
  end
end