import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/admin/website/blogposts")({
  component: BlogPostsPage,
});

type Post = {
  id?: string;
  title: string;
  context: string | null;
  excerpt: string | null;
  cover_url: string | null;
  link_url: string | null;
  link_label: string | null;
  tag: string | null;
  location: string | null;
  flags: string | null;
  published: boolean;
  sort_order: number;
};

const EMPTY: Post = {
  title: "", context: "", excerpt: "", cover_url: "", link_url: "",
  link_label: "Ver post", tag: "", location: "", flags: "", published: true, sort_order: 0,
};

function BlogPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("blog_posts").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    setPosts((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    setSaving(true); setMsg(null);
    const payload: any = { ...editing };
    let res;
    if (editing.id) {
      res = await supabase.from("blog_posts").update(payload).eq("id", editing.id);
    } else {
      delete payload.id;
      res = await supabase.from("blog_posts").insert(payload);
    }
    setSaving(false);
    if (res.error) { setMsg("Erro: " + res.error.message); return; }
    setEditing(null); setMsg("Salvo!"); await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    await load();
  };

  const togglePublish = async (p: Post) => {
    await supabase.from("blog_posts").update({ published: !p.published }).eq("id", p.id!);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-zinc-400">Posts exibidos na seção "Experiências internacionais" do site.</p>
        <button onClick={() => setEditing({ ...EMPTY })} className="inline-flex items-center gap-2 rounded-full bg-bronze text-black px-4 py-2 text-sm font-semibold hover:opacity-90">
          <Plus className="h-4 w-4" /> Novo post
        </button>
      </div>

      {msg && <div className="rounded-lg border border-zinc-800 bg-[#161616] px-4 py-2 text-sm text-zinc-300">{msg}</div>}

      {editing && (
        <div className="rounded-2xl border border-bronze/40 bg-[#161616] p-6 space-y-4">
          <h3 className="font-semibold">{editing.id ? "Editar post" : "Novo post"}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Título"><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="Tag (ex.: Internacionalização)"><input className={inputCls} value={editing.tag ?? ""} onChange={(e) => setEditing({ ...editing, tag: e.target.value })} /></Field>
            <Field label="Contexto (instituição · cidade)"><input className={inputCls} value={editing.context ?? ""} onChange={(e) => setEditing({ ...editing, context: e.target.value })} /></Field>
            <Field label="Localização"><input className={inputCls} value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} /></Field>
            <Field label="Bandeiras (emoji)"><input className={inputCls} value={editing.flags ?? ""} onChange={(e) => setEditing({ ...editing, flags: e.target.value })} placeholder="🇺🇸 🇧🇷" /></Field>
            <Field label="Ordem"><input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            <Field label="URL da imagem de capa" full><input className={inputCls} value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://..." /></Field>
            <Field label="URL do link (LinkedIn, matéria…)" full><input className={inputCls} value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value })} /></Field>
            <Field label="Texto do link"><input className={inputCls} value={editing.link_label ?? ""} onChange={(e) => setEditing({ ...editing, link_label: e.target.value })} /></Field>
            <Field label="Descrição" full>
              <textarea className={inputCls + " min-h-[90px]"} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </Field>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
            Publicado
          </label>
          <div className="flex gap-2">
            <button disabled={saving} onClick={save} className="inline-flex items-center gap-2 rounded-full bg-bronze text-black px-4 py-2 text-sm font-semibold disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? "Salvando…" : "Salvar"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-full border border-zinc-700 px-4 py-2 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-[#161616] divide-y divide-zinc-800">
        {posts.length === 0 ? (
          <div className="p-6 text-sm text-zinc-500">Nenhum post cadastrado ainda.</div>
        ) : posts.map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            {p.cover_url ? <img src={p.cover_url} alt="" className="h-14 w-20 object-cover rounded-md" /> : <div className="h-14 w-20 bg-zinc-800 rounded-md" />}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{p.title}</div>
              <div className="text-xs text-zinc-500 truncate">{p.context}</div>
            </div>
            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full ${p.published ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-700/40 text-zinc-400"}`}>
              {p.published ? "Publicado" : "Rascunho"}
            </span>
            <button onClick={() => togglePublish(p)} className="text-zinc-400 hover:text-bronze p-2" title="Publicar/despublicar">
              {p.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => setEditing(p)} className="text-xs text-bronze">Editar</button>
            <button onClick={() => remove(p.id!)} className="text-zinc-400 hover:text-red-400 p-2"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2 text-sm text-zinc-100 focus:border-bronze focus:outline-none";

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="block text-xs text-zinc-400 mb-1">{label}</span>
      {children}
    </label>
  );
}
