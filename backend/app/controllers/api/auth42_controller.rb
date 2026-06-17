require 'net/http'
require 'uri'
require 'json'

module Api
  class Auth42Controller < ::ApplicationController
    # Saltamos la seguridad porque aquí vienen a por la llave, no la tienen aún
    skip_before_action :authorize_request

    def callback
      # 1. Manu nos envía el código que le ha dado 42
      code = params[:code]
      return render json: { error: 'Falta el código de autorización' }, status: :bad_request unless code

      # 2. Intercambiamos el código por el Access Token de 42
      token_response = fetch_42_token(code)
      return render json: { error: 'Fallo al autenticar con 42' }, status: :unauthorized unless token_response['access_token']

      # 3. Pedimos los datos del usuario a 42 usando ese Token
      user_info = fetch_42_user_info(token_response['access_token'])
      return render json: { error: 'No se pudieron obtener los datos del usuario' }, status: :unauthorized unless user_info['email']

      # 4. Buscamos si el usuario ya existe en nuestra BD. Si no, lo creamos.
      user = User.find_or_initialize_by(email: user_info['email'])
      
      if user.new_record?
        user.username = user_info['login']
        # Le inventamos una contraseña indescifrable porque entra por 42
        user.password = SecureRandom.hex(16) 
        user.save!
      end

      # 5. Generamos NUESTRO token JWT para que pueda jugar (igual que en el Auth normal)
      token = JwtService.encode(user_id: user.id)

      render json: {
        message: "Autenticación con 42 exitosa",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          elo: user.elo
        },
        token: token
      }, status: :ok
    end

    private

    def fetch_42_token(code)
      uri = URI('https://api.intra.42.fr/oauth/token')
      res = Net::HTTP.post_form(uri, 
        'grant_type' => 'authorization_code',
        'client_id' => ENV['UID_42'],
        'client_secret' => ENV['SECRET_42'],
        'code' => code,
        'redirect_uri' => ENV['REDIRECT_URI_42']
      )
      JSON.parse(res.body)
    rescue
      {}
    end

    def fetch_42_user_info(access_token)
      uri = URI('https://api.intra.42.fr/v2/me')
      req = Net::HTTP::Get.new(uri)
      req['Authorization'] = "Bearer #{access_token}"
      
      res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(req)
      end
      JSON.parse(res.body)
    rescue
      {}
    end
  end
end