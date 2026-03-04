export type PhaseId = 1 | 2 | 3 | 4 | 5;

export interface Phase {
  id: PhaseId;
  name: string;
  nameEn: string;
  dimension: string;
  description: string;
  icon: string;
  diagramTypes: DiagramType[];
  tips: string[];
}

export type DiagramType = 'flowchart' | 'er' | 'sequence' | 'stateDiagram' | 'classDiagram';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  phase: PhaseId;
}

export interface DiagramNode {
  id: string;
  label: string;
  type: 'process' | 'decision' | 'database' | 'entity' | 'state' | 'endpoint' | 'actor';
  parentDiagramId?: string;
  childDiagramId?: string;
}

export interface Diagram {
  id: string;
  title: string;
  type: DiagramType;
  mermaidCode: string;
  phase: PhaseId;
  parentId?: string;
  nodes: DiagramNode[];
  isSubDiagram: boolean;
}

export interface ProjectData {
  name: string;
  description: string;
  painPoints: string[];
  actors: string[];
  objectives: string[];
  journeySteps: JourneyStep[];
  states: StateDefinition[];
  entities: Entity[];
  endpoints: Endpoint[];
}

export interface JourneyStep {
  id: string;
  actor: string;
  action: string;
  goal: string;
  order: number;
}

export interface StateDefinition {
  id: string;
  entity: string;
  name: string;
  transitions: StateTransition[];
}

export interface StateTransition {
  from: string;
  to: string;
  trigger: string;
  action: string;
}

export interface Entity {
  id: string;
  name: string;
  fields: EntityField[];
  relations: EntityRelation[];
}

export interface EntityField {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isRequired: boolean;
}

export interface EntityRelation {
  targetEntity: string;
  type: '1-1' | '1-N' | 'N-M';
  label: string;
}

export interface Endpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  requestBody?: string;
  responseBody?: string;
  relatedEntity: string;
  relatedTransition?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  apiKeyEnvVar: string;
}

export interface BreadcrumbItem {
  diagramId: string;
  label: string;
}
