import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';

export type ViewMode = 'table' | 'coworking' | 'stats' | 'map';

interface ViewSwitcherProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

interface ViewButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ViewButton: React.FC<ViewButtonProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <VStack
      spacing={1}
      cursor="pointer"
      onClick={onClick}
      color={isActive ? 'blue.600' : 'gray.500'}
      _hover={{ color: isActive ? 'blue.700' : 'gray.700' }}
      transition="color 0.2s"
      flex={1}
      py={2}
    >
      <Text fontSize="2xl">{icon}</Text>
      <Text fontSize="xs" fontWeight={isActive ? 'semibold' : 'normal'}>
        {label}
      </Text>
    </VStack>
  );
};

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ activeView, onViewChange }) => {
  const views: Array<{ id: ViewMode; icon: string; label: string }> = [
    { id: 'table', icon: '📋', label: 'Таблица' },
    { id: 'coworking', icon: '🏢', label: 'Коворкинги' },
    { id: 'stats', icon: '📊', label: 'Статистика' },
    { id: 'map', icon: '🗺️', label: 'Карта' },
  ];

  return (
    <Box
      position={{ base: 'sticky', md: 'static' }}
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      shadow="md"
      zIndex={10}
    >
      <HStack spacing={0} justify="space-around" maxW="container.xl" mx="auto">
        {views.map((view) => (
          <ViewButton
            key={view.id}
            icon={view.icon}
            label={view.label}
            isActive={activeView === view.id}
            onClick={() => onViewChange(view.id)}
          />
        ))}
      </HStack>
    </Box>
  );
};
