import { useEffect, useRef } from "react";
import { createConsumer } from "@rails/actioncable";
import type { Consumer } from "@rails/actioncable";
import { useNavigate } from "react-router-dom";
import { useMatchStore, useRadarStore } from "@/store";

const getCableUrl = (): string => {
  const envUrl = import.meta.env.VITE_CABLE_URL;
  
  // 1. Si existe una variable de entorno y es válida, úsala.
  if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('ws')) {
    return envUrl;
  }

  // 2. Si no hay variable, usamos el host del navegador.
  // Nos aseguramos de que no sea una cadena vacía.
  const host = window.location.hostname || 'localhost';
  
  const fallback = `ws://${host}:3000/cable`;
  console.warn("⚠️ Usando fallback automático:", fallback);
  return fallback;
};

// --- SINGLETON DEL CONSUMER ---
let consumer: Consumer | null = null;

export const getConsumer = (): Consumer | null => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) return null;

  if (!consumer) {
    const baseUrl = getCableUrl();
    const urlWithAuth = `${baseUrl}?token=${token}`;
    
    console.log("🚀 Iniciando conexión WebSocket a:", urlWithAuth);
    try {
      consumer = createConsumer(urlWithAuth);
    } catch (e) {
      console.error("Error creando el consumer:", e);
    }
  }
  return consumer;
};

// --- HOOKS ---

export const useActionCable = () => {
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
          console.log("📡 RADAR ONLINE: Conectado.");
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
      subscription.unsubscribe();
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
            
            setTimeout(() => {
              navigate(`/game/${gameType}/${data.room_id}`);
            }, 100);
          }
        }
      }
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
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