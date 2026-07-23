import { useEffect, useRef } from 'react';
import { useActionCable } from './useActionCable';
import { useAuthStore } from '@/store/authStore';

export const useUserChannel = () => {
  const { cable } = useActionCable();
  const currentUser = useAuthStore((s) => s.user);
  const setBanned = useAuthStore((s) => s.setBanned);
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!cable || !currentUser || currentUser.banned) return;

    // Si ya estamos suscritos, no hacemos nada (evita bucles)
    if (subscriptionRef.current) return;

    subscriptionRef.current = cable.subscriptions.create(
      { channel: 'UserChannel' },
      {
        received(event: any) {
          switch (event.type) {
            case 'account_banned':
              console.log("💥 BAN HAMMER RECIBIDO EN VIVO");
              setBanned(true);
              break;
            case 'account_unbanned':
              console.log("🕊️ DESBANEADO EN VIVO");
              setBanned(false);
              break;
          }
        }
      }
    );

    return () => {
      // Limpieza segura al desmontar
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [cable, currentUser, setBanned]); // Dependencias limpias
};