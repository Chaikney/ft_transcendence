class Game < ApplicationRecord
  belongs_to :player1, class_name: 'User'
  belongs_to :player2, class_name: 'User'

  validates :status, inclusion: { in: %w[pending in_progress finished] }
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
    save_all(winner, loser)
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
end