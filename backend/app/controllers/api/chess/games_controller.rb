require 'chess'

module Api
  module Chess
    class GamesController < ApplicationController
      before_action :authorize_request

      def show
        raw_id = params[:game_id] || params[:id]
        numeric_id = raw_id.to_s.split('-').last.to_i
        
        game = Game.find_by(id: numeric_id)
        
        if game.nil?
          # 🚀 CERO ROJOS
          return render json: { error: "La partida solicitada no existe." }, status: :ok
        end

        render_game_state(game, params[:game_id])
      end

      def move
        numeric_id = params[:game_id].to_s.split('-').last.to_i
        game = Game.find_by(id: numeric_id)
        
        # 🚀 CERO ROJOS
        return render json: { error: "Partida no encontrada" }, status: :ok unless game

        # 🛑 BARRERA Y CERO ROJOS: Evita que los espectadores muevan
        unless game.player1_id == @current_user.id || game.player2_id == @current_user.id
          return render json: { error: "Acceso denegado: Los espectadores no pueden mover" }, status: :ok
        end

        engine = ::Chess::Game.load_fen(game.current_board) rescue nil
        
        # 🚀 CERO ROJOS
        return render json: { error: "Tablero corrupto" }, status: :ok unless engine

        begin
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
        
        # 1. ACTUALIZACIÓN CORREGIDA: Solo guardamos el movimiento, NO tocamos el status aún.
        game.update!(
          current_board: new_fen, 
          fen_history: history
        )

        # 2. Ahora evaluamos el fin de la partida. 
        # finalize_match y finalize_draw ya se encargan ellos solos de cambiar el status a 'finished'
        if game_status == 'checkmate'
          game.finalize_match(@current_user.id)
        elsif game_status == 'draw'
          game.finalize_draw
        else
          game.update!(status: 'in_progress')
        end

        # 🚀 BROADCAST CORREGIDO: El nombre del canal DEBE coincidir con el del Channel
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

      # POST /api/games/challenge
      def challenge
        target = User.find_by(id: params[:target_id])
        
        if target.nil? || target.status != 'online'
          # 🚀 CERO ROJOS
          return render json: { error: 'El usuario no está disponible' }, status: :ok
        end

        ActionCable.server.broadcast("matchmaking_#{target.id}", {
          type: 'incoming_challenge',
          challenger: { id: @current_user.id, username: @current_user.username }
        })
        
        render json: { message: 'Desafío enviado' }, status: :ok
      end

      # POST /api/games/accept_challenge
      def accept_challenge
        challenger = User.find_by(id: params[:challenger_id])
        
        if challenger.nil?
          return render json: { error: 'El retador ha desaparecido' }, status: :ok
        end

        jugadores = [@current_user.id, challenger.id].shuffle

        game = Game.create!(
          player1_id: jugadores[0],
          player2_id: jugadores[1],
          status: 'in_progress' 
        )

        # 🚀 Avisamos a LOS DOS para que sus navegadores los envíen a la pantalla de juego
        redirect_payload = { type: 'challenge_accepted', game_id: game.id }
        
        ActionCable.server.broadcast("matchmaking_#{@current_user.id}", redirect_payload)
        ActionCable.server.broadcast("matchmaking_#{challenger.id}", redirect_payload)

        render json: { message: 'Partida creada', game_id: game.id }, status: :ok
      end

      private

      def render_game_state(game, game_id)
        render json: {
          game_id: game_id,
          fen: game.current_board,
          turn: game.current_board.include?(" w ") ? 'white' : 'black',
          status: game.status == 'finished' ? 'finished' : 'active',
          player1_id: game.player1_id.to_i, 
          player2_id: game.player2_id.to_i,
          player: {
            player1: { 
              name: game.player1&.username || 'Unknown', 
              avatar: game.player1&.avatar_url || '', 
              elo: game.player1&.elo || 0 
            },
            player2: { 
              name: game.player2&.username || 'Waiting...', 
              avatar: game.player2&.avatar_url || '', 
              elo: game.player2&.elo || 0  
            }
          },
          last_move: nil
        }, status: :ok
      end
    end
  end
end