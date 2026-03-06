import { useEffect, useRef, useCallback, useState } from 'react';
import mermaid from 'mermaid';
import type { DiagramNode, DiagramType } from '../types';

interface MermaidRendererProps {
  code: string;
  diagramId: string;
  nodes: DiagramNode[];
  onNodeClick: (node: DiagramNode, targetType: DiagramType) => void;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0a0a0f',
    primaryColor: '#6366f1',
    primaryTextColor: '#e2e8f0',
    primaryBorderColor: '#4f46e5',
    lineColor: '#475569',
    secondaryColor: '#0ea5e9',
    tertiaryColor: '#10b981',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: '14px',
  },
  flowchart: { curve: 'basis', padding: 20 },
  er: { fontSize: 12 },
  sequence: { actorFontSize: 13, messageFontSize: 12 },
});

export function MermaidRenderer({ code, diagramId, nodes, onNodeClick }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  const renderDiagram = useCallback(async () => {
    if (!code.trim()) return;
    setError(null);

    try {
      const uniqueId = `mermaid-${diagramId}-${Date.now()}`;
      const { svg } = await mermaid.render(uniqueId, code);
      setSvgContent(svg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error renderizando diagrama';
      setError(msg);
    }
  }, [code, diagramId]);

  useEffect(() => {
    void renderDiagram();
  }, [renderDiagram]);

  // Attach click handlers to SVG nodes
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    // Make SVG responsive
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.removeAttribute('height');

    // Track listeners for cleanup
    const cleanups: Array<() => void> = [];

    // Add click handlers to matching nodes
    nodes.forEach((node) => {
      const elements = svg.querySelectorAll(`[id*="${node.id}"], .node[id*="${node.id}"]`);
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        htmlEl.style.cursor = 'pointer';
        htmlEl.classList.add('diagram-clickable');
        htmlEl.setAttribute('role', 'button');
        htmlEl.setAttribute('tabindex', '0');

        const handler = (e: Event) => {
          e.stopPropagation();
          const targetType: DiagramType =
            node.type === 'database'
              ? 'er'
              : node.type === 'state'
                ? 'stateDiagram'
                : node.type === 'endpoint'
                  ? 'sequence'
                  : 'flowchart';
          onNodeClick(node, targetType);
        };

        htmlEl.addEventListener('click', handler);
        cleanups.push(() => htmlEl.removeEventListener('click', handler));
      });
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [svgContent, nodes, onNodeClick]);

  if (error) {
    return (
      <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-lg">
        <p className="text-red-400 text-sm font-medium mb-1">Error en diagrama</p>
        <p className="text-red-300/70 text-xs font-mono">{error}</p>
        <pre className="mt-2 text-xs text-gray-400 bg-gray-900 p-3 rounded overflow-x-auto">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div
        ref={containerRef}
        className="mermaid-container overflow-auto p-4 bg-gray-900/50 rounded-lg border border-gray-800/50 min-h-[200px] flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
      {nodes.length > 0 && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/30">
            Click en elementos para explorar
          </span>
        </div>
      )}
    </div>
  );
}
