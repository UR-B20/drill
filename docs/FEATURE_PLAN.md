# SAF Drill Coach — Feature Plan

> Pilot scope: SAF Drill Manual, Chapter 2 Section 1 (Stationary Drills) + companion videos.
> Zero-fabrication constraint: every instructional fact shown to any user must trace to the ingested manual (or an approved companion video). Gaps render as explicit "content pending" states — never generated content.

Produced by a multi-lens planning workflow (six ideation lenses -> synthesis -> adversarial critique) grounded in a full extraction of the chapter and frame-by-frame review of the sample companion video.

## Definition of done for the pilot

"Done" for the Chapter 2 / Section 1 pilot means: the draft .docx has been run through a non-generative, table-cell-level extraction pipeline into the canonical per-drill schema, every "[Insert image]"/"[Insert QR code]" placeholder and every empty table (Salutation, Mark Time, Three Cheers, Recitation of Pledge/Creed) is tagged placeholder_pending rather than silently dropped, and an SME has actually reviewed and approved every field before it can render anywhere. On top of that data: a trainee can open the app, browse the ~10-drill roster and glossary, drill into any command's syllable/tone breakdown, staged demonstration (photo, ghost-progression diagram, or the one approved companion video), common-faults checklist, and Question-stage quiz — with every gap showing an explicit "not yet authorized" tile instead of blank space or invented text — and can do all of this offline outdoors in daylight. A trainer can build a same-day session pack from the approved drills, run the live 5-stage MOI flow (formation, explanation, three-pass demonstration, question, practice) end to end for at least one full drill with the ratio/layout lookup, command/cadence reference cards, staged demo deck, fault-tagging, and "Semula" reset all working offline, with any drill containing gaps forcing an explicit skip/acknowledge rather than the trainer improvising content. The Trainer Copilot gets a frozen, versioned, machine-readable contract (canonical drill JSON, completeness flags, provenance pointers, glossary lookup, a small set of safe pre-defined jobs, and a mandatory read-only/refusal behavior spec) that a separate team could integrate against without ever needing to guess the manual's structure or risk fabricating a gap — even though no copilot reasoning is built here. Success is demonstrated, not assumed: at least one real squad runs a full practice session on this chapter using only the app (no printed manual required for the drills that are complete), the fault/quiz data flows into a real per-trainee mastery ledger and squad readiness view, and an audit of everything shown during that session traces every fact back to a specific table/row in the source manual with zero instances of generated or inferred drill content.

## Features (83 total: 49 MVP, 28 Phase 2, 5 Phase 3, 1 Future)

### Trainee App

- **Command Structure & Syllable Breakdown Viewer** `MVP`  
  Tap-through card rendering each drill's Structure of Command table: Introductory / Cautionary / Pause (2 sec) / Executionary segments, each tagged with its prescribed delivery tone (calm & clear / loud & sustained / sharp & distant) and shown with the literal syllable split (e.g. 'Se — di... — A!') animated in sync with a beat, echoing the source companion video's typed-syllable style.  
  *Why:* Drill commands are graded on exact syllable landing and tone, not just wording, so trainees need the manual's own segment/tone/syllable data as a rehearsable unit rather than flat prose they'd have to re-derive.
- **Bilingual Glossary with Inline Term Lookup** `MVP`  
  Surfaces the Malay/English formation glossary (Baris/Parade, Skuad/Squad, Seksyen/Section, Platun/Platoon, etc.) as a standalone reference list and as tap-to-define chips wherever those terms appear inside a drill card or video caption.  
  *Why:* Every drill is bilingual and trainees must know both the Malay word of command and its English meaning; inline lookup keeps translation grounded in the one approved glossary table instead of ad hoc explanation.
- **Staged Demonstration / Ghost-Progression Viewer** `MVP`  
  Plays the per-stage Figure Reference for a drill — a demonstration photo, a 'ghost progression' diagram (stage-1-faded → stage-2-faded → final-position-solid), or the short vertical companion video — with a stepper to move between the drill's 1-3 stages exactly as laid out in the 'Break into Stages' table.  
  *Why:* This is the manual's actual mechanism for teaching multi-stage movements; a trainee scrubbing between stages on their own phone replicates rehearsal a trainer would otherwise repeat in person.
- **Cadence & Timing Metronome Trainer** `MVP`  
  An offline-capable, interactive metronome/haptic player that reproduces the exact Quick Time and Slow Time trigger points and squad call-out cadence from the Word-of-Command table (e.g. 'One, Bang', 'In, Left, Right, Left, Right, Swing'), with a tempo toggle and a large tap target usable without close visual attention.  
  *Why:* Timing/cadence is explicitly graded motor-skill content, not recall trivia — quick vs slow time and exact footfall landing is a rhythm skill static text cannot teach, and this is the one feature letting a trainee drill it solo before the parade square.
- **Common Faults Self-Check Checklist** `MVP`  
  For each stage of a drill, lists the manual's 'Common Faults' as a checklist a trainee can tick off against their own performance (self-assessed or with a buddy watching), rather than as inert prose.  
  *Why:* Faults are already itemized per stage in the source; turning them into an actionable self-correction checklist is the highest-leverage low-effort use of existing content for solo practice.
- **Manual-Sourced Comprehension Quiz (Question Stage Digitized)** `MVP`  
  Converts each drill's MOI 'Question' stage into multiple-choice/recall self-check prompts copied verbatim from that drill's Structure-of-Command, Word-of-Command, and Stages tables — no generated distractors or explanations — with every item citing the exact table/row it came from.  
  *Why:* The manual already designs these questions to check comprehension during live instruction; reusing them verbatim, and only where they exist, lets trainees self-test without the platform inventing pedagogy or answer rationale, while producing a citation-backed record of what was actually asked.
- **"Content Pending / Not Yet Authorized" Visible State** `MVP`  
  A consistent, clearly-labeled placeholder UI (distinct from an error or blank screen) that appears anywhere the source has a gap — '[Insert image]', a missing Figure Reference, or an empty Word-of-Command/Stages table (Salutation, Mark Time, Three Cheers, Recitation of Pledge/Creed) — instead of hiding the drill or rendering guessed content.  
  *Why:* This is the direct product expression of the zero-fabrication constraint: trainees must always be able to tell 'not taught yet' apart from 'nothing to learn here,' especially since this pilot chapter is a known-incomplete draft.
- **Quick-Reference Drill Roster ("Cram Sheet")** `MVP`  
  A single condensed, scrollable list of all ~10 stationary drills showing Malay command, English meaning, and syllable split at a glance, for fast lookup in the minutes before falling in.  
  *Why:* Trainees need a fast pre-parade refresher, not a deep-dive session; this reuses the same roster/command data as the detail views but optimizes for speed of scanning rather than depth.
- **Trainee Content-Accuracy Flagging** `MVP`  
  A lightweight 'something looks off' flag on any drill card or media item that routes to the content team for review — a simple flag-plus-comment is sufficient for the pilot, not a full triage dashboard.  
  *Why:* Because this is a live draft chapter with acknowledged gaps and the platform must never patch a gap with generated content, the fastest safe path to fixing an error is a trainee-sourced signal a human reviews, not an automated fix.
- **Eyes-Free / Screen-Off Cadence Playback Mode** `Phase 2`  
  A lock-screen/background-audio playback mode that reads out or beats the Word-of-Command timing and squad call-out cadence for a chosen drill so a trainee can rehearse by ear while standing in formation without holding or looking at the phone.  
  *Why:* A trainee at attention in a squad cannot stare at a screen; converting the same cadence data already needed for the metronome trainer into a podcast-like audio stream extends practice into the one setting where visual UI is impossible to use.
- **Source-Verified Pronunciation Clip Library** `Phase 2`  
  Plays short audio clips of the Malay command spoken with correct tone and syllable timing, sourced only from approved companion videos' audio tracks (never synthesized text-to-speech), with a 'not yet recorded' pending state for drills lacking an approved clip.  
  *Why:* Correct pronunciation and tone are part of the graded skill, but the zero-fabrication rule means the platform cannot synthesize a voice for commands it was never given audio for — this scales the one existing video's audio pattern as real recordings are collected.
- **Per-Drill Personal Mastery View & Practice Log** `Phase 2`  
  Lets a trainee add a self-confidence tag (Not Started / Practicing / Confident) on top of their own quiz-attempt and fault-check history pulled from the shared mastery ledger, stored locally and synced when connectivity returns.  
  *Why:* Trainees juggling ~10 drills need a personal read on progress without the platform inventing any judgment of performance it cannot observe; this is a light personal layer over the Assessment ledger, not a new source of truth.
- **Pre-/During-/Post-Session Mode Switcher** `Phase 2`  
  A top-level toggle that reshapes the app around the moment: 'Before' surfaces full detail (videos, quiz, glossary), 'At the Square' collapses to the audio-cadence player and faults checklist only, and 'After' prompts a quick self-debrief logging which faults occurred and which drills to revisit.  
  *Why:* Use before and after a live parade-square session are genuinely distinct moments with different needs; a single undifferentiated view forces the trainee to hunt for the right feature at the wrong time.
- **Self-Check Glossary & Command-Syllable Recall Drills** `Phase 2`  
  Lightweight, non-gamified recall quizzes limited strictly to rote-safe content — the glossary's Malay/English vocabulary and the literal syllable-split strings from the Structure-of-Command tables — for asynchronous flashcard-style study, distinct from both the passive glossary lookup and the technique-oriented MOI Question-stage quiz.  
  *Why:* It deliberately separates content that is safe to self-quiz without a trainer present (vocabulary, exact command wording) from motor/timing skill that only a trainer can observe live, keeping the quiz honest about what it can and cannot certify on its own.
- **Formation & Ratio Context View ("Where Do I Stand")** `Phase 3`  
  A simplified, trainee-oriented rendering of the 'Layout & Ratio' table showing the expected formation shape (2 rows facing each other / U-shape / 3 ranks open order) for the current squad size, mainly for orientation before falling in.  
  *Why:* This table is primarily a trainer planning tool, but a plain-language preview of the formation reduces confusion during the live Formation-of-Squad stage without requiring any content beyond what the manual already specifies.

### Trainer App

- **Pre-Parade Session & Lesson Plan Builder** `MVP`  
  Before marching out, the trainer selects which of the ~10 stationary drills to cover that session and in what order; the app assembles a session pack (command cards, MOI outline, ratio/layout recommendation, fault checklists) for only those drills, pulled directly from the ingested chapter with nothing generated. For the pilot this is a simple drill picker, not a scheduling system.  
  *Why:* Trainers need desk-time prep away from the parade square, and catching an incomplete-content drill (e.g. Three Cheers, Salutation with empty tables) before parade lets them substitute another drill instead of improvising content live.
- **Squad Layout & Ratio Calculator** `MVP`  
  Trainer enters the actual squad size for the day; the app looks up the Layout & Ratio table for the selected drill and returns the prescribed trainer:trainee ratio and formation shape (2 rows facing, U-shape, 3 ranks open order), switching at the <=24 / >24 threshold, with a simple schematic of where instructor(s) and ranks stand.  
  *Why:* This ratio/shape decision is explicit graded content that varies by drill and squad size in the manual; automating the lookup removes reliance on an instructor's memory and keeps formations consistent across sessions.
- **Guided 5-Stage MOI Live Session Runner** `MVP`  
  A step-through flow that walks the trainer through the manual's fixed Sequence of Instructions for the selected drill — Formation of Squad, Explanation, Demonstration (3 sub-passes), Question, Practice — surfacing only the source material relevant to the current stage, with the ability to move forward, back, or jump between sub-passes.  
  *Why:* The MOI sequence is fixed, standardized pedagogy in the manual; a guided runner keeps every instructor executing the same stages in the same order instead of freelancing, which is the core standardization goal for this app.
- **Command Delivery Reference Card** `MVP`  
  A large-type, high-contrast card for the active drill showing the Structure of Command broken into Introductory / Cautionary / Pause (2 sec) / Executionary segments, each labeled with its prescribed delivery tone and literal syllable split (e.g. 'Se — di... — A!').  
  *Why:* Exact tone and syllable landing is graded content, not flavor text — different instructors saying a command differently is a standardization failure this app exists to prevent, with large/high-contrast display addressing sun-glare legibility.
- **Word-of-Command Timing & Cadence Reference** `MVP`  
  Shows the Quick Time vs Slow Time trigger points (e.g. 'left heel strikes the ground') and the exact spoken cadence the squad calls out (e.g. 'One, Bang', 'In, Left, Right, Left, Right, Swing') for the active drill, with a toggle between Quick Time and Slow Time variants where the manual defines both.  
  *Why:* Timing and cadence are rhythm-sensitive skill content the trainer must call correctly in real time during Practice, so it needs to be glanceable without breaking eye contact with the squad.
- **Stage-by-Stage Demonstration Deck** `MVP`  
  For the Demonstration sub-pass 'in stages,' surfaces the Break-into-Stages table for the active drill: staged command phrasing, the Figure Reference (photo or ghost-progression diagram), and that stage's Common Faults list, advancing in sync with the MOI runner.  
  *Why:* This mirrors the manual's literal structure for teaching multi-step movements; putting faults right next to the stage they belong to primes the trainer for what to watch for before Practice starts.
- **Comprehension Question Prompter** `MVP`  
  During the Question stage, displays only the comprehension questions the source manual actually defines for that drill (answers keyed back to the Word-of-Command/Stages tables); if a drill has no authored questions, shows an explicit 'no questions authorized yet' state instead of leaving the trainer to invent one.  
  *Why:* This is the MOI stage most tempting to improvise on the fly, so it is the most direct enforcement point for zero-fabrication in a live session.
- **Live Fault Tagging & Common-Fault Observation Checklist** `MVP`  
  During Practice, the trainer taps from a pre-populated, stage-specific list of that drill's Common Faults (verbatim from the source) against the squad as a whole or specific numbered trainees, timestamped and tied to a rep number — no free-text fault invention required.  
  *Why:* Constraining fault tags to the manual's own vocabulary keeps live fault-logging fast under parade conditions while keeping the resulting data clean, comparable across trainers, non-fabricated, and directly usable by the Assessment mastery ledger.
- **"Semula" Repeat/Reset Control** `MVP`  
  A one-tap action that logs the current rep as complete, records which faults were flagged during it, resets the display back to the same command/cadence card, and increments a rep counter — mirroring the manual's own 'Semula' reset command rather than making the trainer re-navigate the flow.  
  *Why:* 'Semula' is the manual's standard repeat mechanism for practice reps; making it a first-class control keeps the tool from getting in the way during rapid, repeated drilling.
- **Content-Pending / Not-Yet-Authorized Banner** `MVP`  
  Any stage, table, figure reference, or fault list still containing source placeholders ('[Insert image]', '[Insert QR code]', the empty Salutation/Mark Time/Three Cheers/Pledge tables) is visibly marked pending inside the live session flow, and the trainer must explicitly acknowledge the gap or skip the drill rather than silently proceeding as if content existed.  
  *Why:* This is the direct UI enforcement of the zero-fabrication constraint at the exact point of use — mid-session, under time pressure — where the temptation to paraphrase from memory is highest.
- **Approved Companion Video Playback in Session Flow** `MVP`  
  Where an approved companion video exists for a drill/stage (e.g. the vertical clip with synced syllables, English gloss, annotated technique cues, and on-screen timing cadence), the trainer can play it inline during Demonstration or as the Figure Reference for a stage; drills without an approved video show the pending state instead.  
  *Why:* This is exactly what the manual's Figure Reference/QR-code placeholders are meant to resolve to, giving trainers a camera-verified demonstration instead of individual interpretation of a static photo.
- **Multi-Instructor Squad-Split Coordination** `Phase 2`  
  When the Ratio Calculator recommends splitting a large squad (>24) across multiple assistant instructors, the lead trainer can divide the roster into sub-groups, assign an instructor to each, and see at a glance which MOI stage and rep each sub-group is currently on.  
  *Why:* The manual's own ratio table anticipates squads too large for one instructor; without coordination, sub-groups drift out of sync on stage and cadence, undermining the standardization this app is meant to enforce.
- **Post-Session Debrief & Fault Summary Report** `Phase 2`  
  After a session ends, auto-compiles which drills/stages were covered, aggregated fault frequency (squad-wide and, where tagged, per trainee), number of Semula reps per drill, and time spent per MOI stage into a reviewable/exportable summary for planning the next session.  
  *Why:* Turns the fault data captured live into something actionable for the next session's focus, without requiring the trainer to reconstruct what happened from memory afterward.
- **Command Wording/Tone Divergence Flag** `Phase 2`  
  If a trainer believes local practice for a command's wording, tone, or timing differs from what the reference card shows, they can flag that specific field for review by the content owner with a note; the trainer app never lets them edit the authoritative text directly.  
  *Why:* Preserves the single-source-of-truth/zero-fabrication model while giving a legitimate channel for real standardization drift between senior instructors to surface and get resolved upstream instead of silently persisting.
- **MOI Stage Delivery Tracker** `Phase 2`  
  A per-session checklist mirroring the manual's fixed five-stage Sequence of Instructions that the trainer marks off as each stage is actually delivered, including how many 'Semula' repeat reps were run during Practice.  
  *Why:* Records whether a drill was actually taught per the manual's prescribed method rather than assumed, giving downstream analytics a denominator — fault data is meaningless to compare across squads if one squad's Practice stage was cut short.
- **Per-Trainee Roster & Longitudinal Fault History** `Phase 3`  
  Trainer maintains a persistent numbered roster across sessions, and faults tagged to individual trainees during Practice accumulate into a per-trainee history, so recurring problem areas for a given soldier are visible session over session rather than reset every parade.  
  *Why:* Once fault-tagging is proven within a single session, tracking individual improvement over time is the natural next step, but it needs roster/identity infrastructure that is overkill for validating a single pilot chapter.

### Trainer Copilot Contract

- **Grounded Manual Q&A with Table-Level Citations** `MVP`  
  The copilot answers trainer questions (e.g. 'what's the pause length before the executionary part of Attention?') by retrieving the exact field from the ingested Chapter 2 tables and citing the drill name plus table/row it came from, never paraphrasing beyond the source wording for commands, timings, or tone cues.  
  *Why:* Because every fact shown to a user must trace to source, the platform must hand the copilot a retrieval surface precise enough to answer at table-row granularity so a trainer can verify sensitive details like exact syllable splits and pause durations instead of trusting free-text generation.
- **Per-Drill Structured Content Contract (canonical drill JSON)** `MVP`  
  The platform exposes one canonical, versioned JSON object per drill, keyed by a stable drill ID, containing all recurring sub-structures observed in the manual: glossary refs, Structure of Command (tone + syllable split), Word of Command (quick/slow-time triggers + cadence call-outs), Break-into-Stages (staged phrasing, figure reference, common faults), Layout & Ratio by squad-size band, and the 5-stage MOI sequence.  
  *Why:* This is the load-bearing contract item: without a machine-readable per-drill object mirroring the manual's exact structure, the copilot would have to parse prose or infer table boundaries itself, reintroducing the fabrication risk the project must prevent.
- **Completeness / Pending-Content Flag Contract** `MVP`  
  Every drill object and every sub-table or field carries an explicit status enum (complete / partial / placeholder-pending) plus, where relevant, the literal placeholder text found in the source, so the copilot can programmatically distinguish 'nothing here yet' from 'I didn't look.'  
  *Why:* This is the direct technical enforcement of zero-fabrication for the copilot: the only reliable way for it to say 'not yet authorized' instead of guessing, which matters because whole stage tables are empty in this draft chapter.
- **Provenance & Citation Pointer Schema** `MVP`  
  Every field in the drill content contract carries a provenance pointer (source document ID and ingestion version, page/section number, table name, row index) that the copilot must surface verbatim in answers, and that can be used to invalidate cached copilot answers when the underlying field changes.  
  *Why:* This is an actively-edited working draft; a citation not tied to a specific ingested version can silently go stale, and in a discipline-training context an outdated citation presented as current is worse than admitting no citation exists.
- **Bilingual Glossary Lookup Contract** `MVP`  
  The platform exposes the Chapter 2 glossary plus each drill's own command vocabulary as a flat, queryable lookup (Malay term, English gloss, drills where it appears) separate from the drill tables.  
  *Why:* Commands are bilingual and vocabulary recurs across drills; a dedicated lookup keeps simple translation/definition answers cheap and exact, decoupled from timing/technique content that needs heavier sourcing scrutiny.
- **Command-Phrasing Clarification Job (syllable/tone breakdown)** `MVP`  
  A defined copilot job that, given a drill ID, returns the exact Introductory/Cautionary/Pause(2s)/Executionary breakdown with literal syllable split and prescribed delivery tone straight from that drill's Structure of Command table.  
  *Why:* Pronunciation and cadence are graded content — a trainer calling a command with the wrong tone or syllable landing is actively teaching the fault, so this job must be a verbatim lookup, never the copilot's own guess at Malay phonetics.
- **Fault-Checklist Generator Job** `MVP`  
  Given a drill ID (and optionally a stage number), the copilot assembles a checklist of the exact Common Faults bullets listed in that drill's Break-into-Stages table, grouped by stage, formatted for a trainer to carry onto the parade square.  
  *Why:* Faults are already enumerated per stage in the source, so this job is pure re-formatting of existing structured content — exactly the kind of high-value, zero-fabrication-risk task a grounded copilot should be trusted with first.
- **Read-Only Scoped API & Content-Gap Refusal Contract** `MVP`  
  A governance contract restricting the copilot to read-only, citation-required endpoints over approved fields only, with a mandatory standard 'not yet authorized in the source manual' response (optionally logging the gap for content owners) whenever a query touches a placeholder-pending field — structurally excluding any endpoint that would let it fabricate, infer, or paraphrase beyond stored fields.  
  *Why:* Because the copilot is built independently, the shape of the data contract is this project's only lever over its behavior; combining the access boundary with the mandatory refusal behavior is what actually stops fabrication rather than merely recommending it.
- **Assessment & Readiness Query Data Contract** `MVP`  
  Defines the read-only data the copilot may query — per-trainee/squad mastery ledger, fault history, MOI delivery status, and content-provenance/pending flags — keyed to drill/stage/table-row IDs, with no endpoint that lets the copilot author or infer new drill content.  
  *Why:* The copilot's usefulness for coaching questions like 'is this squad ready for Mark Time' depends entirely on this project exposing accurate, tightly-scoped assessment data rather than leaving the copilot to guess.
- **Unusual-Squad-Size Lesson Plan Adapter Job** `Phase 2`  
  Given a drill ID and a trainer-supplied squad size, the copilot drafts a lesson plan by selecting the matching Layout & Ratio row (<=24 vs >24, or explicitly flagging that the size falls outside documented bands) and sequencing it against that drill's fixed 5-stage MOI, rather than inventing a new ratio or formation shape.  
  *Why:* Real squads rarely land cleanly on the manual's two documented size bands; the contract must force the copilot to cite the nearest documented band and flag any extrapolation instead of inventing one.
- **Trainer-Supplied Context Schema (non-authoritative tagging)** `Phase 2`  
  A structured input schema (squad size, session date/location, available trainers, equipment notes) a trainer can submit for the copilot to combine with manual content; every response field must be tagged manual-sourced (authoritative) or trainer-supplied/copilot-composed (non-authoritative) so the two are never conflated.  
  *Why:* Once the copilot blends sourced drill facts with trainer context, as in lesson planning, this boundary stops a trainer from mistaking a scheduling suggestion or extrapolated ratio for a fact that traces back to the manual.
- **MOI Question-Stage Quiz Generator Job** `Phase 2`  
  The copilot assembles comprehension-check questions for the MOI's 'Question' stage using only content already implied by that drill's Word-of-Command and Stages tables, pulling the expected answer from the same tables rather than composing new questions — and only for drills whose tables are marked complete.  
  *Why:* The manual already prescribes a Question stage whose answers point back to existing tables, so this is assembly of pre-existing Q&A pairs, not invention, and it naturally depends on the completeness contract.
- **Fault-Log Ingestion Schema (controlled vocabulary)** `Phase 2`  
  A structured schema for a trainer's live fault observations during Practice (drill ID, stage number, fault selected from that drill's own Common Faults enum, squad/trainee reference, timestamp), constraining entries to the manual's documented fault vocabulary rather than free text.  
  *Why:* Keeping fault logging on a closed, source-derived vocabulary is what makes the downstream debrief-summarization job safe from surfacing faults that were never actually taught, defined, or observed.
- **Squad Debrief Summarizer Job** `Phase 2`  
  Given a session's set of fault-log entries, the copilot produces a plain-language squad debrief (e.g. '3 trainees showed early-thigh-drop on Mark Time stage 2') built only from counts and patterns in the logged, controlled-vocabulary fault data, not from re-diagnosing footage or inferring new causes.  
  *Why:* Trainers need a fast after-action summary per squad; constraining the copilot to summarize structured logs rather than freely describe performance keeps the debrief auditable and tied strictly to what was actually recorded.
- **Companion-Video Storyboard Generator Job + Media Contract** `Phase 2`  
  The platform exposes a structured video/figure contract per companion asset, matching the observed 'Skuad, Bersurai' format (syllable-timed command text, English gloss bar, annotated technique-cue frames, on-screen cadence text) tagged to a drill/stage and an approval status; the copilot's storyboard job fills a new video's shot list only from that drill's own sourced fields, flagging any beat it cannot source.  
  *Why:* The product owner plans to shoot more videos in this exact format, so a shot-list schema tied to sourced fields — instead of an open prompt like 'write a script for Mark Time' — keeps new video content from drifting off the manual's approved wording, tone, and timing.
- **Manual Versioning & Multi-Chapter Grounding Contract** `Phase 3`  
  As placeholders get resolved and further chapters are onboarded beyond this pilot, the platform exposes a change feed (content changed, drill IDs affected, old status → new status) and a stable chapter/drill ID namespace so the copilot's retrieval index can be selectively invalidated and cross-chapter terms resolve to the right section.  
  *Why:* This is explicitly a single-chapter pilot ahead of onboarding the whole manual; the copilot contract needs a versioning/namespacing seam defined now, or the citation and completeness contracts built for Chapter 2 will need a disruptive redesign at full-manual scale.
- **Human-Approved Content Suggestion Loop** `Future`  
  A feedback contract letting a trainer flag a copilot-composed output (an adapted lesson plan, a proposed clarification) as worth keeping, routing it to the platform's content-authoring side as a candidate for manual authors to formally review and, only if approved, ingest as real source content with its own provenance record.  
  *Why:* Gives genuinely useful copilot output a legitimate path into the authoritative corpus, rather than discarding it or letting it quietly masquerade as already-approved content, preserving the zero-fabrication boundary as copilot usage grows.

### Shared Content Platform & Data

- **Canonical Multi-Table Drill Schema** `MVP`  
  A structured data model per drill mirroring the manual's own recurring structure — linked sub-tables for Structure of Command, Word of Command, Break into Stages, Layout & Ratio, and Sequence of Instructions/MOI, plus a Glossary entity — instead of one flattened content field, so each table's rows and columns are individually addressable, editable, and approvable.  
  *Why:* The manual is not prose; it's ~10 drills each expressed through the same recurring table shapes. Flattening it forces free-text re-authoring later just to 'make it read nicely,' which is exactly the paraphrasing the zero-fabrication constraint forbids.
- **Table-Cell-Level Docx Extraction Pipeline** `MVP`  
  An ingestion pipeline that parses the .docx's embedded tables and images using deterministic structural rules (table position, header-row match, cell coordinates) to populate the canonical schema field-by-field, with no LLM summarization or rewriting step anywhere in the extraction path — only mechanical parsing plus a mandatory manual field-mapping step for ambiguous tables.  
  *Why:* Ingestion is the single highest-risk point for a well-intentioned LLM to 'clean up' a syllable split or cadence phrase; the pipeline must be structurally incapable of inventing text, not merely instructed not to.
- **Placeholder & Gap Tagging** `MVP`  
  During ingestion, automatically detect known placeholder markers ('[Insert image]', '[Insert updated image]', '[Insert QR code]') and empty/header-only tables (Salutation, Mark Time, Three Cheers, Pledge/Creed), and tag each as an explicit content_status: pending_source node with a typed reason — distinct from a field that is legitimately blank.  
  *Why:* The product must show gaps as visibly 'not yet authorized' rather than silently dropping or filling them; that's only possible if ingestion recognizes and preserves placeholders as first-class data rather than noise to strip during cleanup.
- **Per-Field Approval State Machine** `MVP`  
  Every table/field within a drill carries its own lifecycle state (ingested_draft → pending_review → approved → published → superseded) rather than one status per drill, so a drill with four complete tables and one pending Figure Reference can show the four as live while the fifth independently renders 'content pending.'  
  *Why:* Partial completeness is the observed norm in this chapter. A drill-level toggle would force an all-or-nothing publish decision that either hides good content or leaks unapproved content.
- **SME Review & Sign-off Console** `MVP`  
  An internal review screen showing each extracted field beside a rendering of the exact original docx table/image it came from, letting a designated reviewer approve, reject, or flag-for-correction at the individual table level before anything becomes eligible to appear in either app or the copilot data feed.  
  *Why:* This human checkpoint is what the zero-fabrication constraint actually depends on — automated extraction reduces invention risk but can still mis-map a cell, so mandatory human sign-off per unit before publish is the real governance control.
- **Source Citation, Provenance & Authorization Audit View** `MVP`  
  Every stored content unit — a syllable split, a cadence phrase, a fault bullet, a quiz item — carries persistent provenance metadata (chapter, section, drill, table, row, source-doc version), retrievable through an admin screen that lists all published content alongside its source and flags anything still behind a placeholder as excluded from trainee/trainer-facing use.  
  *Why:* In a military training context, being able to prove any displayed instruction traces to an authorized manual passage is a compliance requirement, not a convenience feature; a stored pointer alone isn't enough without a reviewable surface admins can check.
- **No-Fabrication Content Firewall** `MVP`  
  A structural rule enforced at the content-serving layer, not left to app-side convention, that any field whose status is not 'approved' can only be rendered through a standard 'content pending / not yet authorized' placeholder component, and that no generative rewriting or inference service sits anywhere between stored content and any consumer.  
  *Why:* Enforcing this as a platform contract — rather than trusting every client app to remember it — is what actually prevents fabrication at scale, especially once the independently-built Trainer Copilot starts querying the same data.
- **Bilingual Paired-Field & Syllable-Split Structure** `MVP`  
  Models every command/term as a structured pair (Malay term, English meaning) rather than one free-text field, and stores the literal syllable/timing split used for cadence delivery as its own structured sub-field distinct from the plain-text command, with validation blocking publish of any command missing either language or its syllable breakdown.  
  *Why:* Bilingual pairing and syllable-exact timing are graded, load-bearing content, not cosmetic labels; storing them as one blob would make it impossible for downstream features (cadence practice, comprehension checks) to reliably retrieve the exact piece they need.
- **Figure Reference & Media Fulfillment Registry** `MVP`  
  A registry of every Figure Reference slot named across the Break-into-Stages tables (per drill, per stage), tracking whether it is fulfilled by an approved photo, diagram, or video and by which asset ID, versus still pending; ghost-progression diagrams are modeled as a distinct asset type rather than a generic image.  
  *Why:* Figure References are the most common gap type in this draft chapter and are exactly what the '[Insert image]'/'[Insert QR code]' markers point at; without a slot-level registry it's easy to lose track of which of ~10 drills across up to 3 stages still needs an asset.
- **Companion Video Tagging Schema** `MVP`  
  A structured metadata model attaching a companion video (like the 46s 'Skuad, Bersurai' clip) to an exact (drill, stage, Figure Reference slot), and extracting its constituent parts as separate queryable fields — syllable-timed command text, English gloss, technique-cue annotations, on-screen cadence text — rather than storing it as an opaque file with a caption.  
  *Why:* The product owner plans to shoot more videos per drill/stage over time; without a slot-addressable schema now, videos accumulate as an unsorted library disconnected from the specific stage or fault they demonstrate.
- **Ingestion Completeness Punch-List Report** `Phase 2`  
  An automated report generated after each ingestion run listing, per drill, which of the recurring table types (Glossary, Structure of Command, Word of Command, Break into Stages, Layout & Ratio, MOI, Figure References) are fully populated, partially populated, or placeholder-only.  
  *Why:* With ~10 drills each needing multiple table types and known gaps, manually tracking completeness across this matrix is error-prone; this report turns 'the draft has gaps' into an actionable backlog. For a single-chapter pilot the gap list can initially be tracked by hand, so automating it can follow once the approach is proven.
- **Immutable Content Edit Audit Log** `Phase 2`  
  Every post-ingestion edit to a field (correction, re-approval, status change) is written to an append-only log capturing who made the change, when, the before/after value, and which review it was tied to; only designated content admins/SMEs hold write access to canonical content, enforced by role.  
  *Why:* Being able to answer 'who changed this command's timing cue and on what authority' after the fact is a governance necessity once content is live; the per-field approval state machine gives minimal traceability for the pilot, with this fuller log layered on shortly after.
- **Manual Revision Diff & Re-ingestion Workflow** `Phase 2`  
  When a corrected version of the source .docx is submitted, re-run ingestion into a staging version and produce a field-level diff against the currently approved content, so a reviewer approves only what actually changed rather than re-approving the whole chapter blind.  
  *Why:* This is explicitly a working draft that will be corrected. Treating re-ingestion as a full silent overwrite risks auto-publishing unapproved edits or forcing a costly full re-review every time a small fix lands.
- **Chapter/Section Taxonomy for Manual-Wide Extensibility** `Phase 2`  
  Structures the content hierarchy as Manual → Chapter → Section → Drill → Table from the outset, even though only Chapter 2 / Section 1 is loaded for the pilot, so onboarding future chapters means ingesting into the same schema rather than redesigning it.  
  *Why:* The pilot exists to de-risk onboarding the whole manual; if the schema is hard-coded around this one section's specifics, the pilot won't actually validate the harder full-manual ingestion problem it is meant to prove out.
- **Live-Content Change Notification & Changelog** `Phase 2`  
  When an already-published field is revised following an approved manual correction, tag it with a visible 'updated on [date]' marker and log a human-readable changelog entry, so trainee, trainer, and copilot consumers can distinguish a just-corrected fact from a silent replacement of previously-taught content.  
  *Why:* Trainees and trainers may have already memorized or briefed a command a certain way; silently changing an approved drill's timing or fault list without any trace could cause real confusion or inconsistent instruction across squads.
- **Compliance Export / Assessment Audit Log** `Phase 3`  
  An exportable (CSV/PDF) record per squad or trainee of every assessment event — quiz attempts, fault marks, MOI stage completions, trainer ID, timestamp — annotated with the exact manual version/citation in force when each assessment was scored.  
  *Why:* Because this pilot runs against a draft manual that will be revised, and military training records are often subject to audit or handover, it must be possible to prove precisely which manual revision any past assessment was scored against.

### Assessment & Analytics

- **Per-Trainee Drill Mastery Ledger** `MVP`  
  Rolls up a trainee's Question-stage quiz results and fault-checklist marks across all stages of a drill into a per-drill mastery state (Not Attempted / Needs Practice / Faults Cleared), with a full timestamped history of every attempt and which specific faults recurred.  
  *Why:* With roughly ten stationary drills each carrying its own stages and faults, this is the single place that answers 'does this trainee still stomp Mark Time in double-quick time' instead of scattered trainer notes, and it's the record the readiness dashboard and copilot both depend on.
- **Squad Readiness Dashboard** `MVP`  
  Aggregates every trainee's mastery ledger into one squad-level view per drill: percent who have cleared faults, percent still Needs Practice, percent Not Attempted, filterable down to individual stages.  
  *Why:* Trainers plan the next parade-square session around which drills the squad has collectively not mastered — this is the operational decision the pilot exists to support, built entirely from data already captured elsewhere in the app.
- **Pending-Content Exclusion from Assessment** `MVP`  
  Automatically withholds any quiz question, fault checklist, or MOI stage from being assessable wherever the underlying manual table is incomplete (e.g. the empty tables for Salutation, Mark Time, Three Cheers, Recitation of Pledge), showing a 'content pending — cannot be assessed yet' state instead.  
  *Why:* This draft chapter has named drills with literally empty content tables; without this guardrail the assessment engine would either fabricate quiz content to fill the gap or silently present a broken/empty test, either of which violates the project's core constraint.
- **Timing & Cadence Scoring** `Phase 2`  
  A structured field for trainers to mark, per practice repetition, whether the squad's spoken cadence landed on the correct footfall trigger points defined in that drill's Word-of-Command table — recorded as on-time / early / late per rep, not free text.  
  *Why:* Timing and rhythm are graded content distinct from knowing the command exists; a mastery system that only checks factual recall, not cadence accuracy, would misrepresent readiness for what is fundamentally a motor/rhythm skill.
- **Fault-Pattern Trend Analytics** `Phase 2`  
  Aggregates fault-checklist data over time, across trainees and squads, per drill and per stage, surfacing recurring faults and session-over-session trend lines per squad.  
  *Why:* Once enough sessions are logged this turns the manual's static fault lists into a live signal for what needs re-teaching, and can inform which drills or stages most urgently need a companion demonstration video shot next.
- **Spaced Drill-Mastery Review Scheduler** `Phase 2`  
  Flags drills for re-practice based on mastery state and time-since-last-clean-rep, surfaced to trainers as a suggested session agenda item, not pushed to trainees directly.  
  *Why:* Drill is a perishable motor/rhythm skill rather than one-time factual learning, so a mastery flag recorded once can go stale; this keeps the readiness dashboard honest instead of showing indefinite 'mastered' badges.
- **Stage-Gated Mastery Certification** `Phase 2`  
  Marks a drill 'certified' for a trainee or squad only once they have both passed the Question-stage quiz and accumulated fault-free checklist reps across every stage in that drill's Break-into-Stages table, producing one readiness stamp per drill instead of several disconnected signals.  
  *Why:* Multi-stage drills mean a trainee can look fine on stage 1 and still fail stage 2 or 3; gating certification on all stages prevents a false-positive readiness signal from reaching the squad dashboard or being read by the Trainer Copilot.

### Technical & Mobile Platform

- **Offline-First Content Bundle & Sync-on-Reconnect** `MVP`  
  Package each drill's full content set (glossary entries, Structure/Word-of-Command/Stages/Layout/MOI tables, and companion videos) into a downloadable bundle that trainees and trainers pull once over Wi-Fi/cellular and then use fully offline on the parade square, covering trainee content downloads and trainer session-pack caching alike. Progress markers and fault logs queue locally and auto-sync the next time the device regains connectivity.  
  *Why:* The parade square is open-air with no guaranteed signal, and a drill session can't pause because a video buffers — a trainee or trainer standing in formation needs the exact content to load instantly regardless of connectivity.
- **Portrait-First Video Player Matching Native Vertical Format** `MVP`  
  A video player built around the observed 1080x1934 vertical/portrait companion-video format — no forced landscape rotation, full-bleed portrait canvas, native support for the syllable-typing captions, highlighted English-gloss bars, and end-card cadence text baked into the source videos, plus stage/loop markers to replay one drill stage on loop.  
  *Why:* The only companion video asset observed is natively vertical and mobile-shot; a generic landscape or letterboxed web player would crop or shrink exactly the on-screen technique annotations and syllable captions the content depends on.
- **Outdoor Sunlight-Legible Display Mode** `MVP`  
  A high-contrast display mode — large-weight typography, a glare-resistant palette avoiding mid-tone grays, contrast ratios well above WCAG AA — applied across trainee and trainer views, with an in-app nudge to max out device brightness when active.  
  *Why:* This content is read standing on an open parade square in direct sun, not at a desk; ordinary consumer-app contrast, especially captions layered on video, becomes unreadable in daylight glare and defeats the point of the companion videos entirely.
- **Formation-Friendly Large Tap-Target & One-Handed UI** `MVP`  
  Oversized tap targets (48dp+ minimum), single-thumb-reachable primary controls, and swipe/tap gestures tolerant of imprecision, applied to all core navigation — drill selection, video scrub, cadence play/pause — so the app works while standing at attention/at ease, possibly with a hand occupied by gear.  
  *Why:* Trainees and trainers use this on their feet in formation, not seated with two free hands; fiddly small controls simply will not get used in the actual training context this product targets.
- **Placeholder-Safe Media Rendering & Graceful Degradation** `MVP`  
  Client-side handling for every image/video reference so a missing or pending asset — an unshot 'ghost progression' diagram, an '[Insert image]' slot, a not-yet-authorized video — renders a clearly labeled 'content pending' tile at the correct aspect ratio, never a broken-image icon, infinite spinner, crash, or generic stock substitute.  
  *Why:* Several drills in this pilot chapter currently have empty Figure Reference or sequence content, so this is not an edge case but a routine state the rendering layer — shared by both apps — must handle honestly every time it occurs.
- **Crash-Safe Local Session Persistence** `MVP`  
  Frequent, incremental local persistence — not in-memory-only — of a trainee's or trainer's place in a drill session (current drill/stage, video position, cadence-tempo setting), so app backgrounding, a phone drop, low-battery shutdown, or an OS kill mid-session resumes where it left off.  
  *Why:* Outdoor field use means phones get bumped, dropped, backgrounded for a shouted order, or interrupted far more than desk use; losing a trainer's place mid-MOI sequence in front of a formed-up squad is a real failure mode worth designing against from day one.
- **Lightweight PWA-First Architecture with Native Escape Hatch** `MVP`  
  Ship the pilot as an installable, responsive progressive web app — one codebase serving trainee and trainer views — backed by a thin content-sync API and a headless content store, avoiding app-store review cycles, while keeping the content schema and offline/sync layer portable to a future native wrapper once the full manual scales up.  
  *Why:* This is explicitly a single-chapter pilot meant to validate the concept before the whole manual is onboarded; over-investing in native infrastructure now would slow validation, while a well-built PWA still delivers the offline, portrait-video, and field-UI behavior this environment requires. Final platform choice remains a product-owner decision.
- **QR Code & Deep-Link Bridge from Printed Manual to In-App Drill** `Phase 2`  
  Generate a stable QR code for every drill/stage/figure slot the manual marks '[Insert QR code]', deep-linking straight to that drill's matching in-app video and command tables, bypassing in-app navigation entirely, produced as part of the content-publishing pipeline so codes stay valid as content is authorized or updated.  
  *Why:* The source manual already anticipates this exact bridge with literal QR-code placeholders, but it matters most once printed/laminated field copies exist alongside the app; for the initial pilot validating the app itself, this can follow once core content flows are proven.
- **Role-Based Access & Unit-Scoped Provisioning** `Phase 2`  
  Lightweight authentication scoped by unit/course roster and role (trainee, trainer, content admin), with a per-chapter classification/sensitivity flag in the content model — deliberately minimal for this sanitized pilot chapter but structured so stricter access control can be enabled per-chapter without a redesign later.  
  *Why:* This is military training content — even a sanitized pilot chapter shouldn't sit behind an unauthenticated public link, and access control needs to already be a first-class dimension of the content model before later, more sensitive chapters arrive.
- **Adaptive Low-Bandwidth Video Delivery & Predictive Prefetch** `Phase 2`  
  Serve companion videos via adaptive-bitrate/compressed renditions sized for cellular field conditions, and prefetch the next one or two drills' video and content in the background based on a trainer's stated lesson sequence, so playback doesn't stall waiting on a poor connection mid-lesson.  
  *Why:* As the video library grows past this pilot's single clip, naive full-quality downloads over patchy field connectivity will make the app feel broken exactly when a trainer is mid-demonstration in front of a formed-up squad.
- **Offline-Queued Trainer Fault Annotations with Conflict-Resolution Sync** `Phase 2`  
  Let a trainer log live fault observations, tied to a stage's specific Common Faults list, on-device while offline; queue them locally and merge them centrally once reconnected, including handling the case where multiple trainers annotate the same squad session from different devices.  
  *Why:* Once multiple trainers or devices cover a larger squad, naive last-write-wins sync would silently drop one trainer's corrections; the basic single-device offline queue is enough for the MVP pilot, with this multi-device merge logic following once that's proven.
- **Multi-Chapter Content Pack & Versioned Release Pipeline** `Phase 3`  
  Extend the chapter-scoped content architecture into a package/release system that stages, versions, and publishes additional manual chapters independently (draft → reviewed → authorized → published), with staged rollout to specific units/devices and rollback if a published chapter is later found to contain an error.  
  *Why:* This pilot is explicitly step one of onboarding the whole manual — the platform needs a real content-release lifecycle, not a single hardcoded chapter bundle, before it can scale past this one pilot chapter without a rebuild.

## Core data model

Core unit is a per-drill record keyed by a stable drill_id, nested under Manual > Chapter > Section > Drill, mirroring the 7 recurring structures observed in Chapter 2 Section 1. Every leaf value (not just every table) carries the same four-part envelope: {value, content_status: complete|placeholder_pending|not_applicable, placeholder_text_verbatim, provenance:{source_doc_id, doc_version, chapter, section, table_name, row_index/col}, approved_by, approved_at}. This envelope is what lets a UI or the Copilot render "content pending" at the exact granularity of a single cell rather than a whole drill.

Illustrative shape:
{
  "drill_id": "stationary.attention",
  "names": {"malay": "Sedia", "english": "Attention"},
  "content_status": "partial",
  "glossary_refs": ["term.baris", "term.skuad"],
  "structure_of_command": {
    "segments": [
      {"part": "introductory", "tone": "calm_clear", "syllable_split": null, "envelope": {...}},
      {"part": "cautionary", "tone": "loud_sustained", "syllable_split": "Se —", "envelope": {...}},
      {"part": "pause", "duration_sec": 2, "envelope": {...}},
      {"part": "executionary", "tone": "sharp_distant", "syllable_split": "di... — A!", "envelope": {...}}
    ]
  },
  "word_of_command": {
    "quick_time": {"trigger_point": "left heel strikes the ground", "cadence_callout": "One, Bang", "envelope": {...}},
    "slow_time": {"trigger_point": "...", "cadence_callout": "...", "envelope": {...}}
  },
  "stages": [
    {"stage_no": 1, "staged_command_phrasing": "...in Stages, Squad One...",
     "figure_reference": {"type": "photo|ghost_progression|video", "asset_id": null, "status": "placeholder_pending"},
     "common_faults": ["...", "..."], "envelope": {...}}
  ],
  "layout_ratio": [
    {"squad_size_band": "<=24", "ratio": "1:x", "formation_shape": "2 rows facing", "envelope": {...}},
    {"squad_size_band": ">24", "ratio": "1:y", "formation_shape": "U-shape", "envelope": {...}}
  ],
  "moi_sequence": {
    "formation_of_squad": {...}, "explanation": {...},
    "demonstration": {"without_explanation": {...}, "with_explanation": {...}, "in_stages": {...}},
    "question": [{"question_text": "...", "answer_ref": "pointer to word_of_command.quick_time.trigger_point"}],
    "practice": {"reset_command": "Semula"}
  },
  "companion_videos": [
    {"video_id": "v.bersurai.01", "stage_no": null, "figure_slot_ref": "stages[2].figure_reference",
     "syllable_timed_text": "...", "gloss_bar_text": "...", "technique_cue_annotations": [...],
     "cadence_text": "ONE, CHECK, BANG, CHECK / LEFT, RIGHT, LEFT / CHECK BANG",
     "approval_status": "approved"}
  ]
}

Separate top-level entities: (1) a flat Glossary entity (term_id, malay, english, drills_referenced[]) rather than duplicating vocabulary inside every drill; (2) a drill Roster (ordered list of drill_ids with names, for the "cram sheet" and lesson-plan builder) that is a thin index over the full drill records; (3) a companion_video registry keyed independently and referenced by figure-slot pointers so new videos can be shot and attached to existing slots without touching drill schema. content_status must roll up (a drill is "complete" only if every required sub-table is complete) but must also stay queryable per-field, since this draft's actual pattern is complete Word-of-Command paired with an empty Stages table for the same drill. The same envelope/provenance shape is what the Trainer Copilot Contract's completeness-flag and citation features consume directly — the Copilot should never see a flattened, provenance-stripped version of this data.

## Open questions for the product owner

1. What platform should this actually be built on — installable PWA, native iOS/Android, or does it need to integrate with an existing SAF/unit training or LMS system rather than stand alone? This determines the technical architecture (M10) and whether app-store distribution is even viable in a military IT context.
2. Do trainees carry personal smartphones on the parade square, or is this a shared/kiosk-style device per section or squad? This directly determines whether individual mastery tracking, personal flagging, and per-trainee fault history are even meaningful, versus needing squad-level accounts.
3. Who owns the rights to the companion videos (e.g. the 'Skuad, Bersurai' clip), are the soldiers on camera identifiable and consented, and where will video assets be hosted/streamed from (internal SAF infrastructure vs a commercial cloud/CDN)? This gates the entire companion-video and QR-bridge feature set.
4. What is the security/data classification of this content? Is Chapter 2 Section 1 genuinely sanitized/unclassified for a public-facing pilot, and does the eventual full manual carry restrictions that would forbid it running on personal, non-MDM-managed devices?
5. Who are the designated SME reviewer(s)/content authority for sign-off during the pilot, what is their turnaround time, and who has authority to resolve the currently-empty Salutation/Mark Time/Three Cheers/Pledge tables (and on what timeline)?
6. Does this need to integrate with any existing SAF or unit system — training records, roster/personnel system, existing e-learning platform — or can the pilot run as a fully standalone app with its own accounts and data?
7. Who is building the Trainer Copilot and on what schedule — does the data contract need to be frozen/versioned by a specific date, and will that team consume it as a live API, a data export, or something else?
8. Is the parade square truly zero-connectivity, or is there intermittent cellular/Wi-Fi coverage? This changes how aggressively offline-first design and sync-conflict handling need to be engineered for MVP versus later phases.
9. What device/OS baseline can be assumed for trainees and trainers (personal phone models, minimum OS version), since that constrains video codec, PWA feature support, and offline storage limits?
10. What defines pilot 'success' well enough to greenlight onboarding the rest of the manual — a number of sessions run, units involved, trainee/trainer satisfaction threshold, or something else?
11. Is Malay/English the only language pairing that ever appears in official commands across the full manual, or do other languages appear in some units/chapters, which would affect the glossary and bilingual-field schema design?
12. How will the product owner's ongoing/future video shoots get submitted and routed into the SME review pipeline — is there an existing production/upload workflow this needs to plug into, or does this project need to define that intake process too?

---
*Design direction lives in `docs/DESIGN_DIRECTION.md`. This plan will be amended with the adversarial-critique findings (in flight at time of writing).*