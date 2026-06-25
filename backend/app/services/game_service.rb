class GameService

  # ==========================================
  # MÉTODOS PÚBLICOS (Llamados desde fuera)
  # ==========================================

  # -- AJEDREZ --
  def self.process_chess_move(game_id, move_data)
    engine = ChessEngine.new(game_id)
    new_state = engine.move(move_data['from'], move_data['to'])
    ActionCable.server.broadcast("game_#{game_id}", new_state)
  end

  # -- SUDOKU --

  def self.generate_sudoku_board(difficulty)
    SudokuGenerator.generate(difficulty)
  end 

  def self.process_sudoku_move(game_id, row, col, value)
    game = Game.find(game_id)
    board = game.current_board.dup
    initial = game.initial_board

    index = (row * 9) + col

    # 1. REGLA DE ORO: ¿Es una casilla bloqueada (de las iniciales)?
    if initial[index] != '0'
      # Si intenta borrar o cambiar un número fijo, le decimos que no por WebSockets
      channel_name = "game_channel_sudoku-#{game_id.to_s.rjust(3, '0')}"
      ActionCable.server.broadcast(channel_name, { type: 'error', message: 'No puedes modificar las casillas iniciales' })
      return false # Devolvemos false para que el controlador lance un 422 (que React debería ignorar suavemente)
    end

    # 2. Es una casilla vacía: Le dejamos poner el número que quiera (incluso '0' para borrar)
    board[index] = value.to_s
    game.update!(current_board: board)

    # 3. Comprobamos si el tablero está lleno y correcto
    won = sudoku_solved?(board)

    if won
      game.update!(status: 'finished')
      # Aquí en el futuro puedes añadir game.finalize_match(jugador) para subirle el Elo
    end

    # 4. Avisamos a React por el canal correcto para que pinte el número
    grid_matrix = board.chars.map(&:to_i).each_slice(9).to_a
    channel_name = "game_channel_sudoku-#{game_id.to_s.rjust(3, '0')}"

    # Preparamos el paquete EXACTAMENTE como lo pide React
    # React espera: { type: 'sudoku_updated', game: { game_id: '...', status: '...', grid: [...] } }
    payload = { 
      type: 'sudoku_updated', 
      game: {
        game_id: "sudoku-#{game_id.to_s.rjust(3, '0')}",
        difficulty: 'easy',
        status: won ? 'won' : 'active',
        grid: grid_matrix
      }
    }

    ActionCable.server.broadcast(channel_name, payload)

    return true
  end

  # ==========================================
  # MÉTODOS PRIVADOS (Solo uso interno)
  # ==========================================

  class << self
    private

    # El nuevo comprobador: Solo dice TRUE si está lleno y perfecto
    def sudoku_solved?(board)
      # Si hay algún '0' (casilla vacía), el juego sigue
      return false if board.include?('0')

      # Comprobamos que las 9 filas, columnas y cuadrantes tienen los números del 1 al 9 sin repetir
      (0..8).each do |i|
        # Comprobar Fila
        row = board[i * 9, 9].chars
        return false unless row.uniq.size == 9

        # Comprobar Columna
        col = (0..8).map { |r| board[r * 9 + i] }
        return false unless col.uniq.size == 9

        # Comprobar Cuadrante 3x3
        start_row = (i / 3) * 3
        start_col = (i % 3) * 3
        quad = []
        (0..2).each do |r|
          (0..2).each do |c|
            quad << board[((start_row + r) * 9) + (start_col + c)]
          end
        end
        return false unless quad.uniq.size == 9
      end

      # Si pasa todas las pruebas y no hay ceros, ¡ha ganado!
      true
    end
  end
end