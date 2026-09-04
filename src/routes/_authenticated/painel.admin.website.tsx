import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BarChart3, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/admin/website")({
  component: WebsiteLayout,
});

function WebsiteLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/painel/admin/website", label: "Tráfego", Icon: BarChart3, exact: true },
    { to: "/painel/admin/website/blogposts", label: "Blog posts", Icon: FileText },
  ];
  return (
    <div className="max-w-6xl mx-auto space-y-6 text-foreground">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
          Administrador
        </span>
        <h1 className="mt-2 text-3xl font-semibold">Website</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe o tráfego do site e gerencie o conteúdo da seção Experiências internacionais.
        </p>
      </div>
      <div className="flex gap-2 border-b border-border">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${active ? "border-bronze text-bronze" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
