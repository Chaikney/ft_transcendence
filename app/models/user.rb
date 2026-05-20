class User < ApplicationRecord
    has_secure_password
    has_many :games

    before_create :generate_otp_secret

    private

    def generate_otp_secret
        self.otp_secret = ROTP::Base32.random
    end
end
