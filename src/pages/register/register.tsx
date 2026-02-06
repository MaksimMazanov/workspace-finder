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
  Field
} from '@chakra-ui/react';
import { URLs } from '../../__data__/urls';
import {
  isValidEmail,
  isValidUsername,
  isValidPassword,
  passwordsMatch,
  sanitizeInput,
  getEmailError,
  getUsernameError,
  getPasswordError,
  getConfirmPasswordError
} from '../../utils/validation';

const toaster = createToaster({ placement: 'top' });

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    const emailError = getEmailError(email);
    if (emailError) newErrors.email = emailError;

    const usernameError = getUsernameError(username);
    if (usernameError) newErrors.username = usernameError;

    const passwordError = getPasswordError(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = getConfirmPasswordError(password, confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedUsername = sanitizeInput(username);
      const sanitizedPassword = sanitizeInput(password);

      const response = await fetch(`${URLs.apiBase}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: sanitizedEmail,
          username: sanitizedUsername,
          password: sanitizedPassword
        })
      });

      const data = await response.json();

      // Check if response indicates success and has token
      if (data.success === false) {
        // API returned explicit error
        toaster.create({
          description: data.error || 'Не удалось зарегистрироваться',
          type: 'error'
        });
      } else if (data.token) {
        // Save token to localStorage
        localStorage.setItem('accessToken', data.token);

        toaster.create({
          description: 'Регистрация успешна! Добро пожаловать!',
          type: 'success'
        });

        // Redirect to main page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // No token received but also no explicit error
        toaster.create({
          description: 'Не удалось зарегистрироваться',
          type: 'error'
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      toaster.create({
        description: errorMessage.includes('Failed to fetch')
          ? 'Не удалось подключиться к серверу'
          : errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <Center minH="100vh" bg="gray.50">
      <Card.Root maxW="md" w="full" shadow="lg">
        <Card.Body>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" color="blue.600" mb={2}>
                Регистрация
              </Heading>
              <Text color="gray.600">
                Создайте новый аккаунт
              </Text>
            </Box>

            <VStack spacing={4} align="stretch">
              {/* Email */}
              <Field.Root invalid={!!errors.email}>
                <Text fontWeight="medium" mb={2}>
                  Email
                </Text>
                <Input
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  type="email"
                />
                {errors.email && (
                  <Field.ErrorText>{errors.email}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Username */}
              <Field.Root invalid={!!errors.username}>
                <Text fontWeight="medium" mb={2}>
                  Логин
                </Text>
                <Input
                  placeholder="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors({ ...errors, username: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  size="lg"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  3-20 символов, буквы, цифры, подчеркивание
                </Text>
                {errors.username && (
                  <Field.ErrorText>{errors.username}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Password */}
              <Field.Root invalid={!!errors.password}>
                <Text fontWeight="medium" mb={2}>
                  Пароль
                </Text>
                <Input
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  type="password"
                />
                {errors.password && (
                  <Field.ErrorText>{errors.password}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Confirm Password */}
              <Field.Root invalid={!!errors.confirmPassword}>
                <Text fontWeight="medium" mb={2}>
                  Подтвердите пароль
                </Text>
                <Input
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  onKeyPress={handleKeyPress}
                  size="lg"
                  type="password"
                />
                {errors.confirmPassword && (
                  <Field.ErrorText>{errors.confirmPassword}</Field.ErrorText>
                )}
              </Field.Root>

              {/* Register Button */}
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleRegister}
                w="full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </VStack>

            {/* Link to Login */}
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.600">
                Уже есть аккаунт?{' '}
                <Text
                  as="button"
                  color="blue.600"
                  fontWeight="medium"
                  onClick={() => navigate('/login')}
                  _hover={{ textDecoration: 'underline' }}
                >
                  Войти
                </Text>
              </Text>
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
