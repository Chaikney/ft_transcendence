# app/channels/chess_channel.rb
class ChessChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chess_game_#{params[:id]}"
  end

  def get_game_state
    game = find_game
    return transmit_error('Game not found') unless game

    transmit_game_state(game)
  rescue StandardError => e
    transmit_error(e.message)
  end

  private

  def find_game
    Game.find_by(id: params[:id])
  end

  def transmit_game_state(game)
    transmit({
      type: 'game_state_update',
      payload: game.as_json(include: :players)
    })
  end

  def transmit_error(message)
    transmit({ type: 'error', message: message })
  end
end