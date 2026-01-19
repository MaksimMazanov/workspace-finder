# TASK-01: Страница входа (LoginPage)

**Приоритет:** HIGH  
**Статус:** DONE ✅  
**Зависимости:** Нет  
**Время выполнения:** ~2 часа

## Описание

Создать страницу входа с классической формой аутентификации: поле для email и пароля. Данные отправляются на сервер Express.js, который проверяет учётные данные и возвращает JWT токен. Токен сохраняется в localStorage и используется для доступа к защищённым маршрутам приложения. После успешной аутентификации пользователь перенаправляется на главную страницу. Также реализовать функцию восстановления пароля через email.

## Требования

- Форма с полями: email (с валидацией), password (скрытое)
- POST `/api/auth/login` → ответ: `{ token: "…" }`
- Токен сохраняется в localStorage ключ `accessToken`
- Ошибки отображаются toast-уведомлениями
- Успешный вход перенаправляет на `/`
- Приватные роуты проверяют `accessToken` в localStorage

## Код (пример)

```javascript
const handleLogin = async (email, password) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) throw new Error('Неверные данные');
    
    const { token } = await res.json();
    localStorage.setItem('accessToken', token);
    navigate('/');
  } catch (err) {
    toaster.create({ title: 'Ошибка', description: err.message, type: 'error' });
  }
};
```

## Тестирование

1. Открыть `/login`
2. При вводе неверных данных показывается toast-ошибка
3. При вводе корректных email + password в localStorage сохраняется `accessToken`
4. Проверить редирект на `/`
5. Обновить страницу → должен остаться авторизованным

## Критерии приёмки

- [x] Форма email + password
- [x] POST на `/api/auth/login`
- [x] JWT в localStorage `accessToken`
- [x] Ошибки отображаются toast-уведомлениями
- [x] Успешный вход перенаправляет на `/`
- [x] Приватные роуты защищены (проверка accessToken)
- [x] Автоматическая переадресация на `/login` при отсутствии токена

## Реализация

### Компоненты

1. **LoginPage** (`src/pages/login/login.tsx`)
   - Форма с полями Email и Password
   - Валидация email формата
   - Валидация пароля (минимум 6 символов)
   - JWT токен сохраняется в `localStorage['accessToken']`
   - Toast-уведомления для ошибок и успеха
   - Автоматический редирект на главную после успешного входа

2. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
   - Проверяет наличие `accessToken` в localStorage
   - Проверяет валидность токена через `/api/auth/me`
   - Автоматически переадресовывает на `/login` если токен отсутствует или невалиден
   - Показывает загрузочный экран во время проверки

3. **Backend API** (`stubs/api/index.js`)
   - `POST /api/auth/login` - аутентификация и выдача JWT токена
   - `GET /api/auth/me` - получение информации о пользователе (требует токен)
   - Middleware `verifyToken` для проверки JWT токена

### Тестовые учетные данные

```
Email: user@example.com
Password: password123

Email: admin@example.com
Password: admin123

Email: test@test.com
Password: test123
```

## Связанные задачи

- TASK-02 (MongoDB) — не зависит
- TASK-03 (API Auth) — использует JWT из localStorage
