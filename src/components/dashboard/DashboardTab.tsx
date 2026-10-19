import React, { useState, useMemo } from 'react';
import {
  Student,
  EvaluationItem,
  GradeRecord,
  AttendanceSession,
  StudentAlert
} from '../../types';
import { computeStudentAlerts, calculateStudentGrade, calculateStudentAttendance } from '../../services/storage';
import {
  AlertTriangle,
  Users,
  GraduationCap,
  CalendarCheck,
  HeartHandshake,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Phone,
  Filter,
  CheckCircle2,
  FileWarning
} from 'lucide-react';
import { QuickActionModal } from './QuickActionModal';

interface DashboardTabProps {
  selectedCourse: string;
  selectedSubject: string;
  selectedPeriod: string;
  students: Student[];
  evaluations: EvaluationItem[];
  grades: GradeRecord[];
  attendance: AttendanceSession[];
  onOpenStudentDetail: (studentId: string) => void;
  onOpenImprovementPlan: (studentId: string) => void;
  onRemitToOrientation: (studentId: string, notes: string) => void;
  onCommitmentSigned: (studentId: string, commitmentText: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  selectedCourse,
  selectedSubject,
  selectedPeriod,
  students,
  evaluations,
  grades,
  attendance,
  onOpenStudentDetail,
  onOpenImprovementPlan,
  onRemitToOrientation,
  onCommitmentSigned
}) => {
  const [filterType, setFilterType] = useState<'all' | 'failure' | 'dropout' | 'nee'>('all');
  const [selectedAlertForAction, setSelectedAlertForAction] = useState<StudentAlert | null>(null);

  // Compute all alerts for the current course and subject
  const allAlerts = useMemo(() => {
    return computeStudentAlerts(
      selectedCourse,
      selectedSubject,
      selectedPeriod,
      students,
      grades,
      evaluations,
      attendance
    );
  }, [selectedCourse, selectedSubject, selectedPeriod, students, grades, evaluations, attendance]);

  // Overall course statistics
  const courseStudents = useMemo(() => {
    return students.filter((s) => s.course === selectedCourse);
  }, [students, selectedCourse]);

  const stats = useMemo(() => {
    let sumAverages = 0;
    let studentsWithGrades = 0;
    let failureCount = 0;
    let dropoutCount = 0;
    let neeCount = 0;

    for (const st of courseStudents) {
      const g = calculateStudentGrade(st.id, selectedCourse, selectedSubject, selectedPeriod, grades, evaluations);
      const a = calculateStudentAttendance(st.id, selectedCourse, selectedSubject, attendance);

      if (g.average > 0) {
        sumAverages += g.average;
        studentsWithGrades++;
      }
      if (g.average > 0 && g.average < 3.0) {
        failureCount++;
      }
      if (a.totalSessions > 0 && a.absencePercentage >= 15) {
        dropoutCount++;
      }
      if (st.inclusionProfile?.hasNEE) {
        neeCount++;
      }
    }

    const groupAverage = studentsWithGrades > 0 ? Number((sumAverages / studentsWithGrades).toFixed(1)) : 0;

    return {
      total: courseStudents.length,
      failureCount,
      dropoutCount,
      neeCount,
      groupAverage,
      totalAlerts: allAlerts.length
    };
  }, [courseStudents, selectedCourse, selectedSubject, selectedPeriod, grades, evaluations, attendance, allAlerts]);

  // Filtered alert list
  const filteredAlerts = useMemo(() => {
    return allAlerts.filter((alert) => {
      if (filterType === 'failure') return alert.hasFailureRisk;
      if (filterType === 'dropout') return alert.hasDropoutRisk;
      if (filterType === 'nee') return alert.student.inclusionProfile?.hasNEE;
      return true;
    });
  }, [allAlerts, filterType]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 mb-2 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Sistema de Alertas Prontas y Acompañamiento Escolar (SIMPADE / MEN)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard de Alertas: {selectedCourse} • {selectedSubject}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Monitoreo continuo de riesgo de reprobación académica, ausentismo crítico y seguimiento a la inclusión educativa (Decreto 1290 y Decreto 1421).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[120px]">
              <span className="text-2xl font-black text-white">{stats.groupAverage}</span>
              <span className="text-[11px] block text-blue-200">Promedio Curso / 5.0</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 text-center min-w-[120px]">
              <span className="text-2xl font-black text-amber-300">{stats.totalAlerts}</span>
              <span className="text-[11px] block text-blue-200">Alertas Detectadas</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Estudiantes del Curso
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{stats.total}</span>
            <span className="text-xs text-slate-500">matriculados activos</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Grado: {selectedCourse} • Jornada Mañana
          </div>
        </div>

        {/* Card 2: Failure Risk */}
        <div className="rounded-xl border border-rose-200 bg-linear-to-b from-white to-rose-50/40 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Riesgo Reprobación
            </span>
            <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600">{stats.failureCount}</span>
            <span className="text-xs text-rose-700 font-medium">promedio &lt; 3.0</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600/80">
            Requieren plan de mejoramiento inmediato
          </div>
        </div>

        {/* Card 3: Dropout Risk */}
        <div className="rounded-xl border border-amber-200 bg-linear-to-b from-white to-amber-50/40 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Alerta Inasistencia / Deserción
            </span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{stats.dropoutCount}</span>
            <span className="text-xs text-amber-700 font-medium">fallas &ge; 15%</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700/80">
            Alerta de pérdida de asignatura por inasistencia
          </div>
        </div>

        {/* Card 4: NEE & Inclusiveness */}
        <div className="rounded-xl border border-purple-200 bg-linear-to-b from-white to-purple-50/40 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
              Inclusión / DUA / PIAR
            </span>
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <HeartHandshake className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-700">{stats.neeCount}</span>
            <span className="text-xs text-purple-700 font-medium">con diagnóstico NEE</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-700/80">
            Decreto 1421 de 2017 / Ajustes razonables
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Filtrar Alertas:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas ({allAlerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('failure')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'failure'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Reprobación ({allAlerts.filter((a) => a.hasFailureRisk).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('dropout')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'dropout'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Deserción / Inasistencia ({allAlerts.filter((a) => a.hasDropoutRisk).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('nee')}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'nee'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Casos NEE ({allAlerts.filter((a) => a.student.inclusionProfile?.hasNEE).length})
          </button>
        </div>
      </div>

      {/* Alert Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Panel Visual de Casos Prioritarios ({filteredAlerts.length})
          </h2>
          <span className="text-xs text-slate-500">
            Ordenados por criticidad e impacto pedagógico
          </span>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              No hay alertas críticas en esta categoría
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Todos los estudiantes del curso {selectedCourse} en {selectedSubject} presentan desempeño favorable y asistencia continua.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAlerts.map((alert) => {
              const { student } = alert;
              const hasPiar = student.inclusionProfile?.hasPIAR;

              return (
                <div
                  key={student.id}
                  className={`relative rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
                    alert.riskSeverity === 'Crítica'
                      ? 'border-rose-300 ring-1 ring-rose-300/50'
                      : alert.riskSeverity === 'Alta'
                      ? 'border-orange-300 ring-1 ring-orange-300/30'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Card Header: Student Name and Severity Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          {student.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {student.documentType} {student.document} • {student.age} años • Curso {student.course}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        alert.riskSeverity === 'Crítica'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : alert.riskSeverity === 'Alta'
                          ? 'bg-orange-100 text-orange-800 border border-orange-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Severidad {alert.riskSeverity}
                    </span>
                  </div>

                  {/* Metrics Badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <div
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                        alert.averageGrade < 3.0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      Promedio: {alert.averageGrade} / 5.0 ({alert.performanceLevel})
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 ${
                        alert.absencePercentage >= 15
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <CalendarCheck className="h-3.5 w-3.5" />
                      Inasistencias: {alert.absencesCount} ({alert.absencePercentage}%)
                    </div>

                    {student.inclusionProfile?.hasNEE && (
                      <div className="px-2.5 py-1 rounded-lg font-bold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <HeartHandshake className="h-3.5 w-3.5" />
                        NEE: {student.inclusionProfile.diagnoses[0] || 'Inclusión'}
                      </div>
                    )}
                  </div>

                  {/* Reasons list */}
                  <div className="mt-3.5 rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Factores de Alerta Detectados:
                    </span>
                    <ul className="space-y-1">
                      {alert.riskReasons.map((reason, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Guardian quick info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-1">
                    <span className="truncate">
                      Acudiente: <strong>{student.guardianName}</strong> ({student.guardianRelationship})
                    </span>
                    <a
                      href={`tel:${student.guardianPhone}`}
                      className="font-mono text-blue-600 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <Phone className="h-3 w-3" />
                      {student.guardianPhone}
                    </a>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAlertForAction(alert)}
                      className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 cursor-pointer transition-all"
                    >
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      Asistente de Acción Rápida (IA)
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenStudentDetail(student.id)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Ver Ficha <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Action Modal with AI */}
      <QuickActionModal
        isOpen={Boolean(selectedAlertForAction)}
        alert={selectedAlertForAction}
        onClose={() => setSelectedAlertForAction(null)}
        onOpenImprovementPlan={onOpenImprovementPlan}
        onRemitToOrientation={onRemitToOrientation}
        onCommitmentSigned={onCommitmentSigned}
      />
    </div>
  );
};
