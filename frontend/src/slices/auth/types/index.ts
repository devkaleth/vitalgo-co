/**
 * TypeScript types for authentication slice
 */

export interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  userType: string;
  isVerified: boolean;
  profileCompleted: boolean;
  mandatoryFieldsCompleted: boolean;
  hasActiveSubscription?: boolean;
}

export interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  redirectUrl?: string;
}

export interface LoginErrorResponse {
  success: false;
  message: string;
  attemptsRemaining?: number;
  retryAfter?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  message?: string;
}

export interface FieldValidationState {
  isValidating: boolean;
  isValid: boolean | null;
  error: string | null;
}

export interface AuthApiClient {
  login: (credentials: LoginForm) => Promise<LoginResponse>;
  logout: (logoutAll?: boolean) => Promise<{ success: boolean; message: string }>;
  refreshToken: (refreshToken: string) => Promise<LoginResponse>;
  validateToken: () => Promise<{ valid: boolean; user?: User }>;
  getCurrentUser: () => Promise<{ success: boolean; user: User }>;
}