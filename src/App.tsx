import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  User,
  Sale,
  FilterState,
  RenewalLead,
  SaleType,
} from './types/telecom';
import {
  getStoredUsers,
  saveStoredUsers,
  getStoredSales,
  saveStoredSales,
  getStoredSession,
  saveStoredSession,
  ADMIN_USER,
} from './utils/storage';
import {
  apiFetchSales,
  apiFetchUsers,
  apiCreateSale,
  apiUpdateSale,
  apiDeleteSale,
  apiCreateUser,
  checkCloudStatus,
} from './utils/api';
import { computeGoalStatuses } from './utils/goals';
import { getRenewalLeads } from './utils/renewal';
import { exportSalesToCSV } from './utils/csv';
import { launchConfetti } from './utils/confetti';
import { playVictorySound } from './utils/audio';

import { Header } from './components/Header';
import { GoogleDriveBanner } from './components/GoogleDriveBanner';
import { RenewalBanner } from './components/RenewalBanner';
import { GoalsSection } from './components/GoalsSection';
import { SalesTable } from './components/SalesTable';
import { RenewalTab } from './components/RenewalTab';
import { SaleModal } from './components/SaleModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  LayoutDashboard,
  TableProperties,
  Sparkles,
  Users,
  TrendingUp,
  Award,
  Cloud,
  RefreshCw,
  UserPlus,
} from 'lucide-react';

export default function App() {
  // Authentication & Users State
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<User>(() => getStoredSession() || ADMIN_USER);

  // Sales data
  const [sales, setSales] = useState<Sale[]>(() => getStoredSales());

  // Cloud status & synchronization state
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isSyncingRef = useRef(false);

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'renewals' | 'team'>('dashboard');


  // Admin filter for advisor
  const [selectedAdvisorFilter, setSelectedAdvisorFilter] = useState<string>('ALL');

  // Filters state for sales table
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    saleType: 'ALL',
    timeRange: 'all',
    advisorFilter: 'ALL',
  });

  // Modals state
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [prefilledClient, setPrefilledClient] = useState<{
    clientName: string;
    clientDni: string;
    clientPhone: string;
    monthlyFee?: number;
    saleType?: SaleType;
    linkedRenewalFromId?: string;
  } | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Add toast helper
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync users to storage
  useEffect(() => {
    saveStoredUsers(users);
  }, [users]);

  // Sync sales to storage
  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  // Sync session to storage
  useEffect(() => {
    saveStoredSession(currentUser);
  }, [currentUser]);

  // Function to pull latest cloud data
  const syncWithCloud = useCallback(async (isManual = false) => {

    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (isManual) setIsSyncing(true);

    try {
      const isOnline = await checkCloudStatus();
      setIsCloudConnected(isOnline);

      if (isOnline) {
        const [cloudUsers, cloudSales] = await Promise.all([
          apiFetchUsers(),
          apiFetchSales(),
        ]);

        if (cloudUsers && cloudUsers.length > 0) {
          setUsers(cloudUsers);
        }
        if (cloudSales && cloudSales.length > 0) {
          setSales(cloudSales);
        }

        if (isManual) {
          addToast({
            type: 'info',
            title: 'Sincronizado con la Nube',
            description: `Datos actualizados: ${cloudSales.length} ventas y ${cloudUsers.length} asesores conectados.`,
          });
        }
      }
    } catch (err) {
      console.warn('Sync error:', err);
      setIsCloudConnected(false);
    } finally {
      isSyncingRef.current = false;
      if (isManual) setIsSyncing(false);
    }
  }, [addToast]);

  // Initial cloud fetch on mount and periodical auto-sync (every 6 seconds)
  useEffect(() => {
    syncWithCloud(false);

    const interval = setInterval(() => {
      syncWithCloud(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [syncWithCloud]);

  // Scope of sales according to active user and admin selection
  const userScopedSales = useMemo(() => {
    if (currentUser.role === 'ADMIN') {
      if (selectedAdvisorFilter === 'ALL') {
        return sales;
      }
      return sales.filter((s) => s.advisorId === selectedAdvisorFilter);
    }
    // Regular advisor: strictly private workspace
    return sales.filter((s) => s.advisorId === currentUser.id);
  }, [sales, currentUser, selectedAdvisorFilter]);

  // Renewal leads (6+ months / 180+ days)
  const renewalLeads: RenewalLead[] = useMemo(() => {
    return getRenewalLeads(userScopedSales);
  }, [userScopedSales]);

  // Goal Statuses
  const goalStatuses = useMemo(() => {
    return computeGoalStatuses(userScopedSales);
  }, [userScopedSales]);

  // Summary Metrics
  const totalCommissions = useMemo(() => {
    return userScopedSales.reduce((acc, s) => acc + (s.commission || 0), 0);
  }, [userScopedSales]);

  // Filtered sales for the table
  const filteredSales = useMemo(() => {
    return userScopedSales.filter((sale) => {
      // Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = (sale.clientName || '').toLowerCase().includes(q);
        const matchesDni = (sale.clientDni || '').includes(q);
        const matchesPhone = (sale.clientPhone || '').includes(q);
        if (!matchesName && !matchesDni && !matchesPhone) return false;
      }

      // Sale Type
      if (filters.saleType !== 'ALL' && sale.saleType !== filters.saleType) {
        return false;
      }

      // Time Range
      if (filters.timeRange !== 'all') {
        const saleDate = new Date(sale.date + 'T00:00:00');
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (filters.timeRange === 'today') {
          if (sale.date !== todayStr) return false;
        } else if (filters.timeRange === 'this_week') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          if (saleDate < sevenDaysAgo) return false;
        } else if (filters.timeRange === 'this_month') {
          if (
            saleDate.getFullYear() !== now.getFullYear() ||
            saleDate.getMonth() !== now.getMonth()
          ) {
            return false;
          }
        } else if (filters.timeRange === 'last_month') {
          const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
          const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
          if (
            saleDate.getMonth() !== lastMonth ||
            saleDate.getFullYear() !== lastMonthYear
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [userScopedSales, filters]);

  // Sort filtered sales newest first
  const sortedFilteredSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredSales]);

  // Handlers for Save Sale (Add or Edit) with Cloud Sync
  const handleSaveSale = async (saleData: Omit<Sale, 'id' | 'createdAt'>, editingId?: string) => {
    const isEdit = Boolean(editingId);

    // Snapshot old goal state before adding sale (to detect newly completed goal)
    const oldGoals = computeGoalStatuses(userScopedSales);
    const targetGoal = oldGoals.find((g) => g.type === saleData.saleType);

    if (isEdit && editingId) {
      // Optimistic update
      setSales((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                ...s,
                ...saleData,
              }
            : s
        )
      );

      // Cloud API update
      await apiUpdateSale(editingId, saleData);

      addToast({
        type: 'success',
        title: 'Operación actualizada en la nube',
        description: `La venta de ${saleData.clientName} ha sido guardada en la base de datos central.`,
      });
    } else {
      // Optimistic local id
      const tempId = 'sale_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newSale: Sale = {
        ...saleData,
        id: tempId,
        createdAt: new Date().toISOString(),
      };

      setSales((prev) => [newSale, ...prev]);

      // Cloud API create
      const result = await apiCreateSale(saleData);
      if (result.sale && result.sale.id) {
        // Update with server returned id
        setSales((prev) =>
          prev.map((s) => (s.id === tempId ? (result.sale as Sale) : s))
        );
      }

      // Check if this sale pushed the goal to completed (>= target)
      if (targetGoal) {
        const addedQty = saleData.quantity || 1;
        const willBeCount = targetGoal.current + addedQty;
        const qtyLabel = addedQty > 1 ? ` (${addedQty} unidades)` : '';

        if (targetGoal.current < targetGoal.target && willBeCount >= targetGoal.target) {
          // Trigger celebratory sound and confetti!
          playVictorySound();
          launchConfetti();

          addToast({
            type: 'celebration',
            title: `¡META DE ${targetGoal.label.toUpperCase()} ALCANZADA! 🏆`,
            description: `¡Felicitaciones! Has completado el 100% de la meta con ${willBeCount} unidades registradas (Meta: ${targetGoal.target}).`,
          });
        } else {
          addToast({
            type: 'success',
            title: 'Venta registrada',
            description: `${saleData.saleType}${qtyLabel} para ${saleData.clientName}. Comisión: S/ ${saleData.commission.toFixed(2)}`,
          });
        }
      } else {
        const qtyLabel = (saleData.quantity || 1) > 1 ? ` (${saleData.quantity} unidades)` : '';
        addToast({
          type: 'success',
          title: 'Venta registrada',
          description: `${saleData.saleType}${qtyLabel} para ${saleData.clientName}. Comisión: S/ ${saleData.commission.toFixed(2)}`,
        });
      }
    }

    setEditingSale(null);
    setPrefilledClient(null);
  };



  // Delete sale handler
  const handleDeleteSale = (saleId: string) => {
    setDeleteConfirmId(saleId);
  };

  const confirmDeleteSale = async () => {
    if (!deleteConfirmId) return;
    const targetId = deleteConfirmId;
    setSales((prev) => prev.filter((s) => s.id !== targetId));

    // Cloud API delete
    await apiDeleteSale(targetId);

    addToast({
      type: 'info',
      title: 'Registro eliminado',
      description: 'La venta ha sido removida del registro comercial.',
    });
    setDeleteConfirmId(null);
  };

  // Open modal for editing
  const handleOpenEdit = (sale: Sale) => {
    setEditingSale(sale);
    setPrefilledClient(null);
    setIsSaleModalOpen(true);
  };

  // Open modal prefilled from Renewal Tab
  const handleProcessRenewal = (lead: RenewalLead) => {
    setEditingSale(null);
    setPrefilledClient({
      clientName: lead.sale.clientName,
      clientDni: lead.sale.clientDni,
      clientPhone: lead.sale.clientPhone,
      monthlyFee: lead.sale.monthlyFee,
      saleType: 'Renovación',
      linkedRenewalFromId: lead.sale.id,
    });
    setIsSaleModalOpen(true);
  };

  // User Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setSelectedAdvisorFilter('ALL');
    }
    addToast({
      type: 'success',
      title: `Bienvenido, ${user.name}`,
      description:
        user.role === 'ADMIN'
          ? 'Has iniciado sesión como Administrador Principal (Gilberto).'
          : 'Has ingresado a tu espacio comercial.',
    });
    // Trigger immediate sync
    syncWithCloud(false);
  };

  // Register advisor in cloud
  const handleRegisterAdvisor = async (
    newUserData: Omit<User, 'id' | 'createdAt'>
  ): Promise<User | null> => {
    const result = await apiCreateUser(newUserData);
    if (result.user) {
      setUsers((prev) => [...prev, result.user!]);
      addToast({
        type: 'success',
        title: 'Asesor registrado con éxito',
        description: `La cuenta de ${result.user.name} está activa y lista para usar.`,
      });
      return result.user;
    }

    // Local fallback
    const fallbackUser: User = {
      ...newUserData,
      id: 'local_user_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, fallbackUser]);
    return fallbackUser;
  };


  const handleLogout = () => {
    setIsAuthModalOpen(true);
  };

  const handleDataRestored = (restoredUsers: User[], restoredSales: Sale[]) => {
    setUsers(restoredUsers);
    setSales(restoredSales);
    addToast({
      type: 'success',
      title: 'Datos Restaurados con Éxito',
      description: `Se restauraron ${restoredSales.length} ventas y ${restoredUsers.length} usuarios desde el archivo.`,
    });
  };

  // CSV Export
  const handleExportCSV = () => {
    const prefix =
      currentUser.role === 'ADMIN' && selectedAdvisorFilter === 'ALL'
        ? 'Ventas_Global_Gilberto_Pro'
        : `Ventas_${currentUser.name.replace(/\s+/g, '_')}`;
    exportSalesToCSV(sortedFilteredSales, prefix);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        users={users}
        selectedAdvisorFilter={selectedAdvisorFilter}
        onSelectAdvisorFilter={setSelectedAdvisorFilter}
        onOpenNewSaleModal={() => {
          setEditingSale(null);
          setPrefilledClient(null);
          setIsSaleModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onExportCSV={handleExportCSV}
        totalSalesCount={userScopedSales.length}
        isCloudConnected={isCloudConnected}
        isSyncing={isSyncing}
        onManualSync={() => syncWithCloud(true)}
      />

      {/* Google Drive Shared Folder & Backup Banner */}
      <GoogleDriveBanner
        users={users}
        sales={sales}
        onDataRestored={handleDataRestored}
      />

      {/* Interactive Renewal Alert Banner (180+ days) */}


      <RenewalBanner
        leads={renewalLeads}
        onGoToRenewalTab={() => {
          setActiveTab('renewals');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDismiss={() => setIsBannerDismissed(true)}
        isDismissed={isBannerDismissed}
      />

      {/* Navigation Sub-Bar (Responsive Tabs) */}
      <div className="border-b border-slate-800 bg-slate-900/60 sticky top-16 z-20 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 scrollbar-none">
            <nav className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Panel de Metas & Ventas</span>
              </button>

              <button
                onClick={() => setActiveTab('sales')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                <span>Gestión de Operaciones ({userScopedSales.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('renewals')}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'renewals'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'text-amber-300 hover:bg-amber-950/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Aptos para Renovación (6+ meses)</span>
                {renewalLeads.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      activeTab === 'renewals'
                        ? 'bg-slate-900 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {renewalLeads.length}
                  </span>
                )}
              </button>

              {currentUser.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('team')}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Equipo Comercial ({users.length})</span>
                </button>
              )}
            </nav>

            {/* Quick stats highlight on the right side */}
            <div className="hidden lg:flex items-center gap-3 text-xs text-slate-400 shrink-0">
              <span className="flex items-center gap-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Metas 100%: <strong className="text-white">{goalStatuses.filter((g) => g.isCompleted).length}/5</strong>
              </span>
              <span className="text-slate-700">|</span>
              <span className="font-mono text-emerald-400">
                Total S/ {totalCommissions.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Dashboard (Metas Comerciales Dinámicas + Resumen Operaciones) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Commercial Goals Section with 4 Color Stages and Celebration */}
            <GoalsSection
              goalStatuses={goalStatuses}
              totalCommissions={totalCommissions}
              totalSales={userScopedSales.length}
              advisorName={
                currentUser.role === 'ADMIN' && selectedAdvisorFilter !== 'ALL'
                  ? users.find((u) => u.id === selectedAdvisorFilter)?.name
                  : currentUser.name
              }
              isGlobalView={currentUser.role === 'ADMIN' && selectedAdvisorFilter === 'ALL'}
            />

            {/* Recent Operations Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                    <TableProperties className="w-4 h-4 text-cyan-400" />
                    <span>Registro Reciente de Ventas</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Últimas operaciones procesadas con validación de comisiones y estados de renovación
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('sales')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Ver todas las ventas →
                </button>
              </div>

              <SalesTable
                sales={sortedFilteredSales.slice(0, 8)}
                filters={filters}
                onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
                onEditSale={handleOpenEdit}
                onDeleteSale={handleDeleteSale}
                isAdmin={currentUser.role === 'ADMIN'}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Sales & Operations View */}
        {activeTab === 'sales' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <TableProperties className="w-5 h-5 text-cyan-400" />
                  <span>Listado Completo de Operaciones Comerciales</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Filtra por texto, tipo de venta, rango de fechas y asesor para auditoría y seguimiento
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  Descargar Reporte Excel
                </button>
                <button
                  onClick={() => {
                    setEditingSale(null);
                    setPrefilledClient(null);
                    setIsSaleModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  + Nueva Venta
                </button>
              </div>
            </div>

            <SalesTable
              sales={sortedFilteredSales}
              filters={filters}
              onFilterChange={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
              onEditSale={handleOpenEdit}
              onDeleteSale={handleDeleteSale}
              isAdmin={currentUser.role === 'ADMIN'}
            />
          </div>
        )}

        {/* Tab 3: Dedicated 6+ Months Renewal Tab */}
        {activeTab === 'renewals' && (
          <RenewalTab
            leads={renewalLeads}
            advisorName={currentUser.name}
            onProcessRenewal={handleProcessRenewal}
          />
        )}

        {/* Tab 4: Team Overview (For Admin Gilberto) */}
        {activeTab === 'team' && currentUser.role === 'ADMIN' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-cyan-400" />
                    <span>Gestión y Desempeño del Equipo Comercial</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Supervisa el cumplimiento de metas individuales y comisiones por cada asesor registrado
                  </p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 rounded-lg hover:bg-cyan-900/60 transition-colors"
                >
                  + Registrar Nuevo Asesor
                </button>
              </div>
            </div>

            {/* Advisors cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((advisor) => {
                const advisorSales = sales.filter((s) => s.advisorId === advisor.id);
                const advisorCommissions = advisorSales.reduce(
                  (acc, s) => acc + (s.commission || 0),
                  0
                );
                const advisorGoalStatuses = computeGoalStatuses(advisorSales);
                const completedGoals = advisorGoalStatuses.filter((g) => g.isCompleted).length;

                return (
                  <div
                    key={advisor.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span>{advisor.name}</span>
                            {advisor.role === 'ADMIN' && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                Administrador
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono">
                            Usuario: {advisor.username}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                          <Award className="w-4 h-4 text-amber-400" />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-750">
                          <span className="text-slate-400 text-[11px] block">Ventas Totales</span>
                          <span className="text-base font-bold text-white font-mono">
                            {advisorSales.length}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-750">
                          <span className="text-slate-400 text-[11px] block">Comisiones</span>
                          <span className="text-base font-bold text-emerald-400 font-mono">
                            S/ {advisorCommissions.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Mini Goal Progress */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Metas Cumplidas (100%):</span>
                          <span className="font-bold text-white">{completedGoals} de 5</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className="bg-cyan-500 h-1.5 rounded-full"
                            style={{ width: `${(completedGoals / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedAdvisorFilter(advisor.id);
                          setActiveTab('dashboard');
                        }}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        Filtrar este asesor →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>GESTION DE SEGUIMIENTO GILBERTO PRO</strong> · Sistema Autónomo de Telecomunicaciones
          </div>
          <div className="font-mono text-[11px] text-cyan-400/80">
            Sincronización Google Drive Activa (Carpeta: 17dQ4Zj1VkpJQiRcklMfXe8DChui2FFAb)
          </div>

        </div>
      </footer>

      {/* Sale Modal (Register & Edit) */}
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setEditingSale(null);
          setPrefilledClient(null);
        }}
        onSave={handleSaveSale}
        editingSale={editingSale}
        currentUser={currentUser}
        users={users}
        prefilledClient={prefilledClient}
      />

      {/* Auth Modal (Login Gilberto / Register Advisor) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegisterAdvisor={handleRegisterAdvisor}
      />


      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDeleteSale}
        title="¿Eliminar esta operación?"
        message="Esta acción removerá el registro permanentemente del seguimiento y recalculará las metas comerciales y comisiones."
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
