import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Content } from "../lib/content";
import { Section } from "../components/common";

interface Pair {
  command: string;
  meaning: string;
  drill: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Match-the-pairs self check. Both sides are verbatim manual content
 * (command + meaning from the roster table); nothing is generated. */
function MatchingDrill({ content }: { content: Content }) {
  const allPairs = useMemo<Pair[]>(
    () =>
      content.roster
        .filter((r) => r.command && r.meaning)
        .map((r) => ({ command: r.command, meaning: r.meaning, drill: r.drill })),
    [content],
  );
  const [round, setRound] = useState(0);
  const pairs = useMemo(() => {
    // Some commands (e.g. "Sedi-A") appear in the roster with several
    // meanings; keep command texts distinct within a round so every
    // pairing has exactly one right answer.
    const seen = new Set<string>();
    const out: Pair[] = [];
    for (const p of shuffle(allPairs)) {
      if (seen.has(p.command)) continue;
      seen.add(p.command);
      out.push(p);
      if (out.length === 5) break;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPairs, round]);
  const meanings = useMemo(() => shuffle(pairs), [pairs]);
  const [selCmd, setSelCmd] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const pick = (meaning: Pair) => {
    if (!selCmd) return;
    if (meaning.command === selCmd) {
      setMatched(new Set([...matched, selCmd]));
      setWrong(null);
    } else {
      setWrong(meaning.meaning);
      setTimeout(() => setWrong(null), 900);
    }
    setSelCmd(null);
  };

  const done = matched.size === pairs.length;

  return (
    <>
      <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
        Match each command to its meaning.
      </p>
      <div className="match-grid">
        <div>
          {pairs.map((p) => (
            <button
              key={p.command}
              className={`match-item ${selCmd === p.command ? "sel" : ""} ${matched.has(p.command) ? "done" : ""}`}
              disabled={matched.has(p.command)}
              onClick={() => setSelCmd(p.command)}
            >
              {p.command}
            </button>
          ))}
        </div>
        <div>
          {meanings.map((p) => (
            <button
              key={p.meaning + p.command}
              className={`match-item meaning ${matched.has(p.command) ? "done" : ""} ${wrong === p.meaning ? "wrong" : ""}`}
              disabled={matched.has(p.command) || !selCmd}
              onClick={() => pick(p)}
            >
              {p.meaning}
            </button>
          ))}
        </div>
      </div>
      {done && (
        <div className="result-line">
          Round complete.
          <button className="play-btn" style={{ marginLeft: 10 }} onClick={() => { setMatched(new Set()); setRound(round + 1); }}>
            Next round
          </button>
        </div>
      )}
    </>
  );
}

/** The MOI Question stage, digitized as reveal-the-source prompts. Question
 * text and the expected-answer pointer are shown verbatim; the app never
 * composes an answer. */
function QuestionPrompts({ content }: { content: Content }) {
  const prompts = useMemo(() => {
    const out: { drillId: string; drillName: string; question: string; answerRef: string }[] = [];
    for (const d of content.drills) {
      const qRow = d.moi_sequence?.rows.find((r) =>
        r.stage.toLowerCase().includes("question"),
      );
      if (!qRow || qRow.status === "pending") continue;
      // Questions in the manual end with a closing curly quote after the
      // question mark (e.g. “What is the meaning of Sedi-A?”).
      const questions = qRow.what_to_do_or_say
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => /\?[”"']?$/.test(s));
      for (const q of questions) {
        out.push({
          drillId: d.drill_id,
          drillName: d.names.english,
          question: q,
          answerRef: qRow.action,
        });
      }
    }
    return out;
  }, [content]);

  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  if (prompts.length === 0) return null;
  return (
    <>
      <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 8 }}>
        Questions from the Question stage of each drill. Answer out loud, then
        check.
      </p>
      {prompts.map((p, i) => (
        <div className="woc-card" key={i}>
          <div className="eyebrow">{p.drillName}</div>
          <div style={{ fontSize: 16, marginTop: 4 }}>{p.question}</div>
          {revealed.has(i) ? (
            <div className="answer-ref">
              {p.answerRef}
              <div>
                <Link to={`/drill/${p.drillId}`} style={{ fontSize: 13.5 }}>
                  Open {p.drillName} ›
                </Link>
              </div>
            </div>
          ) : (
            <button
              className="reveal-btn"
              onClick={() => setRevealed(new Set([...revealed, i]))}
            >
              Show answer
            </button>
          )}
        </div>
      ))}
    </>
  );
}

export default function RevisePage({ content }: { content: Content }) {
  return (
    <>
      <h1 className="command-display" style={{ fontSize: "clamp(28px,8vw,40px)" }}>
        Self-check
      </h1>
      <div className="gloss-bar">Chapter 2 · Section 1</div>
      <Section title="Command ↔ meaning" provenance={content.roster[0]?.provenance}>
        <MatchingDrill content={content} />
      </Section>
      <Section title="Question stage">
        <QuestionPrompts content={content} />
      </Section>
    </>
  );
}
