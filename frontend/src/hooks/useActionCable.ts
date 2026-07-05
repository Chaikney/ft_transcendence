import { useEffect, useRef, useMemo } from "react";
import { createConsumer } from "@rails/actioncable";
import type { Consumer } from "@rails/actioncable";
import { useNavigate } from "react-router-dom";
import { useMatchStore, useRadarStore } from "@/store";

const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'ws://localhost:3000/cable';

// Singleton global estricto
let globalConsumer: Consumer | null = null;

export const getConsumer = (): Consumer | null => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  if (!globalConsumer) {
    const urlWithAuth = `${CABLE_URL}?token=${token}`;
    globalConsumer = createConsumer(urlWithAuth);
  }
  return globalConsumer;
};

// --- HOOKS ---

export const useActionCable = () => {
  // useMemo asegura que NUNCA evaluemos getConsumer() más de una vez por ciclo de vida
  const cable = useMemo(() => getConsumer(), []);
  
  useEffect(() => {
    if (!cable) return;
    
    // Limpiamos los eventos previos para evitar acumulaciones si React hace Hot-Reload
    cable.connection.events.error = (err) => console.error("WebSocket Error:", err);
    cable.connection.events.open = () => console.log("✅ WebSocket Connected!");
    
  }, [cable]);

  return { cable };
};

// 📡 EL RADAR
export const useAppearanceRadar = () => {
  const { cable } = useActionCable();
  const radarRef = useRef<any>(null); // Guardamos la suscripción aquí

  useEffect(() => {
    if (!cable) return;
    
    // Si ya existe la suscripción, la matamos antes de crear otra
    if (radarRef.current) {
        radarRef.current.unsubscribe();
    }

    radarRef.current = cable.subscriptions.create(
      { channel: "AppearanceChannel" },
      {
        connected() {
<<<<<<< HEAD
          console.log("📡 RADAR ONLINE: Conectado a la red de Transcendence.");
=======
          console.log("📡 RADAR ONLINE: Conectado.");
>>>>>>> 1b533fd3ef09f21503652a6349c582b5cf0b576d
          useRadarStore.getState().setStatus('connected'); 
        },
        disconnected() {
          console.log("📡 RADAR OFFLINE: Conexión perdida.");
          useRadarStore.getState().setStatus('disconnected');
        },
        received(data) {
          useRadarStore.getState().updateUserStatus(data.user_id, data.status === 'online');
        }
      }
    );

    return () => {
      if (radarRef.current) {
          radarRef.current.unsubscribe();
          radarRef.current = null;
      }
    };
  }, [cable]);
};

// ⚔️ MATCHMAKING
export const useMatchmaking = () => {
  const { cable } = useActionCable();
  const navigate = useNavigate();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!cable) return;
<<<<<<< HEAD

=======
>>>>>>> 1b533fd3ef09f21503652a6349c582b5cf0b576d
    if (subscriptionRef.current) return;

    subscriptionRef.current = cable.subscriptions.create(
      { channel: "MatchmakingChannel" },
      {
        connected() {
          console.log("⚔️ MATCHMAKING: Conectado.");
        },
        received(data) {
          if (data.action === 'match_found') {
            const gameType = data.room_id.split('-')[0];
            useMatchStore.getState().setLobby(gameType, data.opponent);
            
<<<<<<< HEAD
            try {
              const gameType = data.room_id.split('-')[0];
              useMatchStore.getState().setLobby(gameType, data.opponent);
              
              setTimeout(() => {
                console.log(`🚀 Teletransportando a: /game/${gameType}/${data.room_id}`);
                navigate(`/game/${gameType}/${data.room_id}`);
              }, 100);

            } catch (err) {
              console.error("🚨 Error crítico al intentar entrar a la sala:", err);
            }
=======
            setTimeout(() => {
              navigate(`/game/${gameType}/${data.room_id}`);
            }, 100);
>>>>>>> 1b533fd3ef09f21503652a6349c582b5cf0b576d
          }
        }
      }
    );

    return () => {
      if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe();
          subscriptionRef.current = null;
      }
    };
  }, [cable, navigate]);

  const joinQueue = (gameType: 'chess' | 'sudoku') => {
    if (subscriptionRef.current) {
      useMatchStore.getState().startLoading(gameType);
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