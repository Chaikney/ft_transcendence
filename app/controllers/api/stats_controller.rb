module Api
  class StatsController < ::ApplicationController
    # Este endpoint será público para que cualquiera pueda ver el Salón de la Fama
    
    def leaderboard
      # Recorremos todos los usuarios para calcular sus números
      users_with_stats = User.all.map do |user|
        total_games = user.games.count
        
        # Suponemos que cuando un jugador gana, el status de su partida pasa a 'completado'
        won_games = user.games.where(status: 'completado').count
        
        # Calculamos el porcentaje de victorias (Win Rate)
        win_rate = if total_games > 0
                     ((won_games.to_f / total_games) * 100).round(1)
                   else
                     0
                   end
        
        {
          username: user.username,
          total_games: total_games,
          won_games: won_games,
          win_rate: win_rate
        }
      end

      # Ordenamos la lista de campeones: el que tenga más partidas ganadas va primero
      ranking = users_with_stats.sort_by { |player| -player[:won_games] }

      render json: ranking
    end
  end
end