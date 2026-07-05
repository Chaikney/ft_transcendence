import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isMock = import.meta.env.VITE_USE_MOCK === 'true';
  const location = useLocation();

  if (isMock) return <>{children}</>;

  // Si no está autenticado, directo al login. Sin pantallas amarillas ni bucles.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};