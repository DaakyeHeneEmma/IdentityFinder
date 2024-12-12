import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:"Identity-Finder",
  description: "Find Your Identity",
};

export default function Home() {
  return ( <DefaultLayout />);
}
