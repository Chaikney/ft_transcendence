class SetupArenaForGames < ActiveRecord::Migration[7.1]
  def change
    # Definimos quiénes luchan
    add_column :games, :player1_id, :integer
    add_column :games, :player2_id, :integer
    
    # Marcador de la batalla
    add_column :games, :p1_score, :integer, default: 0
    add_column :games, :p2_score, :integer, default: 0
    
    # Estado del combate
   # add_column :games, :status, :string, default: 'finished'

    # Conectamos estos IDs con la tabla de usuarios (nuestros guerreros)
    add_foreign_key :games, :users, column: :player1_id
    add_foreign_key :games, :users, column: :player2_id
  end
end