class AddBannedToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :banned, :boolean
  end
end
