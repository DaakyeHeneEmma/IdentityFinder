import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/auth";
import dbConnect from "@/app/lib/database_mongo/mongodb";
import { Conversation } from "@/app/lib/database_mongo/models/Conversation";
import { Message } from "@/app/lib/database_mongo/models/Message";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await dbConnect();

    const conversations = await Conversation.find({
      participants: user.uid,
    })
      .sort({ updatedAt: -1 })
      .lean();

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        const otherParticipantId = conv.participants.find(
          (p: string) => p !== user.uid
        );

        const lastMessage = conv.lastMessageId
          ? await Message.findById(conv.lastMessageId).lean()
          : null;

        const messages = await Message.find({
          conversationId: conv._id.toString(),
          receiverId: user.uid,
          read: false,
        }).lean();

        const unreadCount = messages.length;

        return {
          id: conv._id.toString(),
          participantId: otherParticipantId,
          lastMessage: lastMessage
            ? {
                id: lastMessage._id.toString(),
                content: lastMessage.content,
                timestamp: lastMessage.createdAt,
                senderId: lastMessage.senderId,
              }
            : null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedConversations,
    });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch conversations" },
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
    const { matchedUserId, content } = body;

    if (!matchedUserId || !content) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    let conversation = await Conversation.findOne({
      participants: { $all: [user.uid, matchedUserId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [user.uid, matchedUserId],
        unreadCount: 0,
      });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id.toString(),
      senderId: user.uid,
      receiverId: matchedUserId,
      content,
      read: false,
    });
    await message.save();

    conversation.lastMessageId = message._id.toString();
    conversation.unreadCount += 1;
    await conversation.save();

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation._id.toString(),
        messageId: message._id.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}
