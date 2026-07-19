import { useEffect, useRef } from "react";
import { useActionCable } from "./useActionCable"; // Asegura esta ruta

/**
 * Hook para manejar la conexión de una partida específica (GameChannel).
 * @param gameId - ID de la sala, ej: "chess-123"
 * @param onMessage - Callback que recibe la data del servidor
 */
export const useGameSocket = (
  gameId: string | null, 
  onMessage: (data: any) => void
) => {
  const { cable } = useActionCable();
  // Usamos una referencia para mantener la suscripción persistente
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Si no hay cable (aún no conectado) o no hay partida, no hacemos nada
    if (!cable || !gameId) return;

    // 1. Limpieza de suscripción previa si existe (por seguridad)
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // 2. Crear nueva suscripción
    subscriptionRef.current = cable.subscriptions.create(
      { channel: "GameChannel", game_id: gameId },
      {
        connected() {
          //console.log(`📡 [GameSocket] Conectado a game_${gameId}`);
        },
        disconnected() {
          console.log(`📡 [GameSocket] Desconectado de game_${gameId}`);
        },
        received(data: any) {
          // 3. Ejecutamos el callback pasando la data recibida
          onMessage(data);
        }
      }
    );

    // 4. Cleanup: Al desmontar el componente o cambiar de partida
    return () => {
      if (subscriptionRef.current) {
        //console.log(`📡 [GameSocket] Limpiando suscripción de game_${gameId}`);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [cable, gameId, onMessage]);
};