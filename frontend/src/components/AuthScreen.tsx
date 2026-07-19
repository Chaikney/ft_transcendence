import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store'; // Ajusta la ruta si es diferente

// Define la interfaz de lo que esperamos del backend
interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: number;
  status: string;
  banned: boolean;
}

export const AdminPanel = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [usersDb, setUsersDb] = useState<AdminUser[]>([]);

  // 1. Redirigir si el usuario no es admin.
  useEffect(() => {
    if (user && user.role !== 1 && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // 2. Traer los usuarios de la base de datos
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Ajusta esto si guardas el token en otro sitio (ej: Zustand)
        const res = await fetch('/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUsersDb(data);
        }
      } catch (error) {
        //console.error("Error al cargar la DB de usuarios:", error);
      }
    };

    if (user && (user.role === 1 || user.role === 'admin')) {
      fetchUsers();
    }
  }, [user]);

  // 3. Ejecutar Ban / Unban
  const handleBanUser = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}/ban`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Actualizamos la tabla local al instante invirtiendo su estado de ban
        setUsersDb(prev => prev.map(u => u.id === id ? { ...u, banned: !u.banned } : u));
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      //console.error("Error ejecutando el ban:", error);
    }
  };

  // 4. Ejecutar Borrado Permanente
  const handleDeleteUser = async (id: number, username: string) => {
    const confirmDelete = window.confirm(`⚠️ WARNING: ¿Estás seguro de que quieres BORRAR PERMANENTEMENTE a ${username}? Esta acción no se puede deshacer.`);
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        // Lo sacamos de la tabla local al instante
        setUsersDb(prev => prev.filter(u => u.id !== id));
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      //console.error("Error borrando el usuario:", error);
    }
  };

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
                    {usersDb.map((u) => (
                      <tr key={u.id} className="border-b border-border-strong/50 hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          {u.id.toString().padStart(3, '0')}
                        </td>
                        <td className={`py-3 ${u.banned ? 'text-red-500 line-through' : 'text-accent'}`}>
                          {u.username}
                        </td>
                        <td className={`py-3 ${
                          u.banned ? 'text-red-600' :
                          u.status === 'online' ? 'text-green-500' : 'text-text-muted'
                        }`}>
                          {u.banned ? 'BANNED' : u.status.toUpperCase()}
                        </td>
                        <td className="py-3 text-yellow-500">
                          {u.role === 1 ? 'ADMIN' : 'USER'}
                        </td>
                        <td className="py-3 flex gap-2">
                          {/* BOTÓN BAN / UNBAN */}
                          <button 
                            onClick={() => handleBanUser(u.id)}
                            className={`text-xs px-3 py-1 border transition-colors ${
                              u.banned 
                                ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white' 
                                : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
                            }`}
                          >
                            {u.banned ? 'UNBAN' : 'BAN'}
                          </button>
                          
                          {/* BOTÓN DELETE */}
                          <button 
                            onClick={() => handleDeleteUser(u.id, u.username)}
                            className="text-xs px-3 py-1 border border-red-700 text-red-600 hover:bg-red-800 hover:text-white transition-colors"
                          >
                            DELETE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {usersDb.length === 0 && (
                  <p className="text-center text-text-muted mt-8">_NO_USERS_FOUND</p>
                )}
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