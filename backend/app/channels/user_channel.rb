class UserChannel < ApplicationCable::Channel
  def subscribed
    # current_user viene de la conexión (Connection.rb)
    if current_user
      stream_from "user_#{current_user.id}"
    else
      reject
    end
  end

  def unsubscribed
    # Limpieza
  end
end