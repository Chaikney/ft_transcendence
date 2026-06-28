class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_global"
  end

  def send_message(data)
    # Buscamos la sala por el ID que viene del frontend. 
    # Si viene nil, por defecto usamos el 1 (Global).
    target_id = data['room_id'] || 1
    room = Room.find(target_id)
    
    # Creamos el mensaje asociado a la sala correcta
    message = Message.create!(
      room: room,
      sender: current_user,
      content: data['content'],
      read: false
    )

    # Enviamos el broadcast usando el ID de la sala
    ActionCable.server.broadcast("chat_global", {
      type: 'message_received',
      message: {
        id: message.id,
        content: message.content,
        sender_id: current_user.id,
        sender: current_user.username,
        room_id: room.id.to_s, # Siempre enviamos el ID como string
        created_at: message.created_at,
        read: message.read
      }
    })
  end

  def typing_start(data)
    ActionCable.server.broadcast("chat_global", {
      type: 'typing_start',
      room_id: data['room_id'],
      username: current_user.username
    })
  end

  def typing_stop(data)
    ActionCable.server.broadcast("chat_global", {
      type: 'typing_stop',
      room_id: data['room_id'],
      username: current_user.username
    })
  end
end