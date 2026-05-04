# Implementation Plan

## Overview
Implement an OTP-based two-step authentication flow for the Steelr application. The flow will:
1. Allow users to submit email + password to `/api/v1/auth/login`
2. Receive OTP if credentials are valid (no tokens yet)
3. Redirect to `/otp` page passing email via router state
4. Show 6-digit input with 10-minute countdown timer
5. Submit OTP to `/api/v1/auth/verify-otp`
6. Receive JWT tokens (access + refresh) on success
7. Store tokens in Redux auth slice
8. Redirect to `/dashboard`

This implementation preserves existing OTP functionality for email verification while adding a new authentication flow. It creates a Redux auth slice for centralized authentication state while maintaining React context for legacy compatibility.

## Types

### Auth Tokens
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // In seconds
}

interface DecodedToken {
  sub: string; // User ID
  roles: string[];
  exp: number;
  iat: number;
}
```

### Auth State
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface OTPFormData {
  email: string;
  otp: string;
}

interface VerifyOTPResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
```

### Backend Payloads
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  requiresOTP: boolean;
  tempAuthToken?: string; // Optional, if needed for intermediate auth
  message: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface VerifyOTPResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}
```

## Files

### New Files to Create
- `client/src/store/slices/authSlice.ts` - Redux auth state management

### Files to Modify

#### Client-side Files
- `client/src/pages/login/index.tsx` - Modify login form submission
- `client/src/pages/otp/index.tsx` - Update OTP page for auth flow, add countdown timer
- `client/src/providers/auth/index.tsx` - Integrated Redux state, preserve existing context
- `client/src/store/index.ts` - Add auth slice to Redux store
- `client/src/store/types/auth.ts` - Add auth state types
- `client/src/lib/api.ts` - Add auth token handling for API requests
- `client/src/components/auth/validation.ts` - Update validation schemas if needed

#### Backend Files
- `server/src/routes/auth-routes/auth.routes.ts` - Update endpoint handler methods
- `server/src/controllers/auth-controller/auth.controller.ts` - Modify login and verify-otp controller methods
- `server/src/services/auth-service/auth.service.ts` - Update login and verify logic, token generation
- `server/src/services/otp-service/otp.service.ts` - Add auth OTP validation logic
- `server/src/types/auth-api.ts` - Add new interface types for auth responses

## Functions

### New Functions

#### Frontend
- **authSlice.ts**:
  - `createAuthSlice()` - Creates auth slice with reducers and actions
  - `loginThunk()` - Handles login async flow and state updates
  - `verifyOTPThunk()` - Handles OTP verification async flow and auth state update
  - `logoutThunk()` - Handles logout with token cleanup

#### Backend
- **auth.service.ts**:
  - `validateCredentials()` - Validate email/password without token generation
  - `exchangeAuthCodeForTokens()` - Exchange successful OTP verification for JWT tokens

### Modified Functions

#### Frontend
- **Login Page**:
  - `onSubmit()` - Change to handle OTP-redirected response
- **OTP Page**:
  - `onSubmit()` - Modify to call verifyOTP thunk, handle token storage
- **AuthProvider**:
  - Update context methods to work with Redux state

#### Backend
- **login() controller**:
  - Return OTP indicator instead of immediate tokens
- **verifyOTP() controller**:
  - Return tokens on successful verification
- **authService.loginUser()**:
  - Split into separate credential validation and token exchange functions

## Classes

### Modified Classes
- **AuthProvider** - Update to work with Redux state internally while preserving context API
- **OTPService** - Extend verification logic for authentication flow

## Dependencies

### New Dependencies
- `redux-persist` - For maintaining authentication state across browser refreshes

### Updated Dependencies
- Ensure Redux Toolkit is used effectively for async thunks around authentication
- Confirm JWT decode utilities (could leverage `jwt-decode` package as needed)

## Testing

### Test Files
- `client/src/store/slices/authSlice.test.ts` - Auth slice reducer, thunk, and action tests
- `client/src/pages/login/Login.test.tsx` - Updated login flow testing
- `client/src/pages/otp/OTP.test.tsx` - OTP page testing with timer and verification

### Test Cases
- Successful login followed by OTP verification
- Expired OTP handling
- Wrong OTP handling
- Router state validation (ensure email persists)
- Token storage and API header injection
- Failed credentials at login step

## Implementation Order
1. Create Redux auth slice and integrate with store
2. Update auth provider to integrate Redux state
3. Modify backend login endpoint to require OTP verification
4. Create and test backend OTP verification flow with token generation
5. Update login page to handle OTP redirection response
6. Update OTP page to handle authentication tokens and display countdown
7. Implement Redux persistence for auth state
8. Update API layer to use Redux tokens automatically
9. Write comprehensive tests for redesigned flows
10. Implement error handling and edge case protection
11. Ensure existing email verification OTP flow remains intact
12. Add refresh token handling and rotation mechanism