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
    <Box minH="100vh" bg={bgColor} pb={{ base: '70px', md: 0 }}>
      {/* Header with logout button */}
      <Box bg="white" boxShadow="sm" py={4}>
        <Container maxW="container.xl">
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="blue.600">
              WorkspaceFinder
            </Heading>
            <Button
              colorScheme="red"
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Выход
            </Button>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box display={{ base: 'none', md: 'block' }}>
            <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
          </Box>
          {/* Заголовок */}
          <Box textAlign="center">
            <Heading
              size="xl"
              color="blue.600"
              mb={2}
            >
              WorkspaceFinder
            </Heading>
            <Text fontSize="lg" color="gray.600">
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
          {activeView === 'stats' && <Text>StatsView - TODO TASK-07</Text>}
          {activeView === 'map' && <Text>MapView - TODO TASK-08</Text>}
        </VStack>
      </Container>

      {/* ViewSwitcher внизу */}
      <Box display={{ base: 'block', md: 'none' }}>
        <ViewSwitcher activeView={activeView} onViewChange={handleViewChange} />
      </Box>
    </Box>
  );
};
