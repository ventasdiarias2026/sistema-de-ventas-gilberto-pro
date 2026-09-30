import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Persistent database file on the server filesystem
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'gilberto_pro_db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredData {
  users: Array<{
    id: string;
    username: string;
    name: string;
    password?: string;
    role: 'ADMIN' | 'ASESOR';
    createdAt: string;
  }>;
  sales: Array<{
    id: string;
    advisorId: string;
    advisorName: string;
    clientName: string;
    clientDni: string;
    clientPhone: string;
    saleType: string;
    quantity?: number;
    monthlyFee: number;
    donorOperator?: string;
    commission: number;
    date: string;
    notes?: string;
    createdAt: string;
    linkedRenewalFromId?: string;
  }>;
}

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const INITIAL_DB: StoredData = {
  users: [
    {
      id: 'user_admin_gilberto',
      username: 'Gilberto',
      name: 'Gilberto (Administrador)',
      password: '0903',
      role: 'ADMIN',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
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
  ],
  sales: [
    {
      id: 'sale_hist_01',
      advisorId: 'user_admin_gilberto',
      advisorName: 'Gilberto (Administrador)',
      clientName: 'Roberto Carlos Quispe',
      clientDni: '45892134',
      clientPhone: '984512301',
      saleType: 'Portabilidad',
      quantity: 1,
      monthlyFee: 69.9,
      donorOperator: 'Movistar',
      commission: 6.99,
      date: getPastDate(195),
      notes: 'Cliente empresarial portado desde Movistar. Apto para renovación.',
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
      quantity: 1,
      monthlyFee: 54.9,
      commission: 0,
      date: getPastDate(188),
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
      quantity: 1,
      monthlyFee: 89.9,
      donorOperator: 'Entel',
      commission: 8.99,
      date: getPastDate(210),
      notes: 'Interesado en Galaxy S series para renovación.',
      createdAt: new Date(Date.now() - 210 * 86400000).toISOString(),
    },
    {
      id: 'sale_rec_01',
      advisorId: 'user_admin_gilberto',
      advisorName: 'Gilberto (Administrador)',
      clientName: 'Fernando Morales Ruiz',
      clientDni: '44521098',
      clientPhone: '987654321',
      saleType: 'Portabilidad',
      quantity: 1,
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
      advisorName: 'Gilberto (Administrador)',
      clientName: 'Claudia Salazar Soto',
      clientDni: '70213459',
      clientPhone: '951234876',
      saleType: 'Alta',
      quantity: 1,
      monthlyFee: 49.9,
      commission: 0,
      date: getPastDate(2),
      notes: 'Alta nueva tienda física',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'sale_rec_03',
      advisorId: 'user_carlos_mendoza',
      advisorName: 'Carlos Mendoza',
      clientName: 'Patricia Benavides Luján',
      clientDni: '75432109',
      clientPhone: '978456123',
      saleType: 'Renovación',
      quantity: 1,
      monthlyFee: 69.9,
      commission: 0,
      date: getPastDate(3),
      notes: 'Renovación de terminal Xiaomi',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'sale_rec_04',
      advisorId: 'user_carlos_mendoza',
      advisorName: 'Carlos Mendoza',
      clientName: 'Daniel Romero Castro',
      clientDni: '43981276',
      clientPhone: '965412890',
      saleType: 'Prepago',
      quantity: 5,
      monthlyFee: 0,
      commission: 5.0,
      date: getPastDate(3),
      notes: 'Lote de 5 chips prepago',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'sale_rec_05',
      advisorId: 'user_andrea_ramos',
      advisorName: 'Andrea Ramos',
      clientName: 'Sonia Gutiérrez Medina',
      clientDni: '46890123',
      clientPhone: '934567890',
      saleType: 'CyC',
      quantity: 1,
      monthlyFee: 0,
      commission: 30.0,
      date: getPastDate(4),
      notes: 'Financiamiento 18 meses',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
};

function readDb(): StoredData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf-8');
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const data: StoredData = JSON.parse(raw);
    // Ensure Gilberto admin always exists
    const hasAdmin = data.users.some((u) => u.username.toLowerCase() === 'gilberto');
    if (!hasAdmin) {
      data.users.unshift(INITIAL_DB.users[0]);
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    }
    return data;
  } catch (err) {
    console.error('Error reading db file:', err);
    return INITIAL_DB;
  }
}

function writeDb(data: StoredData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db file:', err);
  }
}

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    cloud: true,
    timestamp: new Date().toISOString(),
    service: 'GESTION DE SEGUIMIENTO GILBERTO PRO Cloud API',
  });
});

// Auth Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const dbData = readDb();
  const found = dbData.users.find(
    (u) =>
      u.username.trim().toLowerCase() === String(username).trim().toLowerCase() &&
      u.password === String(password).trim()
  );

  if (!found) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const { password: _, ...userSafe } = found;
  res.json({ user: userSafe });
});

// Users List (all registered advisors)
app.get('/api/users', (req, res) => {
  const dbData = readDb();
  const safeUsers = dbData.users.map(({ password: _, ...u }) => u);
  res.json(safeUsers);
});

// Register or Create User (Admin or advisor self-registration)
app.post('/api/users', (req, res) => {
  const { name, username, password, role } = req.body || {};
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const dbData = readDb();
  const exists = dbData.users.some(
    (u) => u.username.toLowerCase() === String(username).toLowerCase().trim()
  );
  if (exists) {
    return res.status(409).json({ error: 'El nombre de usuario ya está registrado' });
  }

  const newUser = {
    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    name: String(name).trim(),
    username: String(username).trim(),
    password: String(password).trim(),
    role: (role === 'ADMIN' ? 'ADMIN' : 'ASESOR') as 'ADMIN' | 'ASESOR',
    createdAt: new Date().toISOString(),
  };

  dbData.users.push(newUser);
  writeDb(dbData);

  const { password: _, ...userSafe } = newUser;
  res.status(201).json(userSafe);
});

// Sales List (all sales in the cloud)
app.get('/api/sales', (req, res) => {
  const dbData = readDb();
  res.json(dbData.sales || []);
});

// Create Sale
app.post('/api/sales', (req, res) => {
  const saleInput = req.body;
  if (!saleInput || !saleInput.clientName || !saleInput.clientDni || !saleInput.saleType) {
    return res.status(400).json({ error: 'Faltan campos obligatorios de la venta' });
  }

  const dbData = readDb();
  const newSale = {
    ...saleInput,
    id: 'sale_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    quantity: Math.max(1, saleInput.quantity || 1),
    createdAt: new Date().toISOString(),
  };

  dbData.sales.unshift(newSale);
  writeDb(dbData);

  res.status(201).json(newSale);
});

// Update Sale
app.put('/api/sales/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const dbData = readDb();
  const index = dbData.sales.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }

  dbData.sales[index] = {
    ...dbData.sales[index],
    ...updateData,
    id, // Preserve id
    quantity: Math.max(1, updateData.quantity || dbData.sales[index].quantity || 1),
  };

  writeDb(dbData);
  res.json(dbData.sales[index]);
});

// Delete Sale
app.delete('/api/sales/:id', (req, res) => {
  const { id } = req.params;
  const dbData = readDb();
  const prevCount = dbData.sales.length;
  dbData.sales = dbData.sales.filter((s) => s.id !== id);

  if (dbData.sales.length === prevCount) {
    return res.status(404).json({ error: 'Venta no encontrada' });
  }

  writeDb(dbData);
  res.json({ success: true, message: 'Operación eliminada de la nube' });
});

// Set up Vite in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GESTION GILBERTO PRO Cloud Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
