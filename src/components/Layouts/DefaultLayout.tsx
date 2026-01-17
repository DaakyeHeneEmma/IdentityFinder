import React from "react";
import Identity from "@/components/Dashboard/Identity";

import Skeleton from "./Skeleton";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Skeleton>
      <Identity />
      {children}
    </Skeleton>
  );
}
