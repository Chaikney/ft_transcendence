class AddMfaEnabledToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :mfa_enabled, :boolean
  end
end
