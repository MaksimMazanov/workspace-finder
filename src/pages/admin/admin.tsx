import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Heading,
  HStack,
  Spinner,
  Table,
  Text,
  VStack,
  createToaster,
  Progress
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  getImportHistory,
  ImportLog,
  uploadWorkplacesFile
} from '../../api/workspaceApi';
import { URLs } from '../../__data__/urls';

const toaster = createToaster({ placement: 'top' });

const cacheKeys = [
  'workspace-finder:cache:workplaces',
  'workspace-finder:cache:coworkings',
  'workspace-finder:cache:stats',
  'workspace-finder:cache:zones'
];

export const AdminPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [imports, setImports] = useState<ImportLog[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await getImportHistory();
      if (response.success) {
        setImports(response.imports || []);
      }
    } catch (error) {
      console.error('Failed to load import history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${URLs.apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      toaster.create({
        description: 'Вы вышли из админ-панели',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/login');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toaster.create({
        description: 'Ошибка при выходе',
        type: 'error'
      });
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    try {
      const userResponse = await getCurrentUser();
      const userName = userResponse.user?.email || 'Admin';

      const result = await uploadWorkplacesFile(selectedFile, userName);
      setUploadResult(result);

      if (result.success) {
        toaster.create({
          title: 'Успешно загружено!',
          description: `Добавлено: ${result.inserted}, Обновлено: ${result.updated}`,
          type: 'success'
        });

        cacheKeys.forEach((key) => localStorage.removeItem(key));

        await loadImportHistory();

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
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="container.xl">
        <VStack gap={8} align="stretch">
          <Card.Root>
            <Card.Header>
              <HStack justify="space-between" width="100%">
                <Box>
                  <Heading size="lg">Панель администратора</Heading>
                  <Text color="gray.600">Загрузка данных о рабочих местах</Text>
                </Box>
                <Button
                  colorScheme="red"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Выход
                </Button>
              </HStack>
            </Card.Header>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Heading size="md">Загрузить XLS файл</Heading>
            </Card.Header>
            <Card.Body>
              <VStack spacing={4} align="stretch">
                <Box
                  border="2px dashed"
                  borderColor={isDragActive ? 'blue.400' : 'gray.300'}
                  borderRadius="md"
                  p={8}
                  textAlign="center"
                  bg={isDragActive ? 'blue.50' : 'gray.50'}
                  cursor="pointer"
                  _hover={{ borderColor: 'blue.500', bg: 'blue.50' }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragActive(true);
                  }}
                  onDragLeave={() => setIsDragActive(false)}
                  onDrop={handleDrop}
                  position="relative"
                  overflow="hidden"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleInputChange}
                    position="absolute"
                    inset={0}
                    opacity={0}
                    cursor="pointer"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <Text fontSize="lg" color="gray.600" pointerEvents="none">
                    {selectedFile
                      ? `Выбран файл: ${selectedFile.name}`
                      : '📄 Перетащите XLS файл сюда или нажмите для выбора'}
                  </Text>
                  {selectedFile && (
                    <Text fontSize="sm" color="gray.500" mt={2} pointerEvents="none">
                      Размер: {(selectedFile.size / 1024).toFixed(2)} KB
                    </Text>
                  )}
                </Box>

                {uploading && (
                  <Progress.Root value={100} size="sm" colorPalette="blue" w="100%">
                    <Progress.Track borderRadius="full">
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                )}

                <HStack gap={2} width="100%">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    flex={1}
                  >
                    {uploading ? <Spinner size="sm" /> : 'Загрузить'}
                  </Button>
                  {!selectedFile && (
                    <Button
                      colorScheme="gray"
                      variant="outline"
                      size="lg"
                      onClick={async () => {
                        try {
                          setUploading(true);
                          const response = await fetch('/api/test/upload-real-file', {
                            method: 'GET',
                            credentials: 'include'
                          });
                          const result = await response.json();
                          if (result.success) {
                            toaster.create({
                              title: 'Тестовый файл загружен!',
                              description: `Добавлено: ${result.inserted}, Обновлено: ${result.updated}`,
                              type: 'success'
                            });
                            await loadImportHistory();
                          }
                        } catch (error) {
                          toaster.create({
                            title: 'Ошибка',
                            description: 'Не удалось загрузить тестовый файл',
                            type: 'error'
                          });
                        } finally {
                          setUploading(false);
                        }
                      }}
                    >
                      Загрузить тест
                    </Button>
                  )}
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>

          {uploadResult && uploadResult.success && (
            <Alert.Root status="success">
              <Alert.Indicator />
              <Box>
                <Alert.Title>Загрузка завершена!</Alert.Title>
                <Alert.Description>
                  Всего записей: {uploadResult.total} | Добавлено: {uploadResult.inserted} | Обновлено:{' '}
                  {uploadResult.updated}
                  {uploadResult.errors?.length > 0 && ` | Ошибок: ${uploadResult.errors.length}`}
                </Alert.Description>
              </Box>
            </Alert.Root>
          )}

          {uploadResult?.errors?.length > 0 && (
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
                    {imports.length === 0 && (
                      <Table.Row>
                        <Table.Cell colSpan={8} textAlign="center" color="gray.500">
                          История загрузок пока пуста.
                        </Table.Cell>
                      </Table.Row>
                    )}
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
    </Box>
  );
};
