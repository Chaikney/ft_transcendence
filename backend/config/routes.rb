Rails.application.routes.draw do

  mount ActionCable.server => '/cable'

  namespace :api do
    get 'status', to: 'status#index'
    
    resources :games, only: [:create] do
      member do
        patch :finish, to: 'games#update'
      end
    end
    
    post 'register', to: 'auth#register'
    post 'login', to: 'auth#login'
    
    get 'leaderboard', to: 'stats#leaderboard'
    get '/profile', to: 'users#profile'
    put '/profile', to: 'users#update'
    delete '/profile', to: 'users#destroy'

    # --- Friendships ---
    get '/friends', to: 'friendships#index'
    post '/friends/request', to: 'friendships#create'
    patch '/friends/accept', to: 'friendships#accept'
    delete '/friends/reject', to: 'friendships#reject'
    
    get 'users/:id/matches', to: 'matches#index'
    
    resources :messages, only: [:create]
    get '/messages/history/:friend_id', to: 'messages#index'
    
    # --- Blocks / Blacklist ---
    get '/blocks', to: 'blocks#index'
    post '/blocks', to: 'blocks#create'
    delete '/blocks/:blocked_id', to: 'blocks#destroy'

    # --- Two Factor Authentication (2FA) ---
      get '2fa/generate', to: 'two_factor#generate'
      post '2fa/verify', to: 'two_factor#verify'
      delete '2fa/disable', to: 'two_factor#disable'
  end
end