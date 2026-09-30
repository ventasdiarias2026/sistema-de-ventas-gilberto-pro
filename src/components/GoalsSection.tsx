import React from 'react';
import { GoalStatus } from '../utils/goals';
import {
  Sparkles,
  ArrowLeftRight,
  RefreshCw,
  Smartphone,
  CreditCard,
  Trophy,
  DollarSign,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface GoalsSectionProps {
  goalStatuses: GoalStatus[];
  totalCommissions: number;
  totalSales: number;
  advisorName?: string;
  isGlobalView?: boolean;
}

const ICONS_MAP: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  ArrowLeftRight: <ArrowLeftRight className="w-4 h-4" />,
  RefreshCw: <RefreshCw className="w-4 h-4" />,
  Smartphone: <Smartphone className="w-4 h-4" />,
  CreditCard: <CreditCard className="w-4 h-4" />,
};


export const GoalsSection: React.FC<GoalsSectionProps> = ({
  goalStatuses,
  totalCommissions,
  totalSales,
  advisorName,
  isGlobalView,
}) => {
  return (
    <div className="space-y-4">
      {/* Title & Commission Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Metas Comerciales del Periodo</span>
            <span className="text-xs font-normal text-slate-400 normal-case">
              ({isGlobalView ? 'Visión Global del Equipo' : `Asesor: ${advisorName || 'Privado'}`})
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitoreo en tiempo real con transición cromática: Rojo (0-39%), Naranja (40-69%), Azul (70-99%) y Verde Esmeralda (100%+)
          </p>
        </div>

        {/* Quick Commission Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Comisiones Acumuladas</div>
              <div className="text-sm font-bold text-emerald-400 font-mono tabular-nums">
                S/ {totalCommissions.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Total Ventas</div>
              <div className="text-sm font-bold text-cyan-300 font-mono tabular-nums">
                {totalSales} <span className="text-[11px] font-normal text-slate-400">ops</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of the 5 Exact Commercial Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {goalStatuses.map((goal) => {
          const clampedPercent = Math.min(goal.percentage, 100);
          const isCompleted = goal.isCompleted;

          return (
            <div
              key={goal.type}
              className={`relative rounded-xl border p-3.5 transition-all duration-300 flex flex-col justify-between ${goal.cardBg} ${goal.borderColor}`}
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/30 text-emerald-300'
                          : goal.colorStage === 'blue'
                          ? 'bg-sky-500/20 text-sky-300'
                          : goal.colorStage === 'orange'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {ICONS_MAP[goal.icon] || <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-slate-100 truncate">
                        {goal.label}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate">
                        Meta: <span className="font-mono font-semibold text-slate-200">{goal.target}</span> ops
                      </p>
                    </div>
                  </div>

                  {/* Stage Badge */}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500 text-slate-950 font-black animate-pulse'
                        : goal.colorStage === 'blue'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        : goal.colorStage === 'orange'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {goal.badgeLabel}
                  </span>
                </div>

                {/* Counter & Percentage */}
                <div className="mt-2.5 flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-white font-mono tabular-nums">
                    {goal.current}
                    <span className="text-xs font-medium text-slate-400">/{goal.target}</span>
                  </div>
                  <div className={`text-sm font-bold font-mono tabular-nums ${goal.textColor}`}>
                    {goal.percentage}%
                  </div>
                </div>
              </div>

              {/* Progress Bar with dynamic color transition */}
              <div className="mt-3">
                <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${goal.barColor} ${goal.barGlow}`}
                    style={{ width: `${clampedPercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                  <span>0</span>
                  <span>{goal.target}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
