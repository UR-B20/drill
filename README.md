# SAF Drill Coach

Mobile-first interactive platform for SAF foot-drill training — a trainee
reference/revision surface and a trainer session-runner — piloted on
**SAF Drill Manual, Chapter 2 Section 1 (Stationary Drills)** plus companion
videos.

**Zero-fabrication principle:** every instructional fact shown to any user
traces verbatim to the ingested manual or an approved companion video. Where
the source draft has gaps (`[Insert image]` markers, empty tables), the UI
shows an explicit *Pending — not yet authorized* state. Nothing is generated,
inferred, or paraphrased anywhere in the content path.

## Repo layout

| Path | What |
|---|---|
| `app/` | Vite + React + TS mobile-first web app (trainee + trainer surfaces) |
| `app/public/content/` | Canonical content JSON (generated, committed) |
| `app/public/media/` | Figures extracted from the manual + companion videos |
| `app/public/contract/v1/` | Trainer Copilot data contract (manifest + generation boundary) |
| `scripts/ingest_chapter2.py` | Deterministic docx → JSON extraction (no LLM in the path) |
| `scripts/export_contract.py` | Contract manifest projection |
| `docs/FEATURE_PLAN.md` | Full feature plan (83 features, critique-amended) |
| `docs/DESIGN_DIRECTION.md` | Visual identity: "parade square instrument" |
| `docs/COPILOT_CONTRACT.md` | Copilot integration contract & grounding rules |
| `.claude/skills/` | Vendored Superpowers skills (see its README) |

## Run

```bash
cd app
npm install
npm run dev        # dev server
npm run build      # production build to app/dist
```

## Re-ingest content

The source `.docx` is not committed. To re-ingest after a manual revision:

```bash
pip install python-docx
python3 scripts/ingest_chapter2.py <path-to-chapter2.docx> --out app/public
python3 scripts/export_contract.py
```

Both scripts are deterministic — output diffs correspond 1:1 to source diffs.

## Corrections

`scripts/ingest_chapter2.py` carries a small `CORRECTIONS` table for changes
approved by the content owner that the source manual has not yet adopted. Each
one is applied after extraction, keeps the original value in `source_text`, and
is listed in `corrections_applied` in the output JSON. Currently:

| Correction | Change | Status |
|---|---|---|
| `pause-1-sec` | Regulation pause `2 secs` → `1 sec` (all 9 Structure of Command tables) | Source draft still reads "2 secs" — needs manual revision |

## Current content coverage (from the 13 Aug source draft)

9 drills complete (Attention, At Ease, Turning During Halt, Dressing, Bow,
Salutation, Mark Time, Three Cheers, Pledge/Creed); Side Pace and Dismissing
are name-only — the earlier draft's trailing tables for them were removed in
this revision. One companion video (Skuad, Bersurai). The app renders gaps
honestly; they close by revising the source manual and re-ingesting, never by
authoring content here.
