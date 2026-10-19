import { Student, DBAItem, AchievementItem, EvaluationItem, GradeRecord, AttendanceSession, ImprovementPlan, UserProfile } from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Lic. Carlos Andrés Restrepo',
    username: 'carlos.restrepo',
    email: 'carlos.restrepo@institucion.edu.co',
    password: 'profe123',
    role: 'docente',
    title: 'Docente Titular de Matemáticas y Ciencias',
    institution: 'I.E. Técnico República de Colombia'
  },
  {
    id: 'usr-2',
    name: 'Psic. Marcela Gómez Vargas',
    username: 'marcela.gomez',
    email: 'marcela.gomez@institucion.edu.co',
    password: 'orienta123',
    role: 'orientador',
    title: 'Orientadora Escolar y Coordinadora PIAR',
    institution: 'I.E. Técnico República de Colombia'
  }
];

export const AVAILABLE_COURSES = ['9° A', '9° B', '10° A', '11° B'];
export const AVAILABLE_SUBJECTS = ['Matemáticas', 'Lenguaje', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés'];
export const AVAILABLE_PERIODS = ['Periodo 1', 'Periodo 2', 'Periodo 3'];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    document: '1098456123',
    documentType: 'TI',
    name: 'Mateo Alejandro Morales Castro',
    gender: 'M',
    age: 15,
    course: '9° A',
    guardianName: 'Luz Marina Castro',
    guardianPhone: '+573104567890',
    guardianEmail: 'luz.castro@gmail.com',
    guardianRelationship: 'Madre',
    inclusionProfile: {
      hasNEE: true,
      diagnoses: ['TDAH Tipo Combinado', 'Dificultad de Atención Sostenida'],
      socioemotionalNotes: 'Manifiesta ansiedad ante evaluaciones escritas con límite estricto de tiempo. Muy participativo en dinámicas orales.',
      healthConditions: 'Tratamiento neurológico con acompañamiento interdisciplinar.',
      hasPIAR: true,
      piarApprovedByOrientation: true,
      orientationStatus: 'Aprobado',
      orientationDate: '2026-02-15',
      orientationSignature: 'Psic. Marcela Gómez V.',
      orientationNotes: 'PIAR validado y concertado con la madre de familia. Requiere pausas activas y flexibilización de instrumentos.',
      adaptationStrategy: {
        summary: 'Adaptación metodológica bajo DUA: fraccionamiento de tareas complejas en 3 etapas y ampliación de tiempo evaluativo (+40%).',
        methodologicalAdjustments: [
          'Instrucciones cortas y precisas con verificación uno a uno.',
          'Pausas activas de 2 minutos cada 25 minutos de concentración intensa.',
          'Uso de organizadores gráficos y cronograma visual en su pupitre.'
        ],
        didacticResources: [
          'Guías didácticas con apoyos visuales y fuentes accesibles.',
          'Uso permitido de calculadora didáctica para verificación de procesos.'
        ],
        evaluativeStrategies: [
          'Sustentación oral complementaria de ejercicios no concluidos por tiempo.',
          'Rúbrica analítica entregada al inicio de cada actividad.'
        ],
        socioemotionalSupport: 'Asignación de compañero guía colaborativo y refuerzo verbal constante.',
        dateGenerated: '2026-02-14'
      }
    }
  },
  {
    id: 'std-2',
    document: '1098765432',
    documentType: 'TI',
    name: 'Valentina Sofía Ospina Ríos',
    gender: 'F',
    age: 14,
    course: '9° A',
    guardianName: 'Germán Ospina',
    guardianPhone: '+573159876543',
    guardianEmail: 'german.ospina@hotmail.com',
    guardianRelationship: 'Padre',
    inclusionProfile: {
      hasNEE: false,
      diagnoses: [],
      socioemotionalNotes: 'Excelente disposición y liderazgo en el aula.',
      healthConditions: 'Ninguna reportada',
      hasPIAR: false,
      piarApprovedByOrientation: false,
      orientationStatus: 'Pendiente',
      adaptationStrategy: null
    }
  },
  {
    id: 'std-3',
    document: '1098877665',
    documentType: 'TI',
    name: 'Santiago Andrés Barrientos Peña',
    gender: 'M',
    age: 15,
    course: '9° A',
    guardianName: 'Claudia Patricia Peña',
    guardianPhone: '+573206543210',
    guardianEmail: 'claudia.pena@outlook.com',
    guardianRelationship: 'Madre',
    inclusionProfile: {
      hasNEE: true,
      diagnoses: ['Dislexia Fonológica', 'Baja Autoestima Académica'],
      socioemotionalNotes: 'Tiende a aislarse en lecturas en voz alta por temor a la burla de pares. Muestra gran destreza kinestésica.',
      healthConditions: 'Acompañamiento por fonoaudiología externa.',
      hasPIAR: true,
      piarApprovedByOrientation: false,
      orientationStatus: 'Pendiente',
      orientationNotes: 'Propuesta generada por docente; requiere ajuste en las evidencias de evaluación escrita.',
      adaptationStrategy: {
        summary: 'Ajuste de formato en textos escritos, lectura guiada y uso de procesadores de texto con corrector asistido.',
        methodologicalAdjustments: [
          'No obligar a lectura pública en voz alta sin preparación previa.',
          'Facilitar textos con tipografía legible (OpenDyslexic o Arial 14pt) y espaciado 1.5.'
        ],
        didacticResources: [
          'Lectores de pantalla y software de síntesis de voz.',
          'Glosario ilustrado de términos matemáticos y científicos.'
        ],
        evaluativeStrategies: [
          'Evaluaciones orales o mediante cuestionarios interactivos de opción múltiple visual.',
          'No penalizar ortografía en pruebas de razonamiento cuantitativo.'
        ],
        socioemotionalSupport: 'Valorar el esfuerzo en la argumentación y fomentar proyectos grupales de creación manual.',
        dateGenerated: '2026-03-01'
      }
    }
  },
  {
    id: 'std-4',
    document: '1099112233',
    documentType: 'TI',
    name: 'Camila Daniela Rincón Salazar',
    gender: 'F',
    age: 14,
    course: '9° A',
    guardianName: 'Marisol Salazar',
    guardianPhone: '+573187654321',
    guardianEmail: 'marisol.salazar@yahoo.com',
    guardianRelationship: 'Madre',
    inclusionProfile: {
      hasNEE: true,
      diagnoses: ['Hipoacusia Leve Bilateral', 'Vulnerabilidad Socioeconómica'],
      socioemotionalNotes: 'Familia monoparental en estrato 1. Requiere ubicación preferencial en primera fila para lectura labiofacial.',
      healthConditions: 'Uso de audífonos adaptados.',
      hasPIAR: true,
      piarApprovedByOrientation: true,
      orientationStatus: 'Aprobado',
      orientationDate: '2026-02-20',
      orientationSignature: 'Psic. Marcela Gómez V.',
      orientationNotes: 'Aprobado con sugerencia de subtitulación obligatoria de videos educativos proyectados.',
      adaptationStrategy: {
        summary: 'Adaptación acústica y visual: ubicación estratégica en aula y uso de material gráfico complementario.',
        methodologicalAdjustments: [
          'Ubicación en primera fila frente al docente.',
          'El docente debe modular de frente evitando hablar de espaldas al pizarrón.'
        ],
        didacticResources: [
          'Material audiovisual con subtítulos activados en español.',
          'Guías impresas con la transcripción de las exposiciones docentes.'
        ],
        evaluativeStrategies: [
          'Instrucciones de evaluación por escrito con confirmación gestual.',
          'Evaluación por proyectos integradores prácticos.'
        ],
        socioemotionalSupport: 'Sensibilización del grupo sobre empatía comunicativa.',
        dateGenerated: '2026-02-18'
      }
    }
  },
  {
    id: 'std-5',
    document: '1099334455',
    documentType: 'TI',
    name: 'Juan David Henao Quintero',
    gender: 'M',
    age: 16,
    course: '9° A',
    guardianName: 'Alberto Henao',
    guardianPhone: '+573123456789',
    guardianEmail: 'alberto.henao@gmail.com',
    guardianRelationship: 'Padre',
    inclusionProfile: {
      hasNEE: false,
      diagnoses: [],
      socioemotionalNotes: 'Muestra desmotivación y cansancio debido a responsabilidades laborales informales fuera del horario escolar.',
      healthConditions: 'Ninguna',
      hasPIAR: false,
      piarApprovedByOrientation: false,
      orientationStatus: 'Pendiente',
      adaptationStrategy: null
    }
  },
  {
    id: 'std-6',
    document: '1099556677',
    documentType: 'TI',
    name: 'Mariana Isabella Zapata Gil',
    gender: 'F',
    age: 14,
    course: '9° A',
    guardianName: 'Patricia Gil',
    guardianPhone: '+573112233445',
    guardianEmail: 'patricia.gil@gmail.com',
    guardianRelationship: 'Madre',
    inclusionProfile: {
      hasNEE: false,
      diagnoses: [],
      socioemotionalNotes: 'Desempeño sobresaliente y mediadora de convivencia.',
      healthConditions: 'Ninguna',
      hasPIAR: false,
      piarApprovedByOrientation: false,
      orientationStatus: 'Pendiente',
      adaptationStrategy: null
    }
  },
  {
    id: 'std-7',
    document: '1099889900',
    documentType: 'TI',
    name: 'Esteban Camilo Restrepo Londoño',
    gender: 'M',
    age: 15,
    course: '9° A',
    guardianName: 'Beatriz Londoño',
    guardianPhone: '+573145678901',
    guardianEmail: 'beatriz.l@gmail.com',
    guardianRelationship: 'Madre',
    inclusionProfile: {
      hasNEE: true,
      diagnoses: ['Trastorno del Espectro Autista (TEA Grado 1 - Asperger)'],
      socioemotionalNotes: 'Sensibilidad a ruidos fuertes. Sobresaliente en lógica matemática abstracta pero con reto en trabajo colaborativo abierto.',
      healthConditions: 'Acompañamiento psicológico externo.',
      hasPIAR: true,
      piarApprovedByOrientation: true,
      orientationStatus: 'Aprobado',
      orientationDate: '2026-02-10',
      orientationSignature: 'Psic. Marcela Gómez V.',
      orientationNotes: 'Concertado. Estructurar anticipadamente las actividades y permitir zonas de descanso sensorial.',
      adaptationStrategy: {
        summary: 'Estructuración predecible de rutinas pedagógicas y apoyo en habilidades comunicativas asertivas.',
        methodologicalAdjustments: [
          'Anticipación de cambios en el cronograma escolar con 24 horas de antelación.',
          'Pautas explícitas para tareas grupales con roles claramente delimitados.'
        ],
        didacticResources: [
          'Auriculares de reducción de ruido para momentos de trabajo individual con bullicio.',
          'Rúbricas cerradas y directas.'
        ],
        evaluativeStrategies: [
          'Evaluaciones directas sin dobles sentidos o metáforas en los enunciados.',
          'Opción de sustentación individualizada en espacio libre de estímulos.'
        ],
        socioemotionalSupport: 'Espacio de descompresión emocional si experimenta sobrecarga sensorial.',
        dateGenerated: '2026-02-08'
      }
    }
  },
  {
    id: 'std-8',
    document: '1097223344',
    documentType: 'TI',
    name: 'Daniel Felipe Vargas Meza',
    gender: 'M',
    age: 15,
    course: '9° B',
    guardianName: 'Gloria Meza',
    guardianPhone: '+573176543219',
    guardianEmail: 'gloria.meza@gmail.com',
    guardianRelationship: 'Madre',
    inclusionProfile: {
      hasNEE: false,
      diagnoses: [],
      socioemotionalNotes: 'Estudiante con rendimiento regular.',
      healthConditions: 'Ninguna',
      hasPIAR: false,
      piarApprovedByOrientation: false,
      orientationStatus: 'Pendiente',
      adaptationStrategy: null
    }
  }
];

export const INITIAL_DBAS: DBAItem[] = [
  {
    id: 'dba-mat-9-1',
    grade: '9°',
    subject: 'Matemáticas',
    number: 1,
    statement: 'Utiliza los números reales, sus operaciones, relaciones y representaciones para analizar procesos infinitos y resolver problemas en diferentes contextos.',
    evidences: [
      'Identifica y describe patrones numéricos que sugieren sucesiones y progresiones.',
      'Aplica las propiedades de las operaciones en los números reales para simplificar expresiones algebraicas.',
      'Resuelve problemas que involucran radicación, potenciación y notación científica.'
    ]
  },
  {
    id: 'dba-mat-9-2',
    grade: '9°',
    subject: 'Matemáticas',
    number: 2,
    statement: 'Propone y desarrolla expresiones algebraicas en el conjunto de los números reales y utiliza las propiedades de la igualdad en la solución de ecuaciones e inecuaciones.',
    evidences: [
      'Plantea sistemas de dos ecuaciones lineales con dos incógnitas a partir de enunciados verbales.',
      'Resuelve sistemas 2x2 utilizando métodos algebraicos (sustitución, igualación, eliminación y determinantes).',
      'Interpreta geométrica y analíticamente la solución de un sistema de ecuaciones.'
    ]
  },
  {
    id: 'dba-mat-9-3',
    grade: '9°',
    subject: 'Matemáticas',
    number: 3,
    statement: 'Identifica y utiliza relaciones funcionales en diferentes contextos para modelar situaciones de variación continua y discreta.',
    evidences: [
      'Reconoce la función lineal y afín a partir de su tabla de valores, gráfica o fórmula matemática.',
      'Calcula e interpreta la pendiente y el punto de corte con los ejes en contextos cotidianos.',
      'Modela situaciones problemáticas mediante modelos lineales.'
    ]
  },
  {
    id: 'dba-len-9-1',
    grade: '9°',
    subject: 'Lenguaje',
    number: 1,
    statement: 'Analiza el lenguaje literario como una manifestación artística que permite crear ficciones y expresar pensamientos o emociones.',
    evidences: [
      'Reconoce elementos temáticos, formales y estilísticos en obras de la literatura latinoamericana.',
      'Establece relaciones intertextuales entre la literatura y otras manifestaciones artísticas.'
    ]
  },
  {
    id: 'dba-len-9-2',
    grade: '9°',
    subject: 'Lenguaje',
    number: 2,
    statement: 'Produce textos orales y escritos de carácter argumentativo para exponer ideas y sustentar puntos de vista con rigor.',
    evidences: [
      'Escribe ensayos y columnas de opinión con una tesis clara y argumentos fundamentados.',
      'Participa en debates respetando las reglas de intervención y contraargumentación.'
    ]
  }
];

export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'ach-1',
    code: 'LOG-MAT-901',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    dbaId: 'dba-mat-9-2',
    description: 'Modela y resuelve situaciones problema de la vida cotidiana utilizando sistemas de ecuaciones lineales 2x2 e interpreta sus soluciones.',
    superiorCriteria: 'Formula de manera autónoma modelos matemáticos con sistemas 2x2, justifica cada paso algebraico y argumenta la validez de los resultados.',
    altoCriteria: 'Resuelve adecuadamente sistemas 2x2 empleando diversos métodos algebraicos y contextualiza la respuesta.',
    basicoCriteria: 'Reconoce y resuelve sistemas lineales 2x2 guiado por el docente con algunos errores menores de cálculo.',
    bajoCriteria: 'Presenta dificultad para plantear ecuaciones a partir de enunciados y no domina los métodos algebraicos de despeje.'
  },
  {
    id: 'ach-2',
    code: 'LOG-MAT-902',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    dbaId: 'dba-mat-9-3',
    description: 'Comprende el concepto de función lineal, calcula su pendiente e intercepto y construye gráficas precisas en el plano cartesiano.',
    superiorCriteria: 'Analiza con rigurosidad la tasa de cambio en situaciones contextuales, vinculando representaciones tabulares, gráficas y algebraicas.',
    altoCriteria: 'Grafica y halla la ecuación de la recta conociendo dos puntos o la pendiente y un punto.',
    basicoCriteria: 'Identifica la forma y = mx + b y ubica coordenadas en el plano cartesiano con apoyo de tablas.',
    bajoCriteria: 'Confunde las variables dependiente e independiente y no logra graficar correctamente la función afín.'
  }
];

export const INITIAL_EVALUATIONS: EvaluationItem[] = [
  {
    id: 'ev-1',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    code: 'C1',
    name: 'Taller 1: Planteamiento de Ecuaciones',
    type: 'Formativa',
    weight: 15,
    maxScore: 5.0,
    date: '2026-02-12',
    dbaId: 'dba-mat-9-2'
  },
  {
    id: 'ev-2',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    code: 'C2',
    name: 'Quiz 1: Métodos de Sustitución e Igualación',
    type: 'Sumativa',
    weight: 15,
    maxScore: 5.0,
    date: '2026-02-24',
    dbaId: 'dba-mat-9-2'
  },
  {
    id: 'ev-3',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    code: 'C3',
    name: 'Taller 2: Método de Reducción y Determinantes',
    type: 'Formativa',
    weight: 15,
    maxScore: 5.0,
    date: '2026-03-06',
    dbaId: 'dba-mat-9-2'
  },
  {
    id: 'ev-4',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    code: 'C4',
    name: 'Proyecto DUA: Modelación de Situaciones Reales',
    type: 'Proyecto DUA',
    weight: 20,
    maxScore: 5.0,
    date: '2026-03-18',
    dbaId: 'dba-mat-9-3'
  },
  {
    id: 'ev-5',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    code: 'C5',
    name: 'Evaluación Parcial Escrita / Oral',
    type: 'Sumativa',
    weight: 25,
    maxScore: 5.0,
    date: '2026-03-27',
    dbaId: 'dba-mat-9-2'
  },
  {
    id: 'ev-6',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    code: 'C6',
    name: 'Autoevaluación y Coevaluación Convivencial',
    type: 'Autoevaluación',
    weight: 10,
    maxScore: 5.0,
    date: '2026-04-02',
    dbaId: 'dba-mat-9-1'
  }
];

export const INITIAL_GRADES: GradeRecord[] = [
  {
    studentId: 'std-1', // Mateo (TDAH - En riesgo académico)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 3.2,
      'ev-2': 2.3,
      'ev-3': 2.5,
      'ev-4': 3.8,
      'ev-5': 2.0,
      'ev-6': 3.5
    },
    observations: 'Dificultad en pruebas cronometradas individuales. Requiere apoyo DUA concertado en el PIAR.'
  },
  {
    studentId: 'std-2', // Valentina (Excelente)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 4.8,
      'ev-2': 4.7,
      'ev-3': 4.9,
      'ev-4': 5.0,
      'ev-5': 4.6,
      'ev-6': 4.8
    },
    observations: 'Excelente desempeño y dedicación constante.'
  },
  {
    studentId: 'std-3', // Santiago (Dislexia - Riesgo de reprobación)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 2.5,
      'ev-2': 2.0,
      'ev-3': 2.8,
      'ev-4': 3.0,
      'ev-5': 1.8,
      'ev-6': 3.0
    },
    observations: 'Fuerte confusión en lectura de enunciados. Urge validación de su PIAR por Orientación.'
  },
  {
    studentId: 'std-4', // Camila (Hipoacusia - Desempeño Básico)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 3.5,
      'ev-2': 3.2,
      'ev-3': 3.4,
      'ev-4': 4.0,
      'ev-5': 3.1,
      'ev-6': 4.2
    },
    observations: 'Ha mostrado buen progreso con el material visual.'
  },
  {
    studentId: 'std-5', // Juan David (Crítico: notas bajas + inasistencia)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 2.0,
      'ev-2': 1.5,
      'ev-3': 2.2,
      'ev-4': null,
      'ev-5': 1.8,
      'ev-6': 2.5
    },
    observations: 'No presentó el proyecto DUA debido a inasistencias continuas. En alto riesgo de deserción.'
  },
  {
    studentId: 'std-6', // Mariana (Sobresaliente)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 4.5,
      'ev-2': 4.6,
      'ev-3': 4.4,
      'ev-4': 4.8,
      'ev-5': 4.3,
      'ev-6': 4.7
    },
    observations: 'Muy participativa y colaboradora.'
  },
  {
    studentId: 'std-7', // Esteban (TEA - Alto desempeño en lógica)
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    scores: {
      'ev-1': 5.0,
      'ev-2': 4.9,
      'ev-3': 4.8,
      'ev-4': 4.0,
      'ev-5': 4.8,
      'ev-6': 3.8
    },
    observations: 'Sobresaliente en álgebra abstracta. Continuar apoyando la autoevaluación convivencial.'
  }
];

export const INITIAL_ATTENDANCE_SESSIONS: AttendanceSession[] = [
  {
    id: 'att-1',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-02',
    topic: 'Introducción a Sistemas 2x2',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'P',
      'std-4': 'P',
      'std-5': 'A', // Juan David Ausente
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-5': 'No asiste sin justificación previa.'
    }
  },
  {
    id: 'att-2',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-05',
    topic: 'Método Gráfico en GeoGebra',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'P',
      'std-4': 'P',
      'std-5': 'A',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-5': 'Segunda inasistencia consecutiva de la semana.'
    }
  },
  {
    id: 'att-3',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-09',
    topic: 'Método de Sustitución paso a paso',
    records: {
      'std-1': 'R', // Retardo justificado
      'std-2': 'P',
      'std-3': 'P',
      'std-4': 'P',
      'std-5': 'A',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-1': 'Llega 15 minutos tarde por control médico.',
      'std-5': 'Falla reiterada.'
    }
  },
  {
    id: 'att-4',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-12',
    topic: 'Taller en parejas: Método de Igualación',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'A', // Santiago ausente
      'std-4': 'P',
      'std-5': 'A',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-3': 'Cita fonoaudiológica.',
      'std-5': 'Continúa sin reporte.'
    }
  },
  {
    id: 'att-5',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-16',
    topic: 'Método de Reducción',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'E', // Excusa médica
      'std-4': 'P',
      'std-5': 'A',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-3': 'Madre presentó incapacidad médica de 24 horas.',
      'std-5': 'Acumula más de 5 fallas consecutivas.'
    }
  },
  {
    id: 'att-6',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-19',
    topic: 'Determinantes Regla de Cramer',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'P',
      'std-4': 'P',
      'std-5': 'P',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-5': 'Asiste pero sin el material de trabajo ni las guías anteriores.'
    }
  },
  {
    id: 'att-7',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-23',
    topic: 'Resolución de Problemas Aplicados',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'P',
      'std-4': 'P',
      'std-5': 'A',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-5': 'Inasistencia número 6.'
    }
  },
  {
    id: 'att-8',
    course: '9° A',
    subject: 'Matemáticas',
    date: '2026-03-26',
    topic: 'Repaso general previo a evaluación',
    records: {
      'std-1': 'P',
      'std-2': 'P',
      'std-3': 'P',
      'std-4': 'P',
      'std-5': 'A',
      'std-6': 'P',
      'std-7': 'P'
    },
    notes: {
      'std-5': 'Acumula 7 inasistencias en 8 sesiones (87.5% de inasistencia). Alerta crítica de deserción escolar.'
    }
  }
];

export const INITIAL_IMPROVEMENT_PLANS: ImprovementPlan[] = [
  {
    id: 'plan-1',
    studentId: 'std-3',
    studentName: 'Santiago Andrés Barrientos Peña',
    course: '9° A',
    subject: 'Matemáticas',
    period: 'Periodo 1',
    dateCreated: '2026-03-28',
    status: 'En Proceso',
    objective: 'Nivelar las competencias del DBA 2 (sistemas de ecuaciones 2x2) mediante adaptaciones DUA y sustentación individual sin barreras lectoras.',
    competenciesToStrengthen: [
      'Comprensión conceptual de las ecuaciones lineales y métodos de solución algebraica.',
      'Resolución de situaciones problema aplicando el método gráfico y de reducción.'
    ],
    failedEvaluations: [
      'Quiz 1: Métodos de Sustitución e Igualación (2.0)',
      'Evaluación Parcial Escrita (1.8)'
    ],
    activities: [
      {
        step: 1,
        title: 'Taller Práctico Adaptado con Organizadores Gráficos',
        description: 'Resolver una guía visual de 6 ejercicios de sistemas 2x2 con colores diferenciados para cada incógnita y pasos guiados.',
        deliveryFormat: 'Físico en hojas cuadriculadas con letra legible y apoyo fonoaudiológico',
        percentage: 40
      },
      {
        step: 2,
        title: 'Laboratorio de Modelación Digital en GeoGebra',
        description: 'Comprobar gráficamente la intersección de las rectas de los 6 sistemas e interpretar la solución única, infinita o sin solución.',
        deliveryFormat: 'Capturas de pantalla comentadas o archivo GeoGebra',
        percentage: 30
      },
      {
        step: 3,
        title: 'Sustentación Oral con el Docente',
        description: 'Explicar de forma verbal y en pizarra 1 ejercicio al docente, permitiendo la consulta de su organizador gráfico.',
        deliveryFormat: 'Entrevista individual de 10 minutos',
        percentage: 30
      }
    ],
    rubricCriteria: [
      {
        criterion: 'Dominio Conceptual de Sistemas 2x2',
        weight: '40%',
        description: 'Aplica correctamente los algoritmos de despeje y comprueba las igualdades.'
      },
      {
        criterion: 'Organización y Cumplimiento de Entrega',
        weight: '30%',
        description: 'Entrega en la fecha acordada con procedimiento completo paso a paso.'
      },
      {
        criterion: 'Sustentación y Explicación Oral',
        weight: '30%',
        description: 'Argumenta el sentido de las incógnitas y demuestra comprensión del resultado.'
      }
    ],
    deadlineDate: '2026-04-10',
    defenseDate: '2026-04-11',
    teacherApproval: true,
    orientationApproval: true,
    initialGrade: 2.3,
    recoveredGrade: undefined,
    commitmentStatement: 'El estudiante Santiago Barrientos y su acudiente Claudia Peña se comprometen a destinar 4 horas semanales de estudio guiado en casa y presentar puntualmente las actividades.'
  }
];
