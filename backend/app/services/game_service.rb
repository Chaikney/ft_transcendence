class GameService
  # Este método recibe el ID de la partida y los datos del movimiento del frontend
  def self.process_chess_move(game_id, move_data)
    # 1. Instanciamos el motor (el cerebro que hicimos antes)
    engine = ChessEngine.new(game_id)
    
    # 2. Le pasamos el movimiento. 
    # Según el contrato de TypeScript, el frontend manda "from" y "to"
    new_state = engine.move(move_data['from'], move_data['to'])
    
    # 3. Disparamos la respuesta de vuelta a todos los jugadores conectados a esa partida
    ActionCable.server.broadcast("game_#{game_id}", new_state)
  end
end