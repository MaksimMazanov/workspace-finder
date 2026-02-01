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
  Separator,
} from '@chakra-ui/react';
import { Workplace } from '../api/workspaceApi';
import {
  getEmployeeLabelStyle,
  normalizeDepartmentLabel,
  normalizeEmployeeLabel
} from '../utils/formatters';

interface ResultCardProps {
  workplace: Workplace;
}

export const ResultCard: React.FC<ResultCardProps> = ({ workplace }) => {
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
        </HStack>
      </Card.Header>

      <Card.Body pt={0}>
        <VStack spacing={3} align="stretch">
          {/* Информация о сотруднике */}
          {workplace.employeeName && (
            <>
              <VStack align="start" spacing={0}>
                <Text fontWeight="semibold" fontSize="md" {...getEmployeeLabelStyle(workplace.employeeName)}>
                  👤 {normalizeEmployeeLabel(workplace.employeeName)}
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
                    🏛️ <strong>Отдел:</strong> {normalizeDepartmentLabel(workplace.department)}
                  </Text>
              {workplace.team && (
                <Text fontSize="sm">
                  👥 <strong>Команда:</strong> {workplace.team}
                </Text>
              )}
            </VStack>
          )}

        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
