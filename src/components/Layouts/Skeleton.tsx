"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SignIn from "@/app/auth/signin/page";
import Loader from "@/components/common/Loader";
import { useAuth } from "@/app/auth/SupabaseAuthContext";

interface SkeletonProps {
  children: React.ReactNode;
}

export default function Skeleton({ children }: SkeletonProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <Loader />;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {user ? (
            <div className="dark:bg-boxdark-2 dark:text-bodydark">
              <div className="flex">
                <Sidebar
                  sidebarOpen={sidebarOpen}
                  setSidebarOpen={setSidebarOpen}
                />
                <div className="relative flex flex-1 flex-col lg:ml-72.5">
                  <Header
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                  />
                  <div className="max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <SignIn />
          )}
        </>
      )}
    </>
  );
}
