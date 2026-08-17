import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  STATUS_LABEL,
  figureUrl,
  provenanceLine,
  type Content,
  type Drill,
} from "../lib/content";
import { PendingPanel, Section, VerbatimTable } from "../components/common";

interface RepEntry {
  rep: number;
  faults: string[];
}

interface SessionState {
  squadSize: number;
  stageIndex: number;
  reps: number;
  faultCounts: Record<string, number>;
  currentRepFaults: string[];
  repLog: RepEntry[];
  acknowledgedPending: boolean;
  startedAt: string;
}

function sessionKey(drillId: string) {
  return `session.${drillId}`;
}

function loadSession(drillId: string): SessionState | null {
  try {
    const raw = localStorage.getItem(sessionKey(drillId));
    if (!raw) return null;
    const s = JSON.parse(raw) as SessionState;
    s.currentRepFaults ??= [];
    s.repLog ??= [];
    return s;
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
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const drill = content.drills.find((d) => d.drill_id === drillId);

  const term = q.trim().toLowerCase();
  const shown = content.drills.filter(
    (d) =>
      !term ||
      d.names.malay.toLowerCase().includes(term) ||
      d.names.english.toLowerCase().includes(term) ||
      // also match a fault or command inside the drill, so a trainer can
      // search by what they want to work on
      d.stages_tables.some((st) =>
        st.stages.some(
          (s) =>
            s.common_faults.some((f) => f.toLowerCase().includes(term)) ||
            s.command_verbatim.toLowerCase().includes(term),
        ),
      ),
  );

  const layoutRows =
    drill?.layout_ratio?.rows.filter((r) =>
      squadSize <= 24
        ? r.trainees.toLowerCase().includes("less")
        : r.trainees.toLowerCase().includes("more"),
    ) ?? [];

  const startSession = (acknowledged: boolean) => {
    if (!drill) return;
    saveSession(drill.drill_id, {
      squadSize,
      stageIndex: 0,
      reps: 0,
      faultCounts: {},
      currentRepFaults: [],
      repLog: [],
      acknowledgedPending: acknowledged,
      startedAt: new Date().toISOString(),
    });
    navigate(`/trainer/session/${drill.drill_id}`);
  };

  return (
    <>
      <h1 className="command-display" style={{ fontSize: "clamp(28px,8vw,40px)" }}>
        Session prep
      </h1>
      <div className="gloss-bar">Trainer</div>

      <Section title="1 · Select drill">
        <input
          className="search-input"
          type="search"
          placeholder="Search drills, commands or faults…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search drills"
        />
        {shown.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>
            Nothing matches "{q}".
          </p>
        )}
        {shown.map((d) => (
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
                <PendingPanel reason="The manual has no layout for this squad size." />
              )
            ) : (
              <PendingPanel reason="The manual has no layout and ratio table for this drill." />
            )}
          </Section>

          <Section title="3 · Run">
            {loadSession(drill.drill_id) && (
              <Link
                to={`/trainer/session/${drill.drill_id}`}
                className="drill-card"
                style={{ display: "block" }}
              >
                Resume previous session ›
              </Link>
            )}
            {drill.moi_sequence?.complete ? (
              <button className="big-btn" onClick={() => startSession(false)}>
                Start session
              </button>
            ) : (
              <>
                <PendingPanel
                  reason={
                    drill.moi_sequence
                      ? "Some rows of this drill's sequence are empty in the manual. You can still open it for reference."
                      : "The manual has no sequence of instructions for this drill. You can still open it for reference."
                  }
                />
                <button className="big-btn" onClick={() => startSession(true)}>
                  Acknowledge gap &amp; open
                </button>
              </>
            )}
          </Section>
        </>
      )}
    </>
  );
}

/** Stage-by-stage demonstration deck: the manual's stage figures and faults,
 * surfaced while the trainer runs the Demonstration passes. */
function DemoDeck({ drill }: { drill: Drill }) {
  const stages = drill.stages_tables.flatMap((st) =>
    st.stages.map((s) => ({
      table: st.caption_verbatim
        .replace(/^Table [\d-]+:?\s*/i, "")
        .replace(/ Break into Stages.*$/i, ""),
      stage: s.stage_label.replace(/\s*\n\s*/g, " "),
      command: s.command_verbatim,
      images: s.figure_reference.images ?? [],
      faults: s.common_faults,
    })),
  );
  if (stages.length === 0) return null;
  return (
    <div className="demo-deck">
      <div className="eyebrow" style={{ marginTop: 14 }}>
        Demonstration deck — stages &amp; watch-for faults
      </div>
      <div className="demo-scroll">
        {stages.map((s, i) => (
          <div className="demo-card" key={i}>
            <div className="eyebrow">
              {s.table} · stage {s.stage}
            </div>
            {s.images.map((img) => (
              <img key={img} src={figureUrl(img)} alt={`${s.table} stage ${s.stage} figure`} />
            ))}
            {s.command && <div className="demo-cmd">{s.command}</div>}
            {s.faults.length > 0 && (
              <ul className="fault-list">
                {s.faults.slice(0, 4).map((f, fi) => (
                  <li key={fi} style={{ fontSize: 13 }}>
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SessionRunner({ content }: { content: Content }) {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const tagFault = (f: string) =>
    update({
      faultCounts: { ...state.faultCounts, [f]: (state.faultCounts[f] ?? 0) + 1 },
      currentRepFaults: [...state.currentRepFaults, f],
    });

  const undoFault = () => {
    const last = state.currentRepFaults[state.currentRepFaults.length - 1];
    if (!last) return;
    update({
      faultCounts: {
        ...state.faultCounts,
        [last]: Math.max(0, (state.faultCounts[last] ?? 1) - 1),
      },
      currentRepFaults: state.currentRepFaults.slice(0, -1),
    });
  };

  const semula = () => {
    if ("vibrate" in navigator) navigator.vibrate(80);
    update({
      reps: state.reps + 1,
      repLog: [...state.repLog, { rep: state.reps + 1, faults: state.currentRepFaults }],
      currentRepFaults: [],
    });
  };

  const moiRows = drill.moi_sequence?.rows ?? [];
  const current = moiRows[state.stageIndex];
  const isPractice = current?.stage.toLowerCase().includes("practice");
  const isDemo = current?.stage.toLowerCase().includes("demonstration");
  const uniqueFaults = [
    ...new Set(
      drill.stages_tables.flatMap((st) => st.stages.flatMap((s) => s.common_faults)),
    ),
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Link to="/trainer" style={{ color: "var(--muted)", fontSize: 14 }}>
          ‹ Prep
        </Link>
        <button
          className="theme-btn"
          onClick={() => navigate(`/trainer/summary/${drill.drill_id}`)}
        >
          End session — debrief ›
        </button>
      </div>
      <h1 className="command-display" style={{ fontSize: "clamp(26px,8vw,38px)" }}>
        {drill.names.malay}
      </h1>
      <div className="gloss-bar">
        {drill.names.english} · squad of {state.squadSize}
      </div>

      {moiRows.length > 0 ? (
        <Section
          title="Sequence of instructions"
          provenance={drill.moi_sequence!.table.provenance}
        >
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
                    <PendingPanel reason="This stage is empty in the manual. Deliver it from your own qualification." />
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
          {isDemo && <DemoDeck drill={drill} />}
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
        <PendingPanel reason="Reference only — the manual has no sequence of instructions for this drill." />
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
              <div className="rep-counter">
                Rep {state.reps + 1} in progress — {state.currentRepFaults.length} fault
                {state.currentRepFaults.length === 1 ? "" : "s"} tagged this rep
                {state.currentRepFaults.length > 0 && (
                  <button className="theme-btn" style={{ marginLeft: 8 }} onClick={undoFault}>
                    undo
                  </button>
                )}
              </div>
              {uniqueFaults.map((f) => (
                <button key={f} className="fault-chip" onClick={() => tagFault(f)}>
                  <span className="count">{state.faultCounts[f] ?? 0}</span>
                  {f}
                </button>
              ))}
              <button className="big-btn semula" onClick={semula}>
                Semula — as you were
              </button>
              <div className="rep-counter">
                Completed reps: {state.reps} · total faults:{" "}
                {Object.values(state.faultCounts).reduce((a, b) => a + b, 0)}
              </div>
            </>
          ) : (
            <PendingPanel reason="The manual lists no common faults for this drill, so there is nothing to tag." />
          )}
        </Section>
      )}
    </>
  );
}

export function SessionSummary({ content }: { content: Content }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const drill = content.drills.find((d) => d.drill_id === id);
  const [state] = useState<SessionState | null>(() => (id ? loadSession(id) : null));
  const [copied, setCopied] = useState(false);

  if (!drill || !state) {
    return (
      <p>
        No session data. <Link to="/trainer">Back to session prep</Link>
      </p>
    );
  }

  const totalFaults = Object.values(state.faultCounts).reduce((a, b) => a + b, 0);
  const faultRows = Object.entries(state.faultCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const repLog = state.currentRepFaults.length
    ? [...state.repLog, { rep: state.reps + 1, faults: state.currentRepFaults }]
    : state.repLog;

  const summaryText = [
    `Session debrief — ${drill.names.english} (${drill.names.malay})`,
    `Squad size: ${state.squadSize} · Reps: ${state.reps} · Faults tagged: ${totalFaults}`,
    ``,
    `Fault counts (manual's own fault vocabulary):`,
    ...faultRows.map(([f, n]) => `  ${n}× ${f}`),
    ``,
    `Per rep:`,
    ...repLog.map((r) =>
      r.faults.length
        ? `  Rep ${r.rep}: ${r.faults.join("; ")}`
        : `  Rep ${r.rep}: no faults tagged`,
    ),
    ``,
    provenanceLine(content.manual),
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — text stays visible below */
    }
  };

  const endSession = () => {
    localStorage.removeItem(sessionKey(drill.drill_id));
    navigate("/trainer");
  };

  return (
    <>
      <Link to={`/trainer/session/${drill.drill_id}`} style={{ color: "var(--muted)", fontSize: 14 }}>
        ‹ Back to session
      </Link>
      <h1 className="command-display" style={{ fontSize: "clamp(26px,8vw,38px)" }}>
        Debrief
      </h1>
      <div className="gloss-bar">
        {drill.names.english} · squad of {state.squadSize}
      </div>

      <Section title="Totals">
        <div className="totals-row mono">
          <span>{state.reps} rep{state.reps === 1 ? "" : "s"}</span>
          <span>{totalFaults} fault{totalFaults === 1 ? "" : "s"} tagged</span>
        </div>
        {faultRows.length > 0 ? (
          faultRows.map(([f, n]) => (
            <div className="fault-chip" key={f} style={{ cursor: "default" }}>
              <span className="count">{n}</span>
              {f}
            </div>
          ))
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No faults tagged.</p>
        )}
      </Section>

      {repLog.length > 0 && (
        <Section title="Per rep">
          {repLog.map((r) => (
            <div className="woc-card" key={r.rep}>
              <div className="eyebrow">
                Rep {r.rep}
                {r.rep > state.reps ? " (in progress)" : ""}
              </div>
              <div style={{ fontSize: 14.5 }}>
                {r.faults.length ? r.faults.join("; ") : "No faults tagged."}
              </div>
            </div>
          ))}
        </Section>
      )}

      <Section title="Hand-off">
        <p style={{ fontSize: 13.5, color: "var(--muted)" }}>
          Counts of the faults you tagged during the session.
        </p>
        <button className="big-btn" onClick={copy}>
          {copied ? "Copied" : "Copy debrief text"}
        </button>
        <button
          className="big-btn"
          style={{ background: "var(--surface)", color: "var(--ink)", border: "1px solid var(--hairline)" }}
          onClick={endSession}
        >
          Close session &amp; clear
        </button>
      </Section>
    </>
  );
}
