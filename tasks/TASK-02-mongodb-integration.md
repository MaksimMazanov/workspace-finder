# TASK-02: MongoDB интеграция

**Приоритет:** HIGH  
**Статус:** TODO  
**Зависимости:** Нет (может выполняться параллельно с TASK-01)  
**Время выполнения:** ~3 часа

## Описание

Интегрировать MongoDB для хранения данных о рабочих местах. Заменить mock данные в `stubs/api/index.js` на реальные запросы к MongoDB. Создать коллекцию `workplaces` со схемой согласно PRD.

## Контекст

Текущая реализация использует mock данные (массив `workplaces` в памяти). Для production приложения необходима облачная база данных. Используем MongoDB, который уже поднят в Docker (согласно CLAUDE.md).

## Технические требования

### 1. Установить зависимости:
```bash
cd /Users/internet/develop/workspace-finder
npm install mongodb
```

### 2. Создать подключение к MongoDB:
- В `stubs/api/index.js` создать MongoDB client
- Использовать переменную окружения `MONGODB_URI` или дефолтный `mongodb://localhost:27017`
- База данных: `workspace-finder`
- Коллекция: `workplaces`

### 3. Схема данных (MongoDB документ):
```javascript
{
  _id: ObjectId,
  placeNumber: String,        // "5.В.01.056"
  placeName: String,          // "5.В.01.056"
  zone: String,               // "Open space 29"
  blockCode: String,          // "5.А.01" | "5.А.02" | "5.В.01" | "5.В.02"
  type: String,               // "Openspace" | "Coworking"
  category: String,           // "Основное"
  employeeName: String,       // "ФИО сотрудника"
  tabNumber: String,          // Табельный номер
  department: String,         // "Название подразделения Блок-1"
  team: String,               // "Команда. Описание"
  position: String,           // "Наименование шт.должности"
  status: String,             // "occupied" | "reserved" | "free"
  occupiedSince: Date,
  coworkingType: String,      // "Coworking-1" | "Coworking-2" | ...
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Переписать API endpoints:

**GET /api/search:**
- Использовать MongoDB `$regex` для поиска по ФИО (case-insensitive)
- Использовать MongoDB `$regex` для поиска по номеру места

**GET /api/workplaces?view=table:**
- Использовать MongoDB aggregation для группировки по blockCode
- Подсчет total и occupied для каждого блока

### 5. Инициализация данных:
Создать функцию `seedDatabase()` для заполнения базы тестовыми данными при первом запуске (если коллекция пустая).

## Критерии приемки

### Функциональные:
- [ ] MongoDB client успешно подключается к базе данных
- [ ] При запуске сервера в консоль выводится "Connected to MongoDB"
- [ ] Коллекция `workplaces` создается автоматически
- [ ] Если коллекция пустая, вызывается seedDatabase() для заполнения тестовыми данными
- [ ] API `/api/search?type=name&q=Иванов` возвращает результаты из MongoDB
- [ ] API `/api/search?type=place&q=5.В.01.056` возвращает результаты из MongoDB
- [ ] API `/api/workplaces?view=table` возвращает блоки из MongoDB
- [ ] При остановке сервера MongoDB client корректно закрывается

### Технические:
- [ ] Используется официальный драйвер `mongodb` (не Mongoose)
- [ ] Подключение к MongoDB вынесено в отдельную функцию `connectToDatabase()`
- [ ] Ошибки подключения логируются и обрабатываются
- [ ] Используются индексы для ускорения поиска: `placeNumber`, `employeeName`, `blockCode`
- [ ] Нет хардкода connection string (используется переменная окружения)

### Производительность:
- [ ] Поиск по имени работает за < 100ms на 1000 записей
- [ ] Загрузка таблицы блоков работает за < 200ms на 1000 записей

## Пример кода (структура)

```javascript
// stubs/api/index.js
const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'workspace-finder';
const COLLECTION_NAME = 'workplaces';

let db;
let collection;

async function connectToDatabase() {
  try {
    const client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    
    await client.connect();
    console.log('Connected to MongoDB');
    
    db = client.db(DB_NAME);
    collection = db.collection(COLLECTION_NAME);
    
    // Создание индексов
    await collection.createIndex({ placeNumber: 1 });
    await collection.createIndex({ employeeName: 1 });
    await collection.createIndex({ blockCode: 1 });
    
    // Инициализация данных
    const count = await collection.countDocuments();
    if (count === 0) {
      await seedDatabase();
    }
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function seedDatabase() {
  // Массив тестовых данных (перенести из текущего массива workplaces)
  const testData = [...]; // 13 записей
  
  await collection.insertMany(testData);
  console.log(`Seeded ${testData.length} workplaces`);
}

// Вызвать при старте сервера
connectToDatabase().catch(console.error);

// Переписать endpoints
router.get('/search', async (req, res) => {
  const { type, q } = req.query;
  
  let query = {};
  if (type === 'name') {
    query = {
      employeeName: { $regex: q, $options: 'i' },
      status: 'occupied'
    };
  } else if (type === 'place') {
    query = {
      placeNumber: { $regex: q, $options: 'i' }
    };
  }
  
  const results = await collection.find(query).toArray();
  
  res.json({
    success: true,
    count: results.length,
    results: results.map(doc => ({
      id: doc._id.toString(),
      ...doc
    }))
  });
});
```

## Тестирование

### Проверка подключения:
1. Убедиться, что MongoDB запущен:
   ```bash
   docker ps | grep mongo
   ```

2. Запустить сервер:
   ```bash
   npm start
   ```

3. Проверить логи - должно быть "Connected to MongoDB"

### Проверка API:
```bash
# Поиск по имени
curl "http://localhost:8099/api/search?type=name&q=Иванов"

# Поиск по номеру
curl "http://localhost:8099/api/search?type=place&q=5.В.01"

# Таблица блоков
curl "http://localhost:8099/api/workplaces?view=table"
```

### Проверка через MCP MongoDB:
Использовать MCP MongoDB для проверки данных в коллекции:
- Проверить количество документов
- Проверить наличие индексов
- Выполнить тестовые запросы

## Связанные задачи

- Следующая: TASK-03 (API Auth) - будет использовать MongoDB для хранения пользователей (опционально)
- Используется в: TASK-06, TASK-07, TASK-08 (новые views будут читать из MongoDB)
