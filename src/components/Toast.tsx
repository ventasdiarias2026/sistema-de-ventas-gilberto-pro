import React from 'react';
import { Trophy, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'celebration' | 'success' | 'info' | 'error';
  title: string;
  description?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isCelebration = toast.type === 'celebration';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-xl p-4 shadow-2xl border transition-all animate-bounce-short flex items-start gap-3 ${
              isCelebration
                ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 border-emerald-400 text-white ring-2 ring-emerald-400/40 shadow-emerald-950/60'
                : toast.type === 'success'
                ? 'bg-slate-900 border-emerald-500/50 text-white'
                : toast.type === 'error'
                ? 'bg-slate-900 border-rose-500/50 text-white'
                : 'bg-slate-900 border-cyan-500/50 text-white'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isCelebration
                  ? 'bg-amber-400 text-slate-950 animate-pulse font-black'
                  : toast.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : toast.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isCelebration ? (
                <Trophy className="w-5 h-5" />
              ) : toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5
                className={`text-xs font-bold ${
                  isCelebration ? 'text-amber-300' : 'text-white'
                }`}
              >
                {toast.title}
              </h5>
              {toast.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
