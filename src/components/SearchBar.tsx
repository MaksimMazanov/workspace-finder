import React, { useState, useCallback, useEffect } from 'react';
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

const toaster = createToaster({
  placement: 'top',
  duration: 3000,
});

const CACHE_PREFIX = 'workspace-finder:cache:';
const SEARCH_TTL = 5 * 60 * 1000; // 5 minutes

interface SearchBarProps {
  onResults: (results: Workplace[]) => void;
  onLoading: (loading: boolean) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onResults, onLoading }) => {
  const [searchType, setSearchType] = useState<'name' | 'place'>('name');
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Create cache key for search results
  const getSearchCacheKey = (type: 'name' | 'place', q: string): string => (
    `search:${type}:${q.trim()}`
  );

  const cleanupExpiredSearchCache = useCallback((): void => {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${CACHE_PREFIX}search:`)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry = JSON.parse(cached) as { data: SearchResponse; timestamp: number };
              if (now - entry.timestamp > SEARCH_TTL) {
                keysToRemove.push(key);
              }
            }
          } catch (err) {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`Cleaned up expired cache: ${key}`);
      });
    } catch (err) {
      console.error('Error during search cache cleanup', err);
    }
  }, []);

  const getCachedSearchResults = useCallback((cacheKey: string): SearchResponse | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) {
        console.log(`Cache miss for key: ${cacheKey}`);
        return null;
      }

      const entry = JSON.parse(cached) as { data: SearchResponse; timestamp: number };
      const now = Date.now();
      const age = now - entry.timestamp;

      if (age > SEARCH_TTL) {
        console.log(`Cache expired for key: ${cacheKey} (age: ${age}ms, ttl: ${SEARCH_TTL}ms)`);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log(`Cache hit for key: ${cacheKey} (age: ${age}ms)`);
      return entry.data;
    } catch (err) {
      console.error(`Error reading search cache for key: ${cacheKey}`, err);
      return null;
    }
  }, []);

  const setCachedSearchResults = useCallback((cacheKey: string, value: SearchResponse): void => {
    try {
      const serialized = JSON.stringify({ data: value, timestamp: Date.now() });
      localStorage.setItem(cacheKey, serialized);
    } catch (err) {
      console.error(`Error saving search cache for key: ${cacheKey}`, err);
    }
  }, []);

  useEffect(() => {
    cleanupExpiredSearchCache();
  }, [cleanupExpiredSearchCache]);

  const handleSearch = async () => {
    if (!query.trim()) {
      toaster.create({
        title: 'Ошибка',
        description: 'Введите текст для поиска',
        type: 'error',
      });
      return;
    }

    const trimmedQuery = query.trim();
    const cacheKey = `${CACHE_PREFIX}${getSearchCacheKey(searchType, trimmedQuery)}`;
    cleanupExpiredSearchCache();
    const cachedResponse = getCachedSearchResults(cacheKey);

    if (cachedResponse) {
      if (cachedResponse.success) {
        onResults(cachedResponse.results);
        if (cachedResponse.results.length === 0) {
          toaster.create({
            title: 'Результаты поиска',
            description: 'Ничего не найдено',
            type: 'info',
          });
        }
      } else {
        toaster.create({
          title: 'Ошибка поиска',
          description: cachedResponse.error || 'Неизвестная ошибка',
          type: 'error',
          duration: 5000,
        });
      }
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      const response = await searchWorkplaces(searchType, trimmedQuery);

      if (response.success) {
        onResults(response.results);
        setCachedSearchResults(cacheKey, response);
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
