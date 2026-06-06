module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      # === BYPASS TEMPORAL PARA EL FRONTEND ===
      self.current_user = "Jugador_Prueba_Local"
      
      # === SEGURIDAD ORIGINAL (Desactivada temporalmente) ===
      # self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # Cogemos el token de la URL que pusimos en Insomnia
      token = request.params[:token]
      
      begin
        # Lo desencriptamos igual que en tu AuthController
        decoded_token = JWT.decode(token, Rails.application.credentials.secret_key_base)[0]
        user = User.find(decoded_token['user_id'])
        return user if user
      rescue
        # Si el token es falso o no hay token, le cerramos la puerta
        reject_unauthorized_connection
      end
    end
  end
end
