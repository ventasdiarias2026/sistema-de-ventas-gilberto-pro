import React, { useState } from 'react';
import { RenewalLead } from '../types/telecom';
import { generateWhatsAppRenewalUrl } from '../utils/renewal';
import {
  MessageSquare,
  Sparkles,
  Phone,
  Calendar,
  DollarSign,
  User as UserIcon,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface RenewalTabProps {
  leads: RenewalLead[];
  advisorName: string;
  onProcessRenewal: (lead: RenewalLead) => void;
}

export const RenewalTab: React.FC<RenewalTabProps> = ({
  leads,
  advisorName,
  onProcessRenewal,
}) => {
  const [search, setSearch] = useState('');

  const filteredLeads = leads.filter((lead) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      lead.sale.clientName.toLowerCase().includes(q) ||
      lead.sale.clientDni.includes(q) ||
      lead.sale.clientPhone.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header Info Banner inside the Tab */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Cartera de Clientes Aptos para Renovación (6+ meses)</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {leads.length} Disponibles
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Clientes que contrataron Portabilidad o Alta hace 180 días o más. Tienen derecho a renovación
                con subsidio de terminal, cambio de plan y bonos comerciales. Al procesar su renovación sumas directamente a la meta de 30 Renovaciones.
              </p>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar clientes aptos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid / List of Leads */}
      {filteredLeads.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-300">
            {leads.length === 0
              ? 'No hay clientes que hayan cumplido 6 meses todavía'
              : 'Ningún cliente coincide con la búsqueda'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {leads.length === 0
              ? 'Las ventas de Portabilidad y Alta cumplirán su periodo de maduración comercial a los 180 días automáticamente.'
              : 'Prueba con otro término de búsqueda (nombre, DNI o celular).'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const waUrl = generateWhatsAppRenewalUrl(lead, advisorName);

            return (
              <div
                key={lead.sale.id}
                className="bg-slate-900 border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-4 transition-all shadow-md flex flex-col justify-between group"
              >
                <div>
                  {/* Top line: Badge and Elapsed Days */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      🎯 Apto ({lead.monthsPassed}m {lead.remainingDays}d)
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {lead.daysPassed} días acumulados
                    </span>
                  </div>

                  {/* Client Info */}
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                    {lead.sale.clientName}
                  </h3>

                  <div className="mt-2 space-y-1.5 text-xs text-slate-300 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">DNI:</span>
                      <span className="font-semibold text-slate-200">{lead.sale.clientDni}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Teléfono:</span>
                      <span className="font-semibold text-cyan-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {lead.sale.clientPhone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Operación Origen:</span>
                      <span className="text-slate-200 font-sans font-medium">
                        {lead.sale.saleType} {lead.sale.donorOperator ? `(${lead.sale.donorOperator})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Cargo Fijo Actual:</span>
                      <span className="text-emerald-400 font-bold">
                        S/ {lead.sale.monthlyFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Fecha origen:
                      </span>
                      <span className="text-slate-400">{lead.sale.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <UserIcon className="w-3 h-3" /> Asesor anterior:
                      </span>
                      <span className="text-slate-400 truncate max-w-[130px] font-sans">
                        {lead.sale.advisorName}
                      </span>
                    </div>
                  </div>

                  {lead.sale.notes && (
                    <div className="mt-2.5 p-2 rounded bg-slate-800/60 border border-slate-750 text-[11px] text-slate-400 italic">
                      "{lead.sale.notes}"
                    </div>
                  )}
                </div>

                {/* Direct Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                  {/* WhatsApp button */}
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                    <ExternalLink className="w-2.5 h-2.5 text-emerald-200" />
                  </a>

                  {/* Procesar Renovación Button */}
                  <button
                    onClick={() => onProcessRenewal(lead)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <span>Procesar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
