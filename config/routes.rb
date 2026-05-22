Rails.application.routes.draw do
  namespace :api do
    get 'status', to: 'status#index'
    
    resources :games, only: [:index, :show, :create, :update]
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
  end
end