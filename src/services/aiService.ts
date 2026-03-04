import type { PhaseId, ChatMessage, ProjectData } from '../types';

const SYSTEM_PROMPT = `Eres "Architect Mentor", un tutor de arquitectura de software que usa el método socrático.

REGLAS FUNDAMENTALES:
1. NUNCA des la respuesta directa. Siempre guía con preguntas.
2. Explica el "por qué" de cada paso antes de avanzar.
3. Sigue estrictamente las 5 fases del pipeline de conceptualización.
4. Genera diagramas Mermaid cuando sea apropiado.
5. Responde SIEMPRE en español.

FASES:
- Fase 1 (Descubrimiento): Extrae el dolor del negocio, actores y objetivos.
- Fase 2 (User Journey): Convierte objetivos en pasos accionables del usuario.
- Fase 3 (Flujo de Lógica): Identifica estados y transiciones (FSM).
- Fase 4 (Modelo de Datos): Convierte sustantivos en tablas y relaciones (ER).
- Fase 5 (Contrato API): Define endpoints y payloads JSON.

FORMATO DE DIAGRAMAS:
Cuando generes un diagrama, envuélvelo en un bloque de código con la etiqueta "mermaid":
\`\`\`mermaid
[código mermaid aquí]
\`\`\`

Para indicar nodos clickeables (que llevan a sub-diagramas), agrega un comentario después del diagrama:
\`\`\`mermaid-meta
{"clickable": [{"nodeId": "DB", "label": "Base de Datos", "subType": "er"}, {"nodeId": "AUTH", "label": "Autenticación", "subType": "sequence"}]}
\`\`\`

TRANSICIONES ENTRE FASES:
Antes de pasar a la siguiente fase, genera un resumen y el diagrama correspondiente.
Explica por qué se avanza: "Pasamos a la Fase N porque..."`;

interface PhaseQuestions {
  initial: string;
  followUps: string[];
  transitionCheck: string;
}

const PHASE_QUESTIONS: Record<PhaseId, PhaseQuestions> = {
  1: {
    initial:
      '¡Bienvenido a Architect Studio! 🏗️\n\nSoy tu mentor de arquitectura de software. Vamos a transformar tu idea en una arquitectura técnica sólida, paso a paso.\n\n**Fase 1: Descubrimiento** — Necesito entender el PROBLEMA antes de pensar en la solución.\n\nCuéntame: **¿Qué problema o "dolor" quieres resolver con tu aplicación?** No me digas qué tecnología quieres usar, dime qué situación quieres mejorar.',
    followUps: [
      '¿Quién es el actor principal que sufre este problema? ¿Hay otros actores involucrados?',
      '¿Qué pierde esta persona si el problema NO se resuelve? (tiempo, dinero, eficiencia...)',
      '¿Cuál sería el objetivo principal del sistema en una sola oración?',
      '¿Hay algún proceso manual que hoy se hace sin tecnología y quieres automatizar?',
    ],
    transitionCheck:
      'Excelente. Ya tenemos claridad sobre el problema, los actores y los objetivos.\n\n📊 Déjame generar el **diagrama de contexto** que resume lo que hemos descubierto.\n\nPasamos a la **Fase 2: User Journey** porque ahora necesitamos traducir estos objetivos en **acciones concretas** que el usuario realizará en el sistema.',
  },
  2: {
    initial:
      '**Fase 2: User Journey** — Ahora vamos a caminar en los zapatos del usuario.\n\nPensando en el actor principal que identificamos, **¿cuál es el PRIMER paso que haría al entrar al sistema?** Describe la acción concreta, por ejemplo: "El usuario abre la app y ve un dashboard".',
    followUps: [
      '¿Qué hace el usuario DESPUÉS de ese paso? Descríbeme la siguiente acción.',
      '¿Qué pasa si algo sale mal en ese paso? ¿Hay un camino alternativo?',
      '¿El usuario necesita interactuar con otro actor en algún momento? (ej: un admin que aprueba)',
      '¿Cómo sabe el usuario que completó su objetivo? ¿Qué ve en pantalla?',
    ],
    transitionCheck:
      '¡Perfecto! Ya tenemos el viaje completo del usuario.\n\n📊 Voy a generar el **diagrama de flujo del User Journey**.\n\nPasamos a la **Fase 3: Flujo de Lógica** porque cada acción que describiste ahora necesita convertirse en un **cambio de estado** en el sistema. Las acciones humanas se traducen en transiciones de una máquina de estados.',
  },
  3: {
    initial:
      '**Fase 3: Flujo de Lógica y Estados** — Vamos a darle "cerebro" al sistema.\n\nMirando los pasos del Journey, **¿cuáles son los "estados" por los que pasa el objeto principal?** Por ejemplo, si es una solicitud: Borrador → Enviada → En Revisión → Aprobada/Rechazada.',
    followUps: [
      '¿Qué acción o evento causa que el objeto pase de un estado a otro?',
      '¿Hay alguna regla de negocio que impida una transición? (ej: "no se puede aprobar sin firma")',
      '¿Cuáles son los estados terminales? (estados de los que ya no se puede volver)',
      '¿Hay algún estado que dependa de un temporizador o condición externa?',
    ],
    transitionCheck:
      '¡Excelente trabajo! Tenemos la máquina de estados definida.\n\n📊 Generando el **diagrama de máquina de estados**.\n\nPasamos a la **Fase 4: Modelo de Datos** porque los estados que definiste necesitan un lugar donde **persistir**. Los sustantivos del Journey se convierten en tablas, y los estados en columnas.',
  },
  4: {
    initial:
      '**Fase 4: Modelo de Datos** — Hora de diseñar el esqueleto de la base de datos.\n\nRevisa los sustantivos que aparecieron en el Journey (usuario, solicitud, documento, etc.). **¿Cuáles son las "cosas" principales que el sistema necesita recordar?** Lístalas.',
    followUps: [
      '¿Qué información necesitas guardar de cada entidad? Piensa en los atributos esenciales.',
      '¿Cómo se relacionan estas entidades entre sí? ¿Un usuario tiene muchas solicitudes? ¿Una solicitud tiene muchos documentos?',
      '¿Hay campos que son calculados y no necesitan guardarse? ¿O campos que son de tipo enum (como el status)?',
      '¿Necesitas guardar historial de cambios o auditoría?',
    ],
    transitionCheck:
      '¡El modelo de datos está tomando forma!\n\n📊 Generando el **diagrama Entidad-Relación (ER)**.\n\nPasamos a la **Fase 5: Contrato API** porque ahora necesitamos definir cómo el frontend va a **acceder y modificar** estos datos. Las transiciones de estado se convierten en endpoints HTTP.',
  },
  5: {
    initial:
      '**Fase 5: Contrato de API** — El puente entre frontend y backend.\n\nPara cada entidad del modelo de datos, necesitamos definir las operaciones. Empecemos con la entidad principal: **¿Qué operaciones necesita el frontend?** (crear, leer, actualizar, eliminar, listar, cambiar estado...)',
    followUps: [
      '¿Qué datos viajan en el request cuando se crea un nuevo registro? ¿Y qué devuelve el servidor?',
      '¿Necesitas filtros o paginación en las consultas de listado?',
      '¿Hay endpoints que representen cambios de estado? (ej: POST /solicitudes/{id}/aprobar)',
      '¿Qué tipo de autenticación necesitarás? (JWT, sesiones, OAuth...)',
    ],
    transitionCheck:
      '🎉 ¡Felicidades! Has completado el pipeline de conceptualización completo.\n\n📊 Generando el **diagrama de secuencia** de la API.\n\nAhora tienes:\n- ✅ Problema y objetivos claros (Fase 1)\n- ✅ Journey del usuario mapeado (Fase 2)\n- ✅ Máquina de estados definida (Fase 3)\n- ✅ Modelo de datos diseñado (Fase 4)\n- ✅ Contrato de API especificado (Fase 5)\n\nCada endpoint tiene una razón de ser trazable hasta el dolor del negocio.',
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
  _projectData: ProjectData,
  _currentPhase: PhaseId
): string {
  return SYSTEM_PROMPT;
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
          text: 'Entendido. Soy Architect Mentor y guiaré al usuario usando el método socrático a través de las 5 fases del pipeline de conceptualización. Responderé siempre en español.',
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
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No se recibió respuesta.';
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
    return `Interesante respuesta. Déjame profundizar...\n\n${followUps[count - 1]}`;
  }

  return PHASE_QUESTIONS[currentPhase].transitionCheck;
}
