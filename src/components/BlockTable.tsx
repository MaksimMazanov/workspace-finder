import React from 'react';
import {
  Box,
  Table,
  Card,
  Heading,
  Text,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { Workplace } from '../api/workspaceApi';
import {
  getEmployeeLabelStyle,
  normalizeDepartmentLabel,
  normalizeEmployeeLabel
} from '../utils/formatters';

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

  const sortedPlaces = [...places].sort((a, b) =>
    a.placeNumber.localeCompare(b.placeNumber, 'ru', { numeric: true })
  );

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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {sortedPlaces.map((place) => (
                <Table.Row key={place.id}>
                  <Table.Cell borderColor={borderColor} fontWeight="semibold">
                    {place.placeNumber}
                  </Table.Cell>
                  <Table.Cell borderColor={borderColor}>
                    {place.employeeName ? (
                      <Text fontSize="sm" {...getEmployeeLabelStyle(place.employeeName)}>
                        {normalizeEmployeeLabel(place.employeeName)}
                      </Text>
                    ) : (
                      '-'
                    )}
                  </Table.Cell>
                  <Table.Cell borderColor={borderColor}>
                    {place.department ? normalizeDepartmentLabel(place.department) : '-'}
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
