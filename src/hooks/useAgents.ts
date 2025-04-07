import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { API_BASE_URL } from "@/hooks/useAuth";
import type { Agent, CreateAgentDto, UpdateAgentDto } from "@/types/agent";

// API functions
async function fetchAgents(): Promise<Agent[]> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE_URL}/api/agents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch agents");
  }

  return response.json();
}

async function fetchAgent(id: string): Promise<Agent> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch agent");
  }

  return response.json();
}

async function createAgent(data: CreateAgentDto): Promise<Agent> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE_URL}/api/agents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create agent");
  }

  return response.json();
}

async function updateAgent(id: string, data: UpdateAgentDto): Promise<Agent> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update agent");
  }

  return response.json();
}

async function deleteAgent(id: string): Promise<void> {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete agent");
  }
}

// Hooks
export function useAgents() {
  const token = useAuthStore((state) => state.token);

  return useQuery<Agent[], Error>({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    enabled: !!token,
  });
}

export function useAgent(id: string) {
  const token = useAuthStore((state) => state.token);

  return useQuery<Agent, Error>({
    queryKey: ["agent", id],
    queryFn: () => fetchAgent(id),
    enabled: !!token && !!id,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAgentDto }) =>
      updateAgent(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["agent", data._id] });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });
}
