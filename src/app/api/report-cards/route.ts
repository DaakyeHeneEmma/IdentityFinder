import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import db from "@/app/lib/firestore";
import { ReportCardSubmission, ReportCardResponse } from "@/types/reportCard";
import { getUserFromRequest } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { fullName, phone, email, idType, idDescription, fileDescription } =
      body;

    if (!fullName || !phone || !email || !idType || !idDescription) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const reportCardData = {
      userId: user.uid,
      fullName,
      phone,
      email,
      idType,
      idDescription,
      fileDescription: fileDescription || null,
      status: "lost",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "reportCards"), reportCardData);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...reportCardData },
    });
  } catch (error) {
    console.error("Error creating report card:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create report card submission",
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
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const reportCardsQuery = query(
      collection(db, "reportCards"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(reportCardsQuery);
    const reportCards: ReportCardSubmission[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reportCards.push({
        id: doc.id,
        userId: data.userId,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        idType: data.idType,
        idDescription: data.idDescription,
        fileDescription: data.fileDescription,
        status: data.status,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    return NextResponse.json({
      success: true,
      data: reportCards,
    });
  } catch (error) {
    console.error("Error fetching report cards:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch report cards",
      },
      { status: 500 },
    );
  }
}
