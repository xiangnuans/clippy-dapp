"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import Image from "next/image";
// import { WalletConnect } from "./WalletConnect";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo.png"
              alt="LIFE++"
              width={32}
              height={32}
              className="w-auto h-auto"
              priority
            />
          </div>
          <span className="text-white font-medium">LIFE++</span>
        </Link>

        <ConnectButton />
      </div>
    </header>
  );
}
