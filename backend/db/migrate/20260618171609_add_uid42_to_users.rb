class AddUid42ToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :uid42, :integer
  end
end
