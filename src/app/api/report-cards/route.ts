import { NextRequest, NextResponse } from "next/server";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { ReportCardSubmission, ReportCardResponse } from "@/types/reportCard";
import { getUserFromRequest } from "@/app/lib/auth";

// Initialize Firebase on server side using same config as client
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function POST(request: NextRequest) {
   console.log("POST /api/report-cards - Starting request");
  try {
    console.log("POST /api/report-cards - Starting request");

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

    if (!fullName || !phone || !email || !idType || !idDescription) {
      console.log("Missing required fields:", {
        fullName,
        phone,
        email,
        idType,
        idDescription,
      });
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

    console.log("Attempting to add document to Firestore...");
    const docRef = await addDoc(collection(db, "reportCards"), reportCardData);
    console.log("Document added successfully with ID:", docRef.id);

    return NextResponse.json({
      success: true,
      data: { id: docRef.id, ...reportCardData },
    });
  } catch (error) {
    console.error("Error creating report card:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create report card submission",
        details: errorMessage,
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
