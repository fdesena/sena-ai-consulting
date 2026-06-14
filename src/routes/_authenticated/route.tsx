import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, LineChart, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedShell,
});

const NAV = [
  { to: "/painel", label: "Início", Icon: Home },
  { to: "/painel/diagnostico", label: "Diagnóstico", Icon: LineChart },
] as const;

function AuthedShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-display flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-[260px] bg-surface border-r border-border flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <Link to="/painel" className="font-semibold text-lg tracking-tight">
            Sena<span className="text-bronze">.</span>
            <span className="ml-2 text-xs text-muted-foreground font-mono">Painel</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden p-1 text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-3 flex-1 space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
            Geral
          </div>
          {NAV.map(({ to, label, Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-bronze/10 text-bronze font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <div className="px-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">Logado</div>
            <div className="text-sm truncate">{email || "—"}</div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <button onClick={() => setOpen(true)} className="p-1"><MenuIcon className="h-5 w-5" /></button>
          <span className="font-semibold">Sena<span className="text-bronze">.</span></span>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-6 sm:p-8">
          <Outlet />
        </main>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} className="fixed inset-0 bg-black/40 z-30 md:hidden" />
      )}
    </div>
  );
}
