import React, { useState, useMemo } from 'react';
import { Student, UserProfile } from '../../types';
import {
  Users,
  Search,
  Plus,
  HeartHandshake,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { StudentDetailModal } from './StudentDetailModal';

interface StudentsTabProps {
  selectedCourse: string;
  selectedSubject: string;
  students: Student[];
  currentUser: UserProfile;
  onUpdateStudent: (updated: Student) => void;
  onAddStudent: (newStudent: Student) => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  selectedCourse,
  selectedSubject,
  students,
  currentUser,
  onUpdateStudent,
  onAddStudent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNEEOnly, setFilterNEEOnly] = useState(false);
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Student Form State
  const [newDoc, setNewDoc] = useState('');
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState(14);
  const [newGender, setNewGender] = useState<'M' | 'F' | 'Otro'>('M');
  const [newGuardian, setNewGuardian] = useState('');
  const [newPhone, setNewPhone] = useState('+573');
  const [newEmail, setNewEmail] = useState('');
  const [newHasNEE, setNewHasNEE] = useState(false);
  const [newDiagnoses, setNewDiagnoses] = useState('');

  // Course students with filters
  const courseStudents = useMemo(() => {
    return students.filter((s) => s.course === selectedCourse);
  }, [students, selectedCourse]);

  const filteredStudents = useMemo(() => {
    return courseStudents.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.document.includes(searchQuery);
      const matchesNEE = filterNEEOnly ? s.inclusionProfile?.hasNEE : true;
      return matchesSearch && matchesNEE;
    });
  }, [courseStudents, searchQuery, filterNEEOnly]);

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDoc.trim()) return;

    const created: Student = {
      id: `std-${Date.now()}`,
      document: newDoc.trim(),
      documentType: 'TI',
      name: newName.trim(),
      age: Number(newAge),
      gender: newGender,
      course: selectedCourse,
      guardianName: newGuardian.trim() || 'Acudiente Principal',
      guardianPhone: newPhone.trim() || '+573000000000',
      guardianEmail: newEmail.trim() || 'acudiente@ejemplo.com',
      guardianRelationship: 'Madre',
      inclusionProfile: {
        hasNEE: newHasNEE,
        diagnoses: newDiagnoses
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
        socioemotionalNotes: '',
        healthConditions: '',
        hasPIAR: newHasNEE,
        piarApprovedByOrientation: false,
        orientationStatus: 'Pendiente',
        adaptationStrategy: null
      }
    };

    onAddStudent(created);
    setIsAddModalOpen(false);
    // Reset form
    setNewDoc('');
    setNewName('');
    setNewGuardian('');
    setNewDiagnoses('');
    setNewHasNEE(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Gestión e Información de Estudiantes - {selectedCourse}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro confidencial de datos de contacto, fichas de inclusión DUA/PIAR y adaptaciones curriculares validadas por Orientación.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" /> Nuevo Estudiante
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => setFilterNEEOnly(!filterNEEOnly)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              filterNEEOnly
                ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            Solo Fichas NEE / PIAR ({courseStudents.filter((s) => s.inclusionProfile?.hasNEE).length})
          </button>
          <span className="text-xs text-slate-400">
            Total: <strong>{filteredStudents.length}</strong> estudiantes
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Estudiante</th>
                <th className="px-4 py-3.5">Identificación / Edad</th>
                <th className="px-4 py-3.5">Ficha de Inclusión (NEE)</th>
                <th className="px-4 py-3.5">Contacto Acudiente</th>
                <th className="px-4 py-3.5">Adaptación Curricular IA</th>
                <th className="px-4 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredStudents.map((student) => {
                const hasNee = student.inclusionProfile?.hasNEE;
                const cleanPhone = student.guardianPhone.replace(/\D/g, '');
                const orientStatus = student.inclusionProfile?.orientationStatus;

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStudentForModal(student)}
                  >
                    {/* Name & Avatar */}
                    <td className="px-4 py-3.5 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0 ${
                            hasNee ? 'bg-purple-600' : 'bg-slate-700'
                          }`}
                        >
                          {student.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Curso {student.course}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID & Age */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-slate-800 font-semibold block">
                        {student.documentType} {student.document}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {student.age} años • Género: {student.gender}
                      </span>
                    </td>

                    {/* NEE / Inclusion Profile */}
                    <td className="px-4 py-3.5">
                      {hasNee ? (
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {student.inclusionProfile.diagnoses.map((diag, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[11px] font-semibold"
                              >
                                <HeartHandshake className="h-3 w-3 text-purple-600" />
                                {diag}
                              </span>
                            ))}
                          </div>
                          {student.inclusionProfile.hasPIAR && (
                            <span className="text-[10px] text-purple-600 font-medium block mt-1">
                              • Con Plan Individual de Ajustes (PIAR)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">
                          Sin condición NEE registrada
                        </span>
                      )}
                    </td>

                    {/* Guardian Contact & WhatsApp */}
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-1">
                        <span className="font-medium text-slate-800 block truncate max-w-[160px]">
                          {student.guardianName}{' '}
                          <span className="text-[10px] text-slate-400">
                            ({student.guardianRelationship})
                          </span>
                        </span>
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-mono text-[11px] font-semibold border border-emerald-200"
                            title="Abrir chat directo de WhatsApp con el acudiente"
                          >
                            <MessageCircle className="h-3 w-3 text-emerald-600" />
                            {student.guardianPhone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* AI Adaptation Status & Counselor Badge */}
                    <td className="px-4 py-3.5">
                      {student.inclusionProfile?.adaptationStrategy ? (
                        <div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              orientStatus === 'Aprobado'
                                ? 'bg-emerald-100 text-emerald-800'
                                : orientStatus === 'Con Observaciones'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {orientStatus === 'Aprobado' ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            ) : orientStatus === 'Con Observaciones' ? (
                              <AlertCircle className="h-3 w-3 text-amber-600" />
                            ) : (
                              <Clock className="h-3 w-3 text-yellow-600" />
                            )}
                            {orientStatus === 'Aprobado'
                              ? 'Aprobada Orientación'
                              : orientStatus === 'Con Observaciones'
                              ? 'Con Observaciones'
                              : 'Revisión Pendiente'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Estrategia DUA activa
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudentForModal(student);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 cursor-pointer"
                        >
                          <Sparkles className="h-3 w-3" /> Generar con IA
                        </button>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudentForModal(student);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 cursor-pointer"
                      >
                        Ver Ficha <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={Boolean(selectedStudentForModal)}
        student={selectedStudentForModal}
        currentUser={currentUser}
        selectedSubject={selectedSubject}
        onClose={() => setSelectedStudentForModal(null)}
        onUpdateStudent={(updated) => {
          onUpdateStudent(updated);
          setSelectedStudentForModal(updated);
        }}
      />

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="h-4 w-4 text-blue-600" /> Registrar Nuevo Estudiante en {selectedCourse}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="ej. Mariana Gómez Pérez"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Documento Identidad:</label>
                  <input
                    type="text"
                    required
                    value={newDoc}
                    onChange={(e) => setNewDoc(e.target.value)}
                    placeholder="ej. 1098765432"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Edad:</label>
                  <input
                    type="number"
                    min={10}
                    max={20}
                    value={newAge}
                    onChange={(e) => setNewAge(parseInt(e.target.value) || 14)}
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre Acudiente:</label>
                  <input
                    type="text"
                    required
                    value={newGuardian}
                    onChange={(e) => setNewGuardian(e.target.value)}
                    placeholder="ej. Carlos Gómez"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono / WhatsApp:</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+57310..."
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Correo Acudiente:</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="acudiente@correo.com"
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-blue-600"
                  />
                </div>

                {/* Inclusion checkbox */}
                <div className="col-span-2 rounded-xl bg-purple-50 p-3 border border-purple-200">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
                    <input
                      type="checkbox"
                      checked={newHasNEE}
                      onChange={(e) => setNewHasNEE(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                    />
                    ¿Requiere Ficha de Inclusión o Apoyo NEE (Decreto 1421)?
                  </label>
                  {newHasNEE && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={newDiagnoses}
                        onChange={(e) => setNewDiagnoses(e.target.value)}
                        placeholder="Diagnósticos (ej. TDAH, Dislexia, Hipoacusia)"
                        className="w-full rounded-md border border-purple-300 bg-white p-1.5 text-xs text-purple-900"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
                >
                  Guardar Estudiante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
