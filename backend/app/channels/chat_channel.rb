class ChatChannel < ApplicationCable::Channel
  def subscribed
    stream_from "chat_global"
  end

  def send_message(data)
    # 1. Buscamos la sala o creamos la 'global' por defecto
    # Usamos room_id enviado desde el front, o 'global' si no existe
    room = Room.find_or_create_by(name: data['room_id'] || 'global')
    
    # 2. Creamos el mensaje en la base de datos
    message = Message.create!(
      room: room,
      sender: current_user, # Gracias a Connection.rb, tenemos current_user
      content: data['content'],
      read: false
    )

    # 3. Enviamos el mensaje real (con su ID de BD) a todos
    ActionCable.server.broadcast("chat_global", {
      type: 'message_received',
      message: {
        id: message.id,
        content: message.content,
        sender_id: current_user.id,
        sender: current_user.username,
        room_id: room.name,
        created_at: message.created_at,
        read: message.read
      }
    })
  end

  def unsubscribed
    # Limpieza si fuera necesaria
  end
end