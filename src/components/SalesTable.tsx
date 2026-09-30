import React from 'react';
import { Sale, FilterState, SaleType } from '../types/telecom';
import { calculateRenewalStatus } from '../utils/renewal';
import {
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  Phone,
  FileText,
  User as UserIcon,
  Tag,
} from 'lucide-react';

interface SalesTableProps {
  sales: Sale[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onEditSale: (sale: Sale) => void;
  onDeleteSale: (saleId: string) => void;
  isAdmin: boolean;
}

const SALE_TYPES_FILTER: (SaleType | 'ALL')[] = [
  'ALL',
  'Portabilidad',
  'Alta',
  'Renovación',
  'CyC',
  'Mica',
  'Accesorios',
  'Prepago',
];

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  filters,
  onFilterChange,
  onEditSale,
  onDeleteSale,
  isAdmin,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Filters Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-850/60 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por Nombre, DNI o Teléfono..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Time range selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Periodo:</span>
            <select
              value={filters.timeRange}
              onChange={(e) =>
                onFilterChange({
                  timeRange: e.target.value as FilterState['timeRange'],
                })
              }
              className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos los tiempos</option>
              <option value="today">Hoy</option>
              <option value="this_week">Esta semana</option>
              <option value="this_month">Este mes</option>
              <option value="last_month">Mes anterior</option>
            </select>
          </div>
        </div>

        {/* Operation Types Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 flex items-center gap-1 text-[11px] pr-1 whitespace-nowrap">
            <Filter className="w-3 h-3 text-cyan-400" /> Tipo:
          </span>
          {SALE_TYPES_FILTER.map((type) => {
            const isActive = filters.saleType === type;
            const label = type === 'ALL' ? 'Todos los tipos' : type;
            return (
              <button
                key={type}
                onClick={() => onFilterChange({ saleType: type })}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium text-[11px] transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Operación</th>
              <th className="py-3 px-3 text-center">Cant.</th>
              <th className="py-3 px-4 text-right">Cargo Fijo</th>
              <th className="py-3 px-4">Cedente</th>
              <th className="py-3 px-4 text-right">Comisión</th>
              <th className="py-3 px-4">Condición</th>
              {isAdmin && <th className="py-3 px-4">Asesor</th>}
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {sales.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 10 : 9}
                  className="py-12 px-4 text-center text-slate-400"
                >
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="font-semibold text-slate-300">No se encontraron ventas</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Prueba cambiando los filtros o registra una nueva operación comercial.
                  </p>
                </td>
              </tr>
            ) : (
              sales.map((sale) => {
                const renewalStatus = calculateRenewalStatus(sale);

                return (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-850/50 transition-colors group"
                  >
                    {/* Fecha */}
                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {sale.date}
                    </td>

                    {/* Cliente */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white truncate max-w-[180px]">
                        {sale.clientName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono mt-0.5">
                        <span>DNI: {sale.clientDni}</span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-0.5 text-cyan-400">
                          <Phone className="w-2.5 h-2.5" />
                          {sale.clientPhone}
                        </span>
                      </div>
                    </td>

                    {/* Tipo Operación */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] ${
                          sale.saleType === 'Portabilidad'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                            : sale.saleType === 'Alta'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                            : sale.saleType === 'Renovación'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : sale.saleType === 'CyC'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : sale.saleType === 'Prepago'
                            ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {sale.saleType}
                      </span>
                      {sale.notes && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px] mt-0.5">
                          {sale.notes}
                        </div>
                      )}
                    </td>

                    {/* Cantidad */}
                    <td className="py-3 px-3 text-center whitespace-nowrap font-mono">
                      <span
                        className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                          (sale.quantity || 1) > 1
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-extrabold'
                            : 'text-slate-300'
                        }`}
                      >
                        {sale.quantity || 1}
                      </span>
                    </td>

                    {/* Cargo Fijo */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                      {sale.monthlyFee > 0 ? (
                        <span>S/ {sale.monthlyFee.toFixed(2)}</span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>


                    {/* Cedente */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {sale.donorOperator ? (
                        <span
                          className={`font-semibold ${
                            sale.donorOperator === 'Movistar'
                              ? 'text-sky-400'
                              : sale.donorOperator === 'Entel'
                              ? 'text-blue-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {sale.donorOperator}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Comisión */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold whitespace-nowrap">
                      <span
                        className={
                          sale.commission > 0 ? 'text-emerald-400' : 'text-slate-500'
                        }
                      >
                        S/ {sale.commission.toFixed(2)}
                      </span>
                    </td>

                    {/* Insignia Apto Renovación */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renewalStatus.isEligible ? (
                        <span
                          title={`Contratado hace ${renewalStatus.daysPassed} días`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                        >
                          🎯 Apto ({renewalStatus.monthsPassed}m {renewalStatus.remainingDays}d)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">
                          {sale.saleType === 'Portabilidad' || sale.saleType === 'Alta'
                            ? `${renewalStatus.monthsPassed}m de antigüedad`
                            : 'Estándar'}
                        </span>
                      )}
                    </td>

                    {/* Asesor (visible para admin o reporte) */}
                    {isAdmin && (
                      <td className="py-3 px-4 whitespace-nowrap text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{sale.advisorName}</span>
                        </div>
                      </td>
                    )}

                    {/* Acciones Editar y Eliminar */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onEditSale(sale)}
                          title="Editar registro de venta"
                          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteSale(sale.id)}
                          title="Eliminar registro"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between text-xs text-slate-400">
        <div>
          Mostrando <span className="font-semibold text-white">{sales.length}</span> operaciones registradas
        </div>
        <div className="font-mono text-[11px]">
          Base de datos comercial sincronizada localmente
        </div>
      </div>
    </div>
  );
};
