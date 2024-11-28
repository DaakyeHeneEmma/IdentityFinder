import React from "react";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";

import { AuthProvider } from "./auth/AuthContext";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" >
      <body suppressHydrationWarning={true}>
        <AuthProvider>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
