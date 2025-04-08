export interface User {
  id: string;
  walletAddress: string;
  username: string | null;
  email: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
