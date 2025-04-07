"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";
import { Footer } from "@/components/Footer";
import { useCallback, useEffect } from "react";

const SecurityCard = ({
  title,
  descriptions,
  onClick,
}: {
  title: string;
  descriptions: string[];
  onClick: () => void;
}) => (
  <Card
    className="bg-[#141416] hover:bg-[#1a1a1f] border-none p-4 rounded-xl cursor-pointer transition-colors relative"
    onClick={onClick}
  >
    <div className="pr-8">
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="space-y-1">
        {descriptions.map((desc, index) => (
          <p key={index} className="text-sm text-gray-400">
            {desc}
          </p>
        ))}
      </div>
    </div>
    <div className="absolute right-4 top-1/2 -translate-y-1/2">
      <ChevronRight className="h-5 w-5 text-[#3730A3]" />
    </div>
  </Card>
);

export default function IdentityVerificationPage() {
  const router = useRouter();
  const { connected } = useWallet();
  const { toast } = useToast();

  // 预加载下一个页面
  useEffect(() => {
    const prefetchPages = () => {
      router.prefetch("/customize-agent");
    };
    prefetchPages();
  }, [router]);

  const handleNavigation = useCallback(() => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
      });
      return;
    }
    // 使用 replace 而不是 push 来减少历史记录堆栈
    router.push("/customize-agent");
  }, [router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white px-5 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center space-x-2 text-white/80 hover:text-white mb-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-start space-x-3 mb-8">
          <div className="h-8 w-8 mt-1">
            <Lock className="w-full h-full text-[#3730A3]" />
          </div>
          <div>
            <h1 className="text-3xl font-medium mb-1">Identity</h1>
            <h1 className="text-3xl font-medium">Verification</h1>
          </div>
        </div>

        <div className="space-y-4">
          <SecurityCard
            title="Privacy and security"
            descriptions={[
              "Your data oncryption using fartice pesezionyprography",
              "Usera control over delata",
            ]}
            onClick={() => console.log("Privacy clicked")}
          />
          <SecurityCard
            title="Did upload"
            descriptions={[
              "Learn mores st out data,",
              "collection and share sharing",
            ]}
            onClick={handleNavigation}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
