require 'net/http'
require 'uri'

module Api
  module Auth
    class OauthController < ApplicationController
      skip_before_action :verify_authenticity_token, raise: false

      def callback_42
        code = params[:code]
        
        # 1. Intercambiar el código por un Access Token de 42
        token_response = exchange_code_for_token(code)
        
        unless token_response['access_token']
          return render json: { error: 'Fallo al negociar con 42' }, status: :unauthorized
        end

        # 2. Usar el Access Token para pedir los datos del usuario a 42
        user_info = fetch_42_user_info(token_response['access_token'])

        # 3. Buscar o crear el usuario en tu base de datos
        user = User.find_or_create_by(uid42: user_info['id']) do |u|
          u.username = user_info['login']
          # Como es de 42, le ponemos un password aleatorio o lo saltamos si la validación lo permite
          u.password = SecureRandom.hex(10) if u.respond_to?(:password=)
        end

        # 4. Generar TU propio token (JWT)
        jwt_token = JWT.encode({ user_id: user.id }, Rails.application.credentials.secret_key_base)

        # 5. Devolverlo al frontend
        render json: { token: jwt_token, user: { id: user.id, username: user.username } }
      end

      private

      def exchange_code_for_token(code)
        uri = URI('https://api.intra.42.fr/oauth/token')
        res = Net::HTTP.post_form(uri, {
          'grant_type' => 'authorization_code',
          'client_id' => ENV['u-s4t2ud-8b88bb52bf805dfccc6336eeab953398a4f08059160682b5a7ec9138cd3e8e12'], # Tu UID de la app de 42
          'client_secret' => ENV['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'], # Tu Secret de la app de 42
          'code' => code,
          'redirect_uri' => 'http://localhost:5173/auth/callback'
        })
        JSON.parse(res.body)
      end

      def fetch_42_user_info(access_token)
        uri = URI('https://api.intra.42.fr/v2/me')
        req = Net::HTTP::Get.new(uri)
        req['Authorization'] = "Bearer #{access_token}"
        
        res = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(req)
        end
        JSON.parse(res.body)
      end
    end
  end
end