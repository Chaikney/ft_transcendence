module Api
  class GamesController < ApplicationController
    before_action :authorize_request

    def show
      raw_id = params[:id] || params[:game_id]
      numeric_id = raw_id.to_s.scan(/\d+/).first.to_i

      game = Game.find_by(id: numeric_id)

      # 1. Miramos si la petición viene de la ruta de sudoku para saber qué crear
      is_sudoku = request.path.include?('sudoku')

      # 2. Si no existe y es Sudoku, lo creamos al vuelo
      if game.nil? && is_sudoku
        board_string = SudokuGenerator.generate('easy')
        game = Game.create!(
          id: numeric_id,
          status: 'in_progress',
          initial_board: board_string,
          current_board: board_string,
          player1_id: @current_user.id
          player2_id: @current_user.id
        )
      end

      if game.nil?
        render json: { error: "Partida no encontrada" }, status: :not_found
        return
      end

      # 3. Formateamos los datos
      grid_matrix = game.current_board.chars.map(&:to_i).each_slice(9).to_a
      frontend_status = game.status == 'in_progress' ? 'active' : game.status
      
      # MAGIA: Reconstruimos el ID exactamente como lo espera React ("sudoku-001")
      formatted_id = is_sudoku ? "sudoku-#{numeric_id.to_s.rjust(3, '0')}" : numeric_id.to_s

      render json: {
        game_id: formatted_id,
        difficulty: 'easy',
        status: frontend_status,
        grid: grid_matrix
      }, status: :ok
    end
    # POST /api/games
    def create
      # Creamos la partida. Asumimos que el jugador actual es el Player 1 (el retador)
      opponent = User.find_by(username: params[:opponent_username])
      
      if opponent.nil?
        render json: { error: "Oponente no encontrado" }, status: :not_found
        return
      end

      game = Game.new(player1: @current_user, player2: opponent, status: 'in_progress')

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
    # POST /api/sudoku/move
    def move
      # 1. Recogemos los datos que envía React
      raw_id = params[:game_id] || params[:gameId]
      numeric_id = raw_id.to_s.scan(/\d+/).first.to_i
      
      row = params[:row].to_i
      col = params[:col].to_i
      value = params[:value].to_i

      # 2. Se los pasamos a TU motor de Sudoku (el GameService que creaste)
      success = GameService.process_sudoku_move(numeric_id, row, col, value)

      # 3. Respondemos al frontend
      if success
        render json: { message: 'Movimiento registrado y enviado por WebSockets' }, status: :ok
      else
        render json: { error: 'Movimiento ilegal según las reglas del Sudoku' }, status: :unprocessable_entity
      end
    end
  end
end