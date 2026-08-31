"use client";

import React, { useMemo } from "react";
import { CalendarDays, CheckCircle2, UserX, Wallet, RefreshCw } from "lucide-react";
import { AppTopbar } from "@/components/shell/AppTopbar";
import { StatTile } from "@/components/shell/StatTile";
import { DataEmpty, DataError, Skeleton } from "@/components/shell/DataState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";
import { formatCurrency } from "@/lib/utils";

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string | null;
  professional: string | null;
  procedure: string | null;
  scheduled_at: string;
  status: "agendado" | "confirmado" | "realizado" | "cancelado" | "faltou";
  value: number | null;
  source: string;
}

interface AppointmentsPayload {
  appointments: Appointment[];
  stats: {
    total: number;
    agendados: number;
    confirmados: number;
    realizados: number;
    faltas: number;
    cancelados: number;
    taxaComparecimento: number;
    receitaPrevista: number;
  };
}

const STATUS_STYLE: Record<Appointment["status"], { label: string; variant: BadgeProps["variant"] }> =
  {
    agendado: { label: "Agendado", variant: "default" },
    confirmado: { label: "Confirmado", variant: "success" },
    realizado: { label: "Realizado", variant: "neutral" },
    cancelado: { label: "Cancelado", variant: "danger" },
    faltou: { label: "Faltou", variant: "warning" },
  };

/** Groups the agenda by calendar day so the list reads like a real schedule. */
function groupByDay(appointments: Appointment[]) {
  const groups = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    const key = new Date(appointment.scheduled_at).toISOString().slice(0, 10);
    groups.set(key, [...(groups.get(key) ?? []), appointment]);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function AgendaPage() {
  const { data, loading, error, reload } = useApi<AppointmentsPayload>("/api/appointments");
  const days = useMemo(() => groupByDay(data?.appointments ?? []), [data]);
  const stats = data?.stats;

  return (
    <>
      <AppTopbar title="Agenda" subtitle="Atendimentos, confirmações e comparecimento" />

      <div className="flex-1 space-y-6 p-8">
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={reload} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {error && <DataError message={error} onRetry={reload} />}

        {!error && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatTile
                label="Atendimentos futuros"
                value={(stats?.agendados ?? 0) + (stats?.confirmados ?? 0)}
                hint={`${stats?.confirmados ?? 0} confirmados`}
                icon={CalendarDays}
                tone="violet"
                loading={loading}
              />
              <StatTile
                label="Receita prevista"
                value={formatCurrency(stats?.receitaPrevista ?? 0)}
                hint="agendados + confirmados"
                icon={Wallet}
                tone="grass"
                loading={loading}
              />
              <StatTile
                label="Comparecimento"
                value={`${stats?.taxaComparecimento ?? 0}%`}
                hint={`${stats?.realizados ?? 0} realizados`}
                icon={CheckCircle2}
                tone="amber"
                loading={loading}
              />
              <StatTile
                label="Faltas e cancelamentos"
                value={(stats?.faltas ?? 0) + (stats?.cancelados ?? 0)}
                hint={`${stats?.faltas ?? 0} faltas`}
                icon={UserX}
                tone={stats && stats.faltas > 0 ? "rose" : "neutral"}
                loading={loading}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Próximos atendimentos</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pb-2">
                {loading ? (
                  <div className="space-y-2 px-6">
                    {[0, 1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-14" />
                    ))}
                  </div>
                ) : days.length === 0 ? (
                  <DataEmpty message="Nenhum atendimento em reactor_appointments. Envie a agenda pela API /api/appointments ou conecte o sistema da clínica." />
                ) : (
                  <div className="divide-y divide-hairline">
                    {days.map(([day, items]) => (
                      <div key={day}>
                        <p className="bg-sunken px-6 py-2 text-2xs font-semibold uppercase tracking-wider text-ink-3">
                          {new Date(`${day}T00:00:00`).toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "2-digit",
                            month: "long",
                          })}
                        </p>
                        <ul className="divide-y divide-hairline">
                          {items.map((appointment) => {
                            const style = STATUS_STYLE[appointment.status];
                            return (
                              <li
                                key={appointment.id}
                                className="flex items-center gap-4 px-6 py-3"
                              >
                                <span className="rx-numeric w-12 shrink-0 text-xs font-semibold text-ink">
                                  {new Date(appointment.scheduled_at).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium text-ink">
                                    {appointment.patient_name}
                                  </p>
                                  <p className="truncate text-2xs text-ink-3">
                                    {[appointment.procedure, appointment.professional]
                                      .filter(Boolean)
                                      .join(" · ") || "—"}
                                  </p>
                                </div>
                                <Badge variant={style.variant}>{style.label}</Badge>
                                <span className="rx-numeric w-24 text-right text-xs font-semibold text-ink">
                                  {appointment.value
                                    ? formatCurrency(Number(appointment.value))
                                    : "—"}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
