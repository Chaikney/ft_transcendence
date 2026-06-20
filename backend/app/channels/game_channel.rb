# backend/app/channels/game_channel.rb
class GameChannel < ApplicationCable::Channel
  def subscribed
    stream_from "game_channel_#{params[:id]}"
  end
end