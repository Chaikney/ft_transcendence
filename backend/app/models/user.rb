class User < ApplicationRecord
    has_secure_password

    # 🔒 VALIDACIONES PARA EL REGISTRO MANUAL
    validates :username, presence: true, uniqueness: { case_sensitive: false }, 
                         length: { minimum: 3, maximum: 15 },
                         format: { with: /\A[a-zA-Z0-9_-]+\z/, message: "only allows letters, numbers, _ and -" }
    
    validates :email, presence: true, uniqueness: { case_sensitive: false },
                      format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }

    # La contraseña solo es obligatoria cuando se crea un registro nuevo 
    # o cuando el usuario la está cambiando explícitamente.
    validates :password, presence: true, length: { minimum: 6 }, if: :password_digest_changed?
    # 🟢 1. DEFINICIÓN DE ROLES
    # 0 = Jugador normal, 1 = Administrador
    enum :role, { player: 0, admin: 1 }

    # --- ASOCIACIONES DE JUEGOS ---
    has_many :games_as_player1, class_name: 'Game', foreign_key: 'player1_id'
    has_many :games_as_player2, class_name: 'Game', foreign_key: 'player2_id'
    has_many :sudoku_games, dependent: :destroy

    # --- ASOCIACIONES DE AMIGOS ---
    has_many :friendships, dependent: :destroy
    has_many :friends, through: :friendships

    has_many :inverse_friendships, class_name: 'Friendship', foreign_key: 'friend_id', dependent: :destroy
    has_many :inverse_friends, through: :inverse_friendships, source: :user

    # --- CALLBACKS ---
    # 🟢 2. ASIGNAR ROL POR DEFECTO A LOS NUEVOS
    after_initialize :set_default_role, if: :new_record?

    # --- MÉTODOS PÚBLICOS ---
    def all_games
        Game.where("player1_id = ? OR player2_id = ?", self.id, self.id)
    end
    
    # ⚠️ MÉTODOS 2FA (Deben ir AQUÍ, encima de private)
    def generate_otp_secret
        self.otp_secret = ROTP::Base32.random if self.otp_secret.blank?
        save!
    end

    def mfa_provisioning_uri
        # El 'issuer' es el nombre que saldrá en la app del móvil
        totp = ROTP::TOTP.new(self.otp_secret, issuer: "Noctyve_Transcendence")
        totp.provisioning_uri(self.username)
    end
    
    private

    # 🟢 3. MÉTODO PARA EL ROL
    def set_default_role
        self.role ||= :player
        self.banned = false if self.banned.nil?
        self.status ||= 'offline'
    end
end