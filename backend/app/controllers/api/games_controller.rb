module Api
  class GamesController < ApplicationController
    before_action :authorize_request

    # GET /api/games/active
    def active
      @games = Game.where(status: 'in_progress')
      render json: { data: @games.map { |game| active_game_json(game) } }, status: :ok
    end

    # GET /api/games/:id
    def show
      game = Game.find_by(id: params[:id])

      if game.nil?
        render json: { error: "Partida no encontrada" }, status: :not_found
        return
      end

      render json: { data: show_game_json(game) }, status: :ok
    end

    # POST /api/games
    def create
      opponent = nil

      # 1. Si nos envían un oponente (ej. desde un botón de reto), lo buscamos
      if params[:opponent_username].present?
        opponent = User.find_by(username: params[:opponent_username])
        if opponent.nil?
          render json: { error: "Oponente no encontrado" }, status: :not_found
          return
        end
      end

      # 2. Creamos la partida. ¡Rails le asignará un ID único de forma 100% segura!
      # Si no hay oponente, player2 se queda en nil (sala de espera / open lobby)
      game = Game.new(
        player1: @current_user,
        player2: opponent,
        status: opponent ? 'active', # 'active' para que el frontend sepa que espera jugador
        current_board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      )

      if game.save
        # Devolvemos el ID real que la base de datos ha generado
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

      game.finalize_match(winner.id)

      render json: {
        message: "Partida finalizada. Elo actualizado.",
        player1: { username: game.player1.username, new_elo: game.player1.elo },
        player2: { username: game.player2.username, new_elo: game.player2.elo }
      }, status: :ok
    end

    private

    # Shape para ActiveGamesPage.tsx (LiveGame)
    def active_game_json(game)
      {
        id: game.id,
        type: 'chess',
        white: game.player1.username,
        black: game.player2.username,
        status: 'active',
        turn: game.turn,
        move_count: game.move_count,
        spectators: spectator_count(game.id),
        started_at: game.created_at.iso8601
      }
    end

    # Shape para SpectatorPage.tsx (ChessGameState + extras)
    def show_game_json(game)
      {
        game_id: game.id.to_s,
        fen: game.current_board,
        turn: game.turn,
        status: game.status == 'in_progress' ? 'active' : game.status,
        last_move: nil,
        player1_id: game.player1_id,
        player2_id: game.player2_id,
        white: game.player1.username,
        black: game.player2.username,
        spectators: spectator_count(game.id)
      }
    end

    def spectator_count(game_id)
      Rails.cache.read("spectators:#{game_id}") || 0
    end
  end
end