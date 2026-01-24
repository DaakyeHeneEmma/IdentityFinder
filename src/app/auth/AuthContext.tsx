"use client";

import React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../lib/firebaseConfig";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  getIdToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getIdToken = async (): Promise<string | null> => {
    if (!user) {
      console.log("No user available for ID token");
      return null;
    }
    try {
      console.log("Getting ID token for user:", user.email);
      console.log("User UID:", user.uid);
      console.log("User is authenticated:", !user.isAnonymous);

      const token = await user.getIdToken(true); // Force refresh
      console.log("ID token retrieved successfully, length:", token.length);
      console.log("Token starts with:", token.substring(0, 20));
      return token;
    } catch (error) {
      console.error("Error getting ID token:", error);
      console.error("Error code:", (error as any).code);
      console.error("Error message:", (error as any).message);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
