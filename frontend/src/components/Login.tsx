import React, { useState } from 'react';
import type { FormEvent } from 'react'; 

// Definimos los tipos de vista posibles
type ViewState = 'main' | 'login' | 'register';

export default function LoginScreen() {
  // Aplicamos el tipo a nuestro estado
  const [view, setView] = useState<ViewState>('main');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // 1. Lógica para 42
  const handle42Login = (): void => {
    // RECUERDA: Cambia TU_UID_PUBLICO por tu UID real de la Intra
    const uid42 = import.meta.env.VITE_42_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_42_REDIRECT_URI;
    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${uid42}&redirect_uri=${redirectUri}&response_type=code`;
  };

  // 2. Lógica para Invitados (Login) - Añadimos FormEvent de React
  const handleGuestLogin = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Intentando loguear invitado con:', username, password);
  };

  // 3. Lógica para Invitados (Registro) - Añadimos FormEvent de React
  const handleGuestRegister = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Intentando registrar invitado con:', username, password);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Cabecera del Logo / Título */}
        <div className="p-8 text-center border-b border-gray-800">
          <div className="w-16 h-16 mx-auto bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Transcendence</h2>
          <p className="text-sm text-gray-400 mt-2">Bienvenido a la arena</p>
        </div>

        <div className="p-8">
          {/* VISTA PRINCIPAL: Elección de método */}
          {view === 'main' && (
            <div className="space-y-4 animate-fade-in">
              <button
                onClick={handle42Login}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  {/* Icono simulado de 42 / School */}
                  <path d="M12 2L2 7l10 5 10-5-10-5zm0 13l-10-5v6.5l10 5 10-5V10l-10 5z"/>
                </svg>
                Iniciar sesión con 42
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">O entra por tu cuenta</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setView('login')}
                  className="w-full bg-gray-800 text-white font-medium py-3 px-4 rounded-xl border border-gray-700 hover:bg-gray-700 hover:border-gray-600 transition-all"
                >
                  Ya tengo cuenta
                </button>
                <button
                  onClick={() => setView('register')}
                  className="w-full bg-indigo-600/20 text-indigo-400 font-medium py-3 px-4 rounded-xl border border-indigo-500/30 hover:bg-indigo-600/30 hover:text-indigo-300 transition-all"
                >
                  Registrarse
                </button>
              </div>
            </div>
          )}

          {/* VISTA DE LOGIN: Invitado */}
          {view === 'login' && (
            <form onSubmit={handleGuestLogin} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre de Usuario</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Tu alias"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-500 transition-all mt-4"
              >
                Entrar a jugar
              </button>
              <button
                type="button"
                onClick={() => setView('main')}
                className="w-full text-gray-500 text-sm hover:text-gray-300 mt-2"
              >
                ← Volver
              </button>
            </form>
          )}

          {/* VISTA DE REGISTRO: Invitado */}
          {view === 'register' && (
            <form onSubmit={handleGuestRegister} className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Elige un Usuario</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="Ej: PongMaster99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Crea una Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-green-500 transition-all mt-4"
              >
                Crear cuenta
              </button>
              <button
                type="button"
                onClick={() => setView('main')}
                className="w-full text-gray-500 text-sm hover:text-gray-300 mt-2"
              >
                ← Volver
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}