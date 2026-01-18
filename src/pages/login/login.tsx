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

const toaster = createToaster({ placement: 'top' });

export const LoginPage = () => {
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!name.trim()) {
      toaster.create({
        title: 'Ошибка',
        description: 'Введите ваше имя',
        type: 'error'
      });
      return;
    }

    // Сохранение в localStorage
    localStorage.setItem('workspace-finder:user', JSON.stringify({
      name: name.trim(),
      enteredAt: new Date().toISOString()
    }));

    toaster.create({
      title: 'Вход выполнен',
      description: `Добро пожаловать, ${name.trim()}!`,
      type: 'success'
    });

    navigate(URLs.baseUrl);
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
              >
                Войти
              </Button>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};