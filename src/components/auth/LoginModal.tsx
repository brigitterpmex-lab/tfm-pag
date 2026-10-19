import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';
import { ShieldCheck, GraduationCap, UserCheck, Lock, Mail, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
  canClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLogin,
  onClose,
  canClose = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const found = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (found) {
      onLogin(found);
    } else {
      // Allow custom login as teacher or orientation
      if (email.includes('@')) {
        const isOrient = email.toLowerCase().includes('orient') || email.toLowerCase().includes('psico');
        const customUser: UserProfile = {
          id: `usr-${Date.now()}`,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email: email.trim(),
          role: isOrient ? 'orientador' : 'docente',
          title: isOrient ? 'Orientador(a) Escolar' : 'Docente de Aula',
          institution: 'I.E. Técnico República de Colombia'
        };
        onLogin(customUser);
      } else {
        setError('Por favor ingresa un correo electrónico institucional válido o selecciona uno de los perfiles demo.');
      }
    }
  };

  const handleQuickLogin = (user: UserProfile) => {
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 text-white text-center relative">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md mb-3 border border-white/20">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">EduGestion Pro</h2>
          <p className="text-blue-100 text-sm mt-1">
            Plataforma de Gestión Académica, Convivencial y Adaptación NEE
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-800/60 text-xs text-blue-200 border border-blue-600/50">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
            Acceso Seguro a Información Confidencial de Estudiantes
          </div>
        </div>

        <div className="p-6">
          {/* Quick Demo Login Cards */}
          <div className="mb-6">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Acceso Rápido por Rol (Demostración)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickLogin(INITIAL_USERS[0])}
                className="group flex flex-col p-3.5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/50 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-xs font-semibold">
                    <UserCheck className="h-3.5 w-3.5" /> Docente
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">{INITIAL_USERS[0].name}</span>
                <span className="text-xs text-slate-500 mt-0.5">Matemáticas y Ciencias</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin(INITIAL_USERS[1])}
                className="group flex flex-col p-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" /> Orientación
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">{INITIAL_USERS[1].name}</span>
                <span className="text-xs text-slate-500 mt-0.5">Valida PIAR y NEE</span>
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">O ingresa con credenciales</span>
            </div>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. docente@institucion.edu.co"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contraseña de Seguridad
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              {canClose && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:ring-2 focus:ring-blue-600/30 cursor-pointer transition-all"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">
            Cumplimiento Ley 1581 de Protección de Datos Personales y Decreto MEN 1290
          </p>
        </div>
      </div>
    </div>
  );
};
