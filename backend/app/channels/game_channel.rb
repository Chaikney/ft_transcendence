class GameChannel < ApplicationCable::Channel
  @@ready_players = Hash.new { |h, k| h[k] = [] }

  def subscribed
    stream_from "game_#{params[:game_id]}"

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
    @@ready_players[room] << user_id unless @@ready_players[room].include?(user_id)

    if @@ready_players[room].length == 2
      game_id = room.to_s.split('-').last
      partida = Game.find_by(id: game_id)
      
      # FIX: Le damos el turno inicial al player1 (Blancas)
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

    is_player = (current_user == partida.player1 || current_user == partida.player2)
    return unless is_player

    new_fen = data['fen']
    last_move = data['last_move']

    historial_actual = partida.fen_history || []
    
    # 🛡️ BARRERA ANTI-EMPATE FANTASMA:
    if historial_actual.last == new_fen
      return
    end

    nuevo_historial = historial_actual + [new_fen]
    historial_limpio = nuevo_historial.map { |f| f.to_s.split(' ')[0..3].join(' ') }
    is_threefold = historial_limpio.tally.values.any? { |count| count >= 3 }

    estado_bd = is_threefold ? 'finished' : 'in_progress'
    estado_front = is_threefold ? 'draw' : 'in_progress'

    siguiente_turno_id = (data['turn'] == 'w') ? partida.player1_id : partida.player2_id
    
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
    return unless current_user == partida.player1 || current_user == partida.player2
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

    return if partida.status == 'finished'
    return unless current_user == partida.player1 || current_user == partida.player2

    # 🛡️ ESCUDO: Si React manda un "resign" antes de empezar, cancelamos sin restar ELO
    if partida.status == 'pending_acceptance' || partida.status == 'pending'
      partida.update!(status: 'cancelled')
      
      ActionCable.server.broadcast("game_#{room}", {
        type: 'match_cancelled',
        message: 'El rival rechazó la partida.'
      })
      
      # 🚀 NUEVO: Avisamos también por matchmaking por si el otro no había transicionado
      opponent_id = (partida.player1_id == current_user.id) ? partida.player2_id : partida.player1_id
      ActionCable.server.broadcast("matchmaking_#{opponent_id}", {
        action: 'match_cancelled',
        type: 'match_cancelled',
        message: 'El rival rechazó la partida.'
      })
      return
    end

    # ⚔️ Si ya empezó, entonces SÍ restamos Elo
    winner = (current_user == partida.player1) ? partida.player2 : partida.player1

    if game_type == 'chess'
        partida.finalize_match(winner.id)
    else
      partida.update!(status: 'finished', winner_id: winner.id)
    end

    ActionCable.server.broadcast("game_#{room}", {
      type: 'game_over',
      status: 'resigned',
      winner: winner.username,
      message: "#{current_user.username} se ha rendido. #{winner.username} gana!"
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
      return
    end

    if partida && is_player && partida.status != 'finished'
      
      if partida.status == 'in_progress' || partida.status == 'active'
        # 🔴 CASO 1: PARTIDA EN CURSO. RESTAMOS ELO.
        winner = (current_user == partida.player1) ? partida.player2 : partida.player1
        
        if game_type == 'chess'
          partida.finalize_match(winner.id)
        else
          partida.update!(status: 'finished', winner_id: winner.id)
        end

        ActionCable.server.broadcast("game_#{room}", { 
          type: 'game_over', 
          status: 'resigned',
          winner: winner.username,
          message: "Tu oponente ha abandonado la partida. ¡Ganas!"
        })
        ActionCable.server.broadcast("game_#{room}", { type: 'opponent_disconnect' })
        
      elsif partida.status == 'pending_acceptance' || partida.status == 'pending'
        # 🟢 CASO 2: NO HABÍAN ACEPTADO. CANCELACIÓN SEGURA. ¡NO SE RESTA ELO!
        partida.update!(status: 'cancelled')
        
        # Avisamos al canal de juego
        ActionCable.server.broadcast("game_#{room}", { 
          type: 'match_cancelled',
          message: 'El oponente no aceptó la partida.'
        })

        # Avisamos al Matchmaking (por si el otro sigue en la pantalla de cola)
        opponent_id = (partida.player1_id == current_user.id) ? partida.player2_id : partida.player1_id
        ActionCable.server.broadcast("matchmaking_#{opponent_id}", {
          action: 'match_cancelled',
          type: 'match_cancelled',
          message: 'El oponente no aceptó la partida.'
        })
      end
    end
  end

  private

  def broadcast_spectator_count(room, game_id)
    count = Rails.cache.read("spectators:#{game_id}") || 0
    ActionCable.server.broadcast("game_#{room}", { type: 'spectator_count', count: count })
  end
end