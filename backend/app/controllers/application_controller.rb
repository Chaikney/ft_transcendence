class ApplicationController < ActionController::API
  # Esto permite que otros controladores usen @current_user fácilmente
  attr_reader :current_user

  # Ruta de prueba para verificar la conexión con el frontend
  def test
    render json: { message: "¡Backend conectado con éxito!" }
  end

  protected

  def authorize_request
    header = request.headers['Authorization']
    token = header.to_s.split(' ').last

    begin
      # Desencriptamos el token (usando la llave secreta base de Rails)
      decoded = JWT.decode(token, Rails.application.secret_key_base, true, { algorithm: 'HS256' })[0]
      
      # Buscamos al usuario en la base de datos
      @current_user = User.find(decoded['user_id'])
      
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound, JWT::ExpiredSignature
      render json: { errors: 'Acceso denegado. Token inválido o expirado.' }, status: :unauthorized
    end
  end
end