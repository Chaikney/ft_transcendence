module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # 1. Buscamos el token JWT que nos manda React por la URL (?token=...)
      token = request.params[:token]

      if token.present?
        begin
          # Descodificamos el token para sacar el user_id.
          # Nota: Si en tu proyecto usáis una clave secreta distinta para el JWT, cámbiala aquí.
          decoded_token = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: 'HS256' })
          user_id = decoded_token[0]['user_id']

          if verified_user = User.find_by(id: user_id)
            return verified_user
          end
        rescue JWT::DecodeError
          Rails.logger.error "🚨 WebSockets Auth Failed: Token inválido o expirado"
        end
      end

      # 2. Intento secundario (Devise/Warden) por si alguna vista de Rails lo necesita
      if env['warden']&.user
        return env['warden'].user
      end

      # 3. Si no hay token, o es inválido, RECHAZAMOS LA CONEXIÓN. (¡Se acabó el hack del User.first!)
      reject_unauthorized_connection
    end
  end
end
