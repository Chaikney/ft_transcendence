module Api
  class AdminController < ApplicationController
    # Usamos el mismo método que en tus otros controladores
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

      if user.username == 'nkrasimi'
         return render json: { error: "No puedes borrar al usuario raíz" }, status: :forbidden
      end

      if user.destroy
        # 🚀 MISIL EN TIEMPO REAL: Expulsión definitiva de la pantalla
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

      if user.username == 'nkrasimi'
        return render json: { error: "No puedes banear al usuario raíz" }, status: :forbidden
      end

      # Invertimos el estado (toggle)
      new_status = !user.banned 

      if user.update(banned: new_status)
        estado = new_status ? "BANEADO" : "DESBANEADO"
        
        # 🚀 MISIL EN TIEMPO REAL: Avisamos al frontend
        if new_status
          # Si lo baneamos, lanzamos la pantalla roja
          ActionCable.server.broadcast("appearance_global", { type: 'banned', user_id: user.id })
        else
          # Si lo desbaneamos, le quitamos la pantalla roja para que siga navegando
          ActionCable.server.broadcast("appearance_global", { type: 'unbanned', user_id: user.id })
        end

        render json: { message: "El usuario #{user.username} ahora está #{estado}" }, status: :ok
      else
        render json: { error: "Error al actualizar estado" }, status: :unprocessable_entity
      end
    end

    private

    def authenticate_admin!
      # La regla de oro: O tienes role 1, o eres nkrasimi
      unless @current_user.role == 1 || @current_user.username == 'nkrasimi'
        render json: { error: 'Acceso no autorizado' }, status: :forbidden
      end
    end
  end
end