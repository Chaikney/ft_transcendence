module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      ticket = request.params[:ticket]

      if ticket.present?
        # Leemos el ID del usuario desde la caché usando el ticket
        cache_key = "action_cable_ticket:#{ticket}"
        user_id = Rails.cache.read(cache_key)

        if user_id
          # 💥 GUILLOTINA: Borramos el ticket inmediatamente para que sea de un solo uso
          Rails.cache.delete(cache_key)

          if verified_user = User.find_by(id: user_id)
            return verified_user
          end
        end
      end

      # Rechazamos si no hay ticket o si ya expiró / fue usado
      reject_unauthorized_connection
    end
  end
end