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

// Authentication types
export interface User {
  name: string;
  enteredAt: string;
}

export interface AuthResponse {
  success: boolean;
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

// Authentication functions

/**
 * Login user with name
 * Sends name to backend and saves user data to localStorage
 */
export async function loginUser(name: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${URLs.apiBase}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Login failed'
      };
    }

    const data = await response.json();

    // Save to localStorage
    if (data.success && data.user) {
      localStorage.setItem('workspace-finder:user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to server'
    };
  }
}

/**
 * Get current user from localStorage
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    // Read from localStorage
    const userStr = localStorage.getItem('workspace-finder:user');
    if (!userStr) {
      return { success: true, user: null };
    }

    const user = JSON.parse(userStr);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid user data' };
  }
}