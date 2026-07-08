Rails.application.routes.draw do
  get 'health', to: ->(env) { [200, {'Content-Type' => 'application/json'}, [{status: 'ok'}.to_json]] }

  namespace :api do
    # --- JUEGOS ---
    # Chess
    namespace :chess do
      resources :games, param: :game_id, only: [:show]
      post 'move', to: 'games#move'
      post 'ai_move', to: 'games#ai_move'
    end

    # Sudoku
    namespace :sudoku do
      resources :games, param: :game_id, only: [:show, :create, :update]
    end

    # Partidas generales (ELO based)
    resources :games, only: [:create] do
      member do
        patch :finish, to: 'games#update'
      end
    end

    # --- RANKING (Unificado) ---
    get 'leaderboard', to: 'leaderboards#index'

    # --- AUTHENTICACIÓN ---
    post 'register', to: 'auth#register'
    post 'login', to: 'auth#login'
    post '42/callback', to: 'oauth#callback_42'
    post 'verify-email', to: 'auth#verify_email' # 🚀 NUEVA RUTA
    
    # --- USUARIO Y PERFIL --- 

    # --- USUARIO Y PERFIL ---
    get    '/users', to: 'users#index'    # 🛠️ CORRECCIÓN: 'users' en plural
    get    '/profile', to: 'users#profile'
    put    '/profile', to: 'users#update'
    delete '/profile', to: 'users#destroy'

    # ... [código intermedio] ...

    # --- SOCIAL Y AMIGOS ---
    resources :rooms, only: [:index] do
      resources :messages, only: [:index]
    end

    get    '/friends',           to: 'friendships#index'
    post   '/friends/request',   to: 'friendships#create'
    patch  '/friends/accept',    to: 'friendships#accept'
    delete '/friends/reject',    to: 'friendships#reject'
    delete '/friends/remove',    to: 'friendships#remove' # 🚀 NUEVO: La guillotina

    # --- ADMIN Y SISTEMA ---
    scope '/admin' do
      get    'users',       to: 'admin#index'
      delete 'users/:id',   to: 'admin#destroy'
      patch  'users/:id/ban', to: 'admin#ban' 
    end

    get 'status', to: 'status#index'
  end
end