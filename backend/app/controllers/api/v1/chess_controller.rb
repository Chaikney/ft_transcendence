module Api
  module V1
    class ChessController < ApplicationController
      before_action :authorize_request

      def show
        game = find_game!
        return unless game

        render json: { data: serialize_game(game) }, status: :ok
      end

      def move
        game = find_game!
        return unless game

        payload = Chess::MoveService.new(game: game).apply_move(from: move_params[:from], to: move_params[:to], promotion: move_params[:promotion])
        GameChannel.broadcast_move_updated(game.id, payload)
        render json: { data: payload }, status: :ok
      rescue Chess::AiClient::Error => e
        render json: { error: e.message }, status: :bad_gateway
      end

      def ai_move
        game = find_game!
        return unless game

        payload = Chess::MoveService.new(game: game).request_ai_move
        GameChannel.broadcast_move_updated(game.id, payload)
        render json: { data: payload }, status: :ok
      rescue Chess::AiClient::Error => e
        render json: { error: e.message }, status: :bad_gateway
      end

      private

      def find_game!
        game = Game.find_by(id: params[:id] || params[:game_id])
        return render(json: { error: 'Game not found' }, status: :not_found) unless game

        unless game.player1_id == @current_user.id || game.player2_id == @current_user.id
          render json: { error: 'You are not part of this game' }, status: :forbidden
          return
        end

        game
      end

      def move_params
        params.permit(:game_id, :from, :to, :promotion)
      end

      def serialize_game(game)
        fen = game.current_board.presence || game.initial_board.presence || Chess::MoveService::STARTING_FEN
        {
          game_id: game.id.to_s,
          fen: fen,
          turn: fen.split(' ')[1] == 'b' ? 'black' : 'white',
          status: game.status == 'finished' ? 'draw' : 'active',
          last_move: nil
        }
      end
    end
  end
end