import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/auth";
import dbConnect from "@/app/lib/database_mongo/mongodb";
import { Message } from "@/app/lib/database_mongo/models/Message";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { success: false, error: "Conversation ID required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const messages = await Message.find({
      conversationId,
    })
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      {
        conversationId,
        receiverId: user.uid,
        read: false,
      },
      { read: true }
    );

    const formattedMessages = messages.map((msg: any) => ({
      id: msg._id.toString(),
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      content: msg.content,
      timestamp: msg.createdAt,
      read: msg.read,
      isOwn: msg.senderId === user.uid,
    }));

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

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
    const { conversationId, receiverId, content } = body;

    if (!conversationId || !receiverId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    const message = new Message({
      conversationId,
      senderId: user.uid,
      receiverId,
      content,
      read: false,
    });
    await message.save();

    const { Conversation } = await import("@/app/lib/database_mongo/models/Conversation");
    await Conversation.updateOne(
      { _id: conversationId },
      {
        lastMessageId: message._id,
        $inc: { unreadCount: 1 },
        updatedAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: message._id.toString(),
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        timestamp: message.createdAt,
        read: message.read,
        isOwn: true,
      },
    });
  } catch (error: any) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
