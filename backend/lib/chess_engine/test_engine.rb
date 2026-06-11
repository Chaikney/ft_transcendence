# test_engine.rb
require_relative 'board'
require_relative 'san_parser'

# Función auxiliar para dibujar el tablero en la terminal (como hacía tu compañero en C++)
def print_board(partida)
  puts "\n   a b c d e f g h"
  puts "  -----------------"
  7.downto(0) do |r|
    print "#{r + 1} |"
    (0..7).each do |f|
      piece = partida.board[r][f]
      print "#{piece.get_letter} "
    end
    puts "| #{r + 1}"
  end
  puts "  -----------------"
  puts "   a b c d e f g h\n\n"
end

puts "♟️ Iniciando Motor de Ajedrez (Ruby Port)..."
partida = Board.new

# Lista de movimientos reales en notación algebraica (Apertura Ruy López)
movimientos = ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"]

puts "\nTablero Inicial:"
print_board(partida)

movimientos.each do |mov|
  puts "=> El jugador envía el movimiento: #{mov}"
  
  # 1. El Parser traduce el texto a coordenadas
  parser = SanParser.new(mov)
  m = parser.get_move(mov, partida)
  
  # 2. El Tablero ejecuta el movimiento
  partida.play_move_coords(m.from, m.to)
end

puts "Tablero Final tras los movimientos:"
print_board(partida)

# Verificaciones finales
turno_actual = partida.turn == GameStatus::WHITE ? "Blancas" : "Negras"
puts "✅ Test Completado sin errores de sintaxis."
puts "➡️ Le toca mover a: #{turno_actual}"
puts "➡️ Estado del juego: #{partida.status == GameStatus::CONTINUE ? 'En progreso' : 'Terminado'}"