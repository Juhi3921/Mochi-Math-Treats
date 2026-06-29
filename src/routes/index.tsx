import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mochi Math Café — a cozy pastel calculator" },
      {
        name: "description",
        content:
          "A super cute Tamagotchi-style café calculator with pastel buttons, a pixel cat, drifting clouds and floating hearts.",
      },
      { property: "og:title", content: "Mochi Math Café" },
      {
        property: "og:description",
        content: "A cozy pastel café calculator inspired by Tamagotchi and Japanese cafés.",
      },
    ],
  }),
  component: MochiMathCafe,
});

type Operator = "latte" | "matcha" | "cupcake" | "berry";
type CatMood = "idle";

const OPERATORS: { key: Operator; label: string; emoji: string; util: string; aria: string }[] = [
  { key: "latte", label: "Latte", emoji: "☕", util: "op-latte", aria: "Add" },
  { key: "matcha", label: "Matcha", emoji: "🍵", util: "op-matcha", aria: "Subtract" },
  { key: "cupcake", label: "Cupcake", emoji: "🧁", util: "op-cupcake", aria: "Multiply" },
  { key: "berry", label: "Strawberry", emoji: "🍓", util: "op-berry", aria: "Divide" },
];

const SPARKLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: `${10 + Math.random() * 80}%`,
  left: `${10 + Math.random() * 80}%`,
  delay: `${(Math.random() * 4).toFixed(2)}s`,
  size: 8 + Math.round(Math.random() * 10),
}));

function MochiMathCafe() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Operator | null>(null);
  const [freshEntry, setFreshEntry] = useState(false);
  const [justServed, setJustServed] = useState(false);
  const [receipt, setReceipt] = useState<null | {
    items: { label: string; value: string }[];
    total: string;
  }>(null);

  const prettyNumber = (n: number) => {
    if (!Number.isFinite(n)) return "oops";
    const rounded = Math.round(n * 100000) / 100000;
    const text = String(rounded);
    return text.length > 12 ? rounded.toPrecision(8) : text;
  };

  const doMath = (a: number, b: number, op: Operator): number => {
    if (op === "latte") return a + b;
    if (op === "matcha") return a - b;
    if (op === "cupcake") return a * b;
    if (b === 0) return NaN;
    return a / b;
  };

  const handleDigit = (d: string) => {
    if (justServed) {
      setDisplay(d);
      setPrevious(null);
      setPendingOp(null);
      setReceipt(null);
      setJustServed(false);
      setFreshEntry(false);
      return;
    }

    if (freshEntry) {
      setDisplay(d);
      setFreshEntry(false);
      return;
    }

    if (display === "0") setDisplay(d);
    else if (display.length < 12) setDisplay(display + d);
  };

  const handleDot = () => {
    if (justServed) {
      setDisplay("0.");
      setReceipt(null);
      setPrevious(null);
      setPendingOp(null);
      setJustServed(false);
      setFreshEntry(false);
      return;
    }

    if (freshEntry) {
      setDisplay("0.");
      setFreshEntry(false);
      return;
    }

    if (!display.includes(".")) setDisplay(display + ".");
  };

  const handleBackspace = () => {
    if (freshEntry || justServed) return;
    if (display.length <= 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleOperator = (op: Operator) => {
    const current = parseFloat(display);

    if (previous === null) {
      setPrevious(current);
    } else if (!freshEntry) {
      const result = doMath(previous, current, pendingOp ?? "latte");
      setPrevious(result);
      setDisplay(prettyNumber(result));
    }

    setPendingOp(op);
    setFreshEntry(true);
    setJustServed(false);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrevious(null);
    setPendingOp(null);
    setReceipt(null);
    setFreshEntry(false);
    setJustServed(false);
  };

  const handleServe = () => {
    if (previous === null || pendingOp === null) {
      return;
    }

    const current = parseFloat(display);
    const result = doMath(previous, current, pendingOp);

    if (!Number.isFinite(result)) {
      setReceipt(null);
      return;
    }

    setReceipt({
      items: [{ label: "Order", value: prettyNumber(current) }],
      total: prettyNumber(result),
    });
    setDisplay(prettyNumber(result));
    setPrevious(null);
    setPendingOp(null);
    setJustServed(true);
    setFreshEntry(false);
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden pb-20">
      <DriftingClouds />
      <Sparkles items={SPARKLES} />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 pt-5">
        <div className="flex items-center gap-3">
          <div className="cafe-card flex h-12 w-12 items-center justify-center text-2xl" aria-hidden>
            🍡
          </div>
          <div className="leading-tight">
            <h1 className="text-2xl font-bold text-cocoa">Mochi Math Café</h1>
            <p className="text-xs text-muted-foreground">a simple cozy calculator</p>
          </div>
          <CatMascotWaving />
        </div>
      </header>

      <section className="relative z-10 mx-auto mt-8 grid max-w-6xl gap-8 px-5 lg:grid-cols-[1.05fr_1fr]">
        <div className="cafe-card relative p-6">
          <DecorativeShelf />

          <div className="cafe-screen relative mx-auto aspect-5/4 w-full max-w-md p-5">
            <div className="absolute left-6 top-4 z-10">
              <div className="speech-bubble">Let&apos;s make it sweet!</div>
            </div>

            <div className="relative flex h-full w-full items-end justify-center">
              <SteamPuffs />
              <PixelCat mood="idle" />
            </div>

            <div className="absolute inset-x-5 bottom-4 rounded-2xl bg-white/70 px-4 py-2 text-right font-display text-3xl font-bold text-cocoa shadow-inner backdrop-blur-sm tabular-nums">
              {display}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Tap a treat and take an order ♡
          </p>
        </div>

        <div className="cafe-card p-6">
          <h2 className="mb-4 text-xl font-bold">Order Panel</h2>

          <div className="grid grid-cols-4 gap-3">
            <button className="cafe-button col-span-2" onClick={handleClear}>
              AC
            </button>
            <button className="cafe-button" onClick={handleBackspace} aria-label="Backspace">
              ⌫
            </button>
            <OperatorButton op={OPERATORS[3]} onClick={() => handleOperator("berry")} />

            {["7", "8", "9"].map((d) => (
              <DigitButton key={d} digit={d} onPress={handleDigit} />
            ))}
            <OperatorButton op={OPERATORS[2]} onClick={() => handleOperator("cupcake")} />

            {["4", "5", "6"].map((d) => (
              <DigitButton key={d} digit={d} onPress={handleDigit} />
            ))}
            <OperatorButton op={OPERATORS[1]} onClick={() => handleOperator("matcha")} />

            {["1", "2", "3"].map((d) => (
              <DigitButton key={d} digit={d} onPress={handleDigit} />
            ))}
            <OperatorButton op={OPERATORS[0]} onClick={() => handleOperator("latte")} />

            <DigitButton digit="0" onPress={handleDigit} className="col-span-2" />
            <button className="cafe-button" onClick={handleDot}>
              .
            </button>
            <button className="cafe-button serve-btn text-base" onClick={handleServe}>
              ♡
            </button>
          </div>

          <button type="button" onClick={handleServe} className="cafe-button serve-btn mt-4 w-full py-4 text-lg">
            Serve Order ✨
          </button>

          {receipt && (
            <div className="receipt-paper mt-6 text-sm leading-6">
              <div className="text-center font-display text-base font-bold">— Mochi Math Café —</div>
              <div className="my-2 border-t border-dashed border-cocoa/30" />
              {receipt.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
              ))}
              <div className="my-2 border-t border-dashed border-cocoa/30" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{receipt.total}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function DigitButton({
  digit,
  onPress,
  className = "",
}: {
  digit: string;
  onPress: (d: string) => void;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => onPress(digit)} className={`cafe-button text-xl ${className}`}>
      {digit}
    </button>
  );
}

function OperatorButton({
  op,
  onClick,
}: {
  op: (typeof OPERATORS)[number];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cafe-button ${op.util} flex flex-col items-center gap-0 leading-tight`}
      aria-label={op.aria}
      title={op.label}
    >
      <span className="text-xl">{op.emoji}</span>
      <span className="text-[10px] font-bold opacity-70">{op.label}</span>
    </button>
  );
}

function CatMascotWaving() {
  return (
    <div className="relative ml-1 hidden sm:block" aria-hidden>
      <div className="text-3xl" style={{ animation: "mm-bounce-soft 2.4s ease-in-out infinite" }}>
        🐱
      </div>
      <span
        className="absolute -right-2 top-0 text-lg"
        style={{ transformOrigin: "80% 80%", animation: "mm-wave 1.6s ease-in-out infinite" }}
      >
        👋
      </span>
    </div>
  );
}

function PixelCat({ mood }: { mood: CatMood }) {
  const bodyAnim = mood === "idle" ? "mm-breathe 3s ease-in-out infinite" : "mm-breathe 3s ease-in-out infinite";

  return (
    <div className="relative" style={{ animation: bodyAnim }}>
      <span
        aria-hidden
        className="absolute -right-6 bottom-3 text-3xl"
        style={{ transformOrigin: "0% 100%", animation: "mm-wiggle 1.8s ease-in-out infinite" }}
      >
        〰️
      </span>

      <div
        className="relative flex h-28 w-28 items-center justify-center rounded-[28%] border-4"
        style={{
          background: "color-mix(in oklab, var(--peach) 55%, white)",
          borderColor: "color-mix(in oklab, var(--cocoa) 25%, white)",
          boxShadow: "inset 0 -8px 0 color-mix(in oklab, var(--cocoa) 10%, transparent)",
        }}
      >
        <span
          className="absolute -top-3 left-2 h-0 w-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderBottom: "18px solid color-mix(in oklab, var(--peach) 55%, white)",
            transform: "rotate(-18deg)",
          }}
        />
        <span
          className="absolute -top-3 right-2 h-0 w-0"
          style={{
            borderLeft: "12px solid transparent",
            borderRight: "12px solid transparent",
            borderBottom: "18px solid color-mix(in oklab, var(--peach) 55%, white)",
            transform: "rotate(18deg)",
          }}
        />

        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-3">
            <Eye />
            <Eye delay="0.4s" />
          </div>
          <div className="mt-1 text-base font-bold text-cocoa">ω</div>
          <div className="absolute left-2 top-14 h-2 w-3 rounded-full" style={{ background: "color-mix(in oklab, var(--pink) 70%, white)" }} />
          <div className="absolute right-2 top-14 h-2 w-3 rounded-full" style={{ background: "color-mix(in oklab, var(--pink) 70%, white)" }} />
        </div>
      </div>

      <div className="mx-auto -mt-2 h-3 w-10 rounded-full" style={{ background: "color-mix(in oklab, var(--pink) 60%, white)" }} />
    </div>
  );
}

function Eye({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="block h-3 w-3 rounded-full bg-cocoa"
      style={{ animation: "mm-blink 4s ease-in-out infinite", animationDelay: delay }}
    />
  );
}

function SteamPuffs() {
  return (
    <div aria-hidden className="pointer-events-none absolute bottom-16 left-6">
      {[0, 0.6, 1.2].map((delay, i) => (
        <span
          key={i}
          className="absolute block h-3 w-3 rounded-full bg-white/80"
          style={{
            left: i * 8,
            animation: "mm-steam 3s ease-out infinite",
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function DriftingClouds() {
  const clouds = [
    { top: "6%", size: 80, dur: 70, delay: 0, op: 0.7 },
    { top: "18%", size: 120, dur: 110, delay: 20, op: 0.55 },
    { top: "42%", size: 90, dur: 90, delay: 40, op: 0.5 },
    { top: "70%", size: 140, dur: 130, delay: 10, op: 0.4 },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((cloud, index) => (
        <div
          key={index}
          className="cloud-shape absolute"
          style={{
            top: cloud.top,
            width: cloud.size,
            height: cloud.size * 0.5,
            opacity: cloud.op,
            animation: `mm-float-cloud ${cloud.dur}s linear infinite`,
            animationDelay: `-${cloud.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

function Sparkles({
  items,
}: {
  items: { id: number; top: string; left: string; delay: string; size: number }[];
}) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {items.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute text-yellow-400"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            fontSize: sparkle.size,
            animation: "mm-sparkle 5s ease-in-out infinite",
            animationDelay: sparkle.delay,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function DecorativeShelf() {
  return (
    <div className="mb-4 flex items-center justify-between text-2xl" aria-hidden>
      <div className="flex gap-2" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="inline-block h-3 w-3 rounded-full"
            style={{
              background: ["#ffd1dc", "#ffe0b3", "#c8f7c5", "#d6c7ff", "#bee3f8"][i % 5],
              boxShadow: "0 0 12px currentColor",
              color: ["#ffd1dc", "#ffe0b3", "#c8f7c5", "#d6c7ff", "#bee3f8"][i % 5],
              animation: "mm-bounce-soft 2.6s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <div className="flex gap-2" />
    </div>
  );
}
