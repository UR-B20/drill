import { useEffect, useRef, useState } from "react";
import { markPracticed } from "../lib/practice";

/** Record your own command call and replay it beside the approved reference
 * audio. The app never scores or judges the attempt — comparison is the
 * trainee's own ear, the same way the manual's demonstration passes work.
 * Recordings stay in memory on this device and vanish when the page closes. */
export default function RecordCompare({
  referenceSrc,
  drillId,
}: {
  referenceSrc: string | null;
  drillId: string;
}) {
  const [recording, setRecording] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const myAudioRef = useRef<HTMLAudioElement>(null);
  const refAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(
    () => () => {
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType });
        setBlobUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      markPracticed(drillId, "self");
    } catch {
      setError(
        "Microphone unavailable — check the browser's mic permission for this page.",
      );
    }
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  const playMine = () => {
    refAudioRef.current?.pause();
    void myAudioRef.current?.play();
  };

  const playRef = () => {
    myAudioRef.current?.pause();
    if (refAudioRef.current) {
      refAudioRef.current.currentTime = 0;
      void refAudioRef.current.play();
    }
  };

  return (
    <div className="record-compare">
      <div className="tool-row">
        {!recording ? (
          <button className="play-btn rec" onClick={start}>
            ● Record my call
          </button>
        ) : (
          <button className="play-btn rec recording" onClick={stop}>
            ■ Stop
          </button>
        )}
        {blobUrl && (
          <button className="tool-chip" onClick={playMine}>
            ▶ My call
          </button>
        )}
        {referenceSrc && blobUrl && (
          <button className="tool-chip" onClick={playRef}>
            ▶ Reference
          </button>
        )}
      </div>
      {blobUrl && <audio ref={myAudioRef} src={blobUrl} />}
      {referenceSrc && <audio ref={refAudioRef} src={referenceSrc} />}
      {error && <div className="cadence-note" style={{ color: "var(--fault)" }}>{error}</div>}
      {!referenceSrc && (
        <div className="cadence-note">
          No approved reference audio exists for this drill yet — record and
          replay your own call; a reference clip will appear here once one is
          authorized.
        </div>
      )}
      <div className="cadence-note">
        Nothing is scored or uploaded — the recording stays on this device and
        is discarded when you leave. Your ear, and your trainer, are the judges.
      </div>
    </div>
  );
}
