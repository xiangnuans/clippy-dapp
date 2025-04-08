import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth, SIGNATURE_MESSAGE } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function WalletConnect() {
  const { signIn, isLoading, isAuthenticated, clearAuth } = useAuth();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Handle wallet connection
  const handleConnect = useCallback(async () => {
    try {
      // Check if ethereum is available
      const { ethereum } = window as any;
      if (!ethereum) {
        toast({
          variant: "destructive",
          title: "Wallet not found",
          description:
            "Please install a Web3 wallet like MetaMask or OKX Wallet.",
        });
        return;
      }

      // Request account access
      const accounts = await ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .catch((error: any) => {
          console.error("Account request error:", error);
          throw new Error(error?.message || "Failed to access wallet accounts");
        });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const walletAddress = accounts[0];
      console.log("Connected wallet address:", walletAddress);

      try {
        // Request signature
        const signature = await ethereum.request({
          method: "personal_sign",
          params: [SIGNATURE_MESSAGE, walletAddress],
        });

        console.log("Signature received:", signature);

        // Call login
        await signIn(signature, walletAddress);
      } catch (signError: any) {
        console.error("Signature error:", signError);
        throw new Error(signError?.message || "Failed to sign message");
      }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description:
          error.message || "Failed to connect wallet. Please try again.",
      });
    }
  }, [signIn]);

  // Handle wallet disconnection
  const handleDisconnect = useCallback(async () => {
    try {
      setIsDisconnecting(true);

      // Clear auth state
      clearAuth();

      // Reload page to reset connection state
      window.location.reload();
    } catch (error: any) {
      console.error("Disconnect error:", error);
      toast({
        variant: "destructive",
        title: "Disconnect failed",
        description: "Failed to disconnect wallet. Please try again.",
      });
    } finally {
      setIsDisconnecting(false);
    }
  }, [clearAuth]);

  const buttonClasses = cn(
    "bg-gradient-to-r from-indigo-600 to-violet-600",
    "hover:from-indigo-700 hover:to-violet-700",
    "border-none",
    "shadow-lg hover:shadow-xl",
    "transform hover:scale-105",
    "transition-all duration-200",
    "min-w-[140px] max-w-[200px]",
    "px-4 py-2 text-sm md:text-base"
  );

  if (isAuthenticated) {
    return (
      <Button
        variant="primary"
        onClick={handleDisconnect}
        disabled={isDisconnecting}
        fullWidth={false}
        className={buttonClasses}
      >
        {isDisconnecting ? "Disconnecting..." : "Disconnect"}
      </Button>
    );
  }

  return (
    <Button
      variant="primary"
      onClick={handleConnect}
      disabled={isLoading}
      fullWidth={false}
      className={buttonClasses}
    >
      {isLoading ? "Connecting..." : "Connect"}
    </Button>
  );
}
