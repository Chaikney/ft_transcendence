class Room < ApplicationRecord
  # Esta línea le dice a Rails: "No uses la columna 'type' para herencia, ignórala"
  self.inheritance_column = :_type_disabled
  has_many :room_memberships, dependent: :destroy
  has_many :users, through: :room_memberships
  has_many :messages, dependent: :destroy
end