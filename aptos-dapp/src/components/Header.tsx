"use client";
import { MuiWalletSelector } from "@/components/MuiWalletSelector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
export function Header() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/ai-agents");
    }
  }, [isAuthenticated, router]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B] border-b border-[#141416]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Image
                className="h-8 w-auto"
                src="/images/logo.png"
                alt="CLIPPY"
                width={32}
                height={32}
              />
            </div>
            <span className="text-white text-2xl font-bold">LIFE++</span>
          </div>
          <div className="flex items-center">
            <MuiWalletSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
