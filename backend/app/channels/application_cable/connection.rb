module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      
      # Si no hay token en la URL, cortamos rápido
      reject_unauthorized_connection unless token
      
      begin
        # Usamos el servicio limpio en lugar de hacerlo a pelo
        decoded_token = JwtService.decode(token)
        user = User.find(decoded_token[:user_id] || decoded_token['user_id'])
        
        return user if user
      rescue
        # Si el token es falso o caducó, cerramos la puerta
        reject_unauthorized_connection
      end
    end
  end
end