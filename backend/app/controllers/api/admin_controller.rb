module Api
  class AdminController < ApplicationController
    # Asegúrate de que el usuario está logueado y es admin
    before_action :authenticate_user! # Asumiendo que tienes esto para el JWT
    before_action :authenticate_admin!

    # GET /api/admin/users
    def index
      users = User.all
      render json: users, status: :ok
    end

    private

    def authenticate_admin!
      unless current_user&.admin?
        render json: { error: 'Acceso no autorizado' }, status: :forbidden
      end
    end
  end
end

