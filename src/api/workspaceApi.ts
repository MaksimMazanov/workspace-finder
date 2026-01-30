// API для работы с рабочими местами
import { URLs } from '../__data__/urls';

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

// Базовый URL API

// Поиск по ФИО или номеру места
export async function searchWorkplaces(type: 'name' | 'place', query: string): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('q', query);

  const response = await fetch(`${URLs.apiBase}/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

// Получить все места по блокам
export async function getWorkplaces(): Promise<WorkplacesResponse> {
  const params = new URLSearchParams();
  params.set('view', 'table');

  const response = await fetch(`${URLs.apiBase}/workplaces?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

// Получить список коворкингов
export async function getCoworkings(): Promise<CoworkingsResponse> {
  const response = await fetch(`${URLs.apiBase}/coworkings`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

// Получить список зон
export async function getZones(): Promise<ZonesResponse> {
  const response = await fetch(`${URLs.apiBase}/zones`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

// Получить статистику по рабочим местам
export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${URLs.apiBase}/stats`);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return await response.json();
}

// Authentication functions

/**
 * Login user with email and password
 * Returns JWT token and user data
 */
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const url = `${URLs.apiBase}/auth/login`;
    console.log('Login request URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    console.log('Login response status:', response.status);
    console.log('Login response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login error response:', errorData);
      return {
        success: false,
        error: errorData.error || 'Login failed'
      };
    }

    const data = await response.json();
    console.log('Login success:', data);

    // Save JWT token to localStorage
    if (data.token) {
      localStorage.setItem('accessToken', data.token);
    }

    return { success: true, token: data.token };
  } catch (error) {
    console.error('Login exception:', error);
    return {
      success: false,
      error: `Failed to connect to server: ${error instanceof Error ? error.message : String(error)}`
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
      return { success: false, user: null };
    }

    const url = `${URLs.apiBase}/auth/me`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      // Token is invalid, remove it
      localStorage.removeItem('accessToken');
      return { success: false, user: null };
    }

    const data = await response.json();
    return { success: true, user: data };
  } catch (error) {
    return { success: false, error: 'Failed to get user info' };
  }
}
