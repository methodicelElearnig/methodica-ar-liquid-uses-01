# Unit: methodica-liquid-uses-01-main

Interactive learning unit (לומדה) for Methodica's 720 project — **SCIENCE**, יעד 16
"נוזלים - תכונות משותפות, שימושים, וניסוי מדעי". Hebrew, RTL, static HTML/CSS/JS,
client `-main` shape (one folder per component + shared `unit-js/`, `unit-css/`,
`unit-assets/`).

## This unit (kickoff 14.10.26) — facts

- **Deck:** `spec/deck.pptx` (72 slides, none hidden, 1280×720). `spec/deck.pdf` =
  PowerPoint export; **PDF page = slide number** (verified: page 2 = `רכיב 1`).
  `spec/pages/slideNN.png` = 1280-wide renders, `spec/media/` = extracted media,
  `spec/deck-forensics.txt` = maven-skills `deck_forensics.py` dump (per-RUN bold,
  pics, tables, oMath, callouts, off-canvas, notes).
- **Deck history:** the first drop (66 slides, no `רכיב` slides) is kept in
  `spec/_v1/`. The 14.10 update ADDED the six `רכיב` slides only — all 66 content
  slides are text-identical (diffed). `spec/_v1-141026/` is a redundant copy of the
  current deck and `spec/_unz/` is an empty extraction dir — both safe to delete.
- **Unit ID = the deck's own** `methodica-liquid-uses-01` (no "science" in it, unlike
  the two example units) — the `רכיב` slides print exactly these folder names.
- **Components** (from the deck's `רכיב N` slides 2, 27, 35, 44, 58, 66):

  | folder | slides | deck sections |
  |---|---|---|
  | `methodica-liquid-uses-01-01` | 3–26 | HOOK 3-7, הקנייה 8-15, יישומון צמיגות 16-23, חימום 24-26 |
  | `methodica-liquid-uses-01-02` | 28–34 | תרגול סטנדרטי |
  | `methodica-liquid-uses-01-03` | 36–43 | תרגול בסיסי 36-40, סטנדרטי ב 41-43 |
  | `methodica-liquid-uses-01-04` | 45–57 | תרגול מתקדם 45-54, פריט העשרה 55-57 |
  | `methodica-liquid-uses-01-05` | 59–65 | שאלת שיא מועד א |
  | `methodica-liquid-uses-01-06` | 67–72 | שאלת שיא מועד ב |

- **Forensics:** build cards in `docs/forensics/slides-*.md`. Build from the cards.

## Engine and theme

- Engine = `template-library/templates/_engine-proportion-03/` (unit-css, motion.js,
  report-modal.js, fonts, chrome page) **plus** `engine.js` + `quiz-engine.js` from
  intro-func-01 (14.10.26) — they carry the generic standards added after 2.3: pointer
  drag ghost, zoom-must-enlarge (`quizImageZoomOpen(src, alt, fromEl)`), `?screen=N`.
  Their CSS may need lifting from intro-func-01's `styles.css` when the first dnd /
  zoom screen is built. `unit.js` keeps only the generic helpers (character, bubbles,
  click/drag hints, `p3Stage`, `ifScrollHint`) — no 2.3 or intro-func screen hooks.
- `styles.css`: 40 screen-number-scoped 2.3 rules stripped (`#sN`/`#qN`), braces
  balanced; pre-strip copy not kept in the unit.
- **SCIENCE theme** (Elad 14.10: "the main difference is the colors which are blue"):
  - `<body data-subject-theme="science">` → the `--subject-*` defaults (Subject/500
    `#019DE5`, /700 `#007AC6` …). Nav/flag tokens fall back to subject-500/700;
    the report flag is grey at rest, blue on hover.
  - `--primary-action-gradient` = **Science gradient**
    `linear-gradient(to bottom, #005FBE 9%, #0059B2 23.361%, #003971 100%)` (same as
    volume-liquid-01 / mass-measure-01 and the design guidelines).
  - the Math nav purple `#3B2FC2` hard-coded in the guided card / drag rules →
    `var(--subject-500)`.
  - Reference science builds: `examples/methodica-science-mass-measure-01-main`,
    `examples/methodica-science-volume-liquid-01-main`.
- **Companion:** ONE orange monster, `unit-assets/img/character-orange.png` (640px,
  from `producer-assets/character-2-companion.png`, real alpha). No character-choice
  screen in the deck. Poses the deck asks for that the drop lacks → `POSE_FALLBACK`.

## Toolchain

Serve with `python3 -m http.server 8765` from the unit root. Gates take the COMPONENT
folder. Gate set before showing a range: `deck_coverage` → `verify_build` →
`check_structure` → `check_feedback` (maven-skills).
