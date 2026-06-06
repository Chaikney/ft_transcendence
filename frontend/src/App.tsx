import { useEffect, useRef } from 'react';
import { SudokuBoard } from './features/sudoku';
import { useMatchStore } from './store';
import { mockSudokuGame } from './mocks';

export default function App() {
  const sudokuGame = useMatchStore((s) => s.sudokuGame);
  const setSudokuGame = useMatchStore((s) => s.setSudokuGame);
  
  // Usamos un 'ref' para guardar el cable del enchufe y poder usarlo al hacer un movimiento
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Cargamos el tablero simulado primero para que la pantalla no explote
    setSudokuGame(mockSudokuGame);

    // 2. Buscamos el token de seguridad
    const token = "token_maestro_temporal";
    if (!token) {
      console.warn("🔴 No hay token. Haz login en la web para que Rails te deje entrar.");
      return;
    }

    // 3. ¡Llamamos a tu servidor!
    const socket = new WebSocket(`ws://localhost:3000/cable?token=${token}`);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log('🟢 ¡Conectado al backend de Rails!');
      
      // Entramos a la sala 7
      const suscripcion = {
        command: "subscribe",
        identifier: JSON.stringify({ channel: "GameChannel", game_id: "7" })
      };
      socket.send(JSON.stringify(suscripcion));
    };

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === "ping") return; // Ignoramos el ruido de fondo
      
      console.log('⚡ ActionCable responde:', response);
      
      // Aquí, en el futuro, si tu backend manda el nuevo tablero, harías algo como:
      // if (response.message && response.message.gameState) {
      //   setSudokuGame(response.message.gameState);
      // }
    };

    return () => {
      socket.close();
    };
  }, [setSudokuGame]);

  if (!sudokuGame) {
    return <div>Loading...</div>;
  }

  return (
    <SudokuBoard
      gameState={sudokuGame}
      originalGrid={mockSudokuGame.grid}
      onMove={(payload) => {
        console.log('Jugador mueve:', payload);
        
        // 4. Cuando el jugador mueve una ficha, se lo enviamos a Rails
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const jugada = {
            command: "message",
            identifier: JSON.stringify({ channel: "GameChannel", game_id: "7" }),
            data: JSON.stringify({ action: "play_move", ...payload })
          };
          wsRef.current.send(JSON.stringify(jugada));
        }
      }}
    />
  );
}