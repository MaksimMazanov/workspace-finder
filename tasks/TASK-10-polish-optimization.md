# TASK-10: Полировка и оптимизация

**Приоритет:** MEDIUM  
**Статус:** TODO  
**Зависимости:** Все предыдущие задачи (TASK-01 to TASK-09)  
**Время выполнения:** ~3 часа

## Описание

Финальная полировка приложения: оптимизация производительности, улучшение обработки ошибок, добавление недостающих UX элементов, проверка и исправление всех найденных багов, настройка production build.

## Контекст

После реализации всех основных функций необходимо убедиться, что приложение работает плавно, без ошибок, быстро загружается и имеет хороший UX. Это последний этап перед релизом MVP.

## Технические требования

### 1. Оптимизация производительности:

**Frontend:**
- [ ] Добавить React.memo для всех крупных компонентов (ResultCard, CoworkingCard, BlockTable)
- [ ] Использовать useCallback для функций-обработчиков
- [ ] Lazy loading для компонентов views (CoworkingView, StatsView, MapView, AdminPanel)
- [ ] Проверить и оптимизировать re-renders (React DevTools Profiler)
- [ ] Оптимизировать изображения (если есть)
- [ ] Code splitting для роутов

**Backend:**
- [ ] Добавить индексы в MongoDB для всех полей поиска
- [ ] Проверить производительность API endpoints (должны отвечать < 200ms)
- [ ] Добавить rate limiting для защиты от DDOS (optional)
- [ ] Включить gzip compression для API responses

### 2. Обработка ошибок:

**Frontend:**
- [ ] ErrorBoundary для каждого view (отлавливает ошибки рендера)
- [ ] Retry механизм для failed API calls (3 попытки с exponential backoff)
- [ ] Fallback UI при ошибках загрузки
- [ ] Offline mode indicator (если нет сети)
- [ ] Валидация всех user inputs

**Backend:**
- [ ] Централизованный error handler middleware
- [ ] Логирование всех ошибок (console + опционально в файл)
- [ ] Graceful shutdown при SIGTERM/SIGINT
- [ ] Обработка MongoDB connection lost

### 3. UX улучшения:

- [ ] Loading skeletons вместо spinners (для лучшего perceived performance)
- [ ] Анимации переходов между views (fade in/out)
- [ ] Empty states для пустых данных ("Нет результатов")
- [ ] Confirmation dialog перед импортом XLS (AdminPanel)
- [ ] Back to top button на длинных страницах
- [ ] Keyboard shortcuts (Ctrl+K для поиска, Esc для закрытия модалов)
- [ ] Focus management (при открытии SearchBar автофокус на input)

### 4. Accessibility (A11y):

- [ ] Все интерактивные элементы имеют aria-labels
- [ ] Keyboard navigation работает везде (Tab, Enter, Esc)
- [ ] Контраст цветов соответствует WCAG AA (проверить с помощью axe DevTools)
- [ ] Screen reader friendly (проверить с VoiceOver/NVDA)
- [ ] Alt text для всех изображений

### 5. Testing:

- [ ] Написать E2E тесты на Playwright для критических путей:
  - Login → Search → View results
  - Switch between views
  - Admin upload XLS
- [ ] Unit тесты для utility функций (если есть)
- [ ] API integration тесты (если есть время)

### 6. Production build:

- [ ] Проверить .env для production (MongoDB URI, API URL)
- [ ] Минификация и bundling (должно работать из коробки с @brojs/cli)
- [ ] Source maps для debugging
- [ ] CSP headers (Content Security Policy) - опционально
- [ ] Проверить что нет console.log в production коде
- [ ] Настроить CI/CD (Jenkinsfile) для автоматического деплоя

### 7. Documentation:

- [ ] Обновить README.md с инструкциями по запуску
- [ ] Добавить примеры XLS файлов в `examples/` папку
- [ ] Документация API endpoints (опционально - Swagger/OpenAPI)
- [ ] Комментарии в коде для сложных участков

## Критерии приемки

### Производительность:
- [ ] Lighthouse Performance score > 90 (mobile)
- [ ] First Contentful Paint < 1.5s на 4G
- [ ] Time to Interactive < 3s на 4G
- [ ] Bundle size < 500KB (gzipped)
- [ ] API responses < 200ms на 1000 записей

### Качество кода:
- [ ] Нет TypeScript errors (`npm run type-check`)
- [ ] Нет ESLint warnings (`npm run lint`)
- [ ] Нет console.log в production коде
- [ ] Все компоненты типизированы (no `any`)
- [ ] Code coverage > 70% (если есть тесты)

### UX/Accessibility:
- [ ] Работает на всех основных браузерах (Chrome, Safari, Firefox, Edge)
- [ ] Адаптивный дизайн 320px - 1920px
- [ ] Keyboard navigation работает
- [ ] axe DevTools не находит критических проблем
- [ ] Все формы имеют валидацию

### Стабильность:
- [ ] Нет критических багов
- [ ] Приложение не падает при ошибках API
- [ ] Graceful degradation при потере сети
- [ ] Нет memory leaks (проверить в Chrome DevTools Memory Profiler)

## Задачи по оптимизации

### 1. Добавить React.lazy для роутов:

```typescript
// src/dashboard.tsx
import { lazy, Suspense } from 'react';

const LoginPage = lazy(() => import('./pages/login/login').then(m => ({ default: m.LoginPage })));
const MainPage = lazy(() => import('./pages/main/main').then(m => ({ default: m.MainPage })));
const AdminPanel = lazy(() => import('./pages/admin/admin').then(m => ({ default: m.AdminPanel })));

export const Dashboard = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <Suspense fallback={<Spinner />}>
          <LoginPage />
        </Suspense>
      } />
      {/* ... */}
    </Routes>
  );
};
```

### 2. Добавить retry механизм:

```typescript
// src/utils/fetchWithRetry.ts
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      }
      
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response; // Client error - не retry
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries reached');
}
```

### 3. Добавить Loading Skeletons:

```typescript
// src/components/ResultCardSkeleton.tsx
export const ResultCardSkeleton = () => {
  return (
    <Card.Root>
      <Card.Body>
        <VStack align="start" spacing={2}>
          <Skeleton height="20px" width="60%" />
          <Skeleton height="16px" width="40%" />
          <Skeleton height="16px" width="80%" />
          <Skeleton height="16px" width="70%" />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// Использование в SearchBar:
{isSearching && (
  <SimpleGrid columns={3} spacing={4}>
    {[1, 2, 3].map(i => <ResultCardSkeleton key={i} />)}
  </SimpleGrid>
)}
```

### 4. Добавить централизованный error handler:

```javascript
// stubs/api/index.js
function errorHandler(err, req, res, next) {
  console.error('API Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }

  if (err.name === 'MongoError') {
    return res.status(503).json({
      success: false,
      error: 'Database unavailable'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
}

// Применить middleware
app.use(errorHandler);
```

## Тестирование

### Performance тестирование:
1. Открыть Chrome DevTools → Lighthouse
2. Запустить audit для Mobile
3. Проверить метрики:
   - Performance > 90
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 80

### Memory leak тестирование:
1. Открыть Chrome DevTools → Memory
2. Take heap snapshot
3. Переключаться между views 10 раз
4. Take heap snapshot again
5. Сравнить - memory usage не должен расти значительно

### E2E тестирование (Playwright):

```typescript
// tests/e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('user can search for workplace by name', async ({ page }) => {
  await page.goto('http://localhost:8099/workspace-finder');
  
  // Enter search query
  await page.fill('input[placeholder*="поиск"]', 'Иванов');
  await page.click('button:has-text("Найти")');
  
  // Wait for results
  await page.waitForSelector('[data-testid="result-card"]');
  
  // Verify results
  const results = await page.$$('[data-testid="result-card"]');
  expect(results.length).toBeGreaterThan(0);
});
```

### Browser compatibility тестирование:
- Chrome (latest)
- Safari (latest)
- Firefox (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

## Чек-лист перед релизом

### Code Quality:
- [ ] `npm run lint` проходит без ошибок
- [ ] `npm run type-check` проходит без ошибок
- [ ] Нет TODO комментариев в критическом коде
- [ ] Все console.log удалены или обернуты в `if (process.env.NODE_ENV === 'development')`

### Testing:
- [ ] Все E2E тесты проходят
- [ ] Ручное тестирование на реальных устройствах
- [ ] Тестирование с медленным интернетом (Chrome DevTools Network throttling)
- [ ] Тестирование с отключенным JS (должен показывать fallback)

### Documentation:
- [ ] README.md обновлен
- [ ] Примеры XLS файлов добавлены
- [ ] Комментарии к сложным участкам кода

### Deployment:
- [ ] Production environment variables настроены
- [ ] MongoDB production instance готов
- [ ] CI/CD pipeline работает
- [ ] Monitoring настроен (опционально)

## Связанные задачи

- Зависит от: ВСЕХ предыдущих задач (TASK-01 to TASK-09)
- Это финальная задача MVP
- После этого проект готов к релизу
