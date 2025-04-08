import { ethers } from 'ethers';

export const SIGNATURE_MESSAGE = "CLIPPY: INFUSE SOUL INTO HUMANOID ROBOTS";

interface VerifySignatureParams {
  walletAddress: string;
  signature: string;
}

// Helper functions
function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Main verification function
export async function verifySignature({
  walletAddress,
  signature,
}: VerifySignatureParams): Promise<boolean> {
  try {
    console.debug('=== Start Signature Verification ===');
    console.debug(`Wallet Address: ${walletAddress}`);
    console.debug(`Signature: ${signature}`);

    // Basic validation
    if (!isValidWalletAddress(walletAddress)) {
      console.warn(`Invalid wallet address: ${walletAddress}`);
      return false;
    }

    if (!signature) {
      console.warn('Missing signature');
      return false;
    }

    try {
      // Verify Ethereum signature
      const recoveredAddress = ethers.verifyMessage(
        SIGNATURE_MESSAGE,
        signature
      );

      const isValid = recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
      console.debug(`Recovered address: ${recoveredAddress}`);
      console.debug(`Original address: ${walletAddress}`);
      console.debug(`Signature verification result: ${isValid}`);
      
      return isValid;
    } catch (error: any) {
      console.error('Error during signature verification:', error?.message);
      return false;
    }
  } catch (error: any) {
    console.error('Signature verification error:', error?.message);
    return false;
  }
} 