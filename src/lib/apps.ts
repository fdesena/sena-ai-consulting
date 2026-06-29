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
];

export const APP_SLUGS = APPS.map((a) => a.slug) as [string, ...string[]];

export function getApp(slug: string): AppDef | undefined {
  return APPS.find((a) => a.slug === slug);
}
