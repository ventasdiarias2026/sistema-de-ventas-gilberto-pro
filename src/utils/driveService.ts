import { Sale, User } from '../types/telecom';

export const GOOGLE_DRIVE_FOLDER_ID = '17dQ4Zj1VkpJQiRcklMfXe8DChui2FFAb';
export const GOOGLE_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}?usp=sharing`;

export interface DriveDatabasePayload {
  version: string;
  appName: string;
  folderId: string;
  lastUpdated: string;
  users: User[];
  sales: Sale[];
}

/**
 * Generates and triggers download of the JSON database backup file
 */
export function downloadDatabaseJson(users: User[], sales: Sale[]) {
  const payload: DriveDatabasePayload = {
    version: '1.0',
    appName: 'GESTION DE SEGUIMIENTO GILBERTO PRO',
    folderId: GOOGLE_DRIVE_FOLDER_ID,
    lastUpdated: new Date().toISOString(),
    users,
    sales,
  };

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gilberto_pro_database_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers download of the CSV sales report for Google Drive
 */
export function downloadDatabaseCsv(sales: Sale[]) {
  const headers = [
    'ID',
    'Fecha',
    'Asesor',
    'Cliente',
    'DNI',
    'Teléfono',
    'Tipo de Operación',
    'Cantidad',
    'Cargo Fijo (S/)',
    'Operador Cedente',
    'Comisión (S/)',
    'Notas',
  ];

  const rows = sales.map((sale) => [
    sale.id,
    sale.date,
    `"${(sale.advisorName || '').replace(/"/g, '""')}"`,
    `"${(sale.clientName || '').replace(/"/g, '""')}"`,
    `'${sale.clientDni}`,
    `'${sale.clientPhone}`,
    `"${sale.saleType}"`,
    sale.quantity || 1,
    sale.monthlyFee > 0 ? sale.monthlyFee.toFixed(2) : 'N/A',
    sale.donorOperator || 'N/A',
    sale.commission.toFixed(2),
    `"${(sale.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent =
    '\uFEFF' +
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_ventas_gilberto_pro_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads a user-selected JSON database file
 */
export function readDatabaseJsonFile(file: File): Promise<DriveDatabasePayload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as DriveDatabasePayload;
        resolve(parsed);
      } catch (err) {
        reject(new Error('El archivo seleccionado no tiene un formato JSON válido'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}
