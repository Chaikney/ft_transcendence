class GameChannel < ApplicationCable::Channel
  def subscribed
    stream_from stream_name
  end

  def self.broadcast_move_updated(game_id, payload)
    ActionCable.server.broadcast("game_#{game_id}", {
      type: 'move_updated',
      game: payload
    })
  end

  private

  def stream_name
    "game_#{params[:game_id]}"
  end
end