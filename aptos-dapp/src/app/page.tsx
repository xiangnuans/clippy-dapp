"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white py-8">
      <div className="max-w-md mx-auto px-5">
        {/* Main Content */}
        <div className="space-y-6 mb-12">
          <h2 className="text-3xl font-medium leading-tight">
            UPLOAD YOUR CONSCIOUSNESS
          </h2>
          <p className="text-gray-400">
            Create a cybernetic digital avatar powered by advanced AI technology
          </p>
        </div>

        {/* Avatar Preview */}
        <div className="relative aspect-square mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1f] to-[#0A0A0B] rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/images/robot1.png"
                alt="AI Avatar"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            variant="primary"
            onClick={() => router.push("/identity-verification")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
