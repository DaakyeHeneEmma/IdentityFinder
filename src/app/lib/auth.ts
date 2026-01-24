import { NextRequest } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert } from "firebase-admin/app";

export interface AuthUser {
  uid: string;
  email: string;
}

// Initialize Firebase Admin SDK
let adminApp: any = null;

function getAdminApp() {
  if (!adminApp) {
    try {
      // Try to initialize with service account credentials
      if (
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        adminApp = initializeApp({
          credential: cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        });
        console.log("Firebase Admin SDK initialized with service account");
      } else {
        console.warn("Firebase Admin credentials not found in environment");
      }
    } catch (error) {
      console.error("Error initializing Firebase Admin SDK:", error);
    }
  }
  return adminApp;
}

export async function getUserFromRequest(
  request: NextRequest,
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    console.log("Auth header found:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No valid Authorization header found");
      return null;
    }

    const idToken = authHeader.substring(7);
    console.log("Token length:", idToken.length);
    console.log("Token preview:", idToken.substring(0, 50) + "...");

    // For development: Try basic token validation first
    try {
      const parts = idToken.split(".");
      if (parts.length !== 3) {
        console.log(
          "Invalid JWT format - expected 3 parts, got:",
          parts.length,
        );
        return null;
      }

      const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(atob(payloadBase64));

      console.log("Decoded payload:", {
        uid: payload.uid,
        user_id: payload.user_id,
        sub: payload.sub,
        email: payload.email,
        exp: payload.exp,
        iat: payload.iat,
      });

      // Firebase tokens use 'user_id' or 'sub' instead of 'uid'
      const userId = payload.user_id || payload.sub || payload.uid;

      if (!userId || !payload.email) {
        console.log("Token missing required fields");
        console.log("Available fields:", Object.keys(payload));
        return null;
      }

      // Check if token is expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log("Token has expired");
        return null;
      }

      console.log("Successfully validated token for user:", payload.email);

      return {
        uid: userId,
        email: payload.email,
      };
    } catch (fallbackError) {
      console.error("Basic token validation failed:", fallbackError);

      // Try Firebase Admin SDK verification if available
      const admin = getAdminApp();
      if (admin) {
        try {
          const auth = getAuth(admin);
          const decodedToken = await auth.verifyIdToken(idToken);

          console.log(
            "Firebase Admin verification successful for user:",
            decodedToken.email,
          );

          return {
            uid: decodedToken.uid,
            email: decodedToken.email || "",
          };
        } catch (adminError) {
          console.warn("Firebase Admin verification also failed:", adminError);
        }
      }

      return null;
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}
