require 'net/http'
require 'uri'
require 'json'

module Api
  class AuthController < ::ApplicationController
    
    skip_before_action :authorize_request, only: [:login, :register, :verify_email]
    
    # --- REGISTRO ---
    
    def register
      desired_username = user_params[:username].to_s.downcase

      # 🔵 DEFENSA: ¿El nombre le pertenece a un alumno de 42?
      if intra_student_exists?(desired_username)
        # 🛡️ FIX: Devolvemos 200 OK para no pintar la consola de rojo
        render json: { 
          ok: false,
          error: "Este nombre está reservado para un estudiante de 42. Si eres tú, inicia sesión con Intra." 
        }, status: :ok
        return
      end

      user = User.new(user_params)
      user.otp_secret = ROTP::Base32.random if user.otp_secret.blank?
      
      if user.save
        UserMailer.with(user: user).confirmation_email.deliver_now
        
        render json: { 
          ok: true,
          message: "Identidad registrada en la base de datos. Se ha enviado un enlace de verificación a tu correo. Revísalo para activar tu cuenta.",
          user: { username: user.username, email: user.email }
        }, status: :created
      else
        # 🛡️ FIX: Atrapamos el error de validación (ej. nombre repetido) y damos 200 OK
        # Ocultamos el log rojo del servidor también
        render json: { 
          ok: false, 
          error: user.errors.full_messages.first # Mandamos solo el primer error para que sea limpio
        }, status: :ok
      end
    end

    # --- LOGIN CON 2FA Y VERIFICACIÓN DE EMAIL ---
    def login
      user = User.find_by(username: params[:username])
      
      if user && user.authenticate(params[:password])
        
        if user.confirmed_at.nil?
          # 🛡️ FIX: 200 OK
          render json: { ok: false, error: 'Debes verificar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' }, status: :ok
          return
        end
        
        if user.mfa_enabled?
          if params[:totp_code].blank?
            render json: { ok: false, error: 'Se requiere código 2FA', require_2fa: true }, status: :ok
            return
          end

          totp = ROTP::TOTP.new(user.otp_secret)
          unless totp.verify(params[:totp_code])
            render json: { ok: false, error: 'Código 2FA incorrecto o caducado' }, status: :ok
            return
          end
        end

        token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base)
        render json: { ok: true, user: user, token: token }, status: :ok
        
      else
        # 🛡️ FIX: 200 OK
        render json: { ok: false, error: '¡Usuario o contraseña no válidas!' }, status: :ok
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

    # 🛠️ Método privado que consulta a la API de 42
    def intra_student_exists?(username)
      # ⚠️ Asegúrate de tener estas variables en tu archivo .env
      client_id = ENV['UID_42']
      client_secret = ENV['SECRET_42']

      return false unless client_id && client_secret

      # 1. Pedir Token de Aplicación a 42
      token_uri = URI.parse("https://api.intra.42.fr/oauth/token")
      token_res = Net::HTTP.post_form(token_uri, {
        'grant_type' => 'client_credentials',
        'client_id' => client_id,
        'client_secret' => client_secret
      })

      return false unless token_res.is_a?(Net::HTTPSuccess)
      token = JSON.parse(token_res.body)['access_token']

      # 2. Preguntar a 42 si existe un usuario con ese login
      user_uri = URI.parse("https://api.intra.42.fr/v2/users/#{username}")
      request = Net::HTTP::Get.new(user_uri)
      request['Authorization'] = "Bearer #{token}"

      response = Net::HTTP.start(user_uri.hostname, user_uri.port, use_ssl: true) do |http|
        http.request(request)
      end

      # Si devuelve 200, el estudiante existe. Bloqueamos el registro.
      response.code.to_i == 200
    rescue => e
      # Si la API de 42 se cae, permitimos el registro (fail-open) o lo denegamos.
      # Por ahora lo dejamos en false para no bloquear a la gente si Intra falla.
      Rails.logger.error "🚨 Error al consultar la API de 42: #{e.message}"
      false
    end
  end
end