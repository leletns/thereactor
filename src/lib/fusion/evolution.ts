export interface EvolutionInstance {
  instanceName: string;
  status: "open" | "connecting" | "close";
  qrcode?: string;
  number?: string;
}

export interface SendTextResponse {
  key: { remoteJid: string; fromMe: boolean; id: string };
  message: { conversation: string };
  messageTimestamp: number;
  status: string;
}

export interface SendMediaResponse {
  key: { remoteJid: string; fromMe: boolean; id: string };
  message: object;
  messageTimestamp: number;
  status: string;
}

export interface QRCodeResponse {
  qrcode: string;
  base64: string;
}

export class EvolutionClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL ?? "http://localhost:8080";
    this.apiKey = process.env.EVOLUTION_API_KEY ?? "";
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: this.apiKey,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Evolution API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  async sendText(
    instanceName: string,
    phone: string,
    message: string
  ): Promise<SendTextResponse> {
    const formattedPhone = this.formatPhone(phone);
    return this.request<SendTextResponse>(
      "POST",
      `/message/sendText/${instanceName}`,
      {
        number: formattedPhone,
        text: message,
        delay: 1200,
      }
    );
  }

  async sendMedia(
    instanceName: string,
    phone: string,
    url: string,
    caption: string,
    mediaType: "image" | "video" | "document" | "audio" = "image"
  ): Promise<SendMediaResponse> {
    const formattedPhone = this.formatPhone(phone);
    return this.request<SendMediaResponse>(
      "POST",
      `/message/sendMedia/${instanceName}`,
      {
        number: formattedPhone,
        mediatype: mediaType,
        media: url,
        caption,
        delay: 1200,
      }
    );
  }

  async createInstance(
    name: string,
    webhookUrl?: string
  ): Promise<EvolutionInstance> {
    return this.request<EvolutionInstance>("POST", "/instance/create", {
      instanceName: name,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      webhook: webhookUrl
        ? {
            url: webhookUrl,
            byEvents: true,
            base64: false,
            events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
          }
        : undefined,
    });
  }

  async getQRCode(instanceName: string): Promise<QRCodeResponse> {
    return this.request<QRCodeResponse>(
      "GET",
      `/instance/connect/${instanceName}`
    );
  }

  async getStatus(instanceName: string): Promise<EvolutionInstance> {
    return this.request<EvolutionInstance>(
      "GET",
      `/instance/connectionState/${instanceName}`
    );
  }

  async deleteInstance(instanceName: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(
      "DELETE",
      `/instance/delete/${instanceName}`
    );
  }

  async listInstances(): Promise<EvolutionInstance[]> {
    return this.request<EvolutionInstance[]>("GET", "/instance/fetchInstances");
  }

  async logoutInstance(instanceName: string): Promise<{ status: string }> {
    return this.request<{ status: string }>(
      "DELETE",
      `/instance/logout/${instanceName}`
    );
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("55")) return `${digits}@s.whatsapp.net`;
    if (digits.length === 11 || digits.length === 10)
      return `55${digits}@s.whatsapp.net`;
    return `${digits}@s.whatsapp.net`;
  }
}

export const evolutionClient = new EvolutionClient();
