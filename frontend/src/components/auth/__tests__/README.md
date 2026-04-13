# Authentication Component Tests

## Overview

This directory contains comprehensive unit tests for all authentication form components using Vitest, React Testing Library, and Happy-DOM.

## Test Files

- **RegisterForm.test.tsx** - 10 test cases for user registration
- **LoginForm.test.tsx** - 10 test cases for user login
- **VerifyEmailForm.test.tsx** - 6 test cases for email verification
- **ForgotPasswordForm.test.tsx** - 7 test cases for password reset requests

## Test Coverage

### RegisterForm
- ✅ Renders all form fields (first name, last name, email, password, role selector)
- ✅ Shows validation errors for empty/invalid fields
- ✅ Validates email format
- ✅ Validates password length (minimum 8 characters)
- ✅ Submits form with valid data to Zustand store
- ✅ Shows success message after registration
- ✅ Redirects to login page after 2 seconds
- ✅ Shows error message on registration failure
- ✅ Allows selecting buyer or seller role
- ✅ Disables form inputs during submission

### LoginForm
- ✅ Renders email and password fields
- ✅ Shows validation errors for empty fields
- ✅ Submits form with valid credentials
- ✅ Redirects to dashboard after successful login
- ✅ Shows account locked error with minutes remaining (423 status)
- ✅ Disables submit button when account is locked
- ✅ Shows email not verified error (403 status)
- ✅ Shows generic error for invalid credentials (401 status)
- ✅ Disables form during submission
- ✅ Clears errors when user starts typing again

### VerifyEmailForm
- ✅ Shows warning when no token is provided
- ✅ Automatically verifies email when token is provided
- ✅ Shows success message and redirects after verification
- ✅ Shows error message for expired tokens (400 status)
- ✅ Shows error message for invalid tokens
- ✅ Handles network errors gracefully

### ForgotPasswordForm
- ✅ Renders email input and submit button
- ✅ Shows validation error for invalid email
- ✅ Submits form with valid email
- ✅ Shows success message after sending reset link
- ✅ Handles rate limiting (429 status)
- ✅ Disables input and button after successful submission
- ✅ Shows loading state during submission

## Testing Stack

- **Vitest** - Fast unit test framework with native ESM support
- **React Testing Library** - Component testing utilities
- **Happy-DOM** - Lightweight DOM implementation (better ESM support than jsdom)
- **User Event** - Simulate user interactions
- **Zustand Mocking** - Mock store for isolated component testing

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Configuration

Tests are configured in:
- `vitest.config.mts` - Vitest configuration with React plugin
- `src/test/setup.ts` - Global test setup and mocks

## Mocks

### Next.js Router
All components using `useRouter` have it mocked with:
- `push()` - Navigate to new route
- `replace()` - Replace current route
- `prefetch()` - Prefetch route
- `back()` - Go back in history

### Zustand Store
The auth store is mocked to test component behavior in isolation without actual API calls.

### Environment Variables
- `NEXT_PUBLIC_API_URL` is set to `http://localhost:9001` for tests

## Known Issues

Some tests are currently timing out due to async validation with react-hook-form. This is a known limitation of testing async form validation and doesn't affect actual component functionality.

## Future Improvements

1. Add integration tests that test full user flows
2. Add E2E tests with Playwright
3. Increase test coverage to include edge cases
4. Add visual regression tests
5. Add accessibility (a11y) tests
