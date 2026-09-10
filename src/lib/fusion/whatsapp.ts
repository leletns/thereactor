/** Configuracao da conexao de WhatsApp via Evolution API. */

/** Nome da instancia na Evolution. Uma por clinica. */
export function instanceName(): string {
  return process.env.EVOLUTION_INSTANCE_NAME || "reactor-main";
}

/** Sem URL e chave nao ha o que conectar. */
export function evolutionConfigured(): boolean {
  return Boolean(process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY);
}
