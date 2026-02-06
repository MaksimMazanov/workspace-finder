# Error Handling Documentation

## Overview

This document describes the comprehensive error handling system implemented in WorkspaceFinder application. The system provides consistent error responses from the API and proper error presentation to users through the UI.

## API Error Response Format

All API endpoints follow a consistent response format:

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE", // Optional
  "details": { /* additional context */ } // Optional
}
```

## Error Handling Utilities

### Location: `src/utils/errorHandler.ts`

This module provides the following utilities:

#### `safeFetch<T>(url, options?): Promise<ApiResponse<T>>`
- Wraps standard `fetch` with comprehensive error handling
- Handles network errors, JSON parsing errors, and HTTP errors
- Returns consistent error response format
- Does not throw exceptions

#### `handleApiResponse<T>(response: Response): Promise<ApiResponse<T>>`
- Processes HTTP Response and returns typed ApiResponse
- Handles non-JSON responses gracefully
- Checks both HTTP status and response `success` field

#### `getErrorMessage(error: unknown): string`
- Converts any error to user-friendly message
- Handles API errors, network errors, and generic errors
- Returns Russian-language error messages

#### `isApiError(response: unknown): boolean`
- Type guard to check if response is an error

#### `isApiSuccess<T>(response: unknown): boolean`
- Type guard to check if response is successful

## API Endpoints Error Handling

### Authentication

#### POST `/api/auth/login`
**Error Cases:**
- Missing email or password: `"Email and password are required"`
- Invalid email format: `"Неверный формат email"`
- Short password (<6 chars): `"Пароль должен содержать минимум 6 символов"`
- Wrong credentials: `"Неверный email или пароль"`
- Server error: HTTP 500

**Success Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

#### POST `/api/auth/register`
**Error Cases:**
- Missing email or password: `"Email and password are required"`
- Invalid email format: `"Неверный формат email"`
- Short password: `"Пароль должен содержать минимум 6 символов"`
- Email already registered: `"Этот email уже зарегистрирован"`
- Server error: HTTP 500

**Success Response:**
```json
{
  "success": true,
  "token": "JWT_TOKEN"
}
```

#### GET `/api/auth/me`
**Error Cases:**
- No token provided: HTTP 401
- Invalid or expired token: HTTP 401
- User not found: HTTP 401
- Server error: HTTP 500

**Success Response:**
```json
{
  "success": true,
  "id": "user_id",
  "email": "user@example.com"
}
```

### Workplaces

#### GET `/api/search?type={name|place}&q={query}`
**Error Cases:**
- Missing parameters: `"Missing query parameters: type and q are required"`
- Invalid type: `"Invalid type parameter. Use 'name' or 'place'"`
- Server error: HTTP 500

**Success Response:**
```json
{
  "success": true,
  "count": 5,
  "results": [ /* workplace objects */ ]
}
```

#### GET `/api/workplaces?view=table`
**Error Cases:**
- Missing view parameter: `"Only table view is supported"`
- Invalid view value: `"Only table view is supported"`
- Server error: HTTP 500

**Success Response:**
```json
{
  "success": true,
  "blocks": [ /* block objects */ ]
}
```

#### GET `/api/coworkings`
**Success Response:**
```json
{
  "success": true,
  "total": 10,
  "totalOccupied": 7,
  "coworkings": [ /* coworking objects */ ]
}
```

#### GET `/api/zones`
**Success Response:**
```json
{
  "success": true,
  "zones": [ /* zone objects */ ]
}
```

#### GET `/api/stats`
**Success Response:**
```json
{
  "success": true,
  "totalPlaces": 100,
  "occupiedPlaces": 75,
  "freePlaces": 25,
  "coworkingPlaces": 10,
  "occupiedCoworking": 7,
  "blockStats": { /* stats */ },
  "typeStats": { /* stats */ }
}
```

## Frontend Error Handling

### API Functions (`src/api/workspaceApi.ts`)

All API functions return the response format directly without throwing exceptions:

```typescript
export async function searchWorkplaces(
  type: 'name' | 'place',
  query: string
): Promise<SearchResponse> {
  try {
    const result = await safeFetch<SearchResponse>(url);
    if (!result.success) {
      return {
        success: false,
        count: 0,
        results: [],
        error: result.error
      };
    }
    return result.data || { success: true, count: 0, results: [] };
  } catch (error) {
    return {
      success: false,
      count: 0,
      results: [],
      error: getErrorMessage(error)
    };
  }
}
```

### Components Error Display

#### SearchBar (`src/components/SearchBar.tsx`)
- Checks `response.success`
- Displays error toast with `response.error || 'Неизвестная ошибка'`
- Shows specific error messages from API

#### TableView (`src/components/TableView.tsx`)
- Uses `useLocalStorageCache` hook
- Displays error Alert when data fails to load
- Shows cached data if available even when error occurs

#### CoworkingView (`src/components/CoworkingView.tsx`)
- Displays error Alert with error message
- Shows "Нет данных" message when no coworkings available

#### StatsView (`src/components/StatsView.tsx`)
- Displays error Alert when stats fail to load
- Shows safe defaults while loading

#### MapView (`src/components/MapView.tsx`)
- Displays error Alert with zone loading failures
- Handles empty zone list gracefully

### Login/Register Pages

**LoginPage (`src/pages/login/login.tsx`):**
- Validates empty inputs before API call
- Displays specific error message from API
- Shows generic "server connection" error for network failures

**RegisterPage (`src/pages/register/register.tsx`):**
- Validates form before API call
- Displays validation errors (Field.ErrorText)
- Shows API error message in toast
- Handles network errors gracefully

### Admin Panel (`src/pages/admin/admin.tsx`)

**File Upload Handling:**
- Validates file selection
- Displays upload progress
- Shows success toast with insert/update counts
- Shows error toast with error message
- Handles network errors

**Import History:**
- Displays error toast if history fails to load
- Shows error message from API

## HTTP Status Code Mapping

| Status | Message |
|--------|---------|
| 400 | Неверные данные запроса |
| 401 | Ошибка аутентификации. Пожалуйста, войдите снова. |
| 403 | У вас нет прав доступа к этому ресурсу |
| 404 | Ресурс не найден |
| 429 | Слишком много запросов. Попробуйте позже. |
| 500 | Ошибка сервера. Попробуйте позже. |
| 503 | Сервер временно недоступен. Попробуйте позже. |

## Network Error Handling

The error handler detects and provides specific messages for:
- `Failed to fetch` → "Не удалось подключиться к серверу. Проверьте соединение."
- `Network` errors → "Ошибка сети. Проверьте интернет-соединение."
- Other errors → Shows specific error message or "Произошла неизвестная ошибка"

## Caching Strategy

The application uses localStorage caching with error resilience:
- Cache expires after 5 minutes
- If data fails to load but cache exists, displays cached data
- If both fail, displays error Alert
- Cache includes timestamp for TTL validation

## Error Response Examples

### Login Error - Wrong Password
```bash
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"wrong"}'

# Response
{
  "success": false,
  "error": "Пароль должен содержать минимум 6 символов"
}
```

### Login Error - Invalid Email
```bash
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalidemail","password":"password123"}'

# Response
{
  "success": false,
  "error": "Неверный email или пароль"
}
```

### Search Error - Missing Parameters
```bash
curl http://localhost:8099/api/search

# Response
{
  "success": false,
  "error": "Missing query parameters: type and q are required"
}
```

## Testing Error Scenarios

### Test Authentication Errors
```bash
# Test missing credentials
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# Test invalid email
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"password123"}'

# Test wrong credentials
curl -X POST http://localhost:8099/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@example.com","password":"wrongpassword"}'
```

### Test Validation Errors
```bash
# Test duplicate registration
curl -X POST http://localhost:8099/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Test short password
curl -X POST http://localhost:8099/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"short"}'
```

## Best Practices

1. **Always check `success` field first** - Don't rely on HTTP status codes alone
2. **Use appropriate error messages** - Users see error toast messages, keep them brief and actionable
3. **Don't throw exceptions in API functions** - Return error responses instead
4. **Provide context in error toasts** - Show what went wrong and optionally what to do
5. **Cache data when possible** - Show stale data is better than no data during network issues
6. **Validate input before API calls** - Reduce unnecessary API requests
7. **Handle both success and error cases** - Always check response.success
8. **Log errors for debugging** - Console logs help with troubleshooting

## Future Improvements

- [ ] Add error tracking/logging service
- [ ] Implement retry logic for failed requests
- [ ] Add error recovery suggestions
- [ ] Implement error boundary React component
- [ ] Add detailed error logging with timestamps
- [ ] Create error analytics dashboard
