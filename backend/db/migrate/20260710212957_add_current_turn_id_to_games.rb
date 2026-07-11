class AddCurrentTurnIdToGames < ActiveRecord::Migration[8.1]
  def change
    add_column :games, :current_turn_id, :integer
  end
end
