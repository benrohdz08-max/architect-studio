import { useProjectStore } from '../store/useProjectStore';
import { MermaidRenderer } from './MermaidRenderer';
import { BreadcrumbNav } from './BreadcrumbNav';
import type { DiagramNode, DiagramType } from '../types';

export function DiagramPanel() {
  const {
    diagrams,
    activeDiagramId,
    currentPhase,
    setActiveDiagram,
    navigateToSubDiagram,
  } = useProjectStore();

  const activeDiagram = diagrams.find((d) => d.id === activeDiagramId);
  const phaseDiagrams = diagrams.filter((d) => d.phase === currentPhase && !d.isSubDiagram);
  const allDiagramsByPhase = diagrams.filter((d) => !d.isSubDiagram);

  const handleNodeClick = (node: DiagramNode, targetType: DiagramType) => {
    navigateToSubDiagram(node, targetType);
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <BreadcrumbNav />

      {/* Diagram selector tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-800/50 overflow-x-auto">
        {allDiagramsByPhase.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDiagram(d.id)}
            className={`shrink-0 text-[11px] px-3 py-1.5 rounded-md transition-colors ${
              d.id === activeDiagramId
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            F{d.phase}: {d.title.length > 25 ? d.title.slice(0, 25) + '…' : d.title}
          </button>
        ))}
        {phaseDiagrams.length === 0 && (
          <span className="text-[11px] text-gray-600 px-2 py-1.5">
            Sin diagramas en esta fase
          </span>
        )}
      </div>

      {/* Diagram content */}
      <div className="flex-1 overflow-auto p-4">
        {activeDiagram ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200">
                {activeDiagram.title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700/50">
                {activeDiagram.type}
              </span>
            </div>

            <MermaidRenderer
              code={activeDiagram.mermaidCode}
              diagramId={activeDiagram.id}
              nodes={activeDiagram.nodes}
              onNodeClick={handleNodeClick}
            />

            {/* Clickable nodes legend */}
            {activeDiagram.nodes.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">
                  Elementos interactivos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {activeDiagram.nodes
                    .filter((n) => n.type !== 'process' || n.childDiagramId)
                    .map((node) => {
                      const typeIcons: Record<string, string> = {
                        database: '🗄️',
                        entity: '📦',
                        state: '⚙️',
                        endpoint: '🔗',
                        actor: '👤',
                        process: '📋',
                        decision: '❓',
                      };
                      return (
                        <button
                          key={node.id}
                          onClick={() => {
                            const targetType: DiagramType =
                              node.type === 'database'
                                ? 'er'
                                : node.type === 'state'
                                  ? 'stateDiagram'
                                  : node.type === 'endpoint'
                                    ? 'sequence'
                                    : 'flowchart';
                            handleNodeClick(node, targetType);
                          }}
                          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg bg-gray-800/60 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700/40"
                        >
                          <span>{typeIcons[node.type] ?? '📋'}</span>
                          <span>{node.label}</span>
                          <span className="text-gray-600">→</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-2xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-4">
              <span className="text-3xl opacity-50">📊</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">Sin diagramas aún</p>
            <p className="text-gray-600 text-xs mt-1">
              Responde las preguntas del mentor para generar tu primer diagrama
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
