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
movimientos = ["Nf3", "d5", "d4", "c6", "c4", "e6", "Nbd2", "Nf6", "e3", "Nbd7", 
  "Bd3", "Bd6", "e4", "dxe4", "Nxe4", "Nxe4", "Bxe4", "O-O", "O-O", "h6", 
  "Bc2", "e5", "Re1", "exd4", "Qxd4", "Bc5", "Qc3", "a5", "a3", "Nf6", 
  "Be3", "Bxe3", "Rxe3", "Bg4", "Ne5", "Re8", "Rae1", "Be6", "f4", "Qc8", 
  "h3", "b5", "f5", "Bxc4", "Nxc4", "bxc4", "Rxe8+", "Nxe8", "Re4", "Nf6", 
  "Rxc4", "Nd5", "Qe5", "Qd7", "Rg4", "f6", "Qd4", "Kh7", "Re4", "Rd8", 
  "Kh1", "Qc7", "Qf2", "Qb8", "Ba4", "c5", "Bc6", "c4", "Rxc4", "Nb4", 
  "Bf3", "Nd3", "Qh4", "Qxb2", "Qg3", "Qxa3", "Rc7", "Qf8", "Ra7", "Ne5", 
  "Rxa5", "Qf7", "Rxe5", "fxe5", "Qxe5", "Re8", "Qf4", "Qf6", "Bh5", "Rf8", 
  "Bg6+", "Kh8", "Qc7", "Qd4", "Kh2", "Ra8", "Bh5", "Qf6", "Bg6", "Rg8"]

puts "\nTablero Inicial:"
print_board(partida)

movimientos.each do |mov|
  puts "=> El jugador envía el movimiento: #{mov}"
  
  # 1. El Parser traduce el texto a coordenadas
  parser = SanParser.new(mov)
  m = parser.get_move(mov, partida)
  
  # 2. El Tablero ejecuta el movimiento
  partida.play_move_coords(m.from, m.to)
  print_board(partida)
end

puts "Tablero Final tras los movimientos:"
print_board(partida)

# Verificaciones finales
turno_actual = partida.turn == GameStatus::WHITE ? "Blancas" : "Negras"
puts "✅ Test Completado sin errores de sintaxis."
puts "➡️ Le toca mover a: #{turno_actual}"
puts "➡️ Estado del juego: #{partida.status == GameStatus::CONTINUE ? 'En progreso' : 'Terminado'}"