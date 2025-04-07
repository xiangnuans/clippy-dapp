"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, DollarSign, Settings, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Footer } from "@/components/Footer";

const agentTypes = [
  {
    id: "medical",
    title: "Medical",
    icon: Stethoscope,
    description: "Healthcare and medical assistance",
  },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    description: "Learning and teaching support",
  },
  {
    id: "finance",
    title: "Finance",
    icon: DollarSign,
    description: "Financial advice and management",
  },
  {
    id: "industry",
    title: "Industry",
    icon: Settings,
    description: "Industrial and technical solutions",
  },
];

export default function AIAgentsPage() {
  const router = useRouter();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  // 预加载下一个页面
  useEffect(() => {
    router.prefetch("/buy-robot");
  }, [router]);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleContinue = () => {
    if (selectedAgents.length > 0) {
      // 使用 replace 而不是 push 来减少历史记录堆栈
      router.replace("/buy-robot");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8 pb-24">
      <div className="max-w-md mx-auto px-5">
        {/* Back button */}
        {/* <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-white/80 hover:text-white mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </button> */}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium mb-2">Choose Your</h1>
          <h1 className="text-3xl font-medium">AI Agents</h1>
        </div>

        {/* Agent Options */}
        <div className="space-y-4 mb-8">
          {agentTypes.map((agent) => (
            <Card
              key={agent.id}
              className="bg-[#141416] hover:bg-[#1a1a1f] border-none p-4 rounded-xl cursor-pointer transition-colors"
              onClick={() => handleAgentToggle(agent.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-lg bg-[#1a1a1f] flex items-center justify-center">
                    <agent.icon className="h-6 w-6 text-[#3730A3]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{agent.title}</h3>
                    <p className="text-sm text-gray-400">{agent.description}</p>
                  </div>
                </div>
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedAgents.includes(agent.id)
                      ? "border-[#3730A3] bg-[#3730A3]"
                      : "border-gray-600"
                  }`}
                >
                  {selectedAgents.includes(agent.id) && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={selectedAgents.length === 0}
          >
            Next
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
