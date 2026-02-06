import React from 'react';
import {
  Alert,
  Box,
  Card,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Spinner,
  Table,
  Text,
  VStack,
} from '@chakra-ui/react';
import { getStats, StatsResponse, TypeStat } from '../api/workspaceApi';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import { StatCard } from './StatCard';

const formatNumber = (value: number) => value.toLocaleString('ru-RU');

const getOccupancyPalette = (percent: number) => {
  if (percent < 70) return 'green';
  if (percent < 85) return 'yellow';
  return 'red';
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'Openspace':
      return 'Опенспейс';
    case 'Coworking':
      return 'Коворкинг';
    default:
      return type;
  }
};

const renderTypeRow = ([type, stats]: [string, TypeStat]) => {
  const occupancyPercent = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
  const colorPalette = getOccupancyPalette(occupancyPercent);

  return (
    <Card.Root
      key={type}
      size="sm"
      bg="white"
      shadow="sm"
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
    >
      <Card.Body>
        <VStack align="stretch" spacing={3}>
          <HStack justify="space-between">
            <Heading size="sm" color="blue.600">
              {getTypeLabel(type)}
            </Heading>
            <Text fontSize="sm" color="gray.500">
              {formatNumber(stats.occupied)} / {formatNumber(stats.total)}
            </Text>
          </HStack>
          <Progress.Root value={occupancyPercent} size="sm" colorPalette={colorPalette} w="100%">
            <Progress.Track borderRadius="full">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.600">
            Занято: {formatNumber(stats.occupied)} · Свободно: {formatNumber(stats.total - stats.occupied)} · {occupancyPercent.toFixed(0)}%
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

const StatsViewComponent: React.FC = () => {
  const { data, loading, error } = useLocalStorageCache<StatsResponse>(
    'stats',
    getStats,
    5 * 60 * 1000
  );

  const totalPlaces = data?.totalPlaces ?? 0;
  const occupiedPlaces = data?.occupiedPlaces ?? 0;
  const freePlaces = data?.freePlaces ?? 0;
  const occupancyPercent = totalPlaces > 0 ? (occupiedPlaces / totalPlaces) * 100 : 0;
  const occupancyPalette = getOccupancyPalette(occupancyPercent);
  const blockEntries = data ? Object.entries(data.blockStats) : [];
  const typeEntries = data ? Object.entries(data.typeStats) : [];

  if (loading && !data) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">
          Загрузка статистики...
        </Text>
      </Box>
    );
  }

  if (error && !data) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Alert.Root status="error" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Ошибка загрузки!</Alert.Title>
          <Alert.Description>{errorMessage || 'Не удалось загрузить статистику'}</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  if (!data || totalPlaces === 0) {
    return (
      <Alert.Root status="info" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Нет данных</Alert.Title>
          <Alert.Description>Статистика пока недоступна.</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Статистика рабочих мест
        </Heading>
        <Text color="gray.600">
          Общая информация о занятости офиса
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <StatCard icon="📊" label="Всего мест" value={totalPlaces} />
        <StatCard icon="👥" label="Занято" value={occupiedPlaces} colorScheme="red" />
        <StatCard icon="✅" label="Свободно" value={freePlaces} colorScheme="green" />
      </SimpleGrid>

      <Card.Root size="sm" bg="white" shadow="md" borderRadius="lg" border="1px" borderColor="gray.200">
        <Card.Body>
          <VStack align="stretch" spacing={3}>
            <Heading size="sm" color="blue.600">
              Общая занятость
            </Heading>
            <Progress.Root value={occupancyPercent} size="lg" colorPalette={occupancyPalette} w="100%">
              <Progress.Track borderRadius="full">
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {occupancyPercent.toFixed(1)}% занято
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Card.Root size="sm" bg="white" shadow="md" borderRadius="lg" border="1px" borderColor="gray.200">
        <Card.Header pb={2}>
          <Heading size="sm" color="blue.600">
            Статистика по блокам
          </Heading>
        </Card.Header>
        <Card.Body pt={0}>
          {blockEntries.length === 0 ? (
            <Text fontSize="sm" color="gray.600">
              Данные по блокам не найдены.
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table.Root size="sm" variant="line">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Блок</Table.ColumnHeader>
                    <Table.ColumnHeader>Всего</Table.ColumnHeader>
                    <Table.ColumnHeader>Занято</Table.ColumnHeader>
                    <Table.ColumnHeader>Свободно</Table.ColumnHeader>
                    <Table.ColumnHeader>%</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {blockEntries
                  .sort(([a], [b]) => {
                    const normalize = (code: string) =>
                      code
                        .toLowerCase()
                        .replace(/а/g, 'a')
                        .replace(/в/g, 'b');
                    const priority = new Map([
                      ['5.a.01', 0],
                      ['5.a.02', 1],
                      ['5.b.01', 2],
                      ['5.b.02', 3]
                    ]);
                    const prioA = priority.get(normalize(a)) ?? 9999;
                    const prioB = priority.get(normalize(b)) ?? 9999;
                    if (prioA !== prioB) return prioA - prioB;
                    return a.localeCompare(b, 'ru', { numeric: true });
                  })
                    .map(([blockCode, stats], index) => {
                      const percent = stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;
                      const rowBg = index % 2 === 0 ? 'gray.50' : 'transparent';

                      return (
                        <Table.Row key={blockCode} bg={rowBg}>
                          <Table.Cell fontWeight="semibold">{blockCode}</Table.Cell>
                          <Table.Cell>{formatNumber(stats.total)}</Table.Cell>
                          <Table.Cell>{formatNumber(stats.occupied)}</Table.Cell>
                          <Table.Cell>{formatNumber(stats.free)}</Table.Cell>
                          <Table.Cell>{percent.toFixed(0)}%</Table.Cell>
                        </Table.Row>
                      );
                    })}
                </Table.Body>
              </Table.Root>
            </Box>
          )}
        </Card.Body>
      </Card.Root>

      <Card.Root size="sm" bg="white" shadow="md" borderRadius="lg" border="1px" borderColor="gray.200">
        <Card.Header pb={2}>
          <Heading size="sm" color="blue.600">
            Статистика по типам мест
          </Heading>
        </Card.Header>
        <Card.Body pt={0}>
          {typeEntries.length === 0 ? (
            <Text fontSize="sm" color="gray.600">
              Данные по типам мест не найдены.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {typeEntries
                .sort(([a], [b]) => {
                  const normalize = (code: string) =>
                    code
                      .toLowerCase()
                      .replace(/а/g, 'a')
                      .replace(/в/g, 'b');
                  const priority = new Map([
                    ['5.a.01', 0],
                    ['5.a.02', 1],
                    ['5.b.01', 2],
                    ['5.b.02', 3]
                  ]);
                  const prioA = priority.get(normalize(a)) ?? 9999;
                  const prioB = priority.get(normalize(b)) ?? 9999;
                  if (prioA !== prioB) return prioA - prioB;
                  return a.localeCompare(b, 'ru', { numeric: true });
                })
                .map(renderTypeRow)}
            </SimpleGrid>
          )}
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export const StatsView = React.memo(StatsViewComponent);

StatsView.displayName = 'StatsView';
