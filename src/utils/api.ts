import { User, Sale } from '../types/telecom';
import { getStoredSales, saveStoredSales, getStoredUsers, saveStoredUsers } from './storage';

const API_BASE = '/api';

export interface CloudStatus {
  online: boolean;
  message: string;
  lastSync: string | null;
}

export async function checkCloudStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      return Boolean(data.cloud);
    }
    return false;
  } catch {
    return false;
  }
}

export async function apiLogin(
  username: string,
  password: string
): Promise<{ user: User } | { error: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'Error al iniciar sesión en la nube' };
    }
    return { user: data.user };
  } catch (err) {
    console.warn('Network error logging in, falling back to local verification:', err);
    // Offline fallback
    const localUsers = getStoredUsers();
    const found = localUsers.find(
      (u) =>
        u.username.trim().toLowerCase() === username.trim().toLowerCase() &&
        u.password === password
    );
    if (found) {
      return { user: found };
    }
    return { error: 'No se pudo conectar al servidor en la nube ni verificar localmente.' };
  }
}

export async function apiFetchUsers(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const users: User[] = await res.json();
      saveStoredUsers(users); // keep local cache updated
      return users;
    }
  } catch (err) {
    console.warn('Cloud users fetch failed, using local cache:', err);
  }
  return getStoredUsers();
}

export async function apiCreateUser(
  userData: Omit<User, 'id' | 'createdAt'>
): Promise<{ user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'No se pudo registrar el usuario en la nube' };
    }
    return { user: data };
  } catch (err) {
    console.error('Error creating user in cloud:', err);
    return { error: 'Error de conexión al servidor en la nube' };
  }
}

export async function apiFetchSales(): Promise<Sale[]> {
  try {
    const res = await fetch(`${API_BASE}/sales`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const sales: Sale[] = await res.json();
      saveStoredSales(sales); // keep local cache updated
      return sales;
    }
  } catch (err) {
    console.warn('Cloud sales fetch failed, using local cache:', err);
  }
  return getStoredSales();
}

export async function apiCreateSale(
  saleData: Omit<Sale, 'id' | 'createdAt'>
): Promise<{ sale?: Sale; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'No se pudo registrar la venta en la nube' };
    }
    return { sale: data };
  } catch (err) {
    console.error('Error creating sale in cloud:', err);
    // Offline local fallback
    const localSale: Sale = {
      ...saleData,
      id: 'local_sale_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const current = getStoredSales();
    saveStoredSales([localSale, ...current]);
    return { sale: localSale };
  }
}

export async function apiUpdateSale(
  id: string,
  saleData: Partial<Sale>
): Promise<{ sale?: Sale; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saleData),
    });

    const data = await res.json();
    if (!res.ok) {
      return { error: data.error || 'No se pudo actualizar en la nube' };
    }
    return { sale: data };
  } catch (err) {
    console.error('Error updating sale in cloud:', err);
    return { error: 'Error de conexión al actualizar en la nube' };
  }
}

export async function apiDeleteSale(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/sales/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      return { success: true };
    }
    const data = await res.json();
    return { success: false, error: data.error };
  } catch (err) {
    console.error('Error deleting sale in cloud:', err);
    return { success: false, error: 'Error de conexión al eliminar' };
  }
}
