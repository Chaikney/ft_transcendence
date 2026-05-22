class User < ApplicationRecord
    has_secure_password
    has_many :games

    has_many :friendships, dependent: :destroy
    has_many :friends, through: :friendships

    has_many :inverse_friendships, class_name: 'Friendship', foreign_key: 'friend_id', dependent: :destroy
    has_many :inverse_friends, through: :inverse_friendships, source: :user

    before_create :generate_otp_secret

    private

    def generate_otp_secret
        self.otp_secret = ROTP::Base32.random
    end
end
