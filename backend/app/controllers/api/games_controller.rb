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
      raw_id = params[:game_id] || params[:id]
      numeric_id = raw_id.to_s.split('-').last.to_i

      game = Game.find_by(id: numeric_id)

      if game.nil?
        # 🚀 CERO ROJOS: status :ok
        render json: { error: "Partida no encontrada" }, status: :ok
        return
      end

      # 🔓 Puerta abierta para leer. El backend se fía porque ya blindamos el WebSocket.
      render json: { data: show_game_json(game) }, status: :ok
    end

    # POST /api/games
    def create
      opponent = nil

      if params[:opponent_username].present?
        opponent = User.find_by(username: params[:opponent_username])
        if opponent.nil?
          render json: { error: "Oponente no encontrado" }, status: :ok
          return
        end
      end

      game = Game.new(
        player1: @current_user,
        player2: opponent,
        status: opponent ? 'in_progress' : 'active',
        current_board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
      )

      if game.save
        render json: { message: "Partida iniciada", game_id: game.id }, status: :created
      else
        # 🚀 CERO ROJOS
        render json: { errors: game.errors.full_messages }, status: :ok
      end
    end

    # PATCH /api/games/:id/finish
    def update
      game = Game.find_by(id: params[:id])

      if game.nil? || game.status == 'finished'
        # 🚀 CERO ROJOS
        render json: { error: "Partida no encontrada o ya finalizada" }, status: :ok
        return
      end

      winner = User.find_by(username: params[:winner_username])

      if winner != game.player1 && winner != game.player2
        # 🚀 CERO ROJOS
        render json: { error: "El ganador debe ser uno de los jugadores de esta partida" }, status: :ok
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

    # 🚀 LA VERSIÓN ÚNICA Y CORRECTA (Con cálculo de rol)
    def show_game_json(game)
      user_role = if @current_user.nil?
                    'spectator'
                  elsif game.player1_id == @current_user.id
                    'player1'
                  elsif game.player2_id == @current_user.id
                    'player2'
                  else
                    'spectator'
                  end

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
        spectators: spectator_count(game.id),
        role: user_role # 👈 VITAL para no ser "espectadores dobles"
      }
    end

    def spectator_count(game_id)
      Rails.cache.read("spectators:#{game_id}") || 0
    end
  end
end