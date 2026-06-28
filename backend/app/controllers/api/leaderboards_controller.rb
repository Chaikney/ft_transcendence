module Api
  class LeaderboardsController < ApplicationController
    # El ranking es público, por lo que no hace falta before_action :authorize_request
    # a menos que quieras restringirlo solo a usuarios registrados.

    def index
      # Filtramos solo las columnas que queremos mostrar para el ranking
      # y ordenamos por elo de mayor a menor.
      @top_users = User.order(elo: :desc)
                       .limit(10)
                       .select(:id, :username, :elo, :wins, :losses, :avatar_url)

      render json: @top_users, status: :ok
    end
  end
end