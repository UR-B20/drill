import { useState } from "react";
import { Link } from "react-router-dom";
import { STATUS_LABEL, type Content } from "../lib/content";
import { Section } from "../components/common";
import { daysSinceLastPractice } from "../lib/practice";

export default function RosterPage({ content }: { content: Content }) {
  const [q, setQ] = useState("");
  const counts = content.drills.reduce(
    (acc, d) => ({ ...acc, [d.content_status]: (acc[d.content_status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );
  const shown = content.drills.filter(
    (d) =>
      !q ||
      d.names.malay.toLowerCase().includes(q.toLowerCase()) ||
      d.names.english.toLowerCase().includes(q.toLowerCase()),
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
      <Link to="/cram" className="cram-link">
        ⚡ Cram deck — commands &amp; meanings, full screen
      </Link>
      <input
        className="search-input"
        type="search"
        placeholder="Search commands or meanings…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search drills"
      />
      <Section title="Drill roster">
        {shown.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No drill matches "{q}".</p>
        )}
        {shown.map((d) => {
          const days = daysSinceLastPractice(d.drill_id);
          return (
            <Link key={d.drill_id} to={`/drill/${d.drill_id}`} className={`drill-card status-${d.content_status}`}>
              <span className="malay">{d.names.malay}</span>
              <span className={`status-chip ${d.content_status}`}>{STATUS_LABEL[d.content_status]}</span>
              {days !== null && days >= 7 && (
                <span className="status-chip stale">{days}d since practice</span>
              )}
              <div className="english">{d.names.english}</div>
            </Link>
          );
        })}
      </Section>
    </>
  );
}
