import React, { useState, useMemo } from 'react';
import {
  Student,
  ImprovementPlan,
  EvaluationItem,
  GradeRecord,
  DBAItem,
  UserProfile
} from '../../types';
import { requestAIImprovementPlan, ImprovementPlanResponse } from '../../services/api';
import { calculateStudentGrade } from '../../services/storage';
import {
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  Calendar,
  Check,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Award
} from 'lucide-react';

interface ImprovementPlansTabProps {
  selectedCourse: string;
  selectedSubject: string;
  selectedPeriod: string;
  students: Student[];
  evaluations: EvaluationItem[];
  grades: GradeRecord[];
  dbas: DBAItem[];
  plans: ImprovementPlan[];
  currentUser: UserProfile;
  initialPreselectedStudentId?: string | null;
  onUpdatePlans: (updatedPlans: ImprovementPlan[]) => void;
  onGradeRecovered?: (studentId: string, recoveredScore: number) => void;
}

export const ImprovementPlansTab: React.FC<ImprovementPlansTabProps> = ({
  selectedCourse,
  selectedSubject,
  selectedPeriod,
  students,
  evaluations,
  grades,
  dbas,
  plans,
  currentUser,
  initialPreselectedStudentId,
  onUpdatePlans,
  onGradeRecovered
}) => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(Boolean(initialPreselectedStudentId));
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialPreselectedStudentId || '');
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<ImprovementPlan | null>(null);
  const [generatingWithAI, setGeneratingWithAI] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Creator Form fields
  const [failedEvalsInput, setFailedEvalsInput] = useState<string[]>([]);
  const [pendingDbaInput, setPendingDbaInput] = useState('');
  const [weaknessesInput, setWeaknessesInput] = useState('');
  const [customDeadline, setCustomDeadline] = useState(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  // AI Generated draft
  const [generatedDraft, setGeneratedDraft] = useState<ImprovementPlanResponse | null>(null);

  // Filter plans for current course and subject
  const currentPlans = useMemo(() => {
    return plans.filter(
      (p) => p.course === selectedCourse && p.subject === selectedSubject && p.period === selectedPeriod
    );
  }, [plans, selectedCourse, selectedSubject, selectedPeriod]);

  // Students in this course who have low performance or need plans
  const courseStudents = useMemo(() => {
    return students.filter((s) => s.course === selectedCourse);
  }, [students, selectedCourse]);

  // Sync when initialPreselectedStudentId changes
  React.useEffect(() => {
    if (initialPreselectedStudentId) {
      setIsCreatorOpen(true);
      handleSelectStudent(initialPreselectedStudentId);
    }
  }, [initialPreselectedStudentId]);

  // When opening creator, if no student is selected, pick the first one
  const handleOpenCreator = () => {
    setIsCreatorOpen(true);
    setGenerationError(null);
    if (!selectedStudentId && courseStudents.length > 0) {
      // Prefer a student with average < 3.0 or the first student
      const failingStudent = courseStudents.find((st) => {
        const g = calculateStudentGrade(st.id, selectedCourse, selectedSubject, selectedPeriod, grades, evaluations);
        return g.average > 0 && g.average < 3.0;
      });
      handleSelectStudent(failingStudent ? failingStudent.id : courseStudents[0].id);
    }
  };

  // When a student is selected in creator, auto-detect failed evaluations
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setGeneratedDraft(null);
    setGenerationError(null);

    const gradeInfo = calculateStudentGrade(
      studentId,
      selectedCourse,
      selectedSubject,
      selectedPeriod,
      grades,
      evaluations
    );

    const failed: string[] = [];
    const currentEvals = evaluations.filter(
      (e) => e.course === selectedCourse && e.subject === selectedSubject && e.period === selectedPeriod
    );

    currentEvals.forEach((ev) => {
      const sc = gradeInfo.scores[ev.id];
      if (typeof sc === 'number' && sc < 3.0) {
        failed.push(`${ev.name} (${sc.toFixed(1)})`);
      } else if (sc === null || sc === undefined) {
        failed.push(`${ev.name} (Sin Presentar)`);
      }
    });

    setFailedEvalsInput(failed.length > 0 ? failed : ['Evaluación de periodo no superada']);

    // Auto-pick first DBA
    const relevantDba = dbas.find((d) => d.subject.toLowerCase() === selectedSubject.toLowerCase());
    if (relevantDba) {
      setPendingDbaInput(`DBA #${relevantDba.number}: ${relevantDba.statement.slice(0, 70)}...`);
    } else {
      setPendingDbaInput('Competencias básicas del periodo');
    }
    setWeaknessesInput('Comprensión de conceptos y resolución procedimental paso a paso');
  };

  // Generate Plan with AI
  const handleGeneratePlanAI = async () => {
    let student = students.find((s) => s.id === selectedStudentId);
    if (!student && courseStudents.length > 0) {
      student = courseStudents[0];
      handleSelectStudent(student.id);
    }

    if (!student) {
      setGenerationError('Por favor selecciona un estudiante para redactar el plan.');
      return;
    }

    setGeneratingWithAI(true);
    setGenerationError(null);

    try {
      const res = await requestAIImprovementPlan({
        studentName: student.name,
        grade: student.course,
        subject: selectedSubject,
        failedEvaluations: failedEvalsInput.length > 0 ? failedEvalsInput : ['Evaluación de periodo no superada'],
        pendingDBA: pendingDbaInput || 'Competencias básicas de la asignatura',
        weaknesses: weaknessesInput || 'Comprensión y aplicación de conceptos clave',
        period: selectedPeriod
      });

      setGeneratedDraft(res);
    } catch (err: any) {
      console.error('Error generating improvement plan:', err);
      setGenerationError('Hubo un error al generar el plan. Intenta de nuevo.');
    } finally {
      setGeneratingWithAI(false);
    }
  };

  // Formalize and Save Plan
  const handleSaveAndFormalize = () => {
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student || !generatedDraft) return;

    const gradeInfo = calculateStudentGrade(
      student.id,
      selectedCourse,
      selectedSubject,
      selectedPeriod,
      grades,
      evaluations
    );

    const newPlan: ImprovementPlan = {
      id: `plan-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      course: selectedCourse,
      subject: selectedSubject,
      period: selectedPeriod,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'Asignado',
      objective: generatedDraft.objective,
      competenciesToStrengthen: generatedDraft.competenciesToStrengthen,
      failedEvaluations: failedEvalsInput,
      activities: generatedDraft.activities,
      rubricCriteria: generatedDraft.rubricCriteria,
      deadlineDate: customDeadline,
      defenseDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      teacherApproval: true,
      orientationApproval: currentUser.role === 'orientador',
      initialGrade: gradeInfo.average || 2.2,
      commitmentStatement: generatedDraft.commitmentStatement
    };

    onUpdatePlans([newPlan, ...plans]);
    setIsCreatorOpen(false);
    setSelectedPlanForDetail(newPlan);
    setGeneratedDraft(null);
  };

  // Status progression action
  const handleUpdatePlanStatus = (planId: string, newStatus: ImprovementPlan['status'], recoveredScore?: number) => {
    const updated = plans.map((p) => {
      if (p.id === planId) {
        return {
          ...p,
          status: newStatus,
          recoveredGrade: recoveredScore !== undefined ? recoveredScore : p.recoveredGrade,
          orientationApproval: currentUser.role === 'orientador' ? true : p.orientationApproval
        };
      }
      return p;
    });

    onUpdatePlans(updated);

    if (selectedPlanForDetail && selectedPlanForDetail.id === planId) {
      setSelectedPlanForDetail({
        ...selectedPlanForDetail,
        status: newStatus,
        recoveredGrade: recoveredScore !== undefined ? recoveredScore : selectedPlanForDetail.recoveredGrade
      });
    }

    if (recoveredScore && onGradeRecovered && selectedPlanForDetail) {
      onGradeRecovered(selectedPlanForDetail.studentId, recoveredScore);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Planes de Mejoramiento Asistidos por IA (Decreto 1290)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Redacción automatizada de planes de nivelación individualizados según los desempeños no alcanzados, formalización y actas oficiales con firmas.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreator}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Crear Nuevo Plan con IA
        </button>
      </div>

      {/* Plans List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Planes Registrados para {selectedCourse} • {selectedSubject} ({currentPlans.length})
        </h2>

        {currentPlans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Sparkles className="h-10 w-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">
              No hay planes de mejoramiento formulados en este periodo
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Puedes seleccionar a cualquier estudiante con bajo rendimiento en el Dashboard o crearlo directamente haciendo clic en "Crear Nuevo Plan con IA".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlans.map((plan) => {
              const statusColor =
                plan.status === 'Superado'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : plan.status === 'En Proceso' || plan.status === 'Asignado'
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : plan.status === 'Sustentado'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300';

              return (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {plan.studentName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {plan.subject} • {plan.period} • Creado el {plan.dateCreated}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${statusColor}`}
                    >
                      {plan.status === 'Superado' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {plan.status}
                    </span>
                  </div>

                  <div className="mt-3.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-0.5">Objetivo Pedagógico:</span>
                    {plan.objective}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <span>Nota Inicial: </span>
                      <strong className="text-rose-600 font-mono">{plan.initialGrade}</strong>
                      {plan.recoveredGrade && (
                        <span>
                          {' '}
                          &rarr; Superada a:{' '}
                          <strong className="text-emerald-600 font-mono">{plan.recoveredGrade}</strong>
                        </span>
                      )}
                    </div>
                    <div>
                      <span>Entrega límite: </span>
                      <strong className="text-slate-800">{plan.deadlineDate}</strong>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForDetail(plan)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 cursor-pointer"
                    >
                      <FileText className="h-4 w-4" /> Ver Acta y Actividades
                    </button>

                    {plan.status !== 'Superado' ? (
                      <button
                        type="button"
                        onClick={() => handleUpdatePlanStatus(plan.id, 'Superado', 3.0)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        <Check className="h-4 w-4" /> Aprobar / Superar (3.0)
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <Award className="h-4 w-4" /> Nivelación Completada
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 1: AI Creator Modal */}
      {isCreatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-6">
            <div className="border-b border-slate-200 bg-linear-to-r from-purple-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-2 text-white">
                  <Sparkles className="h-6 w-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Generador Asistido de Planes de Mejoramiento (IA)</h3>
                  <p className="text-xs text-purple-100 mt-0.5">
                    Elaboración técnica según los Derechos Básicos de Aprendizaje y Decreto MEN 1290
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatorOpen(false)}
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto">
              {/* Error Banner */}
              {generationError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span>{generationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeneratePlanAI}
                    className="underline font-bold text-xs hover:text-rose-900 cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* Form to configure AI inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 block">
                      Seleccionar Estudiante Destinatario:
                    </label>
                    {selectedStudentId && (
                      <span className="text-[11px] text-purple-700 font-semibold">
                        Estudiante Seleccionado
                      </span>
                    )}
                  </div>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => handleSelectStudent(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-800 focus:border-purple-600 focus:outline-hidden"
                  >
                    <option value="">Selecciona un estudiante...</option>
                    {courseStudents.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.document})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Evaluaciones / Desempeños no superados:
                  </label>
                  <input
                    type="text"
                    value={failedEvalsInput.join(', ')}
                    onChange={(e) => setFailedEvalsInput(e.target.value.split(',').map((s) => s.trim()))}
                    placeholder="ej. Taller Ecuaciones (2.0), Quiz 1"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    DBA / Competencia a Reforzar:
                  </label>
                  <input
                    type="text"
                    value={pendingDbaInput}
                    onChange={(e) => setPendingDbaInput(e.target.value)}
                    placeholder="ej. Modelación y resolución de sistemas 2x2"
                    className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="w-full sm:w-auto">
                    <label className="font-bold text-slate-700 block mb-1">Fecha Límite de Entrega:</label>
                    <input
                      type="date"
                      value={customDeadline}
                      onChange={(e) => setCustomDeadline(e.target.value)}
                      className="rounded-lg border border-slate-300 bg-white p-2 text-xs font-semibold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePlanAI}
                    disabled={generatingWithAI}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    {generatingWithAI ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Generando Plan con IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-300" />
                        <span>Generar Propuesta con IA</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generating Animation Box */}
              {generatingWithAI && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-5 text-center space-y-2 animate-pulse">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white shadow-xs">
                    <Sparkles className="h-5 w-5 text-amber-300 animate-spin" />
                  </div>
                  <h4 className="font-bold text-sm text-purple-900">
                    Redactando Plan de Mejoramiento Pedagógico...
                  </h4>
                  <p className="text-xs text-purple-700 max-w-md mx-auto">
                    Analizando los Derechos Básicos de Aprendizaje (DBA), calibrando las actividades de nivelación y redactando los compromisos y rúbrica formal bajo el Decreto MEN 1290.
                  </p>
                </div>
              )}

              {/* Step 2: Preview generated AI proposal */}
              {generatedDraft && (
                <div className="space-y-4 pt-3 border-t border-slate-200">
                  <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-800 block mb-1">
                      Propuesta Generada por la IA
                    </span>
                    <h4 className="text-sm font-bold text-purple-950">
                      {generatedDraft.title}
                    </h4>
                    <p className="text-xs text-purple-900 mt-1">
                      {generatedDraft.objective}
                    </p>
                  </div>

                  {/* Activities Table */}
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                      Actividades Pedagógicas Estructuradas:
                    </h5>
                    <div className="space-y-2">
                      {generatedDraft.activities.map((act) => (
                        <div
                          key={act.step}
                          className="rounded-xl border border-slate-200 p-3 bg-white flex items-start justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                              {act.step}
                            </span>
                            <div>
                              <span className="font-bold text-slate-900 block">{act.title}</span>
                              <p className="text-slate-600 text-xs mt-0.5">{act.description}</p>
                              <span className="text-[11px] text-purple-700 font-medium block mt-1">
                                Formato: {act.deliveryFormat}
                              </span>
                            </div>
                          </div>
                          <span className="shrink-0 px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-xs">
                            {act.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rubric */}
                  <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <span className="font-bold text-slate-800 text-xs uppercase tracking-wider block mb-2">
                      Criterios de Evaluación y Rúbrica:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {generatedDraft.rubricCriteria.map((rub, i) => (
                        <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-center mb-1">
                            <strong className="text-slate-900">{rub.criterion}</strong>
                            <span className="text-purple-600 font-bold">{rub.weight}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">{rub.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Formal Commitment Statement */}
                  <div className="rounded-xl border border-slate-200 p-3 bg-white text-slate-700 italic text-[11px]">
                    "{generatedDraft.commitmentStatement}"
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGeneratedDraft(null)}
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                    >
                      Ajustar Parámetros
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAndFormalize}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      <Check className="h-4 w-4" /> Formalizar y Asignar Plan al Estudiante
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Detail & Printable Modal */}
      {selectedPlanForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-6">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Acta Oficial de Plan de Mejoramiento Académico
                </h3>
                <p className="text-xs text-slate-500">
                  Estudiante: <strong>{selectedPlanForDetail.studentName}</strong> • {selectedPlanForDetail.course} • {selectedPlanForDetail.subject}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Printer className="h-4 w-4 text-slate-500" /> Imprimir Acta
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlanForDetail(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[70vh] overflow-y-auto font-sans">
              {/* Institution Header */}
              <div className="border-b-2 border-slate-800 pb-3 text-center">
                <h2 className="text-sm font-black uppercase text-slate-900">
                  I.E. Técnico República de Colombia
                </h2>
                <p className="text-[11px] text-slate-600">
                  Resolución No. 0451 de la Secretaría de Educación • Sistema Institucional de Evaluación (SIEE) - Decreto MEN 1290 de 2009
                </p>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-2">
                  Acta de Concertación y Plan de Mejoramiento Individual
                </h3>
              </div>

              {/* Data Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Estudiante:</span>
                  <span className="font-bold text-slate-900">{selectedPlanForDetail.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Curso / Grado:</span>
                  <span className="font-bold text-slate-900">{selectedPlanForDetail.course}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Asignatura:</span>
                  <span className="font-bold text-slate-900">{selectedPlanForDetail.subject}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Periodo Lectivo:</span>
                  <span className="font-bold text-slate-900">{selectedPlanForDetail.period}</span>
                </div>
              </div>

              {/* Objective */}
              <div>
                <strong className="text-slate-900 block mb-1">1. Objetivo Pedagógico:</strong>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedPlanForDetail.objective}
                </p>
              </div>

              {/* Activities */}
              <div>
                <strong className="text-slate-900 block mb-2">2. Actividades y Evidencias de Nivelación:</strong>
                <div className="space-y-2">
                  {selectedPlanForDetail.activities.map((act) => (
                    <div key={act.step} className="p-3 rounded-lg border border-slate-200 flex justify-between gap-3">
                      <div>
                        <strong className="text-slate-900 block">
                          Actividad {act.step}: {act.title}
                        </strong>
                        <p className="text-slate-600 mt-0.5">{act.description}</p>
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Formato de entrega: {act.deliveryFormat}
                        </span>
                      </div>
                      <span className="font-bold text-slate-800 shrink-0">{act.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commitment */}
              <div>
                <strong className="text-slate-900 block mb-1">3. Compromiso y Concertación:</strong>
                <p className="text-slate-700 italic bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                  "{selectedPlanForDetail.commitmentStatement}"
                </p>
              </div>

              {/* Signatures Row */}
              <div className="mt-8 pt-6 border-t border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-[10px]">
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1" />
                  <span className="font-bold text-slate-800 block">Firma del Estudiante</span>
                  <span className="text-slate-500">{selectedPlanForDetail.studentName}</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1" />
                  <span className="font-bold text-slate-800 block">Firma del Acudiente</span>
                  <span className="text-slate-500">C.C. Acudiente</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1" />
                  <span className="font-bold text-slate-800 block">Firma Docente Titular</span>
                  <span className="text-slate-500">{currentUser.name}</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 h-10 mb-1" />
                  <span className="font-bold text-slate-800 block">Vo.Bo. Orientación Escolar</span>
                  <span className="text-slate-500">Psic. Marcela Gómez V.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
