require 'chess'

module Api
  module Chess
    class GamesController < ApplicationController
      before_action :authorize_request

     # GET /api/chess/games/:game_id
      def show
        numeric_id = params[:game_id].to_s.split('-').last.to_i
        game = Game.find_by(id: numeric_id)
        
        # Si no existe, la creamos al vuelo
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
            # 🛡️ ESCUDO ANTI-RÁFAGAS: Si React disparó dos peticiones a la vez y colisionan,
            # la segunda caerá aquí. Simplemente rescatamos la partida que acaba de nacer.
            game = Game.find_by(id: numeric_id)
          rescue ActiveRecord::RecordInvalid => e
            render json: { error: "Error creando partida: #{e.message}" }, status: :unprocessable_entity
            return
          end
        end

        current_fen = game.current_board || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        turn = current_fen.include?(" w ") ? 'white' : 'black'
        status = game.status == 'finished' ? 'checkmate' : 'active'

        player1 = game.player1
        player2 = game.player2
        # Devolvemos exactamente lo que pide el types.ts de Manu
        render json: {
          game_id: params[:game_id],
          fen: current_fen,
          turn: turn,
          status: status,
          player: {
            player1: { name: player1.username, avatar: player1.avatar_url },
            player2: { name: player2.username, avatar: player2.avatar_url }
          },
          last_move: nil
        }, status: :ok
      end

      # POST /api/chess/move
      def move
        # 🟢 Aplicamos la misma limpieza de ID para el movimiento
        numeric_id = params[:game_id].to_s.split('-').last.to_i
        game = Game.find_by(id: numeric_id)
        
        if game.nil?
          render json: { error: "Partida no encontrada" }, status: :not_found
          return
        end

        from = params[:from]
        to = params[:to]
        current_fen = game.current_board || "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

        # 1. Levantamos el motor de ajedrez con el FEN actual de PostgreSQL
        begin
          engine = ::Chess::Game.load_fen(current_fen)
        rescue StandardError
          render json: { error: "El tablero guardado está corrupto" }, status: :unprocessable_entity
          return
        end

        # 2. Hardcore Validation: Intentamos forzar el movimiento
        begin
          move_string = "#{from}#{to}"
          engine.move(move_string)
        rescue StandardError => e
          # 🥷 EL FIX: Devolvemos 200 OK para no manchar la consola del navegador, 
          # pero avisamos a React de que la jugada es ilegal.
          render json: { illegal_move: true }, status: :ok
          return
        end

        # 3. Si sobrevivió, el movimiento es legal. Extraemos la sangre nueva.
        new_fen = engine.board.to_fen
        new_turn = new_fen.include?(" w ") ? 'white' : 'black'
        
        # 🔥 LÓGICA DE MEMORIA PARA EMPATE POR REPETICIÓN 🔥
        # Cortamos el FEN para quedarnos solo con la foto de la posición pura
        base_position = new_fen.split(' ')[0..3].join(' ')
        
        # Rescatamos el historial (o creamos uno vacío por si acaso)
        history = game.fen_history || []
        history << base_position

        # Evaluamos el estado destructivo (Jaque Mate o Empates)
        game_status = 'active'
        if engine.board.checkmate?
          game_status = 'checkmate'
          game.status = 'finished'
        elsif engine.board.stalemate? || engine.board.halfmove_clock >= 100 || history.count(base_position) >= 3
          # 👆 Hemos añadido el history.count >= 3 al detector de empates
          game_status = 'draw'
          game.status = 'finished'
        end

        # 4. Guardamos en PostgreSQL la foto actual y el álbum entero
        game.update!(
          current_board: new_fen,
          fen_history: history
        )

        # 5. Preparamos el paquete EXACTO para el Walkie-Talkie de React
        payload = {
          type: 'move_updated',
          game: {
            game_id: params[:game_id],
            fen: new_fen,
            turn: new_turn,
            status: game_status,
            last_move: { from: from, to: to, piece: 'P' } # Manu no lo usa estrictamente, pasamos un genérico
          }
        }

        # 6. Disparamos el Broadcast a los dos jugadores 
        channel_name = "game_channel_#{params[:game_id]}"
        ActionCable.server.broadcast(channel_name, payload)

        # Confirmamos a Axios
        render json: payload[:game], status: :ok
      end
      # POST /api/chess/ai_move
      def ai_move
        render json: { message: "La IA se está afilando los dientes... (Coming Soon)" }, status: :not_implemented
      end

    end
  end
end