import { createFileRoute, Outlet, redirect, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home,
  LineChart,
  LogOut,
  Menu as MenuIcon,
  X,
  User,
  Shield,
  Users,
  Settings,
  LayoutDashboard,
  ArrowLeftRight,
} from "lucide-react";
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

type NavItem = { to: string; label: string; Icon: any; exact?: boolean };

const USER_NAV: NavItem[] = [
  { to: "/painel", label: "Início", Icon: Home, exact: true },
  { to: "/painel/diagnostico", label: "Meu Diagnóstico", Icon: LineChart },
];

const ADMIN_NAV: NavItem[] = [
  { to: "/painel/admin", label: "Visão Geral", Icon: LayoutDashboard, exact: true },
  { to: "/painel/admin/leads", label: "Leads & Diagnósticos", Icon: LineChart },
  { to: "/painel/admin/usuarios", label: "Usuários", Icon: Users },
  { to: "/painel/admin/configuracoes", label: "Configurações", Icon: Settings },
];

function AuthedShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [email, setEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  const inAdmin = pathname.startsWith("/painel/admin");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id;
      setEmail(data.user?.email ?? "");
      if (!uid) return;
      try { await supabase.rpc("claim_seed_admin"); } catch {}
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", uid);
      setIsAdmin((roles ?? []).some((r: any) => r.role === "admin"));
    })();
  }, []);

  // Block non-admins from admin routes
  useEffect(() => {
    if (inAdmin && email && !isAdmin) {
      navigate({ to: "/painel" });
    }
  }, [inAdmin, isAdmin, email, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const NAV = inAdmin ? ADMIN_NAV : USER_NAV;

  // Theme classes
  const shellBg = inAdmin ? "bg-[#0d0d0d] text-zinc-100" : "bg-background text-foreground";
  const sideBg = inAdmin
    ? "bg-[#161616] border-zinc-800 text-zinc-100"
    : "bg-surface border-border text-foreground";
  const mutedTxt = inAdmin ? "text-zinc-500" : "text-muted-foreground";
  const borderC = inAdmin ? "border-zinc-800" : "border-border";
  const hoverBg = inAdmin ? "hover:bg-zinc-800/60" : "hover:bg-muted";
  const activeCls = inAdmin
    ? "bg-bronze/20 text-bronze font-medium"
    : "bg-bronze/10 text-bronze font-medium";

  return (
    <div className={`min-h-screen ${shellBg} font-display flex`}>
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-[260px] border-r flex flex-col transition-transform ${sideBg} ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className={`p-5 border-b flex items-center justify-between ${borderC}`}>
          <Link to={inAdmin ? "/painel/admin" : "/painel"} className="font-semibold text-lg tracking-tight">
            Sena<span className="text-bronze">.</span>
            <span className={`ml-2 text-xs font-mono ${mutedTxt}`}>
              {inAdmin ? "Admin" : "Painel"}
            </span>
          </Link>
          <button onClick={() => setOpen(false)} className={`md:hidden p-1 ${mutedTxt}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {inAdmin && (
          <div className="mx-3 mt-3 rounded-lg border border-bronze/40 bg-bronze/10 px-3 py-2 flex items-center gap-2 text-xs text-bronze">
            <Shield className="h-3.5 w-3.5" /> Modo administrador
          </div>
        )}

        <nav className="p-3 flex-1 space-y-1 overflow-y-auto">
          <div className={`px-3 py-2 text-[10px] uppercase tracking-widest font-mono ${mutedTxt}`}>
            {inAdmin ? "Administração" : "Geral"}
          </div>
          {NAV.map(({ to, label, Icon, exact }) => {
            const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
            return (
              <Link
                key={to}
                to={to as any}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? activeCls : `${hoverBg}`
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className={`p-3 border-t space-y-1 ${borderC}`}>
          {!inAdmin && (
            <Link
              to="/painel/perfil"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                pathname === "/painel/perfil" ? activeCls : hoverBg
              }`}
            >
              <User className="h-4 w-4" /> Perfil
            </Link>
          )}

          {/* Mode toggle */}
          {isAdmin && !inAdmin && (
            <Link
              to="/painel/admin"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${hoverBg}`}
            >
              <Shield className="h-4 w-4" /> Painel Admin
            </Link>
          )}
          {inAdmin && (
            <Link
              to="/painel"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition bg-zinc-800/60 hover:bg-zinc-700/60 text-zinc-100"
            >
              <ArrowLeftRight className="h-4 w-4" /> Painel do Usuário
            </Link>
          )}

          <div className="px-3 pt-2">
            <div className={`text-[10px] uppercase tracking-widest font-mono ${mutedTxt}`}>Logado</div>
            <div className="text-sm truncate">{email || "—"}</div>
          </div>
          <button
            onClick={signOut}
            className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm ${mutedTxt} ${hoverBg} hover:text-current`}
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`md:hidden sticky top-0 z-30 backdrop-blur border-b px-4 py-3 flex items-center justify-between ${
          inAdmin ? "bg-[#0d0d0d]/90 border-zinc-800" : "bg-background/90 border-border"
        }`}>
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
