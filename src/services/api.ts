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
  const res = await fetch('/api/ai/improvement-plan', {
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
