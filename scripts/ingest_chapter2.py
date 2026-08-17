#!/usr/bin/env python3
"""Deterministic ingestion of SAF Drill Manual Chapter 2 Section 1 (.docx) into
canonical content JSON.

Zero-fabrication contract: this script performs mechanical extraction only —
table cells are copied verbatim, placeholder markers ("[Insert image]" etc.)
and empty cells are tagged `pending`, and nothing is ever paraphrased,
inferred, or generated. Every emitted field carries provenance back to the
source table.

Usage:
    python3 scripts/ingest_chapter2.py <path-to-chapter2.docx> [--out app/public]

Outputs:
    <out>/content/chapter2_section1.json   canonical content
    <out>/media/figures/*.png              images extracted from table cells
"""
import argparse
import json
import re
import shutil
import sys
from pathlib import Path

import docx
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

PLACEHOLDER_RE = re.compile(r"\[Insert[^\]]*\]", re.IGNORECASE)
BULLET_RE = re.compile(r"^[-–—•*]\s*")
PAUSE_2SEC_RE = re.compile(r"^\s*2\s*secs?\s*$", re.IGNORECASE)

# Owner-approved corrections applied after extraction. Each is recorded in the
# output so the change is visible and traceable — the app never silently
# diverges from the source. These exist to be pushed back into the manual.
CORRECTIONS = [
    {
        "id": "pause-1-sec",
        "applies_to": "structure_of_command.delivery_style.pause",
        "match": PAUSE_2SEC_RE,
        "replacement": "1 sec",
        "reason": "Regulation pause corrected to 1 sec by the content owner; "
        "source draft still reads '2 secs' and needs revision.",
        "authority": "content owner",
    },
]


def join_wrapped(text):
    """Split a table cell into logical items, re-joining Word's hard line
    wraps. A line continues the previous item when it starts with a lowercase
    letter or a digit; an explicit bullet marker always starts a new item.

    The 13 Aug draft stores mid-sentence wraps as real line breaks, so a naive
    newline split shatters one fault into fragments ("Not making a full" /
    "turn with body and shoulders...").
    """
    items = []
    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if not line:
            continue
        if BULLET_RE.match(line):
            items.append(BULLET_RE.sub("", line).strip())
        elif items and (line[0].islower() or line[0].isdigit()):
            items[-1] = f"{items[-1]} {line}"
        else:
            items.append(line)
    return [i for i in items if i]


def tidy(text):
    """Same wrap-joining, returned as text with one logical item per line."""
    return "\n".join(join_wrapped(text))

SOURCE_DOC = {
    "source_doc_id": "saf-drill-manual",
    "doc_version": "chapter2-caa-13-aug-26-draft",
    "chapter": 2,
    "section": 1,
    "section_title": "Stationary Drills",
}

# Deterministic caption -> drill mapping. Keys are literal substrings of table
# captions in the source document; no fuzzy matching.
DRILL_OF_CAPTION = [
    ("for Attention", "attention"),
    ("Attention Break into Stages", "attention"),
    ("for At Ease", "at_ease"),
    ("At Ease Break into Stages", "at_ease"),
    ("for Turning During Halt", "turning_during_halt"),
    ("Right Turn at the Halt", "turning_during_halt"),
    ("Left Turn at the Halt", "turning_during_halt"),
    ("About Turn at the Halt", "turning_during_halt"),
    ("for Dressing", "dressing"),
    ("In Open Order, Right Dress", "dressing"),
    ("In Close Order, Right Dress", "dressing"),
    ("Dressing By Numbers", "dressing"),
    ("Eyes Front Break into Stages", "dressing"),
    ("for the Bow", "bow"),
    ("for Bow", "bow"),
    ("The Bow Break into Stages", "bow"),
    ("Bow Break into Stages", "bow"),
    ("for the Salutation", "salutation"),
    ("for Salutation", "salutation"),
    ("The Salutation Break into Stages", "salutation"),
    ("Salutation Break into Stages", "salutation"),
    ("for the Mark Time", "mark_time"),
    ("for Mark Time", "mark_time"),
    ("Mark Time Break into Stages", "mark_time"),
    ("for the Three Cheers", "three_cheers"),
    ("for Three Cheers", "three_cheers"),
    ("Three Cheers Break into Stages", "three_cheers"),
    ("Recitation of Pledge", "pledge"),
]

TABLE_KIND = [
    ("Basic Commands", "glossary"),
    ("Stationary Drills", "roster"),
    ("Structure of Command", "structure_of_command"),
    ("Word of Command", "word_of_command"),
    ("Break into Stages", "stages"),
    ("Layout & Ratio", "layout_ratio"),
    ("Layout &amp; Ratio", "layout_ratio"),
    ("Sequence of Instructions", "moi_sequence"),
]

DRILL_NAMES = {
    "attention": {"malay": "Sedi-A", "english": "Attention"},
    "at_ease": {"malay": "Senang Di-Ri / Rehatkan Diri", "english": "At Ease / Stand Easy"},
    "turning_during_halt": {"malay": "Ke-Kiri/Ke-Kanan/Ke-Belakang Pu-Sing", "english": "Turning During Halt"},
    "dressing": {"malay": "Dalam Buka/Tutup Barisan, Ke-Kanan Lurus", "english": "Dressing"},
    "bow": {"malay": "Tun-Dok", "english": "Bow"},
    "salutation": {"malay": "Hormat", "english": "Salutation"},
    "mark_time": {"malay": "Hentak Kaki Cepat, Hen-Tak", "english": "Mark Time"},
    "three_cheers": {"malay": "Baris Akan Beri Tiga Sorakan…", "english": "Three Cheers"},
    "pledge": {"malay": "Ta'at Seti-A", "english": "Recitation of Pledge/Creed"},
    "side_pace": {"malay": "…Langkah Ke Sebelah…, Gerak", "english": "Side Pace"},
    "dismissing": {"malay": "Skuad, Bersu-Rai / Skuad, Keluar Baris", "english": "Dismissing and Falling Out"},
}

# Order in which drills appear in the manual's own roster + later sections.
DRILL_ORDER = [
    "attention", "at_ease", "turning_during_halt", "dressing", "bow",
    "salutation", "mark_time", "three_cheers", "pledge", "side_pace",
    "dismissing",
]


def iter_blocks(doc):
    for child in doc.element.body.iterchildren():
        if child.tag == qn("w:p"):
            yield Paragraph(child, doc)
        elif child.tag == qn("w:tbl"):
            yield Table(child, doc)


def cell_images(cell, rels):
    """Return media filenames referenced by images inside a table cell."""
    names = []
    for blip in cell._tc.iter(qn("a:blip")):
        rid = blip.get(qn("r:embed"))
        if rid and rid in rels:
            part = rels[rid].target_part
            names.append(Path(part.partname).name)
    return names


def cell_record(cell, rels):
    text = cell.text.strip()
    placeholders = PLACEHOLDER_RE.findall(text)
    images = cell_images(cell, rels)
    rec = {"text": text}
    if placeholders:
        rec["placeholders"] = placeholders
        rec["status"] = "placeholder_pending"
    elif not text and not images:
        rec["status"] = "empty"
    else:
        rec["status"] = "present"
    if images:
        rec["images"] = images
    return rec


def dedupe_row(cells):
    """Merged docx cells repeat; collapse consecutive duplicates."""
    out = []
    for c in cells:
        if out and out[-1]["text"] == c["text"] and out[-1].get("images") == c.get("images"):
            continue
        out.append(c)
    return out


def table_grid(tbl, rels):
    grid = []
    for row in tbl.rows:
        grid.append(dedupe_row([cell_record(c, rels) for c in row.cells]))
    return grid


# Header-row shapes are the most reliable classifier — the draft's captions
# contain copy/paste errors (e.g. an MOI table carrying the preceding layout
# table's caption), while header rows are consistent throughout.
HEADER_KIND = [
    (("stage", "what to do"), "moi_sequence"),
    (("stages", "command"), "stages"),
    (("type of drills", "trainees"), "layout_ratio"),
    (("word of command",), "word_of_command"),
    (("full command",), "structure_of_command"),
    (("malay word", "english word"), "glossary"),
    (("s/n", "stationary drills"), "roster"),
]


def classify(caption, grid=None):
    kind = None
    if grid and grid[0]:
        header = [c["text"].lower() for c in grid[0][:3]]
        joined = " | ".join(header)
        for needles, k in HEADER_KIND:
            if all(any(n in h for h in header) or n in joined for n in needles):
                kind = k
                break
    if kind is None:
        for marker, k in TABLE_KIND:
            if marker.lower() in caption.lower():
                kind = k
                break
    drill = None
    for marker, d in DRILL_OF_CAPTION:
        if marker.lower() in caption.lower():
            drill = d
            break
    return kind, drill


def data_rows(grid, header_first_cell):
    """Return the data rows, skipping row 0 only when it really is the header.

    Not every table in the draft has one — the Dressing MOI table starts
    straight on a data row, and blindly dropping row 0 lost its Formation of
    Squad content.
    """
    if grid and grid[0] and grid[0][0]["text"].strip().lower().startswith(
        header_first_cell.lower()
    ):
        return grid[1:]
    return grid


def parse_stages(grid):
    """Rows: Stage | Command | Figure Reference | Common Fault."""
    stages = []
    for row in data_rows(grid, "stage"):
        cells = row + [{"text": "", "status": "empty"}] * (4 - len(row))
        fig = cells[2]
        figure = {
            "status": "pending" if fig["status"] in ("placeholder_pending", "empty") else "present",
        }
        if fig.get("placeholders"):
            figure["placeholder_text_verbatim"] = fig["placeholders"]
        if fig.get("images"):
            figure["images"] = fig["images"]
            figure["status"] = "present"
        stages.append({
            "stage_label": cells[0]["text"],
            "command_verbatim": tidy(cells[1]["text"]),
            "figure_reference": figure,
            "common_faults": join_wrapped(cells[3]["text"]),
        })
    return stages


def parse_layout_ratio(grid):
    rows = []
    for row in data_rows(grid, "type of drills"):
        cells = row + [{"text": ""}] * (4 - len(row))
        rows.append({
            "drill_type": cells[0]["text"],
            "trainees": cells[1]["text"],
            "trainers": cells[2]["text"],
            "squad_layout": cells[3]["text"],
        })
    return rows


def parse_moi(grid):
    rows = []
    complete = True
    for row in data_rows(grid, "stage"):
        cells = row + [{"text": "", "status": "empty"}] * (3 - len(row))
        say, action = cells[1], cells[2]
        empty = not say["text"].strip() and not action["text"].strip()
        if empty:
            complete = False
        rows.append({
            "stage": cells[0]["text"].strip(),
            "what_to_do_or_say": tidy(say["text"]),
            "action": tidy(action["text"]),
            "status": "pending" if empty else "present",
        })
    return rows, complete


def parse_word_of_command(grid):
    rows = []
    for row in data_rows(grid, "word of command"):
        cells = row + [{"text": "", "status": "empty"}] * (4 - len(row))
        rows.append({
            "word_of_command": tidy(cells[0]["text"]),
            "quick_time_when_given": tidy(cells[1]["text"]),
            "slow_time_when_given": tidy(cells[2]["text"]),
            "squad_call_out": tidy(cells[3]["text"]),
            "placeholders": cells[0].get("placeholders", []),
        })
    return rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("docx_path")
    ap.add_argument("--out", default="app/public")
    args = ap.parse_args()

    doc = docx.Document(args.docx_path)
    rels = doc.part.rels
    out = Path(args.out)
    fig_dir = out / "media" / "figures"
    fig_dir.mkdir(parents=True, exist_ok=True)

    drills = {
        d: {
            "drill_id": d,
            "names": DRILL_NAMES[d],
            "structure_of_command": None,
            "word_of_command": None,
            "stages_tables": [],
            "layout_ratio": None,
            "moi_sequence": None,
            "tables": [],
        }
        for d in DRILL_ORDER
    }
    glossary, roster, orphan_tables = [], [], []
    applied_corrections = []

    last_caption = ""
    prev_texts = []  # recent paragraph texts, for caption lookup

    for block in iter_blocks(doc):
        if isinstance(block, Paragraph):
            t = block.text.strip()
            if t:
                prev_texts.append(t)
                if t.lower().startswith("table"):
                    last_caption = t
            continue

        grid = table_grid(block, rels)
        caption = last_caption
        # Some tables carry their own caption as a single spanning first row
        # (e.g. "Table 2-1-7: Sequence of Instructions for Attention" while
        # the preceding caption paragraph is a stale copy of the previous
        # table's). The embedded caption is authoritative; lift it out.
        if grid and len(grid[0]) == 1 and grid[0][0]["text"].lower().startswith("table"):
            caption = grid[0][0]["text"]
            grid = grid[1:]
        kind, drill = classify(caption, grid)

        # Apply owner-approved corrections, keeping the source text alongside.
        if kind == "structure_of_command":
            for row in grid:
                if not row or not row[0]["text"].lower().startswith("delivery style"):
                    continue
                for cell in row:
                    for corr in CORRECTIONS:
                        if corr["match"].match(cell["text"]):
                            applied_corrections.append({
                                "correction_id": corr["id"],
                                "table_caption": caption,
                                "source_text": cell["text"],
                                "corrected_text": corr["replacement"],
                                "reason": corr["reason"],
                                "authority": corr["authority"],
                            })
                            cell["source_text"] = cell["text"]
                            cell["text"] = corr["replacement"]
                            cell["corrected"] = corr["id"]
        # The draft contains at least one layout table whose caption names the
        # wrong drill; the table's own first column names the drill it belongs
        # to, so for layout tables the row content is authoritative.
        if kind == "layout_ratio" and len(grid) > 1 and grid[1]:
            row_drill_text = grid[1][0]["text"].lower()
            for marker, d in [("attention", "attention"), ("at ease", "at_ease"),
                              ("turning during halt", "turning_during_halt"),
                              ("dressing", "dressing"), ("bow", "bow"),
                              ("salutation", "salutation")]:
                if marker in row_drill_text:
                    drill = d
                    break
        table_rec = {
            "caption_verbatim": caption,
            "kind": kind or "unclassified",
            "grid": grid,
            "provenance": {**SOURCE_DOC, "table_caption": caption},
        }

        if kind == "glossary":
            for row in data_rows(grid, "malay word"):
                if len(row) >= 2:
                    glossary.append({"malay": row[0]["text"], "english": row[1]["text"],
                                     "provenance": {**SOURCE_DOC, "table_caption": caption}})
        elif kind == "roster":
            for row in data_rows(grid, "s/n"):
                cells = row + [{"text": ""}] * (4 - len(row))
                roster.append({"sn": cells[0]["text"], "drill": tidy(cells[1]["text"]),
                               "command": tidy(cells[2]["text"]),
                               "meaning": tidy(cells[3]["text"]),
                               "provenance": {**SOURCE_DOC, "table_caption": caption}})
        elif drill:
            rec = drills[drill]
            rec["tables"].append(table_rec)
            if kind == "structure_of_command":
                rec["structure_of_command"] = table_rec
            elif kind == "word_of_command":
                rec["word_of_command"] = {
                    "rows": parse_word_of_command(grid), "table": table_rec}
            elif kind == "stages":
                rec["stages_tables"].append({
                    "caption_verbatim": caption,
                    "stages": parse_stages(grid),
                    "provenance": table_rec["provenance"],
                })
            elif kind == "layout_ratio":
                rec["layout_ratio"] = {
                    "rows": parse_layout_ratio(grid), "table": table_rec}
            elif kind == "moi_sequence":
                rows, complete = parse_moi(grid)
                rec["moi_sequence"] = {
                    "rows": rows, "complete": complete, "table": table_rec}
        else:
            # Trailing draft tables (Side Pace, Dismissing, etc.) keep their
            # surrounding heading text for context.
            table_rec["context_paragraphs"] = prev_texts[-3:]
            if kind == "moi_sequence" or (grid and grid[0] and grid[0][0]["text"] == "Stage"):
                rows, complete = parse_moi(grid)
                table_rec["moi_rows"] = rows
                table_rec["moi_complete"] = complete
            orphan_tables.append(table_rec)

    # Route trailing tables to drills by heading context (deterministic
    # substring rules against the draft's own headings/captions).
    for t in orphan_tables:
        ctx = " ".join(t.get("context_paragraphs", [])) + " " + t["caption_verbatim"]
        target = None
        if "SIDE PACE" in ctx or "Side pace" in ctx or "LANGKAH" in json.dumps(t["grid"]):
            target = "side_pace"
        elif "DISMISS" in ctx.upper() or "BERSU" in json.dumps(t["grid"]).upper():
            target = "dismissing"
        elif "2-13" in t["caption_verbatim"]:
            target = "salutation"
        if target:
            drills[target]["tables"].append(t)
        else:
            drills.setdefault("_unrouted", {"tables": []})
            drills["_unrouted"]["tables"].append(t)

    # Completeness rollup per drill: which of the five core tables exist.
    for d in DRILL_ORDER:
        rec = drills[d]
        missing, pending_figs = [], 0
        for key in ("structure_of_command", "word_of_command", "stages_tables",
                    "layout_ratio", "moi_sequence"):
            v = rec[key]
            if v is None or v == []:
                missing.append(key)
        for st in rec["stages_tables"]:
            for s in st["stages"]:
                if s["figure_reference"]["status"] == "pending":
                    pending_figs += 1
        moi_complete = bool(rec["moi_sequence"]) and rec["moi_sequence"]["complete"]
        if not missing and moi_complete and pending_figs == 0:
            status = "complete"
        elif len(missing) >= 5:
            status = "name_only"
        else:
            status = "partial"
        rec["content_status"] = status
        rec["missing_tables"] = missing
        rec["pending_figure_slots"] = pending_figs

    # Copy referenced images out of the docx package.
    import zipfile
    used = set()
    for d in drills.values():
        for t in d.get("tables", []):
            for row in t["grid"]:
                for c in row:
                    used.update(c.get("images", []))
    with zipfile.ZipFile(args.docx_path) as z:
        for name in z.namelist():
            base = Path(name).name
            if name.startswith("word/media/") and base in used:
                with z.open(name) as src, open(fig_dir / base, "wb") as dst:
                    shutil.copyfileobj(src, dst)

    content = {
        "manual": SOURCE_DOC,
        "ingestion": {
            "method": "deterministic-table-extraction",
            "generator": "scripts/ingest_chapter2.py",
            "no_llm_in_path": True,
        },
        "corrections_applied": applied_corrections,
        "glossary": glossary,
        "roster": roster,
        "drills": [drills[d] for d in DRILL_ORDER],
        "unrouted_tables": drills.get("_unrouted", {}).get("tables", []),
    }

    content_dir = out / "content"
    content_dir.mkdir(parents=True, exist_ok=True)
    dest = content_dir / "chapter2_section1.json"
    with open(dest, "w") as f:
        json.dump(content, f, indent=1, ensure_ascii=False)

    print(f"wrote {dest}")
    for d in DRILL_ORDER:
        r = drills[d]
        print(f"  {d:22s} {r['content_status']:9s} tables={len(r['tables'])} "
              f"pending_figs={r['pending_figure_slots']} missing={r['missing_tables']}")
    print(f"  glossary={len(glossary)} roster_rows={len(roster)} "
          f"unrouted={len(content['unrouted_tables'])} images={len(used)}")


if __name__ == "__main__":
    sys.exit(main())
