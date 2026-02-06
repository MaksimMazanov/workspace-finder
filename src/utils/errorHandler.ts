/**
 * Error handling utilities for API responses
 */

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T> {
  success: true;
  data?: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/**
 * Check if response contains an error
 */
export function isApiError(response: unknown): response is ApiError {
  return (
    response !== null &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === false
  );
}

/**
 * Check if response is successful
 */
export function isApiSuccess<T>(response: unknown): response is ApiSuccess<T> {
  return (
    response !== null &&
    typeof response === 'object' &&
    'success' in response &&
    response.success === true
  );
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  // API error response
  if (isApiError(error)) {
    return error.error || 'Произошла ошибка';
  }

  // Network error or unknown error object
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('Failed to fetch')) {
      return 'Не удалось подключиться к серверу. Проверьте соединение.';
    }
    if (error.message.includes('Network')) {
      return 'Ошибка сети. Проверьте интернет-соединение.';
    }
    return error.message || 'Произошла неизвестная ошибка';
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  return 'Произошла неизвестная ошибка';
}

/**
 * Handle fetch response with proper error checking
 */
export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  
  let data: unknown;
  
  try {
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { success: false, error: text || 'Invalid response format' };
    }
  } catch (parseError) {
    return {
      success: false,
      error: 'Ошибка при обработке ответа сервера',
      code: 'PARSE_ERROR'
    };
  }

  // Check for HTTP errors
  if (!response.ok) {
    // If response has error field, use it
    if (isApiError(data)) {
      return data;
    }

    // Otherwise create error response
    return {
      success: false,
      error: getHttpStatusError(response.status),
      code: `HTTP_${response.status}`,
      details: { status: response.status }
    };
  }

  // Check if API returned success: false
  if (isApiError(data)) {
    return data;
  }

  // Assume success
  return {
    success: true,
    data: data as T
  };
}

/**
 * Get error message for HTTP status code
 */
function getHttpStatusError(status: number): string {
  switch (status) {
    case 400:
      return 'Неверные данные запроса';
    case 401:
      return 'Ошибка аутентификации. Пожалуйста, войдите снова.';
    case 403:
      return 'У вас нет прав доступа к этому ресурсу';
    case 404:
      return 'Ресурс не найден';
    case 429:
      return 'Слишком много запросов. Попробуйте позже.';
    case 500:
      return 'Ошибка сервера. Попробуйте позже.';
    case 503:
      return 'Сервер временно недоступен. Попробуйте позже.';
    default:
      return `Ошибка сервера (${status})`;
  }
}

/**
 * Safe fetch wrapper with error handling
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse<T>(response);
  } catch (error) {
    const message = getErrorMessage(error);
    return {
      success: false,
      error: message,
      code: error instanceof Error ? 'NETWORK_ERROR' : 'UNKNOWN_ERROR'
    };
  }
}

/**
 * Validate required fields in response
 */
export function validateResponseFields<T extends Record<string, unknown>>(
  data: unknown,
  requiredFields: (keyof T)[]
): data is T {
  if (!data || typeof data !== 'object') {
    return false;
  }

  return requiredFields.every(field => field in data);
}
