class ChatChannel < ApplicationCable::Channel
  def subscribed
    # Nos aseguramos de que el frontend nos pasa el ID del amigo
    reject unless params[:friend_id]

    # Ordenamos los IDs para que la sala siempre se llame igual sin importar quién hable a quién
    user1 = [current_user.id, params[:friend_id].to_i].min
    user2 = [current_user.id, params[:friend_id].to_i].max
    
    room_name = "chat_#{user1}_#{user2}"
    
    # Enganchamos al usuario a su sala privada
    stream_from room_name
  end

  def unsubscribed
    # Cualquier limpieza necesaria al desconectar
  end
end