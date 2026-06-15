class RemoveUserIdFromGames < ActiveRecord::Migration[7.1]
  def change
    remove_column :games, :user_id if column_exists?(:games, :user_id)
  end
end