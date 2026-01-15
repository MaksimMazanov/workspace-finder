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
import { getWorkplaces, Block } from '../api/workspaceApi';
import { BlockTable } from './BlockTable';

interface TableViewProps {
  refreshTrigger?: number; // Для принудительного обновления данных
}

export const TableView: React.FC<TableViewProps> = ({ refreshTrigger }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkplaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getWorkplaces();

      if (response.success) {
        setBlocks(response.blocks);
      } else {
        setError(response.error || 'Не удалось загрузить данные');
      }
    } catch (err) {
      console.error('Failed to load workplaces:', err);
      setError('Не удалось загрузить данные. Проверьте подключение.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkplaces();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">
          Загрузка данных...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Ошибка загрузки!</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Box>
      </Alert.Root>
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

  // Сортируем блоки по коду
  const sortedBlocks = [...blocks].sort((a, b) => a.code.localeCompare(b.code));

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
            places={block.places}
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
            Всего блоков: {blocks.length} | Всего мест:{' '}
            {blocks.reduce((sum, block) => sum + block.total, 0)} | Занято:{' '}
            {blocks.reduce((sum, block) => sum + block.occupied, 0)}
          </Text>
        </VStack>
      </Box>
    </VStack>
  );
};