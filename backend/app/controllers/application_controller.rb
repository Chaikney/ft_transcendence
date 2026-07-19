class ApplicationController < ActionController::API
  
  before_action :authorize_request
  before_action :sweep_afk_games
  before_action :set_no_cache_headers

  private

  def authorize_request
    # 1. Miramos si en la petición el frontend nos ha enviado el token en la cabecera 'Authorization'
    header = request.headers['Authorization']
    header = header.split(' ').last if header
    
    begin
      # 2. Desencriptamos el token usando la misma llave secreta con la que lo creamos
      decoded = JWT.decode(header, Rails.application.secret_key_base)[0]
      
      # 3. Buscamos al usuario en la base de datos usando el ID que venía escondido en el token
      @current_user = User.find(decoded['user_id'])

      # 🛑 EL MURO: Si está baneado, bloqueamos cualquier petición al instante
      if @current_user.banned?
        render json: { error: 'You are banned' }, status: :forbidden
        return
      end
      
    rescue ActiveRecord::RecordNotFound, JWT::DecodeError
      # Si el token es falso, ha caducado o está mal escrito, le damos un portazo
      render json: { errors: 'Acceso denegado. Token inválido o no proporcionado.' }, status: :unauthorized
    end
  end

  def set_no_cache_headers
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Sat, 01 Jan 2000 00:00:00 GMT"
  end

  def sweep_afk_games
    Game.check_afk_timeouts
  rescue => e
    #Rails.logger.error "Error en la guadaña AFK: #{e.message}"
  end
end
