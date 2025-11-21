/**
 * Authentication API Client
 * Handles all API calls to the backend authentication endpoints
 */

import { LoginForm, LoginResponse, LoginErrorResponse, User, AuthApiClient } from '../types';
import { LocalStorageService } from '../../../shared/services/local-storage-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AuthApiClientImpl implements AuthApiClient {
  private getAuthHeaders(): Record<string, string> {
    const token = LocalStorageService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401) {
        // Clear invalid tokens using centralized service
        LocalStorageService.clearAuthenticationData();
      }

      throw new Error(errorData.detail?.message || errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(credentials: LoginForm): Promise<LoginResponse> {
    try {
      const requestUrl = `${API_BASE_URL}/api/auth/login`;
      const requestBody = {
        email: credentials.email,
        password: credentials.password,
        remember_me: credentials.rememberMe
      };

      console.log('🔍 API CLIENT DEBUG: Making login request', {
        url: requestUrl,
        body: requestBody,
        API_BASE_URL: API_BASE_URL
      });

      // Persist debug info to prevent loss on page redirect
      localStorage.setItem('debugLoginRequest', JSON.stringify({
        timestamp: new Date().toISOString(),
        url: requestUrl,
        body: requestBody
      }));

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔍 API CLIENT DEBUG: Response received', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Persist response debug info
      localStorage.setItem('debugLoginResponse', JSON.stringify({
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      }));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        console.log('🔍 API CLIENT DEBUG: Error response', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData
        });

        // Handle specific error responses from backend
        if (response.status === 401) {
          const error: LoginErrorResponse = {
            success: false,
            message: errorData.detail?.message || errorData.message || 'Email o contraseña incorrectos',
            attemptsRemaining: errorData.detail?.attempts_remaining || errorData.attempts_remaining,
            retryAfter: errorData.detail?.retry_after || errorData.retry_after
          };
          throw error;
        }

        if (response.status === 429) {
          const error: LoginErrorResponse = {
            success: false,
            message: errorData.detail || 'Demasiados intentos. Intenta más tarde.',
            retryAfter: 900 // 15 minutes
          };
          throw error;
        }

        throw new Error(errorData.detail || 'Error en el servidor');
      }

      const data = await response.json();

      console.log('🔍 API CLIENT DEBUG: Success response data', {
        success: data.success,
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        hasUser: !!data.user,
        hasRedirectUrl: 'redirect_url' in data,
        redirectUrl: data.redirect_url,
        responseKeys: Object.keys(data)
      });

      // Persist success response debug info
      localStorage.setItem('debugLoginSuccess', JSON.stringify({
        timestamp: new Date().toISOString(),
        success: data.success,
        hasAccessToken: !!data.access_token,
        hasRefreshToken: !!data.refresh_token,
        hasUser: !!data.user,
        redirectUrl: data.redirect_url,
        responseKeys: Object.keys(data)
      }));

      // JWT TOKEN DEBUG: Analyze received token immediately
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExp = payload.exp - currentTime;

        console.log('🔍 FRONTEND JWT DEBUG - Token Received Analysis:');
        console.log(`   Received at timestamp: ${currentTime}`);
        console.log(`   Token exp timestamp: ${payload.exp}`);
        console.log(`   Time until expiration: ${timeUntilExp} seconds`);
        console.log(`   Token valid immediately: ${timeUntilExp > 0}`);
        console.log(`   Full token payload:`, payload);

        if (timeUntilExp <= 0) {
          console.log('❌ FRONTEND JWT DEBUG - TOKEN EXPIRED UPON RECEIPT!');
        } else if (timeUntilExp < 60) {
          console.log('⚠️ FRONTEND JWT DEBUG - TOKEN EXPIRES VERY SOON!');
        }
      } catch (e) {
        console.error('❌ FRONTEND JWT DEBUG - Token analysis failed:', e);
      }

      // Store tokens and user data using centralized service
      LocalStorageService.setAuthDataFromRegistration({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user: data.user
      });

      console.log('🔍 API CLIENT CHECKPOINT 2: localStorage updated',
        LocalStorageService.getAuthDebugInfo()
      );

      const loginResponse = {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type || 'bearer',
        expiresIn: data.expires_in,
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          userType: data.user.user_type,
          isVerified: data.user.is_verified,
          profileCompleted: data.user.profile_completed,
          mandatoryFieldsCompleted: data.user.mandatory_fields_completed,
          hasActiveSubscription: data.user.has_active_subscription
        },
        redirectUrl: data.redirect_url
      };

      console.log('🔍 API CLIENT CHECKPOINT 3: Returning login response', {
        redirectUrl: loginResponse.redirectUrl,
        hasRedirectUrl: !!loginResponse.redirectUrl
      });

      return loginResponse;
    } catch (error) {
      // Enhanced error logging with duck typing (per DEV.md guidelines)
      console.error('🔍 API CLIENT DEBUG: Caught error in login', {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        isError: error instanceof Error,
        hasSuccess: error && typeof error === 'object' && 'success' in error,
        hasMessage: error && typeof error === 'object' && 'message' in error,
        errorMessage: error instanceof Error ? error.message : (error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error)),
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        errorStack: error instanceof Error ? error.stack : undefined
      });

      // Persist error debug info
      localStorage.setItem('debugLoginError', JSON.stringify({
        timestamp: new Date().toISOString(),
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        isError: error instanceof Error,
        hasSuccess: error && typeof error === 'object' && 'success' in error,
        hasMessage: error && typeof error === 'object' && 'message' in error,
        errorKeys: error && typeof error === 'object' ? Object.keys(error) : [],
        // Safely serialize the error
        errorString: error instanceof Error ? error.message : JSON.stringify(error, Object.getOwnPropertyNames(error))
      }));

      // Re-throw LoginErrorResponse objects (duck typing pattern)
      if (error && typeof error === 'object' && 'success' in error) {
        console.log('🔍 API CLIENT DEBUG: Re-throwing LoginErrorResponse');
        throw error;
      }

      // Extract message from Error objects
      if (error instanceof Error) {
        console.log('🔍 API CLIENT DEBUG: Converting Error to LoginErrorResponse');
        throw {
          success: false,
          message: error.message || 'Error de conexión. Verifica tu internet.',
        } as LoginErrorResponse;
      }

      // Handle unknown error types
      console.log('🔍 API CLIENT DEBUG: Unknown error type, using default message');
      throw {
        success: false,
        message: 'Error de conexión. Verifica tu internet.',
      } as LoginErrorResponse;
    }
  }

  async logout(logoutAll: boolean = false): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/logout?logout_all=${logoutAll}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await this.handleResponse<{ success: boolean; message: string }>(response);

      // Clear local storage using centralized service
      LocalStorageService.clearAuthenticationData();

      return data;
    } catch (error) {
      // Always clear local storage on logout attempt using centralized service
      LocalStorageService.clearAuthenticationData();

      return { success: true, message: 'Logout exitoso' };
    }
  }

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const data = await this.handleResponse<any>(response);

    // Update stored tokens using centralized service
    LocalStorageService.setAuthDataFromRegistration({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      user: data.user
    });

    return {
      success: true,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      tokenType: data.token_type || 'bearer',
      expiresIn: data.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        userType: data.user.user_type,
        isVerified: data.user.is_verified,
        profileCompleted: data.user.profile_completed,
        mandatoryFieldsCompleted: data.user.mandatory_fields_completed,
        hasActiveSubscription: data.user.has_active_subscription
      },
      redirectUrl: data.redirect_url
    };
  }

  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      const data = await this.handleResponse<{ valid: boolean; user?: any }>(response);

      if (data.valid && data.user) {
        return {
          valid: true,
          user: {
            id: data.user.user_id,
            email: data.user.email,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            userType: data.user.user_type,
            isVerified: data.user.is_verified,
            profileCompleted: data.user.profile_completed,
            mandatoryFieldsCompleted: data.user.mandatory_fields_completed,
            hasActiveSubscription: data.user.has_active_subscription
          }
        };
      }

      return { valid: false };
    } catch (error) {
      return { valid: false };
    }
  }

  async getCurrentUser(): Promise<{ success: boolean; user: User }> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const data = await this.handleResponse<{ success: boolean; user: any }>(response);

    return {
      success: data.success,
      user: {
        id: data.user.user_id,
        email: data.user.email,
        firstName: data.user.first_name,
        lastName: data.user.last_name,
        userType: data.user.user_type,
        isVerified: data.user.is_verified,
        profileCompleted: data.user.profile_completed,
        mandatoryFieldsCompleted: data.user.mandatory_fields_completed,
        hasActiveSubscription: data.user.has_active_subscription
      }
    };
  }
}

export const authApiClient = new AuthApiClientImpl();