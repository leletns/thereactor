"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactorSidebar } from "@/components/reactor/ReactorSidebar";
import { ReactorHeader } from "@/components/reactor/ReactorHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <ReactorSidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-[240px] min-h-screen">
        <ReactorHeader />

        {/* Page content */}
        <main className="flex-1 grid-bg relative overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
