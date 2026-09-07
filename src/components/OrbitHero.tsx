import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { trackEvent } from "@/lib/track";
import { cn } from "@/lib/utils";
import { AREAS, ITEMS, ORBIT_SANS } from "./orbit-hero-data";
import type { OrbitGlobeHandle } from "./OrbitGlobeScene";

const OrbitGlobeScene = lazy(() => import("./OrbitGlobeScene"));

const monoStyle = { fontFamily: "var(--orbit-mono)" } as const;

export default function OrbitHero() {
  const sceneRef = useRef<OrbitGlobeHandle>(null);
  const currentPanelRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeItem = ITEMS[activeIndex];

  useEffect(() => {
    const el = currentPanelRef.current;
    if (!el) return;
    el.classList.remove("orbit-copy-in");
    void el.offsetWidth;
    el.classList.add("orbit-copy-in");
  }, [activeIndex]);

  return (
    <section id="top" className="orbit-hero">
      <style>{`
        .orbit-hero{ --orbit-ground:#101112; --orbit-ink:#f1f0eb; --orbit-soft:#b2b3b0; --orbit-faint:#8a8c88; --orbit-line:#ffffff19; --orbit-amber:#c9853b; --orbit-orange:#f6a56f; --orbit-sans:${ORBIT_SANS}; --orbit-mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace; background:var(--orbit-ground); color:var(--orbit-ink); font-family:var(--orbit-sans); -webkit-font-smoothing:antialiased; }
        .orbit-hero .orbit-shell{ max-width:1480px; margin:0 auto; padding:0 clamp(22px,5.3vw,88px); }
        .orbit-hero .orbit-grid{ min-height:630px; display:grid; grid-template-columns:.91fr 1.09fr; align-items:center; gap:0; padding:56px 0 24px; }
        .orbit-hero .orbit-intro{ position:relative; z-index:4; max-width:520px; }
        .orbit-hero .orbit-eyebrow{ display:inline-flex; align-items:center; gap:10px; font-family:var(--orbit-mono); font-size:12px; letter-spacing:.13em; text-transform:uppercase; color:var(--orbit-orange); }
        .orbit-hero .orbit-eyebrow:before{ content:''; width:21px; height:1px; background:currentColor; }
        .orbit-hero .orbit-heading{ margin:26px 0 22px; font-size:clamp(42px,4.9vw,68px); font-weight:500; line-height:1.08; letter-spacing:-.045em; text-wrap:balance; }
        .orbit-hero .orbit-heading span{ color:var(--orbit-orange); }
        .orbit-hero .orbit-lede{ font-size:17px; line-height:1.65; color:var(--orbit-soft); max-width:35ch; margin:0; }
        .orbit-hero .orbit-ctas{ margin-top:26px; display:flex; flex-wrap:wrap; gap:12px; }
        .orbit-hero .orbit-btn-solid{ display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; background:var(--orbit-orange); color:#1a1512; padding:14px 26px; font-size:14px; font-weight:600; transition:opacity .2s ease; }
        .orbit-hero .orbit-btn-solid:hover{ opacity:.88; }
        .orbit-hero .orbit-current{ margin-top:38px; max-width:390px; padding-top:23px; border-top:1px solid var(--orbit-line); }
        .orbit-hero .orbit-current-label{ display:flex; align-items:center; gap:10px; font-family:var(--orbit-mono); font-size:12px; color:var(--orbit-faint); }
        .orbit-hero .orbit-current-label b{ color:var(--orbit-orange); font-weight:400; }
        .orbit-hero .orbit-current h2{ font-size:22px; line-height:1.2; letter-spacing:-.025em; font-weight:500; margin:14px 0 10px; }
        .orbit-hero .orbit-current p{ margin:0; font-size:16px; line-height:1.55; color:var(--orbit-soft); min-height:75px; }
        .orbit-hero .orbit-copy-in{ animation:orbit-reveal .4s ease both; }
        @keyframes orbit-reveal{ from{ opacity:.3; transform:translateY(7px); } to{ opacity:1; transform:translateY(0); } }
        .orbit-hero .orbit-scene{ min-width:0; position:relative; }
        .orbit-hero .orbit-stage-canvas{ height:590px; position:relative; isolation:isolate; overflow:hidden; --mx:66%; --my:26%; background:radial-gradient(ellipse at 50% 49%, #cf875815, transparent 62%); }
        .orbit-hero .orbit-stage-canvas:after{ content:''; position:absolute; inset:0; pointer-events:none; z-index:101; background:linear-gradient(0deg, var(--orbit-ground) 0%, transparent 13% 91%, var(--orbit-ground) 100%); }
        .orbit-hero .orbit-world{ position:absolute; inset:0; }
        .orbit-hero .orbit-world canvas{ position:absolute; inset:0; width:100%; height:100%; }
        .orbit-hero .orbit-scene-label{ position:absolute; left:12px; top:12px; z-index:102; display:flex; align-items:center; gap:9px; font-family:var(--orbit-mono); font-size:12px; color:#b3b4b0; }
        .orbit-hero .orbit-scene-label:before{ content:'+'; color:var(--orbit-orange); font-size:18px; }
        .orbit-hero .orbit-axis-label{ position:absolute; right:14px; bottom:29px; z-index:102; font-family:var(--orbit-mono); font-size:12px; color:#8a8c88; letter-spacing:.08em; }
        .orbit-hero .orbit-card{ width:292px; height:178px; position:absolute; left:50%; top:49%; margin:-89px 0 0 -146px; transform-origin:center; will-change:transform,opacity; pointer-events:none; }
        .orbit-hero .orbit-glass{ position:absolute; inset:0; border:1px solid #ffffff45; border-radius:19px; overflow:hidden; background:linear-gradient(120deg, #ffffff14, #ffffff04 45%, #ef985019); box-shadow:inset 0 1px 0 #ffffff6b, inset 0 -1px 0 #f3ad7959, 0 16px 36px #0007; backdrop-filter:blur(18px) saturate(1.15); -webkit-backdrop-filter:blur(18px) saturate(1.15); }
        .orbit-hero .orbit-glass:before{ content:''; position:absolute; inset:0; border-radius:inherit; background:radial-gradient(ellipse at var(--mx) var(--my), #ffdab433, transparent 64%), linear-gradient(136deg, transparent 37%, #ffffff0d 45%, transparent 55%); pointer-events:none; }
        .orbit-hero .orbit-glass:after{ content:''; position:absolute; inset:5px; border:1px solid #ffffff10; border-radius:14px; pointer-events:none; }
        .orbit-hero .orbit-card-content{ position:absolute; inset:0; padding:22px 25px; display:flex; flex-direction:column; justify-content:space-between; pointer-events:none; }
        .orbit-hero .orbit-card-top{ display:flex; align-items:center; justify-content:space-between; color:var(--orbit-orange); }
        .orbit-hero .orbit-card-top svg{ width:27px; height:27px; }
        .orbit-hero .orbit-card-code{ font-family:var(--orbit-mono); font-size:12px; color:#c5b5a7; }
        .orbit-hero .orbit-card-title{ font-size:30px; line-height:1; letter-spacing:-.04em; font-weight:550; color:var(--orbit-ink); }
        .orbit-hero .orbit-card-footer{ display:flex; justify-content:space-between; align-items:center; gap:8px; font-family:var(--orbit-mono); font-size:12px; color:#c7b8aa; }
        .orbit-hero .orbit-card-footer span{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .orbit-hero .orbit-card-footer svg{ width:16px; height:16px; }
        .orbit-hero .orbit-satellite{ position:absolute; left:50%; top:49%; width:57px; height:31px; margin:-15px 0 0 -28px; border-radius:7px; border:1px solid #ffffff31; background:linear-gradient(135deg, #ffffff13, #ffffff02); box-shadow:inset 0 1px 0 #ffffff25; pointer-events:none; will-change:transform,opacity; }
        .orbit-hero .orbit-scene-controls{ position:relative; display:flex; align-items:center; justify-content:center; gap:10px; margin-top:-17px; z-index:110; }
        .orbit-hero .orbit-control{ width:40px; height:40px; border:1px solid var(--orbit-line); background:#181a1b; color:var(--orbit-ink); border-radius:50%; display:grid; place-items:center; transition:border-color .2s, background .2s; }
        .orbit-hero .orbit-control:hover{ border-color:#f6a56f88; background:#232320; }
        .orbit-hero .orbit-control svg{ width:16px; height:16px; }
        .orbit-hero .orbit-counter{ font-family:var(--orbit-mono); font-size:12px; color:#969894; margin:0 14px; min-width:65px; display:inline-block; }
        .orbit-hero .orbit-counter strong{ font-weight:400; color:var(--orbit-ink); }
        .orbit-hero .orbit-motion-label{ font-family:var(--orbit-mono); font-size:12px; color:#a2a3a0; margin-left:3px; }
        .orbit-hero .orbit-selector{ display:grid; grid-template-columns:repeat(4,1fr); gap:0; margin:35px 0 0; border-top:1px solid var(--orbit-line); }
        .orbit-hero .orbit-area{ position:relative; display:flex; align-items:center; gap:14px; background:none; border:none; border-bottom:1px solid var(--orbit-line); text-align:left; padding:23px 16px 24px 0; font-size:14px; color:#9d9e9b; transition:color .2s; }
        .orbit-hero .orbit-area:after{ content:''; position:absolute; top:-1px; left:0; width:100%; height:1px; background:var(--orbit-orange); transform:scaleX(0); transform-origin:left; transition:transform .5s ease; }
        .orbit-hero .orbit-area[aria-pressed=true]{ color:var(--orbit-ink); }
        .orbit-hero .orbit-area[aria-pressed=true]:after{ transform:scaleX(1); }
        .orbit-hero .orbit-area small{ font-family:var(--orbit-mono); font-size:12px; color:#b0a191; }
        .orbit-hero .orbit-area svg{ margin-left:auto; margin-right:28px; width:16px; height:16px; opacity:0; transition:opacity .2s; }
        .orbit-hero .orbit-area[aria-pressed=true] svg{ opacity:1; color:var(--orbit-orange); }
        .orbit-hero .orbit-page-footer{ display:flex; justify-content:space-between; gap:20px; margin:22px 0 28px; color:#8e908c; font-family:var(--orbit-mono); font-size:12px; }
        @media (min-width:1550px){
          .orbit-hero .orbit-grid{ min-height:710px; }
          .orbit-hero .orbit-stage-canvas{ height:670px; }
        }
        @media (max-width:1050px){
          .orbit-hero .orbit-shell{ padding:0 30px; }
          .orbit-hero .orbit-grid{ grid-template-columns:.95fr 1.05fr; }
          .orbit-hero .orbit-stage-canvas{ height:540px; }
          .orbit-hero .orbit-heading{ font-size:clamp(42px,5.3vw,59px); }
          .orbit-hero .orbit-lede{ max-width:30ch; }
          .orbit-hero .orbit-area{ gap:8px; }
          .orbit-hero .orbit-area svg{ margin-right:10px; }
        }
        @media (max-width:760px){
          .orbit-hero .orbit-shell{ padding:0 22px; }
          .orbit-hero .orbit-grid{ grid-template-columns:1fr; padding-top:36px; }
          .orbit-hero .orbit-intro{ max-width:100%; }
          .orbit-hero .orbit-heading{ font-size:clamp(43px,9.6vw,64px); margin-top:21px; max-width:19ch; }
          .orbit-hero .orbit-lede{ max-width:36ch; }
          .orbit-hero .orbit-current{ margin-top:25px; max-width:none; }
          .orbit-hero .orbit-current p{ min-height:50px; }
          .orbit-hero .orbit-stage-canvas{ height:420px; margin-top:23px; }
          .orbit-hero .orbit-scene-label{ top:4px; left:0; }
          .orbit-hero .orbit-axis-label{ right:0; }
          .orbit-hero .orbit-selector{ grid-template-columns:repeat(2,1fr); margin-top:33px; gap:0 18px; }
          .orbit-hero .orbit-area{ padding:19px 0; }
          .orbit-hero .orbit-page-footer{ font-size:12px; line-height:1.6; }
          .orbit-hero .orbit-scene-controls{ margin-top:-8px; }
        }
        @media (prefers-reduced-motion:reduce){
          .orbit-hero *{ transition-duration:.01ms!important; }
        }
        @supports not (backdrop-filter:blur(1px)){
          .orbit-hero .orbit-glass{ background:linear-gradient(125deg, #373531ed, #1b1b1bf5); }
        }
      `}</style>

      <div className="orbit-shell">
        <div className="orbit-grid">
          <div className="orbit-intro">
            <span className="orbit-eyebrow">
              Sena Labs · Estratégia, IA &amp; Software sob medida
            </span>
            <h1 className="orbit-heading">
              Descubra como a Sena Labs <span>te devolve tempo</span> para o que realmente importa.
            </h1>
            <p className="orbit-lede">
              Ferramentas sob medida, agentes inteligentes e dados para decidir melhor.
            </p>
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
            <div className="orbit-current" ref={currentPanelRef}>
              <div className="orbit-current-label">
                <b style={monoStyle}>{String(activeIndex + 1).padStart(2, "0")}</b>
                <span>/</span>
                <span style={monoStyle}>{AREAS[activeItem.area].label}</span>
              </div>
              <h2>{activeItem.short}?</h2>
              <p>{activeItem.result}</p>
            </div>
          </div>

          <div className="orbit-scene">
            {mounted && (
              <Suspense fallback={null}>
                <OrbitGlobeScene ref={sceneRef} onActiveItemChange={setActiveIndex} />
              </Suspense>
            )}
          </div>
        </div>

        <div className="orbit-selector" role="group" aria-label="Explorar soluções por área">
          {AREAS.map((area, a) => (
            <button
              key={area.label}
              type="button"
              className="orbit-area"
              aria-pressed={activeItem.area === a}
              onClick={() => sceneRef.current?.moveToArea(a)}
            >
              <small style={monoStyle}>{String(a + 1).padStart(2, "0")}</small>
              {area.label}
              <ArrowUpRight
                className={cn("h-4 w-4", activeItem.area === a ? "opacity-100" : "opacity-0")}
              />
            </button>
          ))}
        </div>

        <div className="orbit-page-footer">
          <span>Estratégia humana. Tecnologia sob medida.</span>
        </div>
      </div>
    </section>
  );
}
