import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import type { AuthState } from "@/store/auth";
import type { User, AuthResponse } from "@/types/user";
import React, { useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

export const SIGNATURE_MESSAGE = "CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS";

interface AuthRequest {
  walletAddress: string;
  signature: string;
}

async function authenticate(data: AuthRequest): Promise<AuthResponse> {
  const response = await fetch(`/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Authentication failed");
  }

  return response.json();
}

async function fetchUserProfile(): Promise<User> {
  const token = useAuthStore.getState().token;
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch user profile");
  }

  return response.json();
}

async function logout(): Promise<void> {
  const token = useAuthStore.getState().token;
  if (token) {
    try {
      const response = await fetch(`/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
}

export function useAuth() {
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);
  const clearAuth = useAuthStore((state: AuthState) => state.clearAuth);
  const token = useAuthStore((state: AuthState) => state.token);
  const isAuthenticating = useRef(false);

  const loginMutation = useMutation({
    mutationFn: authenticate,
    onSuccess: (data: AuthResponse) => {
      // Store auth data in localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update auth store
      setAuth(data.access_token, data.user);
      isAuthenticating.current = false;
      toast({
        title: "Connected successfully",
        description: "Your wallet has been connected and authenticated.",
      });
    },
    onError: (error: Error) => {
      isAuthenticating.current = false;
      clearAuth();
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      toast({
        variant: "destructive",
        title: "Connection failed",
        description:
          error.message || "Failed to connect wallet. Please try again.",
      });
    },
  });

  const handleSignIn = async (signature: string, walletAddress: string) => {
    if (isAuthenticating.current || token) {
      return;
    }

    try {
      isAuthenticating.current = true;
      return await loginMutation.mutateAsync({
        walletAddress,
        signature,
      });
    } catch (error) {
      isAuthenticating.current = false;
      throw error;
    }
  };

  return {
    signIn: handleSignIn,
    isLoading: loginMutation.isPending,
    error: loginMutation.error,
    clearAuth,
    isAuthenticated: !!token,
  };
}

export function useProfile() {
  const token = useAuthStore((state: AuthState) => state.token);
  const setAuth = useAuthStore((state: AuthState) => state.setAuth);

  const queryOptions: UseQueryOptions<User, Error> = {
    queryKey: ["profile"],
    queryFn: fetchUserProfile,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  };

  const query = useQuery<User, Error>(queryOptions);

  // Update store when data changes
  React.useEffect(() => {
    if (query.data) {
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        setAuth(currentToken, query.data);
      }
    }
  }, [query.data, setAuth]);

  return query;
}

export function getStoredAuth(): {
  token: string | null;
  user: User | null;
} {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }

  const token = localStorage.getItem("access_token");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return { token, user };
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}
