class Room < ApplicationRecord
  self.inheritance_column = nil

  has_many :room_memberships, dependent: :destroy
  has_many :users, through: :room_memberships
  has_many :messages, dependent: :destroy
end