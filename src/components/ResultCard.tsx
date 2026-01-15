import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Separator,
} from '@chakra-ui/react';
import { Workplace } from '../api/workspaceApi';

interface ResultCardProps {
  workplace: Workplace;
}

export const ResultCard: React.FC<ResultCardProps> = ({ workplace }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'red';
      case 'free':
        return 'green';
      case 'reserved':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'Занято';
      case 'free':
        return 'Свободно';
      case 'reserved':
        return 'Зарезервировано';
      default:
        return 'Неизвестно';
    }
  };

  return (
    <Card.Root
      size="md"
      bg="white"
      shadow="md"
      borderRadius="lg"
      overflow="hidden"
      border="1px"
      borderColor="gray.200"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <Card.Header pb={2}>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <Heading size="md" color="blue.600">
              {workplace.placeNumber}
            </Heading>
            <Text fontSize="sm" color="gray.600">
              {workplace.zone}
            </Text>
          </VStack>
          <Badge
            colorScheme={getStatusColor(workplace.status)}
            variant="solid"
            fontSize="xs"
            px={2}
            py={1}
          >
            {getStatusText(workplace.status)}
          </Badge>
        </HStack>
      </Card.Header>

      <Card.Body pt={0}>
        <VStack spacing={3} align="stretch">
          {/* Информация о сотруднике */}
          {workplace.employeeName && (
            <>
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="md">
                  👤 {workplace.employeeName}
                </Text>
                {workplace.position && (
                  <Text fontSize="sm" color="gray.600">
                    {workplace.position}
                  </Text>
                )}
              </VStack>
              <Separator />
            </>
          )}

          {/* Информация о месте */}
          <VStack align="start" spacing={0}>
            <Text fontSize="sm">
              📍 <strong>Блок:</strong> {workplace.blockCode}
            </Text>
            <Text fontSize="sm">
              🏢 <strong>Тип:</strong> {workplace.type}
            </Text>
          </VStack>

          {/* Информация об отделе */}
          {workplace.department && (
            <VStack align="start" spacing={0}>
              <Text fontSize="sm">
                🏛️ <strong>Отдел:</strong> {workplace.department}
              </Text>
              {workplace.team && (
                <Text fontSize="sm">
                  👥 <strong>Команда:</strong> {workplace.team}
                </Text>
              )}
            </VStack>
          )}

          {/* Рабочая иконка если свободно */}
          {workplace.status === 'free' && (
            <Text fontSize="sm" color="green.600" fontWeight="semibold">
              ✅ Место доступно для работы
            </Text>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};