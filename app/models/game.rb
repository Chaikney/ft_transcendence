class Game < ApplicationRecord
  belongs_to :player1, class_name: 'User'
  belongs_to :player2, class_name: 'User'

  validates :status, inclusion: { in: %w[pending in_progress finished] }

  # El motor del Torneo
  def finalize_match(winner_id)
    winner = User.find(winner_id)
    loser = (winner == player1) ? player2 : player1

    # Matemáticas de Elo (Factor K = 32)
    expected_winner = 1.0 / (1.0 + 10.0**((loser.elo - winner.elo) / 400.0))
    expected_loser = 1.0 / (1.0 + 10.0**((winner.elo - loser.elo) / 400.0))

    winner.elo += (32 * (1 - expected_winner)).round
    loser.elo += (32 * (0 - expected_loser)).round

    # Actualizamos contadores
    winner.wins += 1
    loser.losses += 1
    self.status = 'finished'

    # Guardamos todo de golpe (Transacción para que si algo falla, no se guarde a medias)
    User.transaction do
      winner.save!
      loser.save!
      self.save!
    end
  end
end