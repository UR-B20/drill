import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Content } from "../lib/content";

/** Full-screen swipe deck for the minutes before falling in: Malay command
 * up front, tap to reveal the meaning. All text verbatim from the roster. */
export default function CramPage({ content }: { content: Content }) {
  const cards = useMemo(
    () =>
      content.roster.filter((r) => r.command && r.meaning),
    [content],
  );
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const touchX = useRef<number | null>(null);

  if (cards.length === 0) {
    return (
      <p>
        No roster content. <Link to="/">Back</Link>
      </p>
    );
  }
  const card = cards[idx];

  const go = (delta: number) => {
    setIdx((i) => (i + delta + cards.length) % cards.length);
    setFlipped(false);
  };

  return (
    <div
      className="cram"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (dx < -48) go(1);
        else if (dx > 48) go(-1);
        touchX.current = null;
      }}
    >
      <div className="cram-head">
        <Link to="/" style={{ color: "var(--muted)", fontSize: 14 }}>
          ‹ Done
        </Link>
        <span className="mono" style={{ fontSize: 13 }}>
          {idx + 1} / {cards.length}
        </span>
      </div>
      <button
        className="cram-card"
        onClick={() => setFlipped(!flipped)}
        aria-label={flipped ? "Show command" : "Reveal meaning"}
      >
        <div className="eyebrow">{card.drill}</div>
        <div className="cram-command">{card.command}</div>
        {flipped ? (
          <div className="gloss-bar" style={{ fontSize: 18 }}>
            {card.meaning}
          </div>
        ) : (
          <div className="cram-hint">tap to reveal meaning</div>
        )}
      </button>
      <div className="cram-nav">
        <button className="big-btn" style={{ flex: 1 }} onClick={() => go(-1)}>
          ‹ Prev
        </button>
        <button className="big-btn" style={{ flex: 1 }} onClick={() => go(1)}>
          Next ›
        </button>
      </div>
      <div className="provenance" style={{ textAlign: "center" }}>
        {content.roster[0] && content.roster[0].provenance.table_caption}
      </div>
    </div>
  );
}
