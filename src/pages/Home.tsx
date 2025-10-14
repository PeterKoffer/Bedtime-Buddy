import { Button } from "@/components/ui/button";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

/**
 * StarfieldOverlay renders 3 layers of small stars with gentle twinkle.
 * - aria-hidden, pointer-events: none for no interaction blocking
 * - Colors: warm gold + moonlit blue per brand-neutral palette
 * - Respects prefers-reduced-motion via CSS in index.css
 */
function StarfieldOverlay() {
  // Generate deterministic star positions per layer for performance
  const layers = useMemo(() => {
    const gen = (count: number, seed: number) => {
      const rng = mulberry32(seed);
      return new Array(count).fill(0).map((_, i) => {
        const top = Math.floor(rng() * 100);
        const left = Math.floor(rng() * 100);
        const size = rng() < 0.85 ? 2 : 3; // occasionally larger
        const colorClass = rng() < 0.6 ? "gold" : "blue";
        const delay = `${Math.floor(rng() * 3000)}ms`;
        return { top, left, size, colorClass, delay, key: `${seed}-${i}` };
      });
    };
    return {
      slow: gen(60, 42),
      medium: gen(80, 84),
      fast: gen(100, 126),
    };
  }, []);

  return (
    <div className="starfield" aria-hidden="true">
      <div className="layer slow">
        {layers.slow.map((s) => (
          <span
            key={s.key}
            className={`star ${s.colorClass}`}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
      <div className="layer medium">
        {layers.medium.map((s) => (
          <span
            key={s.key}
            className={`star ${s.colorClass}`}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
      <div className="layer fast">
        {layers.fast.map((s) => (
          <span
            key={s.key}
            className={`star ${s.colorClass}`}
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Simple seeded rng for deterministic star positions
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bb-base-dark-blue)] text-white">
      {/* Starfield overlay */}
      <div className="starfield" aria-hidden="true">
        <div className="layer layer-small"></div>
        <div className="layer layer-medium"></div>
        <div className="layer layer-large"></div>
        <div className="moon"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-[var(--bb-warm-dusk-gold)] to-[var(--bb-soft-lavender)] bg-clip-text text-transparent">
            Velkommen til Bedtime Buddy
          </h1>

          <p className="text-lg text-white/80">
            Skab magiske, trygge godnathistorier med dit barns avatar — klar til sengetid.
          </p>

          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Button
              className="bg-[var(--bb-warm-dusk-gold)] text-black hover:bg-[#e3b371]"
              onClick={() => navigate("/create")}
            >
              Opret karakter
            </Button>
            <Button
              className="bg-[var(--bb-moonlit-blue)] hover:bg-[#24396a]"
              onClick={() => navigate("/generate")}
            >
              Generér historie
            </Button>
            <Button
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => navigate("/stories")}
            >
              Dine historier
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative glow at bottom for a magical feel */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[30vh] rounded-[50%] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(216,168,90,0.12), rgba(27,44,85,0))",
        }}
      />
    </div>
  );
}