import { useEffect, useRef, useState } from "react";
import type { WocRow } from "../lib/content";

/** Practice metronome for a Word-of-Command row. The manual specifies the
 * trigger point and the squad call-out — it does not specify paces per
 * minute, so the tempo is explicitly the user's own practice setting. */
export default function CadencePlayer({ row }: { row: WocRow }) {
  const [running, setRunning] = useState(false);
  const [tempo, setTempo] = useState(() => Number(localStorage.getItem("cadence.tempo")) || 60);
  const [beat, setBeat] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem("cadence.tempo", String(tempo));
  }, [tempo]);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const tick = () => {
      setBeat((b) => b + 1);
      if ("vibrate" in navigator) navigator.vibrate(40);
      const ctx = (ctxRef.current ??= new AudioContext());
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    };
    tick();
    timerRef.current = setInterval(tick, 60000 / tempo);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, tempo]);

  useEffect(
    () => () => {
      void ctxRef.current?.close();
    },
    [],
  );

  return (
    <div className="cadence-player">
      <div className={`pulse ${running && beat % 2 === 0 ? "on" : ""}`} aria-hidden="true" />
      {row.squad_call_out && (
        <div className="cadence-callout">{row.squad_call_out}</div>
      )}
      {row.quick_time_when_given && (
        <div className="trigger-line">
          Trigger (quick time): <strong>{row.quick_time_when_given}</strong>
        </div>
      )}
      {row.slow_time_when_given && row.slow_time_when_given !== "-" && (
        <div className="trigger-line">
          Trigger (slow time): <strong>{row.slow_time_when_given}</strong>
        </div>
      )}
      <div className="cadence-controls">
        <button
          className="stepper-btn"
          onClick={() => setTempo((t) => Math.max(30, t - 5))}
          aria-label="Slower"
        >
          −
        </button>
        <span className="mono tempo-readout">{tempo} bpm</span>
        <button
          className="stepper-btn"
          onClick={() => setTempo((t) => Math.min(160, t + 5))}
          aria-label="Faster"
        >
          +
        </button>
        <button className="play-btn" onClick={() => setRunning(!running)}>
          {running ? "■ Stop" : "▶ Beat"}
        </button>
      </div>
      <div className="cadence-note">
        Tempo is your practice setting — the manual defines the trigger point
        and call-out, not paces per minute.
      </div>
    </div>
  );
}
