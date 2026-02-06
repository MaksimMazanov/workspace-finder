import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Input,
  Button,
  Text,
  createToaster,
  Center,
  Card,
  HStack,
  Container,
} from '@chakra-ui/react';
import { loginUser } from '../../api/workspaceApi';

const toaster = createToaster({ placement: 'top' });

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Введите email и пароль');
      toaster.create({
        description: 'Введите email и пароль',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(email.trim(), password.trim());

      if (response.success) {
        setError(null);
        toaster.create({
          description: 'Добро пожаловать!',
          type: 'success'
        });

        // Use a small delay to ensure toast is visible before navigation
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        // Show specific error message from API
        const errorMessage = response.error || 'Неверный email или пароль';
        setError(errorMessage);
        toaster.create({
          description: errorMessage,
          type: 'error'
        });
      }
    } catch {
      setError('Ошибка при входе. Проверьте соединение.');
      toaster.create({
        description: 'Ошибка при входе. Проверьте соединение.',
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
    <Center minH="100vh" bg="gray.50" position="relative">
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
      <Container maxW="md" position="relative" py={{ base: 8, lg: 16 }} px={4}>
        <Card.Root bg="white" shadow="lg" borderRadius="2xl" w="full">
          <Card.Body p={{ base: 6, md: 8 }}>
            <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
                    Вход в рабочее пространство
                  </Text>
                </Box>

                

                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Логин
                    </Text>
                    <Input
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyPress={handleKeyPress}
                      size="lg"
                      type="email"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </Box>

                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Пароль
                    </Text>
                    <Input
                      placeholder="Введите пароль..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      size="lg"
                      type="password"
                      bg="gray.50"
                      borderColor="gray.200"
                    />
                  </Box>

                  <Text fontSize="xs" color="gray.500">
                    Тестовые данные: user@example.com / password123
                  </Text>

                  <Button
                    bg="green.600"
                    _hover={{ bg: 'green.700' }}
                    color="white"
                    size="lg"
                    onClick={handleLogin}
                    w="full"
                    loading={isLoading}
                    disabled={isLoading}
                    borderRadius="xl"
                  >
                    {isLoading ? 'Загрузка...' : 'Войти'}
                  </Button>
                  {error && (
                    <Text fontSize="sm" color="red.600">
                      {error}
                    </Text>
                  )}
                </VStack>

                <HStack justify="space-between" fontSize="sm" color="gray.600">
                  <Text
                    as="button"
                    onClick={() => navigate('/register')}
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline', color: 'green.700' }}
                  >
                    Нет аккаунта?
                  </Text>
                  <Text
                    as="button"
                    onClick={() => navigate('/admin/login')}
                    fontWeight="medium"
                    _hover={{ textDecoration: 'underline', color: 'green.700' }}
                  >
                    Войти администратором
                  </Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
      </Container>
    </Center>
  );
};
