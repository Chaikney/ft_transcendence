class SudokuGenerator
  # Partimos de un tablero de Sudoku 100% resuelto y válido.
  BASE_BOARD = "435269781682571493197834562826195347374682915951743628519326874248957136763418259"

  def self.generate(difficulty = 'easy')
    # Convertimos el texto gigante en una lista de 81 caracteres individuales
    board = BASE_BOARD.chars

    # MAGIA 1: Mezclamos los números. 
    numeros_originales = ('1'..'9').to_a
    numeros_mezclados = numeros_originales.shuffle
    
    board.map! do |casilla|
      indice = numeros_originales.index(casilla)
      numeros_mezclados[indice]
    end

    # MAGIA 2: Ajustamos los "agujeros" según la dificultad
    holes = case difficulty
            when 'hard' then 55   # 55 casillas vacías (muy difícil)
            when 'medium' then 45 # 45 casillas vacías (normal)
            else 35               # 35 casillas vacías (fácil)
            end

    # Elegimos las posiciones al azar del 0 al 80
    posiciones_a_borrar = (0..80).to_a.sample(holes)
    
    posiciones_a_borrar.each do |posicion|
      board[posicion] = '0' # ¡Cambiado a '0' para que coincida con React y PostgreSQL!
    end

    # Volvemos a unir los 81 caracteres en un solo texto y lo devolvemos
    board.join
  end
end