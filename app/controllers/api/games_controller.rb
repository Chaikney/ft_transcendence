module Api
  class GamesController < ::ApplicationController
    
    before_action :authorize_request
    
    
    def index
      games = Game.all 
      render json: games
    end

    def create
      # ¡Llamamos a nuestro nuevo servicio matemático!
      tablero_nuevo = SudokuGenerator.generate

      game = Game.create(
        initial_board: tablero_nuevo,
        current_board: tablero_nuevo,
        status: "en_curso"
      )

      render json: game, status: :created
    end

    def update
      # 1. Buscamos la partida específica por su ID
      game = Game.find(params[:id])

      # 2. Intentamos actualizarla solo con los datos permitidos
      if game.update(game_params)
        # Si va bien, devolvemos el juego actualizado
        render json: game
      else
        # Si falla (ej. datos inválidos), devolvemos un error
        render json: { errors: game.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private # Todo lo que va debajo de 'private' son métodos internos de seguridad

    def game_params
      # Solo permitimos que el frontend modifique el tablero actual y el estado
      params.require(:game).permit(:current_board, :status)
    end

  end
end