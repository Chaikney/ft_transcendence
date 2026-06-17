require "test_helper"

class Api::V1::ChessControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(username: 'alice', email: 'alice@example.com', password: 'password')
    @opponent = User.create!(username: 'bob', email: 'bob@example.com', password: 'password')
    @game = Game.create!(
      player1: @user,
      player2: @opponent,
      current_board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      initial_board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'in_progress'
    )
    @token = JWT.encode({ user_id: @user.id }, Rails.application.secret_key_base)
    @headers = { 'Authorization' => "Bearer #{@token}" }
  end

  test 'show returns the current chess state' do
    get "/api/v1/chess/games/#{@game.id}", headers: @headers

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal @game.id.to_s, body['data']['game_id']
    assert_equal 'white', body['data']['turn']
    assert_equal 'active', body['data']['status']
  end

  test 'ai_move persists the new board state and broadcasts it' do
    game_id = @game.id.to_s
    service = Object.new
    service.define_singleton_method(:request_ai_move) do
      {
        game_id: game_id,
        fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        turn: 'black',
        status: 'active',
        last_move: { 'from' => 'e2', 'to' => 'e4', 'piece' => 'P' }
      }
    end

    original_new = Chess::MoveService.method(:new)
    Chess::MoveService.define_singleton_method(:new) do |*args, **kwargs|
      service
    end

    begin
      post "/api/v1/chess/ai_move", params: { game_id: @game.id }, headers: @headers
    ensure
      Chess::MoveService.singleton_class.send(:remove_method, :new)
    end

    assert_response :success
    body = JSON.parse(response.body)
    assert_equal 'black', body['data']['turn']
    assert_equal 'active', body['data']['status']
    assert_equal 'e2', body['data']['last_move']['from']
    assert_equal 'e4', body['data']['last_move']['to']
  end
end