// Catálogo de apps internos da plataforma Sena Consulting.
// Apps ficam ocultos por padrão; o admin concede acesso por usuário
// (tabela user_app_access). Os ícones são resolvidos na sidebar a partir
// do slug, mantendo este registro serializável e seguro para uso no server.

export type AppDef = {
  slug: string;
  name: string;
  to: string;
  description: string;
};

export const APPS: AppDef[] = [
  {
    slug: "jusradar",
    name: "JusRadar",
    to: "/painel/jusradar",
    description: "Radar de jurisprudência com IA.",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    to: "/painel/whatsapp",
    description: "Conecte seu WhatsApp Business para mensagens automatizadas.",
  },
];

export const APP_SLUGS = APPS.map((a) => a.slug) as [string, ...string[]];

export function getApp(slug: string): AppDef | undefined {
  return APPS.find((a) => a.slug === slug);
}

// Ferramentas internas do painel admin (não aparecem na sidebar do cliente).
// Mesmo mecanismo de user_app_access, mas o acesso NUNCA é automático por ser
// admin — precisa ser concedido explicitamente por outro admin, um a um.
export const ADMIN_TOOLS: AppDef[] = [
  {
    slug: "whatsapp_admin",
    name: "WhatsApp (Gestão)",
    to: "/painel/admin/whatsapp",
    description: "Gestão centralizada das conexões WhatsApp dos clientes.",
  },
];

export const ADMIN_TOOL_SLUGS = ADMIN_TOOLS.map((a) => a.slug) as [string, ...string[]];
