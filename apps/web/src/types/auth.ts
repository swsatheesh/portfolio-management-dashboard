export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}