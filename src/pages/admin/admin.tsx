import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Button,
  createToaster,
  Center,
  Card,
  Text,
  HStack,
  Container
} from '@chakra-ui/react';
import { URLs } from '../../__data__/urls';

const toaster = createToaster({ placement: 'top' });

export const AdminPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${URLs.apiBase}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });

      toaster.create({
        description: 'Вы вышли из админ-панели',
        type: 'success'
      });

      setTimeout(() => {
        navigate('/workspace-finder');
      }, 500);
    } catch (error) {
      console.error('Logout error:', error);
      toaster.create({
        description: 'Ошибка при выходе',
        type: 'error'
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="800px">
        <Card.Root>
          <Card.Header>
            <HStack justify="space-between" width="100%">
              <Heading size="lg">Админ-панель</Heading>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={handleLogout}
                isLoading={isLoading}
              >
                Выход
              </Button>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={6} align="start" width="100%">
              <Box>
                <Heading size="md" mb={2}>
                  Управление данными
                </Heading>
                <Text color="gray.600" mb={4}>
                  Загрузите файл XLS с информацией о рабочих местах
                </Text>
                <Button colorScheme="green" isDisabled>
                  Загрузить XLS (скоро)
                </Button>
              </Box>

              <Box>
                <Heading size="md" mb={2}>
                  Журнал импортов
                </Heading>
                <Text color="gray.600" mb={4}>
                  История всех загрузок и импортов данных
                </Text>
                <Button isDisabled>
                  Просмотр журнала (скоро)
                </Button>
              </Box>

              <Box>
                <Heading size="md" mb={2}>
                  Логи доступа
                </Heading>
                <Text color="gray.600" mb={4}>
                  Журнал входов и действий администраторов
                </Text>
                <Button isDisabled>
                  Просмотр логов (скоро)
                </Button>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </Box>
  );
};
