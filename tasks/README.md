# Задачи WorkspaceFinder MVP

Этот каталог содержит детальные задачи для реализации полного MVP проекта WorkspaceFinder.

## Структура задач

Задачи организованы в 4 фазы согласно PRD:

### Phase 1: Core Backend & Frontend Setup
- **TASK-01**: Страница входа (LoginPage)
- **TASK-02**: MongoDB интеграция
- **TASK-03**: API Authentication

### Phase 2: Optimization
- **TASK-04**: localStorage кеширование данных

### Phase 3: Additional Views & Admin Panel
- **TASK-05**: ViewSwitcher (переключатель видов)
- **TASK-06**: CoworkingView (вид коворкингов)
- **TASK-07**: StatsView (вид статистики)
- **TASK-08**: MapView (карта зон)
- **TASK-09**: AdminPanel (панель администратора)

### Phase 4: Polish & Optimization
- **TASK-10**: Полировка и оптимизация

## Порядок выполнения

### Рекомендуемый порядок:

1. **Сначала выполнить:**
   - TASK-01 (LoginPage) - независимая
   - TASK-02 (MongoDB) - критическая зависимость для многих задач
   - TASK-03 (API Auth) - зависит от TASK-01, TASK-02

2. **Параллельно можно делать:**
   - TASK-04 (Cache) - после TASK-02
   - TASK-05 (ViewSwitcher) - независимая задача

3. **После завершения TASK-02 и TASK-05:**
   - TASK-06 (CoworkingView)
   - TASK-07 (StatsView)
   - TASK-08 (MapView)
   
   Эти три задачи можно делать параллельно или по очереди.

4. **После TASK-03:**
   - TASK-09 (AdminPanel)

5. **В конце:**
   - TASK-10 (Polish) - после всех остальных

### Граф зависимостей:

```
TASK-01 (LoginPage)
    └─> TASK-03 (Auth API)
            └─> TASK-09 (AdminPanel)

TASK-02 (MongoDB)
    ├─> TASK-03 (Auth API)
    ├─> TASK-04 (Cache)
    ├─> TASK-06 (CoworkingView)
    ├─> TASK-07 (StatsView)
    ├─> TASK-08 (MapView)
    └─> TASK-09 (AdminPanel)

TASK-05 (ViewSwitcher)
    ├─> TASK-06 (CoworkingView)
    ├─> TASK-07 (StatsView)
    └─> TASK-08 (MapView)

TASK-01..TASK-09
    └─> TASK-10 (Polish)
```

## Критерии приемки

Каждая задача содержит:
- ✅ **Функциональные критерии** - что должно работать
- ✅ **UI/UX критерии** - как должно выглядеть
- ✅ **Технические критерии** - как должно быть реализовано
- ✅ **Примеры кода** - структура и паттерны
- ✅ **Инструкции по тестированию** - как проверить

## Общие правила

### Технологии:
- **Frontend**: React 18.3.1, TypeScript, Chakra UI v3, React Router
- **Backend**: Node.js, Express 4.22.1, MongoDB
- **Build**: @brojs/cli, Vite

### Стандарты кода:
- Использовать TypeScript без `any`
- Chakra UI v3 синтаксис (compound components)
- Функциональные компоненты + hooks
- Именование: PascalCase для компонентов, camelCase для функций
- ESLint + Prettier

### Тестирование:
- Сначала ручное тестирование в браузере
- E2E тесты на Playwright (TASK-10)
- Использовать DevTools для отладки

### Git workflow:
- Создавать отдельную ветку для каждой задачи: `feature/task-01-login`
- Коммиты: `feat: add LoginPage component`
- После завершения задачи: создать PR для review

## Оценка времени

| Задача | Время | Приоритет |
|--------|-------|-----------|
| TASK-01 | ~2 часа | HIGH |
| TASK-02 | ~3 часа | HIGH |
| TASK-03 | ~1.5 часа | MEDIUM |
| TASK-04 | ~2 часа | MEDIUM |
| TASK-05 | ~2 часа | HIGH |
| TASK-06 | ~3 часа | HIGH |
| TASK-07 | ~2 часа | MEDIUM |
| TASK-08 | ~2.5 часа | MEDIUM |
| TASK-09 | ~4 часа | HIGH |
| TASK-10 | ~3 часа | MEDIUM |

**Общее время: ~25 часов**

## Помощь и документация

- **PRD**: `.claude/PRD.md` - полная спецификация проекта
- **Правила проекта**: `CLAUDE.md` - важные правила и конвенции
- **Chakra UI v3**: Используй MCP Chakra UI для проверки актуального API
- **MongoDB**: Используй MCP MongoDB для работы с базой данных

## Статус выполнения

Отмечай выполненные задачи:

- [ ] TASK-01: LoginPage
- [ ] TASK-02: MongoDB интеграция
- [ ] TASK-03: API Auth
- [ ] TASK-04: localStorage кеширование
- [ ] TASK-05: ViewSwitcher
- [ ] TASK-06: CoworkingView
- [ ] TASK-07: StatsView
- [ ] TASK-08: MapView
- [ ] TASK-09: AdminPanel
- [ ] TASK-10: Полировка и оптимизация

---

**Важно**: Прежде чем начать задачу, прочитай её полностью, включая критерии приемки и примеры кода. Это сэкономит время и поможет избежать ошибок.
