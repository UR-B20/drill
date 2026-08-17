import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { figureUrl, type Content } from "../lib/content";
import { markPracticed } from "../lib/practice";
import { PendingPanel } from "../components/common";
import { useWakeLock } from "../lib/useWakeLock";

/** Buddy-check: hand the phone to a buddy; they watch you execute and tap
 * any of the manual's own common faults they observe. Saved locally as a
 * buddy-checked record — never as trainer-verified data. */
export default function BuddyCheckPage({ content }: { content: Content }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const drill = content.drills.find((d) => d.drill_id === id);
  const [ticked, setTicked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState(false);
  useWakeLock(!saved);

  if (!drill) {
    return (
      <p>
        Unknown drill. <Link to="/">Back to roster</Link>
      </p>
    );
  }

  const stageGroups = drill.stages_tables.flatMap((st) =>
    st.stages
      .filter((s) => s.common_faults.length > 0)
      .map((s) => ({
        label: `${st.caption_verbatim.replace(/^Table [\d-]+:?\s*/i, "").replace(/ Break into Stages.*$/i, "")} — stage ${s.stage_label.replace(/\s*\n\s*/g, " ")}`,
        faults: s.common_faults,
        images: s.figure_reference.images ?? [],
      })),
  );

  const toggle = (f: string) => {
    const next = new Set(ticked);
    if (next.has(f)) next.delete(f);
    else next.add(f);
    setTicked(next);
  };

  const finish = () => {
    markPracticed(drill.drill_id, "buddy", [...ticked]);
    setSaved(true);
  };

  if (saved) {
    return (
      <>
        <h1 className="command-display" style={{ fontSize: "clamp(26px,8vw,38px)" }}>
          Check saved
        </h1>
        <div className="gloss-bar">{drill.names.english} · buddy-checked</div>
        <p style={{ fontSize: 15, marginTop: 14 }}>
          {ticked.size === 0
            ? "No faults observed this run."
            : `${ticked.size} fault${ticked.size === 1 ? "" : "s"} observed:`}
        </p>
        {[...ticked].map((f) => (
          <div className="fault-chip" key={f} style={{ cursor: "default" }}>
            {f}
          </div>
        ))}
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 12 }}>
          Saved on this device. Your trainer confirms the standard.
        </p>
        <button className="big-btn" onClick={() => navigate(`/drill/${drill.drill_id}`)}>
          Back to {drill.names.english}
        </button>
        <button
          className="big-btn"
          style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--hairline)" }}
          onClick={() => {
            setTicked(new Set());
            setSaved(false);
          }}
        >
          Run another check
        </button>
      </>
    );
  }

  return (
    <>
      <Link to={`/drill/${drill.drill_id}`} style={{ color: "var(--muted)", fontSize: 14 }}>
        ‹ Cancel
      </Link>
      <h1 className="command-display" style={{ fontSize: "clamp(26px,8vw,38px)" }}>
        Buddy check
      </h1>
      <div className="gloss-bar">{drill.names.english}</div>
      <p style={{ fontSize: 14.5, marginTop: 10 }}>
        Hand the phone to your buddy. Buddy: watch the drill and tap each
        fault you see.
      </p>
      {stageGroups.length === 0 ? (
        <PendingPanel reason="The manual lists no common faults for this drill, so there is nothing to check against." />
      ) : (
        stageGroups.map((g) => (
          <div key={g.label} style={{ marginTop: 18 }}>
            <div className="eyebrow">{g.label}</div>
            {g.images.length > 0 && (
              <div className="buddy-figs">
                {g.images.map((img) => (
                  <img
                    key={img}
                    src={figureUrl(img)}
                    alt={`Reference figure — ${g.label}`}
                  />
                ))}
              </div>
            )}
            {g.faults.map((f) => (
              <button
                key={f}
                className={`fault-chip ${ticked.has(f) ? "ticked" : ""}`}
                onClick={() => toggle(f)}
                aria-pressed={ticked.has(f)}
              >
                {ticked.has(f) && <span className="count">✓</span>}
                {f}
              </button>
            ))}
          </div>
        ))
      )}
      {stageGroups.length > 0 && (
        <button className="big-btn" onClick={finish}>
          End check ({ticked.size} observed)
        </button>
      )}
    </>
  );
}
