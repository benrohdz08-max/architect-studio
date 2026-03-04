import { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { getPhase } from '../phases/phaseConfig';

export function PhaseTips() {
  const { currentPhase } = useProjectStore();
  const phase = getPhase(currentPhase);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-gray-800 bg-gray-900/60">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-4 py-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{phase.icon}</span>
          <span className="font-semibold text-gray-300">{phase.name}</span>
          <span className="text-gray-500">— {phase.dimension}</span>
        </span>
        <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1.5">
          <p className="text-xs text-gray-400 mb-2">{phase.description}</p>
          {phase.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-amber-500 mt-0.5 shrink-0">💡</span>
              <span className="text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
