import React, { useState } from 'react';
import { Student, GradeRecord, AttendanceSession } from '../../types';
import {
  DownloadCloud,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileDown
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  students: Student[];
  grades: GradeRecord[];
  attendance: AttendanceSession[];
  selectedCourse: string;
  selectedSubject: string;
  onClose: () => void;
  onImportStudents: (newStudents: Student[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  students,
  grades,
  attendance,
  selectedCourse,
  selectedSubject,
  onClose,
  onImportStudents
}) => {
  const [activeTab, setActiveTab] = useState<'template' | 'import' | 'export'>('template');
  const [importedPreview, setImportedPreview] = useState<Student[] | null>(null);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  // Generate and download standard CSV Template
  const handleDownloadTemplate = () => {
    const csvContent =
      'TipoDocumento,Documento,NombreCompleto,Edad,Genero,Curso,NombreAcudiente,TelefonoAcudiente,CorreoAcudiente,Parentesco,TieneNEE,DiagnosticosNEE\n' +
      'TI,1098123456,Carlos Eduardo Ruiz,14,M,9° A,Martha Ruiz,+573101112233,martha.ruiz@gmail.com,Madre,SI,TDAH\n' +
      'TI,1098654321,Laura Marcela Morales,15,F,9° A,Pedro Morales,+573152223344,pedro.morales@hotmail.com,Padre,NO,\n' +
      'TI,1098998877,Andres Felipe Rios,14,M,9° A,Sonia Rios,+573183334455,sonia.rios@gmail.com,Madre,SI,Dislexia';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Plantilla_Estudiantes_EduGestion_${selectedCourse}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export current course students to CSV
  const handleExportStudents = () => {
    const courseStudents = students.filter((s) => s.course === selectedCourse);
    let csv = 'TipoDocumento,Documento,NombreCompleto,Edad,Genero,Curso,NombreAcudiente,TelefonoAcudiente,CorreoAcudiente,TieneNEE,Diagnosticos\n';

    courseStudents.forEach((st) => {
      const hasNee = st.inclusionProfile?.hasNEE ? 'SI' : 'NO';
      const diag = (st.inclusionProfile?.diagnoses || []).join('; ');
      csv += `"${st.documentType}","${st.document}","${st.name}",${st.age},"${st.gender}","${st.course}","${st.guardianName}","${st.guardianPhone}","${st.guardianEmail}","${hasNee}","${diag}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Estudiantes_${selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess(false);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;

        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setImportedPreview(parsed);
          } else {
            setImportError('El archivo JSON debe contener un arreglo de estudiantes.');
          }
        } else {
          // Parse CSV
          const lines = text.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            setImportError('El archivo CSV está vacío o solo contiene la cabecera.');
            return;
          }

          const parsedStudents: Student[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
            if (cols.length >= 3 && cols[2]) {
              const hasNee = cols[10]?.toUpperCase() === 'SI' || cols[10]?.toUpperCase() === 'TRUE';
              const diagnoses = cols[11] ? cols[11].split(';').map((d) => d.trim()).filter(Boolean) : [];

              parsedStudents.push({
                id: `std-imp-${Date.now()}-${i}`,
                documentType: (cols[0] as any) || 'TI',
                document: cols[1] || `${1098000000 + i}`,
                name: cols[2],
                age: parseInt(cols[3]) || 14,
                gender: (cols[4] as any) || 'M',
                course: cols[5] || selectedCourse,
                guardianName: cols[6] || 'Acudiente',
                guardianPhone: cols[7] || '+573000000000',
                guardianEmail: cols[8] || 'acudiente@ejemplo.com',
                guardianRelationship: (cols[9] as any) || 'Madre',
                inclusionProfile: {
                  hasNEE: hasNee,
                  diagnoses,
                  socioemotionalNotes: '',
                  healthConditions: '',
                  hasPIAR: hasNee,
                  piarApprovedByOrientation: false,
                  orientationStatus: 'Pendiente',
                  adaptationStrategy: null
                }
              });
            }
          }

          if (parsedStudents.length > 0) {
            setImportedPreview(parsedStudents);
          } else {
            setImportError('No se encontraron registros válidos en el archivo.');
          }
        }
      } catch (err: any) {
        setImportError(`Error al procesar el archivo: ${err.message}`);
      }
    };

    reader.readAsText(file);
  };

  const handleApplyImport = () => {
    if (!importedPreview || importedPreview.length === 0) return;
    onImportStudents(importedPreview);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <DownloadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Módulo de Importación / Exportación Masiva
              </h3>
              <p className="text-xs text-slate-500">
                Compatible con Google Sheets, Microsoft Excel y archivos CSV / JSON estándar
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'template'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" /> 1. Plantilla Excel / CSV
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UploadCloud className="h-4 w-4" /> 2. Cargar Archivo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-3 border-b-2 cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileDown className="h-4 w-4" /> 3. Exportar Reportes
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-xs space-y-4">
          {activeTab === 'template' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
                <h4 className="font-bold text-blue-900 text-sm mb-1">
                  Descargar Plantilla Oficial para Google Sheets o Excel
                </h4>
                <p className="text-blue-800 leading-relaxed">
                  Descarga este archivo con el encabezado estandarizado para diligenciar la lista de estudiantes, datos de contacto del acudiente y diagnóstico de necesidades educativas especiales (NEE).
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 bg-slate-50 font-mono text-[11px] text-slate-600 overflow-x-auto">
                TipoDocumento,Documento,NombreCompleto,Edad,Genero,Curso,NombreAcudiente,TelefonoAcudiente,CorreoAcudiente,Parentesco,TieneNEE,DiagnosticosNEE
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" /> Descargar Plantilla (.CSV)
                </button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 text-center hover:bg-slate-50/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <span className="font-bold text-slate-800 block text-sm">
                  Arrastra o selecciona tu archivo (.csv o .json)
                </span>
                <p className="text-slate-500 text-xs mt-1">
                  Alimentación masiva directa de estudiantes y perfiles de inclusión
                </p>

                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="mt-4 inline-block text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              {importError && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importedPreview && (
                <div className="space-y-3 rounded-xl border border-slate-200 p-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Vista Previa ({importedPreview.length} estudiantes detectados):
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Curso destino: {selectedCourse}
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 divide-y divide-slate-100">
                    {importedPreview.map((st, i) => (
                      <div key={i} className="py-1 text-slate-700 flex justify-between items-center text-[11px]">
                        <span>
                          <strong>{st.name}</strong> ({st.documentType} {st.document})
                        </span>
                        {st.inclusionProfile?.hasNEE && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                            NEE: {st.inclusionProfile.diagnoses.join(', ') || 'Activo'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setImportedPreview(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium"
                    >
                      Descartar
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyImport}
                      disabled={importSuccess}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                    >
                      {importSuccess ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Estudiantes Importados con Éxito
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Confirmar e Incorporar al Sistema
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Exportar Lista de Estudiantes y Acudientes ({selectedCourse})
                  </h4>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Incluye contactos de emergencia, WhatsApp y estado de inclusión NEE en formato CSV.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportStudents}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer shrink-0"
                >
                  <FileDown className="h-4 w-4" /> Exportar CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
