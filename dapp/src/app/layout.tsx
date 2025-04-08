import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { WalletProvider } from "@/components/WalletProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
    <html lang="en" className="dark antialiased" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background")}>
        <WalletProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
