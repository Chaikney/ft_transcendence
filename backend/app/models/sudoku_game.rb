class SudokuGame < ApplicationRecord
  # 1. La Relación (Asociación)
  # Esto vincula cada juego a un usuario específico.
  # "player_id" es la clave foránea en la tabla sudoku_games.
  belongs_to :user

  # 2. Las Validaciones
  # Protegen la integridad de los datos.
  # No permitimos crear un juego si falta el status o la dificultad.
  validates :status, presence: true
  validates :difficulty, presence: true
  
  # Nota: El campo 'board' se guarda automáticamente como un texto largo
  # o JSON, permitiendo guardar el estado de las 81 casillas.
end