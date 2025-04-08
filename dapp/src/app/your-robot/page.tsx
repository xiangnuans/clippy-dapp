"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { useAgents } from "@/hooks/useAgents";
import { useToast } from "@/components/ui/use-toast";
import { ApiException } from "@/lib/api-error";

export default function YourRobotPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const { data: agents, isLoading, error } = useAgents();
  const latestAgent = agents?.[0]; // Get the most recently created agent

  useEffect(() => {
    if (error) {
      if (error instanceof ApiException) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to load your AI Agent",
          variant: "destructive",
        });
      }
    }
  }, [error, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isLoading, latestAgent, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] text-white py-8 pb-24">
        <div className="max-w-md mx-auto px-5">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3730A3]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8 pb-24">
      <div className="max-w-md mx-auto px-5">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-white/80 hover:text-white mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Your Robot</h1>
          <h1 className="text-3xl font-medium">NFT</h1>
        </div>

        {/* Loading Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg">
              {progress < 100 ? "LOADING..." : "COMPLETED"}
            </span>
            <span className="text-lg">{progress}%</span>
          </div>
          <div className="h-2 bg-[#141416] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3730A3] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Robot Preview */}
        <div className="relative aspect-square mb-8 rounded-3xl overflow-hidden bg-[#141416]">
          <Image
            src="/images/robot.png"
            alt="Robot NFT"
            fill
            className="object-cover w-full h-full"
            priority
          />
        </div>

        {/* Agent Info */}
        {latestAgent && (
          <div className="mb-8 space-y-4">
            <div className="bg-[#141416] p-4 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Agent Details</h3>
              <p className="text-white/80">Name: {latestAgent.name}</p>
              <p className="text-white/80">Industry: {latestAgent.industry}</p>
              <p className="text-white/80">
                Description: {latestAgent.description}
              </p>
            </div>
          </div>
        )}

        {/* Done Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={() => router.push("/ai-agents")}
            disabled={progress < 100}
          >
            Done
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
