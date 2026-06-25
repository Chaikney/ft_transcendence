Rails.application.routes.draw do
  get 'health', to: ->(env) { [200, {'Content-Type' => 'application/json'}, [{status: 'ok'}.to_json]] }

  namespace :api do

    # 🟢 LA SOLUCIÓN: Rutas directas al controlador general Api::GamesController
    get 'chess/games/:game_id', to: 'games#show'
    
    get 'sudoku/games/:game_id', to: 'games#show'
    post 'sudoku/move', to: 'games#move'

    scope '/admin' do
      get 'users', to: 'admin#index'
      delete 'users/:id', to: 'admin#destroy'
      patch 'users/:id/ban', to: 'admin#ban' 
    end

    get 'status', to: 'status#index'
    
    # Añadimos :show aquí por si acaso el frontend recorta la URL
    resources :games, only: [:show, :create] do
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

  end
end