import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Shuffle,
  ArrowDownAZ,
  Trash2,
  Upload,
  Download,
  Maximize2,
  Volume2,
  VolumeX,
  Save,
  PartyPopper,
  Sparkles,
  Timer as TimerIcon,
  Hash,
  Palette,
  PawPrint,
} from "lucide-react";
import { ToolShell } from "@/components/ferramentas/ToolShell";
import { Timer } from "@/components/ferramentas/Timer";
import alicerceLogo from "@/assets/alicerce-logo.png";

export const Route = createFileRoute("/ferramentas/roleta")({
  head: () => ({
    meta: [
      { title: "Roleta de Sorteio — Sena Consulting" },
      {
        name: "description",
        content:
          "Roleta de sorteio online e gratuita: cole a lista de nomes, gire e descubra o vencedor. Roda no seu navegador, sem cadastro.",
      },
    ],
  }),
  component: RoletaPage,
});

/* Paleta das fatias — tons da marca (bronze/floresta/tinta) com texto branco. */
const CORES = [
  "#c8853a",
  "#2d5a3d",
  "#a3652a",
  "#3f7a53",
  "#1a1916",
  "#8a6a3d",
  "#4f6b45",
  "#6b4f2a",
];

/* "Modo Alicerce" — paleta preto & dourado extraída de alicerce.club. */
const CORES_ALICERCE = ["#1c1a17", "#e6ac1a", "#3a3630", "#c99413"];
const ALICERCE_PONTEIRO = "#e6ac1a";

const PADRAO = ["Ana", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique"];
const K_ENTRADAS = "sena_roleta_entradas";
const K_LISTAS = "sena_roleta_listas";

/* Listas prontas — atalhos para popular a roleta sem digitar nada. */
const LISTA_CORES = [
  "Vermelho",
  "Azul",
  "Verde",
  "Amarelo",
  "Laranja",
  "Roxo",
  "Rosa",
  "Preto",
  "Branco",
  "Cinza",
  "Marrom",
  "Turquesa",
];
const LISTA_ANIMAIS = [
  "Leão",
  "Tigre",
  "Elefante",
  "Girafa",
  "Zebra",
  "Macaco",
  "Urso",
  "Lobo",
  "Raposa",
  "Coelho",
];
const NUMERICA_MAX_LIMITE = 500;

type Resultado = { nome: string; hora: Date };
type ListaSalva = { nome: string; entradas: string[] };

function RoletaPage() {
  const [entradas, setEntradas] = useState<string[]>(PADRAO);
  const [texto, setTexto] = useState(PADRAO.join("\n"));
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [listas, setListas] = useState<ListaSalva[]>([]);
  const [nomeLista, setNomeLista] = useState("");
  const [numericaMax, setNumericaMax] = useState("100");
  const [duracao, setDuracao] = useState(5);
  const [som, setSom] = useState(true);
  const [removerVencedor, setRemoverVencedor] = useState(false);
  const [girando, setGirando] = useState(false);
  const [vencedor, setVencedor] = useState<string | null>(null);
  const [modoAlicerce, setModoAlicerce] = useState(false);
  const modoAlicerceRef = useRef(modoAlicerce);
  modoAlicerceRef.current = modoAlicerce;
  const [mostrarTemporizador, setMostrarTemporizador] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);
  const rotacao = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const somRef = useRef(som);
  somRef.current = som;

  /* ---------- persistência (só no cliente, para não quebrar a hidratação) ---------- */
  useEffect(() => {
    try {
      const e = JSON.parse(localStorage.getItem(K_ENTRADAS) || "null");
      if (Array.isArray(e) && e.length) {
        setEntradas(e);
        setTexto(e.join("\n"));
      }
      const l = JSON.parse(localStorage.getItem(K_LISTAS) || "[]");
      if (Array.isArray(l)) setListas(l);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(K_ENTRADAS, JSON.stringify(entradas));
    } catch {}
  }, [entradas]);

  function salvarListas(v: ListaSalva[]) {
    setListas(v);
    try {
      localStorage.setItem(K_LISTAS, JSON.stringify(v));
    } catch {}
  }

  /* ---------- som ---------- */
  function ctx() {
    if (!audioRef.current) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      audioRef.current = new AC();
    }
    return audioRef.current!;
  }
  function bip(freq: number, dur = 0.05, vol = 0.08) {
    if (!somRef.current) return;
    try {
      const c = ctx();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(vol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, c.currentTime + dur);
      o.start();
      o.stop(c.currentTime + dur);
    } catch {}
  }
  function fanfarra() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      setTimeout(() => bip(f, 0.3, 0.18), i * 110),
    );
  }

  /* ---------- desenho ---------- */
  const desenhar = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;

    const dpr = window.devicePixelRatio || 1;
    const lado = canvas.clientWidth;
    if (canvas.width !== lado * dpr) {
      canvas.width = lado * dpr;
      canvas.height = lado * dpr;
    }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = lado / 2;
    const cy = lado / 2;
    const r = lado / 2 - 14;
    c.clearRect(0, 0, lado, lado);

    if (entradas.length === 0) {
      c.beginPath();
      c.arc(cx, cy, r, 0, 2 * Math.PI);
      c.fillStyle = "#eeece6";
      c.fill();
      c.strokeStyle = "rgba(26,25,22,.12)";
      c.lineWidth = 2;
      c.stroke();
      c.font = "500 16px 'Bricolage Grotesque', system-ui, sans-serif";
      c.fillStyle = "#6b6a64";
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillText("Adicione participantes", cx, cy);
      return;
    }

    const fatia = (2 * Math.PI) / entradas.length;
    c.save();
    c.translate(cx, cy);
    c.rotate((rotacao.current * Math.PI) / 180);
    entradas.forEach((e, i) => {
      const a0 = i * fatia - Math.PI / 2;
      c.beginPath();
      c.moveTo(0, 0);
      c.arc(0, 0, r, a0, a0 + fatia);
      c.closePath();
      c.fillStyle = (modoAlicerce ? CORES_ALICERCE : CORES)[
        i % (modoAlicerce ? CORES_ALICERCE.length : CORES.length)
      ];
      c.fill();
      c.strokeStyle = "#f8f7f4";
      c.lineWidth = 2;
      c.stroke();

      c.save();
      c.rotate(a0 + fatia / 2);
      c.textAlign = "right";
      c.textBaseline = "middle";
      c.fillStyle = "#ffffff";
      c.font = "600 15px 'Bricolage Grotesque', system-ui, sans-serif";
      const txt = e.length > 16 ? e.slice(0, 16) + "…" : e;
      c.fillText(txt, r - 18, 0);
      c.restore();
    });
    c.restore();

    /* miolo */
    c.beginPath();
    c.arc(cx, cy, lado * 0.11, 0, 2 * Math.PI);
    c.fillStyle = "#f8f7f4";
    c.fill();
    c.strokeStyle = "rgba(26,25,22,.12)";
    c.lineWidth = 2;
    c.stroke();

    /* ponteiro */
    c.beginPath();
    c.moveTo(cx, 22);
    c.lineTo(cx - 13, 0);
    c.lineTo(cx + 13, 0);
    c.closePath();
    c.fillStyle = modoAlicerce ? ALICERCE_PONTEIRO : "#c8853a";
    c.fill();
    c.strokeStyle = "#f8f7f4";
    c.lineWidth = 2;
    c.stroke();
  }, [entradas, modoAlicerce]);

  useEffect(() => {
    desenhar();
    const onResize = () => desenhar();
    window.addEventListener("resize", onResize);
    document.addEventListener("fullscreenchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("fullscreenchange", onResize);
    };
  }, [desenhar]);

  /* ---------- giro ---------- */
  const girar = useCallback(() => {
    if (girando || entradas.length === 0) return;
    setGirando(true);
    setVencedor(null);

    const idx = Math.floor(Math.random() * entradas.length);
    const anguloFatia = 360 / entradas.length;
    const alvoFatia = -idx * anguloFatia - anguloFatia / 2 + 90;
    const voltas = 5 + Math.floor(Math.random() * 5);
    const inicio = rotacao.current;
    const alvo = inicio + voltas * 360 + (alvoFatia - (inicio % 360));
    const ms = duracao * 1000;
    let t0: number | null = null;
    let ultimoTick = 0;

    const frame = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min((ts - t0) / ms, 1);
      rotacao.current = inicio + (alvo - inicio) * (1 - Math.pow(1 - p, 3));
      desenhar();
      const intervalo = Math.max(50, 300 * p);
      if (ts - ultimoTick > intervalo) {
        bip(800 + Math.random() * 400);
        ultimoTick = ts;
      }
      if (p < 1) {
        requestAnimationFrame(frame);
        return;
      }
      rotacao.current = alvo;
      desenhar();
      const nome = entradas[idx];
      setGirando(false);
      setResultados((r) => [{ nome, hora: new Date() }, ...r]);
      setVencedor(nome);
      fanfarra();
      if (removerVencedor) {
        const novas = entradas.filter((_, i) => i !== idx);
        setEntradas(novas);
        setTexto(novas.join("\n"));
      }
    };
    requestAnimationFrame(frame);
  }, [girando, entradas, duracao, removerVencedor, desenhar]);

  /* barra de espaço gira */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo && (alvo.tagName === "TEXTAREA" || alvo.tagName === "INPUT")) return;
      if (e.code === "Space") {
        e.preventDefault();
        girar();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [girar]);

  /* ---------- ações ---------- */
  function aplicarTexto(v: string) {
    setTexto(v);
    setEntradas(
      v
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }
  function aplicarEntradas(v: string[]) {
    setEntradas(v);
    setTexto(v.join("\n"));
  }
  function aplicarNumerica() {
    const max = Math.min(NUMERICA_MAX_LIMITE, Math.max(0, parseInt(numericaMax, 10) || 0));
    aplicarEntradas(Array.from({ length: max + 1 }, (_, i) => String(i)));
  }
  function embaralhar() {
    const v = [...entradas];
    for (let i = v.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [v[i], v[j]] = [v[j], v[i]];
    }
    aplicarEntradas(v);
  }
  function importar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () =>
      aplicarEntradas(
        String(rd.result)
          .split(/\r?\n|,/)
          .map((s) => s.trim())
          .filter(Boolean),
      );
    rd.readAsText(f);
    e.target.value = "";
  }
  function baixarCsv() {
    if (!resultados.length) return;
    const linhas = [["#", "Nome", "Horário"]].concat(
      [...resultados]
        .reverse()
        .map((r, i) => [String(i + 1), r.nome, r.hora.toLocaleString("pt-BR")]),
    );
    const csv = linhas
      .map((l) => l.map((c) => '"' + c.replace(/"/g, '""') + '"').join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    a.download = "sorteio-sena.csv";
    a.click();
  }
  async function telaCheia() {
    try {
      if (!document.fullscreenElement) await palcoRef.current?.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  }

  const btn =
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-foreground/15 px-3.5 py-2 text-sm transition hover:border-foreground/40 disabled:opacity-40";
  const card = "rounded-2xl border border-border bg-card p-6";

  return (
    <ToolShell
      eyebrow="Ferramenta"
      title="Roleta de Sorteio"
      coBrand={modoAlicerce ? { logoSrc: alicerceLogo, name: "Alicerce" } : undefined}
      description="Cole a lista de participantes, gire a roda e descubra o vencedor. Tudo roda no seu navegador — nada é enviado para servidores."
      actions={
        <>
          <button onClick={() => setSom((s) => !s)} className={btn}>
            {som ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {som ? "Som ligado" : "Som desligado"}
          </button>
          <button onClick={telaCheia} className={btn}>
            <Maximize2 className="h-4 w-4" />
            Tela cheia
          </button>
          <button
            onClick={() => setModoAlicerce((v) => !v)}
            className={`${btn} ${
              modoAlicerce
                ? "border-[#1c1a17] bg-[#1c1a17] text-[#e6ac1a] hover:border-[#1c1a17]"
                : ""
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Modo Alicerce
          </button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Coluna esquerda: roda + resultados */}
        <div className="flex flex-col gap-6">
          <div
            ref={palcoRef}
            className={`flex flex-col items-center gap-5 rounded-2xl border p-6 transition-colors [&:fullscreen]:justify-center [&:fullscreen]:bg-background ${
              modoAlicerce ? "border-[#e6ac1a]/50 bg-[#1c1a17]" : "border-border bg-card"
            }`}
          >
            {modoAlicerce && (
              <img src={alicerceLogo} alt="Alicerce" className="h-10 w-auto opacity-95" />
            )}
            <div className="relative w-full max-w-[520px]">
              <canvas
                ref={canvasRef}
                onClick={girar}
                className="aspect-square w-full cursor-pointer drop-shadow-[0_12px_28px_rgba(26,25,22,0.14)]"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  girar();
                }}
                disabled={girando || entradas.length === 0}
                className="absolute left-1/2 top-1/2 grid h-[19%] w-[19%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-lg transition hover:opacity-90 disabled:opacity-50"
              >
                {girando ? "…" : "Girar"}
              </button>
            </div>
            <p
              className={`text-sm ${modoAlicerce ? "text-[#e6ac1a]/80" : "text-muted-foreground"}`}
            >
              Clique na roda ou pressione a barra de espaço para girar
            </p>
          </div>

          <div className={card}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Resultados
              </h2>
              <div className="flex gap-2">
                <button onClick={baixarCsv} disabled={!resultados.length} className={btn}>
                  <Download className="h-4 w-4" />
                  CSV
                </button>
                <button
                  onClick={() => setResultados([])}
                  disabled={!resultados.length}
                  className={btn}
                >
                  <Trash2 className="h-4 w-4" />
                  Limpar
                </button>
              </div>
            </div>
            {resultados.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum sorteio realizado ainda.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {resultados.map((r, i) => (
                  <li
                    key={`${r.nome}-${r.hora.getTime()}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5 text-sm"
                  >
                    <span>
                      <span className="mr-2 font-mono text-xs text-muted-foreground">
                        {resultados.length - i}
                      </span>
                      {r.nome}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.hora.toLocaleTimeString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Coluna direita: entradas, configurações, listas */}
        <div className="flex flex-col gap-6">
          <div className={card}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Participantes — {entradas.length}
            </h2>
            <textarea
              value={texto}
              onChange={(e) => aplicarTexto(e.target.value)}
              spellCheck={false}
              placeholder="Um nome por linha"
              className="min-h-[220px] w-full resize-y rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={embaralhar} className={btn}>
                <Shuffle className="h-4 w-4" />
                Embaralhar
              </button>
              <button
                onClick={() =>
                  aplicarEntradas([...entradas].sort((a, b) => a.localeCompare(b, "pt-BR")))
                }
                className={btn}
              >
                <ArrowDownAZ className="h-4 w-4" />
                Ordenar
              </button>
              <button onClick={() => arquivoRef.current?.click()} className={btn}>
                <Upload className="h-4 w-4" />
                Importar
              </button>
              <button onClick={() => aplicarEntradas([])} className={btn}>
                <Trash2 className="h-4 w-4" />
                Limpar
              </button>
              <input ref={arquivoRef} type="file" accept=".txt,.csv" hidden onChange={importar} />
            </div>
          </div>

          <div className={card}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Configurações
            </h2>
            <p className="mb-2 text-sm text-muted-foreground">Duração do giro</p>
            <div className="flex gap-2">
              {[
                { s: 3, l: "Curta" },
                { s: 5, l: "Média" },
                { s: 8, l: "Longa" },
              ].map(({ s, l }) => (
                <button
                  key={s}
                  onClick={() => setDuracao(s)}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                    duracao === s
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-foreground/40"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={removerVencedor}
                onChange={(e) => setRemoverVencedor(e.target.checked)}
                className="h-4 w-4 accent-[var(--bronze)]"
              />
              Remover o vencedor da roda automaticamente
            </label>
          </div>

          <div className={card}>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Listas salvas
            </h2>

            <p className="mb-2 text-sm text-muted-foreground">Listas prontas</p>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 py-1 pl-3.5 pr-1.5 text-sm">
                <Hash className="h-4 w-4" />
                0–
                <input
                  type="number"
                  min={0}
                  max={NUMERICA_MAX_LIMITE}
                  value={numericaMax}
                  onChange={(e) => setNumericaMax(e.target.value)}
                  className="w-14 rounded-md border border-border bg-background px-1.5 py-0.5 text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={aplicarNumerica}
                  className="rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-medium transition hover:bg-foreground/10"
                >
                  Usar
                </button>
              </div>
              <button onClick={() => aplicarEntradas(LISTA_CORES)} className={btn}>
                <Palette className="h-4 w-4" />
                Cores
              </button>
              <button onClick={() => aplicarEntradas(LISTA_ANIMAIS)} className={btn}>
                <PawPrint className="h-4 w-4" />
                Animais
              </button>
            </div>

            <div className="flex gap-2">
              <input
                value={nomeLista}
                onChange={(e) => setNomeLista(e.target.value)}
                placeholder="Nome da lista"
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                onClick={() => {
                  const n = nomeLista.trim();
                  if (!n || !entradas.length) return;
                  salvarListas([...listas, { nome: n, entradas: [...entradas] }]);
                  setNomeLista("");
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                <Save className="h-4 w-4" />
                Salvar
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {listas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma lista salva ainda.</p>
              ) : (
                listas.map((l, i) => (
                  <div
                    key={`${l.nome}-${i}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                  >
                    <span className="truncate">
                      {l.nome}{" "}
                      <span className="font-mono text-xs text-muted-foreground">
                        ({l.entradas.length})
                      </span>
                    </span>
                    <span className="flex shrink-0 gap-2">
                      <button
                        onClick={() => aplicarEntradas([...l.entradas])}
                        className="text-primary hover:underline"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => salvarListas(listas.filter((_, j) => j !== i))}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Excluir
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              As listas ficam salvas apenas neste navegador.
            </p>
          </div>
        </div>
      </div>

      {/* Temporizador opcional — usar junto com a roleta na mesma tela. */}
      <div className="mt-6">
        {mostrarTemporizador ? (
          <Timer embedded alicerce={modoAlicerce} onRemove={() => setMostrarTemporizador(false)} />
        ) : (
          <button
            onClick={() => setMostrarTemporizador(true)}
            className={`inline-flex items-center gap-2 rounded-full border border-dashed px-5 py-3 text-sm transition ${
              modoAlicerce
                ? "border-[#e6ac1a]/40 text-[#e6ac1a] hover:border-[#e6ac1a]"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <TimerIcon className="h-4 w-4" />
            Adicionar temporizador
          </button>
        )}
      </div>

      {/* Modal do vencedor */}
      {vencedor && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-6"
          onClick={() => setVencedor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl"
          >
            <PartyPopper className="mx-auto h-10 w-10 text-primary" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              O vencedor é
            </p>
            <p className="mt-2 break-words text-3xl font-semibold text-primary">{vencedor}</p>
            <div className="mt-7 flex justify-center gap-3">
              <button
                onClick={() => setVencedor(null)}
                className="rounded-full border border-foreground/15 px-5 py-2.5 text-sm transition hover:border-foreground/40"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setVencedor(null);
                  setTimeout(girar, 60);
                }}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                Girar novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
