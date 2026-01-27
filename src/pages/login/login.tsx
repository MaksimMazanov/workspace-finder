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
import { loginUser } from '../../api/workspaceApi';

const toaster = createToaster({ placement: 'top' });

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toaster.create({
        description: 'Введите email и пароль',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser(email.trim(), password.trim());
      console.log('Login response:', response);

      if (response.success) {
        toaster.create({
          description: `Добро пожаловать, ${email.trim()}!`,
          type: 'success'
        });

        console.log('Navigating to main page...');
        // Use a small delay to ensure toast is visible before navigation
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        toaster.create({
          description: response.error || 'Не удалось войти',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toaster.create({
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
                Введите ваш email и пароль для входа
              </Text>
              <Text fontSize="xs" color="gray.500" mt={4}>
                Тестовые учетные данные:
                <br />
                user@example.com / password123
              </Text>
            </Box>

            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Email
                </Text>
                <Input
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  type="email"
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

          {/* Link to Register */}
          <Box textAlign="center" mt={6}>
            <Text fontSize="sm" color="gray.600">
              Нет аккаунта?{' '}
              <Text
                as="button"
                color="blue.600"
                fontWeight="medium"
                onClick={() => navigate('/register')}
                _hover={{ textDecoration: 'underline' }}
              >
                Зарегистрироваться
              </Text>
            </Text>
          </Box>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
