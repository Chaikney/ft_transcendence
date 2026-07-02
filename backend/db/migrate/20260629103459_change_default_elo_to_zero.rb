class ChangeDefaultEloToZero < ActiveRecord::Migration[8.1]
  def change
    # Cambia el valor por defecto a 0
    change_column_default :users, :elo, 0
    
    # Actualiza los usuarios existentes
    User.update_all(elo: 0)
  end
end