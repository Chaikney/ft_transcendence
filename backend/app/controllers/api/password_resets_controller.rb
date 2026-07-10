module Api
  class PasswordResetsController < ApplicationController
    # Desactiva tu filtro de autenticación si tienes uno global. 
    # Sustituye :authorize_request por el nombre que uses tú, o bórralo si no te hace falta.
    skip_before_action :authorize_request, only: [:create, :update], raise: false 

    # POST /api/password_resets
    def create
      user = User.find_by(email: params[:email])
      
      if user
        user.generate_password_reset_token
        UserMailer.password_reset(user).deliver_now
      end
      
      # 🛡️ TRUCO DE SEGURIDAD: Siempre decimos "OK", exista o no el email.
      # Así evitamos que los atacantes usen esto para descubrir qué emails están registrados.
      render json: { message: "Si el correo existe en nuestro sistema, recibirás un enlace de recuperación." }, status: :ok
    end

    # PATCH /api/password_resets/:token
    def update
      user = User.find_by(reset_password_token: params[:token])
      
      if user && user.password_reset_valid?
        if user.update(password: params[:password], reset_password_token: nil, reset_password_sent_at: nil)
          render json: { message: "Contraseña actualizada con éxito." }, status: :ok
        else
          render json: { error: user.errors.full_messages }, status: :unprocessable_entity
        end
      else
        render json: { error: "El enlace es inválido o ha caducado." }, status: :unprocessable_entity
      end
    end
  end
end