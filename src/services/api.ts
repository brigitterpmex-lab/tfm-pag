export interface AdaptationRequest {
  studentName: string;
  grade: string;
  subject: string;
  condition: string;
  details: string;
  currentPerformance?: string;
  learningStyle?: string;
}

export interface AdaptationResponse {
  summary: string;
  methodologicalAdjustments: string[];
  didacticResources: string[];
  evaluativeStrategies: string[];
  socioemotionalSupport: string;
  orientationNotes?: string;
}

export interface RecommendationRequest {
  studentName: string;
  averageGrade: number;
  absences: number;
  totalClasses: number;
  riskType: string;
  observations?: string;
  subject: string;
}

export interface RecommendationResponse {
  diagnosis: string;
  immediateAction: string;
  actionSteps: string[];
  citacionTemplate: string;
  compromisoPedagogico: string;
  referralToOrientation: boolean;
}

export interface ImprovementPlanRequest {
  studentName: string;
  grade: string;
  subject: string;
  failedEvaluations: string[];
  pendingDBA: string;
  weaknesses: string;
  period: string;
}

export interface ImprovementPlanResponse {
  title: string;
  objective: string;
  competenciesToStrengthen: string[];
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
  estimatedHours: string;
  recommendedDeadlineDays: number;
  commitmentStatement: string;
}

export async function requestAIAdaptation(data: AdaptationRequest): Promise<AdaptationResponse> {
  const res = await fetch('/api/ai/adaptation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Error en servidor: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function requestAIRecommendation(data: RecommendationRequest): Promise<RecommendationResponse> {
  const res = await fetch('/api/ai/recommendation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Error en servidor: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data;
}

export async function requestAIImprovementPlan(data: ImprovementPlanRequest): Promise<ImprovementPlanResponse> {
  try {
    const res = await fetch('/api/ai/improvement-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('API request failed, generating client fallback plan:', err);
  }

  // Resilient fallback plan ensuring it NEVER leaves the user with an empty screen
  return {
    title: `Plan de Mejoramiento y Nivelación Académica - ${data.subject || 'Asignatura'}`,
    objective: `Superar las dificultades académicas evidenciadas durante el ${data.period || 'periodo escolar'} en ${data.subject || 'la asignatura'}, alcanzando las competencias y estándares estipulados en los Derechos Básicos de Aprendizaje (DBA).`,
    competenciesToStrengthen: [
      `Apropiación de conceptos clave relacionados con: ${data.pendingDBA || 'los temas del periodo'}.`,
      `Desarrollo de razonamiento lógico, análisis de problemas y argumentación procedimental.`
    ],
    activities: [
      {
        step: 1,
        title: "Taller Guiado de Reconceptualización y Corrección",
        description: `Elaborar un portafolio de refuerzo con mapas conceptuales y corrección justificada de las evaluaciones no superadas (${data.failedEvaluations?.join(', ') || 'actividades previas'}).`,
        deliveryFormat: "Portafolio físico o digital organizado con procedimientos paso a paso",
        percentage: 40
      },
      {
        step: 2,
        title: "Resolución de Banco de Situaciones Contextualizadas",
        description: `Resolver la batería de 8 a 10 situaciones problema aplicadas a la vida cotidiana vinculadas a los DBA de ${data.grade || 'Grado actual'}.`,
        deliveryFormat: "Guía de trabajo resuelta con justificación escrita de cada procedimiento",
        percentage: 30
      },
      {
        step: 3,
        title: "Sustentación Oral Individual con el Docente",
        description: "Explicar ante el docente dos problemas seleccionados al azar del portafolio, demostrando autonomía y dominio conceptual.",
        deliveryFormat: "Entrevista pedagógica individual de 10 a 15 minutos",
        percentage: 30
      }
    ],
    rubricCriteria: [
      { criterion: "Apropiación conceptual (DBA)", weight: "40%", description: "Comprende y utiliza las nociones fundamentales sin errores conceptuales." },
      { criterion: "Procedimientos y Justificación", weight: "30%", description: "Evidencia procesos completos, orden y rigor metodológico en las soluciones." },
      { criterion: "Sustentación y Defensa Oral", weight: "30%", description: "Responde asertivamente a preguntas directas argumentando sus respuestas." }
    ],
    estimatedHours: "10 a 12 horas de trabajo independiente con acompañamiento del acudiente",
    recommendedDeadlineDays: 10,
    commitmentStatement: `En constancia de lo anterior, el estudiante ${data.studentName || 'Estudiante'} y su acudiente asumen el compromiso de ejecutar cabalmente el presente Plan de Mejoramiento, comprendiendo que la superación de los desempeños bajos es requisito fundamental para la promoción académica según el SIEE institucional y el Decreto 1290 de 2009.`
  };
}
