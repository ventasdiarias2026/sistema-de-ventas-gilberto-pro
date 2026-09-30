import { User, Sale, SaleType, DonorOperator } from '../types/telecom';

const USERS_STORAGE_KEY = 'GILBERTO_PRO_USERS_V1';
const SALES_STORAGE_KEY = 'GILBERTO_PRO_SALES_V1';
const SESSION_STORAGE_KEY = 'GILBERTO_PRO_SESSION_V1';

export const ADMIN_USER: User = {
  id: 'user_admin_gilberto',
  username: 'Gilberto',
  name: 'Gilberto',
  password: '0903',
  role: 'ADMIN',
  createdAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_USERS: User[] = [
  ADMIN_USER,
  {
    id: 'user_carlos_mendoza',
    username: 'carlos',
    name: 'Carlos Mendoza',
    password: '123',
    role: 'ASESOR',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'user_andrea_ramos',
    username: 'andrea',
    name: 'Andrea Ramos',
    password: '123',
    role: 'ASESOR',
    createdAt: '2026-02-01T12:00:00.000Z',
  },
];

export function calculateCommission(
  saleType: SaleType,
  monthlyFee: number,
  quantity = 1
): number {
  const qty = Math.max(1, quantity || 1);
  let unitCommission = 0;

  switch (saleType) {
    case 'Portabilidad':
      // 10% del Cargo Fijo mensual
      unitCommission = Number(((monthlyFee || 0) * 0.1).toFixed(2));
      break;
    case 'Alta':
      unitCommission = 0.0;
      break;
    case 'Renovación':
      unitCommission = 0.0;
      break;
    case 'CyC':
      unitCommission = 30.0;
      break;
    case 'Mica':
      unitCommission = 5.0;
      break;
    case 'Accesorios':
      unitCommission = 10.0;
      break;
    case 'Prepago':
      unitCommission = 1.0;
      break;
    default:
      unitCommission = 0.0;
  }

  return Number((unitCommission * qty).toFixed(2));
}


// Generate dates helper
function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const DEFAULT_SALES: Sale[] = [
  // 6+ months ago (Eligible for renewal alerts! 185 - 220 days ago)
  {
    id: 'sale_hist_01',
    advisorId: 'user_admin_gilberto',
    advisorName: 'Gilberto',
    clientName: 'Roberto Carlos Quispe',
    clientDni: '45892134',
    clientPhone: '984512301',
    saleType: 'Portabilidad',
    monthlyFee: 69.9,
    donorOperator: 'Movistar',
    commission: 6.99,
    date: getPastDate(195), // ~6.4 months ago
    notes: 'Cliente empresarial portado desde Movistar. Apto para recambio.',
    createdAt: new Date(Date.now() - 195 * 86400000).toISOString(),
  },
  {
    id: 'sale_hist_02',
    advisorId: 'user_carlos_mendoza',
    advisorName: 'Carlos Mendoza',
    clientName: 'María Elena Flores',
    clientDni: '72349012',
    clientPhone: '971204958',
    saleType: 'Alta',
    monthlyFee: 54.9,
    commission: 0,
    date: getPastDate(188), // ~6.2 months ago
    notes: 'Línea nueva para su hijo universitario.',
    createdAt: new Date(Date.now() - 188 * 86400000).toISOString(),
  },
  {
    id: 'sale_hist_03',
    advisorId: 'user_andrea_ramos',
    advisorName: 'Andrea Ramos',
    clientName: 'Jorge Luis Huamán',
    clientDni: '41982341',
    clientPhone: '992384712',
    saleType: 'Portabilidad',
    monthlyFee: 89.9,
    donorOperator: 'Entel',
    commission: 8.99,
    date: getPastDate(210), // ~7 months ago
    notes: 'Interesado en Galaxy S series para renovación.',
    createdAt: new Date(Date.now() - 210 * 86400000).toISOString(),
  },
  {
    id: 'sale_hist_04',
    advisorId: 'user_admin_gilberto',
    advisorName: 'Gilberto',
    clientName: 'Lucía Valenzuela Paz',
    clientDni: '48392019',
    clientPhone: '963214875',
    saleType: 'Alta',
    monthlyFee: 79.9,
    commission: 0,
    date: getPastDate(202), // ~6.6 months ago
    notes: 'Plan max ilimitado.',
    createdAt: new Date(Date.now() - 202 * 86400000).toISOString(),
  },

  // Recent sales (Current period)
  {
    id: 'sale_rec_01',
    advisorId: 'user_admin_gilberto',
    advisorName: 'Gilberto',
    clientName: 'Fernando Morales Ruiz',
    clientDni: '44521098',
    clientPhone: '987654321',
    saleType: 'Portabilidad',
    monthlyFee: 69.9,
    donorOperator: 'Bitel',
    commission: 6.99,
    date: getPastDate(1),
    notes: 'Portabilidad con chip express',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'sale_rec_02',
    advisorId: 'user_admin_gilberto',
    advisorName: 'Gilberto',
    clientName: 'Claudia Salazar Soto',
    clientDni: '70213459',
    clientPhone: '951234876',
    saleType: 'Alta',
    monthlyFee: 49.9,
    commission: 0,
    date: getPastDate(2),
    notes: 'Alta nueva tienda física',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'sale_rec_03',
    advisorId: 'user_admin_gilberto',
    advisorName: 'Gilberto',
    clientName: 'Gonzalo Silva Vera',
    clientDni: '42318765',
    clientPhone: '942189034',
    saleType: 'CyC',
    monthlyFee: 0,
    commission: 30.0,
    date: getPastDate(2),
    notes: 'Financiamiento 12 cuotas',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'sale_rec_04',
    advisorId: 'user_carlos_mendoza',
    advisorName: 'Carlos Mendoza',
    clientName: 'Patricia Benavides Luján',
    clientDni: '75432109',
    clientPhone: '978456123',
    saleType: 'Renovación',
    monthlyFee: 69.9,
    commission: 0,
    date: getPastDate(3),
    notes: 'Renovación de terminal Xiaomi',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sale_rec_05',
    advisorId: 'user_carlos_mendoza',
    advisorName: 'Carlos Mendoza',
    clientName: 'Daniel Romero Castro',
    clientDni: '43981276',
    clientPhone: '965412890',
    saleType: 'Prepago',
    monthlyFee: 0,
    commission: 1.0,
    date: getPastDate(3),
    notes: 'Combo prepago súper recarga',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'sale_rec_06',
    advisorId: 'user_andrea_ramos',
    advisorName: 'Andrea Ramos',
    clientName: 'Sonia Gutiérrez Medina',
    clientDni: '46890123',
    clientPhone: '934567890',
    saleType: 'Portabilidad',
    monthlyFee: 89.9,
    donorOperator: 'Movistar',
    commission: 8.99,
    date: getPastDate(4),
    notes: 'Portabilidad premium ilimitada',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'sale_rec_07',
    advisorId: 'user_andrea_ramos',
    advisorName: 'Andrea Ramos',
    clientName: 'Marcos Paredes Vega',
    clientDni: '71904562',
    clientPhone: '921345678',
    saleType: 'Accesorios',
    monthlyFee: 0,
    commission: 10.0,
    date: getPastDate(5),
    notes: 'Cargador inalámbrico y audífonos',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'sale_rec_08',
    advisorId: 'user_admin_gilberto',
    advisorName: 'Gilberto',
    clientName: 'Rosa Alarcón Nieto',
    clientDni: '40192837',
    clientPhone: '912345987',
    saleType: 'Mica',
    monthlyFee: 0,
    commission: 5.0,
    date: getPastDate(6),
    notes: 'Mica de hidrogel para pantalla',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
];

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const users: User[] = JSON.parse(raw);
    // Ensure Gilberto admin always exists
    const hasAdmin = users.some(
      (u) => u.username.toLowerCase() === 'gilberto'
    );
    if (!hasAdmin) {
      users.unshift(ADMIN_USER);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    return users;
  } catch (err) {
    console.error('Failed reading users from localStorage', err);
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed saving users to localStorage', err);
  }
}

export function getStoredSales(): Sale[] {
  try {
    const raw = localStorage.getItem(SALES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(DEFAULT_SALES));
      return DEFAULT_SALES.map((s) => ({ ...s, quantity: s.quantity || 1 }));
    }
    const parsed: Sale[] = JSON.parse(raw);
    return parsed.map((s) => ({ ...s, quantity: s.quantity || 1 }));
  } catch (err) {
    console.error('Failed reading sales from localStorage', err);
    return DEFAULT_SALES.map((s) => ({ ...s, quantity: s.quantity || 1 }));
  }
}


export function saveStoredSales(sales: Sale[]): void {
  try {
    localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
  } catch (err) {
    console.error('Failed saving sales to localStorage', err);
  }
}

export function getStoredSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      // By default start logged in as Gilberto for immediate convenience,
      // but user can easily log out or switch advisor!
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(ADMIN_USER));
      return ADMIN_USER;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading session from localStorage', err);
    return ADMIN_USER;
  }
}

export function saveStoredSession(user: User | null): void {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Failed saving session to localStorage', err);
  }
}
