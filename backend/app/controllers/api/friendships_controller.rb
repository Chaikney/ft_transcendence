module Api
  class FriendshipsController < ApplicationController
    before_action :authorize_request

    # GET /api/friends
    def index
      pending = @current_user.inverse_friendships.where(status: 'pending').map(&:user)
      
      friends_i_invited = @current_user.friendships.where(status: 'accepted').map(&:friend)
      friends_who_invited_me = @current_user.inverse_friendships.where(status: 'accepted').map(&:user)
      accepted = (friends_i_invited + friends_who_invited_me).uniq

      render json: {
        friends: accepted,
        pending_requests: pending
      }, status: :ok
    end

    # POST /api/friends/request
    def create
      target_friend = User.find_by(username: params[:username])

      if target_friend.nil?
        render json: { success: false, error: "Jugador no encontrado" }, status: :ok
        return
      end

      if target_friend == @current_user
        render json: { success: false, error: "No puedes añadirte a ti mismo" }, status: :ok
        return
      end

      # Comprobar si ya existe una relación
      existing = Friendship.where(user: @current_user, friend: target_friend)
                           .or(Friendship.where(user: target_friend, friend: @current_user)).first

      if existing
        render json: { success: false, error: "Ya existe una relación o petición con este usuario" }, status: :ok
        return
      end

      friendship = @current_user.friendships.new(friend: target_friend, status: 'pending')

      if friendship.save
        render json: { success: true, message: "Solicitud de amistad enviada a #{target_friend.username}" }, status: :ok
      else
        render json: { success: false, errors: friendship.errors.full_messages }, status: :ok
      end
    end

    # PATCH /api/friends/accept
    def accept
      sender = User.find_by(username: params[:username])
      friendship = @current_user.inverse_friendships.find_by(user: sender, status: 'pending')

      if friendship && friendship.update(status: 'accepted')
        render json: { success: true, message: "Ahora eres amigo de #{sender.username}" }, status: :ok
      else
        render json: { success: false, error: "No hay solicitud pendiente de ese jugador" }, status: :ok
      end
    end

    # DELETE /api/friends/reject
    def reject
      sender = User.find_by(username: params[:username])
      friendship = @current_user.inverse_friendships.find_by(user: sender, status: 'pending')

      if friendship && friendship.destroy
        render json: { success: true, message: "Solicitud rechazada" }, status: :ok
      else
        render json: { success: false, error: "No hay solicitud pendiente de ese jugador" }, status: :ok
      end
    end

    # POST /api/friends/block
    def block
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { success: false, error: "Usuario no encontrado" }, status: :ok
      end

      if target_user.id == @current_user.id
        return render json: { success: false, error: "No puedes bloquearte a ti mismo" }, status: :ok
      end

      # 1. Destruimos la amistad
      Friendship.where(
        "(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        @current_user.id, target_user.id, target_user.id, @current_user.id
      ).destroy_all

      # 2. Registro en la Blacklist
      block_record = Block.find_or_create_by!(blocker_id: @current_user.id, blocked_id: target_user.id)

      render json: { success: true, message: "Usuario #{target_user.username} bloqueado y movido a la Blacklist" }, status: :ok
    end

    # POST /api/friends/unblock
    def unblock
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { success: false, error: "Usuario no encontrado" }, status: :ok
      end

      block_record = Block.find_by(blocker_id: @current_user.id, blocked_id: target_user.id)

      if block_record&.destroy
        render json: { success: true, message: "Usuario #{target_user.username} desbloqueado con éxito" }, status: :ok
      else
        render json: { success: false, error: "Este usuario no estaba bloqueado" }, status: :ok
      end
    end

    # GET /api/friends/blacklist
    def blacklist
      blocked_users = @current_user.blocked_users.select(:id, :username, :avatar_url, :elo)
      render json: { blacklist: blocked_users }, status: :ok
    end

    # DELETE /api/friends/remove
    def remove
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { success: false, error: "Usuario no encontrado" }, status: :ok
      end

      deleted = Friendship.where(
        "(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        @current_user.id, target_user.id, target_user.id, @current_user.id
      ).destroy_all

      if deleted.any?
        render json: { success: true, message: "Amistad con #{target_user.username} eliminada" }, status: :ok
      else
        render json: { success: false, error: "No erais amigos" }, status: :ok
      end
    end
  end
end