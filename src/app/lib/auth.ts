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
      console.log("No valid Authorization header found");
      return null;
    }

    const idToken = authHeader.substring(7);
    console.log("Received ID token length:", idToken.length);

    // Decode the JWT to get user info
    // Note: This is basic decoding without verification
    // For production, consider implementing proper token verification
    const decoded = decodeJWT(idToken);

    if (!decoded) {
      console.log("Failed to decode JWT token");
      return null;
    }

    if (!decoded.uid || !decoded.email) {
      console.log("JWT missing required fields (uid or email)");
      return null;
    }

    console.log("Successfully authenticated user:", decoded.email);
    return {
      uid: decoded.uid,
      email: decoded.email,
    };
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}

// JWT decoder for Firebase ID tokens
function decodeJWT(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      console.log("Invalid JWT format - expected 3 parts");
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Add proper padding if needed
    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
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
