import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/auth";
import dbConnect from "@/app/lib/database_mongo/mongodb";
import { ReportCard } from "@/app/lib/database_mongo/models/ReportCard";
import { FoundCard } from "@/app/lib/database_mongo/models/FoundCard";
import { Conversation } from "@/app/lib/database_mongo/models/Conversation";

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
    const reportType = searchParams.get("type");

    await dbConnect();

    const allConversations = await Conversation.find({
      participants: user.uid,
    }).lean();

    const contactedUserIds = new Set(
      allConversations.flatMap((conv: any) => 
        conv.participants.filter((p: string) => p !== user.uid)
      )
    );

    let browseReports: any[] = [];

    const lostReports = await ReportCard.find({
      userId: { $ne: user.uid },
      status: "lost",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const foundReports = await FoundCard.find({
      userId: { $ne: user.uid },
      status: "found",
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const userLostReports = await ReportCard.find({
      userId: user.uid,
    }).lean();
    const userFoundReports = await FoundCard.find({
      userId: user.uid,
    }).lean();

    const userHasLost = userLostReports.length > 0;
    const userHasFound = userFoundReports.length > 0;

    if (userHasLost) {
      browseReports = [
        ...browseReports,
        ...foundReports.map((r: any) => ({
          id: r._id.toString(),
          reportId: r._id.toString(),
          userId: r.userId,
          fullName: r.fullName,
          idType: r.idType,
          description: r.idDescription,
          reportType: "found" as const,
          createdAt: r.createdAt,
          hasConversation: contactedUserIds.has(r.userId),
        })),
      ];
    }

    if (userHasFound) {
      browseReports = [
        ...browseReports,
        ...lostReports.map((r: any) => ({
          id: r._id.toString(),
          reportId: r._id.toString(),
          userId: r.userId,
          fullName: r.fullName,
          idType: r.idType,
          description: r.idDescription,
          reportType: "lost" as const,
          createdAt: r.createdAt,
          hasConversation: contactedUserIds.has(r.userId),
        })),
      ];
    }

    if (!userHasLost && !userHasFound) {
      browseReports = [
        ...foundReports.map((r: any) => ({
          id: r._id.toString(),
          reportId: r._id.toString(),
          userId: r.userId,
          fullName: r.fullName,
          idType: r.idType,
          description: r.idDescription,
          reportType: "found" as const,
          createdAt: r.createdAt,
          hasConversation: contactedUserIds.has(r.userId),
        })),
        ...lostReports.map((r: any) => ({
          id: `lost-${r._id.toString()}`,
          reportId: r._id.toString(),
          userId: r.userId,
          fullName: r.fullName,
          idType: r.idType,
          description: r.idDescription,
          reportType: "lost" as const,
          createdAt: r.createdAt,
          hasConversation: contactedUserIds.has(r.userId),
        })),
      ];
    }

    browseReports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: browseReports.slice(0, 30),
    });
  } catch (error: any) {
    console.error("Error fetching browse reports:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
