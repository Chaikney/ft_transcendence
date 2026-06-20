module Api
  module Sudoku
    class GamesController < ApplicationController
      before_action :authorize_request

      # GET /api/sudoku/games/:game_id
      def show
        # Extraemos los números del ID (convierte "sudoku-001" en "001")
        # .to_i convierte "001" en el número entero 1
        numeric_id = params[:game_id].scan(/\d+/).first.to_i
        
        @game = @current_user.sudoku_games.find_by(id: numeric_id)

        if @game
          render json: {
            id: @game.id,
            status: @game.status,
            board: @game.board,
            difficulty: @game.difficulty
          }, status: :ok
        else
          render json: { error: "Partida no encontrada" }, status: :not_found
        end
      end

      # POST /api/sudoku/games
      def create
        @game = @current_user.sudoku_games.create!(
          status: 'in_progress',
          difficulty: params[:difficulty] || 'easy',
          board: params[:board] || ""
        )
        render json: @game, status: :created
      end

      # PATCH /api/sudoku/games/:game_id
      def update
        numeric_id = params[:game_id].scan(/\d+/).first.to_i
        @game = @current_user.sudoku_games.find_by(id: numeric_id)
        
        if @game&.update(board: params[:board], status: params[:status])
          render json: @game, status: :ok
        else
          render json: { error: "No se pudo actualizar" }, status: :unprocessable_entity
        end
      end
    end
  end
end