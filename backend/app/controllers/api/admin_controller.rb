module Api
  class AdminController < ApplicationController
    before_action :authorize_request 
    before_action :authenticate_admin!

    # GET /api/admin/users (Ver todos)
    def index
      users = User.order(:id).select(:id, :username, :email, :role, :status, :banned)
      render json: users, status: :ok
    end

    # DELETE /api/admin/users/:id
    def destroy
      user = User.find(params[:id])
      
      if user == @current_user
        return render json: { error: "No puedes borrarte a ti mismo" }, status: :unprocessable_entity
      end

      # 🛡️ BLINDAJE: Nadie puede decapitar a otro administrador
      if user.admin?
         return render json: { error: "Operación denegada: No puedes borrar a otro administrador" }, status: :forbidden
      end

      if user.destroy
        ActionCable.server.broadcast("appearance_global", { type: 'banned', user_id: user.id })
        
        render json: { message: "Usuario #{user.username} eliminado del sistema" }, status: :ok
      else
        render json: { error: "Error al intentar borrar el usuario" }, status: :unprocessable_entity
      end
    end

    # PATCH /api/admin/users/:id/ban
    def ban 
      user = User.find(params[:id])

      if user == @current_user
        return render json: { error: "No puedes banearte a ti mismo" }, status: :unprocessable_entity
      end

      if user.admin?
        return render json: { error: "Operación denegada: No puedes banear a otro administrador" }, status: :forbidden
      end

      # Invertimos el estado (toggle)
      new_status = !user.banned 

      if user.update(banned: new_status)
        estado = new_status ? "BANEADO" : "DESBANEADO"
        
        if new_status
          # 1. Avisamos a todo el mundo (para que le pongan el circulito rojo, etc)
          ActionCable.server.broadcast("appearance_global", { type: 'banned', user_id: user.id })
          
          # 🚀 2. EL MISIL PRIVADO: Golpea directamente a su pantalla para estampar el mensaje rojo
          ActionCable.server.broadcast("user_#{user.id}", { type: 'account_banned' })
        else
          # 1. Avisamos a todo el mundo de que vuelve a estar vivo
          ActionCable.server.broadcast("appearance_global", { type: 'unbanned', user_id: user.id })
          
          # 🩹 2. (Opcional pero brutal) Si está mirando la pantalla roja, le devolvemos a la vida en vivo
          ActionCable.server.broadcast("user_#{user.id}", { type: 'account_unbanned' })
        end

        render json: { message: "El usuario #{user.username} ahora está #{estado}" }, status: :ok
      else
        render json: { error: "Error al actualizar estado" }, status: :unprocessable_entity
      end
    end

    private

    def authenticate_admin!
      # Solo nkrasimi y gcassi-d pueden pasar. Los demás, al hoyo.
      unless ["nkrasimi", "gcassi-d"].include?(@current_user.username)
        render json: { 
          error: 'ERR_UNAUTHORIZED: Acceso denegado',
          message: 'Tu intento de brecha ha sido registrado.'
        }, status: :forbidden
      end
    end
  end
end