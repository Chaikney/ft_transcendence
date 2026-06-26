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
  // Usamos un ref para mantener la suscripción viva
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!cable) return;

    // Si ya estamos suscritos, no lo volvemos a hacer
    if (subscriptionRef.current) return;

    subscriptionRef.current = cable.subscriptions.create(
      { channel: "MatchmakingChannel" },
      {
        connected() {
          console.log("⚔️ MATCHMAKING: Conectado a la sala de espera.");
        },
        received(data) {
          if (data.action === 'match_found') {
            console.log(`🎉 ¡PARTIDA ENCONTRADA! Oponente: ${data.opponent.username} | Sala: ${data.room_id}`);
            
            try {
              const gameType = data.room_id.split('-')[0];

              // 1. Pasamos al estado LOBBY guardando al rival
              useMatchStore.getState().setLobby(gameType, data.opponent);
              
              // 2. Le damos 100ms a React para que asimile el estado antes de teletransportar
              setTimeout(() => {
                console.log(`🚀 Teletransportando a: /game/${gameType}/${data.room_id}`);
                navigate(`/game/${gameType}/${data.room_id}`);
              }, 100);

            } catch (err) {
              console.error("🚨 Error crítico al intentar entrar a la sala:", err);
            }
          }
        }
      }
    );

    // IMPORTANTE: Quitamos el 'return unsubscribe' para que no corte el cable
    // cada vez que React re-renderiza la LandingPage.
  }, [cable, navigate]);

  // Funciones que llamaremos desde la interfaz
  const joinQueue = (gameType: 'chess' | 'sudoku') => {
    if (subscriptionRef.current) {
      useMatchStore.getState().startLoading(gameType);
      
      // Le damos un respiro de 100ms para asegurar que el canal de Rails esté "Ready"
      setTimeout(() => {
        subscriptionRef.current.perform('join_queue', { game_type: gameType });
      }, 100);
    }
  };

  const leaveQueue = () => {
    const currentType = useMatchStore.getState().gameType;
    if (subscriptionRef.current && currentType) {
      subscriptionRef.current.perform('leave_queue', { game_type: currentType });
      useMatchStore.getState().resetMatch();
    }
  };

  return { joinQueue, leaveQueue };
};