class AddFenToGames < ActiveRecord::Migration[8.1]
  def change
    add_column :games, :current_fen, :string
  end
end
