module Api
  class AdminController < ApplicationController
    # Asegúrate de que el usuario está logueado y es admin
    before_action :authenticate_user! 
    before_action :authenticate_admin!

    # GET /api/admin/users (Ver todos)
    def index
      users = User.all
      render json: users, status: :ok
    end

    def destroy
      user = User.find(params[:id])
      
      # Evita que el admin se borre a sí mismo por accidente
      if user == current_user
        return render json: { error: "No puedes borrarte a ti mismo" }, status: :unprocessable_entity
      end

      if user.destroy
        render json: { message: "Usuario #{user.username} eliminado de la base de datos" }, status: :ok
      else
        render json: { error: "Error al intentar borrar el usuario" }, status: :unprocessable_entity
      end
    end

    # PATCH /api/admin/users/:id/ban (Banear/Desbanear perfil)
    def ban 
      user = User.find(params[:id])

      if user == current_user
        return render json: { error: "No puedes banearte a ti mismo" }, status: :unprocessable_entity
      end


      # Invertimos el estado (si estaba baneado lo desbanea, y viceversa)
      new_status = !user.banned 

      if user.update(banned: new_status)
        estado = new_status ? "BANEADO" : "DESBANEADO"
        render json: { message: "El usuario #{user.username} ahora está #{estado}" }, status: :ok
      else
        render json: { error: "Error al intentar actualizar el estado de baneo" }, status: :unprocessable_entity
      end
    end

    private

    def authenticate_admin!
      unless current_user&.admin?
        render json: { error: 'Acceso no autorizado' }, status: :forbidden
      end
    end
  end
end

