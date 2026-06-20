class CreateSudokuGames < ActiveRecord::Migration[8.1]
  def change
    create_table :sudoku_games do |t|
      # Cambiamos player por user y le decimos explícitamente a qué tabla apuntar
      t.references :user, null: false, foreign_key: { to_table: :users }
      t.text :board
      t.string :status
      t.string :difficulty

      t.timestamps
    end
  end
end