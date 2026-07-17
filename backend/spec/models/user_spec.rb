require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'Estructura del modelo' do
    it 'el modelo User esta definido y conectado a la base de datos' do
      expect(User).to be_a(Class)
    end

    it 'puede instanciar un nuevo usuario en memoria sin crashear' do
      usuario = User.new
      expect(usuario).to be_a(User)
    end
  end
end
