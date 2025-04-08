export interface Agent {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    walletAddress: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
}
