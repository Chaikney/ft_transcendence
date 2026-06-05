class ApplicationController < ActionController::API
  
  def authorize_request
    # 1. Miramos si en la petición el frontend nos ha enviado el token en la cabecera 'Authorization'
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    begin
      # 2. Desencriptamos el token usando la misma llave secreta con la que lo creamos
      decoded = JWT.decode(header, Rails.application.secret_key_base)[0]
      
      # 3. Buscamos al usuario en la base de datos usando el ID que venía escondido en el token
      @current_user = User.find(decoded['user_id'])
      
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      # Si el token es falso, ha caducado o está mal escrito, le damos un portazo
      render json: { errors: 'Acceso denegado. Token inválido o no proporcionado.' }, status: :unauthorized
    end
  end

end