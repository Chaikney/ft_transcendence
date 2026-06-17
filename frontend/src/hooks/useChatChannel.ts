import { useEffect, useRef } from 'react';
import { useActionCable } from '@/hooks/useActionCable';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import type { ChatChannelEvent } from '@/features/chat/types';

export const useChatChannel = () => {
  const { cable }       = useActionCable();
  const subscriptionRef = useRef<ReturnType<typeof cable.subscriptions.create> | null>(null);
  const currentUser     = useAuthStore((s) => s.user);

  const {
    addMessage,
    setFriendOnline,
    addFriendRequest,
    addFriend,
    setTyping,
  } = useChatStore();

  const { info, success } = useToast();

  useEffect(() => {
    if (!currentUser) return;

    // Establishes a global WebSocket subscription to the user's chat channel
    subscriptionRef.current = cable.subscriptions.create(
      { channel: 'ChatChannel' },
      {
        connected() {
          console.log('[ChatChannel] connected');
        },

        disconnected() {
          console.warn('[ChatChannel] disconnected');
        },

        // Orchestrates state updates and UI toasts based on incoming event types
        received(raw: unknown) {
          if (!raw || typeof raw !== 'object') return;
          const event = raw as ChatChannelEvent;

          switch (event.type) {
            case 'message_received':
              addMessage(event.message.room_id, event.message);
              if (event.message.sender_id !== currentUser.id) {
                info(
                  event.message.content.slice(0, 60),
                  event.message.sender
                );
              }
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

    // Cleans up the subscription when the user logs out or the component unmounts
    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [currentUser?.id]);

  // Dispatches a message payload to the server via the WebSocket connection
  const sendMessage = (roomId: string, content: string) => {
    subscriptionRef.current?.perform('send_message', {
      room_id: roomId,
      content,
    });
  };

  // Broadcasts typing status to other participants in the specified room
  const sendTyping = (roomId: string, typing: boolean) => {
    subscriptionRef.current?.perform(
      typing ? 'typing_start' : 'typing_stop',
      { room_id: roomId }
    );
  };

  return { sendMessage, sendTyping };
};