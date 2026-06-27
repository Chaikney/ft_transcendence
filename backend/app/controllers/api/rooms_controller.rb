module Api
  class RoomsController < ApplicationController
    # Asumo que tienes un método de autenticación, ej: before_action :authenticate_user!
    
    def index
      # Devolvemos solo las salas en las que el usuario actual es miembro
      rooms = current_user.rooms
      
      render json: rooms.as_json(
        include: { 
          participants: { only: [:id, :username] } 
        }
      )
    end
  end
end