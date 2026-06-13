module Api
  class AuthController < ::ApplicationController
    
    # Permite usar estas rutas sin tener token previo
    skip_before_action :authorize_request, only: [:login, :register]

    # Necesitamos incluir esto para poder generar la URL completa de la imagen
    include Rails.application.routes.url_helpers
    
    # --- REGISTRO ---
    def register
      user = User.new(user_params)
      
      if user.save
        # Al registrarse, fabricamos el token y LE ENSEÑAMOS EL SECRETO al frontend
        # Usamos el servicio limpio
        token = JwtService.encode( user_id: user.id)
        
        render json: { 
          user: user_data_with_avatar(user), 
          token: token, 
          otp_secret: user.otp_secret # <- La QR para el frontend
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
        if params[:totp_code].present? && totp.verify(params[:totp_code])
          token = JwtService.encode(user_id: user.id)
          render json: { user: user_data_with_avatar(user), token: token }, status: :ok
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
      params.permit(:username, :email, :password, :avatar)
    end

    def user_data_with_avatar(user) {
      id:user.id,
      username: user.username,
      email: user.email,
      elo: user.elo,
      avatar_url: user.avatar.attached? ? url_for(user.avatar) : "https://api.dicebear.com/7.x/bottts/png?seed=#{user.username}&colors=black,gray" 
    }
    end
  end
end