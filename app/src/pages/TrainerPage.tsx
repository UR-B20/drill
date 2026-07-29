import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { STATUS_LABEL, type Content } from "../lib/content";
import { PendingPanel, Section, VerbatimTable } from "../components/common";

interface SessionState {
  squadSize: number;
  stageIndex: number;
  reps: number;
  faultCounts: Record<string, number>;
  acknowledgedPending: boolean;
}

function sessionKey(drillId: string) {
  return `session.${drillId}`;
}

function loadSession(drillId: string): SessionState | null {
  try {
    const raw = localStorage.getItem(sessionKey(drillId));
    return raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    return null;
  }
}

function saveSession(drillId: string, s: SessionState) {
  localStorage.setItem(sessionKey(drillId), JSON.stringify(s));
}

export function TrainerHome({ content }: { content: Content }) {
  const [drillId, setDrillId] = useState<string>("");
  const [squadSize, setSquadSize] = useState<number>(12);
  const navigate = useNavigate();
  const drill = content.drills.find((d) => d.drill_id === drillId);

  const layoutRows =
    drill?.layout_ratio?.rows.filter((r) =>
      squadSize <= 24
        ? r.trainees.toLowerCase().includes("less")
        : r.trainees.toLowerCase().includes("more"),
    ) ?? [];

  return (
    <>
      <h1 className="command-display" style={{ fontSize: "clamp(28px,8vw,40px)" }}>
        Session prep
      </h1>
      <div className="gloss-bar">Trainer</div>

      <Section title="1 · Select drill">
        {content.drills.map((d) => (
          <button
            key={d.drill_id}
            className={`drill-card status-${d.content_status}`}
            style={
              d.drill_id === drillId
                ? { borderColor: "var(--brand)", borderWidth: 2 }
                : undefined
            }
            onClick={() => setDrillId(d.drill_id)}
          >
            <span className="malay" style={{ fontSize: 20 }}>
              {d.names.malay}
            </span>
            <span className={`status-chip ${d.content_status}`}>
              {STATUS_LABEL[d.content_status]}
            </span>
            <div className="english">{d.names.english}</div>
          </button>
        ))}
      </Section>

      {drill && (
        <>
          <Section title="2 · Squad size">
            <input
              className="num-input"
              type="number"
              min={1}
              max={200}
              value={squadSize}
              onChange={(e) => setSquadSize(Number(e.target.value))}
              aria-label="Squad size"
            />
            {drill.layout_ratio ? (
              layoutRows.length > 0 ? (
                <div style={{ marginTop: 10 }}>
                  <div className="eyebrow">
                    Manual band: {squadSize <= 24 ? "24 or less" : "More than 24"}
                  </div>
                  {layoutRows.map((r, i) => (
                    <div className="woc-card" key={i}>
                      <div style={{ fontSize: 15 }}>
                        <strong>{r.trainers}</strong> trainer(s) —{" "}
                        <strong>{r.squad_layout}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <PendingPanel reason="No layout row in the manual matches this squad size band." />
              )
            ) : (
              <PendingPanel reason="Layout & Ratio table for this drill is not present in the source draft." />
            )}
          </Section>

          <Section title="3 · Run">
            {drill.moi_sequence?.complete ? (
              <button
                className="big-btn"
                onClick={() => {
                  saveSession(drill.drill_id, {
                    squadSize,
                    stageIndex: 0,
                    reps: 0,
                    faultCounts: {},
                    acknowledgedPending: false,
                  });
                  navigate(`/trainer/session/${drill.drill_id}`);
                }}
              >
                Start session
              </button>
            ) : (
              <>
                <PendingPanel
                  reason={
                    drill.moi_sequence
                      ? "This drill's Sequence of Instructions exists in the draft but has empty rows. You may open the session in reference-only mode; the app will not fill the gaps."
                      : "This drill has no Sequence of Instructions in the source draft. You may open the session in reference-only mode; the app will not fill the gaps."
                  }
                />
                <button
                  className="big-btn"
                  onClick={() => {
                    saveSession(drill.drill_id, {
                      squadSize,
                      stageIndex: 0,
                      reps: 0,
                      faultCounts: {},
                      acknowledgedPending: true,
                    });
                    navigate(`/trainer/session/${drill.drill_id}`);
                  }}
                >
                  Acknowledge gap & open
                </button>
              </>
            )}
          </Section>
        </>
      )}
    </>
  );
}

export function SessionRunner({ content }: { content: Content }) {
  const { id } = useParams();
  const drill = content.drills.find((d) => d.drill_id === id);
  const [state, setState] = useState<SessionState | null>(() =>
    id ? loadSession(id) : null,
  );

  if (!drill || !state) {
    return (
      <p>
        No active session. <Link to="/trainer">Back to session prep</Link>
      </p>
    );
  }

  const update = (patch: Partial<SessionState>) => {
    const next = { ...state, ...patch };
    setState(next);
    saveSession(drill.drill_id, next);
  };

  const moiRows = drill.moi_sequence?.rows ?? [];
  const current = moiRows[state.stageIndex];
  const isPractice = current?.stage.toLowerCase().includes("practice");
  const allFaults = drill.stages_tables.flatMap((st) =>
    st.stages.flatMap((s) => s.common_faults),
  );
  const uniqueFaults = [...new Set(allFaults)];

  return (
    <>
      <Link to="/trainer" style={{ color: "var(--muted)", fontSize: 14 }}>
        ‹ End session
      </Link>
      <h1 className="command-display" style={{ fontSize: "clamp(26px,8vw,38px)" }}>
        {drill.names.malay}
      </h1>
      <div className="gloss-bar">
        {drill.names.english} · squad of {state.squadSize}
      </div>

      {moiRows.length > 0 ? (
        <Section title="Sequence of instructions" provenance={drill.moi_sequence!.table.provenance}>
          <ol className="moi-rail">
            {moiRows.map((row, i) => (
              <li
                key={i}
                className={
                  i === state.stageIndex ? "current" : i < state.stageIndex ? "done" : ""
                }
              >
                <div className="stage-name">{row.stage}</div>
                {i === state.stageIndex &&
                  (row.status === "pending" ? (
                    <PendingPanel reason="This stage's content is pending in the source draft. Deliver from your own qualification; the app will not supply wording." />
                  ) : (
                    <>
                      {row.what_to_do_or_say && (
                        <p style={{ whiteSpace: "pre-line", fontSize: 15, margin: "6px 0 0" }}>
                          {row.what_to_do_or_say}
                        </p>
                      )}
                      {row.action && (
                        <p
                          style={{
                            whiteSpace: "pre-line",
                            fontSize: 14,
                            color: "var(--muted)",
                            margin: "8px 0 0",
                          }}
                        >
                          {row.action}
                        </p>
                      )}
                    </>
                  ))}
              </li>
            ))}
          </ol>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              className="big-btn"
              style={{ flex: 1 }}
              disabled={state.stageIndex === 0}
              onClick={() => update({ stageIndex: state.stageIndex - 1 })}
            >
              ‹ Back
            </button>
            <button
              className="big-btn"
              style={{ flex: 1 }}
              disabled={state.stageIndex >= moiRows.length - 1}
              onClick={() => update({ stageIndex: state.stageIndex + 1 })}
            >
              Next ›
            </button>
          </div>
        </Section>
      ) : (
        <PendingPanel reason="Reference-only session: no Sequence of Instructions in the source draft for this drill." />
      )}

      {drill.structure_of_command && (
        <Section title="Command reference" provenance={drill.structure_of_command.provenance}>
          <VerbatimTable table={drill.structure_of_command} />
        </Section>
      )}

      {(isPractice || moiRows.length === 0) && (
        <Section title="Practice — fault tagging">
          {uniqueFaults.length > 0 ? (
            <>
              {uniqueFaults.map((f) => (
                <button
                  key={f}
                  className="fault-chip"
                  onClick={() =>
                    update({
                      faultCounts: {
                        ...state.faultCounts,
                        [f]: (state.faultCounts[f] ?? 0) + 1,
                      },
                    })
                  }
                >
                  <span className="count">{state.faultCounts[f] ?? 0}</span>
                  {f}
                </button>
              ))}
              <button
                className="big-btn semula"
                onClick={() => update({ reps: state.reps + 1 })}
              >
                Semula — as you were
              </button>
              <div className="rep-counter">
                Reps this session: {state.reps} · Faults tagged:{" "}
                {Object.values(state.faultCounts).reduce((a, b) => a + b, 0)}
              </div>
            </>
          ) : (
            <PendingPanel reason="No Common Faults are listed for this drill in the source draft, so fault tagging is unavailable." />
          )}
        </Section>
      )}
    </>
  );
}
