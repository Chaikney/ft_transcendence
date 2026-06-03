class CreateGames < ActiveRecord::Migration[8.1]
  def change
    create_table :games do |t|
      t.string :initial_board
      t.string :current_board
      t.string :status

      t.timestamps
    end
  end
end
