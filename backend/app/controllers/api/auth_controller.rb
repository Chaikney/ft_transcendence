module Api
  class AuthController < ::ApplicationController
    
    # --- REGISTRO ---
    def register
      user = User.new(user_params)
      
      if user.save
        # Al registrarse, fabricamos el token y LE ENSEÑAMOS EL SECRETO al frontend
        # para que tu compañero pueda pintar un Código QR en pantalla.
        token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
        
        render json: { 
          user: user, 
          token: token, 
          otp_secret: user.otp_secret # <- Esto es lo que necesita el frontend para el QR
        }, status: :created
      else
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # --- LOGIN CON 2FA ---
    def login
      user = User.find_by(email: params[:email])
      
      if user && user.authenticate(params[:password])
        # Entras directo, sin pedir el código del móvil
        token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
        render json: { user: user, token: token }, status: :ok
      else
        render json: { error: 'Credenciales inválidas' }, status: :unauthorized
      end
    end
    end

    private

    def user_params
      params.permit(:username, :email, :password)
    end

    def me
      # @current_user ya existe gracias a tu authorize_request
      render json: { 
        id: @current_user.id, 
        username: @current_user.username, 
        admin: @current_user.admin 
      }, status: :ok
    end
  end
end