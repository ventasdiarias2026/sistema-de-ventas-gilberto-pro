import React, { useState } from 'react';
import { User } from '../types/telecom';
import { Shield, UserPlus, LogIn, X, AlertCircle, CheckCircle, Cloud, UserCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser?: User;
  onLogin: (user: User) => void;
  onRegisterAdvisor: (newUser: Omit<User, 'id' | 'createdAt'>) => Promise<User | null>;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLogin,
  onRegisterAdvisor,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('Gilberto');
  const [loginPassword, setLoginPassword] = useState('0903');
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'ASESOR' | 'ADMIN'>('ASESOR');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetUser = users.find(
      (u) =>
        u.username.trim().toLowerCase() === loginUsername.trim().toLowerCase() &&
        u.password === loginPassword
    );

    if (!targetUser) {
      setLoginError('Credenciales incorrectas. Para Administrador Principal usa Gilberto / 0903');
      return;
    }

    onLogin(targetUser);
    onClose();
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setRegError('Todos los campos son obligatorios para crear la cuenta');
      return;
    }

    // Check username duplication
    const exists = users.some(
      (u) => u.username.toLowerCase() === regUsername.trim().toLowerCase()
    );
    if (exists) {
      setRegError('El nombre de usuario ya se encuentra registrado. Elige otro.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await onRegisterAdvisor({
        name: regName.trim(),
        username: regUsername.trim(),
        password: regPassword.trim(),
        role: regRole,
      });

      if (!created) {
        setRegError('Error al guardar el usuario en el servidor en la nube.');
        setIsSubmitting(false);
        return;
      }

      setRegSuccess(
        `¡Usuario ${created.name} creado y sincronizado en la nube con éxito! ${
          isAdmin ? 'Ya puede iniciar sesión desde cualquier dispositivo.' : 'Iniciando sesión...'
        }`
      );

      setTimeout(() => {
        setIsSubmitting(false);
        if (!isAdmin) {
          onLogin(created);
        }
        onClose();
      }, 1200);
    } catch {
      setRegError('Error de red al sincronizar con la nube');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Control de Acceso & Nube
              </h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>Base de datos sincronizada por Internet</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-850/80 border-b border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-slate-800 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Crear Asesor (Admin)' : 'Registrar Asesor'}</span>
          </button>
        </div>

        {/* Tab 1: Iniciar Sesión */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-6 space-y-4 text-xs">
            {/* Quick helper for Gilberto */}
            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] text-slate-300">
              <span className="font-bold text-cyan-300">Administrador Principal:</span> Usuario{' '}
              <code className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">Gilberto</code>{' '}
              / Contraseña{' '}
              <code className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">0903</code>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Usuario Comercial
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Ej. Gilberto o tu usuario registrado"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Ingresa tu clave"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg shadow-md shadow-cyan-900/40 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar al Sistema (Nube)</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Registrar Asesor */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-750 text-[11px] text-slate-300 flex items-start gap-2">
              <Cloud className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                {isAdmin
                  ? 'Como Administrador Gilberto, puedes crear cuentas para cualquier asesor que tenga dificultades para registrarse. Se guardará de inmediato en la base de datos de la nube.'
                  : 'Crea tu cuenta de asesor comercial. Tus operaciones y metas quedarán guardadas en la nube y Gilberto podrá visualizarlas en el reporte global.'}
              </span>
            </div>

            {regError && (
              <div className="p-2.5 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{regSuccess}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Nombre Completo del Asesor
              </label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ej. Roberto Sánchez Poma"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Nombre de Usuario (para login desde cualquier lugar)
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Ej. rsanchez"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Define una contraseña"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Rol asignado:
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as 'ASESOR' | 'ADMIN')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ASESOR">Asesor Comercial (Espacio Privado)</option>
                  <option value="ADMIN">Administrador (Acceso Global)</option>
                </select>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg shadow-md shadow-emerald-900/40 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Guardando en la Nube...'
                    : isAdmin
                    ? 'Crear Usuario en la Nube'
                    : 'Crear Cuenta de Asesor'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

