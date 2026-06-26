module Api
  class AuthController < ::ApplicationController
    
    # --- REGISTRO ---
    def register
      user = User.new(user_params)
      
      # 👇 INYECCIÓN 2FA: Le metemos la semilla ANTES de guardarlo
      user.otp_secret = ROTP::Base32.random if user.otp_secret.blank?
      
      if user.save
        token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
        
        render json: { 
          user: user, 
          token: token, 
          otp_secret: user.otp_secret 
        }, status: :created
      else
        # Si Rails hace ROLLBACK, imprimimos el error en la consola para verlo claro
        Rails.logger.error "🚨 ERROR AL CREAR USUARIO: #{user.errors.full_messages}"
        
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # --- LOGIN CON 2FA ---
    # --- LOGIN CON 2FA ---
    def login
      # 1. Buscamos por USERNAME en lugar de email
      user = User.find_by(username: params[:username])
      
      # 2. Comprobamos usuario y contraseña
      if user && user.authenticate(params[:password])
        
        # 3. VERIFICACIÓN CONDICIONAL: Solo si tiene el 2FA activado
        if user.mfa_enabled?
          # Si no envía nada, le decimos que lo necesitamos
          if params[:totp_code].blank?
            render json: { error: 'Se requiere código 2FA', require_2fa: true }, status: :unauthorized
            return
          end

          # Si envía código, lo verificamos
          totp = ROTP::TOTP.new(user.otp_secret)
          unless totp.verify(params[:totp_code])
            render json: { error: 'Código 2FA incorrecto o caducado' }, status: :unauthorized
            return
          end
        end

        # 4. Si NO tiene MFA activado, o si lo tiene y el código es correcto, entra.
        token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
        render json: { user: user, token: token }, status: :ok
        
      else
        # 🚨 TU MENSAJE DE ERROR PERSONALIZADO
        render json: { error: '¡usuario o contraseña no validas!!!' }, status: :unauthorized
      end
    end

    private

    def user_params
      params.permit(:username, :email, :password)
    end
  end
end