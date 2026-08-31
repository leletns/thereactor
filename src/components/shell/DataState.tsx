"use client";

import React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rx-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-soft">
        <AlertTriangle className="h-5 w-5 text-rose" />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">Não foi possível carregar</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-ink-3">{message}</p>
      </div>
      {onRetry && (
        <Button variant="subtle" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function DataEmpty({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sunken">
        <Inbox className="h-5 w-5 text-ink-3" />
      </span>
      <p className="max-w-sm text-xs text-ink-3">{message}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-sunken ${className}`} />;
}
