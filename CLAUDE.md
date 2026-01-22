## Project Overview

**WorkspaceFinder** — мобильное веб-приложение для поиска и управления рабочими местами в технопарке. Приложение позволяет сотрудникам быстро найти рабочее место по ФИО или номеру места, просмотреть статус коворкингов и получить информацию о подразделении и команде сотрудника.

## Tech Stack

- **Backend**: nodejs 22.21+, express, MongoDB, Docker
- **Frontend**: React 19+, TypeScript, Webpack, @chakra-ui/react, RTK Query, i18next, Lottie, @brojs/cli
- **Testing**: jest, Playwright
- **No authentication** - local single-user application

## Project Structure

```
bro-learn-web/
├── src/
├── stubs/
```
## Commands
```bash
npm start
```
## MCP Servers
Use MCP_DOCKER MCP for:
- работа с mongodb

Use MCP Chakra UI для:
- проверки API компонентов перед использованием
- получения примеров использования компонентов
- проверки props компонентов
- миграции кода с v2 на v3

## Chakra UI v3 - Важные правила

**ВСЕГДА используй MCP Chakra UI перед созданием/изменением компонентов!**

### Основные изменения в v3:

**Compound Components (точечная нотация):**
- `Table.Root`, `Table.Header`, `Table.Body`, `Table.Row`, `Table.ColumnHeader`, `Table.Cell`
- `Card.Root`, `Card.Header`, `Card.Body`, `Card.Footer`
- `Alert.Root`, `Alert.Indicator`, `Alert.Title`, `Alert.Description`
- `RadioGroup.Root`, `RadioGroup.Item`, `RadioGroup.ItemControl`, `RadioGroup.ItemText`

**Переименованные компоненты:**
- `Divider` → `Separator`
- `AlertIcon` → `Alert.Indicator`
- НЕ используй `useColorModeValue` - используй статичные значения цветов

**Toast изменения:**
- НЕ используй `useToast` hook
- Используй `createToaster()` для создания toaster вне компонента
- Вызывай `toaster.create()` для показа уведомлений

**Примеры правильного использования:**

```typescript
// Table
import { Table } from '@chakra-ui/react';
<Table.Root size="sm">
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeader>Header</Table.ColumnHeader>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    <Table.Row>
      <Table.Cell>Cell</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table.Root>

// Card
import { Card } from '@chakra-ui/react';
<Card.Root>
  <Card.Header>Header</Card.Header>
  <Card.Body>Body</Card.Body>
</Card.Root>

// Alert
import { Alert } from '@chakra-ui/react';
<Alert.Root status="error">
  <Alert.Indicator />
  <Alert.Title>Title</Alert.Title>
  <Alert.Description>Description</Alert.Description>
</Alert.Root>

// RadioGroup - ВАЖНО: правильная структура для кликабельности!
import { RadioGroup, Box } from '@chakra-ui/react';
// КРИТИЧНО: ItemControl и ItemText должны быть ВНУТРИ Item
// Для полной кликабельности оборачивай в Box с onClick
<RadioGroup.Root value={value} onValueChange={(details) => setValue(details.value)}>
  <Box 
    display="flex" 
    alignItems="center" 
    gap={2} 
    cursor="pointer"
    onClick={() => setValue('option1')}
  >
    <RadioGroup.Item value="option1">
      <RadioGroup.ItemControl />
      <RadioGroup.ItemText>Option 1</RadioGroup.ItemText>
    </RadioGroup.Item>
  </Box>
</RadioGroup.Root>

// Toast
import { createToaster } from '@chakra-ui/react';
const toaster = createToaster({ placement: 'top' });
toaster.create({ title: 'Title', type: 'success' });
```

### Важные правила работы с интерактивными компонентами Chakra UI v3

**RadioGroup - структура компонента:**
- ❌ **НЕ разделяй** `ItemControl` и `ItemText` - они ДОЛЖНЫ быть внутри одного `Item`
- ❌ **НЕ используй** несуществующий компонент `Label` из Chakra UI
- ✅ **Для кликабельности текста:** оборачивай `RadioGroup.Item` в `Box` с `onClick` handler
- ✅ **Структура контекста:** `Root` → `Item` → `ItemControl` + `ItemText` (обязательно в таком порядке)

**Пример НЕПРАВИЛЬНО:**
```typescript
// ❌ Ошибка: ItemText вне Item - потеряет контекст
<Box>
  <RadioGroup.Item value="name">
    <RadioGroup.ItemControl />
  </RadioGroup.Item>
  <RadioGroup.ItemText>Текст</RadioGroup.ItemText>
</Box>

// ❌ Ошибка: использование несуществующего Label
import { Label } from '@chakra-ui/react'; // НЕ СУЩЕСТВУЕТ!
```

**Пример ПРАВИЛЬНО:**
```typescript
// ✅ Правильно: весь Item внутри кликабельного Box
<Box cursor="pointer" onClick={() => setValue('option')}>
  <RadioGroup.Item value="option">
    <RadioGroup.ItemControl />
    <RadioGroup.ItemText>Текст</RadioGroup.ItemText>
  </RadioGroup.Item>
</Box>

// ✅ Или используй chakra.label (но не Label!)
import { chakra } from '@chakra-ui/react';
<chakra.label cursor="pointer">
  <RadioGroup.Item value="option">
    <RadioGroup.ItemControl />
    <RadioGroup.ItemText>Текст</RadioGroup.ItemText>
  </RadioGroup.Item>
</chakra.label>
```

## Reference Documentation

Read these documents when working on specific areas:

| Document | When to Read |
|----------|--------------|
| `.claude/PRD.md` | Understanding requirements, features, API spec |

## Resources

- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Chakra UI v3](https://www.chakra-ui.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Запуск проекта

```bash
npm install  # Всегда запускай после добавления новых зависимостей в package.json
npm start
```

После запуска проект будет расположен по адресу: http://localhost:8099/workspace-finder

API проксируется по адресу: http://localhost:8099/api

**ВАЖНО:** После добавления новых зависимостей в `package.json` ОБЯЗАТЕЛЬНО запускай `npm install` перед `npm start`!

## Специальные правила

### Работа с кодом
- Не используй стиль кода от языка Python в JS/TS
- Node.js не кэширует старые модули, на нем стоит hot reload папки api
- Не исправляй файлы из папки `stubs/` в терминале, там есть hot reload
- Не редактируй файлы проекта в терминале

### Работа с базой данных
- Все API должны хранить данные в MongoDB, никаких моков и глобальных переменных
- Текущая база данных MongoDB поднята в Docker
- При проверке или доработке API используй MCP MongoDB

### Тестирование и отладка
- Не используй автотесты для поиска проблем, используй браузер
- Тестируй после внесения изменений используя браузер
- Пиши автотесты на Playwright только по функционалу который работает
- На изменение автотестов на работающий функционал запрашивай подтверждение
- Используй в качестве документации по тестам https://testing-library.com/

### Качество кода
- Не останавливайся если есть ошибки на UI, исправляй их
- Проверяй что все ключи локализации имеют текстовки
- Проверяй что все API выдают статус 200
- Не заканчивай работу если есть ошибки, строй план выполнения задач

### Документация и файлы
- Не создавай инструкции, summary, report, документацию о внесенных изменениях
- Не делай файлы с примерами
- Запрещено создавать файлы типа: REPORT, SUMMARY, DOCS, CHECKLIST, EXAMPLES, README, отчет о выполненной работе
- **НЕ создавай никакие файлы в корне проекта**

### Chakra UI
- **ПЕРЕД использованием Chakra UI компонентов ВСЕГДА используй MCP Chakra UI для проверки актуального API**
- **КРИТИЧНО:** При работе с compound components (RadioGroup, Table, Card) ВСЕГДА сохраняй правильную иерархию - дочерние компоненты (ItemText, ItemControl) ДОЛЖНЫ быть внутри родительских (Item) для работы React Context
- **Для интерактивности:** Если стандартная структура не полностью кликабельна, оборачивай в `Box` с `onClick` handler

### КРИТИЧЕСКИ ВАЖНО: Работа с API путями и bro.config.js

**Никогда не хардкодь пути в коде!** Всегда используй конфигурацию из `bro.config.js` через `@brojs/cli`.

#### Структура bro.config.js
```javascript
module.exports = {
  navigations: {
    'workspace-finder.main': '/workspace-finder',  // Используй getNavigationValue()
    'link.workspace-finder.auth': '/auth'
  },
  config: {
    'workspace-finder.api': '/api'  // Используй getConfigValue()
  }
}
```

#### Функции @brojs/cli для чтения конфигурации

```typescript
import { getNavigationValue, getConfigValue } from '@brojs/cli'

// Для navigations используй getNavigationValue()
const mainPath = getNavigationValue('workspace-finder.main')  // '/workspace-finder'

// Для config используй getConfigValue()
const apiBase = getConfigValue('workspace-finder.api')  // '/api'
```

#### Правила работы с API путями

1. **НИКОГДА не хардкодь `/api` в коде!**
2. **Всегда используй `URLs.apiBase` из `src/__data__/urls.ts`**
3. **В `src/__data__/urls.ts` используй `getConfigValue()` для чтения config:**
   ```typescript
   import { getConfigValue } from '@brojs/cli'
   export const URLs = {
     apiBase: getConfigValue(`${pkg.name}.api`)  // ПРАВИЛЬНО
     // НЕ используй: getNavigationValue() - это только для navigations!
   }
   ```
4. **В API файлах импортируй:**
   ```typescript
   import { URLs } from '../__data__/urls'
   fetch(`${URLs.apiBase}/search`)  // ПРАВИЛЬНО
   fetch('/api/search')  // НЕПРАВИЛЬНО - хардкод!
   ```
5. **В RTK Query используй:**
   ```typescript
   baseQuery: fetchBaseQuery({ baseUrl: URLs.apiBase })
   ```

#### Частые ошибки

❌ **НЕПРАВИЛЬНО:**
```typescript
// Ошибка 1: Хардкод пути
const response = await fetch('/api/workplaces')

// Ошибка 2: Использование getNavigationValue для config
apiBase: getNavigationValue('workspace-finder.api')  // Вернет undefined!

// Ошибка 3: Хардкод константы
const API_BASE_URL = '/api'
```

✅ **ПРАВИЛЬНО:**
```typescript
// В src/__data__/urls.ts
import { getConfigValue } from '@brojs/cli'
export const URLs = {
  apiBase: getConfigValue(`${pkg.name}.api`)
}

// В API файлах
import { URLs } from '../__data__/urls'
const response = await fetch(`${URLs.apiBase}/workplaces`)
```

Это позволяет легко менять базовый путь API без правки кода.

### КРИТИЧЕСКИ ВАЖНО: React Router и навигация с basename

**Приложение работает по пути `/workspace-finder`, поэтому React Router ОБЯЗАТЕЛЬНО должен знать об этом!**

#### Правильная настройка BrowserRouter

В `src/app.tsx` **ВСЕГДА** должен быть настроен `basename`:

```typescript
import { BrowserRouter } from 'react-router-dom'
import { getNavigationValue } from '@brojs/cli'
import pkg from '../package.json'

const App = () => {
  const basename = getNavigationValue(`${pkg.name}.main`) || '/workspace-finder'
  
  return (
    <BrowserRouter basename={basename}>
      {/* routes */}
    </BrowserRouter>
  )
}
```

#### Правила работы с путями в Routes

**КРИТИЧНО:** Когда BrowserRouter имеет `basename`, все пути в `<Route>` должны быть **относительными**:

✅ **ПРАВИЛЬНО:**
```typescript
<Routes>
  <Route path="/" element={<MainPage />} />           // /workspace-finder/
  <Route path="/login" element={<LoginPage />} />     // /workspace-finder/login
  <Route path="/admin" element={<AdminPage />} />     // /workspace-finder/admin
</Routes>
```

❌ **НЕПРАВИЛЬНО:**
```typescript
<Routes>
  <Route path="/workspace-finder" element={<MainPage />} />        // Дублирование!
  <Route path="/workspace-finder/login" element={<LoginPage />} />  // Дублирование!
</Routes>
```

#### Навигация с navigate()

При использовании `navigate()` используй **относительные пути**:

✅ **ПРАВИЛЬНО:**
```typescript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/')          // → /workspace-finder/
navigate('/login')     // → /workspace-finder/login
navigate('/admin')     // → /workspace-finder/admin
```

❌ **НЕПРАВИЛЬНО:**
```typescript
navigate('/workspace-finder')        // Лишний basename
navigate('/workspace-finder/login')  // Лишний basename
```

#### Структура URLs для навигации

В `src/__data__/urls.ts`:

```typescript
export const URLs = {
  baseUrl,  // '/workspace-finder' - для внешних ссылок
  apiBase,  // '/api' - для API запросов
  // Для navigate() используй относительные пути
  login: '/login',
  register: '/register',
  admin: '/admin',
}
```

### КРИТИЧЕСКИ ВАЖНО: JWT аутентификация и проверка токенов

#### Структура JWT токена

JWT токен **ОБЯЗАТЕЛЬНО** должен содержать минимально необходимые поля:

```typescript
// При создании токена (API):
const token = jwt.sign(
  { 
    email: user.email, 
    name: user.name,
    iat: Date.now() 
  },
  JWT_SECRET,
  { expiresIn: '24h' }
)
```

#### API endpoint /auth/me

**КРИТИЧНО:** Endpoint `/api/auth/me` должен проверять **два источника** токена:

```javascript
router.get('/auth/me', (req, res) => {
  let token = req.cookies?.wf_admin_session;
  
  // ВАЖНО: Проверяй Authorization header!
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.json({
        success: true,
        role: decoded.role || 'user',
        email: decoded.email,
        name: decoded.name
      });
    } catch (error) {
      // Invalid token
    }
  }
  
  // Default response
  res.json({ success: true, role: 'user' });
});
```

#### Проверка токена в getCurrentUser()

В `src/api/workspaceApi.ts`:

```typescript
export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      return { success: true, user: null };
    }

    const response = await fetch(`${URLs.apiBase}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem('accessToken');
      return { success: true, user: null };
    }

    return await response.json();
  } catch (error) {
    return { success: false, error: 'Failed to get user info' };
  }
}
```

#### ProtectedRoute проверка

В `src/components/ProtectedRoute.tsx`:

```typescript
const response = await getCurrentUser();

// ВАЖНО: Проверяй только success, а НЕ response.user!
// API может не возвращать user поле, только success и role
if (response.success) {
  setIsAuthenticated(true);
} else {
  setIsAuthenticated(false);
}
```

❌ **НЕПРАВИЛЬНО:**
```typescript
// Это сломает аутентификацию если API не возвращает user!
if (response.success && response.user) {
  setIsAuthenticated(true);
}
```

#### Цикл работы аутентификации

1. **Вход:** POST `/api/auth/login` → получаем `{ success, token, user }`
2. **Сохранение:** `localStorage.setItem('accessToken', token)`
3. **Переадресация:** `navigate('/')` → BrowserRouter обрабатывает basename → браузер показывает `/workspace-finder/`
4. **Защита маршрута:** ProtectedRoute монтируется
5. **Проверка токена:** GET `/api/auth/me` с header `Authorization: Bearer ${token}`
6. **Верификация:** API проверяет токен и возвращает `{ success: true, role, email, name }`
7. **Доступ:** ProtectedRoute рендерит дочерние компоненты (MainPage)

#### Частые ошибки аутентификации

❌ **НЕПРАВИЛЬНО:**
```typescript
// 1. API не проверяет Authorization header
router.get('/auth/me', (req, res) => {
  const token = req.cookies?.token;  // ТОЛЬКО куки - сломает фронтенд!
  // ...
});

// 2. JWT не содержит данные пользователя
const token = jwt.sign({ email }, JWT_SECRET);  // Нет name!

// 3. ProtectedRoute проверяет несуществующее поле
if (response.success && response.user) {  // user может быть undefined!

// 4. navigate с полным путем
navigate('/workspace-finder/');  // Лишний basename!
```

✅ **ПРАВИЛЬНО:**
```typescript
// 1. API проверяет ОБА источника
let token = req.cookies?.token;
if (!token && req.headers.authorization) {
  token = req.headers.authorization.substring(7);
}

// 2. JWT содержит все нужные данные
const token = jwt.sign({ email, name }, JWT_SECRET);

// 3. ProtectedRoute проверяет правильно
if (response.success) {  // Достаточно success!

// 4. navigate с относительным путем
navigate('/');  // basename добавится автоматически!
```

#### Чеклист при проблемах с аутентификацией

Если после входа не происходит переадресация:

1. ✅ **Проверь BrowserRouter:** есть ли `basename={getNavigationValue(...)}`?
2. ✅ **Проверь Routes:** используются ли относительные пути (`/login`, `/`, а не `/workspace-finder/login`)?
3. ✅ **Проверь navigate():** используется ли `navigate('/')` вместо `navigate(URLs.baseUrl)`?
4. ✅ **Проверь API /auth/me:** поддерживает ли Authorization header?
5. ✅ **Проверь JWT токен:** содержит ли `email` и `name`?
6. ✅ **Проверь ProtectedRoute:** проверяется ли только `response.success`?
7. ✅ **Проверь localStorage:** сохраняется ли токен в `accessToken`?

Все 7 пунктов должны быть выполнены для правильной работы!