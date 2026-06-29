class AddFenHistoryToGames < ActiveRecord::Migration[8.1]
  def change
    add_column :games, :fen_history, :json
  end
end
