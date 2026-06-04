module Api
  class StatsController < ApplicationController
    
    def leaderboard
      # Pedimos a la base de datos el TOP 10 ordenado por ELO directamente (muchísimo más rápido)
      top_players = User.order(elo: :desc).limit(10).map do |user|
        
        total_games = user.wins + user.losses
        
        # Mantenemos el Win Rate, pero usando las columnas nuevas
        win_rate = if total_games > 0
                     ((user.wins.to_f / total_games) * 100).round(1)
                   else
                     0
                   end

        {
          username: user.username,
          elo: user.elo, # ¡El poder real de Sendokai!
          wins: user.wins,
          losses: user.losses,
          total_games: total_games,
          win_rate: "#{win_rate}%"
        }
      end

      render json: { leaderboard: top_players }, status: :ok
    end
  end
end