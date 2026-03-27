import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/auth";
import dbConnect from "@/app/lib/database_mongo/mongodb";
import { ChatMatch } from "@/app/lib/database_mongo/models/ChatMatch";
import { ReportCard } from "@/app/lib/database_mongo/models/ReportCard";
import { FoundCard } from "@/app/lib/database_mongo/models/FoundCard";

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
    const userId = searchParams.get("userId") || user.uid;

    await dbConnect();

    const matches = await ChatMatch.find({
      $or: [
        { reporterId: userId },
        { matchedUserId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formattedMatches = matches.map((match: any) => ({
      id: match._id.toString(),
      reporterId: match.reporterId,
      reporterName: match.reporterName,
      reporterEmail: match.reporterEmail,
      matchedUserId: match.matchedUserId,
      matchedUserName: match.matchedUserName,
      matchedUserEmail: match.matchedUserEmail,
      reportId: match.reportId,
      reportType: match.reportType,
      idType: match.idType,
      description: match.description,
      status: match.status,
      createdAt: match.createdAt,
      isReporter: match.reporterId === user.uid,
    }));

    return NextResponse.json({
      success: true,
      data: formattedMatches,
    });
  } catch (error: any) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch matches" },
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
    const { reportId, reportType, userName, userEmail } = body;

    if (!reportId || !reportType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    let report: any;
    if (reportType === "lost") {
      const found = await ReportCard.findById(reportId).lean();
      report = found;
    } else {
      const found = await FoundCard.findById(reportId).lean();
      report = found;
    }

    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    const potentialMatches = reportType === "lost"
      ? await FoundCard.find({
          idType: report.idType,
          status: "found",
        }).lean()
      : await ReportCard.find({
          idType: report.idType,
          status: "lost",
        }).lean();

    const newMatches = [];

    for (const match of potentialMatches as any[]) {
      const existingMatch = await ChatMatch.findOne({
        reporterId: user.uid,
        matchedUserId: match.userId,
        reportId: reportId,
      });

      if (!existingMatch && match.userId !== user.uid) {
        const chatMatch = new ChatMatch({
          reporterId: user.uid,
          reporterName: userName || "User",
          reporterEmail: userEmail || "",
          matchedUserId: match.userId,
          matchedUserName: match.fullName,
          matchedUserEmail: match.email,
          reportId: reportId,
          reportType,
          idType: report.idType,
          description: report.idDescription,
          status: "pending",
        });
        await chatMatch.save();
        newMatches.push(chatMatch);
      }
    }

    return NextResponse.json({
      success: true,
      data: newMatches.map((m: any) => ({
        id: m._id.toString(),
        matchedUserId: m.matchedUserId,
        matchedUserName: m.matchedUserName,
        matchedUserEmail: m.matchedUserEmail,
        idType: m.idType,
        description: m.description,
        status: m.status,
      })),
    });
  } catch (error: any) {
    console.error("Error creating matches:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create matches" },
      { status: 500 }
    );
  }
}
