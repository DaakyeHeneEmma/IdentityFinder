import { Metadata } from "next";
import Identity from "@/components/Dashboard/Identity";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title:
    "Identity-Finder",
  description: "Find Your Identity",
};

export default function Home() {
  return (
    <>
        <DefaultLayout />
    </>
  );
}
