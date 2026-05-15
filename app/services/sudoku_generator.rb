class SudokuGenerator
  # Partimos de un tablero de Sudoku 100% resuelto y válido.
  BASE_BOARD = "435269781682571493197834562826195347374682915951743628519326874248957136763418259"

  def self.generate
    # Convertimos el texto gigante en una lista de 81 caracteres individuales
    board = BASE_BOARD.chars

    # MAGIA 1: Mezclamos los números. 
    # En un Sudoku, si cambias TODOS los 1s por 9s, y TODOS los 9s por 1s, el tablero sigue siendo válido.
    numeros_originales = ('1'..'9').to_a
    numeros_mezclados = numeros_originales.shuffle
    
    board.map! do |casilla|
      indice = numeros_originales.index(casilla)
      numeros_mezclados[indice]
    end

    # MAGIA 2: Hacer "agujeros". 
    # Un Sudoku normal suele tener unas 45 casillas vacías.
    # Elegimos 45 posiciones al azar del 0 al 80 y las sustituimos por un punto.
    posiciones_a_borrar = (0..80).to_a.sample(45)
    
    posiciones_a_borrar.each do |posicion|
      board[posicion] = '.'
    end

    # Volvemos a unir los 81 caracteres en un solo texto y lo devolvemos
    board.join
  end
end