Rails.application.routes.draw do
  namespace :api do
    get 'status', to: 'status#index'
    
    resources :games, only: [:index, :show, :create, :update]
  end
end