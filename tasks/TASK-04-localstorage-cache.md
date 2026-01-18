# TASK-04: localStorage кеширование данных

**Приоритет:** MEDIUM  
**Статус:** TODO  
**Зависимости:** TASK-02 (MongoDB интеграция)  
**Время выполнения:** ~2 часа

## Описание

Реализовать кеширование данных рабочих мест в localStorage для быстрой загрузки и offline просмотра. Кеш имеет TTL (Time To Live) 5 минут, после чего данные обновляются с сервера.

## Контекст

Согласно PRD, приложение должно работать быстро на мобильных устройствах (загрузка < 2 сек на 4G). Кеширование данных в localStorage снижает нагрузку на сервер и ускоряет повторные загрузки.

## Технические требования

### 1. Создать hook `useLocalStorageCache`:

**Файл:** `src/hooks/useLocalStorageCache.ts`

**Функциональность:**
- Сохранение данных в localStorage с timestamp
- Проверка TTL (5 минут)
- Автоматическая инвалидация устаревшего кеша
- Типобезопасность (generic типы)

### 2. Интегрировать в TableView:
- При загрузке сначала проверять кеш
- Если кеш валидный - показывать данные из кеша
- Параллельно делать запрос к API для обновления
- Если кеша нет или истек - загружать с API

### 3. Интегрировать в SearchBar:
- Кешировать последние результаты поиска
- Кеш по ключу `search:${type}:${query}`
- TTL: 5 минут

## Критерии приемки

### Функциональные:
- [ ] При первой загрузке TableView запрашивает данные с API
- [ ] Данные сохраняются в localStorage под ключом `workspace-finder:cache:workplaces`
- [ ] При повторной загрузке (в течение 5 минут) данные берутся из кеша
- [ ] Через 5 минут кеш инвалидируется и данные загружаются заново
- [ ] Результаты поиска кешируются по ключу `workspace-finder:cache:search:${type}:${query}`
- [ ] При изменении данных (например, после загрузки XLS) кеш очищается

### UI/UX:
- [ ] При загрузке из кеша не показывается spinner (данные появляются мгновенно)
- [ ] При обновлении данных с сервера UI плавно обновляется
- [ ] В консоли DevTools видно "Loaded from cache" при загрузке из кеша

### Технические:
- [ ] Hook `useLocalStorageCache` типизирован с generic `<T>`
- [ ] Обработка ошибок при чтении/записи localStorage
- [ ] Автоматическая очистка старых ключей кеша (> 24 часов)
- [ ] Размер кеша не превышает 5MB (проверка и очистка)

## Пример кода

```typescript
// src/hooks/useLocalStorageCache.ts

import { useState, useEffect } from 'react';

interface CacheData<T> {
  data: T;
  timestamp: number;
}

const CACHE_PREFIX = 'workspace-finder:cache:';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 минут

export function useLocalStorageCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = CACHE_PREFIX + key;

  const loadData = async (fromCache: boolean = true) => {
    try {
      // Проверяем кеш
      if (fromCache) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const cacheData: CacheData<T> = JSON.parse(cached);
          const age = Date.now() - cacheData.timestamp;

          if (age < ttl) {
            console.log(`Loaded from cache: ${key}`);
            setData(cacheData.data);
            setLoading(false);
            return;
          }
        }
      }

      // Загружаем с сервера
      setLoading(true);
      const freshData = await fetcher();

      // Сохраняем в кеш
      const cacheData: CacheData<T> = {
        data: freshData,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));

      setData(freshData);
      setError(null);
    } catch (err) {
      console.error(`Failed to load data for ${key}:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = () => {
    localStorage.removeItem(cacheKey);
    loadData(false);
  };

  useEffect(() => {
    loadData();
  }, [key]);

  return { data, loading, error, refresh: () => loadData(false), invalidateCache };
}
```

```typescript
// src/components/TableView.tsx (обновление)

import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import { getWorkplaces, Block } from '../api/workspaceApi';

export const TableView: React.FC<TableViewProps> = ({ refreshTrigger }) => {
  const { data, loading, error, refresh } = useLocalStorageCache<Block[]>(
    'workplaces',
    async () => {
      const response = await getWorkplaces();
      if (response.success) {
        return response.blocks;
      }
      throw new Error(response.error || 'Failed to load workplaces');
    }
  );

  useEffect(() => {
    if (refreshTrigger) {
      refresh();
    }
  }, [refreshTrigger]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <Alert status="error">{error}</Alert>;
  }

  const sortedBlocks = data ? [...data].sort((a, b) => a.code.localeCompare(b.code)) : [];

  return (
    <VStack spacing={6}>
      {/* ... остальной код ... */}
    </VStack>
  );
};
```

## Тестирование

### Тестирование TTL:
1. Открыть приложение, загрузить данные
2. Проверить localStorage - должна быть запись с timestamp
3. Обновить страницу - данные должны загрузиться мгновенно (из кеша)
4. Изменить timestamp в localStorage на -6 минут (старый кеш)
5. Обновить страницу - должна быть загрузка с API

### Тестирование инвалидации:
```javascript
// В консоли DevTools
localStorage.getItem('workspace-finder:cache:workplaces')
// Проверить наличие данных

// Очистить кеш
localStorage.removeItem('workspace-finder:cache:workplaces')

// Обновить страницу - должна быть загрузка с API
```

### Проверка размера кеша:
```javascript
// Проверить размер всех ключей workspace-finder
let totalSize = 0;
for (let key in localStorage) {
  if (key.startsWith('workspace-finder:cache:')) {
    totalSize += localStorage.getItem(key).length;
  }
}
console.log(`Cache size: ${totalSize / 1024} KB`);
```

## Дополнительные требования

### Очистка старого кеша:
Создать utility функцию для очистки всех ключей старше 24 часов:

```typescript
export function cleanupOldCache() {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 часа

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheData = JSON.parse(cached);
          if (now - cacheData.timestamp > maxAge) {
            localStorage.removeItem(key);
            console.log(`Removed old cache: ${key}`);
          }
        }
      } catch (error) {
        // Неправильный формат - удаляем
        localStorage.removeItem(key!);
      }
    }
  }
}
```

Вызывать `cleanupOldCache()` при инициализации приложения (в `app.tsx`).

## Связанные задачи

- Зависит от: TASK-02 (MongoDB интеграция)
- Используется в: TASK-06, TASK-07, TASK-08 (новые views будут использовать кеширование)
- Будет улучшено в: TASK-10 (оптимизация производительности)
