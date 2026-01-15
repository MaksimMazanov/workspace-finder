import React from 'react';
import {
  Box,
  Table,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { Workplace } from '../api/workspaceApi';

interface BlockTableProps {
  blockCode: string;
  places: Workplace[];
  total: number;
  occupied: number;
}

export const BlockTable: React.FC<BlockTableProps> = ({
  blockCode,
  places,
  total,
  occupied,
}) => {
  const bgColor = 'gray.50';
  const borderColor = 'gray.200';

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
    <Card.Root size="sm" bg={bgColor} shadow="sm" borderRadius="md">
      <Card.Header pb={2}>
        <VStack spacing={1} align="start">
          <Heading size="md" color="blue.600">
            Блок {blockCode}
          </Heading>
          <HStack spacing={4}>
            <Text fontSize="sm" color="gray.600">
              Всего мест: {total}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Занято: {occupied}
            </Text>
            <Text fontSize="sm" color="gray.600">
              Свободно: {total - occupied}
            </Text>
          </HStack>
        </VStack>
      </Card.Header>

      <Card.Body pt={0}>
        <Box overflowX="auto">
          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader borderColor={borderColor}>Место</Table.ColumnHeader>
                <Table.ColumnHeader borderColor={borderColor}>Сотрудник</Table.ColumnHeader>
                <Table.ColumnHeader borderColor={borderColor}>Отдел</Table.ColumnHeader>
                <Table.ColumnHeader borderColor={borderColor}>Статус</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {places.map((place) => (
                <Table.Row key={place.id}>
                  <Table.Cell borderColor={borderColor} fontWeight="semibold">
                    {place.placeNumber}
                  </Table.Cell>
                  <Table.Cell borderColor={borderColor}>
                    {place.employeeName || '-'}
                  </Table.Cell>
                  <Table.Cell borderColor={borderColor}>
                    {place.department || '-'}
                  </Table.Cell>
                  <Table.Cell borderColor={borderColor}>
                    <Badge
                      colorScheme={getStatusColor(place.status)}
                      variant="subtle"
                      fontSize="xs"
                    >
                      {getStatusText(place.status)}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      </Card.Body>
    </Card.Root>
  );
};