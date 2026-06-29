import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  title: string;
};

export function PainelHeader({ title }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [openBell, setOpenBell] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  async function load() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setEmail(u.user.email ?? "");
    const { data } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", u.user.id)
      .maybeSingle();
    setName(data?.full_name ?? u.user.email?.split("@")[0] ?? "");
    setAvatar(data?.avatar_url ?? null);
  }

  useEffect(() => { load(); }, []);

  // Re-fetch when window receives focus (after profile updates)
  useEffect(() => {
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    window.addEventListener("profile:updated", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("profile:updated", onFocus);
    };
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setOpenBell(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const headerCls = "bg-background/95 border-border text-foreground";
  const subTxt = "text-muted-foreground";
  const bellBtn = "hover:bg-muted text-muted-foreground";
  const dropdownCls = "bg-popover border-border text-popover-foreground";

  const initials = (name || email || "?")
    .split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className={`sticky top-0 z-30 backdrop-blur border-b px-5 sm:px-7 py-3 flex items-center justify-between gap-4 ${headerCls}`}>
      <div className="min-w-0 hidden md:block">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className={`text-xs font-mono ${subTxt}`}>Bem-vindo(a), {name || email.split("@")[0] || "—"}</div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setOpenBell((v) => !v)}
            className={`relative grid place-items-center h-9 w-9 rounded-full transition ${bellBtn}`}
            aria-label="Notificações"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-bronze" />
          </button>
          {openBell && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-lg p-4 ${dropdownCls}`}>
              <div className="font-mono text-[10px] uppercase tracking-widest text-bronze mb-2">Notificações</div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-semibold">Bem-vindo à Sena Consulting 👋</div>
                  <p className={`text-xs mt-1 ${subTxt}`}>
                    Que bom ter você aqui! Comece descobrindo onde IA e automação podem destravar resultado no seu negócio.
                  </p>
                </div>
                <Link
                  to="/painel/diagnostico"
                  onClick={() => setOpenBell(false)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-bronze hover:opacity-80"
                >
                  Fazer meu diagnóstico <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar + name */}
        <Link
          to="/painel/perfil"
          className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 transition hover:bg-muted"
        >
          <span className="h-8 w-8 rounded-full bg-bronze text-white grid place-items-center text-xs font-semibold overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium truncate max-w-[140px]">{name || "—"}</span>
            <span className={`text-[11px] truncate max-w-[140px] ${subTxt}`}>{email}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
