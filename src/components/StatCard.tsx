import React from 'react';
import { Card, Heading, Text, VStack } from '@chakra-ui/react';

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
  colorScheme?: string;
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU');

const StatCardComponent: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  colorScheme = 'blue',
}) => {
  return (
    <Card.Root
      size="sm"
      bg="white"
      shadow="md"
      borderRadius="lg"
      border="1px"
      borderColor="gray.200"
    >
      <Card.Body>
        <VStack spacing={2}>
          <Text fontSize="3xl">{icon}</Text>
          <Heading size="2xl" color={`${colorScheme}.600`}>
            {formatNumber(value)}
          </Heading>
          <Text fontSize="sm" color="gray.600" fontWeight="semibold">
            {label}
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export const StatCard = React.memo(StatCardComponent);

StatCard.displayName = 'StatCard';
