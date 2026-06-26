class MatchmakingChannel < ApplicationCable::Channel
  # Usamos un Hash en memoria para la cola: { 'chess' => user_id, 'sudoku' => user_id }
  @@waiting_players = {}
  @@mutex = Mutex.new

  def subscribed
    # Cada usuario se suscribe a un canal PRIVADO con su ID para recibir su partida
    stream_from "matchmaking_#{current_user.id}"
  end

  def join_queue(data)
    game_type = data['game_type'] || 'chess' # 'chess' o 'sudoku'

    @@mutex.synchronize do
      # 1. Comprobamos si hay alguien esperando para este juego y que NO sea el mismo usuario
      opponent_id = @@waiting_players[game_type]

      if opponent_id && opponent_id != current_user.id
        # ¡HAY PARTIDA! Sacamos al oponente de la cola
        @@waiting_players.delete(game_type)

        # Generamos un identificador único para la sala
        room_id = "#{game_type}-#{SecureRandom.hex(4)}"

        # Avisamos al jugador que estaba esperando
        ActionCable.server.broadcast(
          "matchmaking_#{opponent_id}", 
          { action: 'match_found', room_id: room_id, opponent_id: current_user.id }
        )
        
        # Avisamos al jugador actual (el que acaba de entrar)
        ActionCable.server.broadcast(
          "matchmaking_#{current_user.id}", 
          { action: 'match_found', room_id: room_id, opponent_id: opponent_id }
        )
      else
        # 2. No hay oponente, metemos a este usuario en la cola de espera
        @@waiting_players[game_type] = current_user.id
      end
    end
  end

  def leave_queue(data)
    game_type = data['game_type']
    
    @@mutex.synchronize do
      # Solo lo sacamos de la cola si es él quien estaba esperando
      if @@waiting_players[game_type] == current_user.id
        @@waiting_players.delete(game_type)
      end
    end
  end

  def unsubscribed
    # Si el usuario cierra el navegador o se desconecta, lo sacamos de cualquier cola
    @@mutex.synchronize do
      @@waiting_players.delete_if { |_game, waiting_id| waiting_id == current_user.id }
    end
  end
end