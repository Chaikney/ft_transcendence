module Api
  class MessagesController < ApplicationController
    # Asegúrate de tener esto, asumiendo que usas Devise o similar
    before_action :authenticate_user! 
    
    def index
      # 1. SEGURIDAD: Solo buscamos en las salas a las que el usuario actual tiene acceso
      room = current_user.rooms.find_by!(name: params[:room_id])
      
      # 2. LÓGICA: Obtenemos los últimos 50 mensajes (los más recientes)
      # .last(50) toma los últimos registros y los mantiene en orden ascendente de tiempo
      messages = room.messages.order(created_at: :asc).last(50)
      
      # 3. RENDER: Incluimos el sender. 
      # No necesitas 'methods: [:sender]' si ya lo estás incluyendo en 'include'
      render json: messages.as_json(
        include: { sender: { only: [:id, :username] } }
      )
    end
  end
end