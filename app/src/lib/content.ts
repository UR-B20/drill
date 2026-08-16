export interface CellRec {
  text: string;
  status: "present" | "empty" | "placeholder_pending";
  placeholders?: string[];
  images?: string[];
}

export interface Provenance {
  source_doc_id: string;
  doc_version: string;
  chapter: number;
  section: number;
  section_title: string;
  table_caption?: string;
}

export interface TableRec {
  caption_verbatim: string;
  kind: string;
  grid: CellRec[][];
  provenance: Provenance;
  context_paragraphs?: string[];
  moi_rows?: MoiRow[];
  moi_complete?: boolean;
}

export interface FigureRef {
  status: "present" | "pending";
  placeholder_text_verbatim?: string[];
  images?: string[];
}

export interface Stage {
  stage_label: string;
  command_verbatim: string;
  figure_reference: FigureRef;
  common_faults: string[];
}

export interface StagesTable {
  caption_verbatim: string;
  stages: Stage[];
  provenance: Provenance;
}

export interface WocRow {
  word_of_command: string;
  quick_time_when_given: string;
  slow_time_when_given: string;
  squad_call_out: string;
  placeholders: string[];
}

export interface LayoutRow {
  drill_type: string;
  trainees: string;
  trainers: string;
  squad_layout: string;
}

export interface MoiRow {
  stage: string;
  what_to_do_or_say: string;
  action: string;
  status: "present" | "pending";
}

export interface Drill {
  drill_id: string;
  names: { malay: string; english: string };
  structure_of_command: TableRec | null;
  word_of_command: { rows: WocRow[]; table: TableRec } | null;
  stages_tables: StagesTable[];
  layout_ratio: { rows: LayoutRow[]; table: TableRec } | null;
  moi_sequence: { rows: MoiRow[]; complete: boolean; table: TableRec } | null;
  tables: TableRec[];
  content_status: "complete" | "partial" | "name_only";
  missing_tables: string[];
  pending_figure_slots: number;
}

export interface Content {
  manual: Provenance;
  ingestion: { method: string; generator: string; no_llm_in_path: boolean };
  glossary: { malay: string; english: string; provenance: Provenance }[];
  roster: { sn: string; drill: string; command: string; meaning: string; provenance: Provenance }[];
  drills: Drill[];
  unrouted_tables: TableRec[];
}

export interface VideoCue {
  beat_label: string;
  cues: string[];
}

export interface CompanionVideo {
  video_id: string;
  file: string;
  drill_id: string;
  duration_seconds: number;
  format: string;
  approval_status: string;
  on_screen_text: {
    command_display: string;
    gloss_bar: string;
    timing_cadence: string;
    technique_cues: VideoCue[];
    full_beat_map_status: string;
  };
}

export interface VideoRegistry {
  videos: CompanionVideo[];
}

export const STATUS_LABEL: Record<Drill["content_status"], string> = {
  complete: "Complete",
  partial: "Partial",
  name_only: "Pending",
};

const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export const SINGLEFILE = import.meta.env.VITE_SINGLEFILE === "1";

interface InlineData {
  available: boolean;
  content: Content | null;
  videos: VideoRegistry | null;
  figures: Record<string, string>;
  media: Record<string, string>;
}

let inline: InlineData | null = null;

async function getInline(): Promise<InlineData | null> {
  if (!SINGLEFILE) return null;
  if (!inline) inline = (await import("../generated/inline-data")) as InlineData;
  return inline.available ? inline : null;
}

export async function loadContent(): Promise<Content> {
  const inl = await getInline();
  if (inl?.content) return inl.content;
  const res = await fetch(`${base}/content/chapter2_section1.json`);
  if (!res.ok) throw new Error(`content load failed: ${res.status}`);
  return res.json();
}

export async function loadVideos(): Promise<VideoRegistry> {
  const inl = await getInline();
  if (inl?.videos) return inl.videos;
  const res = await fetch(`${base}/content/videos.json`);
  if (!res.ok) return { videos: [] };
  return res.json();
}

export function figureUrl(name: string): string {
  if (inline?.available && inline.figures[name]) return inline.figures[name];
  return `${base}/media/figures/${name}`;
}

/** Resolve a media path (e.g. a companion video's file) to a playable URL.
 * Returns null in single-file preview builds where the asset was excluded. */
export function mediaUrl(path: string): string | null {
  if (inline?.available) return inline.media[path] ?? null;
  return `${base}${path}`;
}

export function provenanceLine(p: Provenance): string {
  const cap = p.table_caption ? ` · ${p.table_caption}` : "";
  return `SAF Drill Manual Ch ${p.chapter} §${p.section} (${p.doc_version})${cap}`;
}
