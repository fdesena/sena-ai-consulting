import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, KeyRound, Check, Camera, LogOut, Lock, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel/perfil")({
  component: PerfilPage,
});

function PerfilPage() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // info form
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [infoErr, setInfoErr] = useState<string | null>(null);

  // password form
  const [cur, setCur] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  // avatar
  const [uploadingAv, setUploadingAv] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setEmail(u.user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", u.user.id)
        .maybeSingle();
      setName(data?.full_name ?? "");
      setAvatar(data?.avatar_url ?? null);
      setLoading(false);
    })();
  }, []);

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault();
    setInfoErr(null);
    setInfoMsg(null);
    setSavingInfo(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setSavingInfo(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: u.user.id, full_name: name }, { onConflict: "id" });
    setSavingInfo(false);
    if (error) setInfoErr(error.message);
    else {
      setInfoMsg("Informações salvas.");
      window.dispatchEvent(new Event("profile:updated"));
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdErr(null);
    setPwdMsg(null);
    if (pwd !== pwd2) {
      setPwdErr("As senhas não coincidem.");
      return;
    }
    setSavingPwd(true);
    // Re-auth with current password to confirm identity
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password: cur });
    if (signErr) {
      setSavingPwd(false);
      setPwdErr("Senha atual incorreta.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSavingPwd(false);
    if (error) setPwdErr(error.message);
    else {
      setPwdMsg("Senha atualizada com sucesso.");
      setCur("");
      setPwd("");
      setPwd2("");
    }
  }

  function pickAvatar() {
    fileRef.current?.click();
  }

  async function onAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setInfoErr("Selecione uma imagem.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setInfoErr("Imagem muito grande (máx 4MB).");
      return;
    }
    setUploadingAv(true);
    setInfoErr(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320, 0.85);
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sessão expirada");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: u.user.id, avatar_url: dataUrl }, { onConflict: "id" });
      if (error) throw error;
      setAvatar(dataUrl);
      window.dispatchEvent(new Event("profile:updated"));
    } catch (err: any) {
      setInfoErr(err?.message ?? "Falha ao enviar foto");
    } finally {
      setUploadingAv(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (loading) return <p className="text-muted-foreground">Carregando…</p>;

  const initials = (name || email || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate({ to: "/painel" })}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm hover:bg-muted mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar ao painel
      </button>

      <h1 className="text-3xl font-semibold">Meu Perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gerencie suas informações pessoais e configurações de conta
      </p>

      <div className="mt-8 grid md:grid-cols-2 gap-5">
        {/* Personal info card */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Informações Pessoais</h2>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-bronze text-white grid place-items-center text-2xl font-semibold overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt="Foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={pickAvatar}
                disabled={uploadingAv}
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-white border border-border text-foreground grid place-items-center shadow hover:bg-muted disabled:opacity-60"
                aria-label="Alterar foto"
              >
                {uploadingAv ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarFile}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Clique no ícone da câmera para alterar sua foto
            </p>
          </div>

          <form onSubmit={saveInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Nome Completo</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-bronze"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <input
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-border bg-muted/60 px-4 py-3 text-sm text-muted-foreground"
                />
                <Lock className="h-3.5 w-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>

            {infoErr && <p className="text-sm text-[#A6492F]">{infoErr}</p>}
            {infoMsg && (
              <p className="text-sm text-[#2D5A3D] inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> {infoMsg}
              </p>
            )}

            <button
              disabled={savingInfo}
              className="w-full rounded-xl bg-gradient-to-r from-[#2D5A3D] to-[#1f4530] px-5 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {savingInfo ? "Salvando…" : "Salvar alterações"}
            </button>
          </form>
        </section>

        {/* Password card */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-5">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Alterar Senha</h2>
          </div>

          <form onSubmit={savePassword} className="space-y-4">
            <Field
              label="Senha Atual"
              type="password"
              value={cur}
              onChange={setCur}
              placeholder="Digite sua senha atual"
            />
            <Field
              label="Nova Senha"
              type="password"
              value={pwd}
              onChange={setPwd}
              placeholder="Digite a nova senha"
              min={6}
            />
            <Field
              label="Confirmar Nova Senha"
              type="password"
              value={pwd2}
              onChange={setPwd2}
              placeholder="Confirme a nova senha"
              min={6}
            />

            {pwdErr && <p className="text-sm text-[#A6492F]">{pwdErr}</p>}
            {pwdMsg && (
              <p className="text-sm text-[#2D5A3D] inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" /> {pwdMsg}
              </p>
            )}

            <button
              disabled={savingPwd}
              className="w-full rounded-xl border border-border bg-background px-5 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"
            >
              {savingPwd ? "Atualizando…" : "Alterar Senha"}
            </button>
          </form>
        </section>
      </div>

      {/* Logout */}
      <section className="mt-5 rounded-2xl border border-border bg-surface p-5 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold">Sair da Conta</h3>
          <p className="text-sm text-muted-foreground">Desconecte-se da sua conta atual</p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 rounded-xl bg-[#A6492F] hover:bg-[#8e3e28] text-white px-5 py-2.5 text-sm font-semibold"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
      </section>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  min,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>
      <input
        type={type}
        required
        minLength={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-bronze"
      />
    </div>
  );
}

function resizeImageToDataUrl(file: File, maxDim: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.onload = () => {
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
