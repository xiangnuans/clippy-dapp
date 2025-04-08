"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { authService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { signMessageAsync } = useSignMessage({
    message: "Welcome to Clippy DApp! Please sign this message to login.",
  });

  const handleLogin = async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      // 1. 获取签名
      const signature = await signMessageAsync();

      // 2. 验证签名
      const verifyResult = await authService.verifySignature(
        address,
        signature,
        address // 使用钱包地址作为公钥
      );

      if (!verifyResult.valid) {
        throw new Error("Signature verification failed");
      }

      // 3. 登录
      const loginResult = await authService.login(address, signature, address);

      toast({
        title: "Login successful",
        description: "You have been logged in successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome to Clippy DApp</h1>
          <p className="mt-2 text-gray-600">
            Connect your wallet to get started
          </p>
        </div>

        <div className="mt-8">
          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={!isConnected || isLoading}
          >
            {isLoading ? "Logging in..." : "Login with Wallet"}
          </Button>
        </div>
      </div>
    </div>
  );
}
