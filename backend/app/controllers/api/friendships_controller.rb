module Api
  class FriendshipsController < ApplicationController
    before_action :authorize_request

    # GET /api/friends
    def index
      pending = @current_user.inverse_friendships.where(status: 'pending').map(&:user)
      
      # 🛠️ FIX: Unimos a los que tú invitaste + los que te invitaron a ti
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
        render json: { error: "Jugador no encontrado" }, status: :not_found
        return
      end

      if target_friend == @current_user
        render json: { error: "No puedes añadirte a ti mismo" }, status: :unprocessable_entity
        return
      end

      # 🛡️ Comprobar que no haya una relación previa
      existing = Friendship.where(user: @current_user, friend: target_friend)
                           .or(Friendship.where(user: target_friend, friend: @current_user)).first

      if existing
        render json: { error: "Ya existe una relación o petición con este usuario" }, status: :unprocessable_entity
        return
      end

      friendship = @current_user.friendships.new(friend: target_friend, status: 'pending')

      if friendship.save
        render json: { message: "Solicitud de amistad enviada a #{target_friend.username}" }, status: :created
      else
        render json: { errors: friendship.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH /api/friends/accept
    def accept
      sender = User.find_by(username: params[:username])
      friendship = @current_user.inverse_friendships.find_by(user: sender, status: 'pending')

      if friendship && friendship.update(status: 'accepted')
        render json: { message: "Ahora eres amigo de #{sender.username}" }, status: :ok
      else
        render json: { error: "No hay solicitud pendiente de ese jugador" }, status: :not_found
      end
    end

    # DELETE /api/friends/reject
    def reject
      sender = User.find_by(username: params[:username])
      friendship = @current_user.inverse_friendships.find_by(user: sender, status: 'pending')

      if friendship && friendship.destroy
        render json: { message: "Solicitud rechazada" }, status: :ok
      else
        render json: { error: "No hay solicitud pendiente de ese jugador" }, status: :not_found
      end
    end

    # POST /api/friends/block
    def block
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { error: "Usuario no encontrado" }, status: :not_found
      end

      if target_user.id == @current_user.id
        return render json: { error: "No puedes bloquearte a ti mismo... aunque quieras" }, status: :unprocessable_entity
      end

      # 💥 1. GUILLOTINA: Rompemos la amistad en ambas direcciones si existía
      Friendship.where(
        "(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        @current_user.id, target_user.id, target_user.id, @current_user.id
      ).destroy_all

      # 📝 2. Registro en la Blacklist
      block_record = Block.find_or_create_by(blocker_id: @current_user.id, blocked_id: target_user.id)

      if block_record
        render json: { message: "Usuario #{target_user.username} enviado a la zona fantasma (bloqueado)" }, status: :ok
      end
    end

    # POST /api/friends/unblock
    def unblock
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { error: "Usuario no encontrado" }, status: :not_found
      end

      # Buscamos el bloqueo y lo destruimos
      block_record = Block.find_or_create_by!(blocker_id: @current_user.id, blocked_id: target_user.id)

      if block_record&.destroy
        render json: { message: "Usuario #{target_user.username} desbloqueado con éxito" }, status: :ok
      else
        render json: { error: "Este usuario no estaba bloqueado" }, status: :unprocessable_entity
      end
    end

    # GET /api/friends/blacklist
    # Devuelve la lista de usuarios que TÚ has bloqueado
    def blacklist
      blocked_users = @current_user.blocked_users.select(:id, :username, :avatar_url, :elo)
      render json: { blacklist: blocked_users }, status: :ok
    end
    
    # POST /api/friends/block
    def block
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { error: "Usuario no encontrado" }, status: :not_found
      end

      if target_user.id == @current_user.id
        return render json: { error: "No puedes bloquearte a ti mismo" }, status: :unprocessable_entity
      end

      # 1. GUILLOTINA: Destruimos la amistad por completo (ya no cambiamos el estado)
      Friendship.where(
        "(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        @current_user.id, target_user.id, target_user.id, @current_user.id
      ).destroy_all

      # 2. BLACKLIST: Lo metemos en la tabla correcta
      block_record = Block.find_or_create_by!(blocker_id: @current_user.id, blocked_id: target_user.id)

      render json: { message: "Usuario #{target_user.username} bloqueado y movido a la Blacklist" }, status: :ok
    end

    # DELETE /api/friends/remove
    def remove
      target_user = User.find_by(username: params[:username])
      
      if target_user.nil?
        return render json: { error: "Usuario no encontrado" }, status: :not_found
      end

      # 💥 GUILLOTINA: Rompemos la relación en la base de datos
      deleted = Friendship.where(
        "(user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)",
        @current_user.id, target_user.id, target_user.id, @current_user.id
      ).destroy_all

      if deleted.any?
        render json: { message: "Amistad con #{target_user.username} eliminada" }, status: :ok
      else
        render json: { error: "No erais amigos" }, status: :unprocessable_entity
      end
    end
  end
end
