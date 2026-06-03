class AddUserToGames < ActiveRecord::Migration[8.1]
  def change
    add_reference :games, :user, null: false, foreign_key: true
  end
end
