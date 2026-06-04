class GameChannel < ApplicationCable::Channel
  # Cuando el frontend se conecta, se suscribe a una sala específica
  def subscribed
    # Ej: "game_7" si el game_id es 7
    stream_from "game_#{params[:game_id]}"
  end

  def unsubscribed
    # Aquí puedes limpiar cosas si el usuario se desconecta
  end

  # Este método es el que el frontend llamará cuando mueva una ficha
  def play_move(data)
    # Mandamos la información al Service para que haga la magia
    GameService.process_chess_move(params[:game_id], data)
  end
end