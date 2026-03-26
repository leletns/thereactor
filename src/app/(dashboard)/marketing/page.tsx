"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Users,
  TrendingUp,
  DollarSign,
  Bot,
  Wand2,
  Calendar,
  BarChart2,
  CheckCircle2,
  Mail,
  AtSign,
  Link2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MetricCard } from "@/components/reactor/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CAMPAIGN_DATA = [
  { semana: "S1 Mar", instagram: 12400, linkedin: 4200, email: 3100, google: 5800 },
  { semana: "S2 Mar", instagram: 15600, linkedin: 5100, email: 4200, google: 6400 },
  { semana: "S3 Mar", instagram: 18200, linkedin: 6800, email: 3800, google: 7200 },
  { semana: "S4 Mar", instagram: 21500, linkedin: 8400, email: 5600, google: 8900 },
];

const CAMPAIGNS = [
  { id: 1, name: "Lançamento Reactor v2", channel: "Multicanal", status: "ativo", leads: 47, cac: 320, spend: 15040, roi: 340 },
  { id: 2, name: "SaaS B2B — Google Ads", channel: "Google", status: "ativo", leads: 23, cac: 520, spend: 11960, roi: 210 },
  { id: 3, name: "LinkedIn Thought Leadership", channel: "LinkedIn", status: "ativo", leads: 18, cac: 180, spend: 3240, roi: 480 },
  { id: 4, name: "Email Nurturing Q1", channel: "Email", status: "pausado", leads: 31, cac: 95, spend: 2945, roi: 620 },
];

const CONTENT_CALENDAR = [
  { day: "Seg", date: "24", items: ["Post Instagram: Case TechVision", "Email newsletter semanal"] },
  { day: "Ter", date: "25", items: ["LinkedIn: Artigo IA empresarial"] },
  { day: "Qua", date: "26", items: ["Webinar: Reactor Demo Live", "Post Instagram: Behind the scenes"] },
  { day: "Qui", date: "27", items: ["LinkedIn: Resultados do cliente"] },
  { day: "Sex", date: "28", items: ["Instagram Reel: Dicas de IA", "Email: Follow-up leads frios"] },
];

const AI_INSIGHTS = [
  { title: "LinkedIn superando expectativas", content: "ROI de 480% no LinkedIn orgânico. Aumente frequência de posts de 3x/semana para 5x.", color: "#00ff88" },
  { title: "Oportunidade no email marketing", content: "Lista de 2.400 leads inativos. Campanha de reativação pode gerar R$ 48k em 30 dias.", color: "#00f5ff" },
  { title: "CAC acima da meta", content: "Google Ads com CAC de R$ 520 vs meta R$ 350. Revise keywords negativas e CTR dos anúncios.", color: "#fbbf24" },
];

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  Instagram: AtSign, LinkedIn: Link2, Email: Mail, Google: BarChart2, Multicanal: Megaphone,
};

export default function MarketingPage() {
  const [copyBrief, setCopyBrief] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateCopy = async () => {
    if (!copyBrief.trim()) return;
    setGenerating(true);
    setGeneratedCopy("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Gere um copy de marketing completo para: ${copyBrief}\n\nInclua: headline principal, subheadline, 3 bullets de benefícios, CTA e versão curta para Instagram.`,
            },
          ],
          agentRole: "marketing",
        }),
      });

      if (!res.ok || !res.body) throw new Error("Error");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setGeneratedCopy((prev) => prev + parsed.text);
            } catch {}
          }
        }
      }
    } catch {
      setGeneratedCopy("Erro ao gerar copy. Verifique a conexão com a API.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Central de Marketing</h2>
          <p className="text-sm text-white/40">Marketing Agent — Campanhas & Conteúdo</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Alcance Total" value={58300} change={22.4} changeLabel="vs semana" icon={Megaphone} color="orange" />
        <MetricCard title="Engajamento" value={4.8} suffix="%" change={0.7} icon={TrendingUp} color="purple" />
        <MetricCard title="Leads Gerados" value={119} change={18.9} icon={Users} color="cyan" />
        <MetricCard title="CAC Médio" value={284} prefix="R$" change={-12.3} changeLabel="redução" icon={DollarSign} color="green" />
      </div>

      {/* Charts + AI Copy Generator */}
      <div className="grid grid-cols-3 gap-4">
        {/* Campaign Performance */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Performance por Canal — Março</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={CAMPAIGN_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  {[
                    { id: "instagram", color: "#ff6b35" },
                    { id: "linkedin", color: "#00f5ff" },
                    { id: "email", color: "#00ff88" },
                    { id: "google", color: "#8b5cf6" },
                  ].map((g) => (
                    <linearGradient key={g.id} id={`color_${g.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={g.color} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={g.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="semana" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#141428", border: "1px solid #1e1e3a", borderRadius: 8, fontSize: 11 }} labelStyle={{ color: "rgba(255,255,255,0.6)" }} />
                <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }} />
                <Area type="monotone" dataKey="instagram" name="Instagram" stroke="#ff6b35" fill="url(#color_instagram)" strokeWidth={2} />
                <Area type="monotone" dataKey="linkedin" name="LinkedIn" stroke="#00f5ff" fill="url(#color_linkedin)" strokeWidth={2} />
                <Area type="monotone" dataKey="email" name="Email" stroke="#00ff88" fill="url(#color_email)" strokeWidth={2} />
                <Area type="monotone" dataKey="google" name="Google" stroke="#8b5cf6" fill="url(#color_google)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-reactor-orange" />
              <CardTitle className="text-sm">Insights da IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {AI_INSIGHTS.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 rounded-lg border"
                style={{ backgroundColor: `${insight.color}08`, borderColor: `${insight.color}20` }}
              >
                <p className="text-[10px] font-semibold mb-1" style={{ color: insight.color }}>
                  {insight.title}
                </p>
                <p className="text-[10px] text-white/50 leading-relaxed">{insight.content}</p>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Copy Generator + Content Calendar */}
      <div className="grid grid-cols-2 gap-4">
        {/* AI Copy Generator */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-reactor-purple" />
              <CardTitle className="text-sm">Gerador de Copy com IA</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-2 block">Brief da campanha</Label>
              <Textarea
                value={copyBrief}
                onChange={(e) => setCopyBrief(e.target.value)}
                placeholder="Descreva o produto, público-alvo e objetivo da campanha..."
                className="min-h-[80px] text-xs"
              />
            </div>
            <Button
              onClick={generateCopy}
              disabled={generating || !copyBrief.trim()}
              className="w-full"
              size="sm"
            >
              {generating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-3 w-3 border-2 border-[#0a0a0f] border-t-transparent rounded-full" />
                  Gerando copy...
                </span>
              ) : (
                <>
                  <Wand2 className="h-3.5 w-3.5 mr-2" />
                  Gerar Copy
                </>
              )}
            </Button>
            {generatedCopy && (
              <div className="p-3 rounded-lg bg-reactor-surface border border-reactor-border">
                <pre className="text-[11px] text-white/70 whitespace-pre-wrap font-sans leading-relaxed max-h-48 overflow-y-auto">
                  {generatedCopy}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Calendar */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-reactor-cyan" />
              <CardTitle className="text-sm">Calendário de Conteúdo — Semana</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {CONTENT_CALENDAR.map((day) => (
                <div key={day.day} className="flex gap-3">
                  <div className="w-12 shrink-0">
                    <p className="text-[10px] text-white/30 font-medium">{day.day}</p>
                    <p className="text-base font-bold text-white/60">{day.date}</p>
                  </div>
                  <div className="flex-1 space-y-1.5 pt-0.5">
                    {day.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-reactor-green/60 shrink-0" />
                        <span className="text-white/50">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Campanhas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {CAMPAIGNS.map((camp) => {
              const Icon = CHANNEL_ICONS[camp.channel] ?? Megaphone;
              return (
                <div key={camp.id} className="flex items-center gap-4 p-3 rounded-lg bg-reactor-surface border border-reactor-border hover:border-white/10 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-reactor-orange/10 border border-reactor-orange/20 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-reactor-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 font-medium truncate">{camp.name}</p>
                    <p className="text-xs text-white/30">{camp.channel}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-right text-xs">
                    <div>
                      <p className="text-white/30">Leads</p>
                      <p className="text-white/70 font-semibold">{camp.leads}</p>
                    </div>
                    <div>
                      <p className="text-white/30">CAC</p>
                      <p className="text-white/70 font-semibold">R$ {camp.cac}</p>
                    </div>
                    <div>
                      <p className="text-white/30">ROI</p>
                      <p className="text-reactor-green font-semibold">{camp.roi}%</p>
                    </div>
                  </div>
                  <Badge variant={camp.status === "ativo" ? "success" : "secondary"} className="ml-2">
                    {camp.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
