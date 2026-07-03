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
    @@ready_players[room] << user_id unless @@ready_players[room].include?(user_id)
    Rails.logger.info "✅ [GAME] Usuario #{user_id} está READY en #{room}"

    if @@ready_players[room].length == 2
      # Ambos listos: marcamos la partida como activa y arrancamos
      game_id = room.to_s.split('-').last
      Game.find_by(id: game_id)&.update!(status: 'in_progress')
      ActionCable.server.broadcast("game_#{room}", { type: 'game_start' })
      @@ready_players.delete(room)
    else
      ActionCable.server.broadcast("game_#{room}", { type: 'player_ready', user_id: user_id })
    end
  end

  def make_move(data)
    room = params[:game_id]
    game_id = room.to_s.split('-').last
    partida = Game.find(game_id)

    new_fen   = data['fen']
    last_move = data['last_move']

    historial_actual = partida.fen_history || []
    nuevo_historial  = historial_actual + [new_fen]

    # 🧠 EL ÁRBITRO SUPREMO DEL BACKEND
    # Limpiamos el historial para comparar solo la posición (piezas, turno, enroque)
    historial_limpio = nuevo_historial.map { |f| f.to_s.split(' ')[0..3].join(' ') }

    # Comprobamos si alguna posición ha salido 3 o más veces
    is_threefold = historial_limpio.tally.values.any? { |count| count >= 3 }

    # Si se repite 3 veces, el estado cambia a terminado sin preguntar al frontend
    estado_bd = is_threefold ? 'finished' : 'in_progress'
    estado_front = is_threefold ? 'draw' : 'in_progress'

    # Guardamos en la base de datos
    partida.update!(
      current_board: new_fen,
      fen_history:   nuevo_historial,
      status:        estado_bd
    )

    # 1. Devolvemos la jugada, ¡pero ahora con el estado correcto!
    ActionCable.server.broadcast("game_#{room}", {
      type: 'move_updated',
      game: {
        status:      estado_front, # 👈 Ya no forzamos 'in_progress' a ciegas
        fen:         new_fen,
        fen_history: partida.fen_history,
        turn:        data['turn'],
        last_move:   last_move
      }
    })

    # 2. Si detectamos el empate, pitamos el final desde el servidor al instante
    if is_threefold
      ActionCable.server.broadcast("game_#{room}", {
        type:   'game_over',
        status: 'draw'
      })
    end
  end

  def claim_draw
    room    = params[:game_id]
    game_id = room.to_s.split('-').last
    partida = Game.find(game_id)
    partida.update!(status: 'finished')

    ActionCable.server.broadcast("game_#{room}", {
      type:   'game_over',
      status: 'draw'
    })
  end

  def resign
    room = params[:game_id]
    game_id = room.to_s.split('-').last
    partida = Game.find(game_id)

    # Si la partida ya ha terminado por otra cosa, lo ignoramos
    return if partida.status != 'in_progress'

    # ¿Quién ha pulsado el botón y quién se lleva la victoria?
    winner = (current_user == partida.player1) ? partida.player2 : partida.player1

    # 🏆 ¡AQUÍ BRILLA VUESTRO CÓDIGO!
    # Llamamos a vuestro motor de torneo para recalcular el Elo y cerrar la partida
    partida.finalize_match(winner.id)

    # Gritamos a los cuatro vientos que la partida ha terminado
    ActionCable.server.broadcast("game_#{room}", {
      type:   'game_over',
      status: 'resigned' # El frontend leerá esto y mostrará que alguien se rindió
    })
  end

  def unsubscribed
    room = params[:game_id]
    @@ready_players[room]&.delete(current_user.id)

    # ─── Solo notificamos si la partida está realmente ACTIVA ────────────────
    # Esto evita que el handshake inicial del lobby dispare "rival desconectado"
    return unless room.present?

    game_id = room.to_s.split('-').last
    partida = Game.find_by(id: game_id)

    if partida&.status == 'in_progress'
      Rails.logger.info "💀 [GAME] Usuario #{current_user.id} abandonó #{room} (partida activa)"
      ActionCable.server.broadcast("game_#{room}", { type: 'opponent_disconnect' })
    else
      Rails.logger.info "👋 [GAME] Usuario #{current_user.id} salió de #{room} (estado: #{partida&.status || 'no encontrada'}) — sin broadcast"
    end
  end
end
