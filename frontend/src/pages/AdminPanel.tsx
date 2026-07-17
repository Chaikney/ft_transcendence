import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store'; 
import { useToast } from '@/components/Toast';
import { BASE_URL } from '@services/api';

// 1. Definimos cómo es un usuario según la base de datos
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
  const { error, success } = useToast();
  
  const [activeTab, setActiveTab] = useState('users');
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 2. Traer los usuarios reales cuando la pestaña "users" está activa
  useEffect(() => {
    if (!user || (user.username !== "nkrasimi" && user.username !== "gcassi-d")) return;

    if (activeTab === 'users') {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        const token = localStorage.getItem('auth_token'); // Usando tu key 'auth_token'
        try {
          const response = await fetch(`${BASE_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUsersList(data);
          } else {
            error('Error al cargar la base de datos de usuarios', 'SYSTEM_ERROR');
          }
        } catch (err) {
          error('Servidor desconectado', 'NETWORK_ERROR');
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [activeTab, user]);

  // 3. Función para Banear/Desbanear
  const handleBanToggle = async (userId: number, currentBannedStatus: boolean) => {
    const token = localStorage.getItem('auth_token');
    try {
         const res = await fetch(`${BASE_URL}/admin/users/${userId}/ban`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        success(currentBannedStatus ? 'Usuario desbaneado' : 'Usuario baneado', 'SUCCESS');
        // Actualizamos la tabla visualmente al instante
        setUsersList(usersList.map(u => u.id === userId ? { ...u, banned: !currentBannedStatus } : u));
      } else {
        error('Error ejecutando la acción', 'SYSTEM_ERROR');
      }
    } catch (e) {
      error('Error de red', 'SYSTEM_ERROR');
    }
  };

  // 4. NUEVO: Función para Borrar Cuenta
  const handleDeleteUser = async (userId: number, username: string) => {
    const confirmDelete = window.confirm(`⚠️ WARNING: ¿Estás seguro de que quieres BORRAR PERMANENTEMENTE a ${username}?`);
    
    if (!confirmDelete) return;

    const token = localStorage.getItem('auth_token');
    try {
         const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        success(`Usuario ${username} eliminado del sistema`, 'SUCCESS');
        // Lo sacamos de la tabla local al instante
        setUsersList(usersList.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        error(data.error || 'Error al eliminar el usuario', 'SYSTEM_ERROR');
      }
    } catch (e) {
      error('Error de red', 'SYSTEM_ERROR');
    }
  };

  // 5. Si React aún está cargando el usuario de la memoria, esperamos un segundo
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-accent">
        &gt; VERIFYING_CREDENTIALS...
      </div>
    );
  }

  // 6. Comprobación de seguridad dura (Incluye a nkrasimi como Override de emergencia)
  const isAdmin = user.username === 'nkrasimi' || user.username === 'gcassi-d';

  // 7. PANTALLA DE ENTRADA PROHIBIDA
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="border border-[#ff3366] p-8 bg-[#ff3366]/10 text-center font-mono max-w-md w-full">
          <h1 className="text-2xl text-[#ff3366] mb-2">&gt; ENTRADA PROHIBIDA</h1>
          <p className="text-[#ff3366]/70 text-xs mb-6">ERR_INSUFFICIENT_PRIVILEGES</p>
          <div className="text-text-muted text-sm mb-8 text-left border-l-2 border-[#ff3366] pl-4">
            Usuario actual: <span className="text-accent">{user.username}</span><br />
            Nivel de acceso: <span className="text-[#ffaa00]">PLAYER</span><br />
            Nivel requerido: <span className="text-green-500">ADMIN</span>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="w-full py-2 border border-[#ff3366] text-[#ff3366] hover:bg-[#ff3366] hover:text-white transition-colors"
          >
            &lt;- ABORT()
          </button>
        </div>
      </div>
    );
  }

  // 8. PANEL DE CONTROL REAL (Solo visible para admins o nkrasimi)
  return (
    <div className="min-h-screen p-8 flex flex-col gap-6 font-mono text-text-primary">
      <header className="border-b border-accent pb-4 mb-4">
        <h1 className="text-3xl text-accent tracking-widest">&gt; SYSTEM_ADMIN_PANEL</h1>
        <p className="text-text-muted text-sm mt-2">// ROOT_PRIVILEGES_GRANTED: Welcome {user.username}</p>
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
                    {loadingUsers ? (
                      <tr><td colSpan={5} className="py-4 text-center text-accent animate-pulse">&gt; FETCHING_DATA...</td></tr>
                    ) : (
                      usersList.map((u) => (
                        <tr key={u.id} className="border-b border-border-strong/50 hover:bg-white/5 transition-colors">
                          <td className="py-3 font-bold">{String(u.id).padStart(3, '0')}</td>
                          <td className={`py-3 ${u.banned ? 'text-red-500 line-through' : 'text-accent'}`}>{u.username}</td>
                          <td className={`py-3 ${
                            u.banned ? 'text-red-600' :
                            u.status === 'online' ? 'text-green-500' : 'text-text-muted'
                          }`}>
                            {u.banned ? 'BANNED' : u.status.toUpperCase()}
                          </td>
                          <td className={`py-3 ${u.role === 1 ? 'text-yellow-500' : 'text-text-secondary'}`}>
                            {u.role === 1 ? 'ADMIN' : 'PLAYER'}
                          </td>
                          <td className="py-3 flex gap-2">
                            {u.username === 'nkrasimi' || u.username === 'gcassi-d' ? (
                              <button className="text-xs px-2 py-1 border border-border-strong text-text-muted cursor-not-allowed">
                                ROOT_PROTECTED
                              </button>
                            ) : (
                              <>
                                {/* BOTÓN BAN / UNBAN */}
                                <button 
                                  onClick={() => handleBanToggle(u.id, u.banned)}
                                  className={`text-xs px-2 py-1 border transition-colors ${
                                    u.banned 
                                      ? 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white' 
                                      : 'border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white'
                                  }`}
                                >
                                  {u.banned ? 'UNBAN' : 'BAN'}
                                </button>
                                
                                {/* BOTÓN DELETE (Reemplaza a MAKE_ADMIN) */}
                                <button 
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  className="text-xs px-2 py-1 border border-red-700 text-red-600 hover:bg-red-800 hover:text-white transition-colors"
                                >
                                  DELETE
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'games' && <div className="text-text-muted">_ACTIVE_MATCHES_DATA_NOT_FOUND</div>}
        </main>
      </div>
    </div>
  );
};
