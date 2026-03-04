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

  const formatMessage = (content: string) => {
    // Simple markdown-like rendering
    return content.split('\n').map((line, i) => {
      // Bold
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
      // Mermaid code blocks - hide them in chat (shown in diagram panel)
      if (line.startsWith('```mermaid')) return null;
      if (line.startsWith('```') && i > 0) return null;

      return (
        <p
          key={i}
          className={`${line === '' ? 'h-2' : ''}`}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
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
