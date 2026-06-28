module Api
  module Sudoku
    class GamesController < ApplicationController
      before_action :authorize_request
      before_action :set_game, only: [:show, :update]

      # GET /api/sudoku/games/:game_id
      def show
        render json: {
          id: @game.id,
          status: @game.status,
          board: @game.board,
          difficulty: @game.difficulty
        }, status: :ok
      end

      # POST /api/sudoku/games
      def create
        difficulty = params[:difficulty] || 'easy'
        board = SudokuGame.generate(difficulty)

        @game = @current_user.sudoku_games.create!(
          status: 'in_progress',
          difficulty: difficulty,
          board: board
        )

        render json: {
          id: @game.id,
          status: @game.status,
          board: @game.board,
          difficulty: @game.difficulty
        }, status: :created
      end

      # PATCH /api/sudoku/games/:game_id
      def update
        # 1. Preparamos el hash de actualización
        update_params = {}

        # 2. Si el frontend envía un tablero, lo procesamos
        if params[:board].present?
          unless SudokuGame.valid_board?(params[:board])
            return render json: { 
              error: "Movimiento inválido: El tablero viola las reglas" 
            }, status: :unprocessable_entity
          end

          update_params[:board] = params[:board]
          # Si el tablero es nuevo, comprobamos si el juego terminó
          update_params[:status] = 'won' if @game.solved?
        end
      
        # 3. Si el frontend envía un estado (por ejemplo 'finished'), lo procesamos
        # (Asumiendo que el frontend envía { game: { status: 'finished' } })
        if params[:game].present? && params[:game][:status].present?
          update_params[:status] = params[:game][:status]
        end
      
        # 4. Guardamos los cambios (solo si hay algo que actualizar)
        if update_params.empty?
          return render json: { error: "No se enviaron datos para actualizar" }, status: :unprocessable_entity
        end
      
        if @game.update(update_params)
          render json: {
            id: @game.id,
            status: @game.status,
            board: @game.board,
            difficulty: @game.difficulty
          }, status: :ok
        else
          render json: { error: @game.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end
      private

      def set_game
        numeric_id = params[:game_id].to_s.gsub(/[^0-9]/, '').to_i

        @game = @current_user&.sudoku_games&.find_by(id: numeric_id) || SudokuGame.find_by(id: numeric_id)

        if @game
          Rails.logger.info "Juego encontrado: #{@game.id} (Usuario: #{@game.user_id})"
        else
          Rails.logger.warn "Game not found with ID: #{numeric_id}"
          render json: { error: "Game not found" }, status: :not_found
        end
      end
    end
  end
end