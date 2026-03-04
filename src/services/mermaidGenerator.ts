import type {
  PhaseId,
  ProjectData,
  Diagram,
  DiagramNode,
  DiagramType,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export function generateDiagramForPhase(
  phase: PhaseId,
  projectData: ProjectData,
  existingDiagrams: Diagram[]
): Diagram | null {
  switch (phase) {
    case 1:
      return generateContextDiagram(projectData);
    case 2:
      return generateJourneyFlowchart(projectData);
    case 3:
      return generateStateDiagram(projectData);
    case 4:
      return generateERDiagram(projectData);
    case 5:
      return generateSequenceDiagram(projectData, existingDiagrams);
    default:
      return null;
  }
}

function generateContextDiagram(data: ProjectData): Diagram {
  const id = uuidv4();
  const actors = data.actors.length > 0 ? data.actors : ['Usuario'];
  const objectives =
    data.objectives.length > 0 ? data.objectives : ['Objetivo principal'];

  let code = 'flowchart TD\n';
  code += `    SYS["🏗️ ${data.name || 'Sistema'}"]\n`;
  code += `    style SYS fill:#6366f1,stroke:#4f46e5,color:#fff,stroke-width:3px\n\n`;

  const nodes: DiagramNode[] = [
    {
      id: 'SYS',
      label: data.name || 'Sistema',
      type: 'process',
    },
  ];

  actors.forEach((actor, i) => {
    const nodeId = `ACT${i}`;
    code += `    ${nodeId}["👤 ${actor}"]\n`;
    code += `    ${nodeId} --> SYS\n`;
    code += `    style ${nodeId} fill:#0ea5e9,stroke:#0284c7,color:#fff\n`;
    nodes.push({ id: nodeId, label: actor, type: 'actor' });
  });

  code += '\n';

  objectives.forEach((obj, i) => {
    const nodeId = `OBJ${i}`;
    code += `    SYS --> ${nodeId}["🎯 ${obj}"]\n`;
    code += `    style ${nodeId} fill:#10b981,stroke:#059669,color:#fff\n`;
    nodes.push({ id: nodeId, label: obj, type: 'process' });
  });

  if (data.painPoints.length > 0) {
    code += '\n';
    data.painPoints.forEach((pain, i) => {
      const nodeId = `PAIN${i}`;
      code += `    ${nodeId}["⚠️ ${pain}"]\n`;
      code += `    ${nodeId} -.->|resuelve| SYS\n`;
      code += `    style ${nodeId} fill:#f59e0b,stroke:#d97706,color:#000\n`;
      nodes.push({ id: nodeId, label: pain, type: 'process' });
    });
  }

  return {
    id,
    title: `Diagrama de Contexto - ${data.name || 'Sistema'}`,
    type: 'flowchart',
    mermaidCode: code,
    phase: 1,
    nodes,
    isSubDiagram: false,
  };
}

function generateJourneyFlowchart(data: ProjectData): Diagram {
  const id = uuidv4();
  const steps =
    data.journeySteps.length > 0
      ? data.journeySteps
      : [
          { id: '1', actor: 'Usuario', action: 'Inicia sesión', goal: 'Acceder al sistema', order: 1 },
          { id: '2', actor: 'Usuario', action: 'Navega al dashboard', goal: 'Ver resumen', order: 2 },
          { id: '3', actor: 'Usuario', action: 'Crea nueva solicitud', goal: 'Iniciar proceso', order: 3 },
          { id: '4', actor: 'Admin', action: 'Revisa solicitud', goal: 'Validar datos', order: 4 },
          { id: '5', actor: 'Sistema', action: 'Notifica resultado', goal: 'Informar decisión', order: 5 },
        ];

  let code = 'flowchart TD\n';
  code += '    START(("🚀 Inicio"))\n';
  code += '    style START fill:#6366f1,stroke:#4f46e5,color:#fff\n\n';

  const nodes: DiagramNode[] = [
    { id: 'START', label: 'Inicio', type: 'process' },
  ];

  const sorted = [...steps].sort((a, b) => a.order - b.order);
  let prevId = 'START';

  sorted.forEach((step, i) => {
    const nodeId = `STEP${i}`;
    const icon = step.actor === 'Admin' ? '🔑' : step.actor === 'Sistema' ? '🤖' : '👤';
    code += `    ${nodeId}["${icon} ${step.action}"]\n`;
    code += `    ${prevId} --> ${nodeId}\n`;

    const colors: Record<string, string> = {
      Admin: 'fill:#f59e0b,stroke:#d97706,color:#000',
      Sistema: 'fill:#8b5cf6,stroke:#7c3aed,color:#fff',
    };
    code += `    style ${nodeId} ${colors[step.actor] ?? 'fill:#0ea5e9,stroke:#0284c7,color:#fff'}\n`;

    nodes.push({
      id: nodeId,
      label: step.action,
      type: 'process',
      childDiagramId: `sub-journey-${step.id}`,
    });
    prevId = nodeId;
  });

  code += `\n    FINISH(("✅ Fin"))\n`;
  code += `    ${prevId} --> FINISH\n`;
  code += `    style FINISH fill:#10b981,stroke:#059669,color:#fff\n`;
  nodes.push({ id: 'FINISH', label: 'Fin', type: 'process' });

  return {
    id,
    title: 'User Journey - Flujo del Usuario',
    type: 'flowchart',
    mermaidCode: code,
    phase: 2,
    nodes,
    isSubDiagram: false,
  };
}

function generateStateDiagram(data: ProjectData): Diagram {
  const id = uuidv4();
  const states =
    data.states.length > 0
      ? data.states
      : [
          {
            id: '1',
            entity: 'Solicitud',
            name: 'Borrador',
            transitions: [{ from: 'Borrador', to: 'Enviada', trigger: 'enviar', action: 'Validar campos' }],
          },
          {
            id: '2',
            entity: 'Solicitud',
            name: 'Enviada',
            transitions: [
              { from: 'Enviada', to: 'En_Revision', trigger: 'asignar_revisor', action: 'Notificar admin' },
            ],
          },
          {
            id: '3',
            entity: 'Solicitud',
            name: 'En_Revision',
            transitions: [
              { from: 'En_Revision', to: 'Aprobada', trigger: 'aprobar', action: 'Generar certificado' },
              { from: 'En_Revision', to: 'Rechazada', trigger: 'rechazar', action: 'Notificar usuario' },
            ],
          },
          {
            id: '4',
            entity: 'Solicitud',
            name: 'Aprobada',
            transitions: [],
          },
          {
            id: '5',
            entity: 'Solicitud',
            name: 'Rechazada',
            transitions: [{ from: 'Rechazada', to: 'Borrador', trigger: 'corregir', action: 'Reabrir edición' }],
          },
        ];

  let code = 'stateDiagram-v2\n';
  code += '    [*] --> Borrador\n\n';

  const nodes: DiagramNode[] = [];
  const addedTransitions = new Set<string>();

  states.forEach((state) => {
    nodes.push({ id: state.name, label: state.name, type: 'state' });

    state.transitions.forEach((t) => {
      const key = `${t.from}-${t.to}`;
      if (!addedTransitions.has(key)) {
        code += `    ${t.from} --> ${t.to} : ${t.trigger}\n`;
        addedTransitions.add(key);
      }
    });
  });

  const terminalStates = states.filter((s) => s.transitions.length === 0);
  terminalStates.forEach((s) => {
    code += `    ${s.name} --> [*]\n`;
  });

  return {
    id,
    title: 'Máquina de Estados',
    type: 'stateDiagram',
    mermaidCode: code,
    phase: 3,
    nodes,
    isSubDiagram: false,
  };
}

function generateERDiagram(data: ProjectData): Diagram {
  const id = uuidv4();
  const entities =
    data.entities.length > 0
      ? data.entities
      : [
          {
            id: '1',
            name: 'Usuario',
            fields: [
              { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isRequired: true },
              { name: 'nombre', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isRequired: true },
              { name: 'email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isRequired: true },
              { name: 'rol', type: 'ENUM', isPrimaryKey: false, isForeignKey: false, isRequired: true },
            ],
            relations: [{ targetEntity: 'Solicitud', type: '1-N', label: 'crea' }],
          },
          {
            id: '2',
            name: 'Solicitud',
            fields: [
              { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isRequired: true },
              { name: 'titulo', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isRequired: true },
              { name: 'descripcion', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isRequired: false },
              { name: 'status', type: 'ENUM', isPrimaryKey: false, isForeignKey: false, isRequired: true },
              { name: 'usuario_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isRequired: true },
              { name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isRequired: true },
            ],
            relations: [{ targetEntity: 'Documento', type: '1-N', label: 'contiene' }],
          },
          {
            id: '3',
            name: 'Documento',
            fields: [
              { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false, isRequired: true },
              { name: 'nombre_archivo', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isRequired: true },
              { name: 'url', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isRequired: true },
              { name: 'solicitud_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true, isRequired: true },
            ],
            relations: [],
          },
        ];

  let code = 'erDiagram\n';

  const nodes: DiagramNode[] = [];

  entities.forEach((entity) => {
    nodes.push({
      id: entity.name,
      label: entity.name,
      type: 'entity',
    });

    code += `    ${entity.name} {\n`;
    entity.fields.forEach((field) => {
      const pk = field.isPrimaryKey ? 'PK' : field.isForeignKey ? 'FK' : '';
      code += `        ${field.type} ${field.name}${pk ? ` ${pk}` : ''}\n`;
    });
    code += '    }\n\n';
  });

  entities.forEach((entity) => {
    entity.relations.forEach((rel) => {
      const relSymbol = rel.type === '1-1' ? '||--||' : rel.type === '1-N' ? '||--o{' : '}o--o{';
      code += `    ${entity.name} ${relSymbol} ${rel.targetEntity} : "${rel.label}"\n`;
    });
  });

  return {
    id,
    title: 'Diagrama Entidad-Relación',
    type: 'er',
    mermaidCode: code,
    phase: 4,
    nodes,
    isSubDiagram: false,
  };
}

function generateSequenceDiagram(data: ProjectData, _existing: Diagram[]): Diagram {
  const id = uuidv4();
  const endpoints =
    data.endpoints.length > 0
      ? data.endpoints
      : [
          { id: '1', method: 'POST' as const, path: '/auth/login', description: 'Iniciar sesión', requestBody: '{ email, password }', responseBody: '{ token, user }', relatedEntity: 'Usuario' },
          { id: '2', method: 'GET' as const, path: '/solicitudes', description: 'Listar solicitudes', requestBody: '', responseBody: '{ data: [...], total }', relatedEntity: 'Solicitud' },
          { id: '3', method: 'POST' as const, path: '/solicitudes', description: 'Crear solicitud', requestBody: '{ titulo, descripcion }', responseBody: '{ id, status }', relatedEntity: 'Solicitud' },
          { id: '4', method: 'PATCH' as const, path: '/solicitudes/:id/aprobar', description: 'Aprobar solicitud', requestBody: '{ comentario }', responseBody: '{ status }', relatedEntity: 'Solicitud', relatedTransition: 'En_Revision → Aprobada' },
        ];

  let code = 'sequenceDiagram\n';
  code += '    participant C as 🖥️ Cliente\n';
  code += '    participant A as 🔐 API Gateway\n';
  code += '    participant S as ⚙️ Servidor\n';
  code += '    participant DB as 🗄️ Base de Datos\n\n';

  const nodes: DiagramNode[] = [
    { id: 'C', label: 'Cliente', type: 'actor' },
    { id: 'A', label: 'API Gateway', type: 'process' },
    { id: 'S', label: 'Servidor', type: 'process' },
    { id: 'DB', label: 'Base de Datos', type: 'database', childDiagramId: 'er-diagram' },
  ];

  endpoints.forEach((ep) => {
    code += `    C->>A: ${ep.method} ${ep.path}\n`;
    code += `    A->>S: ${ep.description}\n`;
    code += `    S->>DB: Query ${ep.relatedEntity}\n`;
    code += `    DB-->>S: Resultado\n`;
    code += `    S-->>A: ${ep.responseBody || '200 OK'}\n`;
    code += `    A-->>C: Response JSON\n\n`;

    nodes.push({
      id: `EP_${ep.id}`,
      label: `${ep.method} ${ep.path}`,
      type: 'endpoint',
    });
  });

  return {
    id,
    title: 'Diagrama de Secuencia - API',
    type: 'sequence',
    mermaidCode: code,
    phase: 5,
    nodes,
    isSubDiagram: false,
  };
}

export function generateSubDiagram(
  parentNode: DiagramNode,
  _parentDiagram: Diagram,
  data: ProjectData,
  targetType: DiagramType
): Diagram {
  const id = uuidv4();

  if (targetType === 'er' || parentNode.type === 'database') {
    return generateERDiagram(data);
  }

  if (targetType === 'stateDiagram' || parentNode.type === 'state') {
    return generateStateDiagram(data);
  }

  if (targetType === 'sequence' || parentNode.type === 'endpoint') {
    return generateSequenceDiagram(data, []);
  }

  let code = 'flowchart TD\n';
  code += `    TITLE["📋 Detalle: ${parentNode.label}"]\n`;
  code += `    style TITLE fill:#6366f1,stroke:#4f46e5,color:#fff,stroke-width:2px\n\n`;
  code += `    TITLE --> STEP1["Paso 1: Validar entrada"]\n`;
  code += `    STEP1 --> STEP2["Paso 2: Procesar ${parentNode.label}"]\n`;
  code += `    STEP2 --> STEP3{"¿Éxito?"}\n`;
  code += `    STEP3 -->|Sí| SUCCESS["✅ Operación exitosa"]\n`;
  code += `    STEP3 -->|No| ERROR["❌ Error: reintentar"]\n`;
  code += `    ERROR --> STEP1\n\n`;
  code += `    style STEP1 fill:#0ea5e9,stroke:#0284c7,color:#fff\n`;
  code += `    style STEP2 fill:#0ea5e9,stroke:#0284c7,color:#fff\n`;
  code += `    style STEP3 fill:#f59e0b,stroke:#d97706,color:#000\n`;
  code += `    style SUCCESS fill:#10b981,stroke:#059669,color:#fff\n`;
  code += `    style ERROR fill:#ef4444,stroke:#dc2626,color:#fff\n`;

  return {
    id,
    title: `Sub-proceso: ${parentNode.label}`,
    type: 'flowchart',
    mermaidCode: code,
    phase: 2,
    parentId: parentNode.parentDiagramId,
    nodes: [
      { id: 'STEP1', label: 'Validar entrada', type: 'process' },
      { id: 'STEP2', label: `Procesar ${parentNode.label}`, type: 'process' },
      { id: 'SUCCESS', label: 'Operación exitosa', type: 'process' },
      { id: 'ERROR', label: 'Error: reintentar', type: 'process' },
    ],
    isSubDiagram: true,
  };
}

export function extractMermaidFromText(text: string): string[] {
  const regex = /```mermaid\n([\s\S]*?)```/g;
  const diagrams: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    diagrams.push(match[1].trim());
  }
  return diagrams;
}
