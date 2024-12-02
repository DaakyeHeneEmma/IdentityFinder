"use client"

import React, {useState} from "react";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { AuthProvider } from "./auth/AuthContext";

export default function RootLayout({children}: Readonly<{ children: React.ReactNode }>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en" >
      <body suppressHydrationWarning={true}>
        <AuthProvider>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <div className="flex">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <div className="relative flex flex-1 flex-col lg:ml-72.5">
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                   {children}
              </div>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
