"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Mail, Phone, ChevronRight } from "lucide-react";
import Link from "next/link";

export function SupportButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="rounded overflow-hidden shadow-lhex-panel"
            style={{
              width: 280,
              background: "var(--reactor-card-bg)",
              border: "1px solid var(--reactor-border-color)",
            }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 border-b"
              style={{
                borderColor: "var(--reactor-border-color)",
                background: "rgba(95,255,215,0.04)",
              }}
            >
              <p className="font-sans text-[13px] font-semibold" style={{ color: "var(--reactor-text)" }}>
                Suporte L.H.E.X Systems
              </p>
              <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--reactor-text-muted)" }}>
                Resposta em até 24h úteis
              </p>
            </div>

            {/* Contact options */}
            <div className="p-3 space-y-2">
              <a
                href="mailto:contato@lhexsystems.com"
                className="flex items-center gap-3 px-3 py-2.5 rounded transition-all group"
                style={{ border: "1px solid var(--reactor-border-color)" }}
                onMouseEnter={e => {
                  (e.currentTarget).style.borderColor = "rgba(95,255,215,0.25)";
                  (e.currentTarget).style.background = "rgba(95,255,215,0.04)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget).style.borderColor = "var(--reactor-border-color)";
                  (e.currentTarget).style.background = "transparent";
                }}
              >
                <div
                  className="h-8 w-8 rounded flex items-center justify-center shrink-0"
                  style={{ background: "rgba(95,255,215,0.08)", border: "1px solid rgba(95,255,215,0.15)" }}
                >
                  <Mail className="h-4 w-4" style={{ color: "#5FFFD7" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold" style={{ color: "var(--reactor-text)" }}>Email</p>
                  <p className="font-mono text-[10px] truncate" style={{ color: "var(--reactor-text-muted)" }}>
                    contato@lhexsystems.com
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--reactor-text-muted)" }} />
              </a>

              <a
                href="tel:+5521987587047"
                className="flex items-center gap-3 px-3 py-2.5 rounded transition-all"
                style={{ border: "1px solid var(--reactor-border-color)" }}
                onMouseEnter={e => {
                  (e.currentTarget).style.borderColor = "rgba(123,47,190,0.3)";
                  (e.currentTarget).style.background = "rgba(123,47,190,0.04)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget).style.borderColor = "var(--reactor-border-color)";
                  (e.currentTarget).style.background = "transparent";
                }}
              >
                <div
                  className="h-8 w-8 rounded flex items-center justify-center shrink-0"
                  style={{ background: "rgba(123,47,190,0.1)", border: "1px solid rgba(123,47,190,0.2)" }}
                >
                  <Phone className="h-4 w-4" style={{ color: "#7B2FBE" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold" style={{ color: "var(--reactor-text)" }}>WhatsApp</p>
                  <p className="font-mono text-[10px]" style={{ color: "var(--reactor-text-muted)" }}>
                    +55 21 98758-7047
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--reactor-text-muted)" }} />
              </a>

              <Link
                href="/suporte"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2 rounded font-mono text-[11px] font-semibold tracking-wide transition-all"
                style={{
                  background: "rgba(95,255,215,0.08)",
                  border: "1px solid rgba(95,255,215,0.2)",
                  color: "#5FFFD7",
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = "rgba(95,255,215,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget).style.background = "rgba(95,255,215,0.08)"; }}
              >
                Ver perguntas frequentes
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full flex items-center justify-center shadow-lhex-glow transition-all"
        style={{
          background: open ? "var(--reactor-card-bg)" : "#5FFFD7",
          border: open ? "1px solid rgba(95,255,215,0.3)" : "none",
          boxShadow: open ? "none" : "0 0 24px rgba(95,255,215,0.4), 0 4px 16px rgba(0,0,0,0.4)",
        }}
        title="Suporte"
        aria-label="Suporte"
      >
        {open
          ? <X className="h-5 w-5" style={{ color: "#5FFFD7" }} />
          : <MessageCircle className="h-5 w-5 text-black" />
        }
      </motion.button>
    </div>
  );
}
