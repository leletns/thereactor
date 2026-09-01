"use client";

import React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rx-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <AlertTriangle className="h-5 w-5 text-rose" strokeWidth={1.5} />
      <div>
        <p className="text-[15px] font-medium text-ink">Não foi possível carregar</p>
        <p className="mx-auto mt-1 max-w-md text-[13px] text-ink-2">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function DataEmpty({ message, action }: { message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Inbox className="h-5 w-5 text-ink-3" strokeWidth={1.5} />
      <p className="max-w-sm text-[13px] text-ink-2">{message}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-sunken ${className}`} />;
}
