export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface JwtPayload {
  email: string;
}