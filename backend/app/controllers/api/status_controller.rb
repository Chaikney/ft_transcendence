module Api
  class StatusController < ApplicationController
    def index
      render json: { 
        status: "online", 
        message: "¡El backend del Sudoku está vivo y coleando!",
        time: Time.current
      }
    end
  end
end