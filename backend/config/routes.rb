Rails.application.routes.draw do
  get 'health', to: ->(env) { [200, {'Content-Type' => 'application/json'}, [{status: 'ok'}.to_json]] }
  
  namespace :api do
    get 'health', to: ->(env) { [200, {'Content-Type' => 'application/json'}, [{status: 'ok'}.to_json]] }
    
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

    post '/auth/42/callback', to: 'auth42#callback'
  end
end