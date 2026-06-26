class GameChannel < ApplicationCable::Channel
  # Un diccionario global para guardar quién está listo en cada sala
  @@ready_players = Hash.new { |h, k| h[k] = [] }

  def subscribed
    stream_from "game_#{params[:game_id]}"
    Rails.logger.info "🔌 [GAME] Usuario #{current_user.id} entró a la sala game_#{params[:game_id]}"
  end

  def player_ready
    room = params[:game_id]
    user_id = current_user.id
    
    Rails.logger.info "✅ [GAME] Usuario #{user_id} envió READY a #{room}"
    # Añadimos al jugador a la lista de "Listos" si no estaba ya
    @@ready_players[room] << user_id unless @@ready_players[room].include?(user_id)
    Rails.logger.info "✅ [GAME] Usuario #{user_id} está READY en #{room}"

    # Si ya hay 2 jugadores listos... ¡EMPIEZA LA PARTIDA!
    if @@ready_players[room].length == 2
      ActionCable.server.broadcast("game_#{room}", { type: 'game_start' })
      @@ready_players.delete(room) # Limpiamos la lista
    else
      # Si solo hay 1, avisamos al otro de que su rival está listo
      ActionCable.server.broadcast("game_#{room}", { type: 'player_ready', user_id: user_id })
    end
  end

  def make_move(data)
    room = params[:game_id]
    
    # 1. Recibimos la nueva posición (FEN) y el último movimiento
    new_fen = data['fen']
    last_move = data['last_move']

    # 2. Opcional: Podrías buscar la partida (Game.find) y guardar el new_fen en BD aquí mismo.
    
    # 3. ¡Lo más importante! Rebotamos la jugada a los dos jugadores de la sala
    ActionCable.server.broadcast("game_#{room}", {
      type: 'move_updated',
      game: {
        status: 'active', # o 'checkmate' si tu lógica de React lo detectó
        fen: new_fen,
        turn: data['turn'], # 'w' o 'b'
        last_move: last_move
      }
    })
  end

  def unsubscribed
    room = params[:game_id]
    # Si alguien se va, lo borramos de la lista de listos por si acaso
    @@ready_players[room]&.delete(current_user.id) 
    
    ActionCable.server.broadcast("game_#{room}", {
      type: 'opponent_disconnect'
    })
  end
end