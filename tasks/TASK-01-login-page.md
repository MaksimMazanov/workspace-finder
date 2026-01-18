# TASK-01: Страница входа (LoginPage)

**Приоритет:** HIGH  
**Статус:** TODO  
**Зависимости:** Нет  
**Время выполнения:** ~2 часа

## Описание

Создать страницу входа, где пользователь вводит свое имя для доступа к приложению. Имя сохраняется в localStorage, авторизация без пароля. После входа происходит редирект на главную страницу.

## Контекст

Согласно PRD (User Story US-1), пользователь должен ввести свое имя для доступа к приложению. Это простая форма аутентификации без пароля, так как приложение предназначено для внутреннего использования.

## Технические требования

### Создать файлы:
- `src/pages/login/index.ts` - экспорт компонента
- `src/pages/login/login.tsx` - основной компонент страницы входа

### Функциональность:
1. Форма с полем ввода имени (Input из Chakra UI)
2. Кнопка "Войти"
3. Валидация: имя не должно быть пустым
4. Сохранение имени в localStorage под ключом `workspace-finder:user`
5. Редирект на главную страницу после успешного входа
6. Отображение toast уведомления при успешном входе

### UI компоненты (Chakra UI v3):
- `Box` для контейнера
- `VStack` для вертикальной компоновки
- `Heading` для заголовка "Добро пожаловать"
- `Input` для ввода имени
- `Button` для кнопки входа
- `createToaster` для уведомлений

### Обновить файлы:
- `bro.config.js` - добавить navigation `'workspace-finder.login': '/workspace-finder/login'`
- `src/__data__/urls.ts` - добавить `login: makeUrl('/login')`
- `src/dashboard.tsx` - добавить Route для LoginPage

## Критерии приемки

### Функциональные:
- [ ] При открытии `/workspace-finder/login` отображается форма входа
- [ ] Нельзя отправить форму с пустым именем (показывается toast ошибка)
- [ ] При вводе имени и клике "Войти" имя сохраняется в localStorage
- [ ] После успешного входа происходит редирект на `/workspace-finder`
- [ ] При нажатии Enter в поле ввода форма отправляется
- [ ] Показывается toast уведомление "Вход выполнен" при успешном входе

### UI/UX:
- [ ] Страница центрирована на экране
- [ ] Форма имеет белый фон с тенью
- [ ] Кнопка "Войти" имеет синий цвет (colorScheme="blue")
- [ ] Placeholder в Input: "Введите ваше имя..."
- [ ] Адаптивный дизайн (работает на мобильных)

### Технические:
- [ ] Используется только Chakra UI v3 синтаксис
- [ ] Нет console.log в production коде
- [ ] Типизация TypeScript без any
- [ ] Компонент экспортируется из index.ts

## Пример кода (структура)

```typescript
// src/pages/login/login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, VStack, Heading, Input, Button, Text, createToaster } from '@chakra-ui/react';
import { URLs } from '../../__data__/urls';

const toaster = createToaster({ placement: 'top' });

export const LoginPage = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!name.trim()) {
      toaster.create({
        title: 'Ошибка',
        description: 'Введите ваше имя',
        type: 'error'
      });
      return;
    }

    // Сохранение в localStorage
    localStorage.setItem('workspace-finder:user', JSON.stringify({ name: name.trim(), enteredAt: new Date().toISOString() }));

    toaster.create({
      title: 'Вход выполнен',
      description: `Добро пожаловать, ${name.trim()}!`,
      type: 'success'
    });

    navigate(URLs.baseUrl);
  };

  return (
    // ... UI код
  );
};
```

## Тестирование

### Ручное тестирование:
1. Открыть `/workspace-finder/login`
2. Попробовать войти с пустым именем - должна быть ошибка
3. Ввести имя "Иванов Иван" и нажать Enter
4. Проверить localStorage - должна быть запись
5. Должен произойти редирект на главную
6. Проверить toast уведомление

### Проверка в браузере:
```javascript
// Проверка localStorage
JSON.parse(localStorage.getItem('workspace-finder:user'))
// Должно вернуть: { name: "Иванов Иван", enteredAt: "2026-01-15T..." }
```

## Связанные задачи

- Следующая: TASK-02 (MongoDB интеграция) - не зависит от этой задачи
- Будет использоваться: TASK-03 (API Auth) - будет читать имя из localStorage
