"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function MyAssetsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8">
      <div className="max-w-md mx-auto px-5">
        {/* Header */}
        <h1 className="text-3xl font-medium mb-8">My Life++ Assets</h1>

        {/* Balance */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-medium mb-6">3.20</h2>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 mb-8">
            <Button
              variant="outline"
              className="flex-1 py-2.5 md:py-4 bg-[#141416] hover:bg-[#1a1a1f] border-none text-white text-sm md:text-base"
              onClick={() => console.log("Send clicked")}
            >
              Send
            </Button>
            <Button
              className="flex-1 py-2.5 md:py-4 bg-[#3730A3] hover:bg-[#2d2682] text-white text-sm md:text-base"
              onClick={() => console.log("Buy clicked")}
            >
              Buy
            </Button>
            <Button
              variant="outline"
              className="flex-1 py-2.5 md:py-4 bg-[#141416] hover:bg-[#1a1a1f] border-none text-white text-sm md:text-base"
              onClick={() => console.log("Deposit clicked")}
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Governance Section */}
        <div>
          <h2 className="text-2xl font-medium mb-4">Governance</h2>

          {/* Info Card */}
          <Card className="bg-[#141416] border-none p-4 rounded-xl mb-4">
            <p className="text-base text-gray-300">
              Participats in governance decisions to shape the future of the
              Life++ ecosystem
            </p>
          </Card>

          {/* Governance Button */}
          <Button
            variant="outline"
            className="w-full bg-[#141416] hover:bg-[#1a1a1f] border-none text-white text-base"
            onClick={() => console.log("Governance clicked")}
          >
            Governance
          </Button>
        </div>
      </div>
    </div>
  );
}
