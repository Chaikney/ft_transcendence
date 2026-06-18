module Api
  class HealthController < ApplicationController
    # Saltamos cualquier autenticación aquí, esto tiene que ser público
    skip_before_action :verify_authenticity_token, raise: false

    def index
      # Hacemos una consulta súper ligera a PostgreSQL para comprobar que responde
      db_status = ActiveRecord::Base.connection.active? ? 'connected' : 'disconnected'

      render json: {
        api: 'online',
        database: db_status,
        timestamp: Time.current
      }, status: :ok
    rescue StandardError => e
      # Si la base de datos está caída, ActiveRecord lanzará una excepción
      render json: {
        api: 'online',
        database: 'error',
        message: e.message,
        timestamp: Time.current
      }, status: :service_unavailable
    end
  end
end