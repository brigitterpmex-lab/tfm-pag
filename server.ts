import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. AI Curricular Adaptation (PIAR / DUA / NEE)
app.post('/api/ai/adaptation', async (req: Request, res: Response) => {
  const { studentName, grade, subject, condition, details, currentPerformance, learningStyle } = req.body;

  const prompt = `
Eres un especialista en Inclusión Educativa, Diseño Universal para el Aprendizaje (DUA) y Plan Individual de Ajustes Razonables (PIAR) del Ministerio de Educación Nacional de Colombia (MEN - Decreto 1421 de 2017).

Genera una propuesta formal y personalizada de Adaptación Curricular para el siguiente estudiante:
- Estudiante: ${studentName || 'Estudiante'}
- Grado: ${grade || '9°'}
- Asignatura: ${subject || 'Matemáticas'}
- Diagnóstico / Condición NEE: ${condition || 'Déficit de Atención con Hiperactividad (TDAH)'}
- Detalles del caso / Barreras detectadas: ${details || 'Dificultad de concentración prolongada, requiere instrucciones fraccionadas y apoyos visuales'}
- Rendimiento actual: ${currentPerformance || 'Básico (3.1)'}
- Estilo o canal de aprendizaje: ${learningStyle || 'Visual - Kinestésico'}

Proporciona la respuesta en formato JSON con la siguiente estructura:
{
  "summary": "Resumen ejecutivo de la adaptación y objetivo pedagógico",
  "methodologicalAdjustments": [
    "Ajuste metodológico 1 (ej. segmentación de consignas, tiempo adicional del 30%)",
    "Ajuste metodológico 2 (ej. uso de organizadores gráficos o rúbricas visuales)",
    "Ajuste metodológico 3"
  ],
  "didacticResources": [
    "Recurso didáctico o apoyo tecnológico 1",
    "Recurso didáctico 2"
  ],
  "evaluativeStrategies": [
    "Estrategia de evaluación flexible 1 (ej. sustentación oral con apoyo gráfico en lugar de prueba escrita extensa)",
    "Estrategia de evaluación flexible 2"
  ],
  "socioemotionalSupport": "Orientación para el docente de aula en el manejo socioafectivo y motivación",
  "orientationNotes": "Recomendación técnica para la validación del Orientador Escolar / Psicoorientador"
}
Responde únicamente con el objeto JSON válido.
`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, data: parsed });
      } catch {
        // clean up possible markdown fences
        const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return res.json({ success: true, data: parsed });
      }
    }
  } catch (error) {
    console.warn('Gemini API call failed, using pedagogical fallback:', error);
  }

  // Fallback high-fidelity response tailored to the condition
  const fallbackAdaptation = {
    summary: `Estrategia de adaptación curricular basada en DUA y Decreto 1421 para ${studentName} (${condition}). Se prioriza la flexibilización de tiempos, representación multimodal de contenidos y diversificación de instrumentos evaluativos en ${subject}.`,
    methodologicalAdjustments: [
      `Fraccionamiento de instrucciones complejas en pasos secuenciales de máximo 10-15 minutos con verificación de comprensión.`,
      `Implementación de organizadores gráficos y guías con codificación de color para estructurar los conceptos clave de ${subject}.`,
      `Concesión de tiempo flexible (+30% a +50%) y pausas activas programadas de autorregulación durante jornadas evaluativas.`
    ],
    didacticResources: [
      `Material interactivo multisensorial (infografías interactivas, software de apoyo visual y calculadoras didácticas).`,
      `Fichas de apoyo cognitivo con fórmulas clave y glosario de términos accesibles en el pupitre.`
    ],
    evaluativeStrategies: [
      `Sustitución progresiva de pruebas escritas exhaustivas por defensas orales cortas, proyectos de aplicación o resolución por etapas guiadas.`,
      `Uso de rúbricas analíticas con criterios claros de desempeño entregadas con antelación para disminuir la ansiedad ante la evaluación.`
    ],
    socioemotionalSupport: `Refuerzo positivo inmediato ante el logro de metas intermedias, asignación de un compañero tutor para dinámicas colaborativas y ambiente libre de juicios que reduzca la frustración.`,
    orientationNotes: `Se sugiere seguimiento quincenal por Orientación Escolar y comunicación fluida con la familia para monitorear avances en la autogestión escolar.`
  };

  return res.json({ success: true, data: fallbackAdaptation, fallback: true });
});

// 2. AI Quick Action Assistant (Alerts: Failure & Dropout Risk)
app.post('/api/ai/recommendation', async (req: Request, res: Response) => {
  const { studentName, averageGrade, absences, totalClasses, riskType, observations, subject } = req.body;

  const prompt = `
Eres el Comité de Evaluación y Convivencia Escolar en Colombia (Decreto 1290 de 2009).
Analiza la siguiente situación de alerta de un estudiante:
- Estudiante: ${studentName || 'Estudiante'}
- Promedio Académico: ${averageGrade || '2.4'}/5.0 (Escala: Bajo 1.0-2.9, Básico 3.0-3.9, Alto 4.0-4.5, Superior 4.6-5.0)
- Inasistencias: ${absences || 8} de ${totalClasses || 30} clases (${Math.round(((absences || 8) / (totalClasses || 30)) * 100)}%)
- Asignatura: ${subject || 'General'}
- Tipo de riesgo identificado: ${riskType || 'Riesgo de Reprobación y Deserción'}
- Observaciones registradas: ${observations || 'Fallas reiteradas sin justificación, entrega incompleta de talleres'}

Genera una recomendación de acción inmediata en formato JSON:
{
  "diagnosis": "Diagnóstico conciso del nivel de criticidad (Alta, Media, Urgente)",
  "immediateAction": "Nombre de la acción inmediata prioritaria (ej. 'Citación formal a Acudiente con Compromiso Académico')",
  "actionSteps": [
    "Paso 1 detallado",
    "Paso 2 detallado",
    "Paso 3 detallado"
  ],
  "citacionTemplate": "Texto redactado formal y empático listo para enviar por WhatsApp o correo al acudiente solicitando reunión presencial/virtual",
  "compromisoPedagogico": "Cláusulas o compromisos sugeridos para firmar con el estudiante y acudiente",
  "referralToOrientation": true
}
Responde únicamente con el JSON válido.
`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '';
      try {
        const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return res.json({ success: true, data: parsed });
      } catch (e) {
        console.warn('JSON parse error, falling back:', e);
      }
    }
  } catch (error) {
    console.warn('Gemini API call failed for recommendations, using fallback:', error);
  }

  const absencePercent = Math.round(((absences || 6) / (totalClasses || 25)) * 100);
  const fallbackRec = {
    diagnosis: (averageGrade < 3.0 && absencePercent >= 15) ? 'Crítico - Urgente' : averageGrade < 3.0 ? 'Riesgo Académico Alto' : 'Alerta Convivencial / Asistencia',
    immediateAction: averageGrade < 3.0 && absencePercent >= 15
      ? 'Citación urgente a acudiente, firma de Compromiso Pedagógico y Remisión a Orientación'
      : averageGrade < 3.0
      ? 'Activación de Plan de Mejoramiento Individual y notificación preventiva a acudiente'
      : 'Seguimiento telefónico con acudiente por ausentismo reiterado para prevenir deserción escolar',
    actionSteps: [
      `Verificar el motivo de las ${absences} inasistencias acumuladas (${absencePercent}%) contactando al acudiente.`,
      `Establecer un cronograma de entrega de actividades pendientes y fijar fecha para sustentación académica.`,
      `Remitir la ficha del caso a Orientación Escolar para descartar problemáticas socioafectivas o de vulnerabilidad familiar.`
    ],
    citacionTemplate: `Estimado(a) Padre/Madre/Acudiente de ${studentName}: Cordial saludo institucional. Desde la Coordinación y Docencia de ${subject || 'la institución'}, nos comunicamos respetuosamente para solicitar su presencia en una reunión de acompañamiento escolar el próximo día hábil. El motivo es evaluar de manera conjunta el desempeño académico actual (${averageGrade}/5.0) y el registro de ${absences} inasistencias, con el fin de suscribir acuerdos que garanticen el éxito académico de su acudido(a). Agradecemos confirmar su disponibilidad al presente canal.`,
    compromisoPedagogico: `1. El estudiante se compromete a asistir puntualmente a todas las sesiones y presentar las justificaciones médicas u oportunas.\n2. El estudiante desarrollará el plan de actividades de nivelación pactado con entrega en la fecha acordada.\n3. El acudiente se compromete a realizar supervisión diaria del cuaderno de apuntes y comunicación semanal con el docente titular.`,
    referralToOrientation: true
  };

  return res.json({ success: true, data: fallbackRec, fallback: true });
});

// 3. AI Improvement Plan (Plan de Mejoramiento Asistido por IA)
app.post('/api/ai/improvement-plan', async (req: Request, res: Response) => {
  const { studentName, grade, subject, failedEvaluations, pendingDBA, weaknesses, period } = req.body;

  const prompt = `
Actúa como un Diseñador Curricular Senior en el marco del sistema escolar colombiano (Decreto 1290 de 2009 y DBA del MEN).
Genera un Plan de Mejoramiento Académico Individualizado, riguroso pero pedagógicamente constructivo para:
- Estudiante: ${studentName || 'Estudiante'}
- Grado: ${grade || '9°'}
- Periodo Académico: ${period || 'Primer Periodo'}
- Asignatura: ${subject || 'Matemáticas'}
- Evaluaciones / Actividades no superadas: ${failedEvaluations?.join(', ') || 'Taller de ecuaciones, Evaluación de funciones lineales'}
- DBA o Competencias asociadas: ${pendingDBA || 'Identifica y utiliza relaciones funcionales en diversos contextos matemáticos'}
- Dificultades observadas: ${weaknesses || 'Comprensión de enunciados, aplicación de algoritmos algebraicos'}

Genera una propuesta formal en formato JSON:
{
  "title": "Plan de Mejoramiento y Nivelación Académica",
  "objective": "Objetivo pedagógico claro y medible del plan",
  "competenciesToStrengthen": [
    "Competencia 1 basada en DBA",
    "Competencia 2"
  ],
  "activities": [
    {
      "step": 1,
      "title": "Actividad 1: Conceptualización y Análisis Guiado",
      "description": "Descripción clara de la actividad formativa",
      "deliveryFormat": "Taller escrito con organizadores gráficos / Ejercicios prácticos",
      "percentage": 40
    },
    {
      "step": 2,
      "title": "Actividad 2: Aplicación Práctica y Resolución de Problemas",
      "description": "Descripción de la actividad aplicada contextualizada",
      "deliveryFormat": "Estudio de caso o guía de problemas resueltos paso a paso",
      "percentage": 30
    },
    {
      "step": 3,
      "title": "Actividad 3: Sustentación Oral y Co-evaluación",
      "description": "Defensa presencial de los conceptos para validar autoría y dominio cognitivo",
      "deliveryFormat": "Sustentación oral de 10 minutos con rúbrica",
      "percentage": 30
    }
  ],
  "rubricCriteria": [
    { "criterion": "Dominio de Conceptos y DBA", "weight": "40%", "description": "Aplica adecuadamente los conceptos y procedimientos requeridos." },
    { "criterion": "Cumplimiento y Calidad de Entrega", "weight": "30%", "description": "Presenta el trabajo en los tiempos establecidos, con orden, pulcritud y soporte de procedimientos." },
    { "criterion": "Sustentación y Argumentación", "weight": "30%", "description": "Explica con claridad y solvencia conceptual los ejercicios desarrollados." }
  ],
  "estimatedHours": "12 horas de trabajo autónomo guiado",
  "recommendedDeadlineDays": 10,
  "commitmentStatement": "Texto de acta formal para firma entre Docente, Estudiante y Acudiente con base en el Decreto 1290"
}
Responde únicamente con el JSON válido.
`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.35,
        },
      });

      const responseText = response.text || '';
      try {
        const clean = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        return res.json({ success: true, data: parsed });
      } catch (e) {
        console.warn('JSON parse error in plan, using fallback:', e);
      }
    }
  } catch (error) {
    console.warn('Gemini API call failed for improvement plan, using fallback:', error);
  }

  const fallbackPlan = {
    title: `Plan de Mejoramiento y Nivelación Académica - ${subject}`,
    objective: `Superar las dificultades académicas evidenciadas durante el ${period || 'Periodo actual'} en ${subject}, alcanzando los desempeños mínimos estipulados en los Derechos Básicos de Aprendizaje (DBA).`,
    competenciesToStrengthen: [
      `Apropiación y comprensión de conceptos clave relacionados con: ${pendingDBA || 'los temas del periodo'}.`,
      `Desarrollo de razonamiento lógico, análisis de problemas y argumentación de respuestas.`
    ],
    activities: [
      {
        step: 1,
        title: "Taller Guiado de Reconceptualización",
        description: `Elaborar un portafolio de refuerzo con mapas conceptuales y corrección justificada de las evaluaciones no superadas (${failedEvaluations?.join(', ') || 'actividades previas'}).`,
        deliveryFormat: "Portafolio físico o digital organizado con procedimientos paso a paso",
        percentage: 40
      },
      {
        step: 2,
        title: "Resolución de Banco de Situaciones Contextualizadas",
        description: `Resolver la batería de 10 situaciones problema aplicadas a la vida cotidiana vinculadas a los DBA de ${grade || '9°'}.`,
        deliveryFormat: "Guía de trabajo resuelta con justificación escrita de cada procedimiento",
        percentage: 30
      },
      {
        step: 3,
        title: "Sustentación Oral Individual",
        description: "Explicar ante el docente dos problemas seleccionados al azar del portafolio, demostrando autonomía y dominio procedimental.",
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
    recommendedDeadlineDays: 8,
    commitmentStatement: `En constancia de lo anterior, el estudiante ${studentName} y su acudiente asumen el compromiso de ejecutar cabalmente el presente Plan de Mejoramiento, comprendiendo que la superación de los desempeños bajos es requisito fundamental para la promoción académica según el SIEE institucional y el Decreto 1290 de 2009.`
  };

  return res.json({ success: true, data: fallbackPlan, fallback: true });
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGestion Pro server running on port ${PORT}`);
  });
}

startServer();
