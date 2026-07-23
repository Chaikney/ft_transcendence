import { useEffect, useState, useRef } from "react";
// @ts-ignore
import { createConsumer } from "@rails/actioncable";
// @ts-ignore
import type { Consumer, Subscription } from "@rails/actioncable";
import { useNavigate } from "react-router-dom";
import { useMatchStore, useRadarStore } from "@/store";
import { BASE_URL } from "@services/api";

const CABLE_URL = import.meta.env.VITE_CABLE_URL ?? 'wss://10.13.2.5:8443/cable';

let globalConsumerPromise: Promise<Consumer | null> | null = null;
let activeConsumer: Consumer | null = null;

export const getConsumer = async (): Promise<Consumer | null> => {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;

  if (activeConsumer && activeConsumer.subscriptions) {
    return activeConsumer;
  }

  if (!globalConsumerPromise) {
    globalConsumerPromise = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/action_cable/ticket`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error("Error obteniendo ticket");
        const data = await res.json();

        if (data?.ticket) {
          const instance = createConsumer(`${CABLE_URL}?ticket=${data.ticket}`);
          // Esperar a que la estructura subscriptions exista
          if (instance && instance.subscriptions) {
            activeConsumer = instance;
            return activeConsumer;
          }
        }
        return null;
      } catch (err) {
        console.error("🚨 Error inicializando ActionCable:", err);
        globalConsumerPromise = null;
        activeConsumer = null;
        return null;
      }
    })();
  }

  return globalConsumerPromise;
};

export const useActionCable = () => {
  const [cable, setCable] = useState<Consumer | null>(activeConsumer);

  useEffect(() => {
    let isMounted = true;

    getConsumer().then((consumer) => {
      if (isMounted && consumer?.subscriptions) {
        setCable(consumer);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { cable };
};

// 📡 HOOK: RADAR DE PRESENCIA
export const useAppearanceRadar = () => {
  const { cable } = useActionCable();
  const radarRef = useRef<Subscription | null>(null);

  useEffect(() => {
    // 🛡️ Guardia contra objeto null o sin propiedad subscriptions
    if (!cable || !cable.subscriptions) return;

    if (radarRef.current) {
      try { radarRef.current.unsubscribe(); } catch (_) {}
    }

    try {
      radarRef.current = cable.subscriptions.create(
        { channel: "AppearanceChannel" },
        {
          connected() {
            useRadarStore.getState().setStatus('connected');
          },
          disconnected() {
            useRadarStore.getState().setStatus('disconnected');
          },
          received(data: any) {
            if (data?.user_id) {
              useRadarStore.getState().updateUserStatus(data.user_id, data.status === 'online');
            }
          }
        }
      );
    } catch (err) {
      console.warn("Error creando suscripción AppearanceChannel:", err);
    }

    return () => {
      if (radarRef.current) {
        try { radarRef.current.unsubscribe(); } catch (_) {}
        radarRef.current = null;
      }
    };
  }, [cable]);
};

// ⚔️ HOOK: MATCHMAKING
export const useMatchmaking = () => {
  const { cable } = useActionCable();
  const navigate = useNavigate();

  useEffect(() => {
    // 🛡️ Guardia contra objeto null o sin propiedad subscriptions
    if (!cable || !cable.subscriptions) return;

    const channelIdentifier = JSON.stringify({ channel: "MatchmakingChannel" });
    
    try {
      const existingSub = cable.subscriptions.findAll(channelIdentifier)[0];

      if (!existingSub) {
        cable.subscriptions.create(
          { channel: "MatchmakingChannel" },
          {
            received(data: any) {
              if (data?.action === 'match_found') {
                const gameType = data.room_id.split('-')[0];
                useMatchStore.getState().setLobby(gameType, data.opponent);
                navigate(`/game/${gameType}/${data.room_id}`);
              } else if (data?.type === 'match_cancelled' || data?.action === 'match_cancelled') {
                useMatchStore.getState().resetMatch();
                navigate('/');
              }
            }
          }
        );
      }
    } catch (err) {
      console.warn("Error creando suscripción MatchmakingChannel:", err);
    }
  }, [cable, navigate]);

  const joinQueue = async (gameType: 'chess' | 'sudoku') => {
    const currentCable = cable || (await getConsumer());
    if (!currentCable?.subscriptions) return;

    const channelIdentifier = JSON.stringify({ channel: "MatchmakingChannel" });
    const sub = currentCable.subscriptions.findAll(channelIdentifier)[0];

    if (sub) {
      useMatchStore.getState().startLoading(gameType);
      sub.perform('join_queue', { game_type: gameType });
    }
  };

  const leaveQueue = async () => {
    const currentCable = cable || (await getConsumer());
    if (!currentCable?.subscriptions) return;

    const currentType = useMatchStore.getState().gameType;
    const channelIdentifier = JSON.stringify({ channel: "MatchmakingChannel" });
    const sub = currentCable.subscriptions.findAll(channelIdentifier)[0];

    if (sub && currentType) {
      sub.perform('leave_queue', { game_type: currentType });
      useMatchStore.getState().resetMatch();
      try { sub.unsubscribe(); } catch (_) {}
    }
  };

  return { joinQueue, leaveQueue };
};