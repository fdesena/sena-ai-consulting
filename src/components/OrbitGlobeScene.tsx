import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { ITEMS, type IconKey } from "./orbit-hero-data";

const TAU = Math.PI * 2;
const COUNT = ITEMS.length;
const SATELLITE_COUNT = 14;

const wrap = (n: number, length = COUNT) => ((n % length) + length) % length;

function phaseAt(raw: number) {
  const step = Math.floor(raw);
  const fraction = raw - step;
  return step + fraction - 0.1 * Math.sin(fraction * TAU);
}

function project(theta: number, latitude = 0, radius = 1) {
  const r = Math.sqrt(1 - latitude * latitude) * radius;
  const z = Math.cos(theta) * r;
  const x = Math.sin(theta) * r;
  const y = latitude * 1.12 + (1 - z) * 0.26;
  const roll = 0.3;
  const perspective = 3.8 / (3.8 - z);
  return {
    x: (x * Math.cos(roll) + y * Math.sin(roll)) * perspective,
    y: (-x * Math.sin(roll) + y * Math.cos(roll)) * perspective,
    z,
    perspective,
  };
}

function cardPose(index: number, phase: number) {
  const theta = ((phase - index) * TAU) / COUNT;
  const position = project(theta);
  const distance = Math.abs(Math.atan2(Math.sin(theta), Math.cos(theta)));
  const focus = Math.exp(-((distance / 0.35) ** 2));
  return {
    ...position,
    focus,
    scale: 0.21 + 0.1 * ((position.z + 1) / 2) + 0.69 * focus,
    opacity: 0.2 + 0.55 * ((position.z + 1) / 2) + 0.25 * focus,
    rotation: -Math.sin(theta) * 13,
  };
}

const SATELLITES = Array.from({ length: SATELLITE_COUNT }, (_, index) => ({
  latitude: index < 7 ? 0.7 : -0.7,
  longitude: (index % 7) * (TAU / 7) + (index < 7 ? 0.18 : 0.48),
}));

type UiIconKey = "prev" | "next" | "pause" | "play";

const ICON_PATHS: Record<IconKey | UiIconKey, string> = {
  web: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/>',
  video: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
  file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Zm0 0v6h6M8 13h8M8 17h5"/>',
  retention: '<path d="M20 11a8 8 0 1 0-2.3 6M20 4v7h-7"/>',
  agent: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  crm: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9 4v16M15 4v16M5.5 8h1M11.5 11h1M17.5 8h1"/>',
  chart: '<path d="M4 3v18h17M8 16v-5M13 16V6M18 16v-8"/>',
  learn: '<path d="m2 9 10-6 10 6-10 6ZM6 12v6l6 3 6-3v-6M22 9v8"/>',
  prev: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  next: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
};

function svgMarkup(name: IconKey | UiIconKey) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name]}</svg>`;
}

function IconSpan({ name, className }: { name: IconKey | UiIconKey; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: svgMarkup(name) }} />;
}

export type OrbitGlobeHandle = {
  moveToArea: (areaIndex: number) => void;
  focusItem: (itemIndex: number) => void;
  setAutoplayLocked: (locked: boolean) => void;
};

type Props = {
  onActiveItemChange: (index: number) => void;
  onSelectCase: (caseIndex: number) => void;
};

const OrbitGlobeScene = forwardRef<OrbitGlobeHandle, Props>(function OrbitGlobeScene(
  { onActiveItemChange, onSelectCase },
  ref,
) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const satelliteRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pauseButtonRef = useRef<HTMLButtonElement>(null);
  const pauseIconRef = useRef<HTMLSpanElement>(null);
  const motionLabelRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  const reducedRef = useRef(false);
  const pausedRef = useRef(false);
  const scrollLockRef = useRef(false);
  const rawPhaseRef = useRef(0);
  const phaseRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const activeRef = useRef(-1);
  const manualRef = useRef<{ from: number; to: number; started: number | null } | null>(null);
  const sizeRef = useRef({ width: 600, height: 590, radius: 215, dpr: 1 });

  const onActiveItemChangeRef = useRef(onActiveItemChange);
  useEffect(() => {
    onActiveItemChangeRef.current = onActiveItemChange;
  }, [onActiveItemChange]);

  const moveTo = useCallback((target: number) => {
    if (reducedRef.current) {
      rawPhaseRef.current = target;
      phaseRef.current = target;
      manualRef.current = null;
      return;
    }
    manualRef.current = { from: phaseRef.current, to: target, started: null };
  }, []);

  const goToItem = useCallback(
    (itemIndex: number) => {
      const current = manualRef.current?.to ?? phaseRef.current;
      const base = Math.floor(current / COUNT) * COUNT + itemIndex;
      moveTo(base < current - 0.1 ? base + COUNT : base);
    },
    [moveTo],
  );

  useImperativeHandle(
    ref,
    () => ({
      moveToArea(areaIndex: number) {
        goToItem(areaIndex * 2);
      },
      focusItem(itemIndex: number) {
        goToItem(itemIndex);
      },
      setAutoplayLocked(locked: boolean) {
        scrollLockRef.current = locked;
      },
    }),
    [goToItem],
  );

  function updatePauseUI() {
    if (pauseIconRef.current) {
      pauseIconRef.current.innerHTML = svgMarkup(pausedRef.current ? "play" : "pause");
    }
    pauseButtonRef.current?.setAttribute(
      "aria-label",
      pausedRef.current ? "Retomar animação" : "Pausar animação",
    );
    if (motionLabelRef.current) {
      motionLabelRef.current.textContent = pausedRef.current ? "Pausado" : "Em movimento";
    }
  }

  function setActive(index: number) {
    if (index === activeRef.current) return;
    activeRef.current = index;
    onActiveItemChangeRef.current(index);
    if (counterRef.current) {
      counterRef.current.innerHTML = `<strong>${String(index + 1).padStart(2, "0")}</strong> / ${String(COUNT).padStart(2, "0")}`;
    }
  }

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = reduced.matches;
    pausedRef.current = reduced.matches;
    updatePauseUI();
    const onChange = () => {
      reducedRef.current = reduced.matches;
      pausedRef.current = reduced.matches;
      updatePauseUI();
    };
    reduced.addEventListener("change", onChange);
    return () => reduced.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      if (!stage || !canvas) return;
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      const radius = Math.min(width * 0.39, height * 0.39);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      sizeRef.current = { width, height, radius, dpr };
    }
    const observer = new ResizeObserver(resize);
    observer.observe(stage);
    resize();

    function screen(point: { x: number; y: number }) {
      const { width, height, radius } = sizeRef.current;
      return { x: width * 0.5 + point.x * radius, y: height * 0.49 + point.y * radius };
    }

    function curve(points: { x: number; y: number; z: number }[], accent = false) {
      if (!ctx) return;
      for (let i = 1; i < points.length; i++) {
        const a = screen(points[i - 1]);
        const b = screen(points[i]);
        const light = (points[i].z + 1) / 2;
        ctx.strokeStyle = accent
          ? `rgba(238,163,106,${0.08 + light * 0.18})`
          : `rgba(193,204,206,${0.025 + light * 0.075})`;
        ctx.lineWidth = accent ? 0.85 : 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    function drawGrid(angle: number) {
      if (!ctx) return;
      const { width, height, dpr } = sizeRef.current;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      [-0.85, -0.7, 0, 0.7, 0.85].forEach((latitude) =>
        curve(
          Array.from({ length: 97 }, (_, i) => project((i / 96) * TAU + angle, latitude)),
          latitude === 0,
        ),
      );
      for (let ring = 0; ring < 6; ring++) {
        const longitude = (ring * Math.PI) / 6 + angle;
        const points = Array.from({ length: 97 }, (_, i) => {
          const t = (i / 96) * TAU;
          const lat = Math.sin(t) * 0.997;
          return project(longitude + (Math.cos(t) < 0 ? Math.PI : 0), lat);
        });
        curve(points);
      }
    }

    const rafRef = { current: 0 };
    function frame(now: number) {
      const delta = lastTimeRef.current === null ? 0 : Math.min(now - lastTimeRef.current, 64);
      lastTimeRef.current = now;
      if (!document.hidden) {
        const manual = manualRef.current;
        if (manual) {
          if (manual.started === null) manual.started = now;
          const t = Math.min(1, (now - manual.started) / 1100);
          const ease = t * t * (3 - 2 * t);
          phaseRef.current = manual.from + (manual.to - manual.from) * ease;
          if (t === 1) {
            rawPhaseRef.current = manual.to;
            manualRef.current = null;
          }
        } else if (!pausedRef.current && !scrollLockRef.current) {
          rawPhaseRef.current += delta / 3000;
          phaseRef.current = phaseAt(rawPhaseRef.current);
        }
        setActive(wrap(Math.round(phaseRef.current)));
        const angle = (phaseRef.current * TAU) / COUNT;
        drawGrid(angle);
        const fit = Math.min(1, sizeRef.current.width / 500);
        const { radius } = sizeRef.current;
        cardRefs.current.forEach((card, i) => {
          if (!card) return;
          const pose = cardPose(i, phaseRef.current);
          card.style.transform = `translate(${pose.x * radius}px,${pose.y * radius}px) rotate(${pose.rotation}deg) scale(${pose.scale * fit})`;
          card.style.opacity = pose.opacity.toFixed(3);
          card.style.zIndex = String(Math.round((pose.z + 1) * 40) + 10);
          card.style.filter = `blur(${Math.max(0, -pose.z) * 0.7}px)`;
        });
        satelliteRefs.current.forEach((card, i) => {
          if (!card) return;
          const { latitude, longitude } = SATELLITES[i];
          const p = project(longitude + angle, latitude);
          card.style.transform = `translate(${p.x * radius}px,${p.y * radius}px) rotate(${-Math.sin(longitude + angle) * 12}deg) scale(${(0.5 + 0.35 * (p.z + 1)) * fit})`;
          card.style.opacity = String(0.13 + (0.37 * (p.z + 1)) / 2);
          card.style.zIndex = String(Math.round((p.z + 1) * 40) + 9);
        });
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    setActive(0);
    rafRef.current = requestAnimationFrame(frame);

    function onVisibility() {
      lastTimeRef.current = null;
    }
    document.addEventListener("visibilitychange", onVisibility);

    function onPointerMove(event: PointerEvent) {
      const bounds = stage!.getBoundingClientRect();
      stage!.style.setProperty("--mx", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
      stage!.style.setProperty("--my", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
    }
    function onPointerLeave() {
      stage!.style.setProperty("--mx", "66%");
      stage!.style.setProperty("--my", "26%");
    }
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  function togglePause() {
    pausedRef.current = !pausedRef.current;
    updatePauseUI();
  }

  return (
    <>
      <div
        ref={stageRef}
        className="orbit-stage-canvas"
        role="img"
        aria-label="Órbita animada das oito soluções da Sena Labs; o card mais próximo está descrito à esquerda."
      >
        <div className="orbit-scene-label">Possibilidades em órbita</div>
        <div className="orbit-world" aria-hidden="true">
          <canvas ref={canvasRef} />
          {ITEMS.map((item, i) => (
            <button
              key={item.tag}
              type="button"
              tabIndex={-1}
              ref={(node) => {
                cardRefs.current[i] = node;
              }}
              onClick={() => onSelectCase(item.caseIndex)}
              aria-label={`Ver exemplo: ${item.tag}`}
              className="orbit-card"
            >
              <div className="orbit-glass" />
              <div className="orbit-card-content">
                <div className="orbit-card-top">
                  <IconSpan name={item.icon} />
                  <span className="orbit-card-code">SL / {String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="orbit-card-title">{item.tag}</div>
                <div className="orbit-card-footer">
                  <span>{item.category}</span>
                  <IconSpan name="next" />
                </div>
              </div>
            </button>
          ))}
          {SATELLITES.map((_, i) => (
            <div
              key={i}
              ref={(node) => {
                satelliteRefs.current[i] = node;
              }}
              className="orbit-satellite"
            />
          ))}
        </div>
        <div className="orbit-axis-label">SENA / LABS</div>
      </div>
      <div className="orbit-scene-controls" aria-label="Controles da órbita">
        <button
          type="button"
          className="orbit-control"
          aria-label="Solução anterior"
          onClick={() => moveTo(Math.round(manualRef.current?.to ?? phaseRef.current) - 1)}
        >
          <IconSpan name="prev" />
        </button>
        <span className="orbit-counter" ref={counterRef}>
          <strong>01</strong> / {String(COUNT).padStart(2, "0")}
        </span>
        <button
          type="button"
          className="orbit-control"
          aria-label="Próxima solução"
          onClick={() => moveTo(Math.round(manualRef.current?.to ?? phaseRef.current) + 1)}
        >
          <IconSpan name="next" />
        </button>
        <button
          type="button"
          ref={pauseButtonRef}
          className="orbit-control"
          aria-label="Pausar animação"
          onClick={togglePause}
        >
          <span ref={pauseIconRef} dangerouslySetInnerHTML={{ __html: svgMarkup("pause") }} />
        </button>
        <span className="orbit-motion-label" ref={motionLabelRef}>
          Em movimento
        </span>
      </div>
    </>
  );
});

export default OrbitGlobeScene;
