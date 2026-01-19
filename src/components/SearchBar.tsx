import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  RadioGroup,
  chakra,
  createToaster,
} from '@chakra-ui/react';
import { searchWorkplaces, Workplace, SearchResponse } from '../api/workspaceApi';
import { useLocalStorageCache } from '../hooks/useLocalStorageCache';

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

interface SearchBarProps {
  onResults: (results: Workplace[]) => void;
  onLoading: (loading: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onResults, onLoading }) => {
  const [searchType, setSearchType] = useState<'name' | 'place'>('name');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchKey, setLastSearchKey] = useState<string | null>(null);
  const searchCacheRef = useRef<Map<string, { data: SearchResponse; timestamp: number }>>(new Map());

  // Create cache key for search results
  const getSearchCacheKey = (type: 'name' | 'place', q: string): string => {
    return `search:${type}:${q.trim()}`;
  };

  // Get search results from cache or fetch
  const getSearchResults = useCallback(async (type: 'name' | 'place', q: string): Promise<SearchResponse> => {
    const cacheKey = getSearchCacheKey(type, q);
    const cached = searchCacheRef.current.get(cacheKey);
    const now = Date.now();
    const TTL = 5 * 60 * 1000; // 5 minutes

    if (cached && now - cached.timestamp < TTL) {
      console.log(`Cache hit for search: ${cacheKey}`);
      return cached.data;
    }

    console.log(`Cache miss for search: ${cacheKey}`);
    const response = await searchWorkplaces(type, q);

    // Store in cache
    searchCacheRef.current.set(cacheKey, {
      data: response,
      timestamp: now,
    });

    // Clean up old entries to prevent memory leaks
    for (const [key, entry] of searchCacheRef.current.entries()) {
      if (now - entry.timestamp > TTL) {
        searchCacheRef.current.delete(key);
      }
    }

    return response;
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      toaster.create({
        title: 'Ошибка',
        description: 'Введите текст для поиска',
        type: 'error',
      });
      return;
    }

    setIsSearching(true);
    onLoading(true);
    const cacheKey = getSearchCacheKey(searchType, query);
    setLastSearchKey(cacheKey);

    try {
      const response = await getSearchResults(searchType, query.trim());

      if (response.success) {
        onResults(response.results);
        if (response.results.length === 0) {
          toaster.create({
            title: 'Результаты поиска',
            description: 'Ничего не найдено',
            type: 'info',
          });
        }
      } else {
        toaster.create({
          title: 'Ошибка поиска',
          description: response.error || 'Неизвестная ошибка',
          type: 'error',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toaster.create({
        title: 'Ошибка',
        description: 'Не удалось выполнить поиск. Проверьте подключение.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box bg="white" p={6} borderRadius="lg" shadow="md" w="100%" maxW="600px">
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="semibold" textAlign="center">
          Поиск рабочего места
        </Text>

        {/* Переключатель типа поиска */}
        <RadioGroup.Root
          value={searchType}
          onValueChange={(details) => setSearchType(details.value as 'name' | 'place')}
        >
          <HStack spacing={6} justify="center" flexWrap="wrap">
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2} 
              cursor="pointer"
              onClick={() => setSearchType('name')}
            >
              <RadioGroup.Item value="name">
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>По ФИО сотрудника</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Box>
            <Box 
              display="flex" 
              alignItems="center" 
              gap={2} 
              cursor="pointer"
              onClick={() => setSearchType('place')}
            >
              <RadioGroup.Item value="place">
                <RadioGroup.ItemControl />
                <RadioGroup.ItemText>По номеру места</RadioGroup.ItemText>
              </RadioGroup.Item>
            </Box>
          </HStack>
        </RadioGroup.Root>

        {/* Поле ввода и кнопка поиска */}
        <HStack spacing={3}>
          <Input
            placeholder={
              searchType === 'name'
                ? 'Введите ФИО сотрудника...'
                : 'Введите номер места (например, 5.В.01.056)...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            size="lg"
            bg="gray.50"
            _focus={{ bg: 'white', borderColor: 'blue.500' }}
          />
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleSearch}
            isLoading={isSearching}
            loadingText="Поиск..."
            minW="120px"
          >
            Найти
          </Button>
        </HStack>

        {/* Примеры */}
        <Text fontSize="sm" color="gray.600" textAlign="center">
          {searchType === 'name'
            ? 'Пример: Иванов Иван или Петров'
            : 'Пример: 5.В.01.056'
          }
        </Text>
      </VStack>
    </Box>
  );
};