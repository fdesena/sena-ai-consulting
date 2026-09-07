import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ITEMS, AREAS, AMBER, ORBIT_SANS } from "./orbit-hero-data";

const OrbitGlobeScene = lazy(() => import("./OrbitGlobeScene"));

const monoStyle = { fontFamily: "var(--orbit-mono)" } as const;

export default function OrbitHero({ headerOffset = 72 }: { headerOffset?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerOffsetRef = useRef(headerOffset);
  const pRef = useRef(0);
  const [slideIdx, setSlideIdx] = useState(-1);
  const [localIdx, setLocalIdx] = useState(0);
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    headerOffsetRef.current = headerOffset;
  }, [headerOffset]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    function readScroll() {
      const rect = track!.getBoundingClientRect();
      const span = track!.offsetHeight - stage!.offsetHeight;
      if (span <= 0) {
        pRef.current = 0;
        return;
      }
      const v = (headerOffsetRef.current - rect.top) / span;
      pRef.current = v < 0 ? 0 : v > 1 ? 1 : v;
    }

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    readScroll();

    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
    };
  }, []);

  const activeItem = ITEMS[activeItemIdx];

  return (
    <section id="top" className="orbit-hero border-b border-border">
      <style>{`
        .orbit-hero{ --orbit-ground:#F8F7F5; --orbit-ink:#1A1916; --orbit-soft:#6E675E; --orbit-faint:#A9A199; --orbit-line:#E7E2D9; --orbit-amber:#C9853B; --orbit-orange:#FC7C34; --orbit-sans:${ORBIT_SANS}; --orbit-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace; background:var(--orbit-ground); color:var(--orbit-ink); font-family:var(--orbit-sans); }
        .orbit-hero .orbit-eyebrow{ display:inline-flex; align-items:center; font-family:var(--orbit-mono); font-size:12.5px; letter-spacing:.14em; text-transform:uppercase; font-weight:700; color:var(--orbit-faint); }
        .orbit-hero .orbit-track{ position:relative; height:780vh; }
        .orbit-hero .orbit-stage{ position:sticky; min-height:600px; display:grid; grid-template-columns:minmax(0,0.86fr) minmax(0,1.14fr); align-items:start; gap:44px; max-width:1180px; margin:0 auto; padding:0 32px; }
        .orbit-hero .orbit-panel{ position:relative; min-width:0; height:min(72vh,560px); margin-top:clamp(8px,5vh,48px); z-index:2; }
        .orbit-hero .orbit-slide{ position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; opacity:0; transform:translateY(14px); pointer-events:none; transition:opacity .5s ease,transform .5s ease; }
        .orbit-hero .orbit-slide.active{ opacity:1; transform:translateY(0); pointer-events:auto; }
        .orbit-hero .orbit-slide-hero h1{ margin:12px 0 0; font-size:clamp(25px,3vw,40px); font-weight:800; letter-spacing:-0.028em; line-height:1.08; text-wrap:balance; max-width:15ch; }
        .orbit-hero .orbit-ctas{ margin-top:26px; display:flex; flex-wrap:wrap; gap:12px; }
        .orbit-hero .orbit-btn-solid{ display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; background:var(--orbit-orange); color:#fff; padding:14px 26px; font-size:14px; font-weight:600; transition:opacity .2s ease; }
        .orbit-hero .orbit-btn-solid:hover{ opacity:.9; }
        .orbit-hero .orbit-area-eyebrow{ font-family:var(--orbit-mono); font-size:11px; letter-spacing:.14em; text-transform:uppercase; font-weight:600; }
        .orbit-hero .orbit-slide-area h2{ margin:10px 0 26px; font-size:clamp(23px,2.7vw,34px); font-weight:800; letter-spacing:-0.026em; line-height:1.1; }
        .orbit-hero .orbit-items{ display:flex; flex-direction:column; gap:22px; }
        .orbit-hero .orbit-item{ display:grid; grid-template-columns:28px minmax(0,1fr); gap:14px; }
        .orbit-hero .orbit-item .n{ font-family:var(--orbit-mono); font-size:12px; color:var(--orbit-faint); padding-top:3px; font-variant-numeric:tabular-nums; }
        .orbit-hero .orbit-item .line{ display:flex; flex-direction:column; gap:5px; font-size:16px; line-height:1.42; color:var(--orbit-ink); }
        .orbit-hero .orbit-item .line b{ font-weight:700; }
        .orbit-hero .orbit-item .line .result{ color:var(--orbit-soft); font-weight:400; }
        .orbit-hero .orbit-progress{ display:flex; gap:6px; margin-top:34px; max-width:160px; }
        .orbit-hero .orbit-progress span{ height:3px; flex:1; background:var(--orbit-line); border-radius:2px; overflow:hidden; position:relative; }
        .orbit-hero .orbit-progress span i{ position:absolute; inset:0; display:block; background:var(--orbit-orange); transition:width .3s ease; }
        .orbit-hero .orbit-stagecanvas{ position:relative; height:100%; min-width:0; display:flex; align-items:center; background:radial-gradient(120% 100% at 55% 42%, #FBFAF8 0%, #EFEAE1 100%); border-radius:24px; overflow:hidden; }
        @media (max-width:860px){
          .orbit-hero .orbit-stage{ grid-template-columns:1fr; grid-template-rows:auto minmax(0,1fr); gap:10px; padding:18px 20px 22px; align-content:start; }
          .orbit-hero .orbit-panel{ height:auto; min-height:280px; order:2; margin-top:0; }
          .orbit-hero .orbit-stagecanvas{ height:40vh; min-height:220px; order:1; }
          .orbit-hero .orbit-slide-hero h1{ max-width:none; font-size:clamp(22px,6vw,30px); }
          .orbit-hero .orbit-item .line{ font-size:14.5px; }
          .orbit-hero .orbit-track{ height:820vh; }
        }
        @media (prefers-reduced-motion:reduce){
          .orbit-hero *{ transition-duration:.01ms!important; }
        }
      `}</style>

      <div ref={trackRef} className="orbit-track">
        <div
          ref={stageRef}
          className="orbit-stage"
          style={{ top: headerOffset, height: `calc(100vh - ${headerOffset}px)` }}
        >
          <div className="orbit-panel">
            <div className={cn("orbit-slide orbit-slide-hero", slideIdx === -1 && "active")}>
              <span className="orbit-eyebrow">
                <span
                  className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full"
                  style={{ background: AMBER }}
                />
                Sena Labs · Estratégia, IA &amp; Software
              </span>
              <h1>Descubra como a Sena Labs te devolve tempo para o que realmente importa.</h1>
              <div className="orbit-ctas">
                <Link
                  to="/diagnostico"
                  onClick={() => trackEvent("click_diagnostico_cta", { source: "orbit_hero" })}
                  className="orbit-btn-solid"
                >
                  Realizar diagnóstico
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {AREAS.map((area, a) => (
              <div
                key={area.label}
                className={cn("orbit-slide orbit-slide-area", slideIdx === a && "active")}
              >
                <span className="orbit-area-eyebrow" style={{ color: area.color }}>
                  {area.label}
                </span>
                <h2>{area.label}</h2>
                <div className="orbit-items">
                  {ITEMS.map(
                    (it, i) =>
                      it.area === a && (
                        <div key={it.tag} className="orbit-item">
                          <span className="n" style={monoStyle}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="line">
                            <b>{it.short}?</b>
                            <span className="result">{it.result}</span>
                          </span>
                        </div>
                      ),
                  )}
                </div>
                <div className="orbit-progress">
                  {[0, 1].map((si) => (
                    <span key={si}>
                      <i style={{ width: slideIdx === a && si <= localIdx ? "100%" : "0%" }} />
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="orbit-stagecanvas">
            {mounted && (
              <Suspense fallback={null}>
                <OrbitGlobeScene
                  pRef={pRef}
                  onSlideChange={setSlideIdx}
                  onLocalChange={setLocalIdx}
                  onActiveItemChange={setActiveItemIdx}
                  onOpenModal={() => setModalOpen(true)}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="text-xl">{activeItem.tag}</DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes de {activeItem.tag}: desafio, solução e resultado.
          </DialogDescription>
          <div className="mt-2 space-y-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Desafio
              </span>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {activeItem.desafio}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Solução
              </span>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {activeItem.solucao}
              </p>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                Resultado
              </span>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {activeItem.result}
              </p>
            </div>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {activeItem.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
