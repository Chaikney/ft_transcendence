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
      
      # 1º Filtro: Comprobamos el email y la contraseña (Bcrypt)
      if user && user.authenticate(params[:password])
        
        # 2º Filtro: Autenticación en 2 Pasos (ROTP)
        totp = ROTP::TOTP.new(user.otp_secret)
        
        # Comprobamos si el código de 6 dígitos que envió el usuario es válido
        if totp.verify(params[:totp_code])
          token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
          render json: { user: user, token: token }, status: :ok
        else
          # Falló el código del móvil
          render json: { error: 'Código 2FA incorrecto o caducado' }, status: :unauthorized
        end
        
      else
        # Falló el email o la contraseña
        render json: { error: 'Credenciales inválidas' }, status: :unauthorized
      end
    end

    private

    def user_params
      params.permit(:username, :email, :password)
    end
  end
end