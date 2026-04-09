export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  email_verified: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}

export interface RegisterResponse {
  message: string;
  data: {
    user_id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    email_verified: boolean;
  };
}

export interface ApiError {
  message: string;
  error?: string;
  locked_until?: string;
}
