import React from "react";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import { Metadata } from "next";
import { AuthProvider } from "./auth/AuthContext";

export const metadata: Metadata = {
  title:"Identity-Finder",
  description: "Find Your Identity",
};

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" >
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
