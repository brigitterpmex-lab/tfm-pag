import React, { useState } from 'react';
import { Student, UserProfile } from '../../types';
import { requestAIAdaptation, AdaptationResponse } from '../../services/api';
import {
  X,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Phone,
  Mail,
  User,
  ShieldCheck,
  Send,
  MessageCircle,
  Check,
  Save,
  Edit3
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  student: Student | null;
  currentUser: UserProfile;
  selectedSubject: string;
  onClose: () => void;
  onUpdateStudent: (updated: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  student,
  currentUser,
  selectedSubject,
  onClose,
  onUpdateStudent
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'nee' | 'adaptation'>('nee');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [orientNotesInput, setOrientNotesInput] = useState('');
  const [isEditingNee, setIsEditingNee] = useState(false);

  // Editable NEE profile states
  const [hasNEE, setHasNEE] = useState(false);
  const [diagnosesText, setDiagnosesText] = useState('');
  const [socioemotionalNotes, setSocioemotionalNotes] = useState('');
  const [healthConditions, setHealthConditions] = useState('');

  // Sync state when student changes
  React.useEffect(() => {
    if (student) {
      setHasNEE(student.inclusionProfile?.hasNEE || false);
      setDiagnosesText(student.inclusionProfile?.diagnoses?.join(', ') || '');
      setSocioemotionalNotes(student.inclusionProfile?.socioemotionalNotes || '');
      setHealthConditions(student.inclusionProfile?.healthConditions || '');
      setOrientNotesInput(student.inclusionProfile?.orientationNotes || '');
      setIsEditingNee(false);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const isCounselor = currentUser.role === 'orientador';
  const cleanPhone = student.guardianPhone.replace(/\D/g, '');

  const handleSaveNeeProfile = () => {
    const updatedStudent: Student = {
      ...student,
      inclusionProfile: {
        ...student.inclusionProfile,
        hasNEE,
        diagnoses: diagnosesText
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        socioemotionalNotes,
        healthConditions
      }
    };
    onUpdateStudent(updatedStudent);
    setIsEditingNee(false);
  };

  const handleGenerateAIAdaptation = async () => {
    setGeneratingAI(true);
    try {
      const condition = diagnosesText || (hasNEE ? 'Condición de inclusión' : 'Refuerzo pedagógico general');
      const details = socioemotionalNotes || 'Requiere flexibilización en tiempos y apoyos visuales';

      const res = await requestAIAdaptation({
        studentName: student.name,
        grade: student.course,
        subject: selectedSubject,
        condition,
        details,
        currentPerformance: 'Desempeño Básico / En seguimiento',
        learningStyle: 'Multisensorial (Visual y Kinestésico)'
      });

      const updatedStudent: Student = {
        ...student,
        inclusionProfile: {
          ...student.inclusionProfile,
          hasPIAR: true,
          orientationStatus: 'Pendiente', // resets to pending when new adaptation is generated
          piarApprovedByOrientation: false,
          adaptationStrategy: {
            ...res,
            dateGenerated: new Date().toISOString().split('T')[0]
          }
        }
      };

      onUpdateStudent(updatedStudent);
      setActiveTab('adaptation');
    } catch (err) {
      console.error('Error generating adaptation:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleApproveByOrientation = () => {
    const updatedStudent: Student = {
      ...student,
      inclusionProfile: {
        ...student.inclusionProfile,
        piarApprovedByOrientation: true,
        orientationStatus: 'Aprobado',
        orientationDate: new Date().toISOString().split('T')[0],
        orientationSignature: `${currentUser.name} (${currentUser.title})`,
        orientationNotes: orientNotesInput || 'Estrategia pedagógica validada y autorizada para aplicación en aula.'
      }
    };
    onUpdateStudent(updatedStudent);
  };

  const handleRequestAdjustments = () => {
    const updatedStudent: Student = {
      ...student,
      inclusionProfile: {
        ...student.inclusionProfile,
        piarApprovedByOrientation: false,
        orientationStatus: 'Con Observaciones',
        orientationNotes: orientNotesInput || 'Se solicitan ajustes en los instrumentos evaluativos.'
      }
    };
    onUpdateStudent(updatedStudent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
                {student.inclusionProfile?.hasNEE && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
                    <HeartHandshake className="h-3.5 w-3.5" /> Ficha NEE Activa
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Doc: {student.documentType} {student.document} • Curso: {student.course} • Edad: {student.age} años
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-slate-200 bg-white px-6 gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('nee')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'nee'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartHandshake className="h-4 w-4" /> Ficha de Inclusión y Apoyo (NEE)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('adaptation')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'adaptation'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" /> Adaptación Curricular IA (DUA/PIAR)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3.5 border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
              activeTab === 'info'
                ? 'border-purple-600 text-purple-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="h-4 w-4" /> Datos Personales y Acudiente
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'nee' && (
            <div className="space-y-6">
              {/* Top Banner explaining Decreto 1421 */}
              <div className="rounded-xl border border-purple-200 bg-linear-to-r from-purple-50 to-indigo-50/50 p-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-bold text-purple-900 text-sm flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-purple-700" />
                    Ficha de Inclusión y Registro de Ajustes Razonables (PIAR / DUA)
                  </h4>
                  <p className="text-xs text-purple-800/80 mt-1">
                    Conforme al Decreto 1421 de 2017 del Ministerio de Educación Nacional de Colombia. Registra diagnósticos clínicos, condiciones socioemocionales o de salud para adecuar la práctica pedagógica.
                  </p>
                </div>

                {!isEditingNee ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingNee(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-2xs hover:bg-purple-50 cursor-pointer shrink-0"
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Editar Ficha
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveNeeProfile}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-purple-800 cursor-pointer shrink-0"
                  >
                    <Save className="h-3.5 w-3.5" /> Guardar Cambios
                  </button>
                )}
              </div>

              {/* Form / View fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active NEE switch */}
                <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <div>
                    <label className="text-sm font-bold text-slate-800 block">
                      Estudiante con Necesidades Educativas Especiales (NEE / Inclusión)
                    </label>
                    <p className="text-xs text-slate-500">
                      Activa el protocolo PIAR y seguimiento prioritario por Orientación Escolar.
                    </p>
                  </div>
                  {isEditingNee ? (
                    <input
                      type="checkbox"
                      checked={hasNEE}
                      onChange={(e) => setHasNEE(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                  ) : (
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        student.inclusionProfile?.hasNEE
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {student.inclusionProfile?.hasNEE ? 'SÍ (Activo)' : 'NO'}
                    </span>
                  )}
                </div>

                {/* Diagnoses */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Diagnóstico Clínico / Condición
                  </label>
                  {isEditingNee ? (
                    <input
                      type="text"
                      value={diagnosesText}
                      onChange={(e) => setDiagnosesText(e.target.value)}
                      placeholder="ej. TDAH, Dislexia, Hipoacusia, TEA (separados por coma)"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {student.inclusionProfile?.diagnoses?.length > 0 ? (
                        student.inclusionProfile.diagnoses.map((d, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-800 border border-purple-200"
                          >
                            {d}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Sin diagnóstico formal reportado</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Health conditions */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Condiciones Físicas y de Salud
                  </label>
                  {isEditingNee ? (
                    <input
                      type="text"
                      value={healthConditions}
                      onChange={(e) => setHealthConditions(e.target.value)}
                      placeholder="ej. Uso de audífono, control médico, alergias"
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 mt-2 font-medium">
                      {student.inclusionProfile?.healthConditions || 'Sin observaciones de salud registradas'}
                    </p>
                  )}
                </div>

                {/* Socioemotional and Family Context */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 p-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                    Observaciones Socioemocionales y Estilo de Aprendizaje
                  </label>
                  {isEditingNee ? (
                    <textarea
                      rows={3}
                      value={socioemotionalNotes}
                      onChange={(e) => setSocioemotionalNotes(e.target.value)}
                      placeholder="Detalles sobre motivación, interacción con pares, ritmo de trabajo, barreras detectadas..."
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  ) : (
                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {student.inclusionProfile?.socioemotionalNotes || 'Sin observaciones socioafectivas registradas.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Banner to trigger Curricular Adaptation */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div>
                  <h5 className="font-bold text-blue-900 text-sm">
                    Módulo IA de Adaptación Curricular (DUA)
                  </h5>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Genera automáticamente ajustes metodológicos, recursos y formas de evaluación adaptadas a {student.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAIAdaptation}
                  disabled={generatingAI}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:from-purple-700 hover:to-indigo-700 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  {generatingAI ? 'Generando Propuesta IA...' : 'Generar / Actualizar con IA'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'adaptation' && (
            <div className="space-y-6">
              {/* Header with status and validation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Estado de Aprobación por Orientación Escolar
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          student.inclusionProfile?.orientationStatus === 'Aprobado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : student.inclusionProfile?.orientationStatus === 'Con Observaciones'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        }`}
                      >
                        {student.inclusionProfile?.orientationStatus === 'Aprobado' ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Aprobado por Orientación Escolar
                          </>
                        ) : student.inclusionProfile?.orientationStatus === 'Con Observaciones' ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            Con Observaciones / Requiere Ajuste
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Pendiente de Validación por Orientación
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateAIAdaptation}
                    disabled={generatingAI}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    {generatingAI ? 'Generando...' : 'Regenerar con IA'}
                  </button>
                </div>

                {student.inclusionProfile?.orientationSignature && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap gap-4">
                    <span>
                      • <strong>Validado por:</strong> {student.inclusionProfile.orientationSignature}
                    </span>
                    <span>
                      • <strong>Fecha:</strong> {student.inclusionProfile.orientationDate}
                    </span>
                  </div>
                )}

                {student.inclusionProfile?.orientationNotes && (
                  <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    <strong>Dictamen de Orientación:</strong> {student.inclusionProfile.orientationNotes}
                  </div>
                )}
              </div>

              {/* Strategy Details */}
              {student.inclusionProfile?.adaptationStrategy ? (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800 block mb-1">
                      Objetivo y Resumen Pedagógico DUA
                    </span>
                    <p className="text-xs text-blue-950 leading-relaxed font-medium">
                      {student.inclusionProfile.adaptationStrategy.summary}
                    </p>
                  </div>

                  {/* Methodological Adjustments */}
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 rounded-md bg-blue-100 text-blue-700 items-center justify-center font-bold text-xs">
                        1
                      </span>
                      Ajustes Metodológicos para el Aula de Clases
                    </h5>
                    <ul className="space-y-2">
                      {student.inclusionProfile.adaptationStrategy.methodologicalAdjustments.map((adj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{adj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Didactic Resources */}
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 rounded-md bg-emerald-100 text-emerald-700 items-center justify-center font-bold text-xs">
                        2
                      </span>
                      Recursos Didácticos y Apoyos Tecnológicos Accesibles
                    </h5>
                    <ul className="space-y-2">
                      {student.inclusionProfile.adaptationStrategy.didacticResources.map((res, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Evaluative Strategies */}
                  <div className="rounded-xl border border-slate-200 p-4 bg-white">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 rounded-md bg-purple-100 text-purple-700 items-center justify-center font-bold text-xs">
                        3
                      </span>
                      Estrategias Evaluativas Flexibles y Alternativas
                    </h5>
                    <ul className="space-y-2">
                      {student.inclusionProfile.adaptationStrategy.evaluativeStrategies.map((ev, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <Check className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Socioemotional */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 block mb-1">
                      Acompañamiento Socioemocional en el Aula
                    </span>
                    <p className="text-xs text-amber-950 leading-relaxed">
                      {student.inclusionProfile.adaptationStrategy.socioemotionalSupport}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 rounded-xl border border-dashed border-slate-300">
                  <Sparkles className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    Aún no se ha generado una propuesta de adaptación curricular
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Haz clic en "Generar con IA" para que el motor proponga ajustes específicos según el diagnóstico.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateAIAdaptation}
                    disabled={generatingAI}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-700 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    Generar Propuesta Curricular con IA
                  </button>
                </div>
              )}

              {/* Counselors Explicit Validation Box */}
              <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-purple-700" />
                  <h5 className="text-sm font-bold text-purple-900">
                    Panel de Validación de Orientación Escolar
                  </h5>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Como requisito del Decreto 1421, toda adaptación y PIAR debe contar con el concepto favorable de la Psicoorientadora antes de su ejecución definitiva en las planillas y evaluaciones.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Observaciones Técnicas o Dictamen de Orientación:
                    </label>
                    <input
                      type="text"
                      value={orientNotesInput}
                      onChange={(e) => setOrientNotesInput(e.target.value)}
                      placeholder="ej. Se valida la ampliación de tiempos y la sustentación oral individual..."
                      className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApproveByOrientation}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprobar y Validar Estrategia (Sello de Orientación)
                    </button>

                    <button
                      type="button"
                      onClick={handleRequestAdjustments}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100 cursor-pointer"
                    >
                      <AlertCircle className="h-4 w-4" />
                      Registrar con Observaciones
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
                  Datos de Contacto del Acudiente Principal
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nombre del Acudiente:</span>
                    <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                      {student.guardianName}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Parentesco: {student.guardianRelationship}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Teléfono / Celular:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {student.guardianPhone}
                      </span>
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Correo Electrónico:</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a
                        href={`mailto:${student.guardianEmail}`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {student.guardianEmail}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Canal de Contacto Preferido:</span>
                    <span className="font-medium text-slate-700 mt-1 block">
                      WhatsApp y Llamada telefónica en horario diurno
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
