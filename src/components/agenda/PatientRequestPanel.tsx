"use client";

import React, { useState } from "react";
import { ClipboardList, Plus, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApi } from "@/lib/hooks/useApi";
import type { ReactorPatientRequest } from "@/lib/fusion/supabase";
import { getRelativeTime } from "@/lib/utils";

const PROCEDIMENTOS = [
  "Consulta de avaliação",
  "Cirurgia de lipedema (LipeDefinition®)",
  "Sublift",
  "Mastopexia",
  "Mamoplastia com prótese",
  "Abdominoplastia",
  "Toxina botulínica",
  "Preenchimento",
  "Outro",
];

const PROFISSIONAIS = [
  "Dr. Rafael Erthal",
  "Dra. Lorena",
  "Leonardo Valadão",
  "Soroterapia",
  "Silvana",
  "Fisioterapia",
];

const emptyForm = {
  patientName: "",
  patientPhone: "",
  patientEmail: "",
  procedure: PROCEDIMENTOS[0],
  professional: PROFISSIONAIS[0],
  preferredAt: "",
  notes: "",
};

/**
 * A AmigoClinic não tem API de escrita confirmada — só os feeds .ics de
 * leitura. Isto não cria o paciente lá de verdade: registra o pedido com
 * tudo que a equipe precisa, pra dar entrada manual na AmigoClinic sem
 * precisar reperguntar nada pra paciente.
 */
export function PatientRequestPanel() {
  const { data, loading, reload } = useApi<{ requests: ReactorPatientRequest[] }>(
    "/api/patient-requests?status=pendente"
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    if (!form.patientName.trim()) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/patient-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.patientName,
          patientPhone: form.patientPhone || undefined,
          patientEmail: form.patientEmail || undefined,
          procedure: form.procedure,
          professional: form.professional,
          preferredAt: form.preferredAt ? new Date(form.preferredAt).toISOString() : undefined,
          notes: form.notes || undefined,
        }),
      });
      const body = await response.json();
      if (body?.ok) {
        setNotice(`Pedido registrado para ${form.patientName}. Falta só dar entrada na AmigoClinic.`);
        setForm(emptyForm);
        setOpen(false);
        reload();
      } else {
        setNotice(body?.error ?? "Falha ao registrar o pedido.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const complete = async (id: string) => {
    await fetch("/api/patient-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "concluido" }),
    });
    reload();
  };

  const requests = data?.requests ?? [];

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-violet-deep" />
          <CardTitle>Pedidos de paciente novo</CardTitle>
        </div>
        <Button size="sm" variant={open ? "ghost" : "default"} onClick={() => setOpen((v) => !v)}>
          {open ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {open ? "Fechar" : "Novo pedido"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-2xs leading-relaxed text-ink-3">
          A AmigoClinic não tem uma API de escrita confirmada, então isto não cria o paciente lá
          sozinho — registra o pedido com todos os dados prontos pra alguém do time dar entrada em
          menos de um minuto, sem precisar reperguntar nada.
        </p>

        {open && (
          <div className="space-y-3 rounded-xl border border-hairline bg-wash/30 p-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={form.patientName}
                onChange={(e) => setForm((f) => ({ ...f, patientName: e.target.value }))}
                placeholder="Nome da paciente *"
                className="rx-field col-span-2 h-9 px-3 text-[13px]"
              />
              <input
                value={form.patientPhone}
                onChange={(e) => setForm((f) => ({ ...f, patientPhone: e.target.value }))}
                placeholder="Telefone / WhatsApp"
                className="rx-field h-9 px-3 text-[13px]"
              />
              <input
                value={form.patientEmail}
                onChange={(e) => setForm((f) => ({ ...f, patientEmail: e.target.value }))}
                placeholder="E-mail"
                className="rx-field h-9 px-3 text-[13px]"
              />
              <select
                value={form.procedure}
                onChange={(e) => setForm((f) => ({ ...f, procedure: e.target.value }))}
                className="rx-field h-9 px-3 text-[13px]"
              >
                {PROCEDIMENTOS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={form.professional}
                onChange={(e) => setForm((f) => ({ ...f, professional: e.target.value }))}
                className="rx-field h-9 px-3 text-[13px]"
              >
                {PROFISSIONAIS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={form.preferredAt}
                onChange={(e) => setForm((f) => ({ ...f, preferredAt: e.target.value }))}
                className="rx-field col-span-2 h-9 px-3 text-[13px]"
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Observações (histórico, preferências, etc.)"
                className="rx-field col-span-2 min-h-[64px] px-3 py-2 text-[13px]"
              />
            </div>
            <Button size="sm" onClick={submit} disabled={submitting || !form.patientName.trim()}>
              {submitting ? "Registrando..." : "Registrar pedido"}
            </Button>
          </div>
        )}

        {notice && (
          <p className="rounded-xl border border-hairline bg-wash/40 px-4 py-3 text-[12px] text-ink-2">
            {notice}
          </p>
        )}

        {!loading && requests.length === 0 && (
          <p className="text-2xs text-ink-3">Nenhum pedido pendente no momento.</p>
        )}

        {requests.length > 0 && (
          <ul className="divide-y divide-hairline rounded-xl border border-hairline">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{r.patient_name}</p>
                  <p className="truncate text-2xs text-ink-3">
                    {[r.procedure, r.professional].filter(Boolean).join(" · ") || "—"}
                    {r.patient_phone ? ` · ${r.patient_phone}` : ""}
                  </p>
                </div>
                <Badge variant="warning">pendente</Badge>
                <span className="text-2xs text-ink-3">{getRelativeTime(r.created_at)}</span>
                <button
                  onClick={() => complete(r.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-pill border border-hairline-strong text-ink-3 transition-colors hover:border-grass hover:text-grass"
                  title="Marcar como concluído na AmigoClinic"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
