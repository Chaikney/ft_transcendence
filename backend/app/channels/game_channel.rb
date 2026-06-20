class GameChannel < ApplicationCable::Channel
  def subscribed
    # Si el frontend envía 'chess-001', el params[:game_id] debe existir.
    # Asegúrate de que el canal use el ID correcto.
    stream_from "game_channel_#{params[:game_id]}"
  end
end