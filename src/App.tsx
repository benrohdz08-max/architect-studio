import { useState, useEffect } from 'react';
import { useProjectStore } from './store/useProjectStore';
import { PhaseProgressBar } from './components/PhaseProgressBar';
import { PhaseTips } from './components/PhaseTips';
import { ChatPanel } from './components/ChatPanel';
import { DiagramPanel } from './components/DiagramPanel';
import { CodePanel } from './components/CodePanel';
import { DiagramListSidebar } from './components/DiagramListSidebar';
import { SettingsModal } from './components/SettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';

type PanelView = 'chat' | 'diagram' | 'code';

export default function App() {
  const { initializePhase, messages, aiMode, showCode, toggleCode } = useProjectStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<PanelView>('chat');

  useEffect(() => {
    if (messages.length === 0) {
      initializePhase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
            A
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Architect Studio</h1>
            <p className="text-[10px] text-gray-500">Pipeline de Conceptualización</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700/50 hidden sm:inline-block">
            {aiMode === 'gemini' ? '🤖 Gemini' : '📋 Local'}
          </span>
          <button
            onClick={toggleCode}
            className={`text-[11px] px-2.5 py-1.5 rounded-lg transition-colors hidden md:block ${
              showCode
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700/50'
            }`}
          >
            {'</>'}  Código
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700/50"
          >
            ⚙ Config
          </button>
        </div>
      </header>

      {/* Phase Progress */}
      <PhaseProgressBar />

      {/* Phase Tips */}
      <PhaseTips />

      {/* Mobile Panel Switcher */}
      <div className="flex md:hidden border-b border-gray-800">
        {(['chat', 'diagram', 'code'] as PanelView[]).map((panel) => (
          <button
            key={panel}
            onClick={() => setMobilePanel(panel)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              mobilePanel === panel
                ? 'text-indigo-400 border-b-2 border-indigo-400 bg-gray-900/50'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {panel === 'chat' ? '💬 Chat' : panel === 'diagram' ? '📊 Diagramas' : '</> Código'}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex flex-1 overflow-hidden">
        {/* Diagram List (large screens) */}
        <DiagramListSidebar />

        {/* Desktop: Split panels */}
        <div className="hidden md:flex flex-1 overflow-hidden">
          {/* Chat Panel */}
          <div className="flex-1 min-w-0 border-r border-gray-800">
            <ErrorBoundary fallbackMessage="Error en el chat">
              <ChatPanel />
            </ErrorBoundary>
          </div>

          {/* Diagram Panel */}
          <div className={`${showCode ? 'flex-1' : 'flex-[1.3]'} min-w-0 ${showCode ? 'border-r border-gray-800' : ''}`}>
            <ErrorBoundary fallbackMessage="Error en el diagrama">
              <DiagramPanel />
            </ErrorBoundary>
          </div>

          {/* Code Panel (toggle) */}
          {showCode && (
            <div className="flex-1 min-w-0">
              <ErrorBoundary fallbackMessage="Error en el editor">
                <CodePanel />
              </ErrorBoundary>
            </div>
          )}
        </div>

        {/* Mobile: Single panel */}
        <div className="flex md:hidden flex-1 overflow-hidden">
          <ErrorBoundary fallbackMessage="Error en el panel">
            {mobilePanel === 'chat' && <ChatPanel />}
            {mobilePanel === 'diagram' && <DiagramPanel />}
            {mobilePanel === 'code' && <CodePanel />}
          </ErrorBoundary>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
