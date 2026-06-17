Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      get 'status', to: 'status#index'

      resources :games, only: [:create] do
        member do
          patch :finish, to: 'games#update'
        end
      end

      get 'chess/games/:id', to: 'chess#show'
      post 'chess/move', to: 'chess#move'
      post 'chess/ai_move', to: 'chess#ai_move'

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

      post '/auth/42/callback', to: 'auth42#callback'
    end
  end
end