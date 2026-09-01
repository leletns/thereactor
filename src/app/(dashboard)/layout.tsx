import React from "react";
import { AppSidebar } from "@/components/shell/AppSidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <AppSidebar />
      <div className="ml-[236px] flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
