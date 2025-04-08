"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAgentStore } from "@/store/agent";
import { useToast } from "@/components/ui/use-toast";

const knowledgeOptions = [
  { id: "social-media", label: "Social media" },
  { id: "email", label: "Email" },
  { id: "device-storage", label: "Device storage" },
  { id: "bci", label: "Brain-Computer Interface" },
];

export default function KnowledgeBasePage() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([
    "social-media",
    "email",
  ]);
  const router = useRouter();
  const { toast } = useToast();
  const { name, personality } = useAgentStore();

  useEffect(() => {
    if (!name || !personality) {
      toast({
        title: "Invalid Access",
        description: "Please complete the previous step first",
        variant: "destructive",
      });
      router.push("/customize-agent");
    }
  }, [name, personality, router, toast]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8">
      <div className="max-w-md mx-auto px-5">
        {/* Logo */}
        <div className="mb-8">
          <h2 className="text-xl font-medium">LIFE++</h2>
        </div>

        {/* Header */}
        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-medium">Personal Knowledge Base</h1>
          <p className="text-gray-400">
            Let's get started with adding your data to your personal knowledge
            base
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4 mb-8">
          {knowledgeOptions.map((option) => (
            <button
              key={option.id}
              className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-colors ${
                selectedOptions.includes(option.id)
                  ? "bg-[#1E1E24]"
                  : "bg-transparent"
              }`}
              onClick={() => handleOptionToggle(option.id)}
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedOptions.includes(option.id)
                    ? "border-[#2E2A5D] bg-[#2E2A5D]"
                    : "border-gray-600"
                }`}
              >
                {selectedOptions.includes(option.id) && (
                  <svg
                    className="w-3 h-3 text-white"
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
              <span className="text-lg">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <Button variant="primary" onClick={() => router.push("/")}>
          Create
        </Button>
      </div>
    </div>
  );
}
