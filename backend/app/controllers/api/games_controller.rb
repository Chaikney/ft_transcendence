module Api
  class GamesController < ApplicationController
    before_action :authorize_request

    # POST /api/games
    def create
      # Creamos la partida. Asumimos que el jugador actual es el Player 1 (el retador)
      opponent = User.find_by(username: params[:opponent_username])
      
      if opponent.nil?
        render json: { error: "Oponente no encontrado" }, status: :not_found
        return
      end

      game = Game.new(
        player1: @current_user, 
        player2: opponent, 
        status: 'in_progress',
        current_fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' # 👈 FEN inicial obligatorio
      )

      if game.save
        render json: { message: "Partida iniciada", game_id: game.id }, status: :created
      else
        render json: { errors: game.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # PATCH /api/games/:id/finish
    def update
      game = Game.find_by(id: params[:id])

      if game.nil? || game.status == 'finished'
        render json: { error: "Partida no encontrada o ya finalizada" }, status: :unprocessable_entity
        return
      end

      winner = User.find_by(username: params[:winner_username])

      if winner != game.player1 && winner != game.player2
        render json: { error: "El ganador debe ser uno de los jugadores de esta partida" }, status: :unprocessable_entity
        return
      end

      # Ejecutamos la magia del Elo
      game.finalize_match(winner.id)

      render json: { 
        message: "Partida finalizada. Elo actualizado.",
        player1: { username: game.player1.username, new_elo: game.player1.elo },
        player2: { username: game.player2.username, new_elo: game.player2.elo }
      }, status: :ok
    end
  end
end