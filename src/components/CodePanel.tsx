import { useState, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export function CodePanel() {
  const { diagrams, activeDiagramId, updateDiagramCode } = useProjectStore();
  const activeDiagram = diagrams.find((d) => d.id === activeDiagramId);
  const [editableCode, setEditableCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (activeDiagram) {
      setEditableCode(activeDiagram.mermaidCode);
    }
  }, [activeDiagram]);

  const handleSave = () => {
    if (activeDiagramId && editableCode.trim()) {
      updateDiagramCode(activeDiagramId, editableCode);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeDiagram) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 text-sm">
        Selecciona un diagrama para ver su código Mermaid
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-500">mermaid</span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-400 truncate max-w-[200px]">
            {activeDiagram.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="text-[11px] px-2.5 py-1 rounded-md bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            {copied ? '✓ Copiado' : '📋 Copiar'}
          </button>
          <button
            onClick={handleSave}
            className="text-[11px] px-2.5 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            💾 Aplicar
          </button>
        </div>
      </div>

      {/* Code editor */}
      <div className="flex-1 relative">
        <textarea
          value={editableCode}
          onChange={(e) => setEditableCode(e.target.value)}
          className="w-full h-full bg-gray-900/50 text-gray-200 font-mono text-xs leading-6 p-4 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30 border-none"
          spellCheck={false}
        />

        {/* Line numbers overlay */}
        <div className="absolute top-0 left-0 p-4 pointer-events-none select-none">
          {editableCode.split('\n').map((_, i) => (
            <div key={i} className="text-xs leading-6 text-gray-700 font-mono text-right pr-4" style={{ width: '2.5rem' }}>
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-800 text-[10px] text-gray-600">
        <span>{editableCode.split('\n').length} líneas</span>
        <span>Tipo: {activeDiagram.type}</span>
        <span>Fase {activeDiagram.phase}</span>
      </div>
    </div>
  );
}
