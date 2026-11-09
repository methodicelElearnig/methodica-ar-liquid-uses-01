/* =====================================================================
   720-core — screen engine (shared across all units; vendored per unit)
   Per 720-templates references/_global-components.md.

   The unit must define BEFORE this file runs (js/unit.js):
     TOTAL_SCREENS        — number of screens
     resetScreenState(n)  — per-screen restore hook
   Optional: quizBuildScreens() from quiz-engine.js (auto-called if present).
   ===================================================================== */

'use strict';

let currentScreen = 0;
/* The screen this app should open on: its part's first screen, or its LAST when
   the next component sent the learner back. Plain units open on 0. */
function firstScreen() {
  const p = window.PART_CONFIG;
  if (!p) return 0;
  const want = new URLSearchParams(window.location.search).get('screen');
  if (want === 'last') return p.end;
  /* QA/review convenience: ?screen=N opens straight on that screen, clamped to
     the part's own range (index_dev.html already drives the same thing over
     postMessage; this makes a plain URL work too). */
  const n = Number(want);
  if (want && Number.isFinite(n)) return Math.min(Math.max(n, p.start), p.end);
  return p.start;
}

/* ---------- Canvas scaling (1280x710 design grid, both axes fluid) ---------- */
/* Canvas model — matches the APPROVED builds in examples/ (percent-01 and
   ratio-03 are byte-identical here): design grid 1280x710, and BOTH axes are
   fluid. `canvasW/H = inner/scale` makes the canvas exactly fill the viewport,
   so there is no letterbox in either direction and chrome anchored to an edge
   reaches the real screen edge on any aspect ratio. 1280x710 is the FLOOR, not
   a fixed frame; per-screen content stays positioned against the 1280 grid. */
function scaleApp() {
  const app = document.getElementById('app');
  if (!app) return;
  const scale   = Math.min(window.innerWidth / 1280, window.innerHeight / 710);
  const canvasW = window.innerWidth  / scale;
  const canvasH = window.innerHeight / scale;
  app.style.width     = canvasW + 'px';
  app.style.height    = canvasH + 'px';
  app.style.transform = `scale(${scale})`;
  app.style.left      = '0px';
  app.style.top       = '0px';
}
window.addEventListener('resize', scaleApp);


/* ---------- Multi-component boundary hops ----------
   The client's `-main` structure splits a unit into one app per component,
   bounded by window.PART_CONFIG. Walking off either end loads the neighbour and
   carries the query string across. `?screen=` tells the neighbour where to open
   so Back lands on the screen the learner actually left from. 09.09 — goTo()
   already called goToNextPart(), but nothing defined it, so המשך on a
   component's last screen silently did nothing. */
/* `screen` is a per-hop instruction, never forwarded: after one חזרה across a
   boundary the URL holds `?screen=last`, and carrying it on the next forward hop
   opened the following component on its LAST screen (QA 26.10, same fix as
   intro-func 21.10). Every other parameter is still carried across. */
function partQuery(screen) {
  const q = new URLSearchParams(window.location.search);
  q.delete('screen');
  if (screen !== undefined) q.set('screen', screen);
  const s = q.toString();
  return s ? '?' + s : '';
}
function goToNextPart() {
  const p = window.PART_CONFIG;
  if (!p || !p.next) return;
  window.location.replace(p.next + 'index.html' + partQuery());
}
function goToPrevPart() {
  const p = window.PART_CONFIG;
  if (!p || !p.prev) return;
  window.location.replace(p.prev + 'index.html' + partQuery('last'));
}

/* ---------- Navigation ---------- */
function goTo(n) {
  /* Part mode (5-component delivery architecture, per approved units):
     window.PART_CONFIG = { start, end, next | (routeByScore + nextPass/nextFail) }.
     Navigating past the part's last screen routes to the next part app. */
  if (window.PART_CONFIG) {
    if (n > window.PART_CONFIG.end) { goToNextPart(); return; }
    if (n < window.PART_CONFIG.start) { goToPrevPart(); return; }
  }
  if (n < 0 || n >= TOTAL_SCREENS) return;
  /* 07.09 — a retired screen number (43, folded into 42) must not blank the
     canvas. The teardown below used to run BEFORE the lookup, so navigating to
     a number with no section left every screen deactivated. Resolve the target
     first, and skip a gap in the direction of travel so the DEV bar's numeric
     stepper walks straight over it. */
  let target = document.querySelector(`.screen[data-screen="${n}"]`);
  if (!target) {
    const step = n >= currentScreen ? 1 : -1;
    for (let i = n + step; i >= 0 && i < TOTAL_SCREENS; i += step) {
      target = document.querySelector(`.screen[data-screen="${i}"]`);
      if (target) { n = i; break; }
    }
    if (!target) return;
  }
  // Close all feedback popups and hint overlays before the screen swap
  document.querySelectorAll('[id$="-popup"], [id$="-hint-overlay"]')
    .forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.applet-embed.is-zoomed').forEach(el => el.classList.remove('is-zoomed'));
  const prev = document.querySelector('.screen.active');
  if (window.Motion && prev) Motion.cancel(prev);
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  target.classList.add('active');
  if (window.Motion) Motion.reveal(target);
  currentScreen = n;
  resetScreenState(n);
  if (typeof decorateBubbles === 'function') decorateBubbles(target);
  // keep the DEV harness in sync when navigation happens INSIDE the lomda
  // (buttons / keyboard), not only via the DEV bar
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'DEV_SCREEN', screen: n }, '*');
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(currentScreen + 1);  // RTL: left = forward
  if (e.key === 'ArrowRight') goTo(currentScreen - 1);
  if (e.key === 'Escape' && typeof quizCloseHint === 'function') quizCloseHint();
});

/* Dev bridge for index_dev.html — shared 720 protocol (DEV_GOTO / DEV_READY /
   DEV_SCREEN); 'goto' is kept so any older harness still works. */
window.addEventListener('message', (e) => {
  if (!e.data) return;
  if (e.data.type === 'DEV_GOTO' || e.data.type === 'goto') {
    const n = parseInt(e.data.screen, 10);
    if (!isNaN(n)) goTo(n);
    /* a screen that packs several deck slides into one also takes a STEP, so
       a reviewer can land on the slide rather than the screen */
    if (e.data.step !== undefined) {
      const k = parseInt(e.data.step, 10);
      if (n === 5 && typeof carGoToStep === 'function') carGoToStep(k);
      if (n === 8 && typeof gGoToStep === 'function') gGoToStep(k);
    }
  }
});
if (window.parent !== window) {
  // screens are generated at runtime, so count them once the DOM is built
  const announce = () => {
    const built = document.querySelectorAll('.screen[data-screen]').length;
    window.parent.postMessage({
      type: 'DEV_READY',
      total: Math.max(built, typeof TOTAL_SCREENS === 'number' ? TOTAL_SCREENS : 0),
      part: window.PART_CONFIG || null,
    }, '*');
  };
  if (document.readyState === 'complete') announce();
  else window.addEventListener('load', announce, { once: true });
}

/* ---------- Applet fullscreen zoom (in place — state persists) ---------- */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-applet-toggle]');
  if (!btn) return;
  btn.closest('.applet-embed').classList.toggle('is-zoomed', btn.dataset.appletToggle === 'open');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.applet-embed.is-zoomed').forEach(el => el.classList.remove('is-zoomed'));
  }
});

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof quizBuildScreens === 'function') quizBuildScreens();
  scaleApp();
  /* 09.09 — this used to be a hard goTo(0). Once goTo() started hopping to the
     PREVIOUS component for n < PART_CONFIG.start, that boot call walked every
     component backwards to component 01 the moment it loaded. Open on this
     part's own first screen. */
  goTo(firstScreen());
});

/* 07.10.26 — Figma nav-label sizer on the static pills (generated screens get
   it from their templates). Only text-only buttons are wrapped. */
document.querySelectorAll('.btn-continue, .btn-back, .quiz-check, .quiz-back, .teach-check').forEach(b => {
  if (b.childElementCount === 0 && b.textContent.trim()) navLabel(b, b.textContent.trim());
});
