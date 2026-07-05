import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store'; // Ajusta la ruta si es diferente


export const AdminPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  // Redirigir si el usuario no es admin. 
  // (Ajusta 'admin' o 1 dependiendo de cómo devuelva el rol tu backend)
  useEffect(() => {
    if (user && user.role !== 1 && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen p-8 flex flex-col gap-6 font-mono text-text-primary">
      <header className="border-b border-accent pb-4 mb-4">
        <h1 className="text-3xl text-accent tracking-widest">&gt; SYSTEM_ADMIN_PANEL</h1>
        <p className="text-text-muted text-sm mt-2">// ROOT_PRIVILEGES_GRANTED</p>
      </header>

      <div className="flex gap-8">
        {/* SIDEBAR */}
        <aside className="w-48 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`text-left px-4 py-2 border-l-2 transition-colors ${
              activeTab === 'users' 
                ? 'border-accent text-accent bg-accent/10' 
                : 'border-border-strong text-text-muted hover:border-accent/50'
            }`}
          >
            &gt; USERS_DB
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`text-left px-4 py-2 border-l-2 transition-colors ${
              activeTab === 'games' 
                ? 'border-accent text-accent bg-accent/10' 
                : 'border-border-strong text-text-muted hover:border-accent/50'
            }`}
          >
            &gt; ACTIVE_GAMES
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`text-left px-4 py-2 border-l-2 transition-colors ${
              activeTab === 'system' 
                ? 'border-accent text-accent bg-accent/10' 
                : 'border-border-strong text-text-muted hover:border-accent/50'
            }`}
          >
            &gt; SYSTEM_LOGS
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 border border-border-strong bg-bg-elevated p-6">
          {activeTab === 'users' && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl text-accent mb-4">_USER_MANAGEMENT</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border-strong text-text-muted">
                      <th className="pb-2 font-normal">ID</th>
                      <th className="pb-2 font-normal">USERNAME</th>
                      <th className="pb-2 font-normal">STATUS</th>
                      <th className="pb-2 font-normal">ROLE</th>
                      <th className="pb-2 font-normal">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Fila de ejemplo. Aquí harás un map() de los usuarios que traigas del backend */}
                    <tr className="border-b border-border-strong/50 hover:bg-white/5 transition-colors">
                      <td className="py-3">001</td>
                      <td className="py-3 text-accent">kae_meli</td>
                      <td className="py-3 text-green-500">ONLINE</td>
                      <td className="py-3 text-yellow-500">ADMIN</td>
                      <td className="py-3 flex gap-2">
                        <button className="text-xs px-2 py-1 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                          BAN
                        </button>
                        <button className="text-xs px-2 py-1 border border-border-strong text-text-muted hover:border-accent hover:text-accent transition-colors">
                          MAKE_ADMIN
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'games' && <div className="text-text-muted">_ACTIVE_MATCHES_DATA_NOT_FOUND</div>}
          {activeTab === 'system' && <div className="text-text-muted">_SYSTEM_LOGS_EMPTY</div>}
        </main>
      </div>
    </div>
  );
};