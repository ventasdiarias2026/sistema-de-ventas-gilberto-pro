export type UserRole = 'ADMIN' | 'ASESOR';

export interface User {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: UserRole;
  createdAt: string;
}

export type SaleType =
  | 'Portabilidad'
  | 'Alta'
  | 'Renovación'
  | 'CyC'
  | 'Mica'
  | 'Accesorios'
  | 'Prepago';

export type DonorOperator = 'Movistar' | 'Entel' | 'Bitel' | '';

export interface Sale {
  id: string;
  advisorId: string;
  advisorName: string;
  clientName: string;
  clientDni: string;
  clientPhone: string;
  saleType: SaleType;
  quantity?: number; // Cantidad de unidades/operaciones (por defecto 1)
  monthlyFee: number; // Cargo fijo (0 si no aplica)
  donorOperator?: DonorOperator; // Obligatorio para Portabilidad
  commission: number; // S/ calculado automáticamente (unitaria o multiplicada por cantidad)
  date: string; // YYYY-MM-DD editable
  notes?: string;
  createdAt: string;
  linkedRenewalFromId?: string; // Si fue originada de una alerta de renovación
}



export interface CommercialGoalConfig {
  type: SaleType;
  label: string;
  target: number;
  description: string;
  icon: string;
}

export const COMMERCIAL_GOALS_CONFIG: CommercialGoalConfig[] = [
  {
    type: 'Alta',
    label: 'Altas',
    target: 22,
    description: 'Nuevas líneas postpago',
    icon: 'Sparkles',
  },
  {
    type: 'Portabilidad',
    label: 'Portabilidades',
    target: 22,
    description: 'Migraciones de operador',
    icon: 'ArrowLeftRight',
  },
  {
    type: 'Renovación',
    label: 'Renovaciones',
    target: 30,
    description: 'Equipos y planes vigentes',
    icon: 'RefreshCw',
  },
  {
    type: 'Prepago',
    label: 'Prepagos',
    target: 100,
    description: 'Chips prepago activados',
    icon: 'Smartphone',
  },

  {
    type: 'CyC',
    label: 'CyC (Cuotas y Cargo)',
    target: 7,
    description: 'Ventas financiadas',
    icon: 'CreditCard',
  },
];

export const VALID_MONTHLY_FEES = [
  29.9,
  39.9,
  49.9,
  54.9,
  69.9,
  70,
  79.9,
  89,
  89.9,
  95.9,
  99,
  109.9,
  170,
] as const;

export const DONOR_OPERATORS: DonorOperator[] = ['Movistar', 'Entel', 'Bitel'];

export interface FilterState {
  searchQuery: string;
  saleType: string; // 'ALL' o tipo específico
  timeRange: 'all' | 'today' | 'this_week' | 'this_month' | 'last_month';
  advisorFilter: string; // 'ALL' o advisorId
}

export interface RenewalLead {
  sale: Sale;
  daysPassed: number;
  monthsPassed: number;
  remainingDays: number;
  isEligible: boolean; // >= 180 días
}
