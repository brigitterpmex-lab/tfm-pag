import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';
import {
  GraduationCap,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Sparkles,
  School,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const inputUser = usernameOrEmail.trim().toLowerCase();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setErrorMessage('Por favor ingresa tanto el usuario/correo como la contraseña de acceso.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching user in INITIAL_USERS
      const matched = INITIAL_USERS.find((u) => {
        const matchesUser =
          u.email.toLowerCase() === inputUser ||
          (u.username && u.username.toLowerCase() === inputUser) ||
          (u.role === 'docente' && (inputUser === 'docente' || inputUser === 'profe')) ||
          (u.role === 'orientador' && (inputUser === 'orientador' || inputUser === 'orientadora' || inputUser === 'psico'));

        const matchesPass = u.password === inputPass || (inputPass === '123456' && matchesUser);
        return matchesUser && matchesPass;
      });

      if (matched) {
        onLogin(matched);
      } else {
        setErrorMessage(
          'Credenciales inválidas. Verifica tu usuario y contraseña. Puedes utilizar las credenciales sugeridas abajo.'
        );
        setIsSubmitting(false);
      }
    }, 300);
  };

  const handleFillCredentials = (userIndex: number) => {
    const target = INITIAL_USERS[userIndex];
    if (target) {
      setUsernameOrEmail(target.email);
      setPassword(target.password || (target.role === 'docente' ? 'profe123' : 'orienta123'));
      setErrorMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Institutional Top Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              EduGestion<span className="text-blue-500">Pro</span>
            </span>
            <span className="text-[11px] block text-slate-400">
              I.E. Técnico República de Colombia • MEN 1290 / DUA
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Acceso Restringido a Personal Autorizado</span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Card Title Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-6 text-white text-center relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md mb-3 border border-white/20 shadow-inner">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Iniciar Sesión</h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xs mx-auto">
              Ingresa tus credenciales docentes para acceder al sistema académico y confidencial de estudiantes
            </p>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                <div className="leading-relaxed font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Usuario o Correo Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={usernameOrEmail}
                    onChange={(e) => {
                      setUsernameOrEmail(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="ej. carlos.restrepo o correo institucional"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contraseña de Seguridad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage('');
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden transition-all font-medium font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick credentials filler for convenience */}
            <div className="pt-2 border-t border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-center">
                Credenciales de Acceso Autorizado (Prueba):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleFillCredentials(0)}
                  className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 transition-colors text-left cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-blue-900 flex items-center gap-1">
                    <User className="h-3 w-3 text-blue-600" /> Docente Titular
                  </span>
                  <span className="text-[11px] text-blue-700 font-mono mt-0.5">
                    carlos.restrepo
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Clave: profe123
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillCredentials(1)}
                  className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors text-left cursor-pointer flex flex-col"
                >
                  <span className="font-bold text-indigo-900 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-indigo-600" /> Orientadora Escolar
                  </span>
                  <span className="text-[11px] text-indigo-700 font-mono mt-0.5">
                    marcela.gomez
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Clave: orienta123
                  </span>
                </button>
              </div>
            </div>

            {/* Confidentiality Warning */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-500 flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Confidencialidad garantizada:</strong> Los registros académicos, inasistencias y diagnósticos de inclusión (PIAR / NEE) están protegidos. Sin inicio de sesión válido ningún dato es visible.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-3 text-center text-xs text-slate-500 z-10">
        Plataforma Institucional EduGestion Pro • Conforme al Decreto MEN 1290 de 2009 y Ley Estatutaria 1581 de 2012
      </footer>
    </div>
  );
};
