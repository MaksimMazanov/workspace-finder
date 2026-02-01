import React from 'react';
import {
  Accordion,
  Badge,
  Box,
  Card,
  Heading,
  HStack,
  Progress,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Coworking } from '../api/workspaceApi';
import {
  getEmployeeLabelStyle,
  normalizeDepartmentLabel,
  normalizeEmployeeLabel
} from '../utils/formatters';

interface CoworkingCardProps {
  coworking: Coworking;
}

const CoworkingCardComponent: React.FC<CoworkingCardProps> = ({ coworking }) => {
  const occupancyPercent = coworking.total > 0
    ? (coworking.occupied / coworking.total) * 100
    : 0;
  const occupancyRounded = Math.round(occupancyPercent);

  const getColorPalette = (percent: number) => {
    if (percent < 50) return 'green';
    if (percent < 80) return 'yellow';
    return 'red';
  };

  const colorPalette = getColorPalette(occupancyPercent);
  const freePlaces = coworking.total - coworking.occupied;

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
              {coworking.name}
            </Heading>
            <Badge colorScheme={colorPalette} fontSize="sm" px={2} py={1}>
              {coworking.occupied}/{coworking.total}
            </Badge>
          </HStack>
          <Progress.Root value={occupancyPercent} size="sm" colorPalette={colorPalette} w="100%">
            <Progress.Track borderRadius="full">
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="sm" color="gray.600">
            Занято: {coworking.occupied} | Свободно: {freePlaces} | {occupancyRounded}%
          </Text>
        </VStack>
      </Card.Header>

      <Card.Body pt={0}>
        {coworking.occupied > 0 ? (
          <Accordion.Root collapsible>
            <Accordion.Item value={`places-${coworking.id}`}>
              <Accordion.ItemTrigger>
                <HStack justify="space-between" w="100%">
                  <Text fontSize="sm" fontWeight="semibold">
                    Занятые места ({coworking.occupied})
                  </Text>
                  <Accordion.ItemIndicator />
                </HStack>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody>
                  <VStack align="stretch" spacing={2} mt={2}>
                    {coworking.places.map((place) => (
                      <Box key={place.id} p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm" fontWeight="semibold">
                          {place.placeNumber} —{' '}
                          <Text
                            as="span"
                            fontSize="xs"
                            color="gray.600"
                            {...getEmployeeLabelStyle(place.employeeName)}
                          >
                            {normalizeEmployeeLabel(place.employeeName)}
                          </Text>
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {normalizeDepartmentLabel(place.department)}
                        </Text>
                        {place.team && (
                          <Text fontSize="xs" color="gray.500">
                            {place.team}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          </Accordion.Root>
        ) : (
          <Text fontSize="sm" color="green.600" fontWeight="semibold">
            ✅ Все места свободны
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export const CoworkingCard = React.memo(CoworkingCardComponent);

CoworkingCard.displayName = 'CoworkingCard';
