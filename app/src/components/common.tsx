import type { ReactNode } from "react";
import {
  figureUrl,
  provenanceLine,
  type FigureRef,
  type Provenance,
  type TableRec,
} from "../lib/content";

export function PendingPanel({
  reason,
  verbatim,
  provenance,
}: {
  reason: string;
  verbatim?: string[];
  provenance?: Provenance;
}) {
  return (
    <div className="pending-panel">
      <span className="label">Pending</span>
      <div>{reason}</div>
      {verbatim && verbatim.length > 0 && (
        <div className="mono" style={{ marginTop: 4 }}>
          Marked in the manual as: {verbatim.join(" ")}
        </div>
      )}
      {provenance && <div className="provenance">{provenanceLine(provenance)}</div>}
    </div>
  );
}

export function Section({
  title,
  children,
  provenance,
}: {
  title: string;
  children: ReactNode;
  provenance?: Provenance;
}) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
      {provenance && <div className="provenance">{provenanceLine(provenance)}</div>}
    </section>
  );
}

/** Verbatim rendering of an extracted table grid — cells are shown exactly as
 * ingested; pending cells render their source marker. */
export function VerbatimTable({ table }: { table: TableRec }) {
  return (
    <div className="table-scroll">
      <table className="verbatim">
        <tbody>
          {table.grid.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci}>
                  {cell.text}
                  {cell.images?.map((img) => (
                    <img
                      key={img}
                      src={figureUrl(img)}
                      alt={`Figure from ${table.caption_verbatim}`}
                      style={{ maxWidth: 160, display: "block", marginTop: 4 }}
                    />
                  ))}
                  {cell.status === "placeholder_pending" && !cell.images && (
                    <span className="update-flag">{cell.placeholders?.join(" ")}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FigureView({ fig, alt }: { fig: FigureRef; alt: string }) {
  if (fig.status === "pending") {
    return (
      <PendingPanel
        reason="No figure for this stage in the manual."
        verbatim={fig.placeholder_text_verbatim}
      />
    );
  }
  return (
    <div className="stage-figure">
      {fig.images?.map((img) => (
        <img key={img} src={figureUrl(img)} alt={alt} />
      ))}
      {fig.placeholder_text_verbatim && fig.placeholder_text_verbatim.length > 0 && (
        <span className="update-flag">
          Marked for update in the manual: {fig.placeholder_text_verbatim.join(" ")}
        </span>
      )}
    </div>
  );
}
