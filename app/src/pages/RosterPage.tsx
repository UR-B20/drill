import { Link } from "react-router-dom";
import { STATUS_LABEL, type Content } from "../lib/content";
import { Section } from "../components/common";

export default function RosterPage({ content }: { content: Content }) {
  const counts = content.drills.reduce(
    (acc, d) => ({ ...acc, [d.content_status]: (acc[d.content_status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );
  return (
    <>
      <h1 className="command-display" style={{ fontSize: "clamp(28px,8vw,40px)" }}>
        Stationary Drills
      </h1>
      <div className="gloss-bar">Chapter 2 · Section 1</div>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 10 }}>
        {content.drills.length} drills — {counts.complete ?? 0} complete,{" "}
        {counts.partial ?? 0} partial, {counts.name_only ?? 0} pending content.
        Every entry below traces to the source manual; gaps are shown, never filled.
      </p>
      <Section title="Drill roster">
        {content.drills.map((d) => (
          <Link key={d.drill_id} to={`/drill/${d.drill_id}`} className={`drill-card status-${d.content_status}`}>
            <span className="malay">{d.names.malay}</span>
            <span className={`status-chip ${d.content_status}`}>{STATUS_LABEL[d.content_status]}</span>
            <div className="english">{d.names.english}</div>
          </Link>
        ))}
      </Section>
    </>
  );
}
