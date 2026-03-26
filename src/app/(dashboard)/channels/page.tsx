"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Wifi,
  WifiOff,
  QrCode,
  CheckCheck,
  Check,
  Settings,
  Plus,
  Bot,
  Zap,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Conversation {
  id: number;
  name: string;
  phone: string;
  lastMsg: string;
  time: string;
  unread: number;
  status: "respondido" | "aguardando" | "bot";
  avatar: string;
}

interface Message {
  id: number;
  text: string;
  fromMe: boolean;
  time: string;
  status: "sent" | "delivered" | "read";
  byBot?: boolean;
}

const CONVERSATIONS: Conversation[] = [
  { id: 1, name: "João Silva", phone: "+55 11 99887-6543", lastMsg: "Quero saber mais sobre o plano Enterprise", time: "10:42", unread: 2, status: "aguardando", avatar: "JS" },
  { id: 2, name: "Ana Costa", phone: "+55 21 98765-4321", lastMsg: "Perfeito, pode agendar a demo?", time: "10:38", unread: 0, status: "respondido", avatar: "AC" },
  { id: 3, name: "Pedro Lima", phone: "+55 31 97654-3210", lastMsg: "Qual o preço do plano Starter?", time: "10:21", unread: 1, status: "bot", avatar: "PL" },
  { id: 4, name: "Maria Santos", phone: "+55 11 96543-2109", lastMsg: "Obrigada pela demonstração!", time: "09:55", unread: 0, status: "respondido", avatar: "MS" },
  { id: 5, name: "Carlos Mendes", phone: "+55 41 95432-1098", lastMsg: "Vocês têm integração com Salesforce?", time: "09:30", unread: 3, status: "aguardando", avatar: "CM" },
];

const MOCK_MESSAGES: Message[] = [
  { id: 1, text: "Olá! Quero saber mais sobre o plano Enterprise do Reactor", fromMe: false, time: "10:38", status: "read" },
  { id: 2, text: "Olá João! Tudo bem? Sou o assistente da lhex systems. Nosso plano Enterprise inclui: todos os 6 agentes de IA, integrações ilimitadas, suporte prioritário e SLA de 99.9%. Posso te contar mais detalhes?", fromMe: true, time: "10:39", status: "read", byBot: true },
  { id: 3, text: "Sim! Quantos usuários incluem? E tem API?", fromMe: false, time: "10:40", status: "read" },
  { id: 4, text: "O Enterprise inclui usuários ilimitados e acesso completo à nossa API (REST + WebSocket). Também oferecemos white-label e deployment on-premise. Gostaria de agendar uma demo com nosso time?", fromMe: true, time: "10:40", status: "read", byBot: true },
  { id: 5, text: "Quero saber mais sobre o plano Enterprise", fromMe: false, time: "10:42", status: "delivered" },
];

const AUTO_RULES = [
  { id: 1, trigger: "Fora do horário", action: "Resposta automática: horário de atendimento", active: true },
  { id: 2, trigger: "Palavra-chave: preço/valor", action: "Enviar tabela de preços + agendar call", active: true },
  { id: 3, trigger: "Novo contato", action: "Boas-vindas + qualificação automática SDR", active: true },
  { id: 4, trigger: "Palavra-chave: suporte", action: "Criar ticket e escalar para CS", active: false },
];

export default function ChannelsPage() {
  const [selectedConv, setSelectedConv] = useState<Conversation>(CONVERSATIONS[0]);
  const [connected, setConnected] = useState(false);
  const [instanceName, setInstanceName] = useState("reactor-main");
  const [showQR, setShowQR] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Canais de Comunicação</h2>
          <p className="text-sm text-white/40">WhatsApp & Integrações — Evolution API</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* WhatsApp Connection */}
        <Card className={connected ? "border-reactor-green/20" : "border-yellow-400/20"}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#25D366]" />
                <CardTitle className="text-sm">WhatsApp Business</CardTitle>
              </div>
              <Badge variant={connected ? "success" : "warning"}>
                {connected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block">Nome da Instância</Label>
              <Input
                value={instanceName}
                onChange={(e) => setInstanceName(e.target.value)}
                className="text-xs h-8"
                disabled={connected}
              />
            </div>

            {!connected && !showQR && (
              <Button
                onClick={() => setShowQR(true)}
                className="w-full"
                size="sm"
                variant="outline"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Gerar QR Code
              </Button>
            )}

            {showQR && !connected && (
              <div className="space-y-2">
                <div className="flex items-center justify-center bg-white rounded-lg p-4 aspect-square max-w-[160px] mx-auto">
                  <div className="w-full h-full bg-[repeating-linear-gradient(0deg,#000_0px,#000_2px,#fff_2px,#fff_4px),repeating-linear-gradient(90deg,#000_0px,#000_2px,#fff_2px,#fff_4px)] opacity-90 rounded" />
                </div>
                <p className="text-[10px] text-white/40 text-center">
                  Escaneie com o WhatsApp do número comercial
                </p>
                <Button
                  onClick={() => { setConnected(true); setShowQR(false); }}
                  size="sm"
                  className="w-full"
                  variant="success"
                >
                  Simular Conexão
                </Button>
              </div>
            )}

            {connected && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-reactor-green/8 border border-reactor-green/15 rounded-lg">
                  <Wifi className="h-4 w-4 text-reactor-green" />
                  <div>
                    <p className="text-[11px] text-reactor-green font-semibold">Online</p>
                    <p className="text-[10px] text-white/40">+55 11 9 9999-9999</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[{ label: "Msgs hoje", value: "247" }, { label: "Respondidas", value: "231" }, { label: "Bot %", value: "94%" }].map((s) => (
                    <div key={s.label} className="bg-reactor-surface rounded-lg p-1.5">
                      <p className="text-sm font-bold text-white">{s.value}</p>
                      <p className="text-[9px] text-white/30">{s.label}</p>
                    </div>
                  ))}
                </div>
                <Button variant="destructive" size="sm" className="w-full" onClick={() => setConnected(false)}>
                  <WifiOff className="h-3.5 w-3.5 mr-2" />
                  Desconectar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Conversas ({CONVERSATIONS.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="divide-y divide-reactor-border">
                {CONVERSATIONS.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors text-left ${selectedConv.id === conv.id ? "bg-reactor-cyan/5" : ""}`}
                  >
                    <div className="h-8 w-8 rounded-full bg-reactor-surface border border-reactor-border flex items-center justify-center text-[10px] font-bold text-white/60 shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-white/80 truncate">{conv.name}</p>
                        <span className="text-[9px] text-white/30">{conv.time}</span>
                      </div>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">{conv.lastMsg}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="h-4 w-4 flex items-center justify-center rounded-full bg-reactor-cyan text-[9px] font-bold text-[#0a0a0f] shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Viewer */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-reactor-surface border border-reactor-border flex items-center justify-center text-[10px] font-bold text-white/60">
                {selectedConv.avatar}
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80">{selectedConv.name}</p>
                <p className="text-[10px] text-white/30">{selectedConv.phone}</p>
              </div>
              <Badge
                variant={selectedConv.status === "respondido" ? "success" : selectedConv.status === "bot" ? "default" : "warning"}
                className="ml-auto text-[9px]"
              >
                {selectedConv.status}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-1 h-48">
            <div className="p-3 space-y-2">
              {MOCK_MESSAGES.map((msg) => (
                <div key={msg.id} className={`flex ${msg.fromMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-[11px] ${
                      msg.fromMe
                        ? "bg-reactor-cyan/15 text-white/80 border border-reactor-cyan/20"
                        : "bg-reactor-surface text-white/70 border border-reactor-border"
                    }`}
                  >
                    {msg.byBot && (
                      <div className="flex items-center gap-1 mb-1">
                        <Bot className="h-2.5 w-2.5 text-reactor-cyan/60" />
                        <span className="text-[9px] text-reactor-cyan/60">Reactor Bot</span>
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-white/20">{msg.time}</span>
                      {msg.fromMe && (
                        msg.status === "read" ? <CheckCheck className="h-2.5 w-2.5 text-reactor-cyan/60" /> : <Check className="h-2.5 w-2.5 text-white/30" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-2 border-t border-reactor-border">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite uma mensagem..."
                className="text-xs h-8"
              />
              <Button size="sm" className="h-8 px-3 shrink-0" disabled={!newMessage.trim()}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Auto-reply Rules */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-reactor-cyan" />
              <CardTitle className="text-sm">Regras de Resposta Automática</CardTitle>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-3.5 w-3.5 mr-2" />
              Nova Regra
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {AUTO_RULES.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 p-3 rounded-lg bg-reactor-surface border border-reactor-border">
                <Switch defaultChecked={rule.active} />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/30 mb-0.5">Gatilho</p>
                    <p className="text-xs text-white/70 font-medium">{rule.trigger}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 mb-0.5">Ação</p>
                    <p className="text-xs text-white/70">{rule.action}</p>
                  </div>
                </div>
                <Badge variant={rule.active ? "success" : "secondary"} className="text-[9px]">
                  {rule.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Evolution API Config */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-white/40" />
            <CardTitle className="text-sm">Configuração Evolution API</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Evolution API URL</Label>
                <Input defaultValue={process.env.NEXT_PUBLIC_EVOLUTION_URL ?? "http://localhost:8080"} className="text-xs h-8 font-mono" placeholder="https://evolution.seudominio.com" />
              </div>
              <div>
                <Label className="text-xs mb-1 block">API Key</Label>
                <Input type="password" defaultValue="••••••••••••••••" className="text-xs h-8 font-mono" />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1 block">Webhook URL</Label>
                <Input defaultValue={`${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/evolution`} className="text-xs h-8 font-mono" readOnly />
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 ${connected ? "bg-reactor-green/8 border-reactor-green/15" : "bg-yellow-400/8 border-yellow-400/15"}`}>
                  {connected ? (
                    <><Wifi className="h-3.5 w-3.5 text-reactor-green" /><span className="text-xs text-reactor-green">API Conectada</span></>
                  ) : (
                    <><AlertCircle className="h-3.5 w-3.5 text-yellow-400" /><span className="text-xs text-yellow-400">API Desconectada</span></>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Testar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
