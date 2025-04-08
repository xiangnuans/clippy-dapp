import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConnectButton() {
  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button 
                    onClick={openConnectModal}
                    variant="primary"
                    size="default"
                    fullWidth={false}
                    className={cn(
                      "bg-gradient-to-r from-indigo-600 to-violet-600",
                      "hover:from-indigo-700 hover:to-violet-700",
                      "border-none",
                      "shadow-lg hover:shadow-xl",
                      "transform hover:scale-105",
                      "transition-all duration-200"
                    )}
                  >
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button 
                    onClick={openChainModal}
                    variant="secondary"
                    size="default"
                    fullWidth={false}
                    className={cn(
                      "bg-red-600 hover:bg-red-700",
                      "text-white",
                      "shadow-lg hover:shadow-xl",
                      "transform hover:scale-105",
                      "transition-all duration-200"
                    )}
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={openChainModal}
                    variant="outline"
                    size="sm"
                    fullWidth={false}
                    className={cn(
                      "bg-transparent",
                      "border border-indigo-600",
                      "text-indigo-600 dark:text-indigo-400",
                      "hover:bg-indigo-600 hover:text-white",
                      "shadow-sm hover:shadow-md",
                      "transition-all duration-200"
                    )}
                  >
                    {chain.hasIcon && (
                      <div
                        className={cn(
                          "mr-2 h-4 w-4 rounded-full overflow-hidden",
                          "flex items-center justify-center"
                        )}
                        style={{
                          background: chain.iconBackground,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            className="h-full w-full object-contain"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button 
                    onClick={openAccountModal}
                    variant="primary"
                    size="default"
                    fullWidth={false}
                    className={cn(
                      "bg-gradient-to-r from-indigo-600 to-violet-600",
                      "hover:from-indigo-700 hover:to-violet-700",
                      "border-none",
                      "shadow-lg hover:shadow-xl",
                      "transform hover:scale-105",
                      "transition-all duration-200",
                      "min-w-[180px]"
                    )}
                  >
                    <span className="flex items-center justify-between w-full gap-2">
                      <span className="truncate">
                        {account.displayName}
                      </span>
                      {account.displayBalance && (
                        <span className="text-indigo-200 font-normal">
                          {account.displayBalance}
                        </span>
                      )}
                    </span>
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </RainbowConnectButton.Custom>
  );
}
