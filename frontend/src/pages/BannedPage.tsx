import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

export const BannedPage = () => {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 font-mono">
      <h1 className="text-6xl font-bold mb-4 animate-pulse">YOU ARE BANNED</h1>
      <p className="text-lg text-gray-400 mb-8 text-center max-w-md">
        Tu cuenta ha sido suspendida por un administrador debido a infracciones en la normativa.
      </p>
      <button 
        onClick={handleLogout}
        className="px-6 py-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-colors"
      >
        LOGOUT
      </button>
    </div>
  );
};