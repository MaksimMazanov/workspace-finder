# TASK-05: ViewSwitcher (переключатель видов)

**Приоритет:** HIGH  
**Статус:** TODO  
**Зависимости:** Нет (независимая задача)  
**Время выполнения:** ~2 часа

## Описание

Создать компонент ViewSwitcher - переключатель видов отображения в формате bottom tabs. Пользователь может выбрать один из 4 видов: Таблица, Коворкинги, Статистика, Карта. Активный вид подсвечивается, переключение происходит без перезагрузки страницы.

## Контекст

Согласно PRD (User Story US-7), пользователь должен иметь возможность переключаться между 4 видами отображения данных. Bottom tabs - это стандартный UX паттерн для мобильных приложений.

## Технические требования

### 1. Создать компонент:

**Файл:** `src/components/ViewSwitcher.tsx`

**Вид (тип):**
```typescript
type ViewMode = 'table' | 'coworking' | 'stats' | 'map';

interface ViewSwitcherProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}
```

### 2. UI требования:
- 4 кнопки в горизонтальном ряду (HStack)
- Иконки для каждого вида (можно использовать эмоджи или react-icons)
- Текст под иконкой
- Активная кнопка выделяется цветом (blue.500)
- Неактивные кнопки серые (gray.500)
- Фиксированное положение внизу страницы (sticky bottom) на мобильных
- Адаптивный дизайн (на desktop можно показывать сверху)

### 3. Виды и иконки:
- **Таблица** (table): 📋 "Таблица"
- **Коворкинги** (coworking): 🏢 "Коворкинги"
- **Статистика** (stats): 📊 "Статистика"
- **Карта** (map): 🗺️ "Карта"

### 4. Интеграция в MainPage:
- Добавить state `activeView` в `src/pages/main/main.tsx`
- Передать `activeView` и `onViewChange` в ViewSwitcher
- Условно рендерить компоненты view в зависимости от `activeView`

## Критерии приемки

### Функциональные:
- [ ] ViewSwitcher отображает 4 кнопки с иконками и текстом
- [ ] При клике на кнопку вызывается `onViewChange` с соответствующим view
- [ ] Активный вид подсвечивается синим цветом
- [ ] Неактивные виды серые
- [ ] При переключении view меняется контент (TableView → CoworkingView и т.д.)
- [ ] URL не меняется при переключении (используется state, не routing)

### UI/UX:
- [ ] На мобильных (< 768px) ViewSwitcher фиксирован внизу экрана
- [ ] На desktop ViewSwitcher показывается над контентом
- [ ] Кнопки равномерно распределены по ширине
- [ ] Иконки размером 24px, текст 12px
- [ ] Плавная анимация при смене active состояния
- [ ] Высота ViewSwitcher: 60px на мобильных, 80px на desktop

### Технические:
- [ ] Компонент полностью типизирован (TypeScript)
- [ ] Используется Chakra UI v3 компоненты
- [ ] Нет prop drilling (activeView управляется в MainPage)
- [ ] Компонент можно переиспользовать

## Пример кода

```typescript
// src/components/ViewSwitcher.tsx

import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';

export type ViewMode = 'table' | 'coworking' | 'stats' | 'map';

interface ViewSwitcherProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

interface ViewButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ViewButton: React.FC<ViewButtonProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <VStack
      spacing={1}
      cursor="pointer"
      onClick={onClick}
      color={isActive ? 'blue.600' : 'gray.500'}
      _hover={{ color: isActive ? 'blue.700' : 'gray.700' }}
      transition="color 0.2s"
      flex={1}
      py={2}
    >
      <Text fontSize="2xl">{icon}</Text>
      <Text fontSize="xs" fontWeight={isActive ? 'semibold' : 'normal'}>
        {label}
      </Text>
    </VStack>
  );
};

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, onViewChange }) => {
  const views: Array<{ id: ViewMode; icon: string; label: string }> = [
    { id: 'table', icon: '📋', label: 'Таблица' },
    { id: 'coworking', icon: '🏢', label: 'Коворкинги' },
    { id: 'stats', icon: '📊', label: 'Статистика' },
    { id: 'map', icon: '🗺️', label: 'Карта' },
  ];

  return (
    <Box
      position={{ base: 'sticky', md: 'static' }}
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      shadow="md"
      zIndex={10}
    >
      <HStack spacing={0} justify="space-around" maxW="container.xl" mx="auto">
        {views.map((view) => (
          <ViewButton
            key={view.id}
            icon={view.icon}
            label={view.label}
            isActive={activeView === view.id}
            onClick={() => onViewChange(view.id)}
          />
        ))}
      </HStack>
    </Box>
  );
};
```

```typescript
// src/pages/main/main.tsx (обновление)

import { useState } from 'react';
import { ViewSwitcher, ViewMode } from '../../components/ViewSwitcher';
// import { CoworkingView } from '../../components/CoworkingView'; // TASK-06
// import { StatsView } from '../../components/StatsView'; // TASK-07
// import { MapView } from '../../components/MapView'; // TASK-08

export const MainPage = () => {
  const [searchResults, setSearchResults] = useState<Workplace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('table');

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
  };

  return (
    <Box minH="100vh" bg="gray.50" pb={{ base: '70px', md: 0 }}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Заголовок */}
          <Box textAlign="center">
            <Heading size="xl" color="blue.600" mb={2}>
              WorkspaceFinder
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Найдите рабочее место по ФИО сотрудника или номеру места
            </Text>
          </Box>

          {/* Поиск */}
          <Box display="flex" justifyContent="center">
            <SearchBar onResults={handleSearchResults} onLoading={handleSearchLoading} />
          </Box>

          {/* Результаты поиска */}
          {searchResults.length > 0 && (
            <>
              <Separator />
              <Box>
                <Heading size="md" mb={4} color="blue.600">
                  Результаты поиска ({searchResults.length})
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {searchResults.map((workplace) => (
                    <ResultCard key={workplace.id} workplace={workplace} />
                  ))}
                </SimpleGrid>
              </Box>
            </>
          )}

          {/* Разделитель */}
          <Separator />

          {/* Отображение активного вида */}
          {activeView === 'table' && <TableView />}
          {activeView === 'coworking' && <Text>CoworkingView - TODO TASK-06</Text>}
          {activeView === 'stats' && <Text>StatsView - TODO TASK-07</Text>}
          {activeView === 'map' && <Text>MapView - TODO TASK-08</Text>}
        </VStack>
      </Container>

      {/* ViewSwitcher внизу */}
      <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
    </Box>
  );
};
```

## Тестирование

### Ручное тестирование:
1. Открыть `/workspace-finder`
2. Проверить, что ViewSwitcher отображается внизу (мобильный) или над контентом (desktop)
3. Кликнуть на "Таблица" - должен быть активный (синий)
4. Кликнуть на "Коворкинги" - должен стать активным, "Таблица" серой
5. Проверить на мобильном (DevTools responsive mode)
6. Проверить hover эффект на кнопках

### Responsive тестирование:
- iPhone SE (375px): ViewSwitcher внизу, кнопки помещаются
- iPad (768px): ViewSwitcher вверху
- Desktop (1200px): ViewSwitcher вверху, больше padding

## Связанные задачи

- Используется в: TASK-06 (CoworkingView), TASK-07 (StatsView), TASK-08 (MapView)
- Не зависит от других задач - можно делать параллельно
