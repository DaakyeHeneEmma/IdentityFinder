import { NextRequest } from "next/server";

export interface AuthUser {
  uid: string;
  email: string;
}

export async function getUserFromRequest(
  request: NextRequest,
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.substring(7);

    // For now, we'll decode the JWT without verification for simplicity
    // In production, you should verify the token with Firebase Admin SDK
    const decoded = decodeJWT(idToken);

    if (!decoded || !decoded.uid || !decoded.email) {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

// Simple JWT decoder without verification
// WARNING: This is not secure for production use
// In production, use Firebase Admin SDK to verify tokens
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}
