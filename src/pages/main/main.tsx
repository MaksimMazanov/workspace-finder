import React, { useState } from 'react';
import {
  Container,
  VStack,
  Box,
  Heading,
  Text,
  Separator,
  SimpleGrid,
  Spinner,
} from '@chakra-ui/react';
import { SearchBar } from '../../components/SearchBar';
import { ResultCard } from '../../components/ResultCard';
import { TableView } from '../../components/TableView';
import { Workplace } from '../../api/workspaceApi';

export const MainPage = () => {
  const [searchResults, setSearchResults] = useState<Workplace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const bgColor = 'gray.50';

  const handleSearchResults = (results: Workplace[]) => {
    setSearchResults(results);
  };

  const handleSearchLoading = (loading: boolean) => {
    setIsSearching(loading);
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
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

          {/* Таблица блоков */}
          <TableView />
        </VStack>
      </Container>
    </Box>
  );
};
