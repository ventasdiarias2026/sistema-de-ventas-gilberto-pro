import { COMMERCIAL_GOALS_CONFIG, Sale, SaleType } from '../types/telecom';

export interface GoalStatus {
  type: SaleType;
  label: string;
  description: string;
  icon: string;
  target: number;
  current: number;
  percentage: number;
  isCompleted: boolean;
  colorStage: 'red' | 'orange' | 'blue' | 'emerald';
  badgeLabel: string;
  // Tailwind styles
  cardBg: string;
  borderColor: string;
  textColor: string;
  barColor: string;
  barGlow: string;
}

export function getGoalColorConfig(percentage: number): {
  colorStage: 'red' | 'orange' | 'blue' | 'emerald';
  badgeLabel: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  barColor: string;
  barGlow: string;
} {
  if (percentage >= 100) {
    return {
      colorStage: 'emerald',
      badgeLabel: '¡LOGRADO! 🏆',
      cardBg: 'bg-emerald-950/40 hover:bg-emerald-950/60',
      borderColor: 'border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/40',
      textColor: 'text-emerald-300',
      barColor: 'bg-emerald-500',
      barGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.7)]',
    };
  } else if (percentage >= 70) {
    return {
      colorStage: 'blue',
      badgeLabel: 'Cerca de la meta',
      cardBg: 'bg-sky-950/30 hover:bg-sky-950/50',
      borderColor: 'border-sky-500/40',
      textColor: 'text-sky-300',
      barColor: 'bg-sky-500',
      barGlow: '',
    };
  } else if (percentage >= 40) {
    return {
      colorStage: 'orange',
      badgeLabel: 'En avance',
      cardBg: 'bg-amber-950/30 hover:bg-amber-950/50',
      borderColor: 'border-amber-500/40',
      textColor: 'text-amber-300',
      barColor: 'bg-amber-500',
      barGlow: '',
    };
  } else {
    return {
      colorStage: 'red',
      badgeLabel: 'Etapa inicial',
      cardBg: 'bg-rose-950/30 hover:bg-rose-950/50',
      borderColor: 'border-rose-500/40',
      textColor: 'text-rose-300',
      barColor: 'bg-rose-500',
      barGlow: '',
    };
  }
}

export function computeGoalStatuses(sales: Sale[]): GoalStatus[] {
  // Count total units by saleType (taking quantity into account)
  const counts: Record<string, number> = {};
  for (const s of sales) {
    counts[s.saleType] = (counts[s.saleType] || 0) + (s.quantity || 1);
  }

  return COMMERCIAL_GOALS_CONFIG.map((goal) => {

    const current = counts[goal.type] || 0;
    const rawPercentage = (current / goal.target) * 100;
    const percentage = Math.round(rawPercentage);
    const colors = getGoalColorConfig(percentage);

    return {
      type: goal.type,
      label: goal.label,
      description: goal.description,
      icon: goal.icon,
      target: goal.target,
      current,
      percentage,
      isCompleted: current >= goal.target,
      ...colors,
    };
  });
}
