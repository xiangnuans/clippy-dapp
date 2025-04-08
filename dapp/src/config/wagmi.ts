import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig } from "wagmi";
import {
  mainnet,
  sepolia,
  optimism,
  optimismGoerli,
  arbitrum,
  arbitrumGoerli,
} from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID");
}

if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
  throw new Error("Missing NEXT_PUBLIC_ALCHEMY_API_KEY");
}

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    sepolia,
    optimism,
    optimismGoerli,
    arbitrum,
    arbitrumGoerli,
  ],
  [
    alchemyProvider({ apiKey: alchemyKey }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Life++",
  projectId,
  chains,
});

export { chains };

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});
