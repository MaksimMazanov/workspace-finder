# TASK-08: MapView (карта зон)

**Приоритет:** MEDIUM  
**Статус:** TODO  
**Зависимости:** TASK-02 (MongoDB), TASK-05 (ViewSwitcher)  
**Время выполнения:** ~2.5 часа

## Описание

Создать вид "Карта" - визуализация распределения рабочих мест по зонам (Open space 1, Open space 2, и т.д.). Показывает для каждой зоны: название, количество мест, занятость, список сотрудников в зоне.

## Контекст

Согласно PRD, пользователь должен видеть распределение мест по зонам для понимания географии офиса. Зоны - это поле `zone` в схеме (например, "Open space 29").

## Технические требования

### 1. Backend API:

**Endpoint:** `GET /api/zones`

**Реализация в `stubs/api/index.js`:**
- Запрос к MongoDB коллекции `workplaces`
- Группировка по полю `zone`
- Подсчет total и occupied для каждой зоны
- Сортировка зон по названию

**Response формат:**
```json
{
  "success": true,
  "zones": [
    {
      "name": "Open space 1",
      "type": "openspace",
      "totalPlaces": 20,
      "occupiedPlaces": 18,
      "blockCodes": ["5.А.01"],
      "places": [
        {
          "id": "...",
          "placeNumber": "5.А.01.001",
          "employeeName": "Иванов Иван Иванович",
          "department": "Департамент ИТ",
          "status": "occupied"
        }
      ]
    }
  ]
}
```

### 2. Frontend API (src/api/workspaceApi.ts):

Добавить типы и функцию:
```typescript
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

export async function getZones(): Promise<ZonesResponse>;
```

### 3. Frontend Component:

**Файл:** `src/components/MapView.tsx`

**Функциональность:**
- Grid карточек зон
- Каждая карточка: название зоны, статистика, progress bar
- Аккордеон для раскрытия списка мест в зоне
- Цветовая кодировка по занятости (как в CoworkingView)

### 4. UI компоненты:
- `Card` для каждой зоны
- `Accordion` для раскрытия списка мест
- `Progress` для визуализации занятости
- `Badge` для типа зоны (openspace, meeting room, etc.)

## Критерии приемки

### Функциональные (Backend):
- [ ] `GET /api/zones` возвращает список зон
- [ ] Зоны группируются по полю `zone`
- [ ] Подсчет totalPlaces и occupiedPlaces корректен
- [ ] Места в зоне отсортированы по placeNumber
- [ ] API работает за < 200ms

### Функциональные (Frontend):
- [ ] MapView отображает все зоны
- [ ] Для каждой зоны показывается: название, total, occupied, % занятости
- [ ] Progress bar визуализирует занятость
- [ ] Клик на зону раскрывает список мест
- [ ] Список мест показывает: placeNumber, employeeName, status
- [ ] Занятые места выделяются цветом (зеленый free, красный occupied)

### UI/UX:
- [ ] Заголовок: "Карта зон" с общей статистикой
- [ ] Grid: 1 колонка на мобильных, 2 на tablet, 3 на desktop
- [ ] Progress bar: зеленый < 50%, желтый 50-80%, красный > 80%
- [ ] Badge с типом зоны (синий для openspace)
- [ ] Анимация раскрытия аккордеона
- [ ] Loading и error states

### Технические:
- [ ] Используется Chakra UI v3
- [ ] Типизация TypeScript
- [ ] Используется useLocalStorageCache
- [ ] Компонент оптимизирован (React.memo для карточек)

## Пример кода

```javascript
// stubs/api/index.js

router.get('/zones', async (req, res) => {
  try {
    // Группируем по зонам
    const zonesResult = await collection.aggregate([
      {
        $group: {
          _id: '$zone',
          totalPlaces: { $sum: 1 },
          occupiedPlaces: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          },
          blockCodes: { $addToSet: '$blockCode' },
          places: { $push: '$$ROOT' }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    const zones = zonesResult.map(zone => ({
      name: zone._id,
      type: 'openspace', // Можно определить из данных
      totalPlaces: zone.totalPlaces,
      occupiedPlaces: zone.occupiedPlaces,
      blockCodes: zone.blockCodes.sort(),
      places: zone.places
        .sort((a, b) => a.placeNumber.localeCompare(b.placeNumber))
        .map(place => ({
          id: place._id.toString(),
          placeNumber: place.placeNumber,
          employeeName: place.employeeName || '',
          department: place.department || '',
          status: place.status
        }))
    }));

    res.json({
      success: true,
      zones
    });
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch zones'
    });
  }
});
```

```typescript
// src/components/MapView.tsx

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  HStack,
  Badge,
  Accordion,
  Progress,
  Spinner,
  Alert
} from '@chakra-ui/react';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import { getZones, Zone } from '../api/workspaceApi';

interface ZoneCardProps {
  zone: Zone;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone }) => {
  const occupancyPercent = (zone.occupiedPlaces / zone.totalPlaces) * 100;

  const getColorScheme = (percent: number) => {
    if (percent < 50) return 'green';
    if (percent < 80) return 'yellow';
    return 'red';
  };

  const getStatusColor = (status: string) => {
    return status === 'occupied' ? 'red' : 'green';
  };

  return (
    <Card.Root size="sm" bg="white" shadow="md">
      <Card.Header>
        <VStack align="start" spacing={2}>
          <HStack justify="space-between" w="100%">
            <Heading size="sm" color="blue.600">
              {zone.name}
            </Heading>
            <Badge colorScheme="blue" fontSize="xs">
              {zone.type}
            </Badge>
          </HStack>

          <Progress
            value={occupancyPercent}
            colorScheme={getColorScheme(occupancyPercent)}
            size="sm"
            w="100%"
          />

          <HStack spacing={4} fontSize="xs" color="gray.600">
            <Text>Всего: {zone.totalPlaces}</Text>
            <Text>Занято: {zone.occupiedPlaces}</Text>
            <Text>Свободно: {zone.totalPlaces - zone.occupiedPlaces}</Text>
          </HStack>

          <Text fontSize="xs" color="gray.500">
            Блоки: {zone.blockCodes.join(', ')}
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body pt={0}>
        <Accordion.Root collapsible>
          <Accordion.Item value="places">
            <Accordion.ItemTrigger>
              <Text fontSize="sm" fontWeight="semibold">
                Места в зоне ({zone.totalPlaces})
              </Text>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <VStack align="stretch" spacing={1} maxH="300px" overflowY="auto">
                {zone.places.map((place) => (
                  <HStack
                    key={place.id}
                    p={2}
                    bg="gray.50"
                    borderRadius="sm"
                    justify="space-between"
                  >
                    <VStack align="start" spacing={0}>
                      <Text fontSize="xs" fontWeight="semibold">
                        {place.placeNumber}
                      </Text>
                      {place.employeeName && (
                        <Text fontSize="xs" color="gray.600">
                          {place.employeeName}
                        </Text>
                      )}
                    </VStack>
                    <Badge
                      colorScheme={getStatusColor(place.status)}
                      variant="subtle"
                      fontSize="xs"
                    >
                      {place.status === 'occupied' ? 'Занято' : 'Свободно'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Card.Body>
    </Card.Root>
  );
};

export const MapView: React.FC = () => {
  const { data, loading, error } = useLocalStorageCache<Zone[]>(
    'zones',
    async () => {
      const response = await getZones();
      if (response.success) {
        return response.zones;
      }
      throw new Error(response.error || 'Failed to load zones');
    }
  );

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">Загрузка карты зон...</Text>
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

  const totalPlaces = data?.reduce((sum, zone) => sum + zone.totalPlaces, 0) || 0;
  const totalOccupied = data?.reduce((sum, zone) => sum + zone.occupiedPlaces, 0) || 0;

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Карта зон
        </Heading>
        <Text color="gray.600">
          Всего зон: {data?.length || 0} | Всего мест: {totalPlaces} | Занято: {totalOccupied}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {data?.map((zone) => (
          <ZoneCard key={zone.name} zone={zone} />
        ))}
      </SimpleGrid>
    </VStack>
  );
};
```

## Тестирование

### Backend тестирование:
```bash
curl http://localhost:8099/api/zones
# Проверить группировку по зонам, подсчет мест
```

### UI тестирование:
1. Открыть `/workspace-finder`
2. Переключиться на "Карта"
3. Проверить отображение карточек зон
4. Кликнуть на зону - раскрыть список мест
5. Проверить цветовую кодировку занятости
6. Проверить scroll в списке мест (если > 10 мест)
7. Проверить на мобильном

### Добавление тестовых данных:
В `seedDatabase()` убедиться, что есть места с разными зонами (Open space 1, Open space 2, и т.д.).

## Связанные задачи

- Зависит от: TASK-02 (MongoDB), TASK-05 (ViewSwitcher)
- Параллельно с: TASK-06 (CoworkingView), TASK-07 (StatsView)
- Использует: TASK-04 (localStorage cache)
