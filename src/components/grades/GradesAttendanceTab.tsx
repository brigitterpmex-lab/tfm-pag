import React, { useState, useMemo } from 'react';
import {
  Student,
  EvaluationItem,
  GradeRecord,
  AttendanceSession,
  AttendanceStatus,
  PerformanceLevel
} from '../../types';
import {
  calculateStudentGrade,
  calculateStudentAttendance,
  getPerformanceLevel,
  getPerformanceBadgeColor
} from '../../services/storage';
import {
  TableProperties,
  CalendarCheck,
  Plus,
  Save,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  UserCheck,
  MessageSquare,
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface GradesAttendanceTabProps {
  selectedCourse: string;
  selectedSubject: string;
  selectedPeriod: string;
  students: Student[];
  evaluations: EvaluationItem[];
  grades: GradeRecord[];
  attendance: AttendanceSession[];
  onUpdateGrades: (updatedGrades: GradeRecord[]) => void;
  onUpdateAttendance: (updatedAttendance: AttendanceSession[]) => void;
  onAddEvaluation: (newEval: EvaluationItem) => void;
}

export const GradesAttendanceTab: React.FC<GradesAttendanceTabProps> = ({
  selectedCourse,
  selectedSubject,
  selectedPeriod,
  students,
  evaluations,
  grades,
  attendance,
  onUpdateGrades,
  onUpdateAttendance,
  onAddEvaluation
}) => {
  const [activeSubView, setActiveSubView] = useState<'grades' | 'attendance'>('grades');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState<string>(
    attendance[0]?.date || new Date().toISOString().split('T')[0]
  );
  const [attendanceTopic, setAttendanceTopic] = useState('Sesión de clase regular');
  const [selectedStudentForNote, setSelectedStudentForNote] = useState<Student | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Course students
  const courseStudents = useMemo(() => {
    return students.filter((s) => s.course === selectedCourse);
  }, [students, selectedCourse]);

  // Course evaluations (up to 15)
  const currentEvals = useMemo(() => {
    return evaluations.filter(
      (e) => e.course === selectedCourse && e.subject === selectedSubject && e.period === selectedPeriod
    );
  }, [evaluations, selectedCourse, selectedSubject, selectedPeriod]);

  // Current attendance session for selected date
  const currentSession = useMemo(() => {
    return attendance.find(
      (s) => s.course === selectedCourse && s.subject === selectedSubject && s.date === selectedAttendanceDate
    );
  }, [attendance, selectedCourse, selectedSubject, selectedAttendanceDate]);

  // Handle inline grade change
  const handleScoreChange = (studentId: string, evalId: string, valStr: string) => {
    let numVal: number | null = null;
    if (valStr.trim() !== '') {
      numVal = parseFloat(valStr);
      if (isNaN(numVal)) return;
      // Clamp between 1.0 and 5.0
      if (numVal > 5.0) numVal = 5.0;
      if (numVal < 1.0) numVal = 1.0;
    }

    const nextGrades = [...grades];
    const existingIndex = nextGrades.findIndex(
      (g) => g.studentId === studentId && g.course === selectedCourse && g.subject === selectedSubject && g.period === selectedPeriod
    );

    if (existingIndex >= 0) {
      nextGrades[existingIndex] = {
        ...nextGrades[existingIndex],
        scores: {
          ...nextGrades[existingIndex].scores,
          [evalId]: numVal
        }
      };
    } else {
      nextGrades.push({
        studentId,
        course: selectedCourse,
        subject: selectedSubject,
        period: selectedPeriod,
        scores: {
          [evalId]: numVal
        }
      });
    }

    onUpdateGrades(nextGrades);
  };

  // Quick action: Add evaluation column (up to 15)
  const handleAddQuickColumn = () => {
    if (currentEvals.length >= 15) {
      alert('Se ha alcanzado el límite máximo de 15 casillas evaluativas para este periodo.');
      return;
    }

    const nextNum = currentEvals.length + 1;
    const newEval: EvaluationItem = {
      id: `ev-${Date.now()}`,
      course: selectedCourse,
      subject: selectedSubject,
      period: selectedPeriod,
      code: `C${nextNum}`,
      name: `Actividad ${nextNum}`,
      type: 'Formativa',
      weight: 10,
      maxScore: 5.0,
      date: new Date().toISOString().split('T')[0]
    };

    onAddEvaluation(newEval);
  };

  // Handle Attendance status click
  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    const nextAttendance = [...attendance];
    const sessionIndex = nextAttendance.findIndex(
      (s) => s.course === selectedCourse && s.subject === selectedSubject && s.date === selectedAttendanceDate
    );

    if (sessionIndex >= 0) {
      nextAttendance[sessionIndex] = {
        ...nextAttendance[sessionIndex],
        records: {
          ...nextAttendance[sessionIndex].records,
          [studentId]: status
        }
      };
    } else {
      // Create new session
      const newRec: Record<string, AttendanceStatus> = {};
      courseStudents.forEach((st) => {
        newRec[st.id] = st.id === studentId ? status : 'P';
      });

      nextAttendance.push({
        id: `att-${Date.now()}`,
        course: selectedCourse,
        subject: selectedSubject,
        date: selectedAttendanceDate,
        topic: attendanceTopic,
        records: newRec,
        notes: {}
      });
    }

    onUpdateAttendance(nextAttendance);
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const nextAttendance = [...attendance];
    const sessionIndex = nextAttendance.findIndex(
      (s) => s.course === selectedCourse && s.subject === selectedSubject && s.date === selectedAttendanceDate
    );

    const allP: Record<string, AttendanceStatus> = {};
    courseStudents.forEach((st) => {
      allP[st.id] = 'P';
    });

    if (sessionIndex >= 0) {
      nextAttendance[sessionIndex] = {
        ...nextAttendance[sessionIndex],
        records: allP
      };
    } else {
      nextAttendance.push({
        id: `att-${Date.now()}`,
        course: selectedCourse,
        subject: selectedSubject,
        date: selectedAttendanceDate,
        topic: attendanceTopic,
        records: allP,
        notes: {}
      });
    }

    onUpdateAttendance(nextAttendance);
  };

  // Save qualitative note
  const handleSaveStudentNote = () => {
    if (!selectedStudentForNote) return;

    const nextAttendance = [...attendance];
    const sessionIndex = nextAttendance.findIndex(
      (s) => s.course === selectedCourse && s.subject === selectedSubject && s.date === selectedAttendanceDate
    );

    if (sessionIndex >= 0) {
      nextAttendance[sessionIndex] = {
        ...nextAttendance[sessionIndex],
        notes: {
          ...(nextAttendance[sessionIndex].notes || {}),
          [selectedStudentForNote.id]: tempNoteText
        }
      };
      onUpdateAttendance(nextAttendance);
    }
    setSelectedStudentForNote(null);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <TableProperties className="h-6 w-6 text-blue-600" />
            Planilla de Calificaciones y Asistencia
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curso: <strong>{selectedCourse}</strong> • Asignatura: <strong>{selectedSubject}</strong> • Periodo: <strong>{selectedPeriod}</strong> (Escala Decreto MEN 1290)
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveSubView('grades')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'grades'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" /> Planilla de Notas ({currentEvals.length}/15)
          </button>
          <button
            type="button"
            onClick={() => setActiveSubView('attendance')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubView === 'attendance'
                ? 'bg-white text-blue-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="h-4 w-4" /> Registro de Asistencia
          </button>
        </div>
      </div>

      {/* VIEW 1: Grades Sheet */}
      {activeSubView === 'grades' && (
        <div className="space-y-4">
          {/* Action Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Escala de Valoración MEN:
              </span>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                  Superior (4.6-5.0)
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">
                  Alto (4.0-4.5)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                  Básico (3.0-3.9)
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                  Bajo (1.0-2.9)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddQuickColumn}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-2xs"
            >
              <Plus className="h-4 w-4" /> Añadir Casilla ({currentEvals.length}/15)
            </button>
          </div>

          {/* Flexible Grades Grid Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 sticky left-0 bg-slate-50 z-20 min-w-[200px] border-r border-slate-200 font-bold">
                      Estudiante
                    </th>
                    {currentEvals.map((ev) => (
                      <th
                        key={ev.id}
                        className="px-2.5 py-2 text-center min-w-[80px] max-w-[100px] border-r border-slate-200"
                        title={`${ev.name} (${ev.type}) - Peso: ${ev.weight}%`}
                      >
                        <span className="font-mono font-bold text-blue-700 block text-xs">
                          {ev.code}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block">
                          {ev.weight}%
                        </span>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center min-w-[100px] font-bold bg-slate-100 border-r border-slate-200">
                      Definitiva
                    </th>
                    <th className="px-4 py-3 text-center min-w-[110px] font-bold bg-slate-100">
                      Desempeño
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {courseStudents.map((student) => {
                    const gradeInfo = calculateStudentGrade(
                      student.id,
                      selectedCourse,
                      selectedSubject,
                      selectedPeriod,
                      grades,
                      evaluations
                    );
                    const badge = getPerformanceBadgeColor(gradeInfo.level);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        {/* Student Name */}
                        <td className="px-4 py-3 sticky left-0 bg-white z-10 border-r border-slate-200 font-medium">
                          <span className="font-bold text-slate-900 block truncate max-w-[180px]">
                            {student.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {student.document}
                          </span>
                        </td>

                        {/* Editable Evaluation Cells */}
                        {currentEvals.map((ev) => {
                          const score = gradeInfo.scores[ev.id];
                          const scoreLevel = typeof score === 'number' ? getPerformanceLevel(score) : null;
                          const cellColor =
                            scoreLevel === 'Bajo'
                              ? 'bg-rose-50 text-rose-700 font-bold'
                              : scoreLevel === 'Básico'
                              ? 'bg-amber-50 text-amber-800'
                              : scoreLevel === 'Alto'
                              ? 'bg-sky-50 text-sky-800'
                              : scoreLevel === 'Superior'
                              ? 'bg-emerald-50 text-emerald-800 font-bold'
                              : 'text-slate-400';

                          return (
                            <td
                              key={ev.id}
                              className="px-1 py-1.5 text-center border-r border-slate-100"
                            >
                              <input
                                type="number"
                                step="0.1"
                                min="1.0"
                                max="5.0"
                                value={typeof score === 'number' ? score : ''}
                                onChange={(e) =>
                                  handleScoreChange(student.id, ev.id, e.target.value)
                                }
                                placeholder="—"
                                className={`w-14 rounded-md border border-slate-200 p-1 text-center font-mono text-xs focus:border-blue-600 focus:outline-hidden ${cellColor}`}
                              />
                            </td>
                          );
                        })}

                        {/* Definitiva Average */}
                        <td className="px-4 py-3 text-center border-r border-slate-200 bg-slate-50/50">
                          <span
                            className={`font-mono text-sm font-black ${
                              gradeInfo.average < 3.0 ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {gradeInfo.average > 0 ? gradeInfo.average.toFixed(1) : '—'}
                          </span>
                        </td>

                        {/* Desempeño Badge */}
                        <td className="px-4 py-3 text-center bg-slate-50/50">
                          {gradeInfo.average > 0 ? (
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.border}`}
                            >
                              {gradeInfo.level}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Sin notas</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Rapid Attendance Registrar */}
      {activeSubView === 'attendance' && (
        <div className="space-y-4">
          {/* Attendance Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Fecha de la Sesión:
                </label>
                <input
                  type="date"
                  value={selectedAttendanceDate}
                  onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                  className="rounded-lg border border-slate-300 p-1.5 text-xs text-slate-800 font-semibold cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Tema / Eje Temático:
                </label>
                <input
                  type="text"
                  value={attendanceTopic}
                  onChange={(e) => setAttendanceTopic(e.target.value)}
                  placeholder="ej. Taller de resolución sistemas 2x2"
                  className="rounded-lg border border-slate-300 p-1.5 text-xs text-slate-800 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 className="h-4 w-4" /> Marcar Todos Presentes
              </button>
            </div>
          </div>

          {/* Quick Attendance Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Estudiante</th>
                  <th className="px-4 py-3 text-center">Estado de Asistencia</th>
                  <th className="px-4 py-3">Total Inasistencias Acumuladas</th>
                  <th className="px-4 py-3">Observación Cualitativa</th>
                  <th className="px-4 py-3 text-right">Nota de Clase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {courseStudents.map((student) => {
                  const status: AttendanceStatus = currentSession?.records[student.id] || 'P';
                  const note = currentSession?.notes?.[student.id];
                  const attStats = calculateStudentAttendance(
                    student.id,
                    selectedCourse,
                    selectedSubject,
                    attendance
                  );

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name */}
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">
                          {student.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {student.documentType} {student.document}
                        </span>
                      </td>

                      {/* 4-button quick status selector: P, A, E, R */}
                      <td className="px-4 py-3 text-center">
                        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100 gap-0.5">
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'P')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              status === 'P'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Presente"
                          >
                            P
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'A')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              status === 'A'
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Ausente (Falla)"
                          >
                            A
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'E')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              status === 'E'
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Excusa Justificada"
                          >
                            E
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAttendanceChange(student.id, 'R')}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                              status === 'R'
                                ? 'bg-sky-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                            title="Retardo"
                          >
                            R
                          </button>
                        </div>
                      </td>

                      {/* Total Absences */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold font-mono text-xs ${
                              attStats.absencePercentage >= 15 ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {attStats.absentCount} fallas ({attStats.absencePercentage}%)
                          </span>
                          {attStats.absencePercentage >= 15 && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                              <AlertTriangle className="h-3 w-3" /> Riesgo
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Qualitative Observation */}
                      <td className="px-4 py-3">
                        {note ? (
                          <span className="text-xs text-slate-700 italic bg-amber-50 px-2 py-1 rounded border border-amber-200 block truncate max-w-xs">
                            "{note}"
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Sin observación</span>
                        )}
                      </td>

                      {/* Add/Edit Note Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForNote(student);
                            setTempNoteText(note || '');
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {note ? 'Editar Nota' : 'Añadir Nota'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {selectedStudentForNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Observación de Clase para {selectedStudentForNote.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedStudentForNote(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Observación pedagógica o convivencial:
                </label>
                <textarea
                  rows={3}
                  value={tempNoteText}
                  onChange={(e) => setTempNoteText(e.target.value)}
                  placeholder="ej. Participación activa, presentó justificación médica, olvido de cuaderno..."
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForNote(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveStudentNote}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Guardar Observación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
