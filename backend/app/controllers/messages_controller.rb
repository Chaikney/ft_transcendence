module Api
  class MessagesController < ApplicationController
    # Activamos tu guardia de seguridad
    before_action :authorize_request 

    def create
      receiver = User.find_by(id: params[:receiver_id])

      # Si el usuario intenta hablar con alguien que no existe, cortamos
      return render json: { error: 'Usuario no encontrado' }, status: :not_found unless receiver

      # --- PARCHE DE BLOQUEOS (DENTRO DEL MÉTODO) ---
      # 1. Comprobamos si el receptor me tiene bloqueado a mí
      if receiver.active_blocks.exists?(blocked_id: @current_user.id)
        return render json: { error: 'No puedes enviar mensajes a este usuario.' }, status: :forbidden
      end

      # 2. Comprobamos si yo tengo bloqueado al receptor (tampoco debería poder hablarle)
      if @current_user.active_blocks.exists?(blocked_id: receiver.id)
        return render json: { error: 'Tienes a este usuario bloqueado. Desbloquéalo para hablar.' }, status: :forbidden
      end
      # ----------------------------------------------

      # Construimos el mensaje asociado al usuario que lo envía
      message = @current_user.sent_messages.build(receiver: receiver, content: params[:content])

      if message.save
        # 1. Calculamos el nombre de la sala igual que en el ChatChannel
        user1 = [@current_user.id, receiver.id].min
        user2 = [@current_user.id, receiver.id].max
        room_name = "chat_#{user1}_#{user2}"

        # 2. Disparamos el mensaje por el tubo WebSocket para el frontend
        ActionCable.server.broadcast(room_name, {
          id: message.id,
          sender_id: message.sender_id,
          receiver_id: message.receiver_id,
          content: message.content,
          created_at: message.created_at
        })

        # 3. Respondemos al que hizo el POST con éxito
        render json: message, status: :created
      else
        # Si falla (por ejemplo, mandan un mensaje vacío)
        render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    # Ruta para cargar el historial de mensajes de un chat
    def index
      friend_id = params[:friend_id]
      
      # Buscamos los mensajes donde el usuario es remitente y el amigo receptor, o viceversa
      messages = Message.where(
        "(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)", 
        @current_user.id, friend_id, friend_id, @current_user.id
      ).order(created_at: :asc)

      render json: messages, status: :ok
    end
  end
end