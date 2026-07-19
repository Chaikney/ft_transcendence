import { useEffect, useRef, useMemo } from "react";
// @ts-ignore
import { createConsumer } from "@rails/actioncable";
// @ts-ignore
import type { Consumer } from "@rails/actioncable";
import { useNavigate } from "react-router-dom";
import { useMatchStore, useRadarStore } from "@/store";

const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'wss://10.13.1.6:8443/cable';

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
  const cable = useMemo(() => getConsumer(), []);
  
  useEffect(() => {
    if (!cable) return;
    
    cable.connection.events.error = () => {};
    //cable.connection.events.open = () => console.log("✅ WebSocket Connected!");
    
  }, [cable]);

  return { cable };
};

// 📡 EL RADAR
export const useAppearanceRadar = () => {
  const { cable } = useActionCable();
  const radarRef = useRef<any>(null);

  useEffect(() => {
    if (!cable) return;
    
    if (radarRef.current) {
        radarRef.current.unsubscribe();
    }

    radarRef.current = cable.subscriptions.create(
      { channel: "AppearanceChannel" },
      {
        connected() {
          //console.log("📡 RADAR ONLINE: Conectado.");
          useRadarStore.getState().setStatus('connected'); 
        },
        disconnected() {
          //console.log("📡 RADAR OFFLINE: Conexión perdida.");
          useRadarStore.getState().setStatus('disconnected');
        },
        // FIX: Añadido ': any' a data
        received(data: any) {
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

  useEffect(() => {
    if (!cable) return;

    // 🛡️ 1. Buscamos si el canal ya existe para no duplicarlo (por el Strict Mode de React)
    const channelIdentifier = JSON.stringify({ channel: "MatchmakingChannel" });
    const existingSub = cable.subscriptions.findAll(channelIdentifier)[0];

    if (!existingSub) {
      cable.subscriptions.create(
        { channel: "MatchmakingChannel" },
        {
          connected() {
            //console.log("⚔️ MATCHMAKING: Canal de Rails conectado y escuchando.");
          },
          // FIX: Añadido ': any' a data
          received(data: any) {
            if (data.action === 'match_found') {
              const gameType = data.room_id.split('-')[0];
              useMatchStore.getState().setLobby(gameType, data.opponent);
              navigate(`/game/${gameType}/${data.room_id}`);
            }
          }
        }
      );
    }

    // 🗑️ IMPORTANTE: No devolvemos la función con el `unsubscribe()`. 
    // Así, cuando cambies a la pantalla de carga, el cable seguirá vivo.
  }, [cable, navigate]);

  const joinQueue = (gameType: 'chess' | 'sudoku') => {
    if (!cable) return;
    
    // Rescatamos el canal global
    const channelIdentifier = JSON.stringify({ channel: "MatchmakingChannel" });
    const sub = cable.subscriptions.findAll(channelIdentifier)[0];
    
    if (sub) {
      useMatchStore.getState().startLoading(gameType);
      // Sin setTimeouts raros, disparamos directo
      sub.perform('join_queue', { game_type: gameType });
    }
  };

  const leaveQueue = () => {
    if (!cable) return;
    
    const currentType = useMatchStore.getState().gameType;
    const channelIdentifier = JSON.stringify({ channel: "MatchmakingChannel" });
    const sub = cable.subscriptions.findAll(channelIdentifier)[0];
    
    if (sub && currentType) {
      sub.perform('leave_queue', { game_type: currentType });
      useMatchStore.getState().resetMatch();
      
      // Aquí SÍ cortamos el cable porque el usuario ha cancelado la búsqueda manualmente
      sub.unsubscribe();
    }
  };

  return { joinQueue, leaveQueue };
};