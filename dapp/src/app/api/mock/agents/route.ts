import { NextResponse } from "next/server";
import * as db from "@/lib/db";

const mockAgents = [
  {
    name: "AI Assistant Pro",
    industry: "Technology",
    description:
      "Advanced AI assistant specialized in software development and technical problem-solving",
    status: "active",
    avatar: "/images/robot.png",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "mock-user-1",
  },
  {
    name: "Creative Bot",
    industry: "Creative & Design",
    description:
      "AI creative assistant focused on generating innovative ideas and content",
    status: "active",
    avatar: "/images/robot.png",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "mock-user-1",
  },
  {
    name: "Business Analyst",
    industry: "Business",
    description:
      "AI analyst specialized in business strategy and market analysis",
    status: "active",
    avatar: "/images/robot.png",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "mock-user-1",
  },
];

export async function GET() {
  try {
    // 清除现有的 mock 数据
    const collection = await db.getCollection("agents");
    await collection.deleteMany({ userId: "mock-user-1" });

    // 插入新的 mock 数据
    await collection.insertMany(mockAgents);

    return NextResponse.json({
      message: "Mock agents created successfully",
      count: mockAgents.length,
    });
  } catch (error) {
    console.error("Failed to create mock agents:", error);
    return NextResponse.json(
      { error: "Failed to create mock agents" },
      { status: 500 }
    );
  }
}
