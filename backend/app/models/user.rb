class User < ApplicationRecord
    has_secure_password

    # 🟢 1. DEFINICIÓN DE ROLES
    # 0 = Jugador normal, 1 = Administrador
    enum :role, { player: 0, admin: 1 }

    # --- ASOCIACIONES DE JUEGOS ---
    has_many :games_as_player1, class_name: 'Game', foreign_key: 'player1_id'
    has_many :games_as_player2, class_name: 'Game', foreign_key: 'player2_id'

    # --- ASOCIACIONES DE AMIGOS ---
    has_many :friendships, dependent: :destroy
    has_many :friends, through: :friendships

    has_many :inverse_friendships, class_name: 'Friendship', foreign_key: 'friend_id', dependent: :destroy
    has_many :inverse_friends, through: :inverse_friendships, source: :user

    # --- CALLBACKS ---
    before_create :generate_otp_secret
    
    # 🟢 2. ASIGNAR ROL POR DEFECTO A LOS NUEVOS
    after_initialize :set_default_role, if: :new_record?

    # --- MÉTODOS PÚBLICOS ---
    def all_games
        Game.where("player1_id = ? OR player2_id = ?", self.id, self.id)
    end
    
    private

    def generate_otp_secret
        self.otp_secret = ROTP::Base32.random
    end

    # 🟢 3. MÉTODO PARA EL ROL
    def set_default_role
        self.role ||= :player
    end
end

