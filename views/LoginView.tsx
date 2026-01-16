
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { Camera, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Initial admin setup if no users exist
  useEffect(() => {
    const users = localStorage.getItem('photo_users');
    if (!users) {
      const defaultAdmin: User = {
        id: 'admin_1',
        username: 'admin',
        password: 'admin123',
        name: 'Administrador Principal',
        role: 'admin',
        isBlocked: false,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('photo_users', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const usersJson = localStorage.getItem('photo_users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    const foundUser = users.find(u => u.username === username && u.password === password);

    if (foundUser) {
      if (foundUser.isBlocked) {
        setError('Sua conta está bloqueada. Entre em contato com o administrador.');
        return;
      }
      onLogin(foundUser);
    } else {
      setError('Usuário ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-3xl inline-block text-white shadow-xl shadow-indigo-200 mb-4">
            <Camera size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">FocusQuote</h1>
          <p className="text-slate-500 mt-2">Sistema Profissional de Orçamentos</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Acesse sua conta</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center space-x-2 text-sm mb-6 border border-red-100">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuário</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserIcon size={18} />
                </div>
                <input 
                  required
                  type="text" 
                  placeholder="Seu nome de usuário"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
            >
              Entrar no Painel
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} FocusQuote - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
