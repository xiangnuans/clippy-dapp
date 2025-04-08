"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { authService, agentsService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!address) {
        router.push("/login");
        return;
      }

      try {
        const agents = await agentsService.getAgents();
        setAgents(agents);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        toast({
          title: "Error",
          description: "Failed to fetch agents",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [address, router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout}>Logout</Button>
      </div>

      <div className="grid gap-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Your Agents</h2>
          {agents.length === 0 ? (
            <p className="text-gray-500">No agents found</p>
          ) : (
            <div className="grid gap-4">
              {agents.map((agent: any) => (
                <div key={agent.id} className="p-4 border rounded-lg">
                  <h3 className="font-medium">{agent.name}</h3>
                  <p className="text-sm text-gray-500">{agent.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
