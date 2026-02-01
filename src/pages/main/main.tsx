import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Separator,
  SimpleGrid,
  Spinner,
  Button,
  HStack,
} from '@chakra-ui/react';
import { SearchBar } from '../../components/SearchBar';
import { ResultCard } from '../../components/ResultCard';
import { TableView } from '../../components/TableView';
import { CoworkingView } from '../../components/CoworkingView';
import { MapView } from '../../components/MapView';
import { StatsView } from '../../components/StatsView';
import { ViewSwitcher, ViewMode } from '../../components/ViewSwitcher';
import { Workplace } from '../../api/workspaceApi';

export const MainPage = () => {
  const [searchResults, setSearchResults] = useState<Workplace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('table');
  const navigate = useNavigate();
  const bgColor = 'gray.50';

  const handleSearchResults = (results: Workplace[]) => {
    setSearchResults(results);
  };

  const handleSearchLoading = (loading: boolean) => {
    setIsSearching(loading);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('accessToken');
    // Redirect to login
    navigate('/login');
  };

  const handleViewChange = (view: ViewMode) => {
    setActiveView(view);
  };

  return (
    <Box minH="100vh" bg={bgColor} pb={{ base: '70px', md: 0 }} position="relative">
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-br, #f2f7f5, #eef4f8, #f6f7fb)"
        _after={{
          content: '""',
          position: 'absolute',
          inset: 0,
          bgImage:
            'radial-gradient(circle at 15% 15%, rgba(24,156,88,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgba(36,107,194,0.12) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(24,156,88,0.10) 0%, transparent 50%)'
        }}
      />
      <Container maxW="6xl" py={8} position="relative">
        <VStack spacing={8} align="stretch">
          <Box display={{ base: 'none', md: 'block' }}>
            <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
          </Box>
          {/* Заголовок */}
          <Box position="relative">
            <Heading size="xl" color="gray.900" textAlign="center" mb={2}>
              Рабочее пространство
            </Heading>
            <Button
              colorScheme="green"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              position="absolute"
              right={0}
              top={0}
            >
              Выход
            </Button>
            <Text fontSize="md" color="gray.600">
              Найдите рабочее место по ФИО сотрудника или номеру места
            </Text>
          </Box>

          {/* Поиск */}
          <Box display="flex" justifyContent="center">
            <SearchBar
              onResults={handleSearchResults}
              onLoading={handleSearchLoading}
            />
          </Box>

          {/* Результаты поиска */}
          {searchResults.length > 0 && (
            <>
              <Separator />
              <Box>
                <Heading size="md" mb={4} color="blue.600">
                  Результаты поиска ({searchResults.length})
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  {searchResults.map((workplace) => (
                    <ResultCard
                      key={workplace.id}
                      workplace={workplace}
                    />
                  ))}
                </SimpleGrid>
              </Box>
            </>
          )}

          {/* Индикатор загрузки */}
          {isSearching && (
            <Box textAlign="center" py={4}>
              <Spinner size="lg" color="blue.500" />
              <Text mt={2} color="gray.600">
                Выполняется поиск...
              </Text>
            </Box>
          )}

          {/* Разделитель */}
          <Separator />

          {/* Отображение активного вида */}
          {activeView === 'table' && <TableView />}
          {activeView === 'coworking' && <CoworkingView />}
          {activeView === 'stats' && <StatsView />}
          {activeView === 'map' && <MapView />}
        </VStack>
      </Container>

      {/* ViewSwitcher внизу */}
      <Box display={{ base: 'block', md: 'none' }}>
        <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
      </Box>
    </Box>
  );
};
