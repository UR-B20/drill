/** Local practice log. Self/buddy records only — explicitly not
 * trainer-verified data, and never mixed with it. */

export interface PracticeRecord {
  drillId: string;
  at: string; // ISO timestamp
  source: "self" | "buddy";
  faults: string[]; // verbatim fault strings ticked by the observer
}

const KEY = "practice.log";
const MAX_ENTRIES = 300;

function readLog(): PracticeRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as PracticeRecord[];
  } catch {
    return [];
  }
}

function writeLog(log: PracticeRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(log.slice(-MAX_ENTRIES)));
}

export function markPracticed(
  drillId: string,
  source: PracticeRecord["source"] = "self",
  faults: string[] = [],
) {
  const log = readLog();
  const now = new Date();
  const last = log[log.length - 1];
  // Collapse bursts: one "self" entry per drill per 10 minutes.
  if (
    source === "self" &&
    last?.drillId === drillId &&
    last.source === "self" &&
    now.getTime() - new Date(last.at).getTime() < 10 * 60 * 1000
  ) {
    return;
  }
  log.push({ drillId, at: now.toISOString(), source, faults });
  writeLog(log);
}

export function recordsFor(drillId: string): PracticeRecord[] {
  return readLog().filter((r) => r.drillId === drillId);
}

export function daysSinceLastPractice(drillId: string): number | null {
  const recs = recordsFor(drillId);
  if (recs.length === 0) return null;
  const last = new Date(recs[recs.length - 1].at).getTime();
  return Math.floor((Date.now() - last) / (24 * 60 * 60 * 1000));
}
