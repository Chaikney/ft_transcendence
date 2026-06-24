# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

SudokuGame.create!(
  id: 1, 
  user_id: 1, 
  board: "530070000600195000098000060800060003400803001700020006060000280000419005000080079", 
  difficulty: "easy", 
  status: "in_progress"
)