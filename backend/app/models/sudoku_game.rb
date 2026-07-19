class SudokuGame < ApplicationRecord
  belongs_to :user

  validates :status, presence: true
  validates :difficulty, presence: true

  # ── Configuración de Puntos ──────────────────────────────────────────
  POINTS_BY_DIFFICULTY = {
    'easy'   => 10,
    'medium' => 25,
    'hard'   => 50
  }.freeze

  # ── Lógica de Finalización ──────────────────────────────────────────
  def finalize_game!
    # Evitar ejecutar la lógica si ya está finalizado
    return if status == 'finished'

    points = POINTS_BY_DIFFICULTY.fetch(difficulty, 10)

    user.transaction do
      user.elo += points
      user.wins += 1
      user.save!
      
      update!(status: 'finished')
    end
  end

  # Valida si el string de 81 caracteres es un Sudoku válido según las reglas
  def self.valid_board?(board_str)
    unless board_str.is_a?(String) && board_str.length == 81
      #Rails.logger.error "SUDOKU DEBUG: El tablero no tiene 81 caracteres o no es string. Longitud: #{board_str&.length}"
      return false
    end

    grid = Array.new(9) { |i| board_str.slice(i * 9, 9).chars.map(&:to_i) }

    9.times do |r|
      9.times do |c|
        val = grid[r][c]
        next if val == 0

        unless valid_placement_in_grid?(grid, r, c, val)
          #Rails.logger.error "SUDOKU DEBUG: Error de validación en fila #{r}, columna #{c}, valor #{val}"
          return false
        end
      end
    end
    true
  end

  def self.valid_placement_in_grid?(grid, row, col, num)
    # Temporalmente ponemos 0 en la posición para no auto-validarse
    original_val = grid[row][col]
    grid[row][col] = 0
    
    # Check row
    return false if grid[row].include?(num)
    
    # Check column
    return false if grid.map { |r| r[col] }.include?(num)
    
    # Check 3x3 box
    box_r = (row / 3) * 3
    box_c = (col / 3) * 3
    box = grid[box_r, 3].flat_map { |r| r[box_c, 3] }
    return false if box.include?(num)
    
    # Restauramos el valor
    grid[row][col] = original_val
    true
  end


  # ── Puzzle Generator ────────────────────────────────────────────────────

  CLUES_BY_DIFFICULTY = {
    'easy'   => 36,
    'medium' => 28,
    'hard'   => 22,
  }.freeze

  def self.generate(difficulty = 'easy')
    grid = build_solved_grid
    clues = CLUES_BY_DIFFICULTY[difficulty] || 36
    puzzle = remove_cells(grid, clues)
    puzzle.flatten.join
  end

  def solved?
    return false unless board.length == 81
    return false if board.include?('0')

    grid = Array.new(9) { |i| board.slice(i * 9, 9).chars.map(&:to_i) }
    valid_set = (1..9).to_a.sort

    grid.each { |row| return false unless row.sort == valid_set }
    9.times { |c| return false unless grid.map { |r| r[c] }.sort == valid_set }

    3.times do |br|
      3.times do |bc|
        box = grid[br * 3, 3].flat_map { |r| r[bc * 3, 3] }
        return false unless box.sort == valid_set
      end
    end

    true
  end

  private

  # Builds a complete valid 9x9 grid using backtracking
  def self.build_solved_grid
    grid = Array.new(9) { Array.new(9, 0) }
    fill_grid(grid)
    grid
  end

  def self.fill_grid(grid)
    row, col = find_empty(grid)
    return true if row.nil? # No empty cells — solved

    (1..9).to_a.shuffle.each do |num|
      if valid_placement?(grid, row, col, num)
        grid[row][col] = num
        return true if fill_grid(grid)
        grid[row][col] = 0
      end
    end

    false
  end

  def self.find_empty(grid)
    9.times do |r|
      9.times do |c|
        return [r, c] if grid[r][c] == 0
      end
    end
    [nil, nil]
  end

  def self.valid_placement?(grid, row, col, num)
    # Check row
    return false if grid[row].include?(num)

    # Check column
    return false if grid.map { |r| r[col] }.include?(num)

    # Check 3x3 box
    box_r = (row / 3) * 3
    box_c = (col / 3) * 3
    box = grid[box_r, 3].flat_map { |r| r[box_c, 3] }
    return false if box.include?(num)

    true
  end

  # Removes cells from solved grid to create a puzzle
  def self.remove_cells(grid, clues)
    puzzle = grid.map(&:dup)
    cells_to_remove = 81 - clues
    positions = (0..80).to_a.shuffle.first(cells_to_remove)

    positions.each do |pos|
      puzzle[pos / 9][pos % 9] = 0
    end

    puzzle
  end
end