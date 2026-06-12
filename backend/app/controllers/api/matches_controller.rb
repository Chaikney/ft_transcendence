# app/controllers/api/matches_controller.rb
class Api::MatchesController < ApplicationController
  def index
    user = User.find_by(id: params[:id])
    
    if user.nil?
      return render json: { error: 'Usuario no encontrado' }, status: :not_found
    end

    # Alineado con tus nombres de columnas reales: player1 y player2
    games = Game.where("player1_id = ? OR player2_id = ?", user.id, user.id)
                .where(status: 'finished') # Solo mostrar partidas terminadas en el historial
                .order(updated_at: :desc)

    match_history = games.map do |game|
      {
        match_id: game.id,
        date: game.updated_at.strftime("%Y-%m-%d %H:%M"),
        player1: game.player1.username,
        player2: game.player2.username,
        final_fen: game.fen_actual,
        status: game.status, # Será 'finished'
        winner: game.winner_id ? User.find_by(id: game.winner_id)&.username : "Draw"
      }
    end

    render json: { 
      user: user.username, 
      total_matches: match_history.count,
      history: match_history 
    }, status: :ok
  end

  def my_matches
    # Si usas autenticación por token, aquí Manu puede pedir sus propias partidas
    # user = current_user
    # ... misma lógica ...
  end
end