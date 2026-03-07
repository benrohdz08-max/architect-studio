import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  PhaseId,
  ChatMessage,
  Diagram,
  ProjectData,
  BreadcrumbItem,
  DiagramNode,
  DiagramType,
} from '../types';
import {
  getInitialMessage,
  generateLocalResponse,
  sendToGemini,
  extractJsonExtract,
  removeJsonExtract,
} from '../services/aiService';
const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  flowchart: 'Flujo',
  er: 'Entidad-Relacion',
  sequence: 'Secuencia',
  stateDiagram: 'Estados',
  classDiagram: 'Clases',
};

function detectDiagramType(code: string): DiagramType {
  const trimmed = code.trim();
  if (trimmed.startsWith('erDiagram')) return 'er';
  if (trimmed.startsWith('sequenceDiagram')) return 'sequence';
  if (trimmed.startsWith('stateDiagram')) return 'stateDiagram';
  if (trimmed.startsWith('classDiagram')) return 'classDiagram';
  return 'flowchart';
}

import {
  generateDiagramForPhase,
  generateSubDiagram,
  extractMermaidFromText,
} from '../services/mermaidGenerator';

interface ProjectStore {
  // Phase state
  currentPhase: PhaseId;
  phaseCompleted: Record<PhaseId, boolean>;

  // Chat state
  messages: ChatMessage[];
  isAITyping: boolean;

  // Diagram state
  diagrams: Diagram[];
  activeDiagramId: string | null;
  breadcrumbs: BreadcrumbItem[];

  // Project data (accumulated through phases)
  projectData: ProjectData;

  // Settings
  aiMode: 'local' | 'gemini';
  geminiApiKey: string;
  showCode: boolean;
  activePanel: 'chat' | 'diagram' | 'code';

  // Actions
  setPhase: (phase: PhaseId) => void;
  advancePhase: () => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  sendUserMessage: (content: string) => Promise<void>;
  generatePhaseDiagram: () => void;
  setActiveDiagram: (id: string) => void;
  navigateToSubDiagram: (node: DiagramNode, targetType: DiagramType) => void;
  navigateBreadcrumb: (index: number) => void;
  updateProjectData: (data: Partial<ProjectData>) => void;
  setAIMode: (mode: 'local' | 'gemini') => void;
  setGeminiApiKey: (key: string) => void;
  toggleCode: () => void;
  setActivePanel: (panel: 'chat' | 'diagram' | 'code') => void;
  updateDiagramCode: (diagramId: string, code: string) => void;
  initializePhase: () => void;
}

const initialProjectData: ProjectData = {
  name: '',
  description: '',
  painPoints: [],
  actors: [],
  objectives: [],
  journeySteps: [],
  states: [],
  entities: [],
  endpoints: [],
};

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentPhase: 1,
  phaseCompleted: { 1: false, 2: false, 3: false, 4: false, 5: false },
  messages: [],
  isAITyping: false,
  diagrams: [],
  activeDiagramId: null,
  breadcrumbs: [],
  projectData: { ...initialProjectData },
  aiMode: 'local',
  geminiApiKey: '',
  showCode: false,
  activePanel: 'chat',

  setPhase: (phase) => {
    set({ currentPhase: phase });
    get().initializePhase();
  },

  advancePhase: () => {
    const { currentPhase } = get();
    if (currentPhase < 5) {
      get().generatePhaseDiagram();
      set((state) => ({
        currentPhase: (currentPhase + 1) as PhaseId,
        phaseCompleted: { ...state.phaseCompleted, [currentPhase]: true },
      }));
      setTimeout(() => get().initializePhase(), 100);
    } else {
      set((state) => ({
        phaseCompleted: { ...state.phaseCompleted, 5: true },
      }));
      get().generatePhaseDiagram();
    }
  },

  addMessage: (content, role) => {
    const { currentPhase } = get();
    const message: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: Date.now(),
      phase: currentPhase,
    };
    set((state) => ({ messages: [...state.messages, message] }));
  },

  sendUserMessage: async (content) => {
    const { aiMode, geminiApiKey, messages, projectData, currentPhase } = get();

    get().addMessage(content, 'user');
    set({ isAITyping: true });

    try {
      const updatedMessages: ChatMessage[] = [...messages, {
        id: uuidv4(),
        role: 'user' as const,
        content,
        timestamp: Date.now(),
        phase: currentPhase,
      }];

      let response: string;
      if (aiMode === 'gemini' && geminiApiKey) {
        response = await sendToGemini(updatedMessages, projectData, currentPhase, geminiApiKey);
      } else {
        response = generateLocalResponse(updatedMessages, projectData, currentPhase);
      }

      // Extract structured data from AI response (json-extract blocks)
      const extractedData = extractJsonExtract(response);
      if (extractedData) {
        const dataUpdate: Partial<ProjectData> = {};

        // Phase 1 data
        if (typeof extractedData.name === 'string' && extractedData.name) dataUpdate.name = extractedData.name;
        if (typeof extractedData.description === 'string' && extractedData.description) dataUpdate.description = extractedData.description;
        if (Array.isArray(extractedData.actors) && extractedData.actors.length > 0) dataUpdate.actors = extractedData.actors as string[];
        if (Array.isArray(extractedData.painPoints) && extractedData.painPoints.length > 0) dataUpdate.painPoints = extractedData.painPoints as string[];
        if (Array.isArray(extractedData.objectives) && extractedData.objectives.length > 0) dataUpdate.objectives = extractedData.objectives as string[];

        // Phase 2 data
        if (Array.isArray(extractedData.journeySteps) && extractedData.journeySteps.length > 0) {
          dataUpdate.journeySteps = (extractedData.journeySteps as Array<Record<string, unknown>>).map((s, i) => ({
            id: uuidv4(),
            actor: String(s.actor || ''),
            action: String(s.action || ''),
            goal: String(s.goal || ''),
            order: typeof s.order === 'number' ? s.order : i + 1,
          }));
        }

        // Phase 3 data
        if (Array.isArray(extractedData.states) && extractedData.states.length > 0) {
          dataUpdate.states = (extractedData.states as Array<Record<string, unknown>>).map((s) => ({
            id: uuidv4(),
            entity: String(s.entity || ''),
            name: String(s.name || ''),
            transitions: Array.isArray(s.transitions)
              ? (s.transitions as Array<Record<string, string>>).map((t) => ({
                  from: t.from || '',
                  to: t.to || '',
                  trigger: t.trigger || '',
                  action: t.action || '',
                }))
              : [],
          }));
        }

        // Phase 4 data
        if (Array.isArray(extractedData.entities) && extractedData.entities.length > 0) {
          dataUpdate.entities = (extractedData.entities as Array<Record<string, unknown>>).map((e) => ({
            id: uuidv4(),
            name: String(e.name || ''),
            fields: Array.isArray(e.fields)
              ? (e.fields as Array<Record<string, unknown>>).map((f) => ({
                  name: String(f.name || ''),
                  type: String(f.type || 'String'),
                  isPrimaryKey: Boolean(f.isPrimaryKey),
                  isForeignKey: Boolean(f.isForeignKey),
                  isRequired: f.isRequired !== false,
                }))
              : [],
            relations: Array.isArray(e.relations)
              ? (e.relations as Array<Record<string, string>>).map((r) => ({
                  targetEntity: r.targetEntity || '',
                  type: (r.type as '1-1' | '1-N' | 'N-M') || '1-N',
                  label: r.label || '',
                }))
              : [],
          }));
        }

        // Phase 5 data
        if (Array.isArray(extractedData.endpoints) && extractedData.endpoints.length > 0) {
          dataUpdate.endpoints = (extractedData.endpoints as Array<Record<string, string>>).map((ep) => ({
            id: uuidv4(),
            method: (ep.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE') || 'GET',
            path: ep.path || '',
            description: ep.description || '',
            requestBody: ep.requestBody,
            responseBody: ep.responseBody,
            relatedEntity: ep.relatedEntity || '',
            relatedTransition: ep.relatedTransition,
          }));
        }

        if (Object.keys(dataUpdate).length > 0) {
          get().updateProjectData(dataUpdate);

          // Auto-regenerate the current phase diagram with new data
          const updatedProjectData = get().projectData;
          const existingPhaseDiagrams = get().diagrams.filter(
            (d) => d.phase === currentPhase && !d.isSubDiagram
          );
          // Only auto-generate if we don't have a phase diagram yet
          // (AI-generated mermaid diagrams are separate)
          if (existingPhaseDiagrams.length === 0) {
            const diagram = generateDiagramForPhase(currentPhase, updatedProjectData, get().diagrams);
            if (diagram) {
              set((state) => ({
                diagrams: [...state.diagrams, diagram],
                activeDiagramId: diagram.id,
                breadcrumbs: [{ diagramId: diagram.id, label: diagram.title }],
              }));
            }
          }
        }
      }

      // Remove json-extract from visible message
      const visibleResponse = removeJsonExtract(response);

      // Extract mermaid diagrams from AI response
      const mermaidCodes = extractMermaidFromText(visibleResponse);
      if (mermaidCodes.length > 0) {
        mermaidCodes.forEach((code) => {
          const detectedType = detectDiagramType(code);

          const diagram: Diagram = {
            id: uuidv4(),
            title: `${DIAGRAM_TYPE_LABELS[detectedType]} - Fase ${currentPhase}`,
            type: detectedType,
            mermaidCode: code,
            phase: currentPhase,
            nodes: [],
            isSubDiagram: false,
          };
          set((state) => ({
            diagrams: [...state.diagrams, diagram],
            activeDiagramId: diagram.id,
          }));
        });
      }

      get().addMessage(visibleResponse, 'assistant');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      get().addMessage(`⚠️ Error: ${errorMsg}. Cambiando a modo local.`, 'assistant');
      set({ aiMode: 'local' });
      const localResponse = generateLocalResponse(
        get().messages,
        get().projectData,
        currentPhase
      );
      get().addMessage(localResponse, 'assistant');
    } finally {
      set({ isAITyping: false });
    }
  },

  generatePhaseDiagram: () => {
    const { currentPhase, projectData, diagrams } = get();
    const diagram = generateDiagramForPhase(currentPhase, projectData, diagrams);
    if (diagram) {
      set((state) => ({
        diagrams: [...state.diagrams, diagram],
        activeDiagramId: diagram.id,
        breadcrumbs: [{ diagramId: diagram.id, label: diagram.title }],
      }));
    }
  },

  setActiveDiagram: (id) => {
    const diagram = get().diagrams.find((d) => d.id === id);
    if (diagram) {
      set({
        activeDiagramId: id,
        breadcrumbs: [{ diagramId: id, label: diagram.title }],
      });
    }
  },

  navigateToSubDiagram: (node, targetType) => {
    const { activeDiagramId, diagrams, projectData, breadcrumbs } = get();
    const parentDiagram = diagrams.find((d) => d.id === activeDiagramId);
    if (!parentDiagram) return;

    const subDiagram = generateSubDiagram(node, parentDiagram, projectData, targetType);
    subDiagram.parentId = activeDiagramId ?? undefined;

    set((state) => ({
      diagrams: [...state.diagrams, subDiagram],
      activeDiagramId: subDiagram.id,
      breadcrumbs: [
        ...breadcrumbs,
        { diagramId: subDiagram.id, label: subDiagram.title },
      ],
    }));
  },

  navigateBreadcrumb: (index) => {
    const { breadcrumbs } = get();
    if (index < breadcrumbs.length) {
      const target = breadcrumbs[index];
      set({
        activeDiagramId: target.diagramId,
        breadcrumbs: breadcrumbs.slice(0, index + 1),
      });
    }
  },

  updateProjectData: (data) => {
    set((state) => ({
      projectData: { ...state.projectData, ...data },
    }));
  },

  setAIMode: (mode) => set({ aiMode: mode }),
  setGeminiApiKey: (key) => set({ geminiApiKey: key }),
  toggleCode: () => set((state) => ({ showCode: !state.showCode })),
  setActivePanel: (panel) => set({ activePanel: panel }),

  updateDiagramCode: (diagramId, code) => {
    set((state) => ({
      diagrams: state.diagrams.map((d) =>
        d.id === diagramId ? { ...d, mermaidCode: code } : d
      ),
    }));
  },

  initializePhase: () => {
    const { currentPhase } = get();
    const initialMsg = getInitialMessage(currentPhase);
    get().addMessage(initialMsg, 'assistant');
  },
}));
