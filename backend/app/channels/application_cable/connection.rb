module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # 1. Intento principal (Devise/Warden)
      if env['warden']&.user
        return env['warden'].user
      end

      # 2. Hack para desarrollo: Si estamos en modo desarrollo y no hay usuario, 
      # tomamos al primer usuario de la base de datos para no bloquear el flujo.
      if Rails.env.development? && User.any?
        Rails.logger.warn "--- WARNING: No session found, using User.first as fallback ---"
        return User.first
      end

      # 3. Si no hay nada, rechazamos
      reject_unauthorized_connection
    end
  end
end