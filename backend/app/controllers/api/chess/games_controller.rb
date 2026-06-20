module Api
  module Chess
    class GamesController < ApplicationController
      before_action :authorize_request

      def show
        # El ID llega como 'chess-001'. Tomamos el '001' y lo pasamos a entero '1'
        game_id = params[:game_id].to_s.split('-').last.to_i
        game = Game.find_by(id: game_id)
        
        if game
          render json: { 
            id: "chess-#{game.id.to_s.rjust(3, '0')}",
            status: game.status,
            # Asegúrate de enviar la clave 'fen' que es la que React suele esperar
            fen: game.current_board, 
            player1: game.player1&.username,
            player2: game.player2&.username
          }, status: :ok
        else
          render json: { error: "Partida no encontrada" }, status: :not_found
        end
      end
    end
  end
end