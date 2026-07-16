ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Ejecuta los tests en paralelo para que vayan más rápido
    parallelize(workers: :number_of_processors)

    # Configura los fixtures (datos de prueba) si los tuvierais
    fixtures :all

    # Aquí podréis meter métodos de ayuda para todos vuestros tests en el futuro
  end
end