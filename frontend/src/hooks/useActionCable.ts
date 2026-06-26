import { useEffect, useRef } from "react";
import { createConsumer } from "@rails/actioncable";
import type { Consumer } from "@rails/actioncable";
import { useNavigate } from "react-router-dom";
import { useMatchStore } from "@/store";
import { useRadarStore } from '@/store';


// Usamos la variable de entorno, y si falla, forzamos la ruta al puerto 3000
const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'ws://localhost:3000/cable';

let consumer: Consumer | null = null;

export const getConsumer = (): Consumer | null => {
  const token = localStorage.getItem('auth_token');
  
  // Si no hay token, no intentamos conectar (evitamos errores 401)
  if (!token) return null;

  if (!consumer) {
    const urlWithAuth = `${CABLE_URL}?token=${token}`;
    consumer = createConsumer(urlWithAuth);
    // Configuración para permitir credenciales entre dominios/puertos
  }
  return consumer;
};

export const useActionCable = () => {
  // Usamos un ref para mantener la instancia del cable
  const cable = getConsumer();
  
  useEffect(() => {
    if (!cable) return;
    
    cable.connection.events.error = (err) => console.error("WebSocket Error:", err);
    cable.connection.events.open = () => console.log("✅ WebSocket Connected!");
  }, [cable]);

  return { cable };
};

// 📡 EL RADAR
export const useAppearanceRadar = () => {
  const { cable } = useActionCable();

  useEffect(() => {
    if (!cable) return;

    const subscription = cable.subscriptions.create(
      { channel: "AppearanceChannel" },
      {
        connected() {
          console.log("📡 RADAR ONLINE: Conectado a la red de Transcendence.");
          // 👇 ESTO PONE EL PUNTITO VERDE
          useRadarStore.getState().setStatus('connected'); 
        },
        disconnected() {
          console.log("📡 RADAR OFFLINE: Conexión perdida.");
          // 👇 ESTO PONE EL PUNTITO ROJO
          useRadarStore.getState().setStatus('disconnected');
        },
        received(data) {
          console.log(`⚡ ALERTA RADAR: El usuario ID ${data.user_id} está ahora ${data.status.toUpperCase()}`);
          useRadarStore.getState().updateUserStatus(data.user_id, data.status === 'online');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [cable]);
};

export const useMatchmaking = () => {
  const { cable } = useActionCable();
  const navigate = useNavigate();
  // Usamos un ref para guardar la suscripción y poder llamar a sus métodos
  const subscriptionRef = useRef<any>(null); 

  useEffect(() => {
    if (!cable) return;

    subscriptionRef.current = cable.subscriptions.create(
      { channel: "MatchmakingChannel" },
      {
        connected() {
          console.log("⚔️ MATCHMAKING: Conectado a la sala de espera.");
        },
        received(data) {
          if (data.action === 'match_found') {
            console.log(`🎉 ¡PARTIDA ENCONTRADA! Oponente: ID ${data.opponent_id} | Sala: ${data.room_id}`);
            
            // 1. Limpiamos el store (quita el estado 'loading')
            useMatchStore.getState().resetMatch();
            
            // 2. Redirigimos al usuario a la partida (ej: /game/chess/chess-a1b2c3d4)
            const gameType = data.room_id.split('-')[0];
            navigate(`/game/${gameType}/${data.room_id}`);
          }
        }
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [cable, navigate]);

  // Funciones que llamaremos desde la interfaz
  const joinQueue = (gameType: 'chess' | 'sudoku') => {
    if (subscriptionRef.current) {
      // Usamos TU método para poner el status en 'loading'
      useMatchStore.getState().startLoading(gameType);
      subscriptionRef.current.perform('join_queue', { game_type: gameType });
    }
  };

  const leaveQueue = () => {
    const currentType = useMatchStore.getState().gameType;
    if (subscriptionRef.current && currentType) {
      subscriptionRef.current.perform('leave_queue', { game_type: currentType });
      // Usamos TU método para devolverlo a 'idle'
      useMatchStore.getState().resetMatch();
    }
  };

  return { joinQueue, leaveQueue };
};