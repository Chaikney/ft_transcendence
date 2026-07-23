module Api
  class ActionCableTicketsController < ApplicationController
    before_action :authorize_request

    def create
      # Generamos un token aleatorio seguro de un solo uso
      ticket = SecureRandom.hex(16)

      # Guardamos en la caché de Rails (RAM) el ticket asociado al ID del usuario por 15 segundos
      Rails.cache.write("action_cable_ticket:#{ticket}", @current_user.id, expires_in: 15.seconds)

      render json: { ticket: ticket }, status: :ok
    end
  end
end