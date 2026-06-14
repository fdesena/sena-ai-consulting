import { useEffect, useRef, useState } from "react";
import { DECK_HTML } from "@/lib/deck-html";
import { TRANSLATIONS, HINTS, type Lang } from "@/lib/translations";

const DARK_SLIDES = new Set([0, 10]);

export default function DeckPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lang, setLang] = useState<Lang>("pt");
  const [current, setCurrent] = useState(0);
  const [hintFaded, setHintFaded] = useState(false);
  const slidesRef = useRef<HTMLElement[]>([]);

  // Apply translations whenever lang changes
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const dict = TRANSLATIONS[lang];
    root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key] !== undefined) el.innerHTML = dict[key];
    });
    document.documentElement.lang = lang;
  }, [lang]);

  // Mount: bind slide engine
  useEffect(() => {
    const deck = containerRef.current;
    if (!deck) return;
    const slides = Array.from(deck.querySelectorAll<HTMLElement>(".slide"));
    slidesRef.current = slides;
    setCurrent(0);

    // Ensure first slide is visible immediately (in case IO is slow on first paint)
    slides[0]?.classList.add("visible");

    // Scroll-based current slide detection (more reliable than IO inside scroll-snap container)
    const onScroll = () => {
      const center = deck.scrollTop + deck.clientHeight / 2;
      let idx = 0;
      for (let i = 0; i < slides.length; i++) {
        if (slides[i].offsetTop <= center) idx = i;
        else break;
      }
      slides[idx].classList.add("visible");
      // Pre-reveal neighbours
      slides[idx + 1]?.classList.add("visible");
      currentIdx = idx;
      setCurrent(idx);
    };
    deck.addEventListener("scroll", onScroll, { passive: true });

    let currentIdx = 0;
    const goTo = (i: number) => {
      const idx = Math.max(0, Math.min(i, slides.length - 1));
      const target = slides[idx];
      if (!target) return;
      currentIdx = idx;
      target.classList.add("visible");
      target.scrollIntoView({ behavior: "smooth" });
      setCurrent(idx);
    };

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input,textarea")) return;
      if (["ArrowDown", "ArrowRight", " ", "PageDown"].includes(e.key)) {
        e.preventDefault();
        goTo(currentIdx + 1);
      } else if (["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        goTo(currentIdx - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(slides.length - 1);
      }
      setHintFaded(true);
    };
    document.addEventListener("keydown", onKey);

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50) goTo(dy > 0 ? currentIdx + 1 : currentIdx - 1);
    };
    deck.addEventListener("touchstart", onTouchStart, { passive: true });
    deck.addEventListener("touchend", onTouchEnd);

    const hintTimer = window.setTimeout(() => setHintFaded(true), 4000);

    return () => {
      deck.removeEventListener("scroll", onScroll);
      document.removeEventListener("keydown", onKey);
      deck.removeEventListener("touchstart", onTouchStart);
      deck.removeEventListener("touchend", onTouchEnd);
      window.clearTimeout(hintTimer);
    };
  }, []);

  // Track theme-on-dark for lang selector styling
  useEffect(() => {
    document.body.setAttribute("data-on-dark", DARK_SLIDES.has(current) ? "true" : "false");
  }, [current]);

  const total = slidesRef.current.length || 12;
  const progress = ((current + 1) / total) * 100;

  const goToIndex = (i: number) => {
    const slides = slidesRef.current;
    const target = slides[Math.max(0, Math.min(i, slides.length - 1))];
    if (!target) return;
    target.classList.add("visible");
    target.scrollIntoView({ behavior: "smooth" });
    setCurrent(i);
  };

  return (
    <div className="deck-app">
      {/* Language selector */}
      <div className="lang-selector">
        <button
          className={`lang-btn ${lang === "pt" ? "active" : ""}`}
          onClick={() => setLang("pt")}
          title="Português"
          aria-label="Português"
        >
          <svg viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="14" rx="2" fill="#009C3B" />
            <rect x="6" width="9" height="14" fill="#FEDF00" />
            <circle cx="10" cy="7" r="3.5" fill="#002776" />
            <path
              d="M7 7.5C7 5.84 8.34 4.5 10 4.5s3 1.34 3 3"
              stroke="#fff"
              strokeWidth=".8"
              fill="none"
            />
          </svg>
          PT
        </button>
        <button
          className={`lang-btn ${lang === "en" ? "active" : ""}`}
          onClick={() => setLang("en")}
          title="English"
          aria-label="English"
        >
          <svg viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="14" rx="2" fill="#012169" />
            <path d="M0 0l20 14M20 0L0 14" stroke="#fff" strokeWidth="2" />
            <path d="M0 0l20 14M20 0L0 14" stroke="#C8102E" strokeWidth="1.2" />
            <path d="M10 0v14M0 7h20" stroke="#fff" strokeWidth="3.5" />
            <path d="M10 0v14M0 7h20" stroke="#C8102E" strokeWidth="2" />
          </svg>
          EN
        </button>
        <button
          className={`lang-btn ${lang === "es" ? "active" : ""}`}
          onClick={() => setLang("es")}
          title="Español"
          aria-label="Español"
        >
          <svg viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="20" height="14" rx="2" fill="#AA151B" />
            <rect y="3.5" width="20" height="7" fill="#F1BF00" />
          </svg>
          ES
        </button>
      </div>

      {/* Deck content (preserved from original HTML) */}
      <div
        ref={containerRef}
        className="deck"
        data-debug-len={DECK_HTML.length}
        dangerouslySetInnerHTML={{ __html: DECK_HTML }}
      />

      {/* Chrome: progress bar, dots, counter, hints */}
      <div className="deck-progress" style={{ width: `${progress}%` }} />
      <div className="deck-dots">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            className={`deck-dot ${i === current ? "active" : ""}`}
            onClick={() => goToIndex(i)}
            title={`Slide ${i + 1}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
      <div className="deck-counter">
        {current + 1} / {total}
      </div>
      <div className={`deck-hints ${hintFaded ? "faded" : ""}`}>{HINTS[lang]}</div>
    </div>
  );
}
