require 'rails_helper'

RSpec.describe 'Conexion a Base de Datos', type: :model do
  it 'esta conectada a PostgreSQL de forma exitosa' do
    expect(ActiveRecord::Base.connection.active?).to be true
  end
end
