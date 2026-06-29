class AppearanceChannel < ApplicationCable::Channel
  def subscribed
    stream_from "appearance_channel"
    
    if current_user
      current_user.update(status: 'online')
      ActionCable.server.broadcast("appearance_channel", { 
        user_id: current_user.id, 
        status: 'online' 
      })
    end
  end

  def unsubscribed
    if current_user
      current_user.update(status: 'offline')
      ActionCable.server.broadcast("appearance_channel", { 
        user_id: current_user.id, 
        status: 'offline' 
      })
    end
  end
end