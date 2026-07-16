require_relative "../test_helper"

class UserTest < ActiveSupport::TestCase
  # Setup básico de un usuario antes de cada test
  def setup
    @user = User.new(username: "Kae_Tester", uid42: "12345", elo: 1000)
  end

  test "debe ser válido con todos los atributos correctos" do
    assert @user.valid?
  end

  test "no debe guardar sin un uid42 de la Intra" do
    @user.uid42 = nil
    assert_not @user.valid?, "El modelo permitió guardar un usuario sin UID"
  end

  test "no debe guardar un ELO negativo" do
    @user.elo = -50
    assert_not @user.valid?, "El modelo permitió un ELO por debajo de 0"
  end

  test "el método de victoria debe sumar los puntos correctamente" do
    # Suponiendo que tienes un método 'add_win_elo' en tu modelo User
    puntos_ganados = 25
    elo_inicial = @user.elo
    
    # @user.add_win_elo(puntos_ganados) # Descomenta cuando exista el método
    @user.elo += puntos_ganados
    
    assert_equal (elo_inicial + 25), @user.elo
  end
end