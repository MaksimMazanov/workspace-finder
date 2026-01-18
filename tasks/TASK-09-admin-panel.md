# TASK-09: AdminPanel (панель администратора)

**Приоритет:** HIGH  
**Статус:** TODO  
**Зависимости:** TASK-02 (MongoDB), TASK-03 (API Auth)  
**Время выполнения:** ~4 часа

## Описание

Создать панель администратора для загрузки XLS файлов с данными о рабочих местах. После загрузки XLS парсится на сервере, данные импортируются в MongoDB, история загрузок сохраняется. UI показывает статус загрузки, ошибки парсинга, историю импортов.

## Контекст

Согласно PRD (User Story US-3), администратор должен загружать XLS файл с данными о рабочих местах. Формат XLS должен соответствовать схеме `Workplace`. После импорта данные обновляются в базе и кеш инвалидируется.

## Технические требования

### 1. Backend Dependencies:

Установить зависимости:
```bash
npm install multer xlsx
```

### 2. Backend API:

**Endpoint:** `POST /api/admin/upload`

**Реализация в `stubs/api/index.js`:**
- Использовать `multer` для приема файла
- Парсинг XLS файла с помощью `xlsx`
- Валидация данных (обязательные поля: placeNumber, blockCode, status)
- Сохранение в MongoDB коллекцию `workplaces` (replace all или upsert)
- Создание записи в коллекцию `import_logs`
- Возврат статистики импорта (total, inserted, updated, errors)

**Endpoint:** `GET /api/admin/imports`

**Реализация:**
- Получение истории импортов из коллекции `import_logs`
- Сортировка по дате (новые первые)
- Лимит: последние 20 импортов

### 3. Frontend Component:

**Файл 1:** `src/pages/admin/admin.tsx`

**Функциональность:**
- File upload форма (drag & drop или browse)
- Кнопка "Загрузить"
- Progress indicator при загрузке
- Отображение результата импорта (success, errors)
- Таблица истории импортов (дата, пользователь, статус, количество)

**Файл 2:** `src/pages/admin/index.ts` - экспорт

### 4. Routing:

Обновить `src/dashboard.tsx`:
- Добавить Route: `/admin` → `AdminPanel`
- Защита: проверка имени пользователя в localStorage (опционально: только определенные пользователи)

Обновить `bro.config.js`:
- Добавить navigation: `'workspace-finder.admin': '/workspace-finder/admin'`

## Критерии приемки

### Функциональные (Backend):
- [ ] `POST /api/admin/upload` принимает XLS файл (multipart/form-data)
- [ ] XLS парсится корректно (читаются все строки)
- [ ] Валидация: пропускаются строки без обязательных полей
- [ ] Данные сохраняются в MongoDB (upsert по placeNumber)
- [ ] Запись в `import_logs` создается с timestamp, userName, status
- [ ] Возвращается статистика: { total, inserted, updated, errors: [] }
- [ ] `GET /api/admin/imports` возвращает последние 20 импортов

### Функциональные (Frontend):
- [ ] AdminPanel доступен по `/workspace-finder/admin`
- [ ] Форма позволяет выбрать XLS файл (accept=".xls,.xlsx")
- [ ] При загрузке показывается progress spinner
- [ ] После успешного импорта показывается toast с количеством импортированных записей
- [ ] При ошибках показывается список ошибок
- [ ] Таблица истории показывает последние 20 импортов
- [ ] После импорта кеш localStorage очищается (invalidateCache)

### UI/UX:
- [ ] Drag & drop зона для файла (с пунктирной рамкой)
- [ ] Placeholder: "Перетащите XLS файл сюда или нажмите для выбора"
- [ ] Кнопка "Загрузить" активна только если файл выбран
- [ ] Progress bar при загрузке
- [ ] Success message с зеленым Alert
- [ ] Error message с красным Alert + список ошибок
- [ ] Таблица истории с колонками: Дата, Пользователь, Загружено записей, Ошибок, Статус

### Технические:
- [ ] Используется `multer` с ограничением размера файла (10MB)
- [ ] Используется `xlsx` для парсинга
- [ ] Типизация TypeScript для ImportLog и UploadResponse
- [ ] Обработка ошибок: неправильный формат файла, слишком большой файл
- [ ] После импорта вызывается `cleanupOldCache()` или `invalidateCache()`

## Пример кода

```javascript
// stubs/api/index.js

const multer = require('multer');
const xlsx = require('xlsx');

// Конфигурация multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only XLS/XLSX files are allowed'));
    }
  }
});

router.post('/admin/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Парсинг XLS
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`Parsed ${data.length} rows from XLS`);

    const errors = [];
    let inserted = 0;
    let updated = 0;

    // Импорт данных
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Валидация обязательных полей
      if (!row.placeNumber || !row.blockCode || !row.status) {
        errors.push({
          row: i + 2, // +2 потому что Excel начинается с 1 и есть header
          error: 'Missing required fields: placeNumber, blockCode, or status'
        });
        continue;
      }

      // Upsert в MongoDB
      const result = await collection.updateOne(
        { placeNumber: row.placeNumber },
        {
          $set: {
            placeNumber: row.placeNumber,
            placeName: row.placeName || row.placeNumber,
            zone: row.zone || '',
            blockCode: row.blockCode,
            type: row.type || 'Openspace',
            category: row.category || 'Основное',
            employeeName: row.employeeName || '',
            tabNumber: row.tabNumber || '',
            department: row.department || '',
            team: row.team || '',
            position: row.position || '',
            status: row.status,
            coworkingType: row.coworkingType || '',
            updatedAt: new Date()
          },
          $setOnInsert: {
            createdAt: new Date()
          }
        },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        inserted++;
      } else if (result.modifiedCount > 0) {
        updated++;
      }
    }

    // Сохранение в import_logs
    const userName = req.body.userName || 'Unknown';
    await db.collection('import_logs').insertOne({
      fileName: req.file.originalname,
      userName,
      timestamp: new Date(),
      totalRows: data.length,
      inserted,
      updated,
      errors: errors.length,
      status: errors.length > 0 ? 'partial' : 'success'
    });

    res.json({
      success: true,
      total: data.length,
      inserted,
      updated,
      errors
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process file'
    });
  }
});

router.get('/admin/imports', async (req, res) => {
  try {
    const imports = await db
      .collection('import_logs')
      .find()
      .sort({ timestamp: -1 })
      .limit(20)
      .toArray();

    res.json({
      success: true,
      imports: imports.map(imp => ({
        id: imp._id.toString(),
        fileName: imp.fileName,
        userName: imp.userName,
        timestamp: imp.timestamp,
        totalRows: imp.totalRows,
        inserted: imp.inserted,
        updated: imp.updated,
        errors: imp.errors,
        status: imp.status
      }))
    });
  } catch (error) {
    console.error('Error fetching imports:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch imports'
    });
  }
});
```

```typescript
// src/api/workspaceApi.ts (добавить)

export interface UploadResponse {
  success: boolean;
  total?: number;
  inserted?: number;
  updated?: number;
  errors?: Array<{ row: number; error: string }>;
  error?: string;
}

export interface ImportLog {
  id: string;
  fileName: string;
  userName: string;
  timestamp: string;
  totalRows: number;
  inserted: number;
  updated: number;
  errors: number;
  status: 'success' | 'partial' | 'failed';
}

export interface ImportsResponse {
  success: boolean;
  imports: ImportLog[];
  error?: string;
}

export async function uploadWorkplacesFile(
  file: File,
  userName: string
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userName', userName);

  const response = await fetch(`${URLs.apiBase}/admin/upload`, {
    method: 'POST',
    body: formData
  });

  return await response.json();
}

export async function getImportHistory(): Promise<ImportsResponse> {
  const response = await fetch(`${URLs.apiBase}/admin/imports`);
  return await response.json();
}
```

```typescript
// src/pages/admin/admin.tsx

import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Card,
  Table,
  Alert,
  Spinner,
  HStack,
  Badge
} from '@chakra-ui/react';
import { createToaster } from '@chakra-ui/react';
import { uploadWorkplacesFile, getImportHistory, ImportLog } from '../../api/workspaceApi';
import { getCurrentUser } from '../../api/workspaceApi';

const toaster = createToaster({ placement: 'top' });

export const AdminPanel: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [imports, setImports] = useState<ImportLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загрузка истории при монтировании
  React.useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await getImportHistory();
      if (response.success) {
        setImports(response.imports);
      }
    } catch (error) {
      console.error('Failed to load import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      // Получить имя пользователя
      const userResponse = await getCurrentUser();
      const userName = userResponse.user?.name || 'Unknown';

      const result = await uploadWorkplacesFile(selectedFile, userName);

      setUploadResult(result);

      if (result.success) {
        toaster.create({
          title: 'Успешно загружено!',
          description: `Добавлено: ${result.inserted}, Обновлено: ${result.updated}`,
          type: 'success'
        });

        // Очистить кеш
        localStorage.removeItem('workspace-finder:cache:workplaces');
        localStorage.removeItem('workspace-finder:cache:coworkings');
        localStorage.removeItem('workspace-finder:cache:stats');
        localStorage.removeItem('workspace-finder:cache:zones');

        // Обновить историю
        loadImportHistory();

        // Сбросить форму
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        toaster.create({
          title: 'Ошибка загрузки',
          description: result.error || 'Не удалось загрузить файл',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toaster.create({
        title: 'Ошибка',
        description: 'Не удалось загрузить файл',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" color="blue.600" mb={2}>
            Панель администратора
          </Heading>
          <Text color="gray.600">Загрузка данных о рабочих местах</Text>
        </Box>

        {/* Форма загрузки */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Загрузить XLS файл</Heading>
          </Card.Header>
          <Card.Body>
            <VStack spacing={4} align="stretch">
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={8}
                textAlign="center"
                bg="gray.50"
                cursor="pointer"
                _hover={{ borderColor: 'blue.500', bg: 'blue.50' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <Text fontSize="lg" color="gray.600">
                  {selectedFile
                    ? `Выбран файл: ${selectedFile.name}`
                    : '📄 Перетащите XLS файл сюда или нажмите для выбора'}
                </Text>
                {selectedFile && (
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    Размер: {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                )}
              </Box>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? <Spinner size="sm" /> : 'Загрузить'}
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Результат загрузки */}
        {uploadResult && uploadResult.success && (
          <Alert.Root status="success">
            <Alert.Indicator />
            <Box>
              <Alert.Title>Загрузка завершена!</Alert.Title>
              <Alert.Description>
                Всего записей: {uploadResult.total} | Добавлено: {uploadResult.inserted} |
                Обновлено: {uploadResult.updated}
                {uploadResult.errors.length > 0 && ` | Ошибок: ${uploadResult.errors.length}`}
              </Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {uploadResult && uploadResult.errors && uploadResult.errors.length > 0 && (
          <Alert.Root status="warning">
            <Alert.Indicator />
            <Box>
              <Alert.Title>Обнаружены ошибки при импорте</Alert.Title>
              <Alert.Description>
                <VStack align="start" mt={2} spacing={1}>
                  {uploadResult.errors.slice(0, 10).map((err: any, idx: number) => (
                    <Text key={idx} fontSize="sm">
                      Строка {err.row}: {err.error}
                    </Text>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <Text fontSize="sm" fontStyle="italic">
                      ... и еще {uploadResult.errors.length - 10} ошибок
                    </Text>
                  )}
                </VStack>
              </Alert.Description>
            </Box>
          </Alert.Root>
        )}

        {/* История импортов */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">История загрузок</Heading>
          </Card.Header>
          <Card.Body>
            {loadingHistory ? (
              <Box textAlign="center" py={4}>
                <Spinner />
              </Box>
            ) : (
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Дата</Table.ColumnHeader>
                    <Table.ColumnHeader>Файл</Table.ColumnHeader>
                    <Table.ColumnHeader>Пользователь</Table.ColumnHeader>
                    <Table.ColumnHeader>Записей</Table.ColumnHeader>
                    <Table.ColumnHeader>Добавлено</Table.ColumnHeader>
                    <Table.ColumnHeader>Обновлено</Table.ColumnHeader>
                    <Table.ColumnHeader>Ошибок</Table.ColumnHeader>
                    <Table.ColumnHeader>Статус</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {imports.map((imp) => (
                    <Table.Row key={imp.id}>
                      <Table.Cell>
                        {new Date(imp.timestamp).toLocaleString('ru-RU')}
                      </Table.Cell>
                      <Table.Cell>{imp.fileName}</Table.Cell>
                      <Table.Cell>{imp.userName}</Table.Cell>
                      <Table.Cell>{imp.totalRows}</Table.Cell>
                      <Table.Cell>{imp.inserted}</Table.Cell>
                      <Table.Cell>{imp.updated}</Table.Cell>
                      <Table.Cell>{imp.errors}</Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme={
                            imp.status === 'success'
                              ? 'green'
                              : imp.status === 'partial'
                              ? 'yellow'
                              : 'red'
                          }
                        >
                          {imp.status}
                        </Badge>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
};
```

## Тестирование

### Подготовка тестового XLS файла:

Создать файл `test-workplaces.xlsx` с колонками:
- placeNumber, placeName, zone, blockCode, type, category, employeeName, tabNumber, department, team, position, status, coworkingType

### Backend тестирование:
```bash
curl -X POST http://localhost:8099/api/admin/upload \
  -F "file=@test-workplaces.xlsx" \
  -F "userName=Admin User"
```

### UI тестирование:
1. Открыть `/workspace-finder/admin`
2. Выбрать XLS файл
3. Кликнуть "Загрузить"
4. Проверить success message
5. Проверить таблицу истории - должна появиться новая запись
6. Вернуться на главную - проверить что данные обновились
7. Попробовать загрузить файл с ошибками - проверить отображение ошибок

### Проверка инвалидации кеша:
1. Открыть главную страницу, загрузить данные (будет кеш)
2. Загрузить новый XLS в админке
3. Вернуться на главную - данные должны обновиться (кеш очищен)

## Связанные задачи

- Зависит от: TASK-02 (MongoDB), TASK-03 (API Auth)
- Связано с: TASK-04 (должен очищать cache после импорта)
- Последняя крупная задача перед финальной полировкой (TASK-10)
