# app/services/jwt_service.rb
class JwtService
  # Usa la clave secreta de tu aplicación Rails para firmar los tokens
  SECRET_KEY = Rails.application.secret_key_base.to_s

  # Fabrica el token (Por defecto caduca en 24 horas)
  def self.encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    JWT.encode(payload, SECRET_KEY)
  end

  # Desencripta el token para saber quién es el usuario
  def self.decode(token)
    decoded = JWT.decode(token, SECRET_KEY)[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::DecodeError
    nil
  end
end