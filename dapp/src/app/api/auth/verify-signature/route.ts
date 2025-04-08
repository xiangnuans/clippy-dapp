import { NextResponse } from "next/server";
import { verifySignature, SIGNATURE_MESSAGE } from "@/lib/signature";

export async function POST(request: Request) {
  try {
    const { walletAddress, signature, publicKey } = await request.json();

    // 用于测试的字节序列转换
    const messageBytes = new TextEncoder().encode(SIGNATURE_MESSAGE);
    let signatureBytes;
    let publicKeyBytes;
    try {
      signatureBytes = signature.startsWith("0x")
        ? signature.substring(2)
        : signature;
      publicKeyBytes =
        publicKey && publicKey.startsWith("0x")
          ? publicKey.substring(2)
          : publicKey;
    } catch (error) {
      console.error(`转换签名/公钥出错: ${error}`);
    }

    // 验证签名
    const result = await verifySignature({
      walletAddress,
      message: SIGNATURE_MESSAGE,
      signature,
      publicKey,
    });

    // 返回详细结果
    return NextResponse.json({
      isValid: result,
      message: SIGNATURE_MESSAGE,
      signatureLength: signature?.length || 0,
      publicKeyLength: publicKey?.length || 0,
      bytesInfo: {
        messageBytes: Array.from(messageBytes),
        signatureHex: signatureBytes,
        publicKeyHex: publicKeyBytes,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error verifying signature:", error);
    return NextResponse.json(
      { error: "Failed to verify signature" },
      { status: 500 }
    );
  }
}
