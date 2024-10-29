import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Identity from "@/components/Dashboard/Identity";

export const metadata: Metadata = {
  title:
    "Identity-Finder",
  description: "Find Your Identity",
};

export default function Home() {
  return (
    <>
      <DefaultLayout>
        <Identity />
      </DefaultLayout>
    </>
  );
}
