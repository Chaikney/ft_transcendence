# db/seeds.rb

puts "🧹 Limpiando la base de datos..."
Game.destroy_all
User.destroy_all

puts "👤 Creando usuarios de prueba..."
# Creamos a los dos contrincantes clásicos
player1 = User.create!(
  username: "Nick_42",
  email: "nick@transcendence.42",
  password: "password123",
  elo: 1200
)

player2 = User.create!(
  username: "Manu_42",
  email: "manu@transcendence.42",
  password: "password123",
  elo: 1200
)

puts "🧩 Generando partida de Sudoku..."
# Un tablero inicial fácil. Los ceros son casillas vacías.
initial_sudoku = "530070000600195000098000060800060003400803001700020006060000280000419005000080079"

Game.create!(
  player1: player1,
  player2: player1, # En Sudoku a veces juegas solo
  status: 'in_progress',
  initial_board: initial_sudoku,
  current_board: initial_sudoku
)

puts "♟️ Generando partida de Ajedrez..."
Game.create!(
  player1: player1,
  player2: player2,
  status: 'in_progress',
  current_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" # Posición inicial estándar
)

puts "✅ ¡Semillas plantadas con éxito! Base de datos lista para jugar."