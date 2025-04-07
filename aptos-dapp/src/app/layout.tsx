import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AutoConnectProvider } from "@/components/AutoConnectProvider";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Life++ | AI Digital Avatar Platform",
  description:
    "Create your own AI digital avatar and join the future of digital consciousness",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn(inter.className, "min-h-screen bg-[#0A0A0B]")}>
        <AutoConnectProvider>
          <ReactQueryClientProvider>
            <WalletProvider>
              <Toaster />
              <Header />
              <main className="py-16">{children}</main>
              <Footer />
            </WalletProvider>
          </ReactQueryClientProvider>
        </AutoConnectProvider>
      </body>
    </html>
  );
}
