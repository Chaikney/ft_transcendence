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

  # Extraemos el número (ej: si room es "chess-5", saca el "5")
  game_id = room.to_s.split('-').last

  # 1. Buscamos la partida en BD (⚠️ Cambia 'Match' por 'Game' si tu modelo se llama Game)
  partida = Match.find(game_id)

  new_fen = data['fen']
  last_move = data['last_move']

  # 2. Rescatamos el historial viejo y le añadimos el nuevo FEN
  # Si es el primer turno y está vacío, creamos un array temporal
  historial_actual = partida.fen_history || []
  nuevo_historial = historial_actual + [new_fen]

  # Guardamos la partida actualizada en la base de datos
  partida.update!(
    current_board: new_fen,     # Usa el nombre de columna que tengas para el FEN actual
    fen_history: nuevo_historial
  )

  # 3. ¡Lo más importante! Rebotamos la jugada INCLUYENDO el historial
  ActionCable.server.broadcast("game_#{room}", {
    type: 'move_updated',
    game: {
      status: 'active',
      fen: new_fen,
      fen_history: partida.fen_history, # 👈 AQUÍ ESTÁ LA MAGIA PARA TU ÁRBITRO
      turn: data['turn'],
      last_move: last_move
    }
  })
  end

  def claim_draw
    room = params[:game_id]
    game_id = room.to_s.split('-').last

    # 👇 AQUÍ ESTABA EL ERROR. Cambia Match por Game
    partida = Game.find(game_id)

    # Y asegúrate de que el estado que guardas es el correcto
    # (si en tu BD el final se llama 'finished' o 'draw')
    partida.update!(status: 'finished')

    ActionCable.server.broadcast("game_#{room}", {
      type: 'game_over',
      status: 'draw'
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
