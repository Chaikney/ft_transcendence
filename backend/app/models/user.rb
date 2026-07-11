class User < ApplicationRecord
  has_secure_password

  # 🔒 VALIDACIONES PARA EL REGISTRO MANUAL
  validates :email, uniqueness: { case_sensitive: false }, 
            presence: true, 
            unless: -> { uid42.present? }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }, 
            if: -> { email.present? }

  validates :password, presence: true, length: { minimum: 6 }, if: :password_digest_changed?
  
  # 🟢 1. DEFINICIÓN DE ROLES
  enum :role, { player: 0, admin: 1 }

  # --- ASOCIACIONES DE JUEGOS ---
  has_many :games_as_player1, class_name: 'Game', foreign_key: 'player1_id', dependent: :destroy
  has_many :games_as_player2, class_name: 'Game', foreign_key: 'player2_id', dependent: :destroy
  has_many :sudoku_games, dependent: :destroy

  # --- ASOCIACIONES DE AMIGOS ---
  has_many :friendships, dependent: :destroy
  has_many :friends, through: :friendships

  has_many :inverse_friendships, class_name: 'Friendship', foreign_key: 'friend_id', dependent: :destroy
  has_many :inverse_friends, through: :inverse_friendships, source: :user

  has_many :room_memberships, dependent: :destroy
  has_many :rooms, through: :room_memberships
  has_many :messages

  # --- ASOCIACIONES DE BLOQUEOS ---
  has_many :blocks_given, class_name: 'Block', foreign_key: 'blocker_id', dependent: :destroy
  has_many :blocked_users, through: :blocks_given, source: :blocked

  has_many :blocks_received, class_name: 'Block', foreign_key: 'blocked_id', dependent: :destroy
  has_many :blockers, through: :blocks_received, source: :blocker

  # --- CALLBACKS ---
  after_initialize :set_default_role, if: :new_record?
  after_create :add_to_global_chat
  before_save :enforce_minimum_elo
  before_create :generate_confirmation_token
  before_create :set_starting_elo
  before_create :set_default_avatar
  
  # --- MÉTODOS PÚBLICOS ---
  def all_games
    Game.where("player1_id = ? OR player2_id = ?", self.id, self.id)
  end
  
  # ⚠️ MÉTODOS 2FA
  def generate_otp_secret
    self.otp_secret = ROTP::Base32.random if self.otp_secret.blank?
    save!
  end

  def mfa_provisioning_uri
    totp = ROTP::TOTP.new(self.otp_secret, issuer: "Transcendence")
    totp.provisioning_uri(self.username)
  end

  # 🚀 NUEVO: MÉTODOS DE RECUPERACIÓN DE CONTRASEÑA
  def generate_password_reset_token
    self.reset_password_token = SecureRandom.urlsafe_base64
    self.reset_password_sent_at = Time.current
    save!(validate: false)
  end

  def password_reset_valid?
    reset_password_sent_at.present? && (reset_password_sent_at + 1.hour) > Time.current
  end
  
  private

  # 🟢 3. MÉTODO PARA EL ROL
  def set_default_role
    self.role ||= :player
    self.banned = false if self.banned.nil?
    self.status ||= 'offline'
  end

  def set_starting_elo
    self.elo = 1000 if self.elo.nil? || self.elo == 100
  end

  # 🟢 5. MÉTODO PARA AÑADIR A SALA GLOBAL
  def add_to_global_chat
    global_room = Room.find_or_create_by!(id: 1) do |r|
      r.name = "Global"
      r.type = "group"
    end
    
    RoomMembership.find_or_create_by!(user: self, room: global_room)
  end

  # 🛡️ LA REGLA: Si el ELO va a ser menor de 100, lo anclamos a 100
  def enforce_minimum_elo
    if self.elo.present? && self.elo < 100
      self.elo = 100
    end
  end

  def generate_confirmation_token
    if self.confirmation_token.blank?
      self.confirmation_token = SecureRandom.hex(20) 
    end
  end

  def set_default_avatar
    self.avatar_url = "../../../frontend/public/avatars/default.png" if self.avatar_url.blank?
  end
end