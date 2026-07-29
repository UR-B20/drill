import { useParams, Link } from "react-router-dom";
import {
  mediaUrl,
  provenanceLine,
  type CompanionVideo,
  type Content,
} from "../lib/content";
import {
  FigureView,
  PendingPanel,
  Section,
  VerbatimTable,
} from "../components/common";

export default function DrillPage({
  content,
  videos,
}: {
  content: Content;
  videos: CompanionVideo[];
}) {
  const { id } = useParams();
  const drill = content.drills.find((d) => d.drill_id === id);
  if (!drill) {
    return (
      <p>
        Unknown drill. <Link to="/">Back to roster</Link>
      </p>
    );
  }
  const video = videos.find((v) => v.drill_id === drill.drill_id);

  return (
    <>
      <Link to="/" style={{ color: "var(--muted)", fontSize: 14 }}>
        ‹ Roster
      </Link>
      <h1 className="command-display">{drill.names.malay}</h1>
      <div className="gloss-bar">{drill.names.english}</div>

      {drill.content_status !== "complete" && (
        <PendingPanel
          reason={
            drill.content_status === "name_only"
              ? "This drill is listed in the manual's roster, but its instruction tables are not yet present in the source draft."
              : `Some content for this drill is still pending in the source draft${drill.missing_tables.length ? ` (missing: ${drill.missing_tables.join(", ")})` : ""}.`
          }
        />
      )}

      {drill.structure_of_command && (
        <Section
          title="Structure of command"
          provenance={drill.structure_of_command.provenance}
        >
          <VerbatimTable table={drill.structure_of_command} />
        </Section>
      )}

      {drill.word_of_command && (
        <Section
          title="Word of command"
          provenance={drill.word_of_command.table.provenance}
        >
          {drill.word_of_command.rows.map((row, i) => (
            <div className="woc-card" key={i}>
              <div className="cmd">{row.word_of_command}</div>
              <dl className="woc-grid">
                {row.quick_time_when_given && (
                  <>
                    <dt>Quick time — when given</dt>
                    <dd>{row.quick_time_when_given}</dd>
                  </>
                )}
                {row.slow_time_when_given && row.slow_time_when_given !== "-" && (
                  <>
                    <dt>Slow time — when given</dt>
                    <dd>{row.slow_time_when_given}</dd>
                  </>
                )}
                {row.squad_call_out && (
                  <>
                    <dt>Squad calls out</dt>
                    <dd className="callout">{row.squad_call_out}</dd>
                  </>
                )}
              </dl>
            </div>
          ))}
        </Section>
      )}

      {drill.stages_tables.map((st) => (
        <Section
          key={st.caption_verbatim}
          title={st.caption_verbatim.replace(/^Table [\d-]+:?\s*/i, "")}
          provenance={st.provenance}
        >
          {st.stages.map((s, i) => (
            <div className="stage-card" key={i}>
              <div className="stage-head">
                <span className="stage-no">STAGE {s.stage_label.split("\n")[0]}</span>
                <span className="stage-cmd">{s.command_verbatim}</span>
              </div>
              <div className="stage-body">
                <FigureView
                  fig={s.figure_reference}
                  alt={`Demonstration figure for ${drill.names.english}, stage ${s.stage_label}`}
                />
                {s.common_faults.length > 0 && (
                  <>
                    <div className="eyebrow" style={{ marginTop: 10 }}>
                      Common faults
                    </div>
                    <ul className="fault-list">
                      {s.common_faults.map((f, fi) => (
                        <li key={fi}>{f}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </Section>
      ))}

      {drill.layout_ratio && (
        <Section
          title="Squad layout & ratio"
          provenance={drill.layout_ratio.table.provenance}
        >
          <VerbatimTable table={drill.layout_ratio.table} />
        </Section>
      )}

      {drill.moi_sequence && (
        <Section
          title="Sequence of instructions"
          provenance={drill.moi_sequence.table.provenance}
        >
          {!drill.moi_sequence.complete && (
            <PendingPanel reason="This drill's Sequence of Instructions table exists in the draft but its content rows are still empty." />
          )}
          {drill.moi_sequence.rows.map((row, i) =>
            row.status === "pending" ? (
              <div className="woc-card" key={i}>
                <div className="eyebrow">{row.stage}</div>
                <div style={{ color: "var(--muted)", fontSize: 14 }}>
                  Pending in source draft.
                </div>
              </div>
            ) : (
              <div className="woc-card" key={i}>
                <div className="eyebrow">{row.stage}</div>
                {row.what_to_do_or_say && (
                  <p style={{ whiteSpace: "pre-line", margin: "6px 0 0", fontSize: 14.5 }}>
                    {row.what_to_do_or_say}
                  </p>
                )}
                {row.action && (
                  <p
                    style={{
                      whiteSpace: "pre-line",
                      margin: "8px 0 0",
                      fontSize: 14,
                      color: "var(--muted)",
                    }}
                  >
                    {row.action}
                  </p>
                )}
              </div>
            ),
          )}
        </Section>
      )}

      {/* Trailing draft tables routed to this drill (e.g. Side Pace, Dismissing) */}
      {drill.tables
        .filter(
          (t) =>
            t !== drill.structure_of_command &&
            t.kind !== "word_of_command" &&
            t.kind !== "stages" &&
            t.kind !== "layout_ratio" &&
            t.kind !== "moi_sequence" &&
            t.context_paragraphs,
        )
        .map((t, i) => (
          <Section key={i} title={t.caption_verbatim || "Additional table"} provenance={t.provenance}>
            <VerbatimTable table={t} />
          </Section>
        ))}

      {video && (
        <Section title="Companion video">
          {mediaUrl(video.file) ? (
            <div className="video-frame">
              <video src={mediaUrl(video.file)!} controls playsInline preload="metadata" />
            </div>
          ) : (
            <div className="pending-panel">
              <span className="label">Not included in this preview build</span>
              The companion video plays in the full app; it was left out of this
              single-file preview to keep it small.
            </div>
          )}
          <div className="cadence-line">{video.on_screen_text.timing_cadence}</div>
          {video.on_screen_text.technique_cues.map((c) => (
            <div className="cue-block" key={c.beat_label}>
              <div className="cue-beat">{c.beat_label}</div>
              <ul className="fault-list">
                {c.cues.map((cue, i) => (
                  <li key={i} style={{ fontSize: 14.5 }}>
                    {cue}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="provenance">
            Companion video ({video.format}, {video.duration_seconds}s) — on-screen
            text transcribed verbatim from the clip.
          </div>
        </Section>
      )}

      <div className="provenance" style={{ marginTop: 32 }}>
        {provenanceLine(content.manual)} · ingestion: {content.ingestion.method}
      </div>
    </>
  );
}
