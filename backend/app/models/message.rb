class Message < ApplicationRecord
  belongs_to :room
  belongs_to :sender, class_name: 'User', foreign_key: 'user_id'

  # Esto ayuda a que el JSON final incluya el 'sender' (el usuario)
  def as_json(options = {})
    super(options.merge(
      include: { sender: { only: [:username] } },
      methods: [:sender]
    ))
  end
end