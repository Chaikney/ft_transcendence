class AddStatsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :wins, :integer, default: 0
    add_column :users, :losses, :integer, default: 0
    add_column :users, :elo, :integer, default: 1000
  end
end