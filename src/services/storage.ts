import {
  Student,
  EvaluationItem,
  GradeRecord,
  AttendanceSession,
  ImprovementPlan,
  UserProfile,
  DBAItem,
  AchievementItem,
  PerformanceLevel,
  StudentAlert
} from '../types';
import {
  INITIAL_STUDENTS,
  INITIAL_DBAS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_GRADES,
  INITIAL_ATTENDANCE_SESSIONS,
  INITIAL_IMPROVEMENT_PLANS,
  INITIAL_USERS
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'edugestion_current_user',
  STUDENTS: 'edugestion_students',
  DBAS: 'edugestion_dbas',
  ACHIEVEMENTS: 'edugestion_achievements',
  EVALUATIONS: 'edugestion_evaluations',
  GRADES: 'edugestion_grades',
  ATTENDANCE: 'edugestion_attendance',
  PLANS: 'edugestion_plans',
};

// Safe localStorage read with fallback
export function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

// Data loaders
export const storageService = {
  getCurrentUser: (): UserProfile | null => {
    return getFromStorage<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser: (user: UserProfile | null) => {
    if (user) {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },
  getStudents: (): Student[] => {
    return getFromStorage<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  },
  saveStudents: (students: Student[]) => {
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
  },
  getDBAs: (): DBAItem[] => {
    return getFromStorage<DBAItem[]>(STORAGE_KEYS.DBAS, INITIAL_DBAS);
  },
  saveDBAs: (dbas: DBAItem[]) => {
    saveToStorage(STORAGE_KEYS.DBAS, dbas);
  },
  getAchievements: (): AchievementItem[] => {
    return getFromStorage<AchievementItem[]>(STORAGE_KEYS.ACHIEVEMENTS, INITIAL_ACHIEVEMENTS);
  },
  saveAchievements: (achievements: AchievementItem[]) => {
    saveToStorage(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  },
  getEvaluations: (): EvaluationItem[] => {
    return getFromStorage<EvaluationItem[]>(STORAGE_KEYS.EVALUATIONS, INITIAL_EVALUATIONS);
  },
  saveEvaluations: (evals: EvaluationItem[]) => {
    saveToStorage(STORAGE_KEYS.EVALUATIONS, evals);
  },
  getGrades: (): GradeRecord[] => {
    return getFromStorage<GradeRecord[]>(STORAGE_KEYS.GRADES, INITIAL_GRADES);
  },
  saveGrades: (grades: GradeRecord[]) => {
    saveToStorage(STORAGE_KEYS.GRADES, grades);
  },
  getAttendance: (): AttendanceSession[] => {
    return getFromStorage<AttendanceSession[]>(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE_SESSIONS);
  },
  saveAttendance: (attendance: AttendanceSession[]) => {
    saveToStorage(STORAGE_KEYS.ATTENDANCE, attendance);
  },
  getPlans: (): ImprovementPlan[] => {
    return getFromStorage<ImprovementPlan[]>(STORAGE_KEYS.PLANS, INITIAL_IMPROVEMENT_PLANS);
  },
  savePlans: (plans: ImprovementPlan[]) => {
    saveToStorage(STORAGE_KEYS.PLANS, plans);
  },
  resetAll: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.DBAS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.GRADES);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.PLANS);
  }
};

// Colombian MEN 1290 Performance Scale
export function getPerformanceLevel(score: number): PerformanceLevel {
  if (score >= 4.6) return 'Superior';
  if (score >= 4.0) return 'Alto';
  if (score >= 3.0) return 'Básico';
  return 'Bajo';
}

export function getPerformanceBadgeColor(level: PerformanceLevel): {
  bg: string;
  text: string;
  border: string;
} {
  switch (level) {
    case 'Superior':
      return { bg: 'bg-emerald-50 text-emerald-800', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Alto':
      return { bg: 'bg-sky-50 text-sky-800', text: 'text-sky-700', border: 'border-sky-200' };
    case 'Básico':
      return { bg: 'bg-amber-50 text-amber-800', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Bajo':
      return { bg: 'bg-rose-50 text-rose-800', text: 'text-rose-700', border: 'border-rose-200' };
  }
}

// Calculate Academic Stats for a Student
export function calculateStudentGrade(
  studentId: string,
  course: string,
  subject: string,
  period: string,
  grades: GradeRecord[],
  evaluations: EvaluationItem[]
): { average: number; level: PerformanceLevel; completedCount: number; totalCount: number; scores: Record<string, number | null> } {
  const currentEvals = evaluations.filter(
    (e) => e.course === course && e.subject === subject && e.period === period
  );

  const gradeRec = grades.find(
    (g) => g.studentId === studentId && g.course === course && g.subject === subject && g.period === period
  );

  const scores = gradeRec?.scores || {};

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let unweightedSum = 0;
  let validCount = 0;

  for (const ev of currentEvals) {
    const sc = scores[ev.id];
    if (typeof sc === 'number' && !isNaN(sc)) {
      totalWeightedScore += sc * (ev.weight / 100);
      totalWeight += ev.weight / 100;
      unweightedSum += sc;
      validCount++;
    }
  }

  let finalAverage = 0;
  if (totalWeight > 0) {
    // Proportional weighted
    finalAverage = Number((totalWeightedScore / totalWeight).toFixed(1));
  } else if (validCount > 0) {
    finalAverage = Number((unweightedSum / validCount).toFixed(1));
  } else {
    finalAverage = 0;
  }

  return {
    average: finalAverage,
    level: getPerformanceLevel(finalAverage),
    completedCount: validCount,
    totalCount: currentEvals.length,
    scores
  };
}

// Calculate Attendance Stats for a Student
export function calculateStudentAttendance(
  studentId: string,
  course: string,
  subject: string,
  sessions: AttendanceSession[]
): {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  excusedCount: number;
  tardyCount: number;
  absencePercentage: number;
} {
  const relevantSessions = sessions.filter(
    (s) => s.course === course && s.subject === subject
  );

  if (relevantSessions.length === 0) {
    return {
      totalSessions: 0,
      presentCount: 0,
      absentCount: 0,
      excusedCount: 0,
      tardyCount: 0,
      absencePercentage: 0
    };
  }

  let present = 0;
  let absent = 0;
  let excused = 0;
  let tardy = 0;

  for (const sess of relevantSessions) {
    const status = sess.records[studentId];
    if (status === 'P') present++;
    else if (status === 'A') absent++;
    else if (status === 'E') excused++;
    else if (status === 'R') tardy++;
  }

  const absencePercentage = Math.round((absent / relevantSessions.length) * 100);

  return {
    totalSessions: relevantSessions.length,
    presentCount: present,
    absentCount: absent,
    excusedCount: excused,
    tardyCount: tardy,
    absencePercentage
  };
}

// Calculate all early warning alerts
export function computeStudentAlerts(
  course: string,
  subject: string,
  period: string,
  students: Student[],
  grades: GradeRecord[],
  evaluations: EvaluationItem[],
  attendance: AttendanceSession[]
): StudentAlert[] {
  const courseStudents = students.filter((s) => s.course === course);
  const alerts: StudentAlert[] = [];

  for (const student of courseStudents) {
    const gradeInfo = calculateStudentGrade(student.id, course, subject, period, grades, evaluations);
    const attInfo = calculateStudentAttendance(student.id, course, subject, attendance);

    const hasFailureRisk = gradeInfo.average > 0 && gradeInfo.average < 3.0;
    const hasDropoutRisk = attInfo.totalSessions > 0 && attInfo.absencePercentage >= 15;

    if (hasFailureRisk || hasDropoutRisk || student.inclusionProfile?.hasNEE) {
      let severity: 'Crítica' | 'Alta' | 'Media' | 'Baja' = 'Baja';
      const reasons: string[] = [];

      if (hasFailureRisk && hasDropoutRisk) {
        severity = 'Crítica';
        reasons.push(`Bajo rendimiento académico (${gradeInfo.average}/5.0 - Desempeño ${gradeInfo.level})`);
        reasons.push(`Alto ausentismo: ${attInfo.absentCount} inasistencias acumuladas (${attInfo.absencePercentage}%)`);
      } else if (hasFailureRisk) {
        severity = gradeInfo.average <= 2.2 ? 'Alta' : 'Media';
        reasons.push(`Promedio reprobatorio de ${gradeInfo.average}/5.0 (${gradeInfo.completedCount}/${gradeInfo.totalCount} notas)`);
      } else if (hasDropoutRisk) {
        severity = attInfo.absencePercentage >= 30 ? 'Crítica' : 'Alta';
        reasons.push(`Ausentismo reiterado: ${attInfo.absentCount} fallas (${attInfo.absencePercentage}% del periodo)`);
      }

      if (student.inclusionProfile?.hasNEE) {
        if (!student.inclusionProfile.piarApprovedByOrientation) {
          reasons.push(`Ficha NEE pendiente de aprobación por Orientación Escolar (${student.inclusionProfile.diagnoses.join(', ')})`);
        }
      }

      alerts.push({
        student,
        course,
        subject,
        averageGrade: gradeInfo.average,
        performanceLevel: gradeInfo.level,
        absencesCount: attInfo.absentCount,
        totalClasses: attInfo.totalSessions,
        absencePercentage: attInfo.absencePercentage,
        hasFailureRisk,
        hasDropoutRisk,
        riskSeverity: severity,
        riskReasons: reasons
      });
    }
  }

  // Sort by severity (Crítica first, then Alta, Media, Baja)
  const order = { 'Crítica': 0, 'Alta': 1, 'Media': 2, 'Baja': 3 };
  return alerts.sort((a, b) => order[a.riskSeverity] - order[b.riskSeverity]);
}
