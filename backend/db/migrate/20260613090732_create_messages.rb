class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      # Le decimos explícitamente que busque en la tabla :users
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.references :receiver, null: false, foreign_key: { to_table: :users }
      
      # Le añadimos null: false para que nadie envíe mensajes fantasma (vacíos)
      t.text :content, null: false

      t.timestamps
    end
  end
end