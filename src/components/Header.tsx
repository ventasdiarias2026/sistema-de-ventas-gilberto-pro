import React from 'react';
import { User } from '../types/telecom';
import {
  Shield,
  User as UserIcon,
  LogOut,
  PlusCircle,
  FileSpreadsheet,
  Users,
  Cloud,
  RefreshCw,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  selectedAdvisorFilter: string;
  onSelectAdvisorFilter: (advisorId: string) => void;
  onOpenNewSaleModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onExportCSV: () => void;
  totalSalesCount: number;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  selectedAdvisorFilter,
  onSelectAdvisorFilter,
  onOpenNewSaleModal,
  onOpenAuthModal,
  onLogout,
  onExportCSV,
  totalSalesCount,
  isCloudConnected = true,
  isSyncing = false,
  onManualSync,
}) => {
  const isAdmin = currentUser.role === 'ADMIN';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Brand Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-900/40 shrink-0">
              <span className="font-mono font-bold text-white text-lg tracking-wider">GP</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white truncate font-sans">
                  GESTION DE SEGUIMIENTO GILBERTO PRO
                </h1>
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shrink-0">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 shrink-0">
                    <UserIcon className="w-3 h-3 text-indigo-400" />
                    Asesor
                  </span>
                )}

                {/* Drive Status Badge */}
                <div
                  title={
                    isCloudConnected
                      ? 'Sincronizado con Google Drive (Carpeta: 17dQ4Zj1VkpJQiRcklMfXe8DChui2FFAb)'
                      : 'Modo local activo. Intentando reconectar...'
                  }
                  className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                    isCloudConnected
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/70'
                      : 'bg-amber-950/70 text-amber-300 border-amber-800/70 animate-pulse'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <Cloud className="w-2.5 h-2.5 text-cyan-400" />
                  <span>{isCloudConnected ? 'Drive Conectado' : 'Offline'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block truncate">
                Control comercial de telecomunicaciones · Carpeta Drive: 17dQ4Zj1VkpJQiRcklMfXe8DChui2FFAb
              </p>

            </div>
          </div>

          {/* Zone 2: Admin Advisor Filter (if admin) */}
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="advisor-select" className="text-xs text-slate-300 font-medium whitespace-nowrap">
                Filtrar asesor:
              </label>
              <select
                id="advisor-select"
                value={selectedAdvisorFilter}
                onChange={(e) => onSelectAdvisorFilter(e.target.value)}
                className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="ALL" className="bg-slate-800 text-white">
                  Equipo Completo (Global)
                </option>
                {users.map((u) => (
                  <option key={u.id} value={u.id} className="bg-slate-800 text-white">
                    {u.name} {u.role === 'ADMIN' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Zone 3: Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Sync Cloud Button */}
            {onManualSync && (
              <button
                onClick={onManualSync}
                disabled={isSyncing}
                title="Sincronizar ventas y asesores en tiempo real con la nube"
                className="p-2 text-slate-300 hover:text-cyan-300 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            )}

            {/* Export CSV button */}
            <button
              onClick={onExportCSV}
              title="Descargar reporte en formato Excel / CSV"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Exportar Excel</span>
            </button>

            {/* Registrar Venta Button */}
            <button
              onClick={onOpenNewSaleModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-900/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Registrar Venta</span>
            </button>

            {/* Current user pill & logout */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-800">
              <button
                onClick={onOpenAuthModal}
                title="Cambiar de usuario o registrar asesor"
                className="text-left px-2 py-1 rounded hover:bg-slate-800/80 transition-colors cursor-pointer group"
              >
                <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate max-w-[100px] sm:max-w-[130px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {isAdmin ? 'Panel Global' : 'Espacio Privado'}
                </div>
              </button>

              <button
                onClick={onLogout}
                title="Cerrar Sesión"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

