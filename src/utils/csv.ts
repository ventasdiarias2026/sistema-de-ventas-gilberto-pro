import { Sale } from '../types/telecom';

/**
 * Exports sales data as an Excel-compatible CSV file with UTF-8 BOM.
 */
export function exportSalesToCSV(sales: Sale[], filenamePrefix = 'Ventas_Gilberto_Pro') {
  if (!sales || sales.length === 0) {
    alert('No hay ventas disponibles para exportar con los filtros seleccionados.');
    return;
  }

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
    `'${sale.clientDni}`, // Prefix with ' to preserve leading zeroes in Excel
    `'${sale.clientPhone}`,
    `"${sale.saleType}"`,
    sale.quantity || 1,
    sale.monthlyFee > 0 ? sale.monthlyFee.toFixed(2) : 'N/A',
    sale.donorOperator || 'N/A',
    sale.commission.toFixed(2),
    `"${(sale.notes || '').replace(/"/g, '""')}"`,
  ]);


  // Join rows with comma (or semicolon)
  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Microsoft Excel
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `${filenamePrefix}_${now}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
