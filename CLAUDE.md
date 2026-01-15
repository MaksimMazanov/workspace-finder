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

// RadioGroup
import { RadioGroup } from '@chakra-ui/react';
<RadioGroup.Root value={value} onValueChange={(details) => setValue(details.value)}>
  <RadioGroup.Item value="option1">
    <RadioGroup.ItemControl />
    <RadioGroup.ItemText>Option 1</RadioGroup.ItemText>
  </RadioGroup.Item>
</RadioGroup.Root>

// Toast
import { createToaster } from '@chakra-ui/react';
const toaster = createToaster({ placement: 'top' });
toaster.create({ title: 'Title', type: 'success' });
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

## Специальные правила
- Не останавливайся если есть ошибки на UI
- Проверяй что все ключи локализации имеют текстовки
- Проверяй что все API выдают статус 200
- Не заканчивай работу если есть любые ошибки, строй план выполнения задач 
- Все API должны данные хранить в базе данных, никаких моков и глобальных переменных
- Текущая база данных MongoDB поднята в Docker
- На изменение автотестов на работающий функционал запрашивай подтверждение
- Не создавай инструкции, summary, report, документацию о внесенных изменениях
- Не делай файлы с примерами
- Запрещено создавать файлы типа: *REPORT*, *SUMMARY*, *DOCS*, *CHECKLIST*, *EXAMPLES*, *README*
- **НЕ создавай никакие файлы в корне проекта**
- При проверке или доработке API используй MCP MongoDB
- Не используй автотесты для поиска проблем, используй браузер
- **ПЕРЕД использованием Chakra UI компонентов ВСЕГДА используй MCP Chakra UI для проверки актуального API**
запуск проекта
npm start

после запуска проект будет расположен по адресу http://localhost:8099/workspace-finder
все API работает и проксируется по адресу http://localhost:8099/api


не исправляй файлы из папки @stubs/ в powershell или в терминале, не надо перезагружать сервер, там есть hot reload

нельзя трогать в bro.config.js .api ключ

не используй в js и typescript стиль кода от языка Python используй mcp context7 для получения code convention и code style проекта согласно тех стеку

не останавливайся если есть ошибки на ui, проверяй что все ключи локализации имеют текстовки

проверяй что все api выдают статус 200

не заканчивай работу если есть любые ошибки, строй план выполнения задач

все api должны данные хранить в базе данных, никаких моков и глобальных переменных, текущая база данных mongoDB которая поднята в doker

тестируй после внесения изменений используя браузер и пиши автотесты на playwright по функционалу который работает

на изменение автотестов на работающий функционал запрашивай подтверждение от пользователя

не создавай инструкции, summary, report

используй в качестве документации по написанию тестов @https://testing-library.com/

при проверке и доработке API используй mcp MongoDB

Node.js не кэширует старые модули, на нем стоит хот релоад папки api

не редактируй файлы проекта в терминале не создавай документацию о внесенных изменениях не используй автотесты для поиска проблем, используй браузер не используй хардкорные пути /api используй значение ключа из bro.config

