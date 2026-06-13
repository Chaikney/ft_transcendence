module Api
  class UsersController < ApplicationController
    # El guardia pide el Token a TODOS
    before_action :authorize_request 

    # --- PERFILES PÚBLICOS Y BUSCADOR ---

    # Operación de Búsqueda (GET /api/users)
    def index
      if params[:query].present?
        # Busca coincidencias ignorando mayúsculas/minúsculas
        users = User.where("username ILIKE ?", "%#{params[:query]}%")
      else
        users = User.all
      end
      
      # Retornamos los usuarios pero ocultamos datos sensibles
      render json: users.as_json(except: [:password_digest, :email]), status: :ok
    end

    # Ver a otro jugador (GET /api/users/:id)
    def show
      user = User.find_by(id: params[:id])
      
      if user
        render json: user.as_json(except: [:password_digest, :email]), status: :ok
      else
        render json: { error: 'Usuario en las sombras (No encontrado)' }, status: :not_found
      end
    end

    # --- GESTIÓN DE MI PERFIL ---

    # Operación de Lectura (GET /api/profile)
    def profile
      render json: @current_user, status: :ok
    end

    # Operación de Actualización (PUT /api/profile)
    def update
      if @current_user.update(user_params)
        render json: { message: "Identidad actualizada", user: @current_user }, status: :ok
      else
        render json: { errors: @current_user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # Operación de Destrucción (DELETE /api/profile)
    def destroy
      @current_user.destroy
      render json: { message: "Cuenta eliminada permanentemente del sistema" }, status: :ok
    end

    private

    # El Escudo (Strong Parameters)
    def user_params
      params.require(:user).permit(:username, :email, :password)
    end
  end
end