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

    # 🔨 POST /api/friends/block (NUEVO)
    def block
      target = User.find_by(username: params[:username])
      
      return render json: { error: "Usuario no encontrado" }, status: :not_found unless target

      # Destruimos cualquier rastro de amistad o petición previa
      Friendship.where(user: @current_user, friend: target)
                .or(Friendship.where(user: target, friend: @current_user)).destroy_all

      # Creamos el muro
      @current_user.friendships.create(friend: target, status: 'blocked')
      
      render json: { message: "Has bloqueado a #{target.username}. No podrá interactuar contigo." }, status: :ok
    end
  end
end