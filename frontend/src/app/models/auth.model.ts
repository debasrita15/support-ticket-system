export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface UserInfo {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}
