module Api
  class RoomsController < ApplicationController
    before_action :authorize_request

    def index
      rooms = @current_user.rooms
      render json: rooms.map { |room|
        {
          id: room.id,
          name: room.name,
          type: room.respond_to?(:room_type) ? room.room_type : 'group',
          unread_count: 0,
          participants: room.users.map { |u| { id: u.id, username: u.username } }
        }
      }
    end
  end
end