class GameChannel < ApplicationCable::Channel
  @@ready_players = Hash.new { |h, k| h[k] = [] }

  def subscribed
    stream_from "game_#{params[:game_id]}"
    Rails.logger.info "🔌 [GAME] Usuario #{current_user.id} entró a la sala game_#{params[:game_id]}"

    game_id = params[:game_id].to_s.split('-').last
    game = Game.find_by(id: game_id)
    is_player = game.present? && (current_user == game.player1 || current_user == game.player2)

    unless is_player
      Rails.cache.increment("spectators:#{game_id}", 1, initial: 0)
      broadcast_spectator_count(params[:game_id], game_id)
    end
  end

  def player_ready
    room = params[:game_id]
    user_id = current_user.id
    Rails.logger.info "✅ [GAME] Usuario #{user_id} envió READY a #{room}"
    @@ready_players[room] << user_id unless @@ready_players[room].include?(user_id)
    Rails.logger.info "✅ [GAME] Usuario #{user_id} está READY en #{room}"

    if @@ready_players[room].length == 2
      game_id = room.to_s.split('-').last
      partida = Game.find_by(id: game_id)
      
      # 🚀 FIX: Le damos el turno inicial al player1 (Blancas)
      partida&.update!(status: 'in_progress', current_turn_id: partida.player1_id)
      
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

    new_fen = data['fen']
    last_move = data['last_move']

    historial_actual = partida.fen_history || []
    nuevo_historial = historial_actual + [new_fen]

    historial_limpio = nuevo_historial.map { |f| f.to_s.split(' ')[0..3].join(' ') }
    is_threefold = historial_limpio.tally.values.any? { |count| count >= 3 }

    estado_bd = is_threefold ? 'finished' : 'in_progress'
    estado_front = is_threefold ? 'draw' : 'in_progress'

    siguiente_turno_id = (data['turn'] == 'w') ? partida.player1_id : partida.player2_id
    # Guardamos en la base de datos
    partida.update!(
      current_board: new_fen,
      fen_history:   nuevo_historial,
      status:        estado_bd,
      current_turn_id: siguiente_turno_id
    )

    ActionCable.server.broadcast("game_#{room}", {
      type: 'move_updated',
      game: {
        status: estado_front,
        fen: new_fen,
        fen_history: partida.fen_history,
        turn: data['turn'],
        last_move: last_move
      }
    })

    if is_threefold
      ActionCable.server.broadcast("game_#{room}", {
        type: 'game_over',
        status: 'draw'
      })
    end
  end

  def claim_draw
    room = params[:game_id]
    game_id = room.to_s.split('-').last
    partida = Game.find(game_id)
    partida.update!(status: 'finished')

    ActionCable.server.broadcast("game_#{room}", {
      type: 'game_over',
      status: 'draw'
    })
  end

  def resign
    room = params[:game_id]
    game_type, game_id = room.to_s.split('-')
    partida = Game.find(game_id)

    return if partida.status != 'in_progress'

    winner = (current_user == partida.player1) ? partida.player2 : partida.player1

    if game_type == 'chess'
        partida.finalize_match(winner.id)
    else
      # 🚀 FIX: Añadimos el winner_id para el Sudoku
      partida.update!(status: 'finished', winner_id: winner.id)
    end

    ActionCable.server.broadcast("game_#{room}", {
      type: 'game_over',
      status: 'resigned'
    })
  end

  def unsubscribed
    room = params[:game_id]
    @@ready_players[room]&.delete(current_user.id)

    return unless room.present?

    game_type, game_id = room.to_s.split('-')
    partida = Game.find_by(id: game_id)

    is_player = (current_user == partida&.player1 || current_user == partida&.player2)

    unless is_player
      Rails.cache.decrement("spectators:#{game_id}", 1)
      count = Rails.cache.read("spectators:#{game_id}") || 0
      if count < 0
        Rails.cache.write("spectators:#{game_id}", 0)
        count = 0
      end
      ActionCable.server.broadcast("game_#{room}", { type: 'spectator_count', count: count })
    end

    if partida&.status == 'in_progress' && is_player
      Rails.logger.info "💀 [GAME] Usuario #{current_user.id} abandonó #{room}"
      winner = (current_user == partida.player1) ? partida.player2 : partida.player1
      if game_type == 'chess'
        partida.finalize_match(winner.id)
      else
        # 🚀 FIX: Añadimos el winner_id para el Sudoku
        partida.update!(status: 'finished', winner_id: winner.id)
      end

      ActionCable.server.broadcast("game_#{room}", { type: 'opponent_disconnect' })
    else
      Rails.logger.info "👋 [GAME] Usuario #{current_user.id} salió de #{room} — sin broadcast"
    end
  end

  private

  def broadcast_spectator_count(room, game_id)
    count = Rails.cache.read("spectators:#{game_id}") || 0
    ActionCable.server.broadcast("game_#{room}", { type: 'spectator_count', count: count })
  end
end