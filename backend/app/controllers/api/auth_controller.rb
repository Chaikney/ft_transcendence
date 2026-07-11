require 'net/http'
require 'uri'
require 'json'


module Api
  class AuthController < ::ApplicationController
    
    skip_before_action :authorize_request, only: [:login, :register, :verify_email]
    
    # --- REGISTRO ---
    
    def register
      user = User.new(user_params)

      user.otp_secret = ROTP::Base32.random if user.otp_secret.blank?
      
      if user.save
        
        UserMailer.with(user: user).confirmation_email.deliver_now
        
        # 🛡️ CERRAR LA PUERTA: Ya NO damos el token JWT aquí. 
        # Tienen que ir a su email, verificar, y luego hacer login.
        render json: { 
          message: "Identidad registrada en la base de datos. Se ha enviado un enlace de verificación a tu correo. Revísalo para activar tu cuenta.",
          user: { username: user.username, email: user.email }
        }, status: :created
      else
        # Si Rails hace ROLLBACK, imprimimos el error en la consola para verlo claro
        Rails.logger.error "🚨 ERROR AL CREAR USUARIO: #{user.errors.full_messages}"
        
        render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # --- LOGIN CON 2FA Y VERIFICACIÓN DE EMAIL ---
    def login
      # 1. Buscamos por USERNAME en lugar de email
      user = User.find_by(username: params[:username])
      
      # 2. Comprobamos usuario y contraseña
      if user && user.authenticate(params[:password])
        
        # 🛡️ 2.5 LA BARRERA DE VERIFICACIÓN (NUEVO)
        if user.confirmed_at.nil?
          render json: { error: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' }, status: :unauthorized
          return
        end
        
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

    # POST /api/verify-email
    def verify_email
      user = User.find_by(confirmation_token: params[:token])

      if user
        user.update(confirmed_at: Time.current, confirmation_token: nil)
        render json: { message: "¡Identidad verificada con éxito! El vacío te da la bienvenida." }, status: :ok
      else
        render json: { error: "Enlace de verificación inválido o caducado." }, status: :unprocessable_entity
      end
    end

    private

    def user_params
      params.permit(:username, :email, :password)
    end
  end
end