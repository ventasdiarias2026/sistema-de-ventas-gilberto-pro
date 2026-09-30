import React from 'react';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { RenewalLead } from '../types/telecom';

interface RenewalBannerProps {
  leads: RenewalLead[];
  onGoToRenewalTab: () => void;
  onDismiss?: () => void;
  isDismissed?: boolean;
}

export const RenewalBanner: React.FC<RenewalBannerProps> = ({
  leads,
  onGoToRenewalTab,
  onDismiss,
  isDismissed,
}) => {
  if (leads.length === 0 || isDismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-b border-amber-500/30 px-4 py-2.5 sm:px-6 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <span className="text-base" role="img" aria-label="objetivo">🎯</span>
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-amber-200 flex items-center gap-1.5 flex-wrap">
              <span>Alerta Inteligente de Renovación:</span>
              <span className="font-bold text-white bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-500/30">
                {leads.length} {leads.length === 1 ? 'cliente ha' : 'clientes han'} cumplido 6+ meses (180 días)
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              Líneas de Portabilidad y Alta listas para recambio de terminal y renovación comercial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={onGoToRenewalTab}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-200 hover:to-amber-300 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gestionar Aptos ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onDismiss && (
            <button
              onClick={onDismiss}
              title="Ocultar banner temporalmente"
              className="p-1 text-slate-400 hover:text-slate-200 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
