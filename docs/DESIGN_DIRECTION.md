# SAF Drill Coach — Design Direction

*Positioning in one line: a calibrated field instrument for the parade square — parade-ground marking colors, signage typography, and a notation system for the manual's timing anatomy — engineered for one thumb, full sun, and zero fabrication.*

## 1. Design Concept & Personality

**Concept: "The Parade Square Instrument."** The visual language draws from two worlds that already belong to this content: the painted markings of the parade square (whitewashed lines and road-marking yellow on grey tarmac — the ground truth trainees literally stand on) and the notation systems of timing instruments (metronomes, stopwatch bezels, sheet-music rests) — because the manual's core content *is* timing: syllables, pauses, footfalls, cadence. The product should feel like a well-machined field instrument issued alongside the manual — precise, standardized, legible at arm's length in full sun — not a learning app that happens to contain military content. Every decorative impulse is answered with a functional one: if a mark on screen doesn't encode a command part, a beat, a stage, or a fault, it doesn't exist.

Personality in three words: **issued, calibrated, unhurried.** The app never entertains; it drills.

## 2. Color System

### Sunlight (light) theme — default outdoors
| Name | Hex | Role & rationale |
|---|---|---|
| Parade White | `#FCFCFA` | Background. Near-max luminance for glare survival; a hair off pure white to reduce mirror-glare on glossy screens. |
| Drill Ink | `#10120F` | Primary text/strokes. Near-black with a green undertone; ~19:1 on Parade White. |
| Tarmac | `#5C615A` | Secondary text, hairlines, disabled. The grey of the square itself. Used sparingly — mid-greys die in sunlight. |
| Temasek Olive | `#2E4B33` | Brand/primary interactive (buttons, active states, MOI rail). The No.4 uniform world; dark enough to carry white text at >8:1. |
| Line-Marking Yellow | `#FFD12E` | Highlight/gloss accent — inherited directly from the companion videos' yellow English-gloss bar, and the color painted on parade grounds. **Background-only**: always Drill Ink text on yellow (~13:1), never yellow text on white. |

### Dark theme — barracks/commute revision
| Name | Hex | Role |
|---|---|---|
| Blackout | `#0B0D0B` | Background (near-black, OLED-friendly, night-discipline appropriate). |
| Night Tarmac | `#171A17` | Raised surfaces/cards. |
| Whitewash | `#F4F5F1` | Primary text. |
| Olive 300 | `#93A87B` | Interactive accent (Temasek Olive lifted for dark contrast). |
| Line-Marking Yellow | `#FFD12E` | Unchanged — yellow-on-black is the highest-legibility signage pairing; the gloss bar reads identically in both themes, keeping app and video visually continuous. |

### Semantic layer (theme-independent roles, theme-specific values)
- **Correct / As-per-manual**: `#176B3A` light / `#5FBF7A` dark. Always paired with a tick glyph — never color alone.
- **Fault**: `#B42318` light / `#F97066` dark. Paired with a fault-tag chevron glyph. Deliberately distant from Temasek Olive so brand green and "correct" green are never confused with each other or with fault red under glare or color-blindness.
- **Pending**: no loud color. Tarmac-grey panel, **dashed** 2px border, small "PENDING" cap label. Pending is honest and calm, not alarming — it must be visually impossible to confuse with an error state.

Rule: the palette is five inks and a highlighter. No gradients, no tints below 3:1 against their background, no decorative color.

## 3. Typography

- **Display — commands: Barlow Condensed (SemiBold/Bold).** DIN-lineage signage grotesque: engineering credibility without literal stencil costume, and condensed enough that *"Hormat Ke-Hadapan Hor-Mat"* fits a phone width at 64–96px. Must-haves it satisfies: full-width em dash, clean hyphen, robust letter-spacing at display sizes (the "loud & sustained" cautionary syllable is rendered with tracked-out letters — *"Se — di…"* — so the type itself stretches like the voice does). Commands never wrap mid-word; fluid `clamp()` sizing shrinks the whole command before any line break, and breaks are permitted only at command-part boundaries.
- **Body — Public Sans (Regular/Medium).** A government-commissioned workhorse — institutionally plain, excellent at small sizes, visibly distinct in voice from the condensed display face.
- **Utility/data — IBM Plex Mono.** Cadence counts, tempo values, timings, manual paragraph references (e.g. "Ch 2 §1 ¶4"). Monospace makes counts scannable mid-rep and signals "calibrated instrument."
- **Bilingual hierarchy (fixed, never inverted):** Malay word of command is always the primary object — display face, largest, Drill Ink/Whitewash. The English meaning is always the gloss — body face, sentence case, set on the Line-Marking Yellow bar (mirroring the videos) or in Tarmac grey when inline. A trainee's eye should learn: *big condensed = what you shout; yellow bar = what it means.*
- **Numerics:** `tabular-nums` everywhere counts appear so "One, Check, One" beat indices and tempo readouts don't jitter while animating. Cadence call-out words ("One, Bang") are content, not data — they render in the display face like commands, since they are shouted.

## 4. Signature UI Components

**Command Anatomy strip.** The franchise component. A horizontal timeline rendering one command as proportionally-sized segments: Introductory → Cautionary → **2-sec Pause** → Executionary. Tone is encoded typographically per segment — calm & clear: regular weight; loud & sustained: bold with wide letter-spacing across a stretched segment; sharp & distinct: heaviest weight, tight, with a hard tick mark. The pause is not empty space — it is a measured rest: a ruled 2-second track with tick marks, like a rest in sheet music. On playback, a playhead sweeps the strip and syllables highlight karaoke-style in Line-Marking Yellow, synced to audio and a haptic tick at the executionary syllable.

**Cadence player.** An audio-visual-haptic metronome for cadence call-outs, keyed to footfalls ("left heel strikes the ground" = the beat). Quick Time / Slow Time as two large mode tabs; tempo shown in Plex Mono with oversized ± steppers; defaults are the manual's stated paces-per-minute — if the draft manual omits a value, the field ships as a Pending state, never a guessed number. Each beat: pulse ring, call-out word highlighted, haptic tap, optional voice sample. A practice mode drops the audio and keeps only haptics+visual so trainees can shout the cadence themselves.

**Ghost-Progression stage viewer.** Directly reproduces the manual's ghost images: stages stacked as opacity layers (Stage 1 faded → Stage 2 faded → final solid). A single large scrubber or step-tap advances Stage 1 → Stage 2 → Final, cross-fading layers; per-stage Common Faults from the manual render beneath the image as fault-red list items with chevron glyphs. Pinch-zoom on the photo; the stage label and manual figure reference stay pinned.

**Fault-tagging chips (Trainer).** During Practice, the manual's Common Fault list for the current movement pre-loads as oversized chips (min 64px tall) arranged in the bottom thumb arc. One tap = tag + count increment with haptic confirm; long-press = assign to a squad position on a simple rank-and-file grid. Zero typing mid-session; free-text notes exist only in the post-session review screen.

**MOI stage stepper (Trainer).** A vertical rail of the 5 stages — Formation → Explanation → Demonstration → Question → Practice — with the Demonstration stage carrying an explicit ①②③ pass counter (the three passes are manual content, so they get first-class UI). Current stage in Temasek Olive; a large, always-reachable **"SEMULA"** button (display face, ink-on-yellow) resets the current rep — it is the trainer's most-pressed control and is treated like a stopwatch's reset crown.

**Content-pending state.** Dashed-border panel, grey, with the exact manual reference of the gap: "Image pending — SAF Drill Manual Ch 2 §1, Fig [n]". Layout reserves the true dimensions of the missing asset so surrounding content doesn't reflow when it arrives. Never a silent gap, never a generic placeholder illustration, never AI-generated stand-in imagery — a fabricated demo photo would violate the product's core promise.

**Portrait video player frame.** Native 9:16 (1080×1934) letterboxed on Blackout, no chrome overlay on the subject. The video's own styled captions are the star; the app adds only a syllable-marked scrub bar (tap a marker to jump to that syllable/stage) and a persistent yellow gloss bar beneath the frame echoing the in-video style. Videos are downloadable per-lesson for offline; player defaults to sound-on (the command's tone *is* the content) with a clear mute.

## 5. Layout & Interaction Principles

- **Grid:** single-column, 4px base unit, 16px gutters at 360px width; content max-width ~480px even on tablets — this is a one-hand product, not a dashboard.
- **Thumb zones:** all in-session controls (Semula, fault chips, cadence transport, stage stepper advance) live in the bottom 40% of the screen. The top half is display-only: command text, anatomy strip, imagery. Nothing tappable above the reach line during a session.
- **Glare mode:** an explicit "Outdoor" toggle (also auto-suggested via ambient light sensor, never auto-forced). It removes Tarmac mid-greys (everything becomes ink or background), thickens strokes from 1px to 2px, raises minimum type from 16 to 18px, bumps tap targets to 64px, and disables imagery dimming. Sunlight theme is the baseline; Glare mode is the baseline with the volume up.
- **Motion policy:** animation exists only where it encodes time — the anatomy-strip playhead, karaoke syllable highlight, metronome pulse, ghost-stage cross-fade. Screen-to-screen transitions are instant cuts (<100ms). No parallax, no springy bounces, no celebratory motion. If it moves, it's teaching tempo.
- **Offline:** the pilot chapter ships as a downloadable content pack (text, images, audio, videos) stamped with manual version and reference ("SAF Drill Manual, Ch 2 §1 — pack v1.2"). Trainer fault tags queue locally and sync with a quiet status line, never a blocking modal. An un-downloaded video shows a distinct "Not downloaded — 42 MB" state, separate from Pending.

## 6. Accessibility & Environment Notes

- **Contrast:** body text targets WCAG AAA 7:1 in both themes (sunlight demands it regardless of compliance); absolute floor 4.5:1 for any text, 3:1 for essential non-text strokes. Yellow is never a text color on light backgrounds.
- **Multi-channel timing:** every beat is delivered on three channels — visual pulse, audio tick/voice, haptic tap — individually toggleable, so timing practice works with the phone in a pocket (haptics only) or on silent in barracks (visual only). Never color-only, never sound-only.
- **Reduced motion:** honors the OS setting — the sweeping playhead becomes a discrete per-syllable step highlight; ghost cross-fades become instant swaps. Timing information is preserved; only the interpolation is removed.
- **Screen readers:** syllable-split display text ("Se — di… — A!") is presentation-only; accessible labels carry the intact word plus structure ("Sediakan — cautionary part, delivered loud and sustained"). Fault chips announce name and current tag count.
- **Physical context:** sweaty-hand tolerance — no swipe-only gestures for critical actions; everything swipeable also has a tap equivalent. Debounce fault-chip taps at ~250ms to prevent double-tags from wet-finger bounce.

## 7. Explicit Anti-Patterns — Do Not

- **No consumer gamification:** no confetti, flame streaks, XP, cartoon badges, mascots, or celebratory copy ("Great job! 🎉"). Completion is acknowledged the way the manual would: a stated standard met, in plain language.
- **No military cosplay:** no camouflage textures, no literal stencil type throughout, no dog-tag/olive-drab skeuomorphism, no crosshair motifs. The credibility comes from precision, not costume.
- **No AI-default styling:** no purple/indigo gradient heroes, no generic cream-and-terracotta warmth, no Inter-for-everything, no glassmorphism cards, no emoji in UI copy.
- **No fabricated content in any state:** no invented tempo numbers, no stock or generated photos standing in for missing manual figures, no paraphrased "helpful tips" that aren't traceable to the manual. Pending means pending.
- **No thin/low-contrast minimalism:** no 300-weight type, no grey-on-grey metadata, no hairline-only affordances — all invisible at noon on tarmac.
- **No mid-session friction:** no typing during practice, no confirmation modals interrupting reps, no autoplaying next-lesson carousels, no notification nagging ("Time to drill!").
- **No inverted hierarchy:** English never displaces Malay as the primary command text; the gloss stays the gloss.
