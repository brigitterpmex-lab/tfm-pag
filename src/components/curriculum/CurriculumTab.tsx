import React, { useState } from 'react';
import { DBAItem, AchievementItem, EvaluationItem } from '../../types';
import {
  BookOpenCheck,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  Sparkles,
  FileCheck2,
  ListFilter
} from 'lucide-react';

interface CurriculumTabProps {
  selectedCourse: string;
  selectedSubject: string;
  selectedPeriod: string;
  dbas: DBAItem[];
  achievements: AchievementItem[];
  evaluations: EvaluationItem[];
  onAddAchievement: (newAch: AchievementItem) => void;
  onAddEvaluation: (newEval: EvaluationItem) => void;
}

export const CurriculumTab: React.FC<CurriculumTabProps> = ({
  selectedCourse,
  selectedSubject,
  selectedPeriod,
  dbas,
  achievements,
  evaluations,
  onAddAchievement,
  onAddEvaluation
}) => {
  const [activeSubView, setActiveSubView] = useState<'achievements' | 'evaluations' | 'dbas'>('achievements');
  const [isAddAchOpen, setIsAddAchOpen] = useState(false);
  const [isAddEvalOpen, setIsAddEvalOpen] = useState(false);

  // New Achievement Form
  const [newAchCode, setNewAchCode] = useState(`LOG-${Date.now().toString().slice(-4)}`);
  const [newAchDesc, setNewAchDesc] = useState('');
  const [newAchSuperior, setNewAchSuperior] = useState('');
  const [newAchAlto, setNewAchAlto] = useState('');
  const [newAchBasico, setNewAchBasico] = useState('');
  const [newAchBajo, setNewAchBajo] = useState('');
  const [newAchDbaId, setNewAchDbaId] = useState('');

  // New Evaluation Form
  const [newEvalCode, setNewEvalCode] = useState(`C${evaluations.length + 1}`);
  const [newEvalName, setNewEvalName] = useState('');
  const [newEvalType, setNewEvalType] = useState<EvaluationItem['type']>('Formativa');
  const [newEvalWeight, setNewEvalWeight] = useState(15);
  const [newEvalDate, setNewEvalDate] = useState(new Date().toISOString().split('T')[0]);

  // Current view filtered items
  const courseAchievements = achievements.filter(
    (a) => a.course === selectedCourse && a.subject === selectedSubject && a.period === selectedPeriod
  );

  const courseEvaluations = evaluations.filter(
    (e) => e.course === selectedCourse && e.subject === selectedSubject && e.period === selectedPeriod
  );

  const relevantDBAs = dbas.filter(
    (d) => d.subject.toLowerCase() === selectedSubject.toLowerCase()
  );

  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAchDesc.trim()) return;

    const created: AchievementItem = {
      id: `ach-${Date.now()}`,
      code: newAchCode,
      course: selectedCourse,
      subject: selectedSubject,
      period: selectedPeriod,
      dbaId: newAchDbaId || undefined,
      description: newAchDesc,
      superiorCriteria: newAchSuperior || 'Domina con solvencia y propone soluciones innovadoras.',
      altoCriteria: newAchAlto || 'Aplica los conceptos y procedimientos sin dificultad.',
      basicoCriteria: newAchBasico || 'Cumple con los requerimientos mínimos de aprendizaje.',
      bajoCriteria: newAchBajo || 'Presenta dificultades en la apropiación de conceptos básicos.'
    };

    onAddAchievement(created);
    setIsAddAchOpen(false);
    setNewAchDesc('');
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvalName.trim()) return;

    const created: EvaluationItem = {
      id: `ev-${Date.now()}`,
      course: selectedCourse,
      subject: selectedSubject,
      period: selectedPeriod,
      code: newEvalCode,
      name: newEvalName,
      type: newEvalType,
      weight: Number(newEvalWeight),
      maxScore: 5.0,
      date: newEvalDate
    };

    onAddEvaluation(created);
    setIsAddEvalOpen(false);
    setNewEvalName('');
    setNewEvalCode(`C${evaluations.length + 2}`);
  };

  const totalEvaluationWeight = courseEvaluations.reduce((sum, ev) => sum + ev.weight, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpenCheck className="h-6 w-6 text-blue-600" />
            Planeación Curricular, DBA y Logros
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Estructuración de logros por periodo alineados con los Derechos Básicos de Aprendizaje (DBA) del MEN y mapeo de actividades evaluativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubView === 'achievements' ? (
            <button
              type="button"
              onClick={() => setIsAddAchOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Nuevo Logro MEN
            </button>
          ) : activeSubView === 'evaluations' ? (
            <button
              type="button"
              onClick={() => setIsAddEvalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Planificar Actividad / Casilla
            </button>
          ) : null}
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSubView('achievements')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeSubView === 'achievements'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Award className="h-4 w-4" /> Logros Trimestrales ({courseAchievements.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('evaluations')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeSubView === 'evaluations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileCheck2 className="h-4 w-4" /> Mapeo de Clases & Actividades ({courseEvaluations.length})
          {totalEvaluationWeight !== 100 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800">
              {totalEvaluationWeight}%
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubView('dbas')}
          className={`pb-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeSubView === 'dbas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="h-4 w-4" /> Banco de DBA del MEN ({relevantDBAs.length})
        </button>
      </div>

      {/* View 1: Achievements (Logros Trimestrales) */}
      {activeSubView === 'achievements' && (
        <div className="space-y-4">
          {courseAchievements.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Award className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No hay logros formulados aún para {selectedCourse} en {selectedSubject} ({selectedPeriod})
              </p>
              <button
                type="button"
                onClick={() => setIsAddAchOpen(true)}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Crear Primer Logro
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {courseAchievements.map((ach) => {
                const associatedDba = dbas.find((d) => d.id === ach.dbaId);

                return (
                  <div
                    key={ach.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {ach.code}
                          </span>
                          <span className="text-xs text-slate-400">
                            {ach.course} • {ach.subject} • {ach.period}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-2 leading-relaxed">
                          {ach.description}
                        </h3>
                      </div>

                      {associatedDba && (
                        <div className="rounded-lg bg-emerald-50 px-2.5 py-1 border border-emerald-200 text-xs text-emerald-800 shrink-0">
                          <strong>Alineado con DBA #{associatedDba.number}</strong>
                        </div>
                      )}
                    </div>

                    {/* Criteria Accordion / Grid */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                        <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block mb-1">
                          Desempeño Superior (4.6 - 5.0)
                        </span>
                        <p className="text-emerald-950 text-[11px] leading-tight">
                          {ach.superiorCriteria}
                        </p>
                      </div>

                      <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3">
                        <span className="font-bold text-sky-800 uppercase tracking-wider text-[10px] block mb-1">
                          Desempeño Alto (4.0 - 4.5)
                        </span>
                        <p className="text-sky-950 text-[11px] leading-tight">
                          {ach.altoCriteria}
                        </p>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                        <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block mb-1">
                          Desempeño Básico (3.0 - 3.9)
                        </span>
                        <p className="text-amber-950 text-[11px] leading-tight">
                          {ach.basicoCriteria}
                        </p>
                      </div>

                      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3">
                        <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px] block mb-1">
                          Desempeño Bajo (1.0 - 2.9)
                        </span>
                        <p className="text-rose-950 text-[11px] leading-tight">
                          {ach.bajoCriteria}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Class Evaluations & Activities Mapping */}
      {activeSubView === 'evaluations' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-blue-900 block">
                Mapeo de Actividades hacia la Planilla de Calificaciones
              </span>
              <p className="text-blue-800 mt-0.5">
                Cada actividad planificada aquí crea una columna evaluativa en la planilla (hasta 15 casillas independientes con pesos configurables).
              </p>
            </div>
            <div className="shrink-0 text-right">
              <span className="font-bold text-slate-600 block">Ponderación Total:</span>
              <span
                className={`text-sm font-black ${
                  totalEvaluationWeight === 100 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {totalEvaluationWeight}% / 100%
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Código Casilla</th>
                  <th className="px-4 py-3">Nombre de la Actividad</th>
                  <th className="px-4 py-3">Tipo de Evaluación</th>
                  <th className="px-4 py-3">Fecha Programada</th>
                  <th className="px-4 py-3">Ponderación (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {courseEvaluations.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      {ev.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {ev.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          ev.type === 'Proyecto DUA'
                            ? 'bg-purple-100 text-purple-800'
                            : ev.type === 'Autoevaluación'
                            ? 'bg-amber-100 text-amber-800'
                            : ev.type === 'Sumativa'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {ev.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {ev.date}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {ev.weight}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: DBA Catalog */}
      {activeSubView === 'dbas' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Derechos Básicos de Aprendizaje (DBA) - {selectedSubject}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Estándares oficiales expedidos por el Ministerio de Educación Nacional de Colombia para la estructuración curricular.
            </p>
          </div>

          <div className="space-y-3">
            {relevantDBAs.map((dba) => (
              <div key={dba.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold px-2 py-0.5 rounded bg-blue-600 text-white text-xs">
                    DBA #{dba.number}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Grado {dba.grade} • {dba.subject}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm leading-relaxed">
                  {dba.statement}
                </h4>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Evidencias de Aprendizaje del MEN:
                  </span>
                  <ul className="space-y-1">
                    {dba.evidences.map((ev, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Achievement Modal */}
      {isAddAchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Nuevo Logro Institucional (Decreto 1290)
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAchOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAchievement} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Código del Logro:</label>
                  <input
                    type="text"
                    required
                    value={newAchCode}
                    onChange={(e) => setNewAchCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Alinear con DBA (Opcional):</label>
                  <select
                    value={newAchDbaId}
                    onChange={(e) => setNewAchDbaId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="">Seleccionar DBA...</option>
                    {relevantDBAs.map((d) => (
                      <option key={d.id} value={d.id}>
                        DBA #{d.number} - {d.statement.slice(0, 45)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Descripción del Logro / Desempeño:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={newAchDesc}
                    onChange={(e) => setNewAchDesc(e.target.value)}
                    placeholder="ej. Formula y resuelve problemas contextualizados mediante modelos lineales..."
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>

                <div className="col-span-2">
                  <span className="font-bold text-slate-600 block mb-2 uppercase text-[11px]">
                    Criterios de Valoración por Nivel (Escala MEN):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-emerald-700 font-bold block mb-0.5">Superior (4.6 - 5.0):</label>
                      <input
                        type="text"
                        value={newAchSuperior}
                        onChange={(e) => setNewAchSuperior(e.target.value)}
                        placeholder="Criterio superior..."
                        className="w-full rounded-md border border-slate-300 p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-sky-700 font-bold block mb-0.5">Alto (4.0 - 4.5):</label>
                      <input
                        type="text"
                        value={newAchAlto}
                        onChange={(e) => setNewAchAlto(e.target.value)}
                        placeholder="Criterio alto..."
                        className="w-full rounded-md border border-slate-300 p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-amber-700 font-bold block mb-0.5">Básico (3.0 - 3.9):</label>
                      <input
                        type="text"
                        value={newAchBasico}
                        onChange={(e) => setNewAchBasico(e.target.value)}
                        placeholder="Criterio básico..."
                        className="w-full rounded-md border border-slate-300 p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-rose-700 font-bold block mb-0.5">Bajo (1.0 - 2.9):</label>
                      <input
                        type="text"
                        value={newAchBajo}
                        onChange={(e) => setNewAchBajo(e.target.value)}
                        placeholder="Criterio bajo..."
                        className="w-full rounded-md border border-slate-300 p-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAchOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Guardar Logro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Evaluation Modal */}
      {isAddEvalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Planificar Nueva Actividad / Casilla Evaluativa
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEvalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Código Casilla:</label>
                  <input
                    type="text"
                    required
                    value={newEvalCode}
                    onChange={(e) => setNewEvalCode(e.target.value)}
                    placeholder="ej. C7"
                    className="w-full rounded-lg border border-slate-300 p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ponderación (%):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={newEvalWeight}
                    onChange={(e) => setNewEvalWeight(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Nombre de la Actividad:</label>
                  <input
                    type="text"
                    required
                    value={newEvalName}
                    onChange={(e) => setNewEvalName(e.target.value)}
                    placeholder="ej. Taller en parejas: Funciones lineales"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Actividad:</label>
                  <select
                    value={newEvalType}
                    onChange={(e) => setNewEvalType(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="Formativa">Formativa</option>
                    <option value="Sumativa">Sumativa</option>
                    <option value="Proyecto DUA">Proyecto DUA</option>
                    <option value="Autoevaluación">Autoevaluación</option>
                    <option value="Coevaluación">Coevaluación</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Programada:</label>
                  <input
                    type="date"
                    required
                    value={newEvalDate}
                    onChange={(e) => setNewEvalDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEvalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Agregar a Planilla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
