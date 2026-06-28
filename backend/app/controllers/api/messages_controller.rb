module Api
  class MessagesController < ApplicationController
    before_action :authorize_request
    
    def index
      room = @current_user.rooms.find_by!(id: params[:room_id])
      
      # .last(50) toma los últimos registros y los mantiene en orden ascendente de tiempo
      messages = room.messages.order(created_at: :asc).last(50)
      
      # 3. RENDER: Incluimos el sender. 
      render json: messages.as_json(
        include: { sender: { only: [:id, :username] } }
      )
    end
  end
end