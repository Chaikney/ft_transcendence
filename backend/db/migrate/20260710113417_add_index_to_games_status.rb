class AddIndexToGamesStatus < ActiveRecord::Migration[8.1]
  def change
    add_index :games, :status
  end
end
