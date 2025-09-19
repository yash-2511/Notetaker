import { apiRequest } from './queryClient';
import { SignupRequest, LoginRequest, VerifyOtpRequest, User } from '@shared/schema';

export interface AuthResponse {
  message: string;
  token?: string;
  user?: User;
  email?: string;
}

export class AuthAPI {
  static async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/signup', data);
    return response.json();
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/login', data);
    return response.json();
  }

  static async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/verify-otp', data);
    return response.json();
  }

  static async resendOtp(email: string): Promise<{ message: string }> {
    const response = await apiRequest('POST', '/api/auth/resend-otp', { email });
    return response.json();
  }

  static async getProfile(): Promise<User> {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  }

  static async googleAuth(): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/api/auth/google');
    return response.json();
  }
}

export const tokenStorage = {
  get: () => localStorage.getItem('auth_token'),
  set: (token: string) => localStorage.setItem('auth_token', token),
  remove: () => localStorage.removeItem('auth_token'),
};

export const userStorage = {
  get: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  set: (user: User) => localStorage.setItem('user', JSON.stringify(user)),
  remove: () => localStorage.removeItem('user'),
};
