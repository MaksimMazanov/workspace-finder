# TASK-06: CoworkingView (вид коворкингов)

**Приоритет:** HIGH  
**Статус:** TODO  
**Зависимости:** TASK-02 (MongoDB), TASK-05 (ViewSwitcher)  
**Время выполнения:** ~3 часа

## Описание

Создать вид "Коворкинги" - список всех коворкингов с количеством занятых и свободных мест. Показывает детальную информацию о каждом коворкинге: общее количество мест, сколько занято, список занятых мест с сотрудниками.

## Контекст

Согласно PRD (User Story US-5), пользователь должен видеть статус всех коворкингов (90 мест), чтобы узнать, есть ли свободные места. Коворкинги - это особый тип рабочих мест (type: "Coworking" в схеме).

## Технические требования

### 1. Backend API:

**Endpoint:** `GET /api/coworkings`

**Реализация в `stubs/api/index.js`:**
- Запрос к MongoDB коллекции `workplaces`
- Фильтр: `{ type: "Coworking" }`
- Группировка по полю `coworkingType` (например, "Coworking-1", "Coworking-2")
- Подсчет total и occupied для каждого коворкинга
- Возврат списка занятых мест с employeeName

**Response формат:**
```json
{
  "success": true,
  "total": 90,
  "totalOccupied": 37,
  "coworkings": [
    {
      "id": "coworking-1",
      "name": "Coworking-1",
      "total": 53,
      "occupied": 37,
      "places": [
        {
          "id": "...",
          "placeNumber": "5.А.02.200",
          "employeeName": "Петров Петр Петрович",
          "department": "Департамент ИТ",
          "team": "Backend"
        }
      ]
    }
  ]
}
```

### 2. Frontend API (src/api/workspaceApi.ts):

Добавить типы и функцию:
```typescript
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

export async function getCoworkings(): Promise<CoworkingsResponse>;
```

### 3. Frontend Components:

**Файл 1:** `src/components/CoworkingCard.tsx`
- Карточка одного коворкинга
- Заголовок с названием и статистикой
- Аккордеон для раскрытия списка занятых мест
- Progress bar показывает % занятости

**Файл 2:** `src/components/CoworkingView.tsx`
- Контейнер для всех коворкингов
- Заголовок с общей статистикой
- Grid из CoworkingCard
- Loading state, error state

### 4. Интеграция:
- Подключить CoworkingView в `src/pages/main/main.tsx`
- Условный рендер: `{activeView === 'coworking' && <CoworkingView />}`

## Критерии приемки

### Функциональные (Backend):
- [ ] `GET /api/coworkings` возвращает список коворкингов
- [ ] Коворкинги группируются по полю `coworkingType`
- [ ] Подсчет total и occupied корректен
- [ ] Места отсортированы по placeNumber
- [ ] API работает за < 200ms на 1000 записей

### Функциональные (Frontend):
- [ ] CoworkingView отображает все коворкинги
- [ ] Для каждого коворкинга показывается: название, total, occupied, % занятости
- [ ] Progress bar визуализирует занятость
- [ ] Клик на коворкинг раскрывает список занятых мест
- [ ] Список занятых мест показывает: placeNumber, employeeName, department
- [ ] Если коворкинг пустой (occupied = 0), показывается "Все места свободны"

### UI/UX:
- [ ] Заголовок: "Коворкинги" с общей статистикой (всего 90 мест, занято 37)
- [ ] Grid: 1 колонка на мобильных, 2 на tablet, 3 на desktop
- [ ] Progress bar: зеленый если < 50%, желтый 50-80%, красный > 80%
- [ ] Анимация раскрытия аккордеона плавная
- [ ] Loading spinner при загрузке
- [ ] Alert с ошибкой если API недоступен

### Технические:
- [ ] Используется Chakra UI v3 компоненты (Accordion.Root, Accordion.Item и т.д.)
- [ ] Типизация TypeScript без any
- [ ] Компоненты React.memo для оптимизации
- [ ] Используется useLocalStorageCache из TASK-04 для кеширования

## Пример кода

```javascript
// stubs/api/index.js

router.get('/coworkings', async (req, res) => {
  try {
    // Получаем все коворкинги
    const coworkingPlaces = await collection
      .find({ type: 'Coworking' })
      .sort({ coworkingType: 1, placeNumber: 1 })
      .toArray();

    // Группируем по coworkingType
    const coworkingsMap = new Map();

    coworkingPlaces.forEach(place => {
      const coworkingName = place.coworkingType || 'Unknown';
      
      if (!coworkingsMap.has(coworkingName)) {
        coworkingsMap.set(coworkingName, {
          id: coworkingName.toLowerCase().replace(/\s+/g, '-'),
          name: coworkingName,
          total: 0,
          occupied: 0,
          places: []
        });
      }

      const coworking = coworkingsMap.get(coworkingName);
      coworking.total++;

      if (place.status === 'occupied' && place.employeeName) {
        coworking.occupied++;
        coworking.places.push({
          id: place._id.toString(),
          placeNumber: place.placeNumber,
          employeeName: place.employeeName,
          department: place.department || '',
          team: place.team || ''
        });
      }
    });

    const coworkings = Array.from(coworkingsMap.values());
    const totalOccupied = coworkings.reduce((sum, c) => sum + c.occupied, 0);
    const total = coworkings.reduce((sum, c) => sum + c.total, 0);

    res.json({
      success: true,
      total,
      totalOccupied,
      coworkings
    });
  } catch (error) {
    console.error('Error fetching coworkings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coworkings'
    });
  }
});
```

```typescript
// src/components/CoworkingCard.tsx

import React from 'react';
import {
  Box,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Accordion,
  Progress
} from '@chakra-ui/react';
import { Coworking } from '../api/workspaceApi';

interface CoworkingCardProps {
  coworking: Coworking;
}

export const CoworkingCard: React.FC<CoworkingCardProps> = ({ coworking }) => {
  const occupancyPercent = (coworking.occupied / coworking.total) * 100;
  
  const getColorScheme = (percent: number) => {
    if (percent < 50) return 'green';
    if (percent < 80) return 'yellow';
    return 'red';
  };

  return (
    <Card.Root size="sm" bg="white" shadow="md">
      <Card.Header>
        <VStack align="start" spacing={2}>
          <HStack justify="space-between" w="100%">
            <Heading size="md" color="blue.600">
              {coworking.name}
            </Heading>
            <Badge colorScheme={getColorScheme(occupancyPercent)} fontSize="sm">
              {coworking.occupied}/{coworking.total}
            </Badge>
          </HStack>
          
          <Progress
            value={occupancyPercent}
            colorScheme={getColorScheme(occupancyPercent)}
            size="sm"
            w="100%"
          />
          
          <Text fontSize="sm" color="gray.600">
            Занято: {coworking.occupied} | Свободно: {coworking.total - coworking.occupied}
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body pt={0}>
        {coworking.occupied > 0 ? (
          <Accordion.Root collapsible>
            <Accordion.Item value="places">
              <Accordion.ItemTrigger>
                <Text fontSize="sm" fontWeight="semibold">
                  Занятые места ({coworking.occupied})
                </Text>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <VStack align="stretch" spacing={2}>
                  {coworking.places.map((place) => (
                    <Box key={place.id} p={2} bg="gray.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="semibold">
                        {place.placeNumber} - {place.employeeName}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {place.department}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        ) : (
          <Text fontSize="sm" color="green.600" fontWeight="semibold">
            ✅ Все места свободны
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
};
```

```typescript
// src/components/CoworkingView.tsx

import React from 'react';
import { Box, VStack, Heading, Text, SimpleGrid, Spinner, Alert } from '@chakra-ui/react';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import { getCoworkings, Coworking } from '../api/workspaceApi';
import { CoworkingCard } from './CoworkingCard';

export const CoworkingView: React.FC = () => {
  const { data, loading, error } = useLocalStorageCache<{
    total: number;
    totalOccupied: number;
    coworkings: Coworking[];
  }>(
    'coworkings',
    async () => {
      const response = await getCoworkings();
      if (response.success) {
        return {
          total: response.total,
          totalOccupied: response.totalOccupied,
          coworkings: response.coworkings
        };
      }
      throw new Error(response.error || 'Failed to load coworkings');
    }
  );

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">Загрузка коворкингов...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Ошибка загрузки!</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Коворкинги
        </Heading>
        <Text color="gray.600">
          Всего мест: {data?.total || 0} | Занято: {data?.totalOccupied || 0} | Свободно:{' '}
          {(data?.total || 0) - (data?.totalOccupied || 0)}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {data?.coworkings.map((coworking) => (
          <CoworkingCard key={coworking.id} coworking={coworking} />
        ))}
      </SimpleGrid>
    </VStack>
  );
};
```

## Тестирование

### Backend тестирование:
```bash
curl http://localhost:8099/api/coworkings
# Проверить структуру response, подсчет занятых мест
```

### UI тестирование:
1. Открыть `/workspace-finder`
2. Переключиться на вкладку "Коворкинги"
3. Проверить отображение карточек
4. Кликнуть на коворкинг - раскрыть список мест
5. Проверить progress bar цвета
6. Проверить на мобильном (1 колонка)

### Добавление тестовых данных коворкингов:
В `seedDatabase()` добавить несколько записей с `type: "Coworking"` и `coworkingType: "Coworking-1"`.

## Связанные задачи

- Зависит от: TASK-02 (MongoDB), TASK-05 (ViewSwitcher)
- Параллельно с: TASK-07 (StatsView), TASK-08 (MapView)
- Использует: TASK-04 (localStorage cache)
