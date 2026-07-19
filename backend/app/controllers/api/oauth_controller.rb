require 'net/http'
require 'uri'

module Api
  class OauthController < ApplicationController
    skip_before_action :verify_authenticity_token, raise: false
    skip_before_action :authorize_request, only: [:callback_42]

    def callback_42
      code = params[:code]

      token_response = exchange_code_for_token(code)

      # 👇 METE ESTAS 3 LÍNEAS NUEVAS AQUÍ
      puts "================================================="
      puts "RESPUESTA DE LA API DE 42: #{token_response.inspect}"
      puts "================================================="


      unless token_response['access_token']
        # El arreglo de Chris: devolvemos :conflict (409) para no borrar la sesión en el frontend
        return render json: { error: 'Código de 42 ya procesado o inválido' }, status: :conflict
      end

      user_info = fetch_42_user_info(token_response['access_token'])

      user = User.find_or_create_by(uid42: user_info['id']) do |u|
        u.username = user_info['login']
        u.email = user_info['email'] || "#{user_info['login']}@student.42.fr"
        u.password = SecureRandom.hex(10) if u.respond_to?(:password=)
        u.elo = 1000
      end

      jwt_token = JWT.encode({ user_id: user.id }, Rails.application.secret_key_base.to_s)

      render json: {
        data: {
          token: jwt_token,
          user: {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url
          }
        }
      }
    end

    private

    def exchange_code_for_token(code)
      uri = URI('https://web/api/oauth/token')
      #uri = URI('https://api.intra.42.fr/oauth/token')
      req = Net::HTTP::Post.new(uri)

      # Lee el secreto asegurándose de quitar saltos de línea invisibles
      req.basic_auth(ENV['UID_42'], File.read(ENV.fetch('SECRET_42')).strip)

      req.set_form_data(
        'grant_type' => 'authorization_code',
        'code' => code,
        'redirect_uri' => ENV['REDIRECT_URI_42']
      )

      res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(req)
      end

      JSON.parse(res.body)
    end

    def fetch_42_user_info(access_token)
      uri = URI('https://web/api/v2/me')
      # uri = URI('https://api.intra.42.fr/v2/me')
      req = Net::HTTP::Get.new(uri)
      req['Authorization'] = "Bearer #{access_token}"

      res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
        http.request(req)
      end
      JSON.parse(res.body)
    end
  end
end
