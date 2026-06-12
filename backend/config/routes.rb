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
    
  end
end