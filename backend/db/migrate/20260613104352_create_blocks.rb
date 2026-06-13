class CreateBlocks < ActiveRecord::Migration[8.1]
  def change
    create_table :blocks do |t|
      # Cambiamos "true" por "{ to_table: :users }"
      t.references :blocker, null: false, foreign_key: { to_table: :users }
      t.references :blocked, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end
    
    # Añadimos esta línea para que nadie pueda bloquear dos veces a la misma persona
    add_index :blocks, [:blocker_id, :blocked_id], unique: true
  end
end