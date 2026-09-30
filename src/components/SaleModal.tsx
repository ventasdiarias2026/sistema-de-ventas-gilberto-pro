import React, { useState, useEffect } from 'react';
import {
  Sale,
  SaleType,
  DonorOperator,
  VALID_MONTHLY_FEES,
  DONOR_OPERATORS,
  User,
} from '../types/telecom';
import { calculateCommission } from '../utils/storage';
import {
  X,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  UserCheck,
  Hash,
  Minus,
  Plus,
} from 'lucide-react';


interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: Omit<Sale, 'id' | 'createdAt'>, editingId?: string) => void;
  editingSale?: Sale | null;
  currentUser: User;
  users: User[];
  prefilledClient?: {
    clientName: string;
    clientDni: string;
    clientPhone: string;
    monthlyFee?: number;
    saleType?: SaleType;
    linkedRenewalFromId?: string;
  } | null;
}

const SALE_TYPES: SaleType[] = [
  'Portabilidad',
  'Alta',
  'Renovación',
  'CyC',
  'Mica',
  'Accesorios',
  'Prepago',
];

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSale,
  currentUser,
  users,
  prefilledClient,
}) => {
  const [saleType, setSaleType] = useState<SaleType>('Portabilidad');
  const [clientName, setClientName] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [monthlyFee, setMonthlyFee] = useState<number>(69.9);
  const [donorOperator, setDonorOperator] = useState<DonorOperator>('Movistar');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>(currentUser.id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or fill when opening/editing
  useEffect(() => {
    if (!isOpen) return;

    if (editingSale) {
      setSaleType(editingSale.saleType);
      setClientName(editingSale.clientName);
      setClientDni(editingSale.clientDni);
      setClientPhone(editingSale.clientPhone);
      setQuantity(editingSale.quantity || 1);
      setMonthlyFee(editingSale.monthlyFee || 69.9);
      setDonorOperator(editingSale.donorOperator || 'Movistar');
      setDate(editingSale.date);
      setNotes(editingSale.notes || '');
      setSelectedAdvisorId(editingSale.advisorId || currentUser.id);
      setErrors({});
    } else if (prefilledClient) {
      setSaleType(prefilledClient.saleType || 'Renovación');
      setClientName(prefilledClient.clientName || '');
      setClientDni(prefilledClient.clientDni || '');
      setClientPhone(prefilledClient.clientPhone || '');
      setQuantity(1);
      setMonthlyFee(prefilledClient.monthlyFee || 69.9);
      setDonorOperator('Movistar');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('Renovación originada por alerta de 6 meses.');
      setSelectedAdvisorId(currentUser.id);
      setErrors({});
    } else {
      // New clean sale
      setSaleType('Portabilidad');
      setClientName('');
      setClientDni('');
      setClientPhone('');
      setQuantity(1);
      setMonthlyFee(69.9);
      setDonorOperator('Movistar');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setSelectedAdvisorId(currentUser.id);
      setErrors({});
    }
  }, [isOpen, editingSale, prefilledClient, currentUser.id]);

  if (!isOpen) return null;

  const showMonthlyFee = saleType === 'Portabilidad' || saleType === 'Alta' || saleType === 'Renovación';
  const showDonorOperator = saleType === 'Portabilidad';
  const safeQty = Math.max(1, quantity || 1);
  const unitCommission = calculateCommission(saleType, showMonthlyFee ? monthlyFee : 0, 1);
  const computedCommission = calculateCommission(saleType, showMonthlyFee ? monthlyFee : 0, safeQty);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!clientName.trim()) {
      errs.clientName = 'El nombre completo del cliente es obligatorio';
    }

    const cleanDni = clientDni.trim().replace(/\D/g, '');
    if (!cleanDni) {
      errs.clientDni = 'El DNI es obligatorio';
    } else if (cleanDni.length !== 8) {
      errs.clientDni = 'El DNI debe tener exactamente 8 dígitos';
    }

    const cleanPhone = clientPhone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      errs.clientPhone = 'El teléfono/celular es obligatorio';
    } else if (cleanPhone.length < 9) {
      errs.clientPhone = 'El teléfono debe tener 9 dígitos';
    }

    if (!date) {
      errs.date = 'La fecha de la venta es obligatoria';
    }

    if (!quantity || quantity < 1) {
      errs.quantity = 'La cantidad debe ser al menos 1';
    }

    if (showMonthlyFee && (!monthlyFee || monthlyFee <= 0)) {
      errs.monthlyFee = 'El cargo fijo es obligatorio';
    }

    if (showDonorOperator && !donorOperator) {
      errs.donorOperator = 'El operador cedente es obligatorio para Portabilidad';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const assignedAdvisor = users.find((u) => u.id === selectedAdvisorId) || currentUser;

    const saleData: Omit<Sale, 'id' | 'createdAt'> = {
      advisorId: assignedAdvisor.id,
      advisorName: assignedAdvisor.name,
      clientName: clientName.trim(),
      clientDni: clientDni.trim().replace(/\D/g, ''),
      clientPhone: clientPhone.trim().replace(/\D/g, ''),
      saleType,
      quantity: safeQty,
      monthlyFee: showMonthlyFee ? Number(monthlyFee) : 0,
      donorOperator: showDonorOperator ? donorOperator : undefined,
      commission: computedCommission,
      date,
      notes: notes.trim(),
      linkedRenewalFromId: prefilledClient?.linkedRenewalFromId,
    };

    onSave(saleData, editingSale ? editingSale.id : undefined);
    onClose();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <span>{editingSale ? 'Editar Venta' : 'Registrar Nueva Operación'}</span>
            </h3>
            <p className="text-xs text-slate-400">
              Formulario comercial con reglas y comisiones automáticas de Gilberto Pro
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Advisor Selector (if admin) or Advisor name */}
          {currentUser.role === 'ADMIN' ? (
            <div>
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Asignar al Asesor Comercial:
              </label>
              <select
                value={selectedAdvisorId}
                onChange={(e) => setSelectedAdvisorId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.role === 'ADMIN' ? '(Administrador)' : '(Asesor)'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-750 rounded-lg p-2.5 flex items-center justify-between">
              <span className="text-slate-400">Asesor responsable:</span>
              <span className="font-semibold text-cyan-300">{currentUser.name}</span>
            </div>
          )}

          {/* Sale Type Selector (7 types) */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Tipo de Operación Comercial <span className="text-rose-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SALE_TYPES.map((type) => {
                const isActive = saleType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSaleType(type)}
                    className={`py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Details */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-slate-300 font-medium mb-1">
                Nombre Completo del Cliente <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Carlos Alberto Torres Gómez"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${
                  errors.clientName ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.clientName && (
                <span className="text-rose-400 text-[11px] mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.clientName}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                DNI (8 dígitos) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="45892134"
                value={clientDni}
                onChange={(e) => setClientDni(e.target.value.replace(/\D/g, ''))}
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${
                  errors.clientDni ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.clientDni && (
                <span className="text-rose-400 text-[11px] mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.clientDni}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Teléfono / Celular <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                placeholder="987654321"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 ${
                  errors.clientPhone ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.clientPhone && (
                <span className="text-rose-400 text-[11px] mt-0.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.clientPhone}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-cyan-400" />
                Fecha de Venta <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full bg-slate-800 border rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500 ${
                  errors.date ? 'border-rose-500' : 'border-slate-700'
                }`}
              />
              {errors.date && (
                <span className="text-rose-400 text-[11px] mt-0.5">{errors.date}</span>
              )}
            </div>

            {/* Espacio de Cantidad */}
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-cyan-400" />
                  Cantidad <span className="text-rose-400">*</span>
                </span>
                <span className="text-[10px] text-slate-400">Min. 1</span>
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, (prev || 1) - 1))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-l-lg transition-colors cursor-pointer"
                  title="Disminuir cantidad"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setQuantity(isNaN(val) ? 1 : Math.max(1, val));
                  }}
                  className={`w-full bg-slate-800 border-y border-slate-700 py-2 text-center text-white font-mono font-bold text-sm focus:outline-none focus:border-cyan-500 ${
                    errors.quantity ? 'border-rose-500' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.min(999, (prev || 1) + 1))}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-r-lg transition-colors cursor-pointer"
                  title="Incrementar cantidad"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {errors.quantity && (
                <span className="text-rose-400 text-[11px] mt-0.5">{errors.quantity}</span>
              )}
            </div>
          </div>

          {/* Conditional Fields: Cargo Fijo and Operador Cedente */}
          {(showMonthlyFee || showDonorOperator) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-850 rounded-xl border border-slate-750">
              {showMonthlyFee && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Cargo Fijo Mensual (S/) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    {VALID_MONTHLY_FEES.map((fee) => (
                      <option key={fee} value={fee}>
                        S/ {fee.toFixed(fee % 1 === 0 ? 0 : 1)}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Tarifa postpago oficial obligatoria
                  </span>
                </div>
              )}

              {showDonorOperator && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Operador Cedente <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={donorOperator}
                    onChange={(e) => setDonorOperator(e.target.value as DonorOperator)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    {DONOR_OPERATORS.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Obligatorio para Portabilidad
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Commission Live Preview Box */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-300 font-semibold flex items-center gap-2">
                  <span>Comisión Aplicada:</span>
                  {safeQty > 1 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      x{safeQty} unidades
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {saleType === 'Portabilidad' &&
                    (safeQty > 1
                      ? `10% de S/ ${monthlyFee.toFixed(2)} (S/ ${unitCommission.toFixed(2)} x ${safeQty} uds)`
                      : '10% del Cargo Fijo mensual')}
                  {saleType === 'Alta' && 'Regla estándar (S/ 0.00)'}
                  {saleType === 'Renovación' && 'Regla estándar (S/ 0.00)'}
                  {saleType === 'CyC' &&
                    (safeQty > 1 ? `S/ 30.00 x ${safeQty} cuotas/unidades` : 'Tarifa fija S/ 30.00')}
                  {saleType === 'Mica' &&
                    (safeQty > 1 ? `S/ 5.00 x ${safeQty} micas` : 'Tarifa fija S/ 5.00')}
                  {saleType === 'Accesorios' &&
                    (safeQty > 1 ? `S/ 10.00 x ${safeQty} accesorios` : 'Tarifa fija S/ 10.00')}
                  {saleType === 'Prepago' &&
                    (safeQty > 1 ? `S/ 1.00 x ${safeQty} prepagos` : 'Tarifa fija S/ 1.00')}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-400 font-mono tabular-nums">
                S/ {computedCommission.toFixed(2)}
              </span>
            </div>
          </div>


          {/* Optional Notes */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Observaciones / Modelo de Equipo (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Galaxy A55 128GB o Chip físico entregado"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-900/40 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{editingSale ? 'Guardar Cambios' : 'Registrar Venta'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
