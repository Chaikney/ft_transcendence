Rails.application.routes.draw do
  get 'health', to: ->(env) { [200, {'Content-Type' => 'application/json'}, [{status: 'ok'}.to_json]] }

  namespace :api do

    # --- CHESS ---
    namespace :chess do
      resources :games, param: :game_id, only: [:show]
      post 'move', to: 'games#move'
      post 'ai_move', to: 'games#ai_move'
    end

    # --- SUDOKU ---
    namespace :sudoku do
      resources :games, param: :game_id, only: [:show, :create, :update]
    end

    scope '/admin' do
      get 'users', to: 'admin#index'
      delete 'users/:id', to: 'admin#destroy'
      patch 'users/:id/ban', to: 'admin#ban' 
    end

    get 'status', to: 'status#index'
    
    resources :games, only: [:create] do
      member do
        patch :finish, to: 'games#update'
      end
    end

    # --- Authentication ---
    post 'register', to: 'auth#register'
    post 'login', to: 'auth#login'
    
    # Auth de 42 
    post '42/callback', to: 'oauth#callback_42'

    # --- Usuarios y estadísticas ---
    get 'leaderboard', to: 'stats#leaderboard'
    get '/profile', to: 'users#profile'
    put '/profile', to: 'users#update'
    delete '/profile', to: 'users#destroy'

    # --- Friendships ---
    get '/friends', to: 'friendships#index'
    post '/friends/request', to: 'friendships#create'
    patch '/friends/accept', to: 'friendships#accept'
    delete '/friends/reject', to: 'friendships#reject'

    get 'profile/2fa/enable', to: 'users#enable_2fa'
    post 'profile/2fa/verify', to: 'users#verify_2fa'

  end
end