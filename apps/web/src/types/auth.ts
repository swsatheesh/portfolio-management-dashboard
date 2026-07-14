export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface CurrentUserResponse {
  user: AuthUser;
}