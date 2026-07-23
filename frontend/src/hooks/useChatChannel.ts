import { useEffect, useRef } from 'react';
// @ts-ignore
import type { Subscription } from '@rails/actioncable';
import { useActionCable } from '@/hooks/useActionCable';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import type { ChatChannelEvent } from '@/features/chat/types';

export const useChatChannel = () => {
  const { cable }       = useActionCable();
  // 🛡️ Fijamos el tipo explícito de la suscripción sin evaluar `cable.subscriptions`
  const subscriptionRef = useRef<Subscription | null>(null);
  const currentUser     = useAuthStore((s) => s.user);

  const addMessage       = useChatStore((s) => s.addMessage);
  const setFriendOnline  = useChatStore((s) => s.setFriendOnline);
  const addFriendRequest = useChatStore((s) => s.addFriendRequest);
  const addFriend        = useChatStore((s) => s.addFriend);
  const setTyping        = useChatStore((s) => s.setTyping);

  const { info, success } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    // 🛡️ ESCUDO PRINCIPAL: Si cable no existe o no se ha inicializado subscriptions, abortar
    if (!cable || !cable.subscriptions) return;

    // Si ya existe la suscripción, evitar duplicados
    if (subscriptionRef.current) return;

    try {
      subscriptionRef.current = cable.subscriptions.create(
        { channel: 'ChatChannel' },
        {
          connected() {
            // console.log('[ChatChannel] connected');
          },
          disconnected() {
            console.log('[ChatChannel] disconnected');
          },
          received(raw: unknown) {
            if (!raw || typeof raw !== 'object') return;
            const event = raw as ChatChannelEvent;

            switch (event.type) {
              case 'message_received':
                addMessage(event.message.room_id, event.message);
                break;
              case 'user_online':
                setFriendOnline(event.user_id, true);
                break;
              case 'user_offline':
                setFriendOnline(event.user_id, false);
                break;
              case 'friend_request':
                addFriendRequest(event.request);
                info(`${event.request.from.username} sent you a friend request`);
                break;
              case 'friend_accepted':
                addFriend(event.friend);
                success(`${event.friend.username} accepted your friend request`);
                break;
              case 'typing_start':
                setTyping(event.room_id, event.username, true);
                break;
              case 'typing_stop':
                setTyping(event.room_id, event.username, false);
                break;
            }
          },
        }
      );
    } catch (err) {
      console.warn("🚨 Error al crear suscripción en ChatChannel:", err);
    }

    return () => {
      if (!currentUser && subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (_) {}
        subscriptionRef.current = null;
      }
    };
  }, [currentUser, cable]); // 🔄 Escuchamos cambios en `cable` para conectar cuando finalice la petición del ticket

  const sendMessage = (roomId: string, content: string) => {
    subscriptionRef.current?.perform('send_message', { room_id: roomId, content });
  };

  const sendTyping = (roomId: string, typing: boolean) => {
    subscriptionRef.current?.perform(
      typing ? 'typing_start' : 'typing_stop',
      { room_id: roomId }
    );
  };

  return { sendMessage, sendTyping };
};