import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Minus,
  Plus,
  Music,
  Upload,
  Timer as TimerIcon,
  X,
} from "lucide-react";

const PRESETS = [1, 3, 5, 10, 15, 30];

function fmt(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const x = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${p(h)}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`;
}

type Props = {
  /** Quando embutido em outra ferramenta (ex.: Roleta), mostra cabeçalho compacto e botão de remover. */
  embedded?: boolean;
  onRemove?: () => void;
  /** Aplica a paleta preto & dourado do Alicerce (segue o "Modo Alicerce" da Roleta). */
  alicerce?: boolean;
};

/**
 * Widget de temporizador — usado standalone em /ferramentas/temporizador e
 * embutido na Roleta de Sorteio (botão "Adicionar temporizador"), pra rodar
 * os dois juntos na mesma tela.
 */
export function Timer({ embedded, onRemove, alicerce }: Props) {
  const [total, setTotal] = useState(300);
  const [restante, setRestante] = useState(300);
  const [rodando, setRodando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [min, setMin] = useState("05");
  const [seg, setSeg] = useState("00");

  const [fonte, setFonte] = useState<"nenhuma" | "youtube" | "arquivo">("nenhuma");
  const [ytUrl, setYtUrl] = useState("");
  const [ytId, setYtId] = useState<string | null>(null);
  const [tocando, setTocando] = useState(false);
  const [volume, setVolume] = useState(30);

  const palcoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const arquivoUrl = useRef<string | null>(null);
  const acRef = useRef<AudioContext | null>(null);

  const acabou = restante === 0;
  const reta = restante > 0 && restante <= 60;

  /* ---------- contagem ---------- */
  useEffect(() => {
    if (!rodando) return;
    const id = setInterval(() => {
      setRestante((r) => {
        if (r <= 1) {
          setRodando(false);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [rodando]);

  /* alerta ao zerar */
  const alerta = useCallback(() => {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!acRef.current) acRef.current = new AC();
      const c = acRef.current;
      [880, 660, 880].forEach((f, i) =>
        setTimeout(() => {
          const o = c.createOscillator();
          const g = c.createGain();
          o.connect(g);
          g.connect(c.destination);
          o.type = "square";
          o.frequency.value = f;
          g.gain.setValueAtTime(0.14, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + 0.35);
          o.start();
          o.stop(c.currentTime + 0.35);
        }, i * 380),
      );
    } catch {}
  }, []);

  const jaAlertou = useRef(false);
  useEffect(() => {
    if (acabou && !jaAlertou.current) {
      jaAlertou.current = true;
      alerta();
    }
    if (!acabou) jaAlertou.current = false;
  }, [acabou, alerta]);

  /* ---------- controles ---------- */
  const alternar = useCallback(() => {
    if (rodando) setRodando(false);
    else if (restante > 0) setRodando(true);
  }, [rodando, restante]);

  const resetar = useCallback(() => {
    setRodando(false);
    setRestante(total);
  }, [total]);

  function definir(segundos: number) {
    setRodando(false);
    setTotal(segundos);
    setRestante(segundos);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo && (alvo.tagName === "INPUT" || alvo.tagName === "SELECT")) return;
      // No modo embutido, o espaço/R controlam a Roleta — não rouba o atalho.
      if (embedded) return;
      if (e.code === "Space") {
        e.preventDefault();
        alternar();
      }
      if (e.key.toLowerCase() === "r") resetar();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [alternar, resetar, embedded]);

  function abrirEdicao() {
    if (rodando || document.fullscreenElement) return;
    setMin(String(Math.floor(restante / 60)).padStart(2, "0"));
    setSeg(String(restante % 60).padStart(2, "0"));
    setEditando(true);
  }
  function confirmarEdicao() {
    const m = Math.max(0, Math.min(99, parseInt(min) || 0));
    const s = Math.max(0, Math.min(59, parseInt(seg) || 0));
    const t = m * 60 + s;
    if (t > 0) definir(t);
    setEditando(false);
  }

  async function telaCheia() {
    try {
      if (!document.fullscreenElement) await palcoRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  }

  /* ---------- música ---------- */
  function extrairYt(u: string) {
    const m = String(u).match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    );
    return m ? m[1] : null;
  }

  function alternarMusica() {
    if (fonte === "youtube") {
      const id = extrairYt(ytUrl);
      if (!id) return;
      setYtId(tocando ? null : id);
      setTocando((v) => !v);
      return;
    }
    const a = audioRef.current;
    if (!a || !a.src) return;
    if (tocando) {
      a.pause();
      setTocando(false);
    } else {
      a.volume = volume / 100;
      a.play().catch(() => {});
      setTocando(true);
    }
  }

  function escolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (arquivoUrl.current) URL.revokeObjectURL(arquivoUrl.current);
    arquivoUrl.current = URL.createObjectURL(f);
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.src = arquivoUrl.current;
    audioRef.current.loop = true;
    setTocando(false);
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (arquivoUrl.current) URL.revokeObjectURL(arquivoUrl.current);
    };
  }, []);

  const pct = total > 0 ? (restante / total) * 100 : 0;
  const corBarra = acabou
    ? "bg-destructive"
    : alicerce
      ? "bg-[#e6ac1a]"
      : reta
        ? "bg-[#c8853a]"
        : "bg-secondary";
  const corRelogio = acabou
    ? "text-destructive animate-pulse"
    : alicerce
      ? "text-[#e6ac1a]"
      : reta
        ? "text-primary"
        : "text-foreground";

  const btn = alicerce
    ? "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-[#e6ac1a]/40 px-4 py-2.5 text-sm text-white/90 transition hover:border-[#e6ac1a] disabled:opacity-40"
    : "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-foreground/15 px-4 py-2.5 text-sm transition hover:border-foreground/40 disabled:opacity-40";
  const btnPrimary = alicerce
    ? "bg-[#e6ac1a] text-[#1c1a17] hover:opacity-90"
    : "bg-primary text-primary-foreground hover:opacity-90";
  const card = alicerce
    ? "rounded-2xl border border-[#e6ac1a]/30 bg-[#1c1a17] p-6 text-white"
    : "rounded-2xl border border-border bg-card p-6";
  const inputCls = alicerce
    ? "border-[#e6ac1a]/30 bg-white/10 text-white placeholder:text-white/40 focus:border-[#e6ac1a]"
    : "border-border bg-background focus:border-primary";
  const mutedCls = alicerce ? "text-white/60" : "text-muted-foreground";

  return (
    <div>
      {embedded && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] ${mutedCls}`}>
            <TimerIcon className="h-3.5 w-3.5" />
            Temporizador
          </h2>
          {onRemove && (
            <button
              onClick={onRemove}
              className={`inline-flex items-center gap-1 text-xs hover:text-destructive ${mutedCls}`}
            >
              <X className="h-3.5 w-3.5" />
              Remover
            </button>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div
          ref={palcoRef}
          className={`flex flex-col items-center justify-center gap-7 rounded-2xl border p-8 transition-colors [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:p-12 ${
            alicerce
              ? "border-[#e6ac1a]/40 bg-[#1c1a17] [&:fullscreen]:bg-[#1c1a17]"
              : "border-border bg-card [&:fullscreen]:bg-background"
          }`}
        >
          <div className="flex w-full max-w-xl items-center justify-end [:fullscreen_&]:hidden">
            <button onClick={telaCheia} className={btn}>
              <Maximize2 className="h-4 w-4" />
              Tela cheia
            </button>
          </div>

          <div className={`h-2.5 w-full max-w-xl overflow-hidden rounded-full ${alicerce ? "bg-white/10" : "bg-muted"}`}>
            <div
              className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${corBarra}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {editando ? (
            <div className="flex items-center gap-3">
              {[
                { v: min, set: setMin },
                { v: seg, set: setSeg },
              ].map(({ v, set }, i) => (
                <div key={i} className="flex items-center gap-3">
                  {i === 1 && <span className="text-4xl font-semibold">:</span>}
                  <input
                    value={v}
                    onChange={(e) => set(e.target.value.replace(/\D/g, "").slice(0, 2))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmarEdicao();
                      if (e.key === "Escape") setEditando(false);
                    }}
                    inputMode="numeric"
                    className={`h-20 w-24 rounded-2xl border text-center font-mono text-4xl outline-none ${inputCls}`}
                  />
                </div>
              ))}
              <button
                onClick={confirmarEdicao}
                className={`rounded-full px-5 py-2.5 text-sm font-medium ${btnPrimary}`}
              >
                OK
              </button>
              <button onClick={() => setEditando(false)} className={btn}>
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={abrirEdicao}
              title="Clique para editar o tempo"
              className={`font-mono text-[clamp(3.5rem,14vw,9rem)] font-bold leading-none tracking-tight transition ${corRelogio} [:fullscreen_&]:text-[min(22vw,18rem)]`}
            >
              {fmt(restante)}
            </button>
          )}

          {acabou && (
            <p className="text-lg font-semibold text-destructive">⏰ Tempo esgotado!</p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setRestante((r) => Math.max(0, r - 60));
                if (!rodando) setTotal((t) => Math.max(60, t - 60));
              }}
              className={btn}
            >
              <Minus className="h-4 w-4" />1 min
            </button>
            <button
              onClick={alternar}
              disabled={restante === 0}
              className={`inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition disabled:opacity-40 ${btnPrimary}`}
            >
              {rodando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {rodando ? "Pausar" : "Iniciar"}
            </button>
            <button onClick={resetar} className={btn}>
              <RotateCcw className="h-4 w-4" />
              Resetar
            </button>
            <button
              onClick={() => {
                setRestante((r) => r + 60);
                if (!rodando) setTotal((t) => t + 60);
              }}
              className={btn}
            >
              <Plus className="h-4 w-4" />1 min
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 [:fullscreen_&]:hidden">
            <span className={`mr-1 text-sm ${mutedCls}`}>Tempo:</span>
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => definir(m * 60)}
                className={`rounded-full border px-3.5 py-2 text-sm transition ${
                  total === m * 60
                    ? btnPrimary + " border-transparent"
                    : alicerce
                      ? "border-white/20 text-white/80 hover:border-[#e6ac1a]"
                      : "border-foreground/15 hover:border-foreground/40"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className={card}>
            <h2 className={`mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] ${mutedCls}`}>
              <Music className="h-3.5 w-3.5" /> Música de fundo
            </h2>
            <select
              value={fonte}
              onChange={(e) => {
                audioRef.current?.pause();
                setTocando(false);
                setYtId(null);
                setFonte(e.target.value as typeof fonte);
              }}
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputCls}`}
            >
              <option value="nenhuma">Sem música</option>
              <option value="youtube">Link do YouTube</option>
              <option value="arquivo">Meu arquivo de áudio</option>
            </select>

            {fonte === "youtube" && (
              <input
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=…"
                className={`mt-3 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${inputCls}`}
              />
            )}

            {fonte === "arquivo" && (
              <label
                className={`mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-sm ${
                  alicerce
                    ? "border-[#e6ac1a]/30 text-white/70 hover:border-[#e6ac1a]"
                    : "border-border text-muted-foreground hover:border-primary"
                }`}
              >
                <Upload className="h-4 w-4" />
                Escolher arquivo
                <input type="file" accept="audio/*" hidden onChange={escolherArquivo} />
              </label>
            )}

            {fonte !== "nenhuma" && (
              <>
                <button
                  onClick={alternarMusica}
                  className={`mt-3 w-full rounded-full px-4 py-2.5 text-sm font-medium transition hover:opacity-90 ${
                    alicerce
                      ? "bg-[#e6ac1a] text-[#1c1a17]"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {tocando ? "Parar música" : "Tocar música"}
                </button>
                {fonte === "arquivo" && (
                  <div className={`mt-3 flex items-center gap-2 text-sm ${mutedCls}`}>
                    🔈
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1 accent-[var(--bronze)]"
                    />
                    🔊
                  </div>
                )}
              </>
            )}

            {ytId && (
              <iframe
                title="Música de fundo"
                width={1}
                height={1}
                allow="autoplay"
                className="h-px w-px opacity-0"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}`}
              />
            )}
          </div>

          {!embedded && (
            <div className={card}>
              <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Atalhos
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">
                    Espaço
                  </kbd>{" "}
                  iniciar / pausar
                </li>
                <li>
                  <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-xs">
                    R
                  </kbd>{" "}
                  resetar
                </li>
                <li>Clique no relógio para editar o tempo</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
