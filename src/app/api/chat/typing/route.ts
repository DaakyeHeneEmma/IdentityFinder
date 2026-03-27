import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/auth";
import dbConnect from "@/app/lib/database_mongo/mongodb";
import { Conversation } from "@/app/lib/database_mongo/models/Conversation";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { conversationId, receiverId, typing } = body;

    if (!conversationId || !receiverId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    await Conversation.updateOne(
      { _id: conversationId },
      { 
        "typingStatus.${receiverId}": typing ? Date.now() : null,
        updatedAt: new Date(),
      }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating typing status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update typing status" },
      { status: 500 }
    );
  }
}
