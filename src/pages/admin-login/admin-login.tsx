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
import { safeFetch } from '../../utils/errorHandler';

const toaster = createToaster({ placement: 'top' });

export const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAdminLogin = async () => {
    console.log('handleAdminLogin called with password:', password.length > 0 ? '***' : 'empty');
    if (!password.trim()) {
      console.log('Password is empty, showing error toast');
      setError('Введите пароль');
      toaster.create({
        description: 'Введите пароль',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const url = `${URLs.apiBase}/auth/admin/login`;
      console.log('Sending admin login request to:', url);
      const result = await safeFetch<{ success?: boolean; error?: string }>(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          password: password.trim()
        })
      });
      console.log('Admin login result:', result);

      const data = result.success ? result.data : undefined;
      const hasApiError = !!data && typeof data === 'object' && 'error' in data && !!(data as { error?: string }).error;

      if (result.success && data?.success !== false && !hasApiError) {
        console.log('Admin login successful');
        setError(null);
        toaster.create({
          description: 'Добро пожаловать в админ-панель!',
          type: 'success'
        });

        // Navigate to admin dashboard
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        console.log('Admin login failed');
        // Show API error or HTTP status error
        const apiError =
          (hasApiError ? (data as { error?: string }).error : undefined) ||
          ('error' in result ? result.error : undefined);
        const apiCode = 'code' in result ? result.code : undefined;
        const errorMessage =
          apiError ||
          (apiCode === 'HTTP_401' ? 'Неверный пароль' : 'Ошибка сервера. Попробуйте позже.');
        console.log('Error message:', errorMessage);
        setError(errorMessage);
        toaster.create({
          description: errorMessage,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Ошибка при входе. Проверьте соединение.');
      toaster.create({
        description: 'Ошибка при входе. Проверьте соединение.',
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
              {error && (
                <Text fontSize="sm" color="red.600">
                  {error}
                </Text>
              )}

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
