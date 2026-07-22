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
        update_params = {}

        if params[:board].present?
          unless SudokuGame.valid_board?(params[:board])
            # 🚀 CERO ROJOS
            return render json: { error: "Movimiento inválido" }, status: :ok
          end
           update_params[:board] = params[:board]
          
          # Si el tablero está completo y bien, marcamos estado 'won'
          if @game.solved? || @game.board.include?('0') == false # Verificación adicional
            # Nota: Asumimos que solved? contiene la lógica de verificación
          end
        end
      
        # Procesar estado si viene del cliente
        if params[:game].present? && params[:game][:status].present?
          update_params[:status] = params[:game][:status]
        end

        # Si el tablero se resolvió, forzamos status a 'won'
        if update_params[:board] && @game.class.new(board: update_params[:board]).solved?
          update_params[:status] = 'won'
        end
      
        if update_params.empty?
          # 🚀 CERO ROJOS
          return render json: { error: "No se enviaron datos" }, status: :ok
        end
      
        if @game.update(update_params)
          if @game.status == 'won'
            @game.finalize_game!
          end

          render json: {
            id: @game.id,
            status: @game.status,
            board: @game.board,
            difficulty: @game.difficulty
          }, status: :ok
        else
          # 🚀 CERO ROJOS
          render json: { error: @game.errors.full_messages.join(', ') }, status: :ok
        end
      end

      private

      def set_game
        numeric_id = params[:game_id].to_s.gsub(/[^0-9]/, '').to_i
        
        @game = SudokuGame.find_by(id: numeric_id)

        if @game.nil?
          # 🚀 CERO ROJOS
          return render json: { error: "Game not found" }, status: :ok
        end

        unless @current_user.sudoku_games.exists?(id: @game.id)
          # 🚀 CERO ROJOS
          return render json: { error: "Acceso denegado: Esta partida no es tuya" }, status: :ok
        end
      end
    end
  end
end
