// Deck styles, scoped to .deck-app. Mirrors the original GitHub Pages site,
// but with scroll-snap removed for fluid scrolling.
export const DECK_CSS = `
.deck-app {
  --font-body: 'Bricolage Grotesque', system-ui, sans-serif;
  --font-mono: 'Fragment Mono', 'SF Mono', Consolas, monospace;
  --bg:        #F8F7F4;
  --surface:   #FFFFFF;
  --border:    #E2DDD6;
  --text:      #1A1916;
  --text-dim:  #7A756D;
  --text-muted:#B0AA9F;
  --accent:    #1A1916;
  --accent-2:  #C8853A;
  --accent-3:  #2D5A3D;
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  overflow: hidden;
  height: 100dvh;
  width: 100vw;
  position: fixed;
  inset: 0;
}
.deck-app *, .deck-app *::before, .deck-app *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ─── DECK ENGINE (fluid scroll, no snap) ─── */
.deck { height: 100dvh; overflow-y: auto; scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
.slide { min-height: 100dvh; overflow: hidden; position: relative; display: flex; flex-direction: column; justify-content: center; padding: clamp(40px,6vh,80px) clamp(40px,8vw,120px); isolation: isolate; opacity: 1; transform: none; }
.slide .reveal { opacity: 1; transform: none; transition: opacity .5s cubic-bezier(.16,1,.3,1), transform .5s cubic-bezier(.16,1,.3,1); }
@media(prefers-reduced-motion:reduce){.slide,.slide .reveal{opacity:1;transform:none;transition:none}}

/* ─── TYPOGRAPHY ─── */
.slide__display { font-size: clamp(52px,9vw,112px); font-weight:800; letter-spacing:-3px; line-height:.93; text-wrap:balance; }
.slide__heading { font-size: clamp(28px,4.5vw,52px); font-weight:700; letter-spacing:-1.5px; line-height:1.05; text-wrap:balance; }
.slide__subheading { font-size: clamp(18px,2.5vw,28px); font-weight:600; letter-spacing:-.5px; line-height:1.2; }
.slide__body { font-size: clamp(15px,1.8vw,20px); line-height:1.65; font-weight:400; color:var(--text-dim); text-wrap:pretty; }
.slide__label { font-family:var(--font-mono); font-size:clamp(10px,1.1vw,13px); font-weight:400; text-transform:uppercase; letter-spacing:2px; color:var(--text-muted); }
.slide__subtitle { font-family:var(--font-mono); font-size:clamp(13px,1.5vw,17px); color:var(--text-dim); letter-spacing:.3px; }

/* ─── CHROME ─── */
.deck-progress { position:fixed; top:0; left:0; height:2px; background:var(--accent); z-index:200; transition:width .3s ease; pointer-events:none; }
.deck-dots { position:fixed; right:clamp(16px,2vw,28px); top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:8px; z-index:200; }
.deck-dot { width:6px; height:6px; border-radius:50%; background:var(--text-muted); opacity:.4; border:none; padding:0; cursor:pointer; transition:opacity .2s,transform .2s; }
.deck-dot:hover{opacity:.7}
.deck-dot.active{opacity:1;transform:scale(1.6);background:var(--accent)}
.deck-counter { position:fixed; bottom:clamp(16px,2vh,28px); right:clamp(16px,2vw,28px); font-family:var(--font-mono); font-size:11px; color:var(--text-muted); z-index:200; font-variant-numeric:tabular-nums; }
.deck-hints { position:fixed; bottom:clamp(16px,2vh,28px); left:50%; transform:translateX(-50%); font-family:var(--font-mono); font-size:10px; color:var(--text-muted); opacity:.5; z-index:200; transition:opacity .5s ease; white-space:nowrap; }
.deck-hints.faded{opacity:0;pointer-events:none}

/* ─── LANGUAGE SELECTOR ─── */
.lang-selector { position: fixed; top: clamp(16px,2vh,24px); right: clamp(16px,2vw,28px); z-index: 300; display: flex; gap: 6px; align-items: center; }
.lang-btn { display: flex; align-items: center; gap: 5px; background: rgba(26,25,22,0.07); border: 1px solid rgba(26,25,22,0.12); border-radius: 4px; padding: 4px 9px; cursor: pointer; font-family: var(--font-mono); font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); transition: background .2s, border-color .2s, color .2s; }
.lang-btn:hover { background: rgba(26,25,22,0.12); color: var(--text); }
.lang-btn.active { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.lang-btn svg { width:14px; height:14px; flex-shrink:0; }
body[data-on-dark="true"] .lang-btn { background: rgba(248,247,244,0.08); border-color: rgba(248,247,244,0.14); color: rgba(248,247,244,0.55); }
body[data-on-dark="true"] .lang-btn.active { background: var(--accent-2); border-color: var(--accent-2); color: #fff; }

/* ─── DECO ─── */
.deco-line { display:block; width:48px; height:2px; background:var(--accent); margin-bottom:24px; }
.deco-line--amber{background:var(--accent-2)}
.deco-line--green{background:var(--accent-3)}
.deco-number { font-size:clamp(100px,18vw,220px); font-weight:800; letter-spacing:-6px; line-height:1; color:var(--border); position:absolute; z-index:0; user-select:none; pointer-events:none; }
.tag { display:inline-block; font-family:var(--font-mono); font-size:11px; letter-spacing:1.5px; text-transform:uppercase; padding:5px 10px; border:1px solid var(--border); border-radius:3px; color:var(--text-dim); }
.tag--filled{background:var(--accent);color:var(--bg);border-color:var(--accent)}
.tag--amber{color:var(--accent-2);border-color:var(--accent-2)}
.tag--green{color:var(--accent-3);border-color:var(--accent-3)}

/* ─── LAYOUT ─── */
.split{display:grid;gap:clamp(32px,4vw,64px);align-items:center;height:100%}
.split--50-50{grid-template-columns:1fr 1fr}
.split--40-60{grid-template-columns:2fr 3fr}
.split--60-40{grid-template-columns:3fr 2fr}
.card-grid{display:grid;gap:clamp(12px,1.5vw,18px)}
.card-grid--3{grid-template-columns:repeat(3,1fr)}
.card-grid--5{grid-template-columns:repeat(5,1fr)}

/* ─── COMPONENTS ─── */
.svc-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:clamp(16px,2vw,24px);display:flex;flex-direction:column;gap:10px;position:relative;overflow:hidden}
.svc-card__top{position:absolute;top:0;left:0;right:0;height:3px;border-radius:8px 8px 0 0}
.svc-card__icon{width:clamp(20px,2.2vw,26px);height:clamp(20px,2.2vw,26px);color:var(--text)}
.svc-card__title{font-size:clamp(13px,1.4vw,16px);font-weight:700;letter-spacing:-.3px;line-height:1.2}
.svc-card__desc{font-size:clamp(11px,1.1vw,13px);color:var(--text-dim);line-height:1.5;font-family:var(--font-mono)}
.case-block{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:clamp(16px,2vw,28px)}
.case-result{display:flex;align-items:center;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border)}
.case-result__value{font-size:clamp(22px,2.8vw,34px);font-weight:800;letter-spacing:-1px;color:var(--accent)}
.case-result__label{font-size:11px;color:var(--text-dim);font-family:var(--font-mono);line-height:1.3;text-transform:uppercase;letter-spacing:1px}
.stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2vw,24px)}
.stat{border-left:2px solid rgba(248,247,244,.12);padding-left:16px}
.stat__val{font-size:clamp(28px,4vw,52px);font-weight:800;letter-spacing:-2px;line-height:1;color:var(--bg)}
.stat__lbl{font-family:var(--font-mono);font-size:10px;color:rgba(248,247,244,.35);text-transform:uppercase;letter-spacing:1.5px;margin-top:6px;line-height:1.4}
.timeline{display:grid;grid-template-columns:repeat(4,1fr);position:relative;margin-top:clamp(24px,4vh,48px)}
.timeline::before{content:'';position:absolute;top:18px;left:18px;right:18px;height:2px;background:var(--border);z-index:0}
.timeline-step{display:flex;flex-direction:column;gap:12px;padding:0 16px 0 0;position:relative;z-index:1}
.timeline-step__dot{width:36px;height:36px;border-radius:50%;background:var(--surface);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-family:var(--font-mono);font-size:12px;font-weight:600;color:var(--accent);flex-shrink:0}
.timeline-step__body{margin-top:8px}
.timeline-step__title{font-size:clamp(13px,1.4vw,16px);font-weight:700;letter-spacing:-.3px;margin-bottom:4px}
.timeline-step__desc{font-size:clamp(11px,1.1vw,13px);color:var(--text-dim);line-height:1.5;font-family:var(--font-mono)}
.bullet-list{list-style:none;display:flex;flex-direction:column;gap:clamp(10px,1.2vh,16px)}
.bullet-list li{display:flex;align-items:flex-start;gap:12px;font-size:clamp(14px,1.6vw,18px);line-height:1.5;color:var(--text-dim)}
.bullet-list li::before{content:'—';color:var(--text-muted);font-family:var(--font-mono);flex-shrink:0;margin-top:1px}
.bullet-list li strong{color:var(--text);font-weight:600}

/* ─── SLIDE THEMES ─── */
.slide--dark{background:var(--text);color:var(--bg)}
.slide--dark .slide__display{color:var(--bg)}
.slide--dark .slide__heading{color:var(--bg)}
.slide--dark .slide__subheading{color:var(--bg)}
.slide--dark .slide__body{color:rgba(248,247,244,.7)}
.slide--dark .slide__label{color:rgba(248,247,244,.45)}
.slide--dark .slide__subtitle{color:rgba(248,247,244,.45)}
.slide--light{background:var(--surface)}
.slide--warm{background:var(--bg)}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(248,247,244,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(248,247,244,.04) 1px,transparent 1px);background-size:60px 60px;z-index:0;pointer-events:none}
.title-panel{position:absolute;right:0;top:0;bottom:0;width:33%;background:rgba(248,247,244,.03);border-left:1px solid rgba(248,247,244,.07);z-index:0}
.title-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(248,247,244,.07);border:1px solid rgba(248,247,244,.12);border-radius:4px;padding:6px 12px;font-family:var(--font-mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(248,247,244,.55);margin-bottom:clamp(20px,3vh,32px)}
.title-badge::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--accent-2);display:block}
.dark-chip{background:rgba(248,247,244,.07);border:1px solid rgba(248,247,244,.12);border-radius:4px;padding:5px 12px;font-family:var(--font-mono);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(248,247,244,.45)}
.cta-email{font-size:clamp(14px,1.8vw,20px);font-family:var(--font-mono);color:var(--text-dim);border-bottom:1px solid var(--border);padding-bottom:4px;display:inline-block;margin-top:8px}
.cta-divider{width:100%;height:1px;background:var(--border);margin:clamp(24px,4vh,48px) 0}
.slide > *{min-width:0}

/* ─── SVG ICONS ─── */
.icon{display:inline-flex;align-items:center;justify-content:center;width:clamp(22px,2.4vw,28px);height:clamp(22px,2.4vw,28px);flex-shrink:0}
.icon svg{width:100%;height:100%}
.icon--sm svg{width:18px;height:18px}
`;
