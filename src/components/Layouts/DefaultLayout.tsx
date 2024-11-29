"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import SignIn from "@/app/auth/signin/page";
import Loader from "../common/Loader";
import Identity from "../Dashboard/Identity";

import { useAuth } from "@/app/auth/AuthContext";

export default function DefaultLayout() {
  const { user, loading }: any = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <>
      {loading ? (<Loader />): (
        <>
        {user ? (
          <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="relative flex flex-1 flex-col lg:ml-72.5">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <Identity />
            </div>
          </main>
        </div>
      </div> 
        ): (
          <>
          <SignIn />
          </>
        )}
        </>
      )}
    </>
  );
}
