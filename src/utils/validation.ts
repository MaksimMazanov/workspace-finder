// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Username validation (3-20 chars, letters, numbers, underscore)
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Password validation (minimum 6 characters)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Check if passwords match
export const passwordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .slice(0, 255); // Limit length
};

// Get validation error message
export const getEmailError = (email: string): string | null => {
  if (!email) return 'Email обязателен';
  if (!isValidEmail(email)) return 'Некорректный формат email';
  return null;
};

export const getUsernameError = (username: string): string | null => {
  if (!username) return 'Логин обязателен';
  if (username.length < 3) return 'Логин должен быть минимум 3 символа';
  if (username.length > 20) return 'Логин не должен превышать 20 символов';
  if (!isValidUsername(username)) return 'Логин может содержать только буквы, цифры и подчеркивание';
  return null;
};

export const getPasswordError = (password: string): string | null => {
  if (!password) return 'Пароль обязателен';
  if (!isValidPassword(password)) return 'Пароль должен быть минимум 6 символов';
  return null;
};

export const getConfirmPasswordError = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Подтверждение пароля обязательно';
  if (!passwordsMatch(password, confirmPassword)) return 'Пароли не совпадают';
  return null;
};
