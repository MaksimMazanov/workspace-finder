// API для работы с рабочими местами
import { URLs } from '../__data__/urls';
import { safeFetch, handleApiResponse, getErrorMessage, isApiError } from '../utils/errorHandler';

export interface Workplace {
  id: string;
  placeNumber: string;
  zone: string;
  blockCode: string;
  type: string;
  employeeName: string;
  department: string;
  team: string;
  position: string;
  status: string;
}

export interface SearchResponse {
  success: boolean;
  count: number;
  results: Workplace[];
  error?: string;
}

export interface Block {
  code: string;
  name: string;
  places: Workplace[];
  total: number;
  occupied: number;
}

export interface WorkplacesResponse {
  success: boolean;
  blocks: Block[];
  error?: string;
}

export interface CoworkingPlace {
  id: string;
  placeNumber: string;
  employeeName: string;
  department: string;
  team: string;
}

export interface Coworking {
  id: string;
  name: string;
  total: number;
  occupied: number;
  places: CoworkingPlace[];
}

export interface CoworkingsResponse {
  success: boolean;
  total: number;
  totalOccupied: number;
  coworkings: Coworking[];
  error?: string;
}

export interface ZonePlace {
  id: string;
  placeNumber: string;
  employeeName: string;
  department: string;
  status: string;
}

export interface Zone {
  name: string;
  type: string;
  totalPlaces: number;
  occupiedPlaces: number;
  blockCodes: string[];
  places: ZonePlace[];
}

export interface ZonesResponse {
  success: boolean;
  zones: Zone[];
  error?: string;
}

export interface BlockStat {
  total: number;
  occupied: number;
  free: number;
}

export interface TypeStat {
  total: number;
  occupied: number;
}

export interface StatsResponse {
  success: boolean;
  totalPlaces: number;
  occupiedPlaces: number;
  freePlaces: number;
  coworkingPlaces: number;
  occupiedCoworking: number;
  blockStats: Record<string, BlockStat>;
  typeStats: Record<string, TypeStat>;
  error?: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User | null;
  error?: string;
}

export interface UploadResponse {
  success: boolean;
  total?: number;
  inserted?: number;
  updated?: number;
  errors?: Array<{ row: number; error: string }>;
  error?: string;
}

export interface ImportLog {
  id: string;
  fileName: string;
  userName: string;
  timestamp: string;
  totalRows: number;
  inserted: number;
  updated: number;
  errors: number;
  status: 'success' | 'partial' | 'failed';
}

export interface ImportsResponse {
  success: boolean;
  imports: ImportLog[];
  error?: string;
}

// Базовый URL API

// Поиск по ФИО или номеру места
export async function searchWorkplaces(type: 'name' | 'place', query: string): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams();
    params.set('type', type);
    params.set('q', query);

    const result = await safeFetch<SearchResponse>(
      `${URLs.apiBase}/search?${params.toString()}`
    );

    if (!result.success) {
      return {
        success: false,
        count: 0,
        results: [],
        error: result.error
      };
    }

    return result.data || { success: true, count: 0, results: [] };
  } catch (error) {
    return {
      success: false,
      count: 0,
      results: [],
      error: getErrorMessage(error)
    };
  }
}

// Получить все места по блокам
export async function getWorkplaces(): Promise<WorkplacesResponse> {
  try {
    const params = new URLSearchParams();
    params.set('view', 'table');

    const result = await safeFetch<WorkplacesResponse>(
      `${URLs.apiBase}/workplaces?${params.toString()}`
    );

    if (!result.success) {
      return {
        success: false,
        blocks: [],
        error: result.error
      };
    }

    return result.data || { success: true, blocks: [] };
  } catch (error) {
    return {
      success: false,
      blocks: [],
      error: getErrorMessage(error)
    };
  }
}

// Получить список коворкингов
export async function getCoworkings(): Promise<CoworkingsResponse> {
  try {
    const result = await safeFetch<CoworkingsResponse>(
      `${URLs.apiBase}/coworkings`
    );

    if (!result.success) {
      return {
        success: false,
        total: 0,
        totalOccupied: 0,
        coworkings: [],
        error: result.error
      };
    }

    return result.data || { success: true, total: 0, totalOccupied: 0, coworkings: [] };
  } catch (error) {
    return {
      success: false,
      total: 0,
      totalOccupied: 0,
      coworkings: [],
      error: getErrorMessage(error)
    };
  }
}

// Получить список зон
export async function getZones(): Promise<ZonesResponse> {
  try {
    const result = await safeFetch<ZonesResponse>(
      `${URLs.apiBase}/zones`
    );

    if (!result.success) {
      return {
        success: false,
        zones: [],
        error: result.error
      };
    }

    return result.data || { success: true, zones: [] };
  } catch (error) {
    return {
      success: false,
      zones: [],
      error: getErrorMessage(error)
    };
  }
}

// Получить статистику по рабочим местам
export async function getStats(): Promise<StatsResponse> {
  try {
    const result = await safeFetch<StatsResponse>(
      `${URLs.apiBase}/stats`
    );

    if (!result.success) {
      return {
        success: false,
        totalPlaces: 0,
        occupiedPlaces: 0,
        freePlaces: 0,
        coworkingPlaces: 0,
        occupiedCoworking: 0,
        blockStats: {},
        typeStats: {},
        error: result.error
      };
    }

    return result.data || {
      success: true,
      totalPlaces: 0,
      occupiedPlaces: 0,
      freePlaces: 0,
      coworkingPlaces: 0,
      occupiedCoworking: 0,
      blockStats: {},
      typeStats: {}
    };
  } catch (error) {
    return {
      success: false,
      totalPlaces: 0,
      occupiedPlaces: 0,
      freePlaces: 0,
      coworkingPlaces: 0,
      occupiedCoworking: 0,
      blockStats: {},
      typeStats: {},
      error: getErrorMessage(error)
    };
  }
}

// Authentication functions

/**
 * Login user with email and password
 * Returns JWT token and user data
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const url = `${URLs.apiBase}/auth/login`;
    
    const result = await safeFetch<{ token: string }>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!result.success) {
      console.warn('Login failed:', { url, code: 'code' in result ? result.code : undefined, error: result.error });
      return {
        success: false,
        error: result.error
      };
    }

    const data = result.data as unknown as { token?: string; success?: boolean; error?: string } | undefined;

    if (!data || data.success === false) {
      console.warn('Login rejected by API:', { url, error: data?.error });
      return {
        success: false,
        error: data?.error || 'Неверный email или пароль'
      };
    }
    
    // Save JWT token to localStorage
    if (!data.token) {
      console.warn('Login response missing token:', { url });
      return {
        success: false,
        error: 'Неверный email или пароль'
      };
    }

    localStorage.setItem('accessToken', data.token);

    return { success: true, token: data.token };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

/**
 * Get current user info using JWT token
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return { success: true, user: null };
    }

    const url = `${URLs.apiBase}/auth/me`;
    const result = await safeFetch<User>(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!result.success) {
      // Token is invalid or expired, remove it
      localStorage.removeItem('accessToken');
      return { success: true, user: null };
    }

    return { success: true, user: result.data };
  } catch (error) {
    // Network error but user might still be logged in
    return { success: true, user: null };
  }
}

export async function uploadWorkplacesFile(
  file: File,
  userName: string
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userName', userName);

    const result = await safeFetch<UploadResponse>(
      `${URLs.apiBase}/admin/upload`,
      {
        method: 'POST',
        body: formData,
        credentials: 'include'
      }
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error
      };
    }

    return result.data || { success: true };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}

export async function getImportHistory(): Promise<ImportsResponse> {
  try {
    const result = await safeFetch<ImportsResponse>(
      `${URLs.apiBase}/admin/imports`,
      {
        credentials: 'include'
      }
    );

    if (!result.success) {
      return {
        success: false,
        imports: [],
        error: result.error
      };
    }

    return result.data || { success: true, imports: [] };
  } catch (error) {
    return {
      success: false,
      imports: [],
      error: getErrorMessage(error)
    };
  }
}
