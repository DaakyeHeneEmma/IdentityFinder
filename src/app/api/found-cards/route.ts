import { NextRequest, NextResponse } from "next/server";
import { FoundCardSubmission, FoundCardResponse } from "@/types/foundCard";
import { getUserFromRequest } from "@/app/lib/auth";
import dbConnect from "@/app/lib/database_mongo/mongodb";
import { FoundCard } from "@/app/lib/database_mongo/models/FoundCard";

export async function POST(request: NextRequest) {
  console.log("POST /api/found-cards - Starting request");
  try {
    const user = await getUserFromRequest(request);
    console.log(
      "User authentication result:",
      user ? `Success: ${user.email}` : "Failed",
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in again.",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    console.log("Request body received:", Object.keys(body));

    const { fullName, phone, email, idType, idDescription, fileDescription } =
      body;

    const requiredFields = [
      "fullName",
      "phone",
      "email",
      "idType",
      "idDescription",
    ];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: `Missing: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const foundCardData = {
      userId: user.uid,
      fullName,
      phone,
      email,
      idType,
      idDescription,
      fileDescription: fileDescription || null,
      status: "found",
    };

    try {
      await dbConnect();
      console.log("Attempting to save document to MongoDB...");

      const newFoundCard = new FoundCard(foundCardData);
      const savedCard = await newFoundCard.save();

      console.log("Document saved successfully with ID:", savedCard._id);

      return NextResponse.json({
        success: true,
        data: {
          id: savedCard._id.toString(),
          ...savedCard.toObject(),
        },
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);

      if (dbError.code === 11000) {
        return NextResponse.json(
          { success: false, error: "Duplicate record found." },
          { status: 409 },
        );
      }

      if (dbError.name === "ValidationError") {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: Object.values(dbError.errors)
              .map((e: any) => e.message)
              .join(", "),
          },
          { status: 400 },
        );
      }

      if (
        dbError.name === "MongoNetworkError" ||
        dbError.name === "MongoTimeoutError"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Database connection failed. Please try again later.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to save data to database",
          details: dbError.message || "Unknown database error",
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Request error:", error);

    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request format. Please check your data.",
        },
        { status: 400 },
      );
    }

    if (
      error.message?.includes("authentication") ||
      error.code === "auth/user-not-found"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed. Please sign in again.",
        },
        { status: 401 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in again.",
        },
        { status: 401 },
      );
    }

    try {
      await dbConnect();
      console.log("Fetching found cards from MongoDB for user:", user.uid);

      const foundCards = await FoundCard.find({ userId: user.uid })
        .sort({ createdAt: -1 })
        .lean();

      const formattedFoundCards: FoundCardSubmission[] = foundCards.map(
        (card: any) => ({
          id: card._id.toString(),
          userId: card.userId,
          fullName: card.fullName,
          phone: card.phone,
          email: card.email,
          idType: card.idType,
          idDescription: card.idDescription,
          fileDescription: card.fileDescription,
          status: card.status,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        }),
      );

      return NextResponse.json({
        success: true,
        data: formattedFoundCards,
      });
    } catch (dbError: any) {
      console.error("Database error during fetch:", dbError);

      if (
        dbError.name === "MongoNetworkError" ||
        dbError.name === "MongoTimeoutError"
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Service temporarily unavailable. Please try again later.",
          },
          { status: 503 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          data: [],
          warning: "Unable to fetch latest data. Please try again later.",
        },
        { status: 200 },
      );
    }
  } catch (error: any) {
    console.error("Request error during GET:", error);

    if (
      error.message?.includes("authentication") ||
      error.code === "auth/user-not-found"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication failed. Please sign in again.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: [],
        warning: "Unable to fetch data at this time.",
      },
      { status: 200 },
    );
  }
}
