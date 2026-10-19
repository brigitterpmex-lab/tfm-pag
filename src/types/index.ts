export type UserRole = 'docente' | 'orientador' | 'coordinador';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  institution: string;
  avatarUrl?: string;
}

export type PerformanceLevel = 'Bajo' | 'Básico' | 'Alto' | 'Superior';

export interface InclusionProfile {
  hasNEE: boolean;
  diagnoses: string[];
  socioemotionalNotes: string;
  healthConditions: string;
  hasPIAR: boolean;
  piarApprovedByOrientation: boolean;
  orientationStatus: 'Pendiente' | 'Aprobado' | 'Con Observaciones';
  orientationDate?: string;
  orientationSignature?: string;
  orientationNotes?: string;
  adaptationStrategy?: {
    summary: string;
    methodologicalAdjustments: string[];
    didacticResources: string[];
    evaluativeStrategies: string[];
    socioemotionalSupport: string;
    dateGenerated?: string;
  } | null;
}

export interface Student {
  id: string;
  document: string;
  documentType: 'TI' | 'CC' | 'RC' | 'NES';
  name: string;
  gender: 'M' | 'F' | 'Otro';
  age: number;
  course: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: 'Madre' | 'Padre' | 'Abuelo(a)' | 'Tutor Legal';
  inclusionProfile: InclusionProfile;
}

export interface EvaluationItem {
  id: string;
  course: string;
  subject: string;
  period: string;
  code: string; // e.g. "EV-1", "EV-2"
  name: string; // e.g. "Taller Ecuaciones 2x2"
  type: 'Formativa' | 'Sumativa' | 'Autoevaluación' | 'Coevaluación' | 'Proyecto DUA';
  weight: number; // e.g. 10 (%)
  maxScore: number; // usually 5.0
  date: string;
  dbaId?: string;
}

export interface GradeRecord {
  studentId: string;
  course: string;
  subject: string;
  period: string;
  scores: Record<string, number | null>; // evaluationId -> score (1.0 to 5.0)
  finalScore?: number;
  performanceLevel?: PerformanceLevel;
  observations?: string;
}

export type AttendanceStatus = 'P' | 'A' | 'E' | 'R'; // Presente, Ausente, Excusa, Retardo

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  course: string;
  subject: string;
  date: string;
  topic: string;
  records: Record<string, AttendanceStatus>; // studentId -> status
  notes?: Record<string, string>; // studentId -> qualitative note
}

export interface DBAItem {
  id: string;
  grade: string;
  subject: string;
  number: number;
  statement: string; // Enunciado del DBA
  evidences: string[]; // Evidencias de aprendizaje
}

export interface AchievementItem {
  id: string;
  code: string;
  course: string;
  subject: string;
  period: string;
  dbaId?: string;
  description: string;
  superiorCriteria: string;
  altoCriteria: string;
  basicoCriteria: string;
  bajoCriteria: string;
}

export interface ImprovementPlan {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  subject: string;
  period: string;
  dateCreated: string;
  status: 'Borrador' | 'Asignado' | 'En Proceso' | 'Sustentado' | 'Superado' | 'No Superado';
  objective: string;
  competenciesToStrengthen: string[];
  failedEvaluations: string[];
  activities: {
    step: number;
    title: string;
    description: string;
    deliveryFormat: string;
    percentage: number;
  }[];
  rubricCriteria: {
    criterion: string;
    weight: string;
    description: string;
  }[];
  deadlineDate: string;
  defenseDate?: string;
  teacherApproval: boolean;
  orientationApproval: boolean;
  initialGrade: number;
  recoveredGrade?: number;
  commitmentStatement: string;
  finalTeacherObservations?: string;
}

export interface StudentAlert {
  student: Student;
  course: string;
  subject: string;
  averageGrade: number;
  performanceLevel: PerformanceLevel;
  absencesCount: number;
  totalClasses: number;
  absencePercentage: number;
  hasFailureRisk: boolean;
  hasDropoutRisk: boolean;
  riskSeverity: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  riskReasons: string[];
}
