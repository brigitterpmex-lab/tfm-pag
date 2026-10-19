import React, { useState, useEffect } from 'react';
import {
  Student,
  EvaluationItem,
  GradeRecord,
  AttendanceSession,
  ImprovementPlan,
  UserProfile,
  DBAItem,
  AchievementItem
} from './types';
import {
  storageService,
  computeStudentAlerts
} from './services/storage';
import {
  AVAILABLE_COURSES,
  AVAILABLE_SUBJECTS,
  AVAILABLE_PERIODS,
  INITIAL_USERS
} from './data/initialData';

import { Header } from './components/layout/Header';
import { Sidebar, TabId } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { StudentsTab } from './components/students/StudentsTab';
import { CurriculumTab } from './components/curriculum/CurriculumTab';
import { GradesAttendanceTab } from './components/grades/GradesAttendanceTab';
import { ImprovementPlansTab } from './components/improvement/ImprovementPlansTab';
import { ImportExportModal } from './components/common/ImportExportModal';

export default function App() {
  // Global Session State: null by default so user is strictly prompted to log in
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return storageService.getCurrentUser();
  });

  // Global Context State
  const [selectedCourse, setSelectedCourse] = useState<string>(AVAILABLE_COURSES[0]);
  const [selectedSubject, setSelectedSubject] = useState<string>(AVAILABLE_SUBJECTS[0]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(AVAILABLE_PERIODS[0]);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data Collections State
  const [students, setStudents] = useState<Student[]>(() => storageService.getStudents());
  const [dbas, setDbas] = useState<DBAItem[]>(() => storageService.getDBAs());
  const [achievements, setAchievements] = useState<AchievementItem[]>(() => storageService.getAchievements());
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>(() => storageService.getEvaluations());
  const [grades, setGrades] = useState<GradeRecord[]>(() => storageService.getGrades());
  const [attendance, setAttendance] = useState<AttendanceSession[]>(() => storageService.getAttendance());
  const [plans, setPlans] = useState<ImprovementPlan[]>(() => storageService.getPlans());

  // Deep link or preselected student for Tab 5 (Improvement Plan)
  const [preselectedStudentForPlan, setPreselectedStudentForPlan] = useState<string | null>(null);

  // Modal for Import / Export
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Sync state to storage whenever collections change
  useEffect(() => {
    storageService.saveStudents(students);
  }, [students]);

  useEffect(() => {
    storageService.saveDBAs(dbas);
  }, [dbas]);

  useEffect(() => {
    storageService.saveAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    storageService.saveEvaluations(evaluations);
  }, [evaluations]);

  useEffect(() => {
    storageService.saveGrades(grades);
  }, [grades]);

  useEffect(() => {
    storageService.saveAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    storageService.savePlans(plans);
  }, [plans]);

  // Compute alert counts for sidebar badges
  const currentAlerts = computeStudentAlerts(
    selectedCourse,
    selectedSubject,
    selectedPeriod,
    students,
    grades,
    evaluations,
    attendance
  );
  const criticalCount = currentAlerts.filter((a) => a.riskSeverity === 'Crítica' || a.riskSeverity === 'Alta').length;
  const courseNeeCount = students.filter((s) => s.course === selectedCourse && s.inclusionProfile?.hasNEE).length;
  const pendingPlansCount = plans.filter((p) => p.course === selectedCourse && p.status !== 'Superado').length;

  // Handlers
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    storageService.setCurrentUser(null);
  };

  const handleSwitchUser = (user: UserProfile) => {
    setCurrentUser(user);
    storageService.setCurrentUser(user);
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer todos los datos a la configuración inicial del demo?')) {
      storageService.resetAll();
      window.location.reload();
    }
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
  };

  const handleAddStudent = (newStudent: Student) => {
    setStudents((prev) => [...prev, newStudent]);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents((prev) => {
      const existingIds = new Set(prev.map((s) => s.document));
      const filteredNew = newStudents.filter((s) => !existingIds.has(s.document));
      return [...prev, ...filteredNew];
    });
  };

  const handleAddAchievement = (newAch: AchievementItem) => {
    setAchievements((prev) => [...prev, newAch]);
  };

  const handleAddEvaluation = (newEval: EvaluationItem) => {
    setEvaluations((prev) => [...prev, newEval]);
  };

  const handleUpdateGrades = (newGrades: GradeRecord[]) => {
    setGrades(newGrades);
  };

  const handleUpdateAttendance = (newAttendance: AttendanceSession[]) => {
    setAttendance(newAttendance);
  };

  const handleUpdatePlans = (newPlans: ImprovementPlan[]) => {
    setPlans(newPlans);
  };

  // When a student passes the improvement plan, update their grade to passing (e.g., 3.0 Básico)
  const handleGradeRecovered = (studentId: string, recoveredScore: number) => {
    setGrades((prev) => {
      return prev.map((g) => {
        if (g.studentId === studentId && g.course === selectedCourse && g.subject === selectedSubject) {
          // Adjust lowest evaluation score to ensure final passing
          const scores = { ...g.scores };
          const evalKeys = Object.keys(scores);
          if (evalKeys.length > 0) {
            scores[evalKeys[0]] = recoveredScore;
          }
          return {
            ...g,
            scores
          };
        }
        return g;
      });
    });
  };

  // Navigations from Dashboard
  const handleOpenStudentDetailFromDashboard = (studentId: string) => {
    setActiveTab('students');
  };

  const handleOpenImprovementPlanFromDashboard = (studentId: string) => {
    setPreselectedStudentForPlan(studentId);
    setActiveTab('improvement');
  };

  const handleRemitToOrientation = (studentId: string, notes: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            inclusionProfile: {
              ...s.inclusionProfile,
              hasNEE: true,
              socioemotionalNotes: s.inclusionProfile?.socioemotionalNotes
                ? `${s.inclusionProfile.socioemotionalNotes}\n• [Remisión]: ${notes}`
                : `• [Remisión]: ${notes}`,
              orientationStatus: 'Pendiente'
            }
          };
        }
        return s;
      })
    );
  };

  const handleCommitmentSigned = (studentId: string, commitmentText: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            inclusionProfile: {
              ...s.inclusionProfile,
              socioemotionalNotes: s.inclusionProfile?.socioemotionalNotes
                ? `${s.inclusionProfile.socioemotionalNotes}\n• [Compromiso Firmado]: ${commitmentText}`
                : `• [Compromiso Firmado]: ${commitmentText}`
            }
          };
        }
        return s;
      })
    );
  };

  // If unauthenticated, display ONLY the LoginPage (no student data or dashboard is exposed)
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-800 flex flex-col">
      {/* Top Application Header */}
      <Header
        currentUser={currentUser}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        selectedSubject={selectedSubject}
        onSelectSubject={setSelectedSubject}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        onSwitchUser={handleSwitchUser}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onLogout={handleLogout}
        onResetData={handleResetData}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout Area */}
      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          criticalAlertsCount={criticalCount}
          neeCount={courseNeeCount}
          pendingPlansCount={pendingPlansCount}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardTab
              selectedCourse={selectedCourse}
              selectedSubject={selectedSubject}
              selectedPeriod={selectedPeriod}
              students={students}
              evaluations={evaluations}
              grades={grades}
              attendance={attendance}
              onOpenStudentDetail={handleOpenStudentDetailFromDashboard}
              onOpenImprovementPlan={handleOpenImprovementPlanFromDashboard}
              onRemitToOrientation={handleRemitToOrientation}
              onCommitmentSigned={handleCommitmentSigned}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              selectedCourse={selectedCourse}
              selectedSubject={selectedSubject}
              students={students}
              currentUser={currentUser}
              onUpdateStudent={handleUpdateStudent}
              onAddStudent={handleAddStudent}
            />
          )}

          {activeTab === 'curriculum' && (
            <CurriculumTab
              selectedCourse={selectedCourse}
              selectedSubject={selectedSubject}
              selectedPeriod={selectedPeriod}
              dbas={dbas}
              achievements={achievements}
              evaluations={evaluations}
              onAddAchievement={handleAddAchievement}
              onAddEvaluation={handleAddEvaluation}
            />
          )}

          {activeTab === 'grades' && (
            <GradesAttendanceTab
              selectedCourse={selectedCourse}
              selectedSubject={selectedSubject}
              selectedPeriod={selectedPeriod}
              students={students}
              evaluations={evaluations}
              grades={grades}
              attendance={attendance}
              onUpdateGrades={handleUpdateGrades}
              onUpdateAttendance={handleUpdateAttendance}
              onAddEvaluation={handleAddEvaluation}
            />
          )}

          {activeTab === 'improvement' && (
            <ImprovementPlansTab
              selectedCourse={selectedCourse}
              selectedSubject={selectedSubject}
              selectedPeriod={selectedPeriod}
              students={students}
              evaluations={evaluations}
              grades={grades}
              dbas={dbas}
              plans={plans}
              currentUser={currentUser}
              initialPreselectedStudentId={preselectedStudentForPlan}
              onUpdatePlans={handleUpdatePlans}
              onGradeRecovered={handleGradeRecovered}
            />
          )}
        </main>
      </div>

      {/* Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        students={students}
        grades={grades}
        attendance={attendance}
        selectedCourse={selectedCourse}
        selectedSubject={selectedSubject}
        onClose={() => setIsImportExportOpen(false)}
        onImportStudents={handleImportStudents}
      />
    </div>
  );
}
