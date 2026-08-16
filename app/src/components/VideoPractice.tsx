import { useEffect, useRef, useState } from "react";
import { markPracticed } from "../lib/practice";
import { useWakeLock } from "../lib/useWakeLock";

const SPEEDS = [0.5, 0.75, 1];

function fmt(t: number) {
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}.${Math.floor((t % 1) * 10)}`;
}

/** Practice controls around the companion video: slow motion, A–B segment
 * looping, and a metronome count-in — playback mechanics only, on approved
 * footage. */
export default function VideoPractice({
  src,
  drillId,
}: {
  src: string;
  drillId: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [countingIn, setCountingIn] = useState(false);
  useWakeLock(playing || countingIn);

  useEffect(() => {
    const v = videoRef.current;
    if (v) v.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || loopA === null || loopB === null) return;
    const [a, b] = loopA < loopB ? [loopA, loopB] : [loopB, loopA];
    const onTime = () => {
      if (v.currentTime > b) v.currentTime = a;
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [loopA, loopB]);

  const countIn = async () => {
    const v = videoRef.current;
    if (!v || countingIn) return;
    setCountingIn(true);
    v.pause();
    const tempo = Number(localStorage.getItem("cadence.tempo")) || 60;
    const interval = 60000 / tempo;
    const ctx = new AudioContext();
    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = i === 3 ? 1320 : 880;
      const t = ctx.currentTime + (i * interval) / 1000;
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.09);
      if ("vibrate" in navigator) setTimeout(() => navigator.vibrate(30), i * interval);
    }
    setTimeout(() => {
      void ctx.close();
      if (loopA !== null && videoRef.current) {
        videoRef.current.currentTime = Math.min(loopA, loopB ?? loopA);
      }
      void videoRef.current?.play();
      setCountingIn(false);
    }, 4 * interval);
  };

  const mark = (which: "A" | "B") => {
    const t = videoRef.current?.currentTime ?? 0;
    if (which === "A") setLoopA(t);
    else setLoopB(t);
  };

  return (
    <>
      <div className="video-frame">
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          preload="metadata"
          onPlay={() => {
            setPlaying(true);
            markPracticed(drillId, "self");
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      </div>
      <div className="video-tools">
        <div className="tool-row">
          <span className="eyebrow">Speed</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              className={`tool-chip ${speed === s ? "on" : ""}`}
              onClick={() => setSpeed(s)}
            >
              {s}×
            </button>
          ))}
          <button
            className="tool-chip"
            onClick={countIn}
            disabled={countingIn}
            title="Four metronome beats, then the video plays"
          >
            {countingIn ? "…" : "♩ Count-in"}
          </button>
        </div>
        <div className="tool-row">
          <span className="eyebrow">Loop</span>
          <button className={`tool-chip ${loopA !== null ? "on" : ""}`} onClick={() => mark("A")}>
            A {loopA !== null ? fmt(loopA) : ""}
          </button>
          <button className={`tool-chip ${loopB !== null ? "on" : ""}`} onClick={() => mark("B")}>
            B {loopB !== null ? fmt(loopB) : ""}
          </button>
          {(loopA !== null || loopB !== null) && (
            <button
              className="tool-chip"
              onClick={() => {
                setLoopA(null);
                setLoopB(null);
              }}
            >
              Clear
            </button>
          )}
        </div>
        {loopA !== null && loopB !== null && (
          <div className="cadence-note">
            Looping {fmt(Math.min(loopA, loopB))} – {fmt(Math.max(loopA, loopB))}. Set
            speed to 0.5× to study the movement, then build back to 1×.
          </div>
        )}
      </div>
    </>
  );
}
