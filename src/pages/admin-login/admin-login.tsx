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
  Card,
  Alert
} from '@chakra-ui/react';
import { URLs } from '../../__data__/urls';

const toaster = createToaster({ placement: 'top' });

export const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    if (!password.trim()) {
      toaster.create({
        description: 'Введите пароль',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${URLs.apiBase}/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          password: password.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        toaster.create({
          description: 'Добро пожаловать в админ-панель!',
          type: 'success'
        });

        // Navigate to admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        toaster.create({
          description: data.error || 'Неверный пароль',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toaster.create({
        description: 'Ошибка при входе',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Card.Root width="100%" maxW="400px" m={4}>
        <Card.Header pb={0}>
          <Heading size="lg" textAlign="center">
            Админ-панель
          </Heading>
        </Card.Header>
        <Card.Body>
          <VStack gap={6} width="100%">
            <Alert.Root status="info">
              <Alert.Indicator />
              <Box>
                <Alert.Title>Защищённый доступ</Alert.Title>
                <Alert.Description>
                  Введите пароль администратора для доступа
                </Alert.Description>
              </Box>
            </Alert.Root>

            <VStack gap={4} width="100%">
              <Box width="100%">
                <Text as="label" fontSize="sm" fontWeight="500" mb={2} display="block">
                  Пароль
                </Text>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAdminLogin();
                    }
                  }}
                  disabled={isLoading}
                />
              </Box>

              <Button
                width="100%"
                colorScheme="blue"
                onClick={handleAdminLogin}
                isLoading={isLoading}
                loadingText="Вход..."
              >
                Войти
              </Button>

              <Button
                width="100%"
                variant="outline"
                onClick={() => navigate('/')}
                disabled={isLoading}
              >
                Вернуться в приложение
              </Button>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
