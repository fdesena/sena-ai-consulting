import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { UserPlus, Shield, Trash2, RefreshCw, Mail, X, KeyRound } from "lucide-react";
import {
  adminListUsers, adminCreateUser, adminSetUserRole, adminDeleteUser, adminResetPasswordToEmail,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/painel/admin/usuarios")({
  component: AdminUsuarios,
});

type U = {
  id: string; email: string; created_at: string;
  last_sign_in_at: string | null; confirmed: boolean; roles: string[];
};

function AdminUsuarios() {
  const list = useServerFn(adminListUsers);
  const create = useServerFn(adminCreateUser);
  const setRole = useServerFn(adminSetUserRole);
  const del = useServerFn(adminDeleteUser);
  const resetPwd = useServerFn(adminResetPasswordToEmail);

  const [users, setUsers] = useState<U[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [nEmail, setNEmail] = useState("");
  const [nPwd, setNPwd] = useState("");
  const [nRole, setNRole] = useState<"admin" | "user" | "moderator">("user");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const r = await list();
      setUsers(r.users);
    } catch (e: any) { setErr(e?.message ?? "Erro ao carregar"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setErr(null); setMsg(null);
    try {
      await create({ data: { email: nEmail, password: nPwd, role: nRole } });
      setMsg("Usuário criado.");
      setNEmail(""); setNPwd(""); setNRole("user"); setShowNew(false);
      await load();
    } catch (e: any) { setErr(e?.message ?? "Erro ao criar"); }
    finally { setSubmitting(false); }
  }

  async function handleChangeRole(u: U, role: "admin" | "user" | "moderator") {
    try { await setRole({ data: { userId: u.id, role } }); await load(); }
    catch (e: any) { setErr(e?.message ?? "Erro"); }
  }

  async function handleDelete(u: U) {
    if (!confirm(`Excluir ${u.email}? Esta ação é permanente.`)) return;
    try { await del({ data: { userId: u.id } }); await load(); }
    catch (e: any) { setErr(e?.message ?? "Erro"); }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-zinc-100">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">Administrador</span>
          <h1 className="mt-2 text-3xl font-semibold">Usuários</h1>
          <p className="text-sm text-zinc-400">Crie contas, defina papéis e gerencie acessos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#1f1f1f] px-4 py-2.5 text-sm hover:bg-zinc-800">
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
          <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-4 py-2.5 text-sm font-semibold text-white">
            <UserPlus className="h-4 w-4" /> Novo usuário
          </button>
        </div>
      </div>

      {err && <div className="rounded-lg bg-red-950/40 border border-red-900 text-red-300 px-3 py-2.5 text-sm">{err}</div>}
      {msg && <div className="rounded-lg bg-emerald-950/40 border border-emerald-900 text-emerald-300 px-3 py-2.5 text-sm">{msg}</div>}

      <div className="rounded-2xl border border-zinc-800 bg-[#161616] overflow-hidden">
        {loading ? (
          <p className="p-6 text-zinc-500 text-sm">Carregando…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-zinc-500 font-mono border-b border-zinc-800">
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Papel</th>
                <th className="py-3 px-4">Criado</th>
                <th className="py-3 px-4">Último login</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const role = (u.roles.includes("admin") ? "admin" : u.roles[0] ?? "user") as "admin" | "user" | "moderator";
                return (
                  <tr key={u.id} className="border-b border-zinc-900">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        <span>{u.email}</span>
                        {!u.confirmed && <span className="text-[10px] bg-amber-900/40 text-amber-300 px-1.5 py-0.5 rounded">pendente</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={role}
                        onChange={(e) => handleChangeRole(u, e.target.value as any)}
                        className="rounded-lg border border-zinc-700 bg-[#1f1f1f] px-2 py-1 text-xs"
                      >
                        <option value="user">user</option>
                        <option value="moderator">moderator</option>
                        <option value="admin">admin</option>
                      </select>
                      {role === "admin" && <Shield className="inline ml-2 h-3.5 w-3.5 text-bronze" />}
                    </td>
                    <td className="py-3 px-4 font-mono text-[12px] text-zinc-500">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3 px-4 font-mono text-[12px] text-zinc-500">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDelete(u)} className="text-zinc-500 hover:text-red-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4" onClick={() => setShowNew(false)}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={handleCreate}
            className="bg-[#161616] rounded-2xl w-full max-w-md p-6 border border-zinc-800 text-zinc-100 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Novo usuário</h2>
              <button type="button" onClick={() => setShowNew(false)} className="text-zinc-500"><X className="h-5 w-5" /></button>
            </div>
            <input type="email" required value={nEmail} onChange={(e) => setNEmail(e.target.value)} placeholder="E-mail"
              className="w-full rounded-xl border border-zinc-700 bg-[#1f1f1f] px-4 py-2.5 text-sm" />
            <input type="text" required minLength={6} value={nPwd} onChange={(e) => setNPwd(e.target.value)} placeholder="Senha (mín. 6)"
              className="w-full rounded-xl border border-zinc-700 bg-[#1f1f1f] px-4 py-2.5 text-sm" />
            <select value={nRole} onChange={(e) => setNRole(e.target.value as any)}
              className="w-full rounded-xl border border-zinc-700 bg-[#1f1f1f] px-4 py-2.5 text-sm">
              <option value="user">user</option>
              <option value="moderator">moderator</option>
              <option value="admin">admin</option>
            </select>
            <button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-bronze to-[#a36c2e] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {submitting ? "Criando…" : "Criar usuário"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
