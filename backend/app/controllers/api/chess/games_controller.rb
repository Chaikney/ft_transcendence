require 'chess'

module Api
  module Chess
    class GamesController < ApplicationController
      before_action :authorize_request

      def show
        numeric_id = params[:game_id].to_s.split('-').last.to_i
        game = Game.find_by(id: numeric_id)
        
        if game.nil?
          default_fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          begin
            game = Game.create!(
              id: numeric_id,
              status: 'in_progress',
              initial_board: default_fen,
              current_board: default_fen,
              fen_history: [default_fen.split(' ')[0..3].join(' ')],
              player1_id: @current_user.id,
              player2_id: @current_user.id 
            )
          rescue ActiveRecord::RecordNotUnique
            game = Game.find_by(id: numeric_id)
          rescue ActiveRecord::RecordInvalid => e
            render json: { error: "Error: #{e.message}" }, status: :unprocessable_entity
            return
          end
        end

        render_game_state(game, params[:game_id])
      end

      def move
        numeric_id = params[:game_id].to_s.split('-').last.to_i
        game = Game.find_by(id: numeric_id)
        
        return render json: { error: "Partida no encontrada" }, status: :not_found unless game

        engine = ::Chess::Game.load_fen(game.current_board) rescue nil
        return render json: { error: "Tablero corrupto" }, status: :unprocessable_entity unless engine

        begin
          # Si hay promoción, el string será "e7e8n". Si no hay, será "e2e4" normal.
          move_string = "#{params[:from]}#{params[:to]}#{params[:promotion]}"
          engine.move(move_string)
        rescue StandardError
          return render json: { illegal_move: true }, status: :ok
        end

        # Actualización de estado
        new_fen = engine.board.to_fen
        base_position = new_fen.split(' ')[0..3].join(' ')
        # Usamos + en lugar de << para asegurarnos de que history es un array nuevo
        history = (game.fen_history || []) + [base_position] 
        
        # 🧹 EL EXORCISMO DEL HISTORIAL:
        # Recortamos TODAS las posiciones de la lista para que la inicial y las nuevas
        # hablen exactamente el mismo idioma, sin números de turnos.
        historial_limpio = history.map { |f| f.to_s.split(' ')[0..3].join(' ') }
        
        # Ahora sí, el backend detectará que la primera y la tercera son idénticas
        is_threefold = historial_limpio.tally.values.any? { |count| count >= 3 }
        
        game_status = engine.board.checkmate? ? 'checkmate' : ((engine.board.stalemate? || is_threefold) ? 'draw' : 'active')
        
        game.update!(
          current_board: new_fen, 
          fen_history: history, 
          status: (game_status != 'active' ? 'finished' : 'in_progress')
        )

        # 🚀 BROADCAST CORREGIDO: El nombre del canal DEBE coincidir con el del Channel
        # Si en tu channel usas "game_#{game_id}", aquí debe ser lo mismo.
        channel_name = "game_#{params[:game_id]}"
        
        payload = {
          type: 'move_updated',
          game: {
            game_id: params[:game_id],
            fen: new_fen,
            turn: new_fen.include?(" w ") ? 'white' : 'black',
            status: game_status,
            last_move: { from: params[:from], to: params[:to] }
          }
        }

        ActionCable.server.broadcast(channel_name, payload)

        render json: payload[:game], status: :ok
      end

      private

      # En games_controller.rb, dentro de render_game_state:
      def render_game_state(game, game_id)
  render json: {
    game_id: game_id,
    fen: game.current_board,
    turn: game.current_board.include?(" w ") ? 'white' : 'black',
    status: game.status == 'finished' ? 'finished' : 'active',
    # ASEGURAR IDs COMO ENTEROS
    player1_id: game.player1_id.to_i, 
    player2_id: game.player2_id.to_i,
    player: {
      player1: { name: game.player1.username, avatar: game.player1.avatar_url },
      player2: { name: game.player2.username, avatar: game.player2.avatar_url }
    },
    last_move: nil
  }, status: :ok
end
    end
  end
end