module Api
  class BlocksController < ApplicationController
    before_action :authorize_request

    # GET /api/blocks (Ver la lista negra de mi cuenta)
    def index
      render json: @current_user.blocked_users.as_json(except: [:password_digest, :email]), status: :ok
    end

    # POST /api/blocks (Bloquear a un usuario enviando su { "blocked_id": X })
    def create
      blocked_user = User.find_by(id: params[:blocked_id])
      
      return render json: { error: 'Usuario en las sombras (No encontrado)' }, status: :not_found unless blocked_user
      return render json: { error: 'No puedes bloquearte a ti mismo, por mucho que te odies hoy' }, status: :unprocessable_entity if @current_user.id == blocked_user.id

      block = @current_user.active_blocks.build(blocked: blocked_user)

      if block.save
        render json: { message: "Usuario bloqueado con éxito" }, status: :created
      else
        render json: { errors: block.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # DELETE /api/blocks/:blocked_id (Desbloquear)
    def destroy
      block = @current_user.active_blocks.find_by(blocked_id: params[:blocked_id])

      if block
        block.destroy
        render json: { message: "Usuario desbloqueado. Paz restaurada." }, status: :ok
      else
        render json: { error: "No tienes bloqueado a este usuario" }, status: :not_found
      end
    end
  end
end