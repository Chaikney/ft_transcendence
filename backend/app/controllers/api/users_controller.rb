module Api
  class UsersController < ApplicationController
    # El guardia pide el Token a TODOS
    before_action :authorize_request 

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
    def destroy      @current_user.destroy
      render json: { message: "Cuenta eliminada permanentemente del sistema" }, status: :ok
    end

    private

    # El Escudo (Strong Parameters)
    def user_params
      params.require(:user).permit(:username, :email, :password)
    end
  end
end