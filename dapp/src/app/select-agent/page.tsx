"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NFTCard {
  id: string;
  image: string;
  name: string;
  chain: string;
}

const mockNFTs: NFTCard[] = [
  {
    id: "1",
    image: "/images/robot.png",
    name: "Gnocchi #213",
    chain: "Ethereum",
  },
  {
    id: "2",
    image: "/images/robot.png",
    name: "Glocier ID:321J",
    chain: "Ethereum",
  },
  {
    id: "3",
    image: "/images/robot.png",
    name: "Garden 10m.5rb",
    chain: "Ethereum",
  },
];

export default function SelectAgentPage() {
  const router = useRouter();
  const [selectedNFT, setSelectedNFT] = useState<string | null>(null);

  const handleNFTSelect = (id: string) => {
    setSelectedNFT(id);
  };

  const handleNext = () => {
    if (selectedNFT) {
      router.push("/your-robot");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8 pb-24">
      <div className="max-w-md mx-auto px-5">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-medium mb-4">AI Agents</h1>
          <p className="text-lg text-white/80">
            Which types of AI agents would you like to upload to your robot?
          </p>
        </div>

        {/* NFT Selection Section */}
        <div className="mb-8">
          <h2 className="text-xl mb-6">NFT Browsing and Selection</h2>
          <div className="grid grid-cols-3 gap-4">
            {mockNFTs.map((nft) => (
              <div
                key={nft.id}
                className={cn(
                  "bg-[#141416] rounded-xl p-3 cursor-pointer transition-all",
                  "border border-white/5 hover:border-[#3730A3]/50",
                  selectedNFT === nft.id &&
                    "border-[#3730A3] ring-1 ring-[#3730A3]"
                )}
                onClick={() => handleNFTSelect(nft.id)}
              >
                <div className="aspect-square relative mb-2 rounded-lg overflow-hidden bg-black/20">
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    fill
                    sizes="(max-width: 768px) 33vw, 200px"
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm truncate">{nft.name}</p>
                  <p className="text-xs text-white/60">{nft.chain}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "w-full text-xs py-1 h-8",
                      selectedNFT === nft.id
                        ? "bg-[#3730A3] hover:bg-[#2b2580] text-white"
                        : "bg-[#141416] hover:bg-[#1a1a1f] text-white/80 border border-white/10"
                    )}
                  >
                    {selectedNFT === nft.id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <Button variant="primary" onClick={handleNext} disabled={!selectedNFT}>
          Next
        </Button>
      </div>
    </div>
  );
}
