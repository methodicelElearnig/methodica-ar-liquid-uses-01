'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-liquid-uses-01 — unit behaviour (יעד 16, נוזלים — SCIENCE)
   Started 14.10.26 from the 2.3 engine package + intro-func-01's newer
   generic helpers (pointer-drag standard, zoom-must-enlarge, ?screen=N).
   No 2.3 / intro-func screen hooks are carried over; this unit's live below.
   Screens keep ONE global 0..N numbering across all six components;
   window.PART_CONFIG (each component's script.js) bounds the range.
   ═══════════════════════════════════════════════════════════════════ */

/* KICKOFF.md screen map: 64 screens (0–63); goTo() skips a number with no section. */
const TOTAL_SCREENS = 64;

/* ONE companion throughout — the ORANGE monster (producer, 14.10.26:
   character-2-companion.png). The deck has no character-choice screen. */
const CHARACTER_IDS = ['character-orange'];
const DEFAULT_CHARACTER = 'character-orange';
const CHARACTER_STORAGE_KEY = 'liquiduses01_selectedCharacter';

/* Poses the producer supplied. A pose the deck asks for and the drop lacks
   walks POSE_FALLBACK to `standing` — delete an entry when its asset arrives. */
const CHARACTER_ASSETS = {
  'character-orange': {
    standing: '../unit-assets/img/character-orange.png',
  },
};

const POSE_FALLBACK = {};

window.lomdaState = window.lomdaState || { selectedCharacter: null };

function getStoredCharacter() {
  try {
    const v = localStorage.getItem(CHARACTER_STORAGE_KEY);
    return CHARACTER_IDS.includes(v) ? v : null;
  } catch (e) { return null; }
}
window.lomdaState.selectedCharacter = getStoredCharacter();

function characterAsset(pose) {
  const id = CHARACTER_IDS.includes(window.lomdaState.selectedCharacter)
    ? window.lomdaState.selectedCharacter : DEFAULT_CHARACTER;
  if (!CHARACTER_ASSETS[id][pose]) {
    const alt = (POSE_FALLBACK[pose] || []).find(p => CHARACTER_ASSETS[id][p]);
    if (alt) pose = alt;
  }
  return CHARACTER_ASSETS[id][pose];
}

function setCharacter(id, pose) {
  const el = document.getElementById(id);
  if (!el) return;
  const who = CHARACTER_IDS.includes(window.lomdaState.selectedCharacter)
    ? window.lomdaState.selectedCharacter : DEFAULT_CHARACTER;
  if (el.parentElement) el.parentElement.dataset.char = who;
  const want = characterAsset(pose);
  if (!el.getAttribute('src') || !el.getAttribute('src').endsWith(want)) el.setAttribute('src', want);
  if (el.tagName === 'VIDEO') { el.load(); el.currentTime = 0; el.play().catch(() => {}); }
}

/* A slot whose pose may resolve to a CLIP or a STILL — the element type
   follows the asset. */
function setCharacterMedia(wrapId, pose, alt) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  const src = characterAsset(pose);
  if (wrap.dataset.src === src) {
    const v = wrap.querySelector('video');
    if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    return;
  }
  wrap.dataset.src = src;
  const label = alt || 'الشخصية المرافقة';
  if (/\.webm$/.test(src)) {
    wrap.innerHTML =
      `<video class="transition-video" autoplay muted loop playsinline aria-label="${label}">` +
      `<source src="${src}" type="video/webm">` +
      `<source src="${src.replace(/\.webm$/, '.mp4')}" type="video/mp4">` +
      `</video>`;
  } else {
    wrap.innerHTML = /\.mp4$/.test(src)
      ? `<video class="transition-video" src="${src}" autoplay muted loop playsinline aria-label="${label}"></video>`
      : `<img class="transition-still" src="${src}" alt="${label}">`;
  }
}

/* ─── per-screen entry ─────────────────────────────────────── */
function resetScreenState(n) {
  /* The DEV harness re-sends DEV_GOTO until the component answers, and goTo()
     has no same-screen guard — a staged reveal must NOT restart on those
     repeats. Mark the entry fresh only when the screen actually CHANGED. */
  p3Fresh = (p3LastScreen !== n);
  p3LastScreen = n;
  if (typeof quizResetScreenState === 'function') quizResetScreenState(n);
  if (n !== 0) lqStopVideo('s0-video');   /* 04.11: the countdown has sound - silence it when leaving */
  if (n !== 43) lqStopVideo('q43-video');  /* 04.11: dslide 43 ketchup video */
  switch (n) {
    /* ── component 01 · deck 3-26 ── */
    case 43: setTimeout(() => lqPlayVideo('q43-video'), 0); break;   /* QA 04.11: ketchup video, once per entry (quiz markup renders first) */
    case 0: lqPlayVideo('s0-video'); break;   /* deck 3: countdown video, plays once per entry */
    case 2: p3Stage('s2'); break;             /* deck 5: "המלל עולה אחד אחרי השני" */
    case 3: lqHookEnter('s3'); break;         /* deck 6: open hypothesis */
    case 5: lqPourEnter(); break;             /* deck 8: the pouring mini-applet */
    case 6: p3Stage('s6'); break;             /* deck 9: QA 28.10 staged rows */
    case 19: p3Stage('s19'); break;           /* deck 23: QA 28.10 recap cards one by one */
    case 20: lqPlayVideo('s20-char'); break;  /* deck 24: QA 28.10 questioning monster clip */
    case 23: lqPlayVideo('s23-char'); break;  /* deck 28: QA 28.10 workout monster clip */
    case 30: lqPlayVideo('s30-char'); break;  /* deck 36: QA 28.10 dumbbells monster clip */
    case 38: lqPlayVideo('s38-char'); break;  /* deck 45: QA 28.10 pointing monster clip */
    case 51: lqPlayVideo('s51-char'); break;  /* deck 59: QA 28.10 climbing monster clip */
    case 58: lqPlayVideo('s58-char'); break;  /* deck 67: QA 28.10 jetpack monster clip */
    case 7: lqFlipEnter(); break;             /* deck 10+11: flip cards */
    /* case 9: QA 25.10 - no staged reveal, all the text appears together */
    case 10: p3Stage('s10'); break;           /* deck 14: closing sentence "עולה בסוף" */
    case 12: lqFlowEnter(); break;            /* QA 04.11: the stage flowchart builds up */
    case 11: p3Stage('s11'); lqDefPop('s11'); break;   /* deck 15: "הדמות עולה בסוף"; QA 04.11: the definition grows */
    case 49: p3Stage('s49'); break;           /* deck 56: the monster + bubble enter last */
    case 13: lqPlanEnter(); break;            /* deck 17: applet stage 1, planning */
    case 15: lqRunEnter(); break;             /* deck 19: applet stage 2, measuring */
    case 17: case 18: lqHoistStages(n); break; /* deck 21-22: stage bar to the screen corner */
    case 27: ifScrollHint(document.getElementById('q27')); break;   /* QA 04.11: deck 32 is a scroll - the gesture beside the bar */
  }
}

/* ─── Speech-bubble frame (Figma 551:12741 / 551:12742), vendored verbatim
   from the approved builds. engine.js calls decorateBubbles(screen) on every
   goTo. ─── */
function bubblePathBottom(w, h, tx) {
  const r = 10, i = 1, td = 15.3, tw = 17;
  const cx = Math.min(w - r - tw - 2, Math.max(r + tw + 2, w * (isFinite(tx) ? tx : 0.5)));
  return `M ${i + r} ${i} H ${w - i - r} A ${r} ${r} 0 0 1 ${w - i} ${i + r}` +
    ` V ${h - i - r} A ${r} ${r} 0 0 1 ${w - i - r} ${h - i}` +
    ` H ${cx + tw} L ${cx} ${h - i + td} L ${cx - tw} ${h - i}` +
    ` H ${i + r} A ${r} ${r} 0 0 1 ${i} ${h - i - r}` +
    ` V ${i + r} A ${r} ${r} 0 0 1 ${i + r} ${i} Z`;
}

function bubblePathSideLeft(w, h) {
  const r = 8.5, i = 1, cy = h / 2, td = 17.6, th = 11.3;
  return `M ${i + r} ${i} H ${w - i - r} A ${r} ${r} 0 0 1 ${w - i} ${i + r}` +
    ` V ${h - i - r} A ${r} ${r} 0 0 1 ${w - i - r} ${h - i}` +
    ` H ${i + r} A ${r} ${r} 0 0 1 ${i} ${h - i - r}` +
    ` V ${cy + th} L ${i - td} ${cy} L ${i} ${cy - th}` +
    ` V ${i + r} A ${r} ${r} 0 0 1 ${i + r} ${i} Z`;
}

function bubblePathSideRight(w, h) {
  const r = 8.5, i = 1, cy = h / 2, td = 17.6, th = 11.3;
  return `M ${i + r} ${i} H ${w - i - r} A ${r} ${r} 0 0 1 ${w - i} ${i + r}` +
    ` V ${cy - th} L ${w - i + td} ${cy} L ${w - i} ${cy + th}` +
    ` V ${h - i - r} A ${r} ${r} 0 0 1 ${w - i - r} ${h - i}` +
    ` H ${i + r} A ${r} ${r} 0 0 1 ${i} ${h - i - r}` +
    ` V ${i + r} A ${r} ${r} 0 0 1 ${i + r} ${i} Z`;
}

function decorateBubbles(scope) {
  (scope || document).querySelectorAll('.speech-bubble').forEach(b => {
    const w = b.offsetWidth, h = b.offsetHeight;
    if (!w || !h) return;
    /* 15.10 (Elad, dslide 11): a companion's bubble points at the MONSTER,
       not at its own middle — the widget pins the figure to one side of a
       wider bubble. Layout px (offsets), so the stage scale never skews it;
       the figure's width is in the key so a late-loading image re-aims it. */
    const fig = b.closest('.character-widget') && !b.dataset.tailAt
      ? b.closest('.character-widget').querySelector(':scope > img') : null;
    const tx = fig && fig.offsetWidth
      ? (fig.offsetLeft + fig.offsetWidth / 2 - b.offsetLeft) / w
      : parseFloat(b.dataset.tailAt);
    const key = w + 'x' + h + (fig ? 'f' + fig.offsetWidth : '');
    if (fig && !fig.complete && !fig.dataset.tailWait) {
      fig.dataset.tailWait = '1';
      fig.addEventListener('load', () => decorateBubbles(b.parentElement), { once: true });
    }
    if (b.dataset.bubbleSize === key) return;
    b.dataset.bubbleSize = key;
    const stale = b.querySelector('.bubble-shape');
    if (stale) stale.remove();
    if (!b.dataset.bubbleWatched) {
      b.dataset.bubbleWatched = '1';
      if (window.ResizeObserver) {
        new ResizeObserver(() => decorateBubbles(b.parentElement || b)).observe(b);
      }
    }
    let svg;
    if (b.classList.contains('side-bubble--right')) {
      const td = 18;
      svg = `<svg class="bubble-shape" style="left:0;top:0;width:${w + td}px;height:${h}px" ` +
        `viewBox="0 0 ${w + td} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
        `<path d="${bubblePathSideRight(w, h)}" fill="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    } else if (b.classList.contains('side-bubble')) {
      const td = 18;
      svg = `<svg class="bubble-shape" style="left:${-td}px;top:0;width:${w + td}px;height:${h}px" ` +
        `viewBox="${-td} 0 ${w + td} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
        `<path d="${bubblePathSideLeft(w, h)}" fill="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    } else {
      const td = 17;
      svg = `<svg class="bubble-shape" style="left:0;top:0;width:${w}px;height:${h + td}px" ` +
        `viewBox="0 0 ${w} ${h + td}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
        `<path d="${bubblePathBottom(w, h, tx)}" fill="white" stroke-width="2" stroke-linejoin="round"/></svg>`;
    }
    b.insertAdjacentHTML('afterbegin', svg);
  });
}


/* The same hint for any screen whose .quiz-main scrolls — the id is derived
   from the section, so one function serves every scrolling question screen. */
function ifScrollHint(sec) {
  if (!sec) return;
  const box = sec.querySelector('.quiz-main--scroll');
  if (!box || typeof makeClickHint !== 'function') return;
  const id = sec.id + '-hint-scroll';
  const drop = () => { const h = document.getElementById(id); if (h) h.remove(); };
  if (!box.dataset.hintWired) {
    box.dataset.hintWired = '1';
    box.addEventListener('scroll', drop, { once: true });
  }
  if (document.getElementById(id)) return;
  setTimeout(() => {
    if (document.getElementById(id)) return;
    if (box.scrollHeight <= box.clientHeight + 8) return;
    const hint = makeClickHint(id);
    hint.addEventListener('animationend', e => {
      if (e.target === hint && e.animationName === 'hintDrift') drop();
    });
    sec.appendChild(hint);
  }, 320);
}

/* the 2.3 scroll standard (S8): the drifting gesture beside the bar, gone on
   the first scroll or after its three drift cycles (iteration count is CSS). */

function advanceScreen() { goTo(currentScreen + 1); }

/* ── the DRAG-gesture hint (Figma 2915:35185 "Cursor Drag", Math variant) ──
   show over the FIRST draggable element only; hide as soon as the learner
   starts dragging it. */
function makeDragHint(id) {
  const el = document.createElement('div');
  el.className = 'drag-hint';
  el.id = id;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="drag-hint__travel">' +
      '<div class="drag-hint__ripple"><img src="../unit-assets/img/hint/ripple-ring-2.svg" alt=""></div>' +
      '<div class="drag-hint__cursor"><img src="../unit-assets/img/hint/cursor.svg" alt=""></div>' +
    '</div>';
  return el;
}

/* The stage is CSS-scaled: a delta read from getBoundingClientRect() is in
   SCREEN px and has to come back to layout px before it is written as a
   style inside that stage. */
function stageScale() {
  const app = document.getElementById('app');
  if (!app) return 1;
  const m = new DOMMatrixReadOnly(getComputedStyle(app).transform);
  return m.a || 1;
}

/* ── the click-hint sprite (percent-04's `makeClickHint`, verbatim) ── */
const SPARK_DIRS = [
  [0, -80], [56.57, -56.57], [80, 0], [56.57, 56.57],
  [0, 80], [-56.57, 56.57], [-80, 0], [-56.57, -56.57],
];
function makeClickHint(id) {
  const el = document.createElement('div');
  el.className = 'click-hint';
  el.id = id;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="click-hint__ripple1"><img src="../unit-assets/img/hint/ripple-ring-1.svg" alt=""></div>' +
    '<div class="click-hint__ripple2"><img src="../unit-assets/img/hint/ripple-ring-2.svg" alt=""></div>' +
    SPARK_DIRS.map(([dx, dy], i) =>
      `<div class="click-hint__spark" style="--dx:${dx}px; --dy:${dy}px; --d:${i * 3}ms"><img src="../unit-assets/img/hint/spark.svg" alt=""></div>`
    ).join('') +
    '<div class="click-hint__cursor"><img src="../unit-assets/img/hint/cursor.svg" alt=""></div>';
  /* QA 25.10: a tap hint plays twice, then goes (scroll hints end on hintDrift) */
  el.addEventListener('animationend', e => {
    if (e.animationName === 'hintR1Op' && !el.id.endsWith('-hint-scroll')) el.remove();
  });
  return el;
}


/* ── Staged reveal (2.3's p3Stage, kept by name so the CSS hooks match) ──
   Re-armed on every FRESH entry so Back-then-forward replays it. JS adds
   `.is-in` per item on a timer and CSS transitions to it. `gate` holds המשך
   until the last item is in. Entries are added per screen as they are built. */
const P3_STAGE = {
  /* deck 5: the three text blocks one after the other; the deck draws המשך
     active, so no gate */
  s2:  { sel: '.p3-step-line', step: 900, first: 500, gate: false },
  /* deck 13: "טקסט עולה בהדרגה" — paragraph by paragraph; the deck draws המשך
     grey, released once the last line is in */
  s9:  { sel: '.p3-step-line', step: 750, first: 500, gate: true },
  /* deck 14: only the closing sentence waits ("עולה בסוף") */
  s10: { sel: '.p3-step-line', step: 0, first: 1600, gate: true },
  /* deck 15: definition first, then the companion + bubble ("הדמות עולה בסוף") */
  s11: { sel: '.p3-step-line', step: 900, first: 400, gate: true },
  s49: { sel: '.p3-step-line', step: 900, first: 300, gate: true },   /* deck 56: "הדמות עולה בסוף" */
  /* QA 28.10: an exception to the no-reveal rule (S6, S19) - deck 9's rows fade in
     top > middle > bottom; המשך stays active */
  s6:  { sel: '.lq-prop-step', step: 700, first: 300, gate: false, force: true },
  /* QA 28.10: deck 23's recap - the four stages rise one after the other */
  /* QA 04.11.26 (dslide 19, Maya): only the FIRST visit animates - coming back shows it all */
  s19: { sel: '.lq-recap > li', step: 700, first: 300, gate: false, force: true, once: true },
};
const P3_FADE_MS = 300;                 /* matches the opacity transition in styles.css */
const p3StageTimers = {};
let p3LastScreen = null;   /* see resetScreenState: repeat-entry guard */
let p3Fresh = true;

/* QA 25.10 (UNIT-WIDE): no gradual reveal anywhere - every screen shows all its
   text (and its companion) at once, and nothing gates המשך on a reveal timer. */
const P3_STAGE_OFF = true;
function p3Stage(id) {
  const el = document.getElementById(id);
  const cfg = P3_STAGE[id];
  if (!el || !cfg) return;
  if ((P3_STAGE_OFF && !cfg.force) || (cfg.once && cfg.played && p3Fresh)) {
    (p3StageTimers[id] || []).forEach(clearTimeout);
    el.classList.remove('is-revealing');
    el.querySelectorAll(cfg.sel).forEach(it => it.classList.add('is-in'));
    return;
  }
  if (!p3Fresh) return;                   /* duplicate DEV_GOTO for this entry */
  cfg.played = true;
  (p3StageTimers[id] || []).forEach(clearTimeout);
  p3StageTimers[id] = [];
  const items = [...el.querySelectorAll(cfg.sel)];
  el.classList.add('is-revealing');
  items.forEach(it => it.classList.remove('is-in'));
  void el.offsetWidth;                    /* commit the hidden state first */
  items.forEach((it, i) => {
    p3StageTimers[id].push(setTimeout(() => it.classList.add('is-in'), cfg.first + i * cfg.step));
  });

  if (!cfg.gate || !items.length) return;
  /* Released on a timer rather than `transitionend`: an interrupted
     transition fires no end event, and the button must never stay locked. */
  const btn = el.querySelector('.btn-continue');
  if (!btn) return;
  btn.disabled = true;
  const last = cfg.first + (items.length - 1) * cfg.step + P3_FADE_MS + 60;
  p3StageTimers[id].push(setTimeout(() => { btn.disabled = false; }, last));
}

/* ═══════════════════════════════════════════════════════════════════
   S2 · deck slide 5 — the machine. Notes:
   "התלמיד גורר בכל פעם חיה אחת למגש הקלט. לאחר שהחיה מונחת על המגש, יופיע
    על מגש הפלט מספר הרגליים המתאים. בעת גרירת החיה הבאה, החיה הראשונה
    חוזרת למקום ולידה מופיע מספר הרגליים. לאחר השלמת הגרירה של כל החיות,
    כפתור המשך זמין."
   Exploration, no right/wrong. Drag is the primary gesture; click-animal-
   then-click-tray is the touch/keyboard fallback (as the quiz dnd does).
   The bank button keeps its SLOT while its animal is on the tray
   (visibility, not display) so the bank never reflows under the hand.
   ═══════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════
   S3 · deck slide 6 — HookOpenQuestion. Notes: "המשך פעיל אחרי תו אחד".
   The deck adds צדקתי? under the box and draws the model answer in grey;
   צדקתי? (also live after one character) reveals that answer. Not scored.
   The typed text is kept in lomdaState and restored on return.
   ═══════════════════════════════════════════════════════════════════ */
function lqHookInput(id) {
  const ta = document.getElementById(id + '-answer');
  if (!ta) return;
  window.lomdaState[id + 'Answer'] = ta.value;
  const has = ta.value.trim().length > 0;
  const c = document.getElementById(id + '-continue');
  const k = document.getElementById(id + '-check');
  if (c) c.disabled = !has;
  if (k && !window.lomdaState[id + 'Checked']) k.disabled = !has;
}
function lqHookCheck(id) {
  window.lomdaState[id + 'Checked'] = true;
  const m = document.getElementById(id + '-model');
  const k = document.getElementById(id + '-check');
  if (m) m.hidden = false;
  if (k) k.disabled = true;
}
function lqHookEnter(id) {
  const ta = document.getElementById(id + '-answer');
  if (ta) ta.value = window.lomdaState[id + 'Answer'] || '';
  const m = document.getElementById(id + '-model');
  if (m) m.hidden = !window.lomdaState[id + 'Checked'];
  lqHookInput(id);
  const k = document.getElementById(id + '-check');
  if (k && window.lomdaState[id + 'Checked']) k.disabled = true;
}

/* ═══════════════════════════════════════════════════════════════════
   S5 · deck slide 8 — the pouring mini-applet. Notes (verbatim intent):
   jug full to 200 מ״ל, the three empty vessels blink gently; a click pours
   200 מ״ל into the chosen vessel, the water takes its shape and stays
   200 מ״ל; then the vessel empties and the jug refills; המשך after all three.
   Timings are CSS-driven; JS only toggles classes on a timer, so a missed
   transitionend can never leave the screen stuck.
   ═══════════════════════════════════════════════════════════════════ */
const LQ_POUR_MS = 1600, LQ_HOLD_MS = 1700, LQ_RESET_MS = 700;
const lqPourState = { done: {}, busy: false, timers: [] };
function lqPourEnter() {
  const box = document.getElementById('s5-pour');
  if (!box) return;
  lqPourState.timers.forEach(clearTimeout);
  lqPourState.timers = [];
  lqPourState.busy = false;
  box.classList.remove('is-pouring');
  box.querySelectorAll('.lq-vessel.is-target').forEach(v => {
    v.classList.remove('is-filling', 'is-full', 'is-emptying');
    v.classList.toggle('is-done', !!lqPourState.done[v.dataset.v]);
    v.disabled = false;
  });
  lqPourGate();
}
function lqPour(btn) {
  const box = document.getElementById('s5-pour');
  if (!box || lqPourState.busy) return;
  lqPourState.busy = true;
  box.querySelectorAll('.lq-vessel.is-target').forEach(v => { v.disabled = true; });
  const t = (fn, ms) => lqPourState.timers.push(setTimeout(fn, ms));
  box.classList.add('is-pouring');               /* jug drains */
  btn.classList.add('is-filling');               /* stream + water rises */
  t(() => { btn.classList.remove('is-filling'); btn.classList.add('is-full'); }, LQ_POUR_MS);
  t(() => {                                      /* vessel empties, jug refills */
    btn.classList.remove('is-full'); btn.classList.add('is-emptying');
    box.classList.remove('is-pouring');
  }, LQ_POUR_MS + LQ_HOLD_MS);
  t(() => {
    btn.classList.remove('is-emptying');
    lqPourState.done[btn.dataset.v] = true;
    btn.classList.add('is-done');
    lqPourState.busy = false;
    box.querySelectorAll('.lq-vessel.is-target').forEach(v => { v.disabled = false; });
    lqPourGate();
  }, LQ_POUR_MS + LQ_HOLD_MS + LQ_RESET_MS);
}
function lqPourGate() {
  const c = document.getElementById('s5-continue');
  if (c) c.disabled = ['glass', 'bottle', 'dish'].some(k => !lqPourState.done[k]);
}

/* ═══════════════════════════════════════════════════════════════════
   S7 · deck slides 10+11 — FlipCardsReveal, two-way (QA 25.10) (ratio-01-01 S1's
   s1Flip, ported). המשך after all three cards; the click-hint sits over
   the FIRST (rightmost) card until any card is flipped.
   ═══════════════════════════════════════════════════════════════════ */
const lqFlipState = { flipped: {} };
function lqFlip(cardEl) {
  const i = Number(cardEl.dataset.index);
  /* QA 25.10: a second click flips the card back, so the photo can be seen again */
  const open = cardEl.classList.toggle('is-flipped');
  cardEl.setAttribute('aria-expanded', String(open));
  const front = cardEl.querySelector('.frc-card-front');
  const back = cardEl.querySelector('.frc-card-back');
  if (front) front.toggleAttribute('aria-hidden', open);
  if (back) back.toggleAttribute('aria-hidden', !open);
  lqFlipState.flipped[i] = true;
  const h = document.getElementById('s7-hint-cards');
  if (h) h.remove();
  /* QA 25.10: flipping the first card hands the hint to the second one */
  if (i === 0 && !lqFlipState.flipped[1] && !lqFlipState.hint2) lqS7Hint(1);
  lqFlipGate();
}
function lqFlipGate() {
  const c = document.getElementById('s7-continue');
  if (c) c.disabled = [0, 1, 2].some(i => !lqFlipState.flipped[i]);
}
function lqFlipEnter() {
  const sec = document.getElementById('s7');
  if (!sec) return;
  lqFlipGate();
  if (Object.keys(lqFlipState.flipped).length || document.getElementById('s7-hint-cards')) return;
  lqFlipState.hint2 = false;
  lqS7Hint(0);
}
/* QA 25.10: the hint taps the first card, then the second (play 1 → card 1,
   play 2 → card 2). Started on card 2 directly once card 1 is flipped. */
function lqS7Hint(idx) {
  const sec = document.getElementById('s7');
  const card = n => sec && sec.querySelector(`.frc-card[data-index="${n}"]`);
  if (!card(idx)) return;
  const old = document.getElementById('s7-hint-cards');
  if (old) old.remove();
  const hint = makeClickHint('s7-hint-cards');
  sec.appendChild(hint);
  /* measured on entry (a display:none screen measures 0), in stage px */
  const aim = n => {
    if (n === 1) lqFlipState.hint2 = true;
    const k = stageScale(), sr = sec.getBoundingClientRect(), r = card(n).getBoundingClientRect();
    hint.style.left = ((r.left - sr.left) / k + r.width / k / 2 - 150) + 'px';
    hint.style.top = ((r.top - sr.top) / k + r.height / k / 2 - 150) + 'px';
  };
  requestAnimationFrame(() => aim(idx));
  if (idx === 0) hint.addEventListener('animationiteration', e => {
    if (e.animationName === 'hintR1Op' && card(1)) aim(1);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   Applet stage bar (deck strip image22, rebuilt live) on the two custom
   applet screens; the quiz screens 17/18 carry it in their stem
   (questions.js lqStageBar). Notes: stage N active, earlier stages done.
   ═══════════════════════════════════════════════════════════════════ */
function lqMountStages(id, active) {
  const el = document.getElementById(id);
  if (el && !el.dataset.built && typeof lqStageBar === 'function') {
    el.outerHTML = lqStageBar(active).replace('class="qprog lq-stagebar"', `class="qprog lq-stagebar" id="${id}" data-built="1"`);
  }
}

/* A quiz screen carries its stage bar in the stem (questions.js); the stem
   column is a positioning context, so the bar moves to the section itself. */
function lqHoistStages(n) {
  const sec = document.getElementById('q' + n);
  const bar = sec && sec.querySelector('.quiz-stem .lq-stagebar');
  if (bar) sec.appendChild(bar);
  /* QA 04.11.26 (dslide 18): the two average cards stand on the LEFT, like a picture beside the
     question, so they move out of the stem column too (S17 + S18 keep one rect) */
  const cards = sec && sec.querySelector('.quiz-stem .lq-avg-cards--stem');
  if (cards) sec.appendChild(cards);
}

/* Hint for a custom (non-QUESTIONS) screen — same overlay as quizOpenHint */
function lqOpenHint(screen, body) {
  const overlay = document.getElementById('quiz-hint-overlay');
  if (!overlay) return;
  overlay.dataset.forScreen = screen;
  overlay.querySelector('.hint-title-text').textContent = '';
  overlay.querySelector('.hint-body').innerHTML = body;
  overlay.classList.remove('hidden');
}

/* ═══════════════════════════════════════════════════════════════════
   S13 · deck slide 17 — applet stage 1, experiment planning.
   Notes: any combination is valid as long as liquid A and liquid B carry
   the same three conditions; the check opens after all six choices; a
   mismatching ROW turns red; wrong → a short feedback that does not give
   the answer; hint after one mistake; correct → "שלב התכנון הושלם בהצלחה!"
   and the button becomes המשך. Unlimited tries (the notes say "נסו שוב").
   ═══════════════════════════════════════════════════════════════════ */
const LQ_PLAN_HINT = '<p>فكّروا فيما نريد اختباره في التجربة.<br>ما الشروط التي يجب أن تبقى متطابقة<br>حتى نتمكّن من المقارنة بين السائلين؟</p>';
const LQ_PLAN_ROWS = ['ball', 'height', 'volume'];
const lqPlan = { a: {}, b: {}, wrongs: 0, done: false, wired: false };
function lqPlanEnter() {
  lqMountStages('s13-stages', 1);
  /* QA 25.10: the two cylinder pictures get the magnifier */
  if (typeof quizImageZoomInit === 'function') quizImageZoomInit(document.getElementById('s13-plan'));
  /* the bar's hint pill carries the engine's bulb, like every quiz screen */
  const hb = document.getElementById('s13-hint'), bulb = document.querySelector('.quiz-hint .quiz-hint-icon');
  if (hb && bulb && !hb.querySelector('.quiz-hint-icon')) hb.insertBefore(bulb.cloneNode(true), hb.firstChild);
  const box = document.getElementById('s13-plan');
  if (!box) return;
  if (!lqPlan.wired) {
    lqPlan.wired = true;
    box.addEventListener('click', e => {
      const pill = e.target.closest('.lq-pill');
      if (!pill || lqPlan.done) return;
      const pair = pill.closest('.lq-plan-pair'), row = pill.closest('.lq-plan-row');
      pair.querySelectorAll('.lq-pill').forEach(b => b.classList.toggle('is-selected', b === pill));
      lqPlan[pair.dataset.side][row.dataset.row] = pill.dataset.v;
      row.classList.remove('is-mismatch');
      if (typeof quizHideFeedback === 'function') quizHideFeedback(13);
      lqPlanGate();
    });
  }
  lqPlanGate();
}
function lqPlanAllChosen() {
  return ['a', 'b'].every(s => LQ_PLAN_ROWS.every(r => lqPlan[s][r]));
}
function lqPlanGate() {
  const btn = document.getElementById('s13-check');
  if (btn) btn.disabled = !lqPlan.done && !lqPlanAllChosen();
}
function lqPlanCheck() {
  if (lqPlan.done) { advanceScreen(); return; }
  if (!lqPlanAllChosen()) return;
  const bad = LQ_PLAN_ROWS.filter(r => lqPlan.a[r] !== lqPlan.b[r]);
  document.querySelectorAll('#s13 .lq-plan-row').forEach(row =>
    row.classList.toggle('is-mismatch', bad.includes(row.dataset.row)));
  if (bad.length) {
    lqPlan.wrongs += 1;
    quizShowFeedback(13, 'wrong', { title: 'لا يزال شيء ما في تصميم التجربة لا يتيح مقارنة عادلة.<br>تحققوا من اختياراتكم وحاولوا مرة أخرى.', body: '' });
    const hb = document.getElementById('s13-hint');
    if (hb) hb.style.visibility = 'visible';
    return;
  }
  lqPlan.done = true;
  quizShowFeedback(13, 'correct', { title: 'اكتملت مرحلة التخطيط بنجاح!', body: '' });
  document.querySelectorAll('#s13 .lq-pill').forEach(b => { b.disabled = true; });
  const hb = document.getElementById('s13-hint');
  if (hb) hb.style.display = 'none';
  const btn = document.getElementById('s13-check');
  navLabel(btn, 'متابعة');
  btn.disabled = false;
}

/* ═══════════════════════════════════════════════════════════════════
   S15 · deck slide 19 — applet stage 2, run + record + average.
   Per liquid: התחילו מדידה → the ball sinks and the timer runs for the
   trial's own time (A 2.8/3.0/3.2 s, B 5.8/6.1/6.1 s — real time, tenths);
   the learner types the shown time (no auto-fill; the next run opens only
   after it is typed — a value that is not the time just measured is marked
   red and the run does not advance); after three rows the average opens
   (3.0 / 6.0, numeric compare; wrong → "בדקו שוב את החישוב ונסו שנית.").
   The next target blinks. The forward button opens when both averages are
   right. State survives leaving and returning.
   ═══════════════════════════════════════════════════════════════════ */
const LQ_RUNS = {
  a: { name: "سائل أ", times: [2.8, 3.0, 3.2], avg: 3.0 },
  b: { name: "سائل ب", times: [5.8, 6.1, 6.1], avg: 6.0 },
};
const lqRun = { a: { run: 0, phase: 'start', avgOk: false }, b: { run: 0, phase: 'start', avgOk: false } };
const lqNum = v => { const n = parseFloat(String(v).trim().replace(',', '.')); return isFinite(n) ? n : NaN; };

function lqRunBuild(side) {
  const host = document.getElementById('s15-' + side);
  if (!host || host.dataset.built) return;
  host.dataset.built = '1';
  const cfg = LQ_RUNS[side];
  host.innerHTML = `
    <p class="lq-run-name"><strong>${cfg.name}</strong></p>
    <div class="lq-run-top">
      <div class="lq-timer">
        <p class="lq-timer-label"><strong>زمن الغوص</strong></p>
        <p class="lq-lcd" dir="ltr" id="s15-${side}-lcd">0.0</p>
        <p class="lq-timer-unit">ثوانٍ</p>
        <button type="button" class="lq-start" id="s15-${side}-start" onclick="lqRunStart('${side}')"><span class="lq-play" aria-hidden="true"></span>ابدؤوا القياس</button>
      </div>
      <div class="lq-cyl" aria-hidden="true">
        <span class="lq-cyl-ruler"><span>20</span><span>0</span></span>
        <span class="lq-cyl-glass"><span class="lq-cyl-liquid"></span><span class="lq-cyl-finish"></span><span class="lq-ball" id="s15-${side}-ball"></span></span>
      </div>
    </div>
    <div class="lq-run-bottom">
      <table class="car-table lq-run-table">
        <thead><tr><th>تجربة</th><th>زمن الغوص (بالثواني)</th></tr></thead>
        <tbody>${[0, 1, 2].map(i => `<tr><th>${i + 1}</th><td><input class="lq-in" id="s15-${side}-r${i}" inputmode="decimal" autocomplete="off" disabled aria-label="${cfg.name} - المحاولة ${i + 1}، زمن الغوص بالثواني" onchange="lqRunType('${side}', ${i})" onkeydown="if(event.key==='Enter'){this.blur();}"></td></tr>`).join('')}</tbody>
      </table>
      <div class="lq-avg">
        <p><strong>متوسط الزمن</strong></p>
        <input class="lq-in lq-avg-in" id="s15-${side}-avg" inputmode="decimal" autocomplete="off" disabled aria-label="${cfg.name} - متوسط الزمن بالثواني" onchange="lqRunAvg('${side}')" onkeydown="if(event.key==='Enter'){this.blur();}">
      </div>
    </div>
    <p class="lq-run-msg" id="s15-${side}-msg" hidden>أعيدوا التحقق من الحساب وحاولوا مرة أخرى.</p>`;
}
function lqBallSink(ball, t) {
  const glass = ball.parentElement;
  const h = glass.clientHeight;                 /* layout px, unaffected by the stage scale */
  const dist = Math.max(0, h * 0.74 - 22);      /* top 26% -> resting on the bottom */
  (ball.getAnimations ? ball.getAnimations() : []).forEach(a => a.cancel());
  if (ball.animate) {
    ball.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${dist}px)` }],
      { duration: t * 1000, easing: 'linear', fill: 'forwards' });
  } else {
    ball.style.transform = `translateY(${dist}px)`;
  }
}
/* QA 25.10: zoom the whole applet to the screen, hiding the side text. Scaled
   in place (same DOM), so the runs, timers and typed values carry on. */
function lqRunZoom(on) {
  const sec = document.getElementById('s15');
  const stage = document.getElementById('s15-stage');
  if (!sec || !stage) return;
  if (!on) { sec.classList.remove('is-zoomed'); stage.style.transform = ''; return; }
  stage.style.transform = '';
  const k = stageScale(), sr = sec.getBoundingClientRect();
  const parts = [...stage.children].map(el => el.getBoundingClientRect());
  const L = (Math.min(...parts.map(r => r.left)) - sr.left) / k, T = (Math.min(...parts.map(r => r.top)) - sr.top) / k;
  const R = (Math.max(...parts.map(r => r.right)) - sr.left) / k, B = (Math.max(...parts.map(r => r.bottom)) - sr.top) / k;
  const W = sr.width / k, Hh = sr.height / k, pad = 40, top = 76;
  const s = Math.min((W - 2 * pad) / (R - L), (Hh - top - pad) / (B - T));
  const tx = (W - (R - L) * s) / 2 - L * s, ty = top - T * s;
  stage.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  sec.classList.add('is-zoomed');
}
function lqRunEnter() {
  lqRunZoom(false);
  const zb = document.querySelector('#s15 .lq-run-zoom');
  if (zb && !zb.innerHTML && typeof ZOOM_GLYPH !== 'undefined') zb.innerHTML = ZOOM_GLYPH;
  lqMountStages('s15-stages', 2);
  lqRunBuild('a'); lqRunBuild('b');
  lqRunGuide();
}
function lqRunStart(side) {
  const st = lqRun[side], cfg = LQ_RUNS[side];
  if (st.phase !== 'start' || st.run > 2) return;
  const t = cfg.times[st.run];
  st.phase = 'running';
  const lcd = document.getElementById(`s15-${side}-lcd`);
  const ball = document.getElementById(`s15-${side}-ball`);
  /* QA 25.10: "in prod the ball doesn't sink". The old CSS transition ran
     `top` from 26% to calc(100% - 22px) - a %-to-calc() pair some engines
     (older Safari) cannot interpolate, so the ball jumped. It is now a
     Web Animation on transform, in px measured off the glass. */
  lqBallSink(ball, t);
  const t0 = performance.now();
  const tick = setInterval(() => {
    const e = Math.min((performance.now() - t0) / 1000, t);
    lcd.textContent = e.toFixed(1);
  }, 100);
  lqRunGuide();
  setTimeout(() => {
    clearInterval(tick);
    lcd.textContent = t.toFixed(1);
    st.phase = 'type';
    const inp = document.getElementById(`s15-${side}-r${st.run}`);
    inp.disabled = false;
    lqRunGuide();
    inp.focus({ preventScroll: true });   /* never scroll the page under the learner */
  }, t * 1000);
  lqRunGuide();
}
function lqRunType(side, i) {
  const st = lqRun[side], cfg = LQ_RUNS[side];
  if (st.phase !== 'type' || i !== st.run) return;
  const inp = document.getElementById(`s15-${side}-r${i}`);
  const ok = Math.abs(lqNum(inp.value) - cfg.times[i]) < 0.001;
  inp.classList.toggle('is-wrong', !ok && inp.value.trim() !== '');
  if (!ok) return;
  inp.classList.add('is-ok'); inp.disabled = true;
  st.run += 1;
  st.phase = st.run < 3 ? 'start' : 'avg';
  if (st.phase === 'avg') document.getElementById(`s15-${side}-avg`).disabled = false;
  lqRunGuide();
}
function lqRunAvg(side) {
  const st = lqRun[side], cfg = LQ_RUNS[side];
  if (st.phase !== 'avg') return;
  const inp = document.getElementById(`s15-${side}-avg`);
  const msg = document.getElementById(`s15-${side}-msg`);
  const ok = Math.abs(lqNum(inp.value) - cfg.avg) < 0.001;
  inp.classList.toggle('is-wrong', !ok);
  msg.hidden = ok;
  if (!ok) return;
  inp.classList.add('is-ok'); inp.disabled = true;
  st.avgOk = true; st.phase = 'done';
  lqRunGuide();
}
/* the next target blinks ("כל השלבים … ילוו בהבהוב ברור"): liquid א first
   (the notes start the blink on the right), then liquid ב */
function lqRunGuide() {
  document.querySelectorAll('#s15 .lq-blink').forEach(el => el.classList.remove('lq-blink'));
  ['a', 'b'].forEach(side => {
    const st = lqRun[side];
    const start = document.getElementById(`s15-${side}-start`);
    if (start) start.disabled = st.phase !== 'start';
  });
  const side = !lqRun.a.avgOk ? 'a' : (!lqRun.b.avgOk ? 'b' : null);
  const c = document.getElementById('s15-continue');
  if (c) c.disabled = !!side;
  if (!side) return;
  const st = lqRun[side];
  const target = st.phase === 'start' ? `s15-${side}-start`
    : st.phase === 'type' ? `s15-${side}-r${st.run}`
    : st.phase === 'avg' ? `s15-${side}-avg` : null;
  const el = target && document.getElementById(target);
  if (el) el.classList.add('lq-blink');
}

/* S0 · deck 3 — the countdown video plays from the start on every entry and
   holds on its last frame (00:07). Autoplay is muted, so no gesture is needed. */
/* QA 04.11.26 (dslide 11, producer: "את ההגדרה של צמיגות להדגיש בהנפשה שהוא גדל"): the
   definition grows and settles back, twice, on every entry (CSS lqDefPop) */
/* QA 04.11.26 (dslide 12): the four task stages come in one after another on every entry -
   box, arrow, box... (the client asked for more motion on this unit) */
function lqFlowEnter() {
  const parts = [...document.querySelectorAll('#s12 .lq-flow > *')];
  (lqFlowEnter.timers || []).forEach(clearTimeout);
  lqFlowEnter.timers = [];
  parts.forEach(el => el.classList.remove('is-in'));
  void document.body.offsetWidth;
  parts.forEach((el, i) => lqFlowEnter.timers.push(setTimeout(() => el.classList.add('is-in'), 350 + i * 330)));
}
function lqDefPop(id) {
  const el = document.querySelector(`#${id} .lq-def-pop`);
  if (!el) return;
  el.classList.remove('is-pop');
  void el.offsetWidth;
  el.classList.add('is-pop');
}
function lqPlayVideo(id) {
  const v = document.getElementById(id);
  if (!v) return;
  try { v.currentTime = 0; } catch (e) {}
  const p = v.play();
  if (!p || !p.catch) return;
  p.catch(() => {
    /* 04.11: a video with sound is blocked before the learner has clicked
       anything. Play it muted; its sound button (.lq-sound-btn) turns it on. */
    if (v.muted) return;
    v.muted = true;
    v.play().catch(() => {});
  });
  const sb = lqSoundBtnFor(v); if (sb) lqSoundSync(sb, v);
}
/* 04.11: sound on/off chip for a video with sound (dslide 0). The icon
   follows the video's real state, so a blocked autoplay shows "muted". */
function lqSoundSync(btn, v) {
  const on = !v.muted;
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  const label = on ? 'كتم الصوت' : 'تشغيل الصوت';
  btn.setAttribute('aria-label', label); btn.title = label;
}
function lqSoundBtnFor(v) { return v.id ? document.querySelector(`.lq-sound-btn[data-video="${v.id}"]`) : null; }
document.addEventListener('volumechange', (e) => {
  const v = e.target, btn = v && v.tagName === 'VIDEO' ? lqSoundBtnFor(v) : null;
  if (btn) lqSoundSync(btn, v);
}, true);
document.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('.lq-sound-btn');
  if (!btn) return;
  const v = document.getElementById(btn.dataset.video);
  if (!v) return;
  e.stopPropagation();
  v.muted = !v.muted;
  if (!v.muted && v.ended) { try { v.currentTime = 0; } catch (err) {} v.play().catch(() => {}); }
}, true);
document.querySelectorAll('.lq-sound-btn').forEach((btn) => {
  const v = document.getElementById(btn.dataset.video);
  if (v) lqSoundSync(btn, v);
});
function lqStopVideo(id) {
  const v = document.getElementById(id);
  if (v && !v.paused) v.pause();
}
