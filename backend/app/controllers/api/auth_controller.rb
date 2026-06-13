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
        # Al registrarse, fabricamos el token. 
        # Ya NO enviamos el otp_secret. Si el usuario quiere 2FA, usará la ruta del TwoFactorController.
        token = JwtService.encode(user_id: user.id)
        
        render json: { 
          user: user_data_with_avatar(user), 
          token: token
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
        
        # --- INTERCEPCIÓN 2FA ---
        # Solo comprobamos el código si este usuario en concreto ha decidido encender el 2FA
        if user.otp_enabled?
          # Si Manu no manda el PIN en la petición, le decimos a React que saque el pop-up
          if params[:totp_code].blank?
            return render json: { 
              message: "Contraseña correcta. Se requiere código 2FA.", 
              requires_2fa: true 
            }, status: :accepted
          end

          # Si manda el PIN, sacamos la calculadora criptográfica
          totp = ROTP::TOTP.new(user.otp_secret)
          
          unless totp.verify(params[:totp_code])
            return render json: { error: 'Código 2FA incorrecto o caducado' }, status: :unauthorized
          end
        end
        # ------------------------

        # Si llegamos aquí: o el usuario no tiene 2FA activado, o metió el PIN correcto
        token = JwtService.encode(user_id: user.id)
        render json: { user: user_data_with_avatar(user), token: token }, status: :ok
        
      else
        # Falló el email o la contraseña
        render json: { error: 'Credenciales inválidas' }, status: :unauthorized
      end
    end

    private

    def user_params
      params.permit(:username, :email, :password, :avatar)
    end

    # La sintaxis de Ruby corregida para devolver el Hash
    def user_data_with_avatar(user) 
      {
        id: user.id,
        username: user.username,
        email: user.email,
        elo: user.elo,
        avatar_url: user.avatar.attached? ? url_for(user.avatar) : "https://api.dicebear.com/7.x/bottts/png?seed=#{user.username}&colors=black,gray" 
      }
    end
  end
end