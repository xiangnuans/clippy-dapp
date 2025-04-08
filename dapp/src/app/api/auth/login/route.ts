import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifySignature, SIGNATURE_MESSAGE } from "@/lib/signature";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    if (!process.env.JWT_SECRET) {
      // 生成 JWT 
      return NextResponse.json({ error: "JWT_SECRET is not set" }, { status: 500 });
    }

    const { walletAddress, signature, publicKey } = await request.json();

    // 验证签名
    const isValid = await verifySignature({
      walletAddress,
      message: SIGNATURE_MESSAGE,
      signature,
      publicKey,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 查找或创建用户
    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOneAndUpdate(
      { walletAddress },
      {
        $set: {
          walletAddress,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
          isActive: true,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

   
    // 生成 JWT token
    const token = jwt.sign(
      {
        sub: user?.value?._id,
        walletAddress: user?.value?.walletAddress,  
      },
      process.env.JWT_SECRET || "clippy",
      { expiresIn: "24h" }
    );

    return NextResponse.json({
      access_token: token,
      user: {
        id: user?.value?._id,
        walletAddress: user?.value?.walletAddress,
        username: user?.value?.username,
        email: user?.value?.email,
        avatar: user?.value?.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
