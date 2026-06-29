# This file ensures the existence of records required to run the application.
# It is idempotent: it will not create duplicates if run multiple times.

# 1. Crear o encontrar el usuario necesario para los Sudokus
# Ajusta los campos según lo que requiera tu modelo User (email, password, etc.)
user = User.find_or_create_by!(id: 1) do |u|
  u.username = "default_user"
  u.email = "default@example.com"
  u.password = "password123" # Descomenta si tu modelo requiere contraseña
end

# 2. Crear o encontrar el juego de Sudoku asociado
# Usamos find_or_create_by para evitar el error de llave duplicada
SudokuGame.find_or_create_by!(id: 1) do |game|
  game.user = user
  game.board = "530070000600195000098000060800060003400803001700020006060000280000419005000080079"
  game.difficulty = "easy"
  game.status = "in_progress"
end

puts "Seeds loaded successfully!"
