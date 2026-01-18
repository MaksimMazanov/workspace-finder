import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  createToaster,
  Center,
  Card
} from '@chakra-ui/react';
import { URLs } from '../../__data__/urls';
import { loginUser } from '../../api/workspaceApi';

const toaster = createToaster({ placement: 'top' });

export const LoginPage = () => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name.trim()) {
      toaster.create({
        title: 'Ошибка',
        description: 'Введите ваше имя',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(name.trim());

      if (response.success) {
        toaster.create({
          title: 'Вход выполнен',
          description: `Добро пожаловать, ${response.user?.name}!`,
          type: 'success'
        });

        navigate(URLs.baseUrl);
      } else {
        toaster.create({
          title: 'Ошибка входа',
          description: response.error || 'Не удалось войти',
          type: 'error'
        });
      }
    } catch (error) {
      toaster.create({
        title: 'Ошибка',
        description: 'Не удалось подключиться к серверу',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Card.Root maxW="md" w="full" shadow="lg">
        <Card.Body>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" color="blue.600" mb={2}>
                Добро пожаловать
              </Heading>
              <Text color="gray.600">
                Введите ваше имя для доступа к приложению
              </Text>
            </Box>

            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Имя
                </Text>
                <Input
                  placeholder="Введите ваше имя..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="lg"
                />
              </Box>

              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleLogin}
                w="full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Войти'}
              </Button>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};