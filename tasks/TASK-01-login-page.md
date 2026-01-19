# TASK-01: Страница входа (LoginPage)

**Приоритет:** HIGH  
**Статус:** TODO  
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

- [ ] Форма email + password
- [ ] POST на `/api/auth/login`
- [ ] JWT в localStorage `accessToken`
- [ ] Ошибки отображаются toast-уведомлениями
- [ ] Успешный вход перенаправляет на `/`
- [ ] Приватные роуты защищены (проверка accessToken)

## Связанные задачи

- TASK-02 (MongoDB) — не зависит
- TASK-03 (API Auth) — использует JWT из localStorage
