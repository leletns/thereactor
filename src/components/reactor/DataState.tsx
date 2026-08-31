"use client";

import React from "react";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when an /api route answers with an error (missing env, DB down, ...). */
export function DataError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-reactor-orange" />
      <div>
        <p className="text-sm font-medium text-white/70">Nao foi possivel carregar os dados</p>
        <p className="mt-1 max-w-md text-xs text-white/40">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

/** Shown when the query succeeded but the table has no rows yet. */
export function DataEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Database className="h-5 w-5 text-white/25" />
      <p className="max-w-md text-xs text-white/40">{message}</p>
    </div>
  );
}
