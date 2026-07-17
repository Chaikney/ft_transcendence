require 'rails_helper'

RSpec.describe "Configuracion de API", type: :request do
  it 'el entorno de pruebas (test env) esta configurado' do
    expect(Rails.env.test?).to be true
  end
end
