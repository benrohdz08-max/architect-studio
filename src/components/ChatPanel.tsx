import { useState, useRef, useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export function ChatPanel() {
  const {
    messages,
    isAITyping,
    currentPhase,
    sendUserMessage,
    advancePhase,
    generatePhaseDiagram,
  } = useProjectStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const phaseMessages = messages.filter((m) => m.phase === currentPhase);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAITyping) return;
    const msg = input.trim();
    setInput('');
    await sendUserMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  const handleBoosterClick = (option: string) => {
    if (!isAITyping) {
      setInput('');
      void sendUserMessage(option);
    }
  };

  const formatMessage = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    const boosterOptions: { label: string; text: string }[] = [];
    let inCodeBlock = false;
    let codeBlockType = '';
    let codeLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track code blocks
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockType = line.slice(3).trim();
          codeLines = [];
          // Hide mermaid and mermaid-meta blocks
          if (codeBlockType === 'mermaid' || codeBlockType === 'mermaid-meta') continue;
          continue;
        } else {
          // Closing code block
          if (codeBlockType === 'mermaid' || codeBlockType === 'mermaid-meta') {
            inCodeBlock = false;
            codeBlockType = '';
            continue;
          }
          // Render json-checkpoint with copy button
          if (codeBlockType === 'json-checkpoint') {
            const checkpointContent = codeLines.join('\n');
            elements.push(
              <div key={`checkpoint-${i}`} className="my-2 rounded-lg border border-emerald-700/40 bg-emerald-950/30 overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-900/30 border-b border-emerald-700/30">
                  <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Checkpoint de Fase</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(checkpointContent)}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-800/50 text-emerald-300 hover:bg-emerald-700/50 transition-colors"
                  >
                    Copiar estado
                  </button>
                </div>
                <pre className="px-3 py-2 text-xs text-emerald-200 overflow-x-auto font-mono">{checkpointContent}</pre>
              </div>
            );
            inCodeBlock = false;
            codeBlockType = '';
            continue;
          }
          // Render other code blocks
          elements.push(
            <pre key={`code-${i}`} className="my-2 rounded-lg bg-gray-900 border border-gray-700/50 px-3 py-2 text-xs text-gray-300 overflow-x-auto font-mono">
              {codeLines.join('\n')}
            </pre>
          );
          inCodeBlock = false;
          codeBlockType = '';
          continue;
        }
      }

      if (inCodeBlock) {
        if (codeBlockType === 'mermaid' || codeBlockType === 'mermaid-meta') continue;
        codeLines.push(line);
        continue;
      }

      // Detect booster options: [A] text, [B] text, [C] text
      const boosterMatch = line.match(/^\[([A-C])\]\s*(.+)$/);
      if (boosterMatch) {
        boosterOptions.push({ label: boosterMatch[1], text: boosterMatch[2] });
        continue;
      }

      // Render line with bold formatting using React elements (no dangerouslySetInnerHTML)
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const lineElements = parts.map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="text-white font-semibold">{part}</strong>
        ) : (
          <span key={j}>{part}</span>
        )
      );

      elements.push(
        <p key={i} className={`${line === '' ? 'h-2' : ''}`}>
          {lineElements}
        </p>
      );
    }

    // Render booster options as clickable buttons at the end
    if (boosterOptions.length > 0) {
      elements.push(
        <div key="boosters" className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-gray-700/30">
          {boosterOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleBoosterClick(opt.text)}
              className="text-left text-xs px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-700/30 text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 hover:border-indigo-600/40 transition-all group"
            >
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-indigo-800/60 text-[10px] font-bold text-indigo-200 mr-2 group-hover:bg-indigo-700/60">
                {opt.label}
              </span>
              {opt.text}
            </button>
          ))}
        </div>
      );
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {phaseMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-800 text-gray-200 rounded-bl-sm border border-gray-700/50'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Architect Mentor
                </div>
              )}
              <div className="space-y-1">{formatMessage(msg.content)}</div>
            </div>
          </div>
        ))}

        {isAITyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-xl px-4 py-3 rounded-bl-sm border border-gray-700/50">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-1.5 font-medium uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Architect Mentor
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 px-4 py-2 border-t border-gray-800/50">
        <button
          onClick={generatePhaseDiagram}
          className="text-[11px] px-3 py-1.5 rounded-full bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors border border-gray-700/50"
        >
          📊 Generar diagrama
        </button>
        <button
          onClick={advancePhase}
          className="text-[11px] px-3 py-1.5 rounded-full bg-indigo-900/50 text-indigo-400 hover:bg-indigo-800/50 hover:text-indigo-200 transition-colors border border-indigo-700/30"
        >
          ⏭️ Siguiente fase
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-gray-800">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe tu idea, responde preguntas..."
            className="flex-1 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[44px] max-h-[120px]"
            rows={1}
            disabled={isAITyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isAITyping}
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
