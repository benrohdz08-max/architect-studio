import { useState, useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '../store/useProjectStore';

const FOCUSABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { aiMode, geminiApiKey, setAIMode, setGeminiApiKey } = useProjectStore();
  const [localKey, setLocalKey] = useState(geminiApiKey);
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const stableOnClose = useCallback(() => onClose(), [onClose]);

  // Focus trap and Escape key
  useEffect(() => {
    if (!open) return;

    // Remember which element triggered the modal for focus restoration
    triggerRef.current = document.activeElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stableOnClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus first focusable element
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to trigger element
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
    };
  }, [open, stableOnClose]);

  if (!open) return null;

  const handleSave = () => {
    setGeminiApiKey(localKey);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md mx-4 shadow-2xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 id="settings-title" className="text-sm font-semibold text-white">Configuración</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors text-lg"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* AI Mode */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Motor de IA
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAIMode('local')}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  aiMode === 'local'
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold">Modo Local</p>
                  <p className="text-[10px] opacity-70 mt-0.5">Guía estructurada sin API</p>
                </div>
              </button>
              <button
                onClick={() => setAIMode('gemini')}
                className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  aiMode === 'gemini'
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <div className="text-left">
                  <p className="font-semibold">Gemini 2.5 Flash</p>
                  <p className="text-[10px] opacity-70 mt-0.5">IA Socrática avanzada</p>
                </div>
              </button>
            </div>
          </div>

          {/* API Key */}
          {aiMode === 'gemini' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Gemini API Key
              </label>
              <input
                type="password"
                value={localKey}
                onChange={(e) => setLocalKey(e.target.value)}
                placeholder="AIza..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-gray-500">
                Obtén tu key en{' '}
                <span className="text-indigo-400">aistudio.google.com</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
