import { Sale, RenewalLead } from '../types/telecom';

/**
 * Calculates days and months passed since the sale date.
 * If sale is Portabilidad or Alta and days >= 180 (6 months), isEligible is true.
 */
export function calculateRenewalStatus(
  sale: Sale,
  now: Date = new Date()
): {
  isEligible: boolean;
  daysPassed: number;
  monthsPassed: number;
  remainingDays: number;
  badgeText: string;
} {
  if (sale.saleType !== 'Portabilidad' && sale.saleType !== 'Alta') {
    return {
      isEligible: false,
      daysPassed: 0,
      monthsPassed: 0,
      remainingDays: 0,
      badgeText: '',
    };
  }

  // Parse YYYY-MM-DD safely
  const parts = sale.date.split('-');
  if (parts.length !== 3) {
    return {
      isEligible: false,
      daysPassed: 0,
      monthsPassed: 0,
      remainingDays: 0,
      badgeText: '',
    };
  }

  const saleDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const diffMs = now.getTime() - saleDate.getTime();
  const daysPassed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // Approximate 30.4375 days per month
  const monthsPassed = Math.floor(daysPassed / 30.4375);
  const remainingDays = Math.floor(daysPassed % 30.4375);

  const isEligible = daysPassed >= 180;

  let badgeText = '';
  if (isEligible) {
    badgeText = `🎯 Apto (${monthsPassed}m ${remainingDays}d)`;
  }

  return {
    isEligible,
    daysPassed,
    monthsPassed,
    remainingDays,
    badgeText,
  };
}

/**
 * Filters sales to find clients eligible for renewal (Portabilidad / Alta with 180+ days)
 */
export function getRenewalLeads(sales: Sale[], now: Date = new Date()): RenewalLead[] {
  const leads: RenewalLead[] = [];

  for (const sale of sales) {
    const status = calculateRenewalStatus(sale, now);
    if (status.isEligible) {
      leads.push({
        sale,
        daysPassed: status.daysPassed,
        monthsPassed: status.monthsPassed,
        remainingDays: status.remainingDays,
        isEligible: true,
      });
    }
  }

  // Sort by most days passed (oldest clients first)
  return leads.sort((a, b) => b.daysPassed - a.daysPassed);
}

/**
 * Generates WhatsApp URL with personalized renewal sales pitch
 */
export function generateWhatsAppRenewalUrl(lead: RenewalLead, advisorName: string): string {
  const cleanPhone = lead.sale.clientPhone.replace(/\D/g, '');
  const phoneParam = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;

  const clientFirstName = lead.sale.clientName.split(' ')[0] || lead.sale.clientName;
  const planInfo = lead.sale.monthlyFee > 0 ? ` de S/ ${lead.sale.monthlyFee.toFixed(2)}` : '';

  const message =
    `¡Hola ${clientFirstName}! Te saluda ${advisorName} de Gestión Comercial Gilberto Pro. ` +
    `Te escribo porque tu línea postpago (${lead.sale.clientPhone})${planInfo} ya cumplió ${lead.monthsPassed} meses con nosotros ` +
    `y el sistema te ha calificado como APTO para RENOVAR tu equipo smartphone con descuento exclusivo y beneficios en tu plan. ` +
    `¿Deseas que te comparta los modelos disponibles hoy para entrega inmediata?`;

  return `https://wa.me/${phoneParam}?text=${encodeURIComponent(message)}`;
}
