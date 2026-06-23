# app/channels/game_channel.rb
class GameChannel < ApplicationCable::Channel
  def subscribed
    # React se conecta aquí enviando un game_id
    stream_from "game_channel_#{params[:game_id]}"
  end

  def get_game_state
    game = find_game
    return transmit_error('Game not found') unless game

    transmit_game_state(game)
  rescue StandardError => e
    transmit_error(e.message)
  end

  # 🟢 OBJETIVOS 1 y 3: Validar movimientos y detectar fin de juego
  def make_move(data)
    game = find_game
    return transmit_error('Game not found') unless game
    return transmit_error('El juego ya ha terminado') if game.status == 'finished'

    # Recreamos el tablero con el FEN actual de la base de datos
    board = Chess::Game.new(game.current_fen)

    begin
      # Intentamos hacer el movimiento
      board.move(data['from'], data['to'])

      # ✅ EL MOVIMIENTO ES LEGAL
      new_fen = board.board.to_fen
      game.update!(current_fen: new_fen)

      # Avisamos a los jugadores (usando el nombre exacto de tu stream)
      ActionCable.server.broadcast("game_channel_#{game.id}", {
        type: 'move',
        fen: new_fen,
        from: data['from'],
        to: data['to']
      })

      # 🏁 DETECCIÓN DE FIN DE JUEGO
      if board.checkmate?
        game.finalize_match(current_user.id) 
        ActionCable.server.broadcast("game_channel_#{game.id}", { type: 'game_over', result: 'checkmate', winner_id: current_user.id })
      elsif board.stalemate?
        game.update!(status: 'finished')
        ActionCable.server.broadcast("game_channel_#{game.id}", { type: 'game_over', result: 'stalemate' })
      end

    rescue Chess::IllegalMoveError, Chess::BadNotationError
      # 🛑 ANTI-TRAMPAS
      transmit_error('Movimiento ilegal detectado')
    end
  end

  private

  def find_game
    # Fíjate que aquí usamos :game_id porque es lo que espera tu frontend
    Game.find_by(id: params[:game_id])
  end

  def transmit_game_state(game)
    transmit({
      type: 'game_state_update',
      payload: { fen: game.current_fen, status: game.status }
    })
  end

  def transmit_error(message)
    transmit({ type: 'error', message: message })
  end
end