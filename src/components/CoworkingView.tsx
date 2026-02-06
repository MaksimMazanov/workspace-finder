import React from 'react';
import {
  Alert,
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CoworkingsResponse, getCoworkings } from '../api/workspaceApi';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import { CoworkingCard } from './CoworkingCard';

const CoworkingViewComponent: React.FC = () => {
  const { data, loading, error } = useLocalStorageCache<CoworkingsResponse>(
    'coworkings',
    getCoworkings,
    5 * 60 * 1000
  );

  const coworkings = data?.coworkings ?? [];
  const total = data?.total ?? 0;
  const totalOccupied = data?.totalOccupied ?? 0;
  const totalFree = total - totalOccupied;

  if (loading && coworkings.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">
          Загрузка коворкингов...
        </Text>
      </Box>
    );
  }

  if (error && coworkings.length === 0) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Alert.Root status="error" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Ошибка загрузки!</Alert.Title>
          <Alert.Description>{errorMessage || 'Не удалось загрузить коворкинги'}</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  if (coworkings.length === 0) {
    return (
      <Alert.Root status="info" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Нет данных</Alert.Title>
          <Alert.Description>Коворкинги пока не добавлены.</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Коворкинги
        </Heading>
        <Text color="gray.600">
          Всего мест: {total} | Занято: {totalOccupied} | Свободно: {totalFree}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {coworkings.map((coworking) => (
          <CoworkingCard key={coworking.id} coworking={coworking} />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export const CoworkingView = React.memo(CoworkingViewComponent);

CoworkingView.displayName = 'CoworkingView';
