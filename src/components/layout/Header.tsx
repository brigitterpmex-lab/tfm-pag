import React from 'react';
import { UserProfile } from '../../types';
import { AVAILABLE_COURSES, AVAILABLE_SUBJECTS, AVAILABLE_PERIODS, INITIAL_USERS } from '../../data/initialData';
import {
  GraduationCap,
  DownloadCloud,
  UserCheck,
  ShieldCheck,
  LogOut,
  RotateCcw,
  Menu,
  School
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile;
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  onSwitchUser: (user: UserProfile) => void;
  onOpenImportExport: () => void;
  onLogout: () => void;
  onResetData: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  selectedCourse,
  onSelectCourse,
  selectedSubject,
  onSelectSubject,
  selectedPeriod,
  onSelectPeriod,
  onSwitchUser,
  onOpenImportExport,
  onLogout,
  onResetData,
  onToggleMobileSidebar
}) => {
  const isCounselor = currentUser.role === 'orientador';
  const otherUser = INITIAL_USERS.find((u) => u.role !== currentUser.role) || INITIAL_USERS[0];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
        {/* Left: Mobile trigger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
            aria-label="Abrir menú lateral"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-xs">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  EduGestion<span className="text-blue-600 font-extrabold">Pro</span>
                </span>
                <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  MEN 1290 / DUA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-[240px]">
                I.E. Técnico República de Colombia
              </p>
            </div>
          </div>
        </div>

        {/* Center: Global Academic Context Selectors */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl bg-slate-100/80 p-1.5 border border-slate-200/80">
          <div className="flex items-center gap-1 pl-2 pr-1 text-slate-500 text-xs font-medium">
            <School className="h-3.5 w-3.5" />
            <span>Contexto:</span>
          </div>

          {/* Course Selector */}
          <select
            value={selectedCourse}
            onChange={(e) => onSelectCourse(e.target.value)}
            className="h-8 rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden cursor-pointer"
          >
            {AVAILABLE_COURSES.map((c) => (
              <option key={c} value={c}>
                Curso: {c}
              </option>
            ))}
          </select>

          {/* Subject Selector */}
          <select
            value={selectedSubject}
            onChange={(e) => onSelectSubject(e.target.value)}
            className="h-8 rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden cursor-pointer"
          >
            {AVAILABLE_SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => onSelectPeriod(e.target.value)}
            className="h-8 rounded-lg bg-white px-2.5 text-xs font-semibold text-slate-800 border border-slate-200 shadow-2xs focus:ring-2 focus:ring-blue-500/20 focus:outline-hidden cursor-pointer"
          >
            {AVAILABLE_PERIODS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Actions & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Import / Export Button */}
          <button
            type="button"
            onClick={onOpenImportExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-700 transition-colors cursor-pointer"
            title="Importar y Exportar datos masivos (Excel / CSV)"
          >
            <DownloadCloud className="h-4 w-4 text-slate-500" />
            <span className="hidden md:inline">Importar / Exportar</span>
          </button>

          {/* Quick role toggle */}
          <button
            type="button"
            onClick={() => onSwitchUser(otherUser)}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
              isCounselor
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
            title={`Cambiar a vista de ${otherUser.role === 'orientador' ? 'Orientación Escolar' : 'Docente'}`}
          >
            {isCounselor ? (
              <>
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden xl:inline">Rol: Orientación Escolar</span>
                <span className="xl:hidden">Orientación</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                <span className="hidden xl:inline">Rol: Docente Titular</span>
                <span className="xl:hidden">Docente</span>
              </>
            )}
            <span className="text-[10px] bg-white/80 px-1 rounded text-slate-500 font-normal">
              Alternar
            </span>
          </button>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[130px]">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize">
                {currentUser.role === 'orientador' ? 'Psicoorientación' : 'Docente'}
              </p>
            </div>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={onResetData}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            title="Restablecer datos de prueba a estado inicial"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 cursor-pointer"
            title="Cerrar sesión de forma segura"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sub-bar for mobile contexts */}
      <div className="lg:hidden border-t border-slate-200/80 bg-slate-50 px-4 py-2 flex items-center gap-2 overflow-x-auto">
        <select
          value={selectedCourse}
          onChange={(e) => onSelectCourse(e.target.value)}
          className="h-7 rounded-md bg-white px-2 text-xs font-medium text-slate-800 border border-slate-300"
        >
          {AVAILABLE_COURSES.map((c) => (
            <option key={c} value={c}>
              Curso: {c}
            </option>
          ))}
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => onSelectSubject(e.target.value)}
          className="h-7 rounded-md bg-white px-2 text-xs font-medium text-slate-800 border border-slate-300"
        >
          {AVAILABLE_SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={selectedPeriod}
          onChange={(e) => onSelectPeriod(e.target.value)}
          className="h-7 rounded-md bg-white px-2 text-xs font-medium text-slate-800 border border-slate-300"
        >
          {AVAILABLE_PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
