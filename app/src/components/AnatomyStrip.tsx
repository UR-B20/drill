import { useEffect, useRef, useState } from "react";
import type { TableRec } from "../lib/content";

/** Parsed from the Structure of Command grid — text stays verbatim; this
 * component only re-lays-out the manual's own cells. */
interface Anatomy {
  fullCommand: string;
  tones: { introductory: string; cautionary: string; pause: string; executionary: string };
  variants: { introductory: string; cautionary: string; pause: string; executionary: string }[];
  pauseMs: number | null;
}

export function parseAnatomy(table: TableRec): Anatomy | null {
  const rows = table.grid;
  const byLabel = (label: string) =>
    rows.find((r) => r[0]?.text.toLowerCase().startsWith(label));
  const typeRow = byLabel("type");
  const styleRow = byLabel("delivery style");
  const cmdRowIdx = rows.findIndex((r) => r[0]?.text.toLowerCase() === "command");
  if (!typeRow || !styleRow || cmdRowIdx < 0) return null;

  const cells = (r: typeof rows[number]) => r.map((c) => c.text);
  const style = cells(styleRow);
  const full = rows[0]?.[1]?.text ?? "";

  const variants: Anatomy["variants"] = [];
  for (let i = cmdRowIdx; i < rows.length; i++) {
    const r = rows[i];
    const isCmdRow = i === cmdRowIdx;
    const vals = isCmdRow ? r.slice(1) : r.slice(r[0]?.text === "" ? 1 : 0);
    const texts = vals.map((c) => c.text);
    if (texts.filter((t) => t !== "").length < 2) continue;
    if (!isCmdRow && r.length < 4) continue;
    variants.push({
      introductory: texts[0] ?? "",
      cautionary: texts[1] ?? "",
      pause: texts[2] ?? "",
      executionary: texts[3] ?? "",
    });
  }
  if (variants.length === 0) return null;

  const pauseText = style[3] ?? "";
  const pauseMatch = pauseText.match(/(\d+)\s*sec/i);
  return {
    fullCommand: full,
    tones: {
      introductory: style[1] ?? "",
      cautionary: style[2] ?? "",
      pause: pauseText,
      executionary: style[4] ?? "",
    },
    variants,
    pauseMs: pauseMatch ? Number(pauseMatch[1]) * 1000 : null,
  };
}

type Phase = "idle" | "introductory" | "cautionary" | "pause" | "executionary";

export default function AnatomyStrip({ table }: { table: TableRec }) {
  const anatomy = parseAnatomy(table);
  const [variantIdx, setVariantIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  if (!anatomy) return null;
  const v = anatomy.variants[Math.min(variantIdx, anatomy.variants.length - 1)];

  const play = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const pauseMs = anatomy.pauseMs ?? 2000;
    const steps: [Phase, number][] = [
      ["introductory", 1200],
      ["cautionary", 1400],
      ["pause", pauseMs],
      ["executionary", 900],
      ["idle", 0],
    ];
    let t = 0;
    for (const [p, dur] of steps) {
      timers.current.push(
        setTimeout(() => {
          setPhase(p);
          if (p === "executionary" && "vibrate" in navigator) navigator.vibrate(60);
        }, t),
      );
      t += dur;
    }
  };

  const seg = (key: Exclude<Phase, "idle">, label: string, text: string, tone: string) => (
    <div className={`anatomy-seg seg-${key} ${phase === key ? "live" : ""}`}>
      <div className="seg-label">{label}</div>
      <div className={`seg-text ${key === "cautionary" ? "sustained" : ""}`}>
        {key === "pause" ? "…" : text || "—"}
      </div>
      <div className="seg-tone">{tone}</div>
    </div>
  );

  return (
    <div className="anatomy">
      <div className="anatomy-strip">
        {seg("introductory", "Introductory", v.introductory, anatomy.tones.introductory)}
        {seg("cautionary", "Cautionary", v.cautionary, anatomy.tones.cautionary)}
        {seg("pause", "Pause", v.pause, anatomy.tones.pause)}
        {seg("executionary", "Executionary", v.executionary, anatomy.tones.executionary)}
      </div>
      <div className="anatomy-controls">
        {anatomy.variants.length > 1 && (
          <select
            className="variant-select"
            value={variantIdx}
            onChange={(e) => setVariantIdx(Number(e.target.value))}
            aria-label="Command variant"
          >
            {anatomy.variants.map((va, i) => (
              <option key={i} value={i}>
                {[va.introductory, va.cautionary, va.executionary].filter(Boolean).join(" ")}
              </option>
            ))}
          </select>
        )}
        <button className="play-btn" onClick={play} disabled={phase !== "idle"}>
          {phase === "idle" ? "▶ Rehearse timing" : "…"}
        </button>
      </div>
    </div>
  );
}
