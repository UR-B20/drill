import type { Content } from "../lib/content";
import { Section } from "../components/common";

export default function GlossaryPage({ content }: { content: Content }) {
  return (
    <>
      <h1 className="command-display" style={{ fontSize: "clamp(28px,8vw,40px)" }}>
        Glossary
      </h1>
      <div className="gloss-bar">Basic commands to alert the trainees</div>
      <Section title="Formation vocabulary" provenance={content.glossary[0]?.provenance}>
        {content.glossary.map((g, i) => (
          <div className="woc-card" key={i}>
            <div className="cmd" style={{ fontSize: 22 }}>
              {g.malay}
            </div>
            <div className="gloss-bar" style={{ marginTop: 4 }}>
              {g.english}
            </div>
          </div>
        ))}
      </Section>
      <Section title="Drill commands at a glance" provenance={content.roster[0]?.provenance}>
        <div className="table-scroll">
          <table className="verbatim">
            <tbody>
              <tr>
                <td>Drill</td>
                <td>Command</td>
                <td>Meaning</td>
              </tr>
              {content.roster.map((r, i) => (
                <tr key={i}>
                  <td>{r.drill}</td>
                  <td style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                    {r.command}
                  </td>
                  <td>{r.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
