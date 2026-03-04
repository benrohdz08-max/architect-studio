import { useProjectStore } from '../store/useProjectStore';
import { PHASES } from '../phases/phaseConfig';

export function PhaseProgressBar() {
  const { currentPhase, phaseCompleted, setPhase } = useProjectStore();

  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-gray-900/80 border-b border-gray-800">
      {PHASES.map((phase, index) => {
        const isActive = currentPhase === phase.id;
        const isCompleted = phaseCompleted[phase.id];
        const isAccessible = phase.id <= currentPhase || phaseCompleted[phase.id];

        return (
          <div key={phase.id} className="flex items-center flex-1">
            <button
              onClick={() => isAccessible && setPhase(phase.id)}
              disabled={!isAccessible}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all w-full
                ${isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : isCompleted
                    ? 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-900/60 cursor-pointer'
                    : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'}
              `}
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold shrink-0
                ${isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-500/20' : 'bg-gray-700'}
              ">
                {isCompleted ? '✓' : phase.id}
              </span>
              <span className="hidden lg:inline truncate">{phase.name}</span>
            </button>
            {index < PHASES.length - 1 && (
              <div className={`w-4 h-0.5 mx-1 shrink-0 ${
                phaseCompleted[phase.id] ? 'bg-emerald-500' : 'bg-gray-700'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
