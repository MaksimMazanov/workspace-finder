import React from 'react';
import {
  Accordion,
  Alert,
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { getZones, Zone } from '../api/workspaceApi';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';
import {
  getEmployeeLabelStyle,
  normalizeDepartmentLabel,
  normalizeEmployeeLabel
} from '../utils/formatters';

const getOccupancyPalette = (percent: number) => {
  if (percent < 50) return 'green';
  if (percent < 80) return 'yellow';
  return 'red';
};

const getTypeColorScheme = (type: string) => {
  const normalized = type.toLowerCase();
  if (normalized.includes('open')) return 'blue';
  if (normalized.includes('coworking')) return 'purple';
  if (normalized.includes('meeting')) return 'orange';
  return 'gray';
};

interface ZoneCardProps {
  zone: Zone;
}

const ZoneCardComponent: React.FC<ZoneCardProps> = ({ zone }) => {
  const occupancyPercent = zone.totalPlaces > 0
    ? (zone.occupiedPlaces / zone.totalPlaces) * 100
    : 0;
  const occupancyRounded = Math.round(occupancyPercent);
  const colorPalette = getOccupancyPalette(occupancyPercent);
  const freePlaces = zone.totalPlaces - zone.occupiedPlaces;
  const typeColorScheme = getTypeColorScheme(zone.type);

  return (
    <Card.Root
      size="sm"
      bg="white"
      shadow="md"
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
      _hover={{ shadow: 'lg' }}
      transition="box-shadow 0.2s ease"
    >
      <Card.Header pb={3}>
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" align="center">
            <Heading size="md" color="blue.600">
              {zone.name}
            </Heading>
            <Badge colorScheme={typeColorScheme} fontSize="sm" px={2} py={1}>
              {zone.type}
            </Badge>
          </HStack>
          <Progress.Root value={occupancyPercent} size="sm" colorPalette={colorPalette} w="100%">
            <Progress.Track borderRadius="full">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="sm" color="gray.600">
            Всего: {zone.totalPlaces} | Занято: {zone.occupiedPlaces} | Свободно: {freePlaces} | {occupancyRounded}%
          </Text>
          <Text fontSize="xs" color="gray.500">
            Блоки: {zone.blockCodes.join(', ') || '—'}
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body pt={0}>
        <Accordion.Root collapsible>
          <Accordion.Item value={`places-${zone.name}`}>
            <Accordion.ItemTrigger>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" fontWeight="semibold">
                  Места в зоне ({zone.totalPlaces})
                </Text>
                <Accordion.ItemIndicator />
              </HStack>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                <VStack align="stretch" spacing={2} mt={2} maxH="300px" overflowY="auto">
                  {zone.places.map((place) => (
                    <HStack
                      key={place.id}
                      p={2}
                      bg="gray.50"
                      borderRadius="md"
                      justify="space-between"
                      align="flex-start"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="semibold">
                          {place.placeNumber}
                        </Text>
                        {place.employeeName ? (
                          <Text fontSize="xs" {...getEmployeeLabelStyle(place.employeeName)}>
                            {normalizeEmployeeLabel(place.employeeName)}
                          </Text>
                        ) : (
                          <Text fontSize="xs" color="gray.500">
                            Свободно
                          </Text>
                        )}
                        {place.department && (
                          <Text fontSize="xs" color="gray.500">
                            {normalizeDepartmentLabel(place.department)}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Card.Body>
    </Card.Root>
  );
};

const ZoneCard = React.memo(ZoneCardComponent);

ZoneCard.displayName = 'ZoneCard';

const MapViewComponent: React.FC = () => {
  const { data, loading, error } = useLocalStorageCache<Zone[]>(
    'zones',
    async () => {
      const response = await getZones();
      if (response.success) {
        return response.zones;
      }
      throw new Error(response.error || 'Не удалось загрузить карту зон');
    },
    5 * 60 * 1000
  );

  const zones = data ?? [];
  const totalPlaces = zones.reduce((sum, zone) => sum + zone.totalPlaces, 0);
  const totalOccupied = zones.reduce((sum, zone) => sum + zone.occupiedPlaces, 0);
  const totalFree = totalPlaces - totalOccupied;

  if (loading && zones.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.600">
          Загрузка карты зон...
        </Text>
      </Box>
    );
  }

  if (error && zones.length === 0) {
    return (
      <Alert.Root status="error" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Ошибка загрузки!</Alert.Title>
          <Alert.Description>{error.message}</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  if (zones.length === 0) {
    return (
      <Alert.Root status="info" borderRadius="md">
        <Alert.Indicator />
        <Box>
          <Alert.Title>Нет данных</Alert.Title>
          <Alert.Description>Зоны пока не добавлены.</Alert.Description>
        </Box>
      </Alert.Root>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box textAlign="center">
        <Heading size="lg" color="blue.600" mb={2}>
          Карта зон
        </Heading>
        <Text color="gray.600">
          Всего зон: {zones.length} | Всего мест: {totalPlaces} | Занято: {totalOccupied} | Свободно: {totalFree}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {zones.map((zone) => (
          <ZoneCard key={zone.name} zone={zone} />
        ))}
      </SimpleGrid>
    </VStack>
  );
};

export const MapView = React.memo(MapViewComponent);

MapView.displayName = 'MapView';
