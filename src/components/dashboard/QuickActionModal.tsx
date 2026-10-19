import React, { useState, useEffect } from 'react';
import { StudentAlert } from '../../types';
import { requestAIRecommendation, RecommendationResponse } from '../../services/api';
import {
  Sparkles,
  Phone,
  MessageCircle,
  FileText,
  ShieldAlert,
  Send,
  Copy,
  Check,
  UserCheck,
  Clock,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  alert: StudentAlert | null;
  onClose: () => void;
  onOpenImprovementPlan: (studentId: string) => void;
  onRemitToOrientation: (studentId: string, notes: string) => void;
  onCommitmentSigned: (studentId: string, commitmentText: string) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  alert,
  onClose,
  onOpenImprovementPlan,
  onRemitToOrientation,
  onCommitmentSigned
}) => {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [remitSuccess, setRemitSuccess] = useState(false);
  const [commitmentSigned, setCommitmentSigned] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'recommendation' | 'citacion' | 'compromiso'>('recommendation');

  useEffect(() => {
    if (isOpen && alert) {
      fetchRecommendation();
    } else {
      setRecommendation(null);
      setRemitSuccess(false);
      setCommitmentSigned(false);
      setActiveSubTab('recommendation');
    }
  }, [isOpen, alert]);

  const fetchRecommendation = async () => {
    if (!alert) return;
    setLoading(true);
    try {
      const res = await requestAIRecommendation({
        studentName: alert.student.name,
        averageGrade: alert.averageGrade,
        absences: alert.absencesCount,
        totalClasses: alert.totalClasses,
        riskType: alert.riskReasons.join(' | '),
        observations: alert.student.inclusionProfile?.socioemotionalNotes || '',
        subject: alert.subject
      });
      setRecommendation(res);
    } catch (err) {
      console.error('Error fetching recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !alert) return null;

  const { student } = alert;

  // Clean guardian phone for WhatsApp (e.g. +573104567890 -> 573104567890)
  const rawPhone = student.guardianPhone.replace(/\D/g, '');
  const citationText = recommendation?.citacionTemplate || `Estimado acudiente de ${student.name}, solicitamos reunión para revisar su promedio actual de ${alert.averageGrade} y ${alert.absencesCount} fallas.`;
  const whatsappUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(citationText)}`;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handleExecuteRemit = () => {
    onRemitToOrientation(
      student.id,
      `Remisión preventiva por alerta de ${alert.riskSeverity.toLowerCase()}: promedio ${alert.averageGrade}/5.0 y ${alert.absencesCount} inasistencias en ${alert.subject}.`
    );
    setRemitSuccess(true);
  };

  const handleSignCommitment = () => {
    onCommitmentSigned(student.id, recommendation?.compromisoPedagogico || 'Compromiso académico firmado.');
    setCommitmentSigned(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  Asistente de Acción Rápida (IA)
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    alert.riskSeverity === 'Crítica'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : alert.riskSeverity === 'Alta'
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  Alerta {alert.riskSeverity}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Caso: <strong>{student.name}</strong> • Curso: {alert.course} • Asignatura: {alert.subject}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Student metrics bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-blue-50/50 p-4 border-b border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Promedio Actual:</span>
            <span className={`font-bold text-sm ${alert.averageGrade < 3.0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {alert.averageGrade} / 5.0 ({alert.performanceLevel})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Inasistencias:</span>
            <span className={`font-bold text-sm ${alert.absencePercentage >= 15 ? 'text-rose-600' : 'text-slate-800'}`}>
              {alert.absencesCount} de {alert.totalClasses} ({alert.absencePercentage}%)
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Acudiente:</span>
            <span className="font-semibold text-slate-800 block truncate">
              {student.guardianName} ({student.guardianRelationship})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Teléfono / WhatsApp:</span>
            <span className="font-mono font-semibold text-slate-800">
              {student.guardianPhone}
            </span>
          </div>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveSubTab('recommendation')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'recommendation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="h-4 w-4" /> Diagnóstico y Pasos
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('citacion')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'citacion'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageCircle className="h-4 w-4" /> Citación a Acudiente
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('compromiso')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'compromiso'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="h-4 w-4" /> Compromiso Académico
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-3" />
              <p className="text-sm font-semibold text-slate-800">
                Analizando historial académico y generando protocolo de acción...
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Conforme al Decreto MEN 1290 y lineamientos de convivencia escolar
              </p>
            </div>
          ) : !recommendation ? (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600">No se pudo cargar la recomendación en este momento.</p>
              <button
                onClick={fetchRecommendation}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <>
              {activeSubTab === 'recommendation' && (
                <div className="space-y-5">
                  {/* Immediate Action Banner */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      Acción Inmediata Sugerida por la IA
                    </span>
                    <h4 className="text-base font-bold text-blue-950 mt-1">
                      {recommendation.immediateAction}
                    </h4>
                    <p className="text-xs text-blue-800 mt-1">
                      Nivel de prioridad: <strong>{recommendation.diagnosis}</strong>
                    </p>
                  </div>

                  {/* Steps list */}
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Ruta de Intervención Pedagógica (Paso a Paso)
                    </h5>
                    <div className="space-y-2">
                      {recommendation.actionSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-slate-700 leading-relaxed font-medium">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('citacion')}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                    >
                      <MessageCircle className="h-4 w-4" /> Enviar Citación Acudiente
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenImprovementPlan(student.id);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" /> Generar Plan Mejoramiento
                    </button>

                    <button
                      type="button"
                      onClick={handleExecuteRemit}
                      disabled={remitSuccess}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer border ${
                        remitSuccess
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {remitSuccess ? (
                        <>
                          <Check className="h-4 w-4" /> Remitido a Orientación
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="h-4 w-4" /> Remitir a Orientación
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'citacion' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                        Texto Formateado de Citación Institucional
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyCitation}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                      >
                        {copiedCitation ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" /> Copiado
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copiar texto
                          </>
                        )}
                      </button>
                    </div>

                    <div className="rounded-lg bg-white p-3 border border-slate-300 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
                      {citationText}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 cursor-pointer transition-all"
                    >
                      <Send className="h-4 w-4" /> Abrir en WhatsApp ({student.guardianPhone})
                      <ExternalLink className="h-3 w-3 opacity-80" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <FileText className="h-4 w-4 text-slate-500" /> Imprimir Citación Oficial
                    </button>
                  </div>
                </div>
              )}

              {activeSubTab === 'compromiso' && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
                      Acta de Compromiso Pedagógico y Convivencial
                    </span>

                    <div className="rounded-lg bg-white p-4 border border-slate-300 text-xs text-slate-800 leading-relaxed whitespace-pre-line shadow-2xs">
                      {recommendation.compromisoPedagogico}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-4 text-[11px] text-slate-500">
                      <span>• Estudiante: {student.name}</span>
                      <span>• Acudiente: {student.guardianName}</span>
                      <span>• Fecha: {new Date().toLocaleDateString('es-CO')}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleSignCommitment}
                      disabled={commitmentSigned}
                      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                        commitmentSigned
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                      }`}
                    >
                      {commitmentSigned ? (
                        <>
                          <Check className="h-4 w-4" /> Compromiso Registrado con Éxito
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" /> Registrar y Formalizar Compromiso
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
