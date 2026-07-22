import { useState } from 'react';
import { post } from '@/services/api';

export const UserSearch = () => {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleAddFriend = async () => {
    if (!username.trim()) return;
    setStatus('loading');
    
    try {
      const res = await post('/friends/request', { username });
      
      if (res.success) {
        setStatus('success');
        setUsername('');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        // La petición se realizó con éxito, pero la validación de negocio no pasó
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch {
      // Solo entra aquí si realmente se cayó el servidor o no hay internet
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 border-t border-[#1a1a24] bg-[#0a0a0f]">
      <input
        type="text"
        className="flex-1 bg-[#121218] border border-[#2a2a35] text-gray-300 font-mono text-xs px-3 py-2 outline-none focus:border-[#ff3366] transition-all placeholder:text-[#4a4a5a] shadow-[0_0_10px_rgba(255,51,102,0)] focus:shadow-[0_0_10px_rgba(255,51,102,0.15)]"
        placeholder="> invoke_friend(username)..."
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
        maxLength={30}
      />
      <button 
        onClick={handleAddFriend}
        disabled={status === 'loading'}
        className={`font-mono text-xs cursor-pointer transition-colors px-2 tracking-widest ${
          status === 'success' ? 'text-[#4ade80]' :
          status === 'error' ? 'text-[#ff3366]' :
          'text-[#8a8a9a] hover:text-white'
        }`}
      >
        {status === 'success' ? '[ OK ]' : status === 'error' ? '[ FAIL ]' : '[ SEND ]'}
      </button>
    </div>
  );
};