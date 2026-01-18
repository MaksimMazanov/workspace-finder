# TASK-03: API Authentication

**Приоритет:** MEDIUM  
**Статус:** TODO  
**Зависимости:** TASK-01 (LoginPage), TASK-02 (MongoDB)  
**Время выполнения:** ~1.5 часа

## Описание

Создать API endpoints для аутентификации: сохранение имени пользователя и получение текущего пользователя. API работает с localStorage на фронтенде, backend предоставляет endpoints для совместимости с будущими расширениями.

## Контекст

После реализации LoginPage (TASK-01) нужны backend endpoints для сохранения сессии пользователя и проверки авторизации. Пока это упрощенная реализация без реальной сессии (имя в localStorage), но архитектура готова для будущего расширения.

## Технические требования

### 1. Backend API (stubs/api/index.js):

**POST /api/auth/login**
- Принимает JSON: `{ name: string }`
- Валидирует имя (не пустое, длина 2-100 символов)
- Возвращает: `{ success: true, user: { name, enteredAt } }`
- Опционально: сохраняет в MongoDB коллекцию `users` для логирования

**GET /api/auth/me**
- Возвращает текущего пользователя из localStorage (читается на фронтенде)
- Ответ: `{ success: true, user: { name, enteredAt } | null }`

### 2. Frontend API (src/api/workspaceApi.ts):

Добавить функции:
```typescript
export interface User {
  name: string;
  enteredAt: string;
}

export async function loginUser(name: string): Promise<{ success: boolean; user?: User; error?: string }>;
export async function getCurrentUser(): Promise<{ success: boolean; user?: User | null }>;
```

### 3. Интеграция с LoginPage:
Обновить `src/pages/login/login.tsx` для использования API вместо прямого localStorage.

## Критерии приемки

### Функциональные:
- [ ] `POST /api/auth/login` принимает имя и возвращает user объект
- [ ] Валидация: пустое имя возвращает ошибку 400
- [ ] Валидация: имя < 2 символов возвращает ошибку 400
- [ ] Валидация: имя > 100 символов возвращает ошибку 400
- [ ] `GET /api/auth/me` возвращает пользователя (читается из localStorage на фронте)
- [ ] LoginPage использует `loginUser()` вместо прямого localStorage
- [ ] После успешного login пользователь сохраняется в localStorage

### Технические:
- [ ] Используется правильный Content-Type: application/json
- [ ] Ошибки возвращают понятные сообщения
- [ ] TypeScript типы экспортируются из workspaceApi.ts
- [ ] Нет any типов в коде

### Безопасность:
- [ ] Имя пользователя sanitize (trim, escape спецсимволов)
- [ ] Защита от XSS (имя не содержит HTML тегов)

## Пример кода

```javascript
// stubs/api/index.js

router.post('/auth/login', (req, res) => {
  const { name } = req.body;

  // Валидация
  if (!name || typeof name !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Name is required'
    });
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Name must be at least 2 characters'
    });
  }

  if (trimmedName.length > 100) {
    return res.status(400).json({
      success: false,
      error: 'Name must be less than 100 characters'
    });
  }

  const user = {
    name: trimmedName,
    enteredAt: new Date().toISOString()
  };

  // Опционально: сохранить в MongoDB для логирования
  // await db.collection('users').insertOne(user);

  res.json({
    success: true,
    user
  });
});

router.get('/auth/me', (req, res) => {
  // В упрощенной версии возвращаем null
  // Фронтенд читает из localStorage
  res.json({
    success: true,
    user: null
  });
});
```

```typescript
// src/api/workspaceApi.ts

export interface User {
  name: string;
  enteredAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export async function loginUser(name: string): Promise<AuthResponse> {
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
  
  // Сохранить в localStorage
  if (data.success && data.user) {
    localStorage.setItem('workspace-finder:user', JSON.stringify(data.user));
  }

  return data;
}

export async function getCurrentUser(): Promise<AuthResponse> {
  // Читаем из localStorage
  const userStr = localStorage.getItem('workspace-finder:user');
  if (!userStr) {
    return { success: true, user: null };
  }

  try {
    const user = JSON.parse(userStr);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: 'Invalid user data' };
  }
}
```

```typescript
// src/pages/login/login.tsx (обновление)

import { loginUser } from '../../api/workspaceApi';

const handleLogin = async () => {
  if (!name.trim()) {
    toaster.create({
      title: 'Ошибка',
      description: 'Введите ваше имя',
      type: 'error'
    });
    return;
  }

  try {
    const response = await loginUser(name.trim());

    if (response.success) {
      toaster.create({
        title: 'Вход выполнен',
        description: `Добро пожаловать, ${response.user?.name}!`,
        type: 'success'
      });

      navigate(URLs.baseUrl);
    } else {
      toaster.create({
        title: 'Ошибка входа',
        description: response.error || 'Не удалось войти',
        type: 'error'
      });
    }
  } catch (error) {
    toaster.create({
      title: 'Ошибка',
      description: 'Не удалось подключиться к серверу',
      type: 'error'
    });
  }
};
```

## Тестирование

### API тестирование:
```bash
# Успешный login
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"Иванов Иван Иванович"}'

# Должен вернуть:
# {"success":true,"user":{"name":"Иванов Иван Иванович","enteredAt":"2026-01-15T..."}}

# Пустое имя (ошибка)
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":""}'

# Должен вернуть 400: {"success":false,"error":"Name is required"}

# Получить текущего пользователя
curl http://localhost:8099/api/auth/me
```

### UI тестирование:
1. Открыть `/workspace-finder/login`
2. Ввести имя "А" (слишком короткое) - должна быть ошибка
3. Ввести нормальное имя "Иванов Иван"
4. Проверить Network в DevTools - должен быть POST /api/auth/login
5. Проверить localStorage - должна быть запись
6. Должен произойти редирект

## Связанные задачи

- Зависит от: TASK-01 (LoginPage), TASK-02 (MongoDB - опционально)
- Используется в: Все будущие задачи (может проверять авторизацию)
