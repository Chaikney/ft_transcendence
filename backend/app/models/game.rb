class Game < ApplicationRecord
  belongs_to :player1, class_name: 'User'
  belongs_to :player2, class_name: 'User'

  validates :status, inclusion: { in: %w[pending pending_acceptance active in_progress finished cancelled] }
  validates :player1, :player2, presence: true

  # --- Helpers de ajedrez (todo vive en Game, no hay modelo ChessGame) ---

  def turn
    return nil if current_board.blank?
    current_board.split(' ')[1] == 'w' ? 'white' : 'black'
  end

  def move_count
    (fen_history || []).size
  end

  # El motor del Torneo

  def finalize_match(winner_id)
    winner = (winner_id == player1_id) ? player1 : player2
    loser = (winner == player1) ? player2 : player1

    update_elo_logic(winner, 1.0, loser, 0.0)
    winner.wins += 1
    loser.losses += 1
    self.status = 'finished'
    self.winner_id = winner_id

    # Guardamos todo de golpe (Transacción para que si algo falla, no se guarde a medias)
    User.transaction do
      winner.save!
      loser.save!
      self.save!
    end
  end

  def finalize_draw
    return if status == 'finished'

    update_elo_logic(player1, 0.5, player2, 0.5)
    save_all(player1, player2)
  end

  private

  def update_elo_logic(p1, score1, p2, score2)
    expected_p1 = 1.0 / (1.0 + 10.0**((p2.elo - p1.elo) / 400.0))
    expected_p2 = 1.0 / (1.0 + 10.0**((p1.elo - p2.elo) / 400.0))

    p1.elo += (32 * (score1 - expected_p1)).round
    p2.elo += (32 * (score2 - expected_p2)).round
    self.status = 'finished'
  end

  def save_all(u1, u2)
    User.transaction do
      u1.save!
      u2.save!
      self.save!
    end
  end

  def self.check_afk_timeouts
    # Buscamos partidas activas que lleven más de 1 hora sin actualizarse
    partidas_abandonadas = Game.where(status: 'in_progress').where("updated_at < ?", 1.hour.ago)

    partidas_abandonadas.each do |partida|
      #Rails.logger.info "💀 [AFK TIMEOUT] Partida ##{partida.id} abandonada. Ejecutando castigo..."

      perdedor_id = partida.current_turn_id
      
      # 🛡️ FIX: Si nadie había movido nunca (current_turn_id es nil)
      if perdedor_id.nil?
        partida.update!(status: 'finished') # Anulamos la partida sin cambiar ELOs
        
        ActionCable.server.broadcast("game_chess-#{partida.id}", {
          type: 'game_over',
          status: 'draw' # Mandamos 'draw' para que el frontend cierre la pantalla suavemente
        })
        next # Pasamos a la siguiente partida
      end

      # Si SÍ sabemos de quién era el turno, ejecutamos el castigo normal:
      ganador_id = (perdedor_id == partida.player1_id) ? partida.player2_id : partida.player1_id

      # Usamos el método que repara el ELO, contadores y cambia el estado a finished
      partida.finalize_match(ganador_id)
      
      # Avisamos por WebSockets (usamos 'resigned' para que React muestre el cartel de fin de juego)
      ActionCable.server.broadcast("game_chess-#{partida.id}", {
        type: 'game_over',
        status: 'resigned'
      })
    end
  end
end