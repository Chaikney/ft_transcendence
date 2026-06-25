class AddAdminToUsers < ActiveRecord::Migration[7.0]
  def change
    # Fíjate en el ", default: false" al final
    add_column :users, :admin, :boolean, default: false
  end
end