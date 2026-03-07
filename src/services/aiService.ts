import type { PhaseId, ChatMessage, ProjectData } from '../types';

const SYSTEM_PROMPT = `Eres "Architect Mentor", un tutor de arquitectura de software que combina el metodo socratico con consultoria proactiva.
Actuas tambien como Senior Solution Architect: no solo preguntas, sino que propones soluciones estandar de la industria para evitar el efecto "hoja en blanco".

REGLAS FUNDAMENTALES:
1. Guia con preguntas socraticas, pero cuando detectes indecision o ideas vagas, ofrece 2 rutas concretas (ej: "Ruta MVP" vs "Ruta Enterprise").
2. Explica el "por que" de cada paso antes de avanzar.
3. Sigue estrictamente las 5 fases del pipeline de conceptualizacion.
4. Genera diagramas Mermaid cuando sea apropiado.
5. Responde SIEMPRE en espanol.
6. Asigna un ID a cada artefacto tecnico que generes: [REQ-001], [DG-001], [EP-001], etc.

FASES:
- Fase 1 (Descubrimiento): Extrae el dolor del negocio, actores y objetivos.
- Fase 2 (User Journey): Convierte objetivos en pasos accionables del usuario.
- Fase 3 (Flujo de Logica): Identifica estados y transiciones (FSM).
- Fase 4 (Modelo de Datos): Convierte sustantivos en tablas y relaciones (ER). Incluye payloads JSON de ejemplo.
- Fase 5 (Contrato API): Define endpoints y payloads JSON completos.

CONSULTORIA PROACTIVA:
- Cuando el usuario plantee una idea vaga, ofrece 2-3 arquitecturas de referencia inmediatamente.
- Usa patrones estandar de la industria: CRUD, approval workflow, e-commerce, auth, Kanban, event-driven.

FORMATO DE DIAGRAMAS:
Cuando generes un diagrama, envuelvelo en un bloque de codigo con la etiqueta "mermaid":
\`\`\`mermaid
[codigo mermaid aqui]
\`\`\`
RESTRICCION MERMAID: Solo usa estos tipos: graph, sequenceDiagram, erDiagram, stateDiagram-v2. Prohibido sintaxis experimental o tipos no estandar.

BOOSTERS (al final de cada respuesta significativa):
Cierra con opciones interactivas para que el usuario decida el siguiente paso:
[A] Primera opcion concreta
[B] Segunda opcion concreta
[C] Tercera opcion concreta

EXTRACCION DE DATOS (OBLIGATORIO):
Al final de CADA respuesta, SIEMPRE genera un bloque json-extract con los datos estructurados que hayas identificado hasta ahora en la conversacion.
Este bloque es INVISIBLE para el usuario pero CRITICO para el sistema. NUNCA lo omitas.

El formato depende de la fase actual:`;

// Phase-specific extraction instructions appended to system prompt
const PHASE_EXTRACT_INSTRUCTIONS: Record<PhaseId, string> = {
  1: `
FASE 1 - Extrae estos datos del usuario:
\`\`\`json-extract
{
  "name": "nombre del proyecto si se menciono o string vacio",
  "description": "descripcion breve del proyecto",
  "actors": ["actor1", "actor2"],
  "painPoints": ["dolor1", "dolor2"],
  "objectives": ["objetivo1", "objetivo2"]
}
\`\`\`
Incluye TODOS los datos acumulados, no solo los nuevos. Si el usuario no ha mencionado algo, deja el array vacio.`,

  2: `
FASE 2 - Extrae el journey del usuario:
\`\`\`json-extract
{
  "journeySteps": [
    {"actor": "nombre_actor", "action": "que hace", "goal": "para que", "order": 1},
    {"actor": "nombre_actor", "action": "siguiente paso", "goal": "resultado", "order": 2}
  ]
}
\`\`\`
Incluye TODOS los pasos acumulados, ordenados. Infiere el orden logico si el usuario no lo especifica.`,

  3: `
FASE 3 - Extrae estados y transiciones:
\`\`\`json-extract
{
  "states": [
    {
      "entity": "nombre_entidad_principal",
      "name": "nombre_estado",
      "transitions": [
        {"from": "estado_origen", "to": "estado_destino", "trigger": "evento_que_causa_la_transicion", "action": "que_sucede"}
      ]
    }
  ]
}
\`\`\`
Incluye TODOS los estados y transiciones acumulados.`,

  4: `
FASE 4 - Extrae entidades y relaciones:
\`\`\`json-extract
{
  "entities": [
    {
      "name": "NombreEntidad",
      "fields": [
        {"name": "id", "type": "UUID", "isPrimaryKey": true, "isForeignKey": false, "isRequired": true},
        {"name": "campo", "type": "String", "isPrimaryKey": false, "isForeignKey": false, "isRequired": true}
      ],
      "relations": [
        {"targetEntity": "OtraEntidad", "type": "1-N", "label": "tiene muchos"}
      ]
    }
  ]
}
\`\`\`
Incluye TODAS las entidades, campos y relaciones acumulados.`,

  5: `
FASE 5 - Extrae endpoints API:
\`\`\`json-extract
{
  "endpoints": [
    {
      "method": "GET|POST|PUT|PATCH|DELETE",
      "path": "/api/v1/recurso",
      "description": "que hace este endpoint",
      "requestBody": "{ JSON de ejemplo }",
      "responseBody": "{ JSON de ejemplo }",
      "relatedEntity": "NombreEntidad",
      "relatedTransition": "nombre_transicion_si_aplica"
    }
  ]
}
\`\`\`
Incluye TODOS los endpoints acumulados.`,
};

interface PhaseQuestions {
  initial: string;
  followUps: string[];
  transitionCheck: string;
}

const PHASE_QUESTIONS: Record<PhaseId, PhaseQuestions> = {
  1: {
    initial:
      'Bienvenido a Architect Studio!\n\nSoy tu mentor de arquitectura de software. Vamos a transformar tu idea en una arquitectura tecnica solida, paso a paso.\n\n**Fase 1: Descubrimiento** — Necesito entender el PROBLEMA antes de pensar en la solucion.\n\nCuentame: **Que problema o "dolor" quieres resolver con tu aplicacion?** No me digas que tecnologia quieres usar, dime que situacion quieres mejorar.',
    followUps: [
      'Quien es el actor principal que sufre este problema? Hay otros actores involucrados?',
      'Que pierde esta persona si el problema NO se resuelve? (tiempo, dinero, eficiencia...)',
      'Cual seria el objetivo principal del sistema en una sola oracion?',
      'Hay algun proceso manual que hoy se hace sin tecnologia y quieres automatizar?',
    ],
    transitionCheck:
      'Excelente. Ya tenemos claridad sobre el problema, los actores y los objetivos.\n\nDejame generar el **diagrama de contexto** que resume lo que hemos descubierto.\n\nPasamos a la **Fase 2: User Journey** porque ahora necesitamos traducir estos objetivos en **acciones concretas** que el usuario realizara en el sistema.',
  },
  2: {
    initial:
      '**Fase 2: User Journey** — Ahora vamos a caminar en los zapatos del usuario.\n\nPensando en el actor principal que identificamos, **cual es el PRIMER paso que haria al entrar al sistema?** Describe la accion concreta, por ejemplo: "El usuario abre la app y ve un dashboard".',
    followUps: [
      'Que hace el usuario DESPUES de ese paso? Describeme la siguiente accion.',
      'Que pasa si algo sale mal en ese paso? Hay un camino alternativo?',
      'El usuario necesita interactuar con otro actor en algun momento? (ej: un admin que aprueba)',
      'Como sabe el usuario que completo su objetivo? Que ve en pantalla?',
    ],
    transitionCheck:
      'Perfecto! Ya tenemos el viaje completo del usuario.\n\nVoy a generar el **diagrama de flujo del User Journey**.\n\nPasamos a la **Fase 3: Flujo de Logica** porque cada accion que describiste ahora necesita convertirse en un **cambio de estado** en el sistema.',
  },
  3: {
    initial:
      '**Fase 3: Flujo de Logica y Estados** — Vamos a darle "cerebro" al sistema.\n\nMirando los pasos del Journey, **cuales son los "estados" por los que pasa el objeto principal?** Por ejemplo, si es una solicitud: Borrador → Enviada → En Revision → Aprobada/Rechazada.',
    followUps: [
      'Que accion o evento causa que el objeto pase de un estado a otro?',
      'Hay alguna regla de negocio que impida una transicion? (ej: "no se puede aprobar sin firma")',
      'Cuales son los estados terminales? (estados de los que ya no se puede volver)',
      'Hay algun estado que dependa de un temporizador o condicion externa?',
    ],
    transitionCheck:
      'Excelente trabajo! Tenemos la maquina de estados definida.\n\nGenerando el **diagrama de maquina de estados**.\n\nPasamos a la **Fase 4: Modelo de Datos** porque los estados que definiste necesitan un lugar donde **persistir**. Los sustantivos del Journey se convierten en tablas, y los estados en columnas.',
  },
  4: {
    initial:
      '**Fase 4: Modelo de Datos** — Hora de disenar el esqueleto de la base de datos.\n\nRevisa los sustantivos que aparecieron en el Journey (usuario, solicitud, documento, etc.). **Cuales son las "cosas" principales que el sistema necesita recordar?** Listalas.',
    followUps: [
      'Que informacion necesitas guardar de cada entidad? Piensa en los atributos esenciales.',
      'Como se relacionan estas entidades entre si? Un usuario tiene muchas solicitudes? Una solicitud tiene muchos documentos?',
      'Hay campos que son calculados y no necesitan guardarse? O campos que son de tipo enum (como el status)?',
      'Necesitas guardar historial de cambios o auditoria?',
    ],
    transitionCheck:
      'El modelo de datos esta tomando forma!\n\nGenerando el **diagrama Entidad-Relacion (ER)**.\n\nPasamos a la **Fase 5: Contrato API** porque ahora necesitamos definir como el frontend va a **acceder y modificar** estos datos.',
  },
  5: {
    initial:
      '**Fase 5: Contrato de API** — El puente entre frontend y backend.\n\nPara cada entidad del modelo de datos, necesitamos definir las operaciones. Empecemos con la entidad principal: **Que operaciones necesita el frontend?** (crear, leer, actualizar, eliminar, listar, cambiar estado...)',
    followUps: [
      'Que datos viajan en el request cuando se crea un nuevo registro? Y que devuelve el servidor?',
      'Necesitas filtros o paginacion en las consultas de listado?',
      'Hay endpoints que representen cambios de estado? (ej: POST /solicitudes/{id}/aprobar)',
      'Que tipo de autenticacion necesitaras? (JWT, sesiones, OAuth...)',
    ],
    transitionCheck:
      'Felicidades! Has completado el pipeline de conceptualizacion completo.\n\nGenerando el **diagrama de secuencia** de la API.\n\nAhora tienes:\n- Problema y objetivos claros (Fase 1)\n- Journey del usuario mapeado (Fase 2)\n- Maquina de estados definida (Fase 3)\n- Modelo de datos disenado (Fase 4)\n- Contrato de API especificado (Fase 5)\n\nCada endpoint tiene una razon de ser trazable hasta el dolor del negocio.',
  },
};

export function getInitialMessage(phase: PhaseId): string {
  return PHASE_QUESTIONS[phase].initial;
}

export function getTransitionMessage(phase: PhaseId): string {
  return PHASE_QUESTIONS[phase].transitionCheck;
}

export function getFollowUpQuestions(phase: PhaseId): string[] {
  return PHASE_QUESTIONS[phase].followUps;
}

export function getSystemPrompt(): string {
  return SYSTEM_PROMPT;
}

export function buildContextForAI(
  _messages: ChatMessage[],
  projectData: ProjectData,
  currentPhase: PhaseId
): string {
  const phaseInstruction = PHASE_EXTRACT_INSTRUCTIONS[currentPhase];

  // Build accumulated data summary
  const dataSummary: string[] = [];

  if (projectData.name) dataSummary.push(`Nombre del proyecto: ${projectData.name}`);
  if (projectData.description) dataSummary.push(`Descripcion: ${projectData.description}`);
  if (projectData.actors.length > 0) dataSummary.push(`Actores identificados: ${projectData.actors.join(', ')}`);
  if (projectData.painPoints.length > 0) dataSummary.push(`Pain points: ${projectData.painPoints.join(', ')}`);
  if (projectData.objectives.length > 0) dataSummary.push(`Objetivos: ${projectData.objectives.join(', ')}`);
  if (projectData.journeySteps.length > 0) {
    const steps = projectData.journeySteps
      .sort((a, b) => a.order - b.order)
      .map((s) => `${s.order}. ${s.actor}: ${s.action}`)
      .join('\n  ');
    dataSummary.push(`Journey del usuario:\n  ${steps}`);
  }
  if (projectData.states.length > 0) {
    const states = projectData.states.map((s) => s.name).join(', ');
    dataSummary.push(`Estados definidos: ${states}`);
  }
  if (projectData.entities.length > 0) {
    const entities = projectData.entities.map((e) => `${e.name} (${e.fields.length} campos)`).join(', ');
    dataSummary.push(`Entidades: ${entities}`);
  }
  if (projectData.endpoints.length > 0) {
    const eps = projectData.endpoints.map((e) => `${e.method} ${e.path}`).join(', ');
    dataSummary.push(`Endpoints: ${eps}`);
  }

  const contextBlock = dataSummary.length > 0
    ? `\n\nDATOS DEL PROYECTO ACUMULADOS HASTA AHORA:\n${dataSummary.join('\n')}\n\nUsa estos datos como contexto. No repitas preguntas sobre lo que ya se sabe. Profundiza en lo que falta.`
    : '\n\nEl proyecto esta en fase inicial. No hay datos acumulados aun.';

  return `${SYSTEM_PROMPT}${phaseInstruction}\n\nFASE ACTUAL: ${currentPhase}${contextBlock}`;
}

// Extract json-extract blocks from AI response
export function extractJsonExtract(text: string): Record<string, unknown> | null {
  const regex = /```json-extract\n([\s\S]*?)```/g;
  const match = regex.exec(text);
  if (!match) return null;

  try {
    return JSON.parse(match[1].trim()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Remove json-extract blocks from visible text
export function removeJsonExtract(text: string): string {
  return text.replace(/```json-extract\n[\s\S]*?```/g, '').trim();
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export async function sendToGemini(
  messages: ChatMessage[],
  projectData: ProjectData,
  currentPhase: PhaseId,
  apiKey: string
): Promise<string> {
  const systemContext = buildContextForAI(messages, projectData, currentPhase);

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemContext }],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'Entendido. Soy Architect Mentor. Guiare al usuario con el metodo socratico a traves de las 5 fases. Siempre incluire el bloque json-extract al final de cada respuesta. Respondo en espanol.',
        },
      ],
    },
    ...messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    })),
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = (await response.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No se recibio respuesta.';
}

export function generateLocalResponse(
  messages: ChatMessage[],
  _projectData: ProjectData,
  currentPhase: PhaseId
): string {
  const userMessages = messages.filter((m) => m.role === 'user' && m.phase === currentPhase);
  const count = userMessages.length;

  const followUps = PHASE_QUESTIONS[currentPhase].followUps;

  if (count === 0) {
    return PHASE_QUESTIONS[currentPhase].initial;
  }

  if (count <= followUps.length) {
    return `Interesante respuesta. Dejame profundizar...\n\n${followUps[count - 1]}`;
  }

  return PHASE_QUESTIONS[currentPhase].transitionCheck;
}
