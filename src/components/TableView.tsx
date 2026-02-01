import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Alert,
} from '@chakra-ui/react';
import { getWorkplaces, Block, getCurrentUser, User, WorkplacesResponse } from '../api/workspaceApi';
import { BlockTable } from './BlockTable';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';

interface TableViewProps {
  refreshTrigger?: number; // Для принудительного обновления данных
}

export const TableView: React.FC<TableViewProps> = ({ refreshTrigger }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use cache hook for workplaces data
  const { data: cachedWorkplaces, loading: workplacesLoading, error: workplacesError } = useLocalStorageCache<WorkplacesResponse>(
    'workplaces',
    getWorkplaces,
    5 * 60 * 1000 // 5 minutes
  );

  useEffect(() => {
    if (cachedWorkplaces) {
      if (cachedWorkplaces.success) {
        setBlocks(cachedWorkplaces.blocks);
        setError(null);
      } else {
        setError(cachedWorkplaces.error || 'Не удалось загрузить данные');
      }
    }
  }, [cachedWorkplaces]);

  // Load current user separately (not cached)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userResponse = await getCurrentUser();
        if (userResponse.success && userResponse.user) {
          setUser(userResponse.user);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };

    loadUser();
  }, [refreshTrigger]);

  // Show error if workplaces failed to load and no cached data
  if (workplacesError && !blocks.length) {
    return (
      <Alert.Root status="error" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Ошибка загрузки!</Alert.Title>
          <Alert.Description>
            {error || 'Не удалось загрузить данные. Проверьте подключение.'}
          </Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  // Show spinner only if loading and no cached data available
  if (workplacesLoading && !blocks.length) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">
          Загрузка данных...
        </Text>
      </Box>
    );
  }

  if (blocks.length === 0) {
    return (
      <Alert.Root status="info" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Нет данных</Alert.Title>
          <Alert.Description>Не найдено ни одного блока с рабочими местами.</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  const normalizeBlockCode = (code: string) =>
    code
      .toLowerCase()
      .replace(/а/g, 'a')
      .replace(/в/g, 'b');
  const priorityOrder = new Map([
    ['5.a.01', 0],
    ['5.a.02', 1],
    ['5.b.01', 2],
    ['5.b.02', 3]
  ]);
  const getPriority = (code: string) => priorityOrder.get(normalizeBlockCode(code)) ?? 9999;

  // Сортируем блоки по приоритету и коду
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (!a.code || !b.code) return 0;
    const prioA = getPriority(a.code);
    const prioB = getPriority(b.code);
    if (prioA !== prioB) return prioA - prioB;
    return a.code.localeCompare(b.code, 'ru', { numeric: true });
  });

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Карта рабочих мест
        </Heading>
        <Text color="gray.600">
          Обзор всех блоков и занятых мест
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {sortedBlocks.map((block) => (
          <BlockTable
            key={block.code}
            blockCode={block.code}
            places={[...block.places].sort((a, b) =>
              a.placeNumber.localeCompare(b.placeNumber, 'ru', { numeric: true })
            )}
            total={block.total}
            occupied={block.occupied}
          />
        ))}
      </SimpleGrid>

      {/* Общая статистика */}
      <Box
        bg="blue.50"
        p={4}
        borderRadius="md"
        border="1px"
        borderColor="blue.200"
      >
        <VStack spacing={2}>
          <Heading size="sm" color="blue.700">
            Общая статистика
          </Heading>
          <Text fontSize="sm" color="blue.600">
            {user && (
              <>
                Пользователь: <Text as="span" fontWeight="bold">{user.name}</Text> | {' '}
              </>
            )}
            Всего блоков: {blocks.length} | Всего мест:{' '}
            {blocks.reduce((sum, block) => sum + block.total, 0)} | Занято:{' '}
            {blocks.reduce((sum, block) => sum + block.occupied, 0)}
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};
