import { useProjectStore } from '../store/useProjectStore';
import { PHASES } from '../phases/phaseConfig';

export function DiagramListSidebar() {
  const { diagrams, activeDiagramId, setActiveDiagram } = useProjectStore();

  const mainDiagrams = diagrams.filter((d) => !d.isSubDiagram);
  const grouped = PHASES.map((phase) => ({
    phase,
    diagrams: mainDiagrams.filter((d) => d.phase === phase.id),
  })).filter((g) => g.diagrams.length > 0);

  if (grouped.length === 0) return null;

  return (
    <div className="border-r border-gray-800 bg-gray-950 w-52 shrink-0 overflow-y-auto hidden xl:block">
      <div className="px-3 py-3">
        <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
          Diagramas
        </h3>
        {grouped.map(({ phase, diagrams: pDiagrams }) => (
          <div key={phase.id} className="mb-3">
            <p className="text-[10px] text-gray-600 font-medium mb-1 flex items-center gap-1">
              <span>{phase.icon}</span>
              <span>Fase {phase.id}</span>
            </p>
            {pDiagrams.map((d) => (
              <button
                key={d.id}
                onClick={() => setActiveDiagram(d.id)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] transition-colors mb-0.5 ${
                  d.id === activeDiagramId
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-700/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
              >
                <span className="truncate block">{d.title}</span>
                <span className="text-[9px] text-gray-600">{d.type}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
