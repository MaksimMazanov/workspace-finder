# TASK-07: StatsView (вид статистики)

**Приоритет:** MEDIUM  
**Статус:** TODO  
**Зависимости:** TASK-02 (MongoDB), TASK-05 (ViewSwitcher)  
**Время выполнения:** ~2 часа

## Описание

Создать вид "Статистика" - общие показатели по всем рабочим местам. Показывает: общее количество мест, количество занятых мест, статистику по блокам, статистику по коворкингам, распределение по типам мест.

## Контекст

Согласно PRD (User Story US-6 косвенно), пользователь должен видеть общую статистику для понимания загруженности офиса. Это dashboard с ключевыми метриками.

## Технические требования

### 1. Backend API:

**Endpoint:** `GET /api/stats`

**Реализация в `stubs/api/index.js`:**
- Запрос к MongoDB коллекции `workplaces`
- Aggregation для подсчета различных метрик
- Группировка по blockCode для статистики по блокам
- Группировка по type для статистики по типам

**Response формат:**
```json
{
  "success": true,
  "totalPlaces": 250,
  "occupiedPlaces": 220,
  "freePlaces": 30,
  "coworkingPlaces": 90,
  "occupiedCoworking": 37,
  "blockStats": {
    "5.А.01": { "total": 65, "occupied": 60, "free": 5 },
    "5.А.02": { "total": 60, "occupied": 55, "free": 5 },
    "5.В.01": { "total": 65, "occupied": 62, "free": 3 },
    "5.В.02": { "total": 60, "occupied": 55, "free": 5 }
  },
  "typeStats": {
    "Openspace": { "total": 160, "occupied": 150 },
    "Coworking": { "total": 90, "occupied": 37 }
  }
}
```

### 2. Frontend API (src/api/workspaceApi.ts):

Добавить типы и функцию:
```typescript
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

export async function getStats(): Promise<StatsResponse>;
```

### 3. Frontend Component:

**Файл:** `src/components/StatsView.tsx`

**Секции:**
1. **Общая статистика** - большие цифры (total, occupied, free)
2. **Статистика по блокам** - таблица с breakdown по блокам
3. **Статистика по типам** - pie chart или bars (Openspace vs Coworking)
4. **Процент занятости** - progress bar общей занятости

### 4. UI компоненты:
- `StatCard` - карточка для одной метрики (большая цифра + описание)
- `Table` для блоков
- `Progress` для занятости

## Критерии приемки

### Функциональные (Backend):
- [ ] `GET /api/stats` возвращает все метрики
- [ ] Подсчет totalPlaces корректен
- [ ] Подсчет occupiedPlaces корректен (только status === 'occupied')
- [ ] blockStats содержит данные по всем 4 блокам
- [ ] typeStats содержит данные по типам мест
- [ ] API работает за < 150ms

### Функциональные (Frontend):
- [ ] StatsView отображает общую статистику (total, occupied, free)
- [ ] Показывается процент занятости с progress bar
- [ ] Таблица блоков показывает каждый блок с total/occupied/free
- [ ] Статистика по типам показывает Openspace и Coworking
- [ ] Цифры форматируются правильно (пробелы для тысяч)
- [ ] Если данных нет, показывается placeholder

### UI/UX:
- [ ] Заголовок: "Статистика рабочих мест"
- [ ] 3 карточки вверху: Всего мест, Занято, Свободно (крупные цифры)
- [ ] Progress bar общей занятости (зеленый < 70%, желтый 70-85%, красный > 85%)
- [ ] Таблица блоков с чередующимися строками (striped)
- [ ] Адаптивный дизайн: grid 1 колонка на мобильных, 3 на desktop
- [ ] Иконки для каждой метрики (📊, 👥, ✅)

### Технические:
- [ ] Используется Chakra UI v3 компоненты
- [ ] Типизация TypeScript
- [ ] Используется useLocalStorageCache для кеширования
- [ ] Компоненты разделены (StatCard отдельно)

## Пример кода

```javascript
// stubs/api/index.js

router.get('/stats', async (req, res) => {
  try {
    // Общая статистика
    const totalPlaces = await collection.countDocuments();
    const occupiedPlaces = await collection.countDocuments({ status: 'occupied' });
    const freePlaces = totalPlaces - occupiedPlaces;

    // Статистика по блокам
    const blockStatsResult = await collection.aggregate([
      {
        $group: {
          _id: '$blockCode',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const blockStats = {};
    blockStatsResult.forEach(block => {
      blockStats[block._id] = {
        total: block.total,
        occupied: block.occupied,
        free: block.total - block.occupied
      };
    });

    // Статистика по типам
    const typeStatsResult = await collection.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          occupied: {
            $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] }
          }
        }
      }
    ]).toArray();

    const typeStats = {};
    typeStatsResult.forEach(type => {
      typeStats[type._id] = {
        total: type.total,
        occupied: type.occupied
      };
    });

    // Коворкинги
    const coworkingPlaces = await collection.countDocuments({ type: 'Coworking' });
    const occupiedCoworking = await collection.countDocuments({ 
      type: 'Coworking', 
      status: 'occupied' 
    });

    res.json({
      success: true,
      totalPlaces,
      occupiedPlaces,
      freePlaces,
      coworkingPlaces,
      occupiedCoworking,
      blockStats,
      typeStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    });
  }
});
```

```typescript
// src/components/StatsView.tsx

import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Table,
  Card,
  Progress,
  Spinner,
  Alert
} from '@chakra-ui/react';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import { getStats, StatsResponse } from '../api/workspaceApi';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  colorScheme?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, colorScheme = 'blue' }) => {
  return (
    <Card.Root size="sm" bg="white" shadow="md">
      <Card.Body>
        <VStack spacing={2}>
          <Text fontSize="3xl">{icon}</Text>
          <Heading size="2xl" color={`${colorScheme}.600`}>
            {value.toLocaleString()}
          </Heading>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            {label}
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export const StatsView: React.FC = () => {
  const { data, loading, error } = useLocalStorageCache<StatsResponse>(
    'stats',
    async () => {
      const response = await getStats();
      if (response.success) {
        return response;
      }
      throw new Error(response.error || 'Failed to load stats');
    }
  );

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">Загрузка статистики...</Text>
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

  const occupancyPercent = data
    ? (data.occupiedPlaces / data.totalPlaces) * 100
    : 0;

  const getOccupancyColor = (percent: number) => {
    if (percent < 70) return 'green';
    if (percent < 85) return 'yellow';
    return 'red';
  };

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Статистика рабочих мест
        </Heading>
        <Text color="gray.600">Общая информация о занятости офиса</Text>
      </Box>

      {/* Основные метрики */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard icon="📊" label="Всего мест" value={data?.totalPlaces || 0} />
        <StatCard icon="👥" label="Занято" value={data?.occupiedPlaces || 0} colorScheme="red" />
        <StatCard icon="✅" label="Свободно" value={data?.freePlaces || 0} colorScheme="green" />
      </SimpleGrid>

      {/* Процент занятости */}
      <Card.Root size="sm" bg="white" shadow="md">
        <Card.Body>
          <VStack align="stretch" spacing={3}>
            <Heading size="sm" color="blue.600">
              Общая занятость
            </Heading>
            <Progress
              value={occupancyPercent}
              colorScheme={getOccupancyColor(occupancyPercent)}
              size="lg"
            />
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {occupancyPercent.toFixed(1)}% занято
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Статистика по блокам */}
      <Card.Root size="sm" bg="white" shadow="md">
        <Card.Header>
          <Heading size="sm" color="blue.600">
            Статистика по блокам
          </Heading>
        </Card.Header>
        <Card.Body pt={0}>
          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Блок</Table.ColumnHeader>
                <Table.ColumnHeader>Всего</Table.ColumnHeader>
                <Table.ColumnHeader>Занято</Table.ColumnHeader>
                <Table.ColumnHeader>Свободно</Table.ColumnHeader>
                <Table.ColumnHeader>%</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data &&
                Object.entries(data.blockStats)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([blockCode, stats]) => {
                    const percent = (stats.occupied / stats.total) * 100;
                    return (
                      <Table.Row key={blockCode}>
                        <Table.Cell fontWeight="semibold">{blockCode}</Table.Cell>
                        <Table.Cell>{stats.total}</Table.Cell>
                        <Table.Cell>{stats.occupied}</Table.Cell>
                        <Table.Cell>{stats.free}</Table.Cell>
                        <Table.Cell>{percent.toFixed(0)}%</Table.Cell>
                      </Table.Row>
                    );
                  })}
            </Table.Body>
          </Table.Root>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};
```

## Тестирование

### Backend тестирование:
```bash
curl http://localhost:8099/api/stats
# Проверить все метрики, суммы должны сходиться
```

### UI тестирование:
1. Открыть `/workspace-finder`
2. Переключиться на "Статистика"
3. Проверить отображение 3 карточек с цифрами
4. Проверить progress bar (цвет зависит от %)
5. Проверить таблицу блоков
6. Проверить на мобильном (карточки друг под другом)

### Проверка корректности подсчета:
- Сумма occupied по всем блокам = totalOccupied
- totalPlaces = occupiedPlaces + freePlaces
- Проценты корректны

## Связанные задачи

- Зависит от: TASK-02 (MongoDB), TASK-05 (ViewSwitcher)
- Параллельно с: TASK-06 (CoworkingView), TASK-08 (MapView)
- Использует: TASK-04 (localStorage cache)
