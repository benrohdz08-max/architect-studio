import type { Phase } from '../types';

export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Descubrimiento',
    nameEn: 'Discovery',
    dimension: 'Dimensión de Intención',
    description: 'Identificar el dolor del negocio, los actores principales y los objetivos del sistema.',
    icon: '🔍',
    diagramTypes: ['flowchart'],
    tips: [
      'Enfócate en el PROBLEMA, no en la solución técnica.',
      'Pregúntate: ¿Quién sufre este dolor? ¿Qué pierde si no se resuelve?',
      'Un buen caso de uso maestro cabe en una oración.',
      'Identifica al actor principal: ¿quién inicia la acción?',
    ],
  },
  {
    id: 2,
    name: 'User Journey',
    nameEn: 'User Journey',
    dimension: 'Dimensión de Experiencia (UX)',
    description: 'Traducir la narrativa del negocio en pasos accionables del usuario.',
    icon: '🗺️',
    diagramTypes: ['flowchart'],
    tips: [
      'Cada paso debe ser una ACCIÓN del usuario, no del sistema.',
      'Piensa en verbos: "El usuario SUBE un documento", "El admin APRUEBA la solicitud".',
      'No olvides los caminos alternativos: ¿qué pasa si algo falla?',
      'El journey debe cubrir desde el inicio hasta el objetivo cumplido.',
    ],
  },
  {
    id: 3,
    name: 'Flujo de Lógica',
    nameEn: 'Logic Flow',
    dimension: 'Dimensión de Control',
    description: 'Traducir acciones humanas en estados del sistema y reglas de negocio.',
    icon: '⚙️',
    diagramTypes: ['stateDiagram', 'flowchart'],
    tips: [
      'Cada acción del Journey es un TRIGGER que cambia el estado de un objeto.',
      'Define claramente: ¿De qué estado a qué estado se mueve?',
      'Un estado sin salida es un estado terminal (ej: "Completado", "Cancelado").',
      'Las reglas de negocio son las GUARDIAS de las transiciones.',
    ],
  },
  {
    id: 4,
    name: 'Modelo de Datos',
    nameEn: 'Data Model',
    dimension: 'Dimensión de Persistencia',
    description: 'Diseñar las entidades, atributos y relaciones de la base de datos.',
    icon: '🗄️',
    diagramTypes: ['er', 'classDiagram'],
    tips: [
      'Los SUSTANTIVOS del Journey se convierten en TABLAS.',
      'Los ESTADOS de la Fase 3 se convierten en COLUMNAS (status, tipo enum).',
      'Pregúntate: ¿Este dato necesita persistir? ¿Es calculable?',
      'Normaliza: si un dato se repite, probablemente necesita su propia tabla.',
    ],
  },
  {
    id: 5,
    name: 'Contrato API',
    nameEn: 'API Contract',
    dimension: 'Dimensión de Interfaz Técnica',
    description: 'Definir endpoints, métodos HTTP y payloads JSON que conectan frontend y backend.',
    icon: '🔗',
    diagramTypes: ['sequence'],
    tips: [
      'Cada TRANSICIÓN de estado se convierte en un verbo HTTP (POST, PATCH).',
      'Los atributos del Modelo de Datos se convierten en el PAYLOAD JSON.',
      'GET para consultar, POST para crear, PATCH para actualizar estado, DELETE para eliminar.',
      'Piensa en el contrato como un ACUERDO entre frontend y backend.',
    ],
  },
];

export const getPhase = (id: number): Phase =>
  PHASES.find((p) => p.id === id) ?? PHASES[0];
