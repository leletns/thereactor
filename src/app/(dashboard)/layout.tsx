"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactorSidebar } from "@/components/reactor/ReactorSidebar";
import { ReactorHeader } from "@/components/reactor/ReactorHeader";
import { SupportButton } from "@/components/reactor/SupportButton";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setMobileSidebarOpen(v => !v), []);

  return (
    <div className="min-h-screen flex" style={{ background: "var(--reactor-bg)" }}>

      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="sidebar-overlay lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar: fixed desktop / drawer mobile ── */}
      {/* Desktop */}
      <div className="hidden lg:block">
        <ReactorSidebar onClose={closeSidebar} />
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "tween", duration: 0.22 }}
            className="lg:hidden fixed left-0 top-0 h-full z-40"
            style={{ width: 240 }}
          >
            <ReactorSidebar onClose={closeSidebar} mobile />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px]">
        <ReactorHeader onMenuToggle={toggleSidebar} />

        <main className="flex-1 grid-bg relative overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <SupportButton />
    </div>
  );
}
