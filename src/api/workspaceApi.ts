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