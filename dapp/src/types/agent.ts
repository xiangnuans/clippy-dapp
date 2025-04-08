export interface Agent {
  _id: string;
  name: string;
  industry: string;
  description: string;
  owner: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDto {
  name: string;
  industry: string;
  description: string;
}

export interface UpdateAgentDto {
  name?: string;
  industry?: string;
  description?: string;
}
