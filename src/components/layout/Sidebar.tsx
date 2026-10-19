import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpenCheck,
  TableProperties,
  Sparkles,
  AlertTriangle,
  HeartHandshake,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export type TabId = 'dashboard' | 'students' | 'curriculum' | 'grades' | 'improvement';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  criticalAlertsCount: number;
  neeCount: number;
  pendingPlansCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  criticalAlertsCount,
  neeCount,
  pendingPlansCount,
  isMobileOpen,
  onCloseMobile
}) => {
  const menuItems = [
    {
      id: 'dashboard' as TabId,
      name: 'Panel de Alertas Prontas',
      shortName: 'Dashboard',
      icon: LayoutDashboard,
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      badgeIcon: AlertTriangle,
      description: 'Detección temprana de riesgo'
    },
    {
      id: 'students' as TabId,
      name: 'Gestión de Estudiantes & NEE',
      shortName: 'Estudiantes',
      icon: Users,
      badge: neeCount > 0 ? `${neeCount} NEE` : undefined,
      badgeColor: 'bg-purple-100 text-purple-700 border border-purple-200',
      badgeIcon: HeartHandshake,
      description: 'Ficha DUA, PIAR y Acudientes'
    },
    {
      id: 'curriculum' as TabId,
      name: 'Planeación, DBA y Logros',
      shortName: 'Planeación',
      icon: BookOpenCheck,
      description: 'Alineación MEN y Actividades'
    },
    {
      id: 'grades' as TabId,
      name: 'Planilla de Notas & Asistencia',
      shortName: 'Calificaciones',
      icon: TableProperties,
      description: 'Hasta 15 casillas y registro diario'
    },
    {
      id: 'improvement' as TabId,
      name: 'Planes de Mejoramiento IA',
      shortName: 'Planes IA',
      icon: Sparkles,
      badge: pendingPlansCount > 0 ? `${pendingPlansCount} Activos` : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      badgeIcon: CheckCircle2,
      description: 'Nivelación y actas formales'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col justify-between py-4">
          <div className="px-4 space-y-6">
            <div className="px-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Módulos de Gestión Docente
              </span>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                const BadgeIcon = item.badgeIcon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`group relative flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-medium'
                        : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    <div
                      className={`mt-0.5 rounded-lg p-2 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-2xs'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm truncate">{item.name}</span>
                        {isActive && <ChevronRight className="h-4 w-4 text-white/80 shrink-0" />}
                      </div>
                      <p
                        className={`text-xs truncate mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-slate-500'
                        }`}
                      >
                        {item.description}
                      </p>

                      {/* Badge if present */}
                      {item.badge && (
                        <div className="mt-2 flex items-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${item.badgeColor}`}
                          >
                            {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Colombian Framework Card */}
          <div className="px-4 mt-6">
            <div className="rounded-xl border border-slate-200 bg-linear-to-b from-slate-50 to-blue-50/40 p-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Marco Normativo MEN
              </div>
              <ul className="mt-2 space-y-1 text-[11px] text-slate-600 leading-tight">
                <li>• <strong>Decreto 1290 (2009):</strong> Escala institucional y comités de evaluación.</li>
                <li>• <strong>Decreto 1421 (2017):</strong> Educación inclusiva, DUA y PIAR.</li>
                <li>• <strong>DBA:</strong> Derechos Básicos de Aprendizaje.</li>
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
