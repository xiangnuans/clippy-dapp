"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export default function BuyRobotPage() {
  const router = useRouter();
  const { connected } = useWallet();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          router.push("/your-robot");
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleBuyNow = () => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to continue.",
        variant: "destructive",
        duration: 3000,
        className: "bg-red-500 border-none",
      });
      return;
    }
    setIsLoading(true);
    simulateProgress();
  };

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
          <h1 className="text-3xl font-medium mb-2">Buy Robot NFT</h1>
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

        {/* Price */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-lg">Price</span>
          <span className="text-2xl font-medium">0.1 APT</span>
        </div>

        {/* Buy Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleBuyNow}
            disabled={isLoading}
            className="relative"
          >
            {isLoading ? (
              <>
                <div className="absolute inset-0 bg-[#3730A3] opacity-20"></div>
                <div
                  className="absolute inset-0 bg-[#3730A3] transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
                <span className="relative">Processing...</span>
              </>
            ) : (
              "Buy now"
            )}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
