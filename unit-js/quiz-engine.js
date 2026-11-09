/* =====================================================================
   720-core — config-driven question engine (shared; vendored per unit)
   Question types: single | multi | dual-select | value-input
   Hint policies per _question-template-defaults.md:
     'always' (default) | 'after-wrong' (hidden until first incorrect attempt)

   The unit must define BEFORE this file runs (js/questions.js):
     QUESTIONS — array of question configs (see unit questions.js for shape)
   Requires in index.html: #quiz-hint-overlay (shared hint popup, outside screens).
   ===================================================================== */

'use strict';

/* Figma "nav label" (196:6020): every bottom-nav pill carries its label in a
   .nav-label span whose ::after is an invisible SemiBold copy, so the hover
   weight change never moves the pill's edge. Relabel through this, never
   through textContent — that would drop the sizer. */
function navLabel(btn, text) {
  let span = btn.querySelector(':scope > .nav-label');
  if (!span) { span = document.createElement('span'); span.className = 'nav-label'; btn.textContent = ''; btn.appendChild(span); }
  span.textContent = text; span.dataset.label = text;
}

/* ── THE zoom glyph ──
   One magnifier for the whole project (producer 05.10: "dev slide 2 zoom icon
   is the icon to use and the only icon for this project in general").
   The image- and table-zoom buttons used to draw a SECOND variant with a `+`
   stroke across the lens; that variant is gone. The 44px chip around it is
   unchanged (Figma 1589:17043). */
const ZOOM_GLYPH = '<svg width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" stroke-width="2"/><line x1="13.5" y1="13.5" x2="19" y2="19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';

/* Applet (יישומון) embed — iframe + fullscreen-zoom button.
   Zoom expands the SAME iframe in place (CSS class), never a second
   instance — learner input inside the applet persists across zoom.
   Toggle handler is delegated in engine.js. */
/* `fit` = {w, h}: render the applet's iframe at THAT logical viewport and
   scale the whole thing down to the embed box. The applet file is never
   touched — some are producer-supplied and must stay byte-identical — and it
   lays out at the width its author designed for, so neither axis scrolls.
   `boxW`/`boxH` override the default 460x380 window for a screen that has a
   larger content column (S32/S33 give the machine applet the full 489x542). */
function appletEmbed(src, title, fit) {
  const fitAttrs = fit
    ? ` data-fit style="--fit-w:${fit.w}px;--fit-h:${fit.h}px;--fit-s:${Math.min((fit.boxW || 460) / fit.w, (fit.boxH || 380) / fit.h).toFixed(4)}"`
    : '';
  return `<div class="applet-embed"${fitAttrs}>
    <button class="applet-zoom-btn" type="button" data-applet-toggle="open"
      aria-label="تكبير التطبيق إلى شاشة كاملة">${ZOOM_GLYPH}</button>
    <button class="applet-zoom-btn applet-close-btn" type="button" data-applet-toggle="close"
      aria-label="إغلاق الشاشة الكاملة"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>
    <iframe src="${src}" title="${title || 'التطبيق'}" loading="lazy"></iframe>
  </div>`;
}


/* Question progress stepper (סרגל שאלה) — q.step = {group, index, total}.
   07.09 — this is percent-04's approved `qprog` component (same markup, same two
   glyph SVGs, same class names). The classes are load-bearing: the CSS hides every
   svg inside a dot and re-shows exactly one by class, so a copy without
   class="qp-tick" renders a dot with no mark and a correct answer looks unanswered.
   The container keeps `qstepper` too, purely so `:has(.qstepper)` layout rules match.
   States still derive from sibling questions in the same group (a station may span
   several screens — sub-questions א/ב — and only resolves when all of them do). */
const QP_TICK = '<svg class="qp-tick" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 6.2l3 3 6-6.4" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const QP_X    = '<svg class="qp-x" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';

/* a custom screen passes { step: {...} } straight through */
function quizStepperHTML(q) {
  let html = '';
  for (let i = 1; i <= q.step.total; i++) {
    const label = (q.step.labels && q.step.labels[i - 1]) || `سؤال ${i}`;
    html += `<div class="qprog-station" data-step="${i}">` +
              `<span class="qprog-dot">${QP_TICK}${QP_X}</span>` +
              `<span class="qprog-label">${label}</span>` +
            `</div>`;
    /* RTL: station i+1 sits to the LEFT of station i, so the connector between
       them fills once the RIGHT-hand (lower-numbered) station resolves. */
    if (i < q.step.total) html += `<span class="qprog-line" data-after="${i}"></span>`;
  }
  return `<div class="qprog qstepper" data-group="${q.step.group}" data-current="${q.step.index}" aria-hidden="true">${html}</div>`;
}

function quizStepperUpdate(screen) {
  const q = QUESTIONS.find(x => x.screen === screen);
  if (!q || !q.step) return;
  quizStepperPaint(document.querySelector(`#q${screen} .qstepper`), q.step.group, q.step.index);
}

/* 16.09 — the paint step is split out so an intro screen that sits BETWEEN two
   questions (screen 48, the gym table) can carry the same live strip instead of
   dropping it for one screen. */
function quizStepperPaint(bar, groupName, current) {
  const group = QUESTIONS.filter(x => x.step && x.step.group === groupName);
  if (!bar) return;
  const resolved = {};
  bar.querySelectorAll('.qprog-station').forEach(el => {
    const i = Number(el.dataset.step);
    // a step may span several screens (sub-questions א/ב) — aggregate them:
    // done only when all parts are done, correct only when all parts correct
    const sibs = group.filter(x => x.step.index === i);
    const sts = sibs.map(x => quizState[x.screen]).filter(Boolean);
    /* `sibs` empty would make this vacuously true and tick a station that has
       no question behind it — green before the learner has answered anything. */
    const allDone = sibs.length > 0 && sts.length === sibs.length && sts.every(st => st.done);
    const allCorrect = allDone && sts.every(st => st.wasCorrect);
    resolved[i] = allDone;
    el.classList.toggle('is-current', i === current);
    el.classList.toggle('is-correct', allDone && allCorrect);
    el.classList.toggle('is-wrong', allDone && !allCorrect);
  });
  bar.querySelectorAll('.qprog-line').forEach(ln => {
    ln.classList.toggle('is-done', !!resolved[Number(ln.dataset.after)]);
  });
}

/* In the client's multi-component structure each component sets
   window.PART_CONFIG = {start,end}. A builder must skip any screen outside it,
   or every component ships the whole unit. Absent PART_CONFIG, nothing changes.
   (from percent-08; 2.1 had the same test written inline.) */
function inPart(n) {
  const p = window.PART_CONFIG;
  return !p || (n >= p.start && n <= p.end);
}

/* Per-question runtime state, keyed by screen number — survives navigation */
const quizState = {};

function quizBuildScreens() {
  const app = document.getElementById('app');
  const backRef = document.getElementById('quiz-hint-overlay'); // insert screens before overlay
  QUESTIONS.forEach(q => {
    /* one shared questions.js for the whole unit: a component builds only the
       screens inside its own range (window.PART_CONFIG, set in script.js) */
    if (!inPart(q.screen)) return;
    quizState[q.screen] = { attempts: 0, done: false, hintUsed: false, selected: null, selectedSet: [] };
    const sec = document.createElement('section');
    sec.className = 'screen quiz-screen';
    sec.dataset.screen = q.screen;
    sec.id = `q${q.screen}`;
    sec.innerHTML = `
      ${q.step && !q.step.hideBar ? quizStepperHTML(q) : (q.label ? `<div class="scq-progress">${q.label}</div>` : '')}
      <div class="quiz-cols">
        <div class="quiz-main${(q.afterInteraction || q.scrollMain) ? ' quiz-main--scroll' : ''}" data-reveal="1">
          <div class="quiz-stem">${q.stem}</div>
          ${q.popup && !q.popup.inBubble ? `<button class="popup-trigger" type="button"
            onclick="document.getElementById('q${q.screen}-note-popup').classList.remove('hidden')">${q.popup.trigger}</button>` : ''}
          ${quizInteractionHTML(q)}
          ${q.afterInteraction ? `<div class="quiz-after">${q.afterInteraction}</div>` : ''}
        </div>
        ${q.content ? `<div class="quiz-content"${q.content.includes('data-persist') ? '' : ` data-reveal="2"${q.content.includes('applet-embed') ? ' data-reveal-fade' : ''}`}>${q.content}</div>` : ''}
      </div>
      ${q.popup ? `<div class="note-popup m-popup hidden" id="q${q.screen}-note-popup" role="dialog" aria-modal="true" aria-label="${q.popup.title}">
        <div class="note-popup-panel">
          <button class="popup-x" type="button" aria-label="إغلاق"
            onclick="document.getElementById('q${q.screen}-note-popup').classList.add('hidden')"></button>
          <h3>${q.popup.title}</h3>
          <div class="note-popup-body">${q.popup.body}</div>
          <button class="hint-close-btn" type="button" data-label="رجوع"
            onclick="document.getElementById('q${q.screen}-note-popup').classList.add('hidden')">رجوع</button>
        </div>
      </div>` : ''}
      <div class="quiz-feedbox" id="q${q.screen}-feedbox"></div>
      <div class="scq-bar">
        <button class="quiz-check" id="q${q.screen}-check" disabled onclick="quizCheck(${q.screen})"><span class="nav-label" data-label="هل إجابتي صحيحة؟">هل إجابتي صحيحة؟</span></button>
        ${q.hintPolicy === 'none' ? '' : `<button class="quiz-hint" id="q${q.screen}-hint" onclick="quizOpenHint(${q.screen})"
          ${q.hintPolicy === 'after-wrong' ? 'style="visibility:hidden"' : ''}><svg class="quiz-hint-icon" viewBox="0 0 25.9999 22.2883" fill="none" aria-hidden="true"><path d="M17.7925 2.76345C16.3676 1.37911 14.5057 0.68776 12.5488 0.815545C9.07995 1.04163 6.27286 3.9168 6.01796 7.50134C5.85646 9.77363 6.7035 11.9443 8.34374 13.4548C9.23036 14.2723 9.74016 15.465 9.74016 16.7265H11.2284H14.7733H16.2615C16.2615 15.4847 16.7919 14.2707 17.7181 13.3959C19.17 12.0263 20.0012 10.0751 20.0012 8.04361C20.0012 6.01215 19.1953 4.12486 17.7909 2.76018L17.7925 2.76345ZM13.0001 5.54524C11.6701 5.54524 10.5856 6.66582 10.5856 8.04525C10.5856 8.46956 10.2515 8.81524 9.84149 8.81524C9.43143 8.81524 9.09736 8.46956 9.09736 8.04525C9.09736 5.8172 10.8484 4.00527 13.0001 4.00527C13.4133 4.00527 13.7473 4.35094 13.7473 4.77525C13.7473 5.19957 13.4133 5.54524 13.0001 5.54524Z" fill="currentColor"/><path d="M9.73858 19.6245C9.73858 20.3289 9.99823 20.9908 10.478 21.4904L10.4938 21.5068C10.9783 22.0098 11.6242 22.2883 12.3114 22.2883H13.6888C14.3775 22.2883 15.025 22.0114 15.5111 21.5052C15.9956 21.0039 16.2631 20.3355 16.2631 19.6277V17.9895H9.73858V19.6245ZM11.2268 19.5294H14.7717V19.6277C14.7717 19.9243 14.6609 20.2077 14.4566 20.419C14.254 20.6254 13.9753 20.7483 13.6888 20.7483H12.3114C12.028 20.7483 11.7588 20.6336 11.5561 20.4305L11.5451 20.4174C11.3424 20.211 11.2268 19.9226 11.2268 19.6261V19.5311V19.5294Z" fill="currentColor"/><path d="M25.2558 7.27531H22.607C22.1954 7.27531 21.8629 7.62099 21.8629 8.0453C21.8629 8.46961 22.197 8.81529 22.607 8.81529H25.2558C25.6674 8.81529 25.9999 8.46961 25.9999 8.0453C25.9999 7.62099 25.6658 7.27531 25.2558 7.27531Z" fill="currentColor"/><path d="M4.1386 8.0453C4.1386 7.61935 3.80453 7.27531 3.39447 7.27531H0.744124C0.332481 7.27531 0 7.62099 0 8.0453C0 8.46961 0.334064 8.81529 0.744124 8.81529H3.39289C3.80453 8.81529 4.13701 8.46961 4.13701 8.0453H4.1386Z" fill="currentColor"/><path d="M20.8702 3.11398C21.0175 3.11398 21.1663 3.06811 21.2961 2.97472L23.4667 1.40198C23.804 1.15788 23.8847 0.677863 23.6488 0.328911C23.4129 -0.0200418 22.949 -0.105232 22.6118 0.140509L20.4412 1.71325C20.1039 1.95736 20.0232 2.43737 20.2591 2.78632C20.4032 3.00094 20.6343 3.11562 20.8702 3.11562V3.11398Z" fill="currentColor"/><path d="M4.70372 13.1172L2.53309 14.69C2.19586 14.9341 2.11512 15.4141 2.35102 15.763C2.49509 15.9777 2.72625 16.0923 2.96215 16.0923C3.10939 16.0923 3.25822 16.0465 3.38804 15.9531L5.55867 14.3803C5.8959 14.1362 5.97665 13.6562 5.74074 13.3073C5.50484 12.9583 5.04095 12.8731 4.70372 13.1189V13.1172Z" fill="currentColor"/><path d="M23.4668 14.6884L21.2961 13.1157C20.9589 12.8716 20.495 12.9567 20.2591 13.3041C20.0232 13.653 20.1055 14.133 20.4412 14.3771L22.6118 15.9499C22.7416 16.0449 22.8904 16.0891 23.0377 16.0891C23.272 16.0891 23.5032 15.9744 23.6488 15.7598C23.8847 15.4109 23.8024 14.9309 23.4668 14.6868V14.6884Z" fill="currentColor"/><path d="M5.55869 1.71322L3.38806 0.140478C3.05083 -0.103625 2.58694 -0.0184349 2.35104 0.328879C2.11513 0.677832 2.19746 1.15785 2.53311 1.40195L4.70374 2.97469C4.83356 3.06971 4.98239 3.11395 5.12963 3.11395C5.36395 3.11395 5.5951 2.99927 5.74076 2.78465C5.97666 2.4357 5.89434 1.95569 5.55869 1.71158V1.71322Z" fill="currentColor"/></svg><span class="nav-label" data-label="هل يمكنني الحصول على تلميح؟">هل يمكنني الحصول على تلميح؟</span></button>`}
        <button class="quiz-back" onclick="goTo(${q.backScreen != null ? q.backScreen : q.screen - 1})"><span class="nav-label" data-label="رجوع">رجوع</span></button>
      </div>`;
    app.insertBefore(sec, backRef);
    sec.querySelectorAll('.dd-select').forEach(s => { s.selectedIndex = -1; });
  });
}

function quizInteractionHTML(q) {
  /* 15.10 — PointSelectionHotspot (Figma 196:3349, liquid-uses deck 30): the
     options are CHUNKS of one sentence, clicked in place. `hotspot` = rows;
     each row is a list of static strings and {id, html} chunks. A chunk is a
     `.scq-opt`, so selection, retry and the final marks are the single-choice
     engine's own — only the skin differs. */
  if (q.type === 'single' && q.hotspot) {
    return `<div class="hs-sentence" role="radiogroup" aria-label="أجزاء الجملة">` + q.hotspot.map(row =>
      `<div class="hs-row">` + row.map(it => typeof it === 'string'
        ? `<span class="hs-static">${it}</span>`
        : `<span class="scq-opt hs-chunk" role="radio" aria-checked="false" tabindex="0" data-id="${it.id}"
             onclick="quizSelect(${q.screen}, this)"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quizSelect(${q.screen}, this);}"><span class="scq-opt-text">${it.html}</span></span>`
      ).join('') + `</div>`).join('') + `</div>`;
  }
  if (q.type === 'single' || q.type === 'multi') {
    const role = q.type === 'multi' ? 'checkbox' : 'radio';
    return `<div class="scq-answers" role="${q.type === 'multi' ? 'group' : 'radiogroup'}" aria-label="إمكانيات الإجابة">
      ${q.options.map(o => `
        <div class="scq-opt ${q.type === 'multi' ? 'is-multi' : ''}" role="${role}" aria-checked="false" tabindex="0"
             data-id="${o.id}" onclick="quizSelect(${q.screen}, this)"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quizSelect(${q.screen}, this);}">
          <span class="scq-radio ${q.type === 'multi' ? 'is-box' : ''}"></span>
          <span class="scq-opt-text">${o.html}</span>
        </div>`).join('')}
    </div>`;
  }
  if (q.type === 'dnd') {
    /* Drag a token from the bank into a blank. Deck slides 26 and 27 are both
       this shape, but with opposite token economies, so `reusable` decides:
         26 - two signs (= / \u2260) fill FIVE rows, so a token stays in the bank
         27 - three phrases fill three blanks, so a placed token leaves it
       `layout` is the screen's own HTML with {{i}} where zone i goes, because
       the deck lays the blanks out differently on each slide (a 5-row grid vs
       mid-sentence) and neither is a list the engine could generate.
       Drag is the primary gesture; click-token-then-blank is kept as the
       fallback for touch boards and keyboards (percent-05, producer 01.09). */
    const zone = (i) => `<span class="dnd-zone" data-zone="${i}" id="q${q.screen}-zone-${i}"
         role="button" tabindex="0" aria-label="\u05de\u05e7\u05d5\u05dd \u05dc\u05d2\u05e8\u05d9\u05e8\u05d4 ${i + 1}"
         onclick="quizDndDrop(${q.screen}, ${i})"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quizDndDrop(${q.screen}, ${i});}"
         ondragover="event.preventDefault(); this.classList.add('is-over')"
         ondragleave="this.classList.remove('is-over')"
         ondrop="event.preventDefault(); this.classList.remove('is-over'); quizDndDropEvent(event, ${q.screen}, ${i})"></span>`;
    const body = q.layout.replace(/\{\{(\d+)\}\}/g, (_, i) => zone(Number(i)));
    /* tokens carry no native drag and no onclick: the pointer-ghost handler
       below owns press, drag and the press-without-move click fallback;
       the keyboard keeps Enter/Space → pick. */
    const bank = `<div class="dnd-bank" id="q${q.screen}-bank">${q.tokens.map((t, i) => `
      <button type="button" class="dnd-token" data-token="${i}" draggable="false"
              onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();quizDndPick(${q.screen}, ${i});}">${t}</button>`).join('')}</div>`;
    /* RTL: the bank sits where the deck draws it \u2014 LEFT of the rows on 26,
       below the photo on 27 \u2014 so the slide decides the order, not the engine. */
    return `<div class="dnd-wrap ${q.wrapClass || ''}">${q.bankFirst ? bank + body : body + bank}</div>`;
  }
  if (q.type === 'dropdown') {
    // sentence: array of text parts; blanks: [{pool, correct}] — blank i renders between parts[i] and parts[i+1]
    let html = '<div class="dd-sentence">';
    q.sentence.forEach((part, i) => {
      html += part;
      if (i < q.blanks.length) {
        const opts = q.blanks[i].pool.map(v => `<option value="${v}">${v}</option>`).join('');
        /* QA 25.10 (UNIT-WIDE): "בחרו" is a PLACEHOLDER, never an option. A
           hidden <option> still shows in some pickers (Safari), so the list
           holds only the answers; the select starts with nothing selected
           (required + selectedIndex -1 = :invalid) and .dd-ph shows over it. */
        html += `<span class="dd-wrap"><select class="dd-select" required data-slot="${i}" onchange="quizDropdownChange(${q.screen})">${opts}</select><span class="dd-ph" aria-hidden="true">اختاروا</span></span>`;
      }
    });
    /* 13.10 — deck slides 58/59 are "DropdownQuestion + ValueInputQuestion":
       a קיים / לא קיים select AND an `x = □` box on the same screen. The box
       is gated by the select — slide 59's note says choosing לא קיים must
       make it unavailable — so `disableWhen` names the option that switches
       it off, and a disabled tail is not part of the answer. */
    if (q.valueTail) {
      const t = q.valueTail;
      html += `<div class="dd-tail">` +
        (t.label ? `<span class="dd-tail-label">${t.label}</span>` : '') +
        `<span class="eq-row-eq" dir="ltr"><span class="eq-row-lhs">${t.lhs || 'x'}</span>` +
        `<span class="eq-row-sign">=</span><span class="ti-box">` +
        `<input type="text" inputmode="numeric" class="vi-input vi-tail" aria-label="${t.aria || ''}"` +
        ` oninput="quizDropdownChange(${q.screen})"></span></span></div>`;
    }
    return html + '</div>';
  }
  if (q.type === 'statement') {
    /* 16.09 — rebuilt to 720---UI-Templates node 4763:34499
       (TrueFalseQuestion-ShortSentences) and the answer states at 3527:24086.
       Each statement is its own block: a subject-coloured letter to the RIGHT
       of the sentence, and the נכון / לא נכון pair BELOW it (they used to sit
       beside the sentence on the same row). Each pill carries a 22px radio
       that fills when picked and becomes the ✓/✗ once marked. */
    const LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و'];
    /* 11.10 — the pair is configurable. Deck slides 29-30 ask תחום / טווח of
       each row instead of נכון / לא נכון, and letter the rows with a bullet
       because the slide's own letter (א. / ב.) belongs to the stem above.
       RTL: the FIRST pill renders RIGHTMOST, which is where the deck draws
       the first of the pair. */
    const PAIR = q.pills || [{ val: 'true', label: 'صحيح.' }, { val: 'false', label: 'غير صحيح' }];
    const pill = (i, val, label) =>
      `<button type="button" class="stmt-pill" data-val="${val}" onclick="quizStatementPick(${q.screen}, ${i}, this)">` +
      `<span class="stmt-radio" aria-hidden="true"></span><span class="stmt-pill-label">${label}</span></button>`;
    return `<div class="stmt-list ${q.listClass || ''}">` + q.statements.map((s, i) => `
      <div class="stmt-row" data-row="${i}">
        <div class="stmt-head">
          <span class="stmt-letter" aria-hidden="true">${q.bullets ? '&bull;' : (LETTERS[i] || i + 1) + '.'}</span>
          <span class="stmt-text">${s.text}</span>
        </div>
        <div class="stmt-pills">
          ${/* 15.10 — a row may carry its OWN pills (liquid-uses deck 49: גדל/קטן/לא
             משתנה, עולה/יורד/נשאר קבוע …) and any number of them */ ''}${(s.pills || PAIR).map(o => pill(i, o.val, o.label)).join('')}
        </div>
      </div>`).join('') + `</div>`;
  }
  if (q.type === 'dual-select') {
    const opts = q.pool.map(y => `<option value="${y}">${y}</option>`).join('');
    return `<div class="dual-select-sentence">
      ${q.sentence.before}
      <select class="year-select" data-slot="0" onchange="quizDualChange(${q.screen})"><option value="" disabled hidden selected>اختاروا سنة</option>${opts}</select>
      ${q.sentence.middle}
      <select class="year-select" data-slot="1" onchange="quizDualChange(${q.screen})"><option value="" disabled hidden selected>اختاروا سنة</option>${opts}</select>
      ${q.sentence.after}
    </div>`;
  }
  if (q.type === 'value-input') {
    let slot = 0;
    /* inputmode follows the same flag: a numeric keypad has no letters, so an
       algebraic answer needs the text keyboard on a touch board. */
    const input = (label) => `<input type="text" inputmode="${q.allowText ? 'text' : 'numeric'}" class="vi-input" data-slot="${slot++}" aria-label="${label || ''}" oninput="quizInputChange(${q.screen})">`;
    if (q.sentence) {
      /* Deck slide 52: the answer box sits INSIDE the sentence, not under it.
         `sentence` is the text either side of the blank; the unit word is part
         of the trailing half, so it lands to the box's LEFT the way the deck
         sets it (maven-skills §1a). */
      /* 11.10 — any number of blanks. `sentence` is parts; a blank sits
         between every pair, so N parts give N-1 boxes (deck slide 36 puts two
         in one sentence). One part + one blank still renders as before. */
      let out = '<div class="vi-sentence">';
      q.sentence.forEach((part, i) => {
        out += part;
        if (i < q.sentence.length - 1) {
          out += `<span class="vi-inline">${input((q.inputLabels || [])[i] || q.inputLabel || '')}</span>`;
        }
      });
      return out + '</div>';
    }
    if (q.inputTable) {
      /* A table whose answer cells are inputs (deck slide 40). The note says
         to KEEP the word "גרם" in the field, so the unit sits INSIDE the box
         beside the number rather than next to it as a separate label. */
      const t = q.inputTable;
      const cell = (c) => {
        if (c && typeof c === 'object' && c.input) {
          /* `prefix` sits OUTSIDE the box (deck 62 writes "x =" beside the
             ב' row's field); `suffix` sits inside it with the number. */
          /* prefix + box are ONE dir=ltr group: the cell is RTL, so a bare
             prefix rendered to the box's RIGHT and with no gap, while the deck
             draws "x =" to its LEFT (slide 62). */
          const boxEl = `<span class="ti-box">${input(c.label || '')}` +
                        (c.suffix ? `<span class="ti-unit">${c.suffix}</span>` : '') + `</span>`;
          return c.prefix
            ? `<span class="ti-cell" dir="ltr"><span class="ti-prefix">${c.prefix}</span>${boxEl}</span>`
            : boxEl;
        }
        return c;
      };
      return `<table class="car-table ti-table">
        <thead><tr>${t.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${t.rows.map(r => `<tr>${r.map((c, i) =>
          i === 0 ? `<th>${cell(c)}</th>` : `<td>${cell(c)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>`;
    }
    if (q.menuTable) {
      /* Deck slide 44 draws the menu as ARTWORK (frame, fruit, cups, grid)
         with every number as a separate TEXT shape on top of it. So the art
         is the background and the table is rebuilt in HTML over it — the
         numbers stay real text (18px floor, translation export) and the one
         empty cell is the input. A `null` cell is the answer. */
      const m = q.menuTable;
      return `<div class="menu-fig" style="background-image:url('${m.img}')" role="img" aria-label="${m.alt}">
        <button type="button" class="applet-zoom-btn img-zoom-btn menu-zoom-btn" aria-label="توسيع القائمة" onclick="quizNodeZoomOpen(this.parentElement)">${ZOOM_GLYPH}</button>
        <div class="menu-title">${m.title}</div>
        <table class="menu-table">
          <thead><tr>${m.head.map((h, i) => `<th>${h || `<span class="sr-only">حجم الكوب</span>`}</th>`).join('')}</tr></thead>
          <tbody>${m.rows.map(r => `<tr>${r.map(c =>
            `<td>${c === null ? input('قطع الموز في المشروب العملاق') : c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>`;
    }
    if (q.eqRows) {
      /* Deck slide 31: each row is a Hebrew sentence on the RIGHT and an
         equation on its LEFT whose right-hand side is the answer box. The
         equation is its own dir="ltr" group so f(4) = □ reads left-to-right
         inside the RTL row (maven-skills §5). */
      /* two shapes. Without `rhs` the box is the right-hand side of the
         equation (deck 31: `f(4) = □`). With `rhs` the box sits INSIDE the
         expression and the trailing text follows it (deck 47: `g( □ ) = 4`,
         deck 48: `S( □ ) = 4,400`) — no `=` is emitted, because it is part
         of the row's own text. */
      return `<div class="eq-rows">` + q.eqRows.map(r => {
        const box = `<span class="ti-box">${input(r.aria || r.lhs)}</span>`;
        const eq = r.rhs !== undefined
          ? `<span class="eq-row-lhs">${r.lhs}</span>${box}<span class="eq-row-rhs">${r.rhs}</span>`
          : `<span class="eq-row-lhs">${r.lhs}</span><span class="eq-row-sign">=</span>${box}`;
        return `<div class="eq-row">` +
          (r.label ? `<span class="eq-row-label">${r.label}</span>` : '') +
          `<span class="eq-row-eq" dir="ltr">${eq}</span></div>`;
      }).join('') + `</div>`;
    }
    if (q.ratioRows) {
      // rows of "label — [input] : [input]" (e.g. reduced-ratio answers)
      return `<div class="ratio-rows">` + q.ratioRows.map(row => {
        /* row.frac: the deck writes the answer as a fraction (numerator box over
           a bar over a denominator box) rather than "[input] : [input]". Slot
           order stays top-then-bottom, so correctInputs is indexed the same. */
        if (row.frac) {
          return `<div class="ratio-row ratio-row--frac"><span class="ratio-row-label">${row.label}</span>` +
            `<span class="fraction vi-frac"><span class="frac-top">${input(row.label + ' — البسط')}</span>` +
            `<span class="frac-bottom">${input(row.label + ' — مقام')}</span></span></div>`;
        }
        const cells = Array.from({ length: row.parts || 2 }, () => input(row.label || ''));
        /* row.suffix: a unit word that belongs to the LEFT of the box, which is
           where the deck puts ש"ח / ס"מ. Without this the row printed the
           literal string "undefined" in place of an absent label. */
        const label = row.label ? `<span class="ratio-row-label">${row.label}</span>` : '';
        const suffix = row.suffix ? `<span class="ratio-row-suffix">${row.suffix}</span>` : '';
        /* 30.09 — the box and its unit are ONE group. As separate siblings the
           unit wrapped away from the box and off the column (dslide 41: the
           ס"מ landed outside .quiz-main entirely). Now a long label wraps and
           the answer stays whole on its own line. */
        return `<div class="ratio-row">${label}<span class="ratio-row-answer"><span class="ratio-row-cells" dir="ltr">${cells.join('<span class="vi-colon">:</span>')}</span>${suffix}</span></div>`;
      }).join('') + `</div>`;
    }
    // equation of two fractions; each cell is a fixed string or {input:true,label}
    const cell = (c) => (c && typeof c === 'object' && c.input) ? input(c.label) : c;
    const frac = (side) => `<span class="fraction vi-frac"><span class="frac-top">${cell(side.top)}</span><span class="frac-bottom">${cell(side.bottom)}</span></span>`;
    /* `eqUnit` is a unit phrase for the WHOLE proportion (deck slide 47 puts
       ק"מ לדקה outside the equation, not beside one fraction). The element is
       dir="ltr", so the first child is the physically LEFT one — which is
       where the deck draws it. */
    return `<div class="vi-equation" dir="ltr">` +
      (q.eqUnit ? `<span class="vi-eq-unit" dir="rtl">${q.eqUnit}</span>` : '') +
      `${frac(q.equation.left)}<span class="vi-eq">=</span>${frac(q.equation.right)}</div>`;
  }
  return '';
}

/* ---------- drag-and-drop (dnd) ---------- */
/* QA 04.11.26 (unit 16, dslide 56): the ✗ a box got on the wrong try goes the moment the learner
   starts the next try (drag or click-pick); a ✓ kept from the retry stays. */
function quizDndClearBad(screen) {
  document.querySelectorAll(`#q${screen} .dnd-zone.mark-bad`).forEach(z => z.classList.remove('mark-bad'));
}

function quizDndPick(screen, tok) {
  const st = quizState[screen];
  if (st.done) return;
  quizDndHintDone(screen);
  quizDndClearBad(screen);
  st.heldToken = st.heldToken === tok ? null : tok;
  document.querySelectorAll(`#q${screen} .dnd-token`).forEach(t =>
    t.classList.toggle('is-held', Number(t.dataset.token) === st.heldToken));
}

function quizDndDrop(screen, zone) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  if (!q || st.done) return;
  st.drops = st.drops || {};
  /* clicking a filled blank with nothing held takes the token back out, which
     is the only way to correct a misdrop on a touch board */
  if (st.heldToken === null || st.heldToken === undefined) {
    if (st.drops[zone] === undefined) return;
    delete st.drops[zone];
    quizDndRender(screen, q);
    return;
  }
  if (!q.reusable) {
    Object.keys(st.drops).forEach(k => {
      if (st.drops[k] === st.heldToken) delete st.drops[k];
    });
  }
  st.drops[zone] = st.heldToken;
  st.heldToken = null;
  quizDndRender(screen, q);
}

function quizDndRender(screen, q) {
  const st = quizState[screen];
  const drops = st.drops || {};
  q.zones.forEach((_, i) => {
    const box = document.getElementById(`q${screen}-zone-${i}`);
    if (!box) return;
    const t = drops[i];
    box.innerHTML = t === undefined ? '' :
      `<span class="dnd-token is-placed" data-token="${t}">${q.tokens[t]}</span>`;
    box.classList.toggle('is-filled', t !== undefined);
  });
  const used = new Set(Object.values(drops));
  /* a used pill keeps its SLOT (visibility, not display) so the bank never
     reflows under the learner's hand — producer 07.10 pm, S16: "when dragging
     and dropping the text moves… make it so it doesn't change anything at all" */
  document.querySelectorAll(`#q${screen} .dnd-bank .dnd-token`).forEach(t => {
    t.style.visibility = (!q.reusable && used.has(Number(t.dataset.token))) ? 'hidden' : '';
    t.classList.remove('is-held');
  });
  const chk = document.getElementById(`q${screen}-check`);
  if (chk) chk.disabled = Object.keys(drops).length < q.zones.length;
}

function quizDndDragStart(ev, screen, tok) {
  const st = quizState[screen];
  if (st.done) { ev.preventDefault(); return; }
  quizDndHintDone(screen);
  quizDndClearBad(screen);
  st.heldToken = tok;
  ev.dataTransfer.effectAllowed = 'move';
  try { ev.dataTransfer.setData('text/plain', String(tok)); } catch (e) {}
}

function quizDndDropEvent(ev, screen, zone) {
  const st = quizState[screen];
  let tok = st.heldToken;
  try {
    const raw = ev.dataTransfer.getData('text/plain');
    if (raw !== '') tok = Number(raw);
  } catch (e) {}
  if (tok === null || tok === undefined || Number.isNaN(tok)) return;
  st.heldToken = tok;
  quizDndDrop(screen, zone);
}

/* ── Pointer drag with the unit's OWN ghost — THE STANDARD (Elad 08.10.26,
   intro-func-01 S2: "this fix is great, lets make this the standard").
   The native HTML5 ghost is a snapshot of the raw element — square PNGs
   lose their round clip, and it is drawn at SCREEN scale while the stage is
   CSS-scaled, so it never matches what the learner sees. Here a clone of
   the token follows the pointer INSIDE the stage (scale-exact), zones
   highlight by hit-test, release over a zone drops. A press that does not
   move is the click fallback (hold, then click a blank). Pointer events,
   so touch boards behave the same. ── */
document.addEventListener('pointerdown', e => {
  /* QA 04.11.26 (producer, גורף: "להחליף בין המסיחים בגרירה"): a card already in a box drags
     too - onto another box it SWAPS with that box's card, anywhere else it goes back to the
     bank; a press that does not move stays the click (the box's own click takes it out). A box
     whose card is locked right after a retry (✓) keeps it. */
  const placed = e.target.closest('.dnd-zone .dnd-token.is-placed');
  const tok = placed || e.target.closest('.dnd-bank .dnd-token');
  if (!tok || tok.disabled || e.button) return;
  const srcZone = placed ? placed.closest('.dnd-zone') : null;
  if (srcZone && srcZone.classList.contains('mark-ok')) return;
  const sec = tok.closest('.quiz-screen');
  if (!sec) return;
  const screen = Number(sec.dataset.screen);
  const st = quizState[screen];
  if (!st || st.done) return;
  e.preventDefault();
  const k = (typeof stageScale === 'function') ? stageScale() : 1;
  const sr = sec.getBoundingClientRect();
  const tr = tok.getBoundingClientRect();
  const ghost = tok.cloneNode(true);
  ghost.className = 'dnd-token dnd-ghost';
  ghost.removeAttribute('id'); ghost.removeAttribute('onkeydown');
  ghost.style.width = (tr.width / k) + 'px';
  ghost.style.height = (tr.height / k) + 'px';
  /* the clone lives in the section, outside the wrapper whose rules size the
     token (e.g. `.if-animals .dnd-token`), so its computed look rides along */
  const cs = getComputedStyle(tok);
  ['fontSize', 'fontWeight', 'lineHeight', 'padding', 'borderRadius', 'background', 'color', 'boxSizing']
    .forEach(prop => { ghost.style[prop] = cs[prop]; });
  const offX = (e.clientX - tr.left) / k, offY = (e.clientY - tr.top) / k;
  const place = ev => {
    ghost.style.left = ((ev.clientX - sr.left) / k - offX) + 'px';
    ghost.style.top  = ((ev.clientY - sr.top)  / k - offY) + 'px';
  };
  const zoneAt = ev => [...sec.querySelectorAll('.dnd-zone')].find(z => {
    const r = z.getBoundingClientRect();
    return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
  });
  /* safety net: a previous drag that lost its pointer must not leave a ghost
     behind to block the next one */
  sec.querySelectorAll('.dnd-ghost').forEach(g => g.remove());
  sec.querySelectorAll('.dnd-token.is-dragging').forEach(t => t.classList.remove('is-dragging'));
  place(e); sec.appendChild(ghost);
  let moved = false;
  const x0 = e.clientX, y0 = e.clientY;
  tok.classList.add('is-dragging');
  quizDndHintDone(screen);
  try { tok.setPointerCapture(e.pointerId); } catch (_) {}
  const move = ev => {
    if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 4) { moved = true; quizDndClearBad(screen); }
    place(ev);
    const z = zoneAt(ev);
    sec.querySelectorAll('.dnd-zone.is-over').forEach(o => { if (o !== z) o.classList.remove('is-over'); });
    if (z) z.classList.add('is-over');
  };
  const up = ev => {
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('pointerup', up, true);
    window.removeEventListener('pointercancel', up, true);
    ghost.remove();
    tok.classList.remove('is-dragging');
    sec.querySelectorAll('.dnd-zone.is-over').forEach(o => o.classList.remove('is-over'));
    if (ev.type !== 'pointerup') return;
    const z = moved ? zoneAt(ev) : null;
    if (srcZone) {
      if (!moved) return;                       /* a plain click: the box's onclick handles it */
      const q = QUESTIONS.find(x => x.screen === screen);
      const from = Number(srcZone.dataset.zone), t = (st.drops || {})[from];
      if (t === undefined || st.done) return;
      const drops = st.drops;
      if (z && Number(z.dataset.zone) !== from) {
        const to = Number(z.dataset.zone), other = drops[to];
        if (z.classList.contains('mark-ok')) return;   /* never knock out a locked ✓ */
        drops[to] = t;
        if (other === undefined) delete drops[from]; else drops[from] = other;
      } else if (!z) delete drops[from];           /* dropped outside every box: back to the bank */
      st.heldToken = null;
      quizDndRender(screen, q);
      return;
    }
    if (z) { st.heldToken = Number(tok.dataset.token); quizDndDrop(screen, Number(z.dataset.zone)); }
    else if (!moved) quizDndPick(screen, Number(tok.dataset.token));
  };
  /* 13.10 — these used to be bound to the TOKEN, which only works while the
     pointer stays over it or while setPointerCapture holds. A learner releases
     over the ZONE, so whenever capture did not take (it is in a try/catch, and
     it is lost as soon as the element is re-rendered — which is exactly what
     the retry does) `up` never fired: the ghost stayed on screen, the token
     kept `is-dragging`, and nothing could be dropped again. Bound to the
     window in the capture phase it works with or without pointer capture. */
  window.addEventListener('pointermove', move, true);
  window.addEventListener('pointerup', up, true);
  window.addEventListener('pointercancel', up, true);
});

/* ── the drag-gesture hint (Figma 2915:35185) ──
   Positioned by MEASUREMENT on screen entry, never from typed coordinates:
   measuring while the screen is display:none yields zeros (maven-skills §8).
   Anchored over the FIRST bank token, pointing at the FIRST blank. */
function quizDndHintInit(screen) {
  const q = QUESTIONS.find(x => x.screen === screen);
  if (!q || q.type !== 'dnd') return;
  const sec = document.getElementById(`q${screen}`);
  if (!sec) return;
  const st = quizState[screen] || {};
  let hint = sec.querySelector('.drag-hint');
  if (st.done || st.dndHintDone) { if (hint) hint.classList.add('hidden'); return; }

  const tok  = sec.querySelector('.dnd-bank .dnd-token');
  const zone = document.getElementById(`q${screen}-zone-0`);
  if (!tok || !zone) return;
  if (!hint) {
    hint = makeDragHint(`q${screen}-drag-hint`);
    /* QA 25.10: the drag demo plays twice, then is done for the session */
    hint.addEventListener('animationend', e => { if (e.target === hint && e.animationName === 'dragHintFade') quizDndHintDone(screen); });
    sec.appendChild(hint);
  }

  const k = stageScale();
  const sr = sec.getBoundingClientRect();
  const tr = tok.getBoundingClientRect();
  const zr = zone.getBoundingClientRect();
  if (!tr.width || !zr.width) return;              /* not laid out yet */
  const cx = (tr.left + tr.width / 2 - sr.left) / k;
  const cy = (tr.top + tr.height / 2 - sr.top) / k;
  hint.style.left = (cx - 150) + 'px';
  hint.style.top  = (cy - 150) + 'px';
  let dx = (zr.left + zr.width / 2 - tr.left - tr.width / 2) / k;
  let dy = (zr.top + zr.height / 2 - tr.top - tr.height / 2) / k;
  /* `hintDir` overrides the measured vector. On screen 16 the bank sits BELOW
     the sentence and the first blank is far to its left, so the measured path
     (-318, -146) read as a sideways sweep rather than "pick this up and put it
     in the sentence". The producer asked for a straight upward gesture
     (05.10), which is also the shorter, clearer read. */
  if (q.hintDir === 'up')    { dx = 0; dy = -Math.abs(dy); }
  if (q.hintDir === 'down')  { dx = 0; dy =  Math.abs(dy); }
  hint.style.setProperty('--dx', dx + 'px');
  hint.style.setProperty('--dy', dy + 'px');
  hint.classList.remove('hidden');
}

/* "Hide when the user starts dragging the correct element" (Figma). Any real
   pick-up counts — drag or the click fallback — and it stays hidden for the
   rest of the session so it cannot reappear on a revisit. */
function quizDndHintDone(screen) {
  const st = quizState[screen];
  if (st) st.dndHintDone = true;
  const h = document.querySelector(`#q${screen} .drag-hint`);
  if (h) h.classList.add('hidden');
}

/* Per-ZONE verdicts, shared by the retry marker and the reveal marker so a
   blank cannot be a \u2713 in one and an \u2717 in the other (same rule as
   quizSlotVerdicts for value-input). */
function quizDndZoneOk(z, drop) {
  return drop !== undefined && (drop === z.correct || (Array.isArray(z.accept) && z.accept.indexOf(drop) > -1));
}
function quizDndVerdicts(q, st) {
  const drops = st.drops || {};
  /* a zone may list several acceptable tokens (`accept`) — producer 07.10, screen 16:
     the two קבוצה ב' phrases count in either ב' blank, whichever went where */
  return q.zones.map((z, i) => quizDndZoneOk(z, drops[i]));
}

/* ---------- selection handlers ---------- */
function quizSelect(screen, el) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  if (st.done) return;
  /* a pick already marked ✓ on the retry stays as it is */
  if (q.type === 'multi' && el.classList.contains('correct')) return;
  const opts = document.querySelectorAll(`#q${screen} .scq-opt`);
  /* QA 04.11.26 (unit 16, dslide 33): `maxPicks` - a multi that asks for N answers takes at most N;
     a further pick is ignored until one is un-ticked (a ✓ kept from the retry counts) */
  if (q.type === 'multi' && q.maxPicks && !el.classList.contains('selected') &&
      [...opts].filter(o => o.classList.contains('selected') || o.classList.contains('correct')).length >= q.maxPicks) return;
  // A new selection after a wrong attempt clears the wrong marks
  opts.forEach(o => o.classList.remove('wrong'));
  quizHideFeedback(screen);

  if (q.type === 'multi') {
    el.classList.toggle('selected');
    el.setAttribute('aria-checked', el.classList.contains('selected'));
    st.selectedSet = [...opts].filter(o => o.classList.contains('selected')).map(o => o.dataset.id);
    document.getElementById(`q${screen}-check`).disabled = st.selectedSet.length === 0;
  } else {
    opts.forEach(o => { o.classList.remove('selected'); o.setAttribute('aria-checked', 'false'); });
    el.classList.add('selected');
    el.setAttribute('aria-checked', 'true');
    st.selected = el.dataset.id;
    document.getElementById(`q${screen}-check`).disabled = false;
  }
}

function quizDualChange(screen) {
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const sels = [...document.querySelectorAll(`#q${screen} .year-select`)];
  sels.forEach(s => s.classList.remove('wrong'));
  st.selectedSet = sels.map(s => s.value);
  document.getElementById(`q${screen}-check`).disabled = st.selectedSet.some(v => !v);
}

function quizInputChange(screen) {
  const qq = QUESTIONS.find(x => x.screen === screen);
  /* 11.10 — the filter used to keep only [0-9.,], so a MINUS could not be
     typed at all and a negative answer was unanswerable (deck slide 32 asks
     for -30). A sign is part of a number everywhere, so it is always kept.
     `allowText` additionally keeps letters, for an algebraic answer such as
     that slide's last row, 10x. */
  const strip = (qq && qq.allowText) ? /[^0-9.,\-A-Za-z\u0590-\u05FF ]/g : /[^0-9.,\-]/g;
  document.querySelectorAll(`#q${screen} .vi-input`).forEach(i => {
    const clean = i.value.replace(strip, '');
    if (clean !== i.value) i.value = clean;
  });
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const inputs = [...document.querySelectorAll(`#q${screen} .vi-input`)];
  /* same contract as the dropdown above: a field the learner is editing drops
     the mark the last check gave it (it used to keep a stale ✗, because only
     `wrong` was cleared and `mark-bad` stayed), and an untouched right field
     keeps its ✓. */
  inputs.forEach((inp, i) => {
    if (st.retryOk && st.retryOk[i] && inp.value === st.retryVals[i]) return;
    inp.classList.remove('wrong', 'correct', 'mark-ok', 'mark-bad');
    const slot = inp.parentNode;
    if (slot && slot.classList && slot.classList.contains('vi-slot')) delete slot.dataset.mark;
  });
  st.selectedSet = inputs.map(i => i.value.trim());
  /* `allowEmpty`: deck slide 66 asks the learner to LEAVE a box empty when no
     number fits, so an empty field cannot gate the button there. */
  const qq2 = QUESTIONS.find(x => x.screen === screen);
  document.getElementById(`q${screen}-check`).disabled =
    (qq2 && qq2.allowEmpty) ? st.selectedSet.every(v => !v) : st.selectedSet.some(v => !v);
}

/* 16.09, producer (screen 49): the longest option ran under the chevron, and
   the box changed width once the ✓/✗ arrived. The select is measured against
   its widest option ON SCREEN ENTRY (a hidden select measures 0) and pinned to
   a px width that already carries both paddings, so nothing shifts later. */
function quizFitSelects(screen) {
  const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
  if (!sels.length || !sels[0].offsetWidth) return;
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;top:-9999px;left:-9999px';
  document.body.appendChild(probe);
  sels.forEach(sel => {
    if (sel.dataset.fitted && document.fonts && document.fonts.status === 'loaded') return;
    const cs = getComputedStyle(sel);
    probe.style.font = cs.font;
    probe.textContent = 'اختاروا';
    let widest = probe.getBoundingClientRect().width;
    [...sel.options].forEach(o => {
      probe.textContent = o.textContent;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    });
    const chrome = parseFloat(cs.paddingInlineStart) + parseFloat(cs.paddingInlineEnd) +
      parseFloat(cs.borderInlineStartWidth) + parseFloat(cs.borderInlineEndWidth);
    /* QA 25.10: +20 (was +4) - the text was cut inside the box on the client's
       machine; measured before the web font loaded, or with its metrics */
    sel.style.width = Math.ceil(widest + chrome + 20) + 'px';
    sel.dataset.fitted = '1';
  });
  probe.remove();
  /* re-fit once the web font is in (a pre-font measure is too narrow) */
  if (document.fonts && document.fonts.status !== 'loaded' && !quizFitSelects._wait) {
    quizFitSelects._wait = true;
    document.fonts.ready.then(() => { quizFitSelects._wait = false; quizFitSelects(screen); });
  }
}

function quizDropdownChange(screen) {
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const q = QUESTIONS.find(x => x.screen === screen);
  const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
  /* 11.10 — this used to clear the mark on EVERY select, so the ✓ on a slot the
     learner had already got right vanished the moment any OTHER slot was
     touched, which read as the answers resetting. The rule (producer 16.09) is
     the opposite: a right slot keeps its ✓ through the retry. A mark survives
     only if THIS check awarded it and the learner has not changed that slot —
     so nothing new is revealed before the next check either. */
  sels.forEach((s, i) => {
    const keep = st.retryOk && st.retryOk[i] && s.value === st.retryVals[i];
    s.classList.toggle('correct', !!keep);
    s.classList.remove('wrong');
  });
  st.selectedSet = sels.map(s => s.value);
  let need = st.selectedSet.some(v => !v);
  const tail = document.querySelector(`#q${screen} .vi-tail`);
  if (tail && q && q.valueTail) {
    const off = q.valueTail.disableWhen !== undefined &&
                st.selectedSet.indexOf(q.valueTail.disableWhen) > -1;
    tail.disabled = off;
    if (off) { tail.value = ''; tail.classList.remove('wrong', 'mark-ok', 'mark-bad'); }
    tail.closest('.dd-tail').classList.toggle('is-off', off);
    st.tailValue = tail.value.trim();
    if (!off && !st.tailValue) need = true;
  }
  document.getElementById(`q${screen}-check`).disabled = need;
}

function quizStatementPick(screen, row, el) {
  const st = quizState[screen];
  if (st.done) return;
  quizHideFeedback(screen);
  const rowEl = el.closest('.stmt-row');
  rowEl.classList.remove('wrong');
  rowEl.querySelectorAll('.stmt-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  st.selectedSet = [...document.querySelectorAll(`#q${screen} .stmt-row`)].map(r =>
    r.querySelector('.stmt-pill.selected')?.dataset.val || '');
  document.getElementById(`q${screen}-check`).disabled = st.selectedSet.some(v => !v);
}

/* ---------- check / feedback ---------- */
function quizIsCorrect(q, st) {
  if (q.type === 'single') return st.selected === q.correct;
  if (q.type === 'multi') {
    return q.correctSet.length === st.selectedSet.length &&
      q.correctSet.every(id => st.selectedSet.includes(id));
  }
  if (q.type === 'dual-select') {
    const pair = [...st.selectedSet].sort();
    return JSON.stringify(pair) === JSON.stringify([...q.correctPair].sort()) &&
      st.selectedSet[0] !== st.selectedSet[1];
  }
  if (q.type === 'dropdown') {
    const picks = st.selectedSet.every((v, i) => v === q.blanks[i].correct);
    if (!picks || !q.valueTail) return picks;
    /* a tail switched off by its own select is not part of the answer */
    const off = q.valueTail.disableWhen !== undefined &&
                st.selectedSet.indexOf(q.valueTail.disableWhen) > -1;
    return off ? true : quizSameValue(st.tailValue || '', q.valueTail.correct);
  }
  if (q.type === 'statement') {
    return st.selectedSet.every((v, i) => v === String(q.statements[i].correct));
  }
  if (q.type === 'dnd') {
    return q.zones.every((z, i) => quizDndZoneOk(z, (st.drops || {})[i]));
  }
  if (q.type === 'value-input') {
    /* 30.09 — compare NUMERICALLY, not as strings. A learner who types 9.0,
       09, 20.00 or a thousands comma was being marked wrong for a right
       answer. Anything that is not a clean number on both sides still falls
       back to a trimmed string compare. */
    const same = quizSameValue;
    const matches = (arr) => st.selectedSet.length === arr.length && st.selectedSet.every((v, i) => same(v, arr[i]));
    return matches(q.correctInputs) || (q.altInputs || []).some(matches);
  }
  return false;
}

/* ── One value comparison for the WHOLE engine ───────────────────────────────
   `quizIsCorrect` judged a field numerically ("450.0" == "450") while the two
   markers judged it with `===`, so a correctly-answered field could be told it
   was wrong. Both now call this. */
function quizNumValue(v) {
  const t = String(v).trim().replace(/,/g, '');
  return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : null;
}
function quizSameValue(a, b) {
  const x = quizNumValue(a), y = quizNumValue(b);
  if (x !== null && y !== null) return Math.abs(x - y) < 1e-9;
  return String(a).trim() === String(b).trim();
}

/* Per-FIELD verdicts for a value-input question, against whichever accepted
   set the learner matched best. Used by the retry marker AND the reveal
   marker, so a field cannot be a ✓ in one and an ✗ in the other. */
/* ONE painter for a field's verdict. `mark-ok|mark-bad` and `correct|wrong`
   are two parallel pairs, and `.vi-input.mark-bad` sits AFTER `.mark-ok` in
   the cascade — so a stale `mark-bad` left by an earlier attempt outranks a
   freshly-added `mark-ok` and paints a now-correct answer red. Clearing only
   `wrong`/`correct` (as quizMarkOutcome did) is not enough: every call site
   must set all four, which is why they all go through here. */
function quizPaintSlot(inp, ok) {
  inp.classList.toggle('correct', ok);
  inp.classList.toggle('mark-ok', ok);
  inp.classList.toggle('wrong', !ok);
  inp.classList.toggle('mark-bad', !ok);
  const slot = inp.parentNode;
  if (slot && slot.classList && slot.classList.contains('vi-slot')) {
    slot.dataset.mark = ok ? 'ok' : 'bad';
  }
}

function quizSlotVerdicts(q, st) {
  const altSets = [q.correctInputs, ...(q.altInputs || [])];
  const score = arr => arr.filter((v, i) => quizSameValue(st.selectedSet[i] || '', v)).length;
  const best = altSets.find(arr => arr.every((v, i) => quizSameValue(st.selectedSet[i] || '', v))) ||
    altSets.reduce((a, b) => (score(b) > score(a) ? b : a), q.correctInputs);
  return { best, slotOk: best.map((v, i) => quizSameValue(st.selectedSet[i] || '', v)) };
}

/* ── partly-right answers (Elad 26.10.26 GENERAL RULE; ported here QA 28.10 "גורף") ──
   An answer with SOME right parts (a multi-select with at least one right pick,
   a drag/value/dropdown/statement with at least one right slot) says so:
     retry (first attempt): "תשובה נכונה באופן חלקי. נסו שוב!"
     final:                 "תשובה נכונה באופן חלקי." / "התשובה הנכונה מוצגת."
   (the final panel keeps the question's explanation under that title).
   A config may still name its own `fb.retryPartial`. Single choice is never partial. */
const FB_PARTIAL_RETRY = 'إجابة صحيحة جزئيًا. حاولوا مرة أخرى!';
const FB_PARTIAL_FINAL = 'الإجابة صحيحة جزئياً.<br>الإجابة الصحيحة معروضة.';
function quizIsPartial(q, st) {
  if (!q || !st || quizIsCorrect(q, st)) return false;
  const scope = `#q${q.screen}`;
  if (q.type === 'multi') return (st.selectedSet || []).some(id => (q.correctSet || []).includes(id));
  if (q.type === 'dnd' && typeof quizDndVerdicts === 'function') return quizDndVerdicts(q, st).some(Boolean);
  if (q.type === 'value-input' && typeof quizSlotVerdicts === 'function') return quizSlotVerdicts(q, st).slotOk.some(Boolean);
  if (q.type === 'dropdown') return [...document.querySelectorAll(`${scope} .dd-select`)].some((s, i) => q.blanks[i] && s.value === q.blanks[i].correct);
  if (q.type === 'statement') return [...document.querySelectorAll(`${scope} .stmt-row`)].some((r, i) => {
    const p = r.querySelector('.stmt-pill.selected');
    return p && q.statements[i] && p.dataset.val === String(q.statements[i].correct);
  });
  return false;
}

function quizCheck(screen) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  if (st.done) { goTo(q.nextScreen != null ? q.nextScreen : screen + 1); return; }

  st.attempts += 1;
  const correct = quizIsCorrect(q, st);
  const partial = quizIsPartial(q, st);   /* measured before the markers change the state */

  st.wasCorrect = correct;
  if (correct) {
    const hintBtn = document.getElementById(`q${screen}-hint`);
    if (hintBtn) hintBtn.style.display = 'none';
    quizMarkOutcome(screen, q, true);
    quizShowFeedback(screen, 'correct', q.fb && q.fb.correct);
    quizFinish(screen);
  } else if (st.attempts >= q.maxAttempts) {
    const hintBtn = document.getElementById(`q${screen}-hint`);
    if (hintBtn) hintBtn.style.display = 'none';
    quizMarkOutcome(screen, q, false);
    const fb = q.fb ? { ...q.fb.wrong } : null;
    if (fb && partial) fb.title = FB_PARTIAL_FINAL;   /* was 'כמעט! …', value-input only */
    quizShowFeedback(screen, 'wrong', fb);
    /* QA 04.11.26 (producer, גורף): EVERY non-choice question's final wrong panel carries the
       מעבר לתשובה שלי toggle - drags, value inputs, dropdowns and statement rows */
    if (['value-input', 'dnd', 'dropdown', 'statement'].includes(q.type)) quizAnswerToggleAdd(screen, q);
    quizFinish(screen);
  } else {
    quizMarkRetry(screen, q);
    quizShowFeedback(screen, 'wrong', q.fb ? { title: partial ? (q.fb.retryPartial || FB_PARTIAL_RETRY) : q.fb.retry, body: '' } : null);
    if (q.hintPolicy === 'after-wrong') {
      const hb = document.getElementById(`q${screen}-hint`);
      if (hb) hb.style.visibility = 'visible';
    }
    document.getElementById(`q${screen}-check`).disabled = true; // until a new selection
  }
}

function quizMarkRetry(screen, q) {
  if (q.type === 'multi') {
    /* producer 07.10 pm (S19, S27, "in general"): a partial first attempt keeps
       the picks that ARE right in the ✓ state — still checked and locked — and
       only the wrong picks go ✗ and come unchecked. Same rule value-input,
       dropdown and dnd already follow. */
    const st = quizState[screen];
    document.querySelectorAll(`#q${screen} .scq-opt.selected`).forEach(o => {
      if (q.correctSet.includes(o.dataset.id)) {
        o.classList.add('correct');
      } else {
        o.classList.remove('selected');
        o.classList.add('wrong');
        o.setAttribute('aria-checked', 'false');
      }
    });
    st.selectedSet = [...document.querySelectorAll(`#q${screen} .scq-opt.selected`)].map(o => o.dataset.id);
  } else if (q.type === 'single') {
    document.querySelectorAll(`#q${screen} .scq-opt.selected`).forEach(o => {
      o.classList.remove('selected');
      o.classList.add('wrong');
      o.setAttribute('aria-checked', 'false');
    });
    quizState[screen].selected = null;
    quizState[screen].selectedSet = [];
  } else if (q.type === 'dual-select') {
    document.querySelectorAll(`#q${screen} .year-select`).forEach(s => s.classList.add('wrong'));
  } else if (q.type === 'value-input') {
    /* producer 04.10 (screen 53): "if one input is wrong it marks them both as
       wrong — if the answer is right on check then mark it right". Same rule the
       dropdown branch below already follows. */
    const st = quizState[screen];
    const { slotOk } = quizSlotVerdicts(q, st);
    const vins = [...document.querySelectorAll(`#q${screen} .vi-input`)];
    vins.forEach((inp, i) => { quizPaintSlot(inp, !!slotOk[i]); });
    st.retryOk = slotOk.slice();
    st.retryVals = vins.map(i => i.value);
  } else if (q.type === 'dnd') {
    /* same rule as value-input (producer 04.10): a blank the learner already
       got right keeps its ✓ on the retry instead of being reset with the rest. */
    const st = quizState[screen];
    const ok = quizDndVerdicts(q, st);
    q.zones.forEach((_, i) => {
      const box = document.getElementById(`q${screen}-zone-${i}`);
      if (!box) return;
      box.classList.toggle('mark-ok', ok[i]);
      box.classList.toggle('mark-bad', !ok[i]);
      /* a wrong token goes back to the bank so the blank can be re-answered */
      if (!ok[i]) { delete st.drops[i]; }
    });
    quizDndRender(screen, q);
    q.zones.forEach((_, i) => {
      const box = document.getElementById(`q${screen}-zone-${i}`);
      if (box) { box.classList.toggle('mark-ok', ok[i]); box.classList.toggle('mark-bad', !ok[i]); }
    });
  } else if (q.type === 'dropdown') {
    /* producer 16.09: "make sure that right answers has V" — a slot the learner
       already got right is marked ✓ on the retry instead of staying blank. */
    const st = quizState[screen];
    const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
    sels.forEach((s, i) => {
      if (s.value !== q.blanks[i].correct) { s.classList.add('wrong'); s.classList.remove('correct'); }
      else { s.classList.add('correct'); s.classList.remove('wrong'); }
    });
    /* what THIS check awarded, so a later edit elsewhere cannot take it away
       and a slot the learner changes cannot keep a stale mark */
    st.retryOk = sels.map((s, i) => s.value === q.blanks[i].correct);
    st.retryVals = sels.map(s => s.value);
  } else if (q.type === 'statement') {
    [...document.querySelectorAll(`#q${screen} .stmt-row`)].forEach((r, i) => {
      const pick = r.querySelector('.stmt-pill.selected');
      if (pick && pick.dataset.val !== String(q.statements[i].correct)) r.classList.add('wrong');
    });
  }
}

function quizMarkOutcome(screen, q, isCorrect) {
  /* Slide 26's feedback says the reduced ratios "מופיעות כעת" — they are part
     of the SOLUTION, not of the question, so they are in the markup from the
     start and revealed by this class rather than injected. */
  const sec = document.getElementById(`q${screen}`);
  if (sec) sec.classList.add('is-solved');
  if (q.type === 'single' || q.type === 'multi') {
    const correctIds = q.type === 'multi' ? q.correctSet : [q.correct];
    document.querySelectorAll(`#q${screen} .scq-opt`).forEach(o => {
      const inCorrect = correctIds.includes(o.dataset.id);
      const wasChosen = o.classList.contains('selected');
      o.classList.remove('selected');
      if (inCorrect) o.classList.add('correct');
      else if (wasChosen && !isCorrect) o.classList.add('wrong');
    });
  } else if (q.type === 'dual-select') {
    const sels = [...document.querySelectorAll(`#q${screen} .year-select`)];
    if (!isCorrect) sels.forEach((s, i) => { s.value = q.correctPair[i]; });
    sels.forEach(s => { s.classList.remove('wrong'); s.classList.add('correct'); s.disabled = true; });
  } else if (q.type === 'value-input') {
    const inputs = [...document.querySelectorAll(`#q${screen} .vi-input`)];
    const st = quizState[screen];
    // per-field verdict (partial answers get per-input V/X, notes 50/63)
    const { best, slotOk } = quizSlotVerdicts(q, st);
    st.userInputs = inputs.map(i => i.value);
    st.answerKey = best;
    st.slotOk = slotOk;
    inputs.forEach((inp, i) => {
      quizPaintSlot(inp, !!st.slotOk[i]);
      inp.disabled = true;
      /* QA 15.09 (screen 34): painting the V/X as the input's own background
         needs padding-left, which pushes the digit off-centre inside the box.
         The mark moves onto a wrapper as a corner badge instead, so the answer
         stays centred exactly as the deck draws it. */
      let slot = inp.parentNode;
      if (!slot || !slot.classList.contains('vi-slot')) {
        slot = document.createElement('span');
        slot.className = 'vi-slot';
        inp.parentNode.insertBefore(slot, inp);
        slot.appendChild(inp);
      }
      slot.dataset.mark = st.slotOk[i] ? 'ok' : 'bad';
    });
  } else if (q.type === 'dnd') {
    const st = quizState[screen];
    const ok = quizDndVerdicts(q, st);
    st.userDrops = Object.assign({}, st.drops);
    st.dndOk = ok;
    const sol = quizDndSolution(q);
    q.zones.forEach((z, i) => {
      const box = document.getElementById(`q${screen}-zone-${i}`);
      if (!box) return;
      /* the solution is shown in every blank; the learner's own answer stays
         reachable through the View-My-Answer toggle in the feedback panel */
      /* a CORRECT answer is never rewritten: with `accept` zones the learner's
         own arrangement is as right as the canonical one, and reshuffling it
         reads as the engine correcting an answer that was already right. */
      const show = isCorrect ? (st.drops || {})[i] : sol[i];
      box.innerHTML = show === undefined ? '' : `<span class="dnd-token is-placed">${q.tokens[show]}</span>`;
      box.classList.add('is-filled');
      box.classList.toggle('mark-ok', ok[i]);
      box.classList.toggle('mark-bad', !ok[i]);
    });
    document.querySelectorAll(`#q${screen} .dnd-bank .dnd-token`).forEach(t => {
      t.disabled = true; t.draggable = false; t.classList.remove('is-held');
    });
  } else if (q.type === 'dropdown') {
    const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
    /* the learner's own picks, for the answer toggle (the reveal below overwrites .value) */
    if (quizState[screen]) quizState[screen].ddMine = sels.map(s => s.value);
    sels.forEach((s, i) => {
      const ok = s.value === q.blanks[i].correct;
      if (!isCorrect && !ok) s.classList.add('wrong'); else s.classList.remove('wrong');
      if (!ok) s.value = q.blanks[i].correct;
      if (ok || isCorrect) s.classList.add('correct');
      s.disabled = true;
    });
    const tail = document.querySelector(`#q${screen} .vi-tail`);
    if (tail && q.valueTail) {
      const off = q.valueTail.disableWhen !== undefined &&
                  q.blanks.some((b, i) => b.correct === q.valueTail.disableWhen);
      tail.closest('.dd-tail').classList.toggle('is-off', off);
      if (off) { tail.value = ''; }
      else {
        const ok = quizSameValue(tail.value.trim(), q.valueTail.correct);
        if (!ok) tail.value = q.valueTail.correct;
        quizPaintSlot(tail, ok || isCorrect);
      }
      tail.disabled = true;
    }
  } else if (q.type === 'statement') {
    if (quizState[screen]) quizState[screen].stmtMine = [...document.querySelectorAll(`#q${screen} .stmt-row`)]
      .map(r => { const p = r.querySelector('.stmt-pill.selected'); return p ? p.dataset.val : null; });
    [...document.querySelectorAll(`#q${screen} .stmt-row`)].forEach((r, i) => {
      const correctVal = String(q.statements[i].correct);
      r.querySelectorAll('.stmt-pill').forEach(p => {
        p.disabled = true;
        const picked = p.classList.contains('selected');
        if (p.dataset.val === correctVal) p.classList.add('correct');
        else if (picked && !isCorrect) p.classList.add('wrong');
      });
    });
  }
}

/* magnifier zoom for content images (note 67, גורף) */
function quizImageZoomInit(scope) {
  /* `.teach-experiment img` added 15.09.26: screen 3's second applet ships as
     a static PNG and sat outside the sweep, so it had no magnifier.
     `data-no-zoom` is the opt-out, as in the other units. */
  /* 17.09.26 — the size gate used to read `img.width`, which is 0 until the file
     has DECODED. This init runs once, 50ms after DOMContentLoaded: on our own
     machines the images are cached and already decoded, on the client's server
     they are not, so screens 24/31/32 shipped with no magnifier at all. On 24
     the unwrapped <img> also overflowed its row (the width cap lives on
     .img-zoom-wrap), which is the horizontal scroll the client saw and we did
     not. Decide on the DECODED size, and when an image has not decoded yet,
     wait for it instead of silently skipping it. */
  /* `.ct-ruler` added 04.10: the class-task ruler (screens 28-32) sat outside
     the sweep, so the producer's "add zoom to image" on 28 is really the whole
     task run — the same picture appears on all five. */
  (scope || document).querySelectorAll('.quiz-content img, .explain-content img, .teach-experiment img, .ct-ruler, img[data-zoom]').forEach(img => {
    if (img.closest('.img-zoom-wrap') || img.closest('.character-widget')
        || img.hasAttribute('data-no-zoom')) return;
    if (!img.complete || !img.naturalWidth) {
      if (!img.dataset.zoomPending) {
        img.dataset.zoomPending = '1';
        const again = () => { delete img.dataset.zoomPending; quizImageZoomInit(img.parentNode); };
        img.addEventListener('load', again, { once: true });
        img.addEventListener('error', () => { delete img.dataset.zoomPending; }, { once: true });
      }
      return;
    }
    if (img.naturalWidth < 120) return;
    const wrap = document.createElement('span');
    wrap.className = 'img-zoom-wrap';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'applet-zoom-btn img-zoom-btn';
    btn.setAttribute('aria-label', 'تكبير الصورة');
    btn.innerHTML = ZOOM_GLYPH;
    btn.onclick = () => quizImageZoomOpen(img.src, img.alt, img);
    wrap.appendChild(btn);
  });
}
/* 16.09, producer (screen 54): a TABLE can be magnified too. Opt in per table
   with `data-zoom` — this is not applied to every table in the unit. The
   overlay is the same one images use; the table is cloned into it and scaled,
   so the live one keeps whatever state it has. */
function quizTableZoomInit(scope) {
  (scope || document).querySelectorAll('table[data-zoom]').forEach(tbl => {
    if (tbl.parentNode.classList && tbl.parentNode.classList.contains('table-zoom-wrap')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-zoom-wrap';
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'applet-zoom-btn img-zoom-btn';
    btn.setAttribute('aria-label', 'تكبير الجدول');
    btn.innerHTML = ZOOM_GLYPH;
    btn.onclick = () => quizNodeZoomOpen(tbl);
    wrap.appendChild(btn);
  });
}

function quizNodeZoomOpen(node) {
  const ov = quizZoomOverlay();
  const box = ov.querySelector('.zoom-node');
  box.innerHTML = '';
  const copy = node.cloneNode(true);
  box.appendChild(copy);
  /* cloneNode copies an input's ATTRIBUTES, not what the learner typed — the
     zoomed menu opened with an empty box (producer 07.10). Mirror the live
     values in, and whatever is typed in the zoomed copy back out, so the
     number survives the zoom in both directions and the צדקתי? gate still
     sees the live input change. */
  const live = node.querySelectorAll('input, select');
  copy.querySelectorAll('input, select').forEach((c, i) => {
    const src = live[i]; if (!src) return;
    c.value = src.value; c.disabled = src.disabled;
    c.removeAttribute('onchange'); c.removeAttribute('oninput'); c.removeAttribute('id');
    c.addEventListener('input', () => { src.value = c.value; src.dispatchEvent(new Event('input', { bubbles: true })); });
    c.addEventListener('change', () => { src.value = c.value; src.dispatchEvent(new Event('change', { bubbles: true })); });
  });
  box.hidden = false;
  ov.querySelector('img').hidden = true;
  ov.style.display = 'grid';
}

function quizZoomOverlay() {
  let ov = document.getElementById('img-zoom-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'img-zoom-overlay';
    /* 17.09.26, producer (screen 31): this close button was the ONE close in the
       unit that carried `applet-close-btn` ALONE. That class only sets
       display/padding — the approved chip (Figma Zoom/Close 1589:17043 /
       1589:17081: 44px circle, white fill, 2px subject stroke, hover inverts)
       lives on `applet-zoom-btn`. So the image-zoom overlay rendered a bare
       black X floating over the report flag instead of the approved control.
       It is now byte-identical to appletEmbed()'s close, chip and glyph. */
    ov.innerHTML = '<button type="button" class="applet-zoom-btn applet-close-btn" aria-label="إغلاق" onclick="quizImageZoomClose()">' +
      '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true"><line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>' +
      '<img alt=""><div class="zoom-node" hidden></div>';
    document.getElementById('app').appendChild(ov);
    ov.addEventListener('click', e => { if (e.target === ov) quizImageZoomClose(); });
  }
  return ov;
}

/* 13.10 (Elad, standing): "make sure ALWAYS that when zooming into an image
   the image is bigger than the slide.. cyz if not there is no reason for the
   zoom." A magnifier that opens the picture at its natural size is useless
   whenever the slide already shows it at or above that size — which is the
   normal case for the deck's own low-res crops. So the overlay SCALES the
   image up relative to what the slide was showing: at least 1.6x, capped by
   the stage. `fromEl` is the image that was clicked, so the comparison is
   against its real rendered size, not an assumption. */
const ZOOM_MIN_GROWTH = 1.6;

function quizImageZoomOpen(src, alt, fromEl) {
  const ov = quizZoomOverlay();
  ov.querySelector('.zoom-node').hidden = true;
  const img = ov.querySelector('img');
  img.hidden = false;
  img.src = src;
  img.alt = alt || '';
  ov.style.display = 'grid';

  const app = document.getElementById('app');
  const fit = () => {
    img.style.width = '';
    img.style.height = '';
    const nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || !nh || !app) return;
    const k = (typeof stageScale === 'function' && stageScale()) || 1;
    const onSlideW = fromEl ? fromEl.getBoundingClientRect().width / k : 0;
    const availW = app.clientWidth * 0.94;
    const availH = app.clientHeight * 0.94;
    /* never smaller than the slide already showed it, and never past the stage */
    let w = Math.max(nw, onSlideW * ZOOM_MIN_GROWTH);
    w = Math.min(w, availW, availH * (nw / nh));
    img.style.width = w + 'px';
    img.style.height = 'auto';
    /* QA 25.10: the stylesheet's max-height: 82% clipped the HEIGHT while the
       width above stayed, which stretched every zoomed picture sideways (S36).
       The caps are computed here, so the CSS ones must not apply. */
    img.style.maxWidth = 'none';
    img.style.maxHeight = 'none';
  };
  if (img.complete && img.naturalWidth) fit();
  else img.addEventListener('load', fit, { once: true });
}
function quizImageZoomClose() {
  const ov = document.getElementById('img-zoom-overlay');
  if (ov) ov.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', () => setTimeout(() => { quizImageZoomInit(); quizTableZoomInit(); }, 50));
/* safety net for a cold server: run the sweep again once every image has landed */
window.addEventListener('load', () => { quizImageZoomInit(); quizTableZoomInit(); });

/* show-correct-answer / my-answer toggle inside the feedback box (note 63) */
/* ── View My Answer Toggle — ONE implementation, shared ──────────────────────
   720-templates → _global-components.md → "View My Answer Toggle". Required
   wherever the reveal overwrites the same element that held the learner's
   answer (value-input questions AND the class task). Canonical labels, not
   paraphrased; pure view switch — never touches attempts, done, scoring or
   reporting. Only the final-wrong outcome ever gets it. */
const ANSWER_TOGGLE_LABELS = { toAnswer: 'الانتقال إلى إجابتي', toSolution: 'الإجابة الصحيحة' };

function answerToggleAdd(box, getInputs, st) {
  if (!box || !st || !st.answerKey) return;
  const paint = (inp, i, showMine) => {
    inp.value = showMine ? (st.userInputs[i] || '') : st.answerKey[i];
    quizPaintSlot(inp, !showMine || !!st.slotOk[i]);
  };
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fb-answer-toggle';
  btn.dataset.mode = 'solution';
  btn.textContent = btn.dataset.label = ANSWER_TOGGLE_LABELS.toAnswer;
  btn.onclick = () => {
    const showMine = btn.dataset.mode === 'solution';
    getInputs().forEach((inp, i) => paint(inp, i, showMine));
    btn.dataset.mode = showMine ? 'answer' : 'solution';
    btn.textContent = btn.dataset.label = showMine ? ANSWER_TOGGLE_LABELS.toSolution : ANSWER_TOGGLE_LABELS.toAnswer;
  };
  box.appendChild(btn);
  /* opens on the solution view (template default) */
  getInputs().forEach((inp, i) => paint(inp, i, false));
}

/* QA 04.11.26 - the dropdown and statement equivalents (lifted from air-uses-01's engine, 03.11).
   Solution view = every slot on its key, all green; my view = the learner's picks with ✓ / ✗.
   Both open on the solution, like the other toggles. */
function quizToggleButton(box, paint) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fb-answer-toggle';
  btn.dataset.mode = 'solution';
  btn.textContent = btn.dataset.label = ANSWER_TOGGLE_LABELS.toAnswer;
  btn.onclick = () => {
    const showMine = btn.dataset.mode === 'solution';
    paint(showMine);
    btn.dataset.mode = showMine ? 'answer' : 'solution';
    btn.textContent = btn.dataset.label = showMine ? ANSWER_TOGGLE_LABELS.toSolution : ANSWER_TOGGLE_LABELS.toAnswer;
  };
  box.appendChild(btn);
  paint(false);
}
function quizDdAnswerToggleAdd(screen, q) {
  const box = document.getElementById(`q${screen}-feedbox`), st = quizState[screen];
  if (!box || !st || !st.ddMine) return;
  const sels = [...document.querySelectorAll(`#q${screen} .dd-select`)];
  quizToggleButton(box, showMine => sels.forEach((s, i) => {
    const key = q.blanks[i].correct, mine = st.ddMine[i], ok = mine === key;
    s.value = showMine ? mine : key;
    s.classList.toggle('correct', showMine ? ok : true);
    s.classList.toggle('wrong', showMine && !ok);
    if (typeof quizFitSelects === 'function') quizFitSelects(screen);
  }));
}
function quizStmtAnswerToggleAdd(screen, q) {
  const box = document.getElementById(`q${screen}-feedbox`), st = quizState[screen];
  if (!box || !st || !st.stmtMine) return;
  const rows = [...document.querySelectorAll(`#q${screen} .stmt-row`)];
  quizToggleButton(box, showMine => rows.forEach((r, i) => {
    const key = String(q.statements[i].correct), mine = st.stmtMine[i];
    r.querySelectorAll('.stmt-pill').forEach(p => {
      const v = p.dataset.val;
      const on = showMine ? v === mine : v === key;
      p.classList.toggle('selected', on);
      p.classList.toggle('correct', on && v === key);
      p.classList.toggle('wrong', on && v !== key);
    });
  }));
}
function quizAnswerToggleAdd(screen, q) {
  if (q.type === 'dnd') { quizDndAnswerToggleAdd(screen, q); return; }
  if (q.type === 'dropdown') { quizDdAnswerToggleAdd(screen, q); return; }
  if (q.type === 'statement') { quizStmtAnswerToggleAdd(screen, q); return; }
  answerToggleAdd(
    document.getElementById(`q${screen}-feedbox`),
    () => [...document.querySelectorAll(`#q${screen} .vi-input`)],
    quizState[screen]
  );
}

/* The dnd equivalent of answerToggleAdd: the blanks hold tokens, not input
   values, so the two views swap their CONTENT rather than a .value. Labels and
   opening view (solution first) are the canonical ones. */
/* The token to SHOW in each blank when the solution is revealed. A zone that
   names one `correct` token answers for itself; a zone that lists `accept`
   (several tokens are right in any blank — deck slide 41's three names ending
   in י) has no single answer, so the accepted tokens are handed out one per
   blank, skipping any already shown. Without this the reveal printed
   `q.tokens[undefined]`, i.e. the word "undefined", in every such blank. */
function quizDndSolution(q) {
  const used = new Set();
  return q.zones.map(z => {
    if (z.correct !== undefined) { used.add(z.correct); return z.correct; }
    const pick = (z.accept || []).find(t => !used.has(t));
    if (pick !== undefined) used.add(pick);
    return pick;
  });
}

function quizDndAnswerToggleAdd(screen, q) {
  const box = document.getElementById(`q${screen}-feedbox`);
  const st = quizState[screen];
  if (!box || !st || !st.dndOk) return;
  const sol = quizDndSolution(q);
  const paint = (showMine) => {
    q.zones.forEach((z, i) => {
      const el = document.getElementById(`q${screen}-zone-${i}`);
      if (!el) return;
      const t = showMine ? st.userDrops[i] : sol[i];
      el.innerHTML = t === undefined ? '' : `<span class="dnd-token is-placed">${q.tokens[t]}</span>`;
      el.classList.toggle('is-filled', t !== undefined);
      el.classList.toggle('mark-ok', showMine ? !!st.dndOk[i] : true);
      el.classList.toggle('mark-bad', showMine ? !st.dndOk[i] : false);
    });
  };
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fb-answer-toggle';
  btn.dataset.mode = 'solution';
  btn.textContent = btn.dataset.label = ANSWER_TOGGLE_LABELS.toAnswer;
  btn.onclick = () => {
    const showMine = btn.dataset.mode === 'solution';
    paint(showMine);
    btn.dataset.mode = showMine ? 'answer' : 'solution';
    btn.textContent = btn.dataset.label = showMine ? ANSWER_TOGGLE_LABELS.toSolution : ANSWER_TOGGLE_LABELS.toAnswer;
  };
  box.appendChild(btn);
  paint(false);
}

/* Slide 39's note: the feedback shows בן's table, with a button that brings
   back the table the QUESTION showed. Both ship in the body and the button
   flips which is visible, so neither is rebuilt (and neither can go stale). */
function fbTableSwap(btn) {
  const wrap = btn.closest('.fb-table-swap');
  if (!wrap) return;
  const ben = wrap.querySelector('.fb-table-ben');
  const prev = wrap.querySelector('.fb-table-prev');
  const showingBen = wrap.dataset.showing === 'ben';
  ben.hidden = showingBen;
  prev.hidden = !showingBen;
  wrap.dataset.showing = showingBen ? 'prev' : 'ben';
  btn.textContent = showingBen ? 'الوصفة حسب اقتراح بن' : 'الوصفة السابقة';
}

/* feedback boxes are draggable so they never hide the question (notes 38/58) */
function quizFeedboxDrag(box) {
  if (box.dataset.dragWired) return;
  box.dataset.dragWired = '1';
  let sx = 0, sy = 0, ox = 0, oy = 0, dragging = false;
  box.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a, input, select')) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY;
    const t = (box.style.transform.match(/translate\((-?[\d.]+)px, (-?[\d.]+)px\)/) || [0, 0, 0]);
    ox = parseFloat(t[1]) || 0; oy = parseFloat(t[2]) || 0;
    box.setPointerCapture(e.pointerId);
    box.style.cursor = 'grabbing';
  });
  box.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    /* #app is CSS-scaled to the viewport, so a raw client delta over-travels:
       the panel drifted away from the pointer at every size but 1:1. Convert
       the screen delta back into stage pixels. */
    const app = document.getElementById('app');
    const scale = app ? (app.getBoundingClientRect().width / 1280) || 1 : 1;
    box.style.transform = `translate(${ox + (e.clientX - sx) / scale}px, ${oy + (e.clientY - sy) / scale}px)`;
  });
  const stop = () => { dragging = false; box.style.cursor = ''; };
  box.addEventListener('pointerup', stop);
  box.addEventListener('pointercancel', stop);
}

function quizFinish(screen) {
  const st = quizState[screen];
  st.done = true;
  quizStepperUpdate(screen);
  document.querySelectorAll(`#q${screen} .scq-opt`).forEach(o => o.classList.add('locked'));
  const check = document.getElementById(`q${screen}-check`);
  /* liquid-uses-01 14.10: a deck may name its own forward label (deck 12:
     "ממשיכים לחקור") — `nextLabel`. QA 25.10 (UNIT-WIDE): after feedback the
     blue button reads המשך (was שנמשיך?). */
  navLabel(check, (QUESTIONS.find(x => x.screen === screen) || {}).nextLabel || 'متابعة');
  check.disabled = false;
  /* a screen whose note reads "אין רמז" has no hint button at all (deck 43,
     49, 51), so this has to tolerate its absence — it was throwing on finish
     and aborting the rest of quizFinish. */
  const hint = document.getElementById(`q${screen}-hint`);
  if (hint) hint.disabled = true;
  /* a screen that keeps something back until its question resolves (S14's
     closing sentence) hooks in here; a unit without the hook just skips */
  const after = window[`s${screen}Resolved`];
  if (typeof after === 'function') after();
}

/* Decide whether a feedback body needs its scroller, by measuring it with the
   360px cap applied (see the .fb-body rules). Reading scrollHeight forces
   layout, so the first pass is SYNCHRONOUS — rAF was wrong here: it does not
   run under a frozen compositor (headless virtual time, a backgrounded tab),
   and the body would stay untagged with overflow hidden, which CLIPS it.
   A second pass on a timer catches a late-loading image or font changing the
   height. */
/* producer 07.10 pm (S26, S27): a feedback whose body scrolls shows the same
   drifting scroll gesture as the S8 scroll screen — beside the body's own bar,
   gone on the first scroll or after its three drift cycles. The sprite comes
   from the unit (makeClickHint); an engine running without it just skips. */
function fbScrollHint(body, scrolls) {
  const box = body.closest('.quiz-feedbox');
  if (!box) return;
  const id = `${box.id}-fb-hint-scroll`;
  let hint = document.getElementById(id);
  if (!scrolls || body.dataset.scrolled) { if (hint) hint.remove(); return; }
  if (hint || typeof makeClickHint !== 'function') return;
  hint = makeClickHint(id);
  /* the cursor sits 149px into the 300px frame: land it 20px below the body's top */
  hint.style.top = (body.offsetTop + 20 - 149) + 'px';
  hint.addEventListener('animationend', e => { if (e.target === hint && e.animationName === 'hintDrift') hint.remove(); });
  if (!body.dataset.hintWired) {
    body.dataset.hintWired = '1';
    body.addEventListener('scroll', () => { body.dataset.scrolled = '1'; const h = document.getElementById(id); if (h) h.remove(); });
  }
  box.appendChild(hint);
}

function fbFitCheck(body) {
  const decide = () => {
    const h = body.clientHeight;
    /* A body that is not laid out yet measures 0, and `0 > 0 + 2` is false —
       which would lift the cap and let a long feedback spill out of its panel.
       So an unmeasurable body stays in the SAFE state (capped + scrollable)
       and is re-checked once it has a box. (720-verification: measuring a
       display:none element yields zeros.) */
    body.classList.remove('is-scrollable', 'fits');
    if (!h) { body.classList.add('is-scrollable'); return false; }
    const scrolls = body.scrollHeight > h + 2;
    body.classList.add(scrolls ? 'is-scrollable' : 'fits');
    fbScrollHint(body, scrolls);
    return true;
  };
  const ok = decide();
  /* second (and, if it was not laid out, third) pass for a late image or font */
  setTimeout(decide, 60);
  if (!ok) setTimeout(decide, 260);
}

function quizShowFeedback(screen, kind, fb) {
  const box = document.getElementById(`q${screen}-feedbox`);
  const q = QUESTIONS.find(x => x.screen === screen);
  /* liquid-uses-01 14.10: `fb: null` = the deck authors NO popup for this
     question (deck 21) — the options are marked, nothing opens. */
  if (!fb) return;
  /* A retry line ("זו טעות. נסו שוב!") is a few words and was being laid out at
     the full 420px panel width (producer 05.10: "the feedback width is a bit
     much for those kind of feedbacks"). A body-less panel sizes to its text;
     a full feedback keeps the panel width unchanged. */
  const short = !fb.body ? ' is-short' : '';
  const noScroll = (q && q.fbScroll === false) ? ' fb-noscroll' : '';
  box.className = `quiz-feedbox ${kind === 'correct' ? 'is-correct' : 'is-wrong'}${short}${noScroll}`;
  box.style.transform = '';
  quizFeedboxDrag(box);
  box.innerHTML = `
    <div class="scq-fb-title">${fb.title}</div>${fb.body ? `<div class="fb-body">${fb.body}</div>` : ''}`;
  /* The 360px cap plus the body's own padding could leave a ONE-PIXEL overflow
     on a panel that visibly fits, and `overflow-y: auto` then drew a scrollbar
     for nothing (s42: scrollHeight 127 vs clientHeight 126). Measure after
     layout and switch the scroller off when it is not needed — producer 05.10:
     "if not needed do not add the scroll". */
  const fbBody = box.querySelector('.fb-body');
  if (fbBody) fbFitCheck(fbBody);
}

function quizHideFeedback(screen) {
  const box = document.getElementById(`q${screen}-feedbox`);
  box.className = 'quiz-feedbox';
  box.innerHTML = '';
}

/* ---------- hint (shared overlay, populated per question) ---------- */
function quizOpenHint(screen) {
  const st = quizState[screen];
  const q = QUESTIONS.find(x => x.screen === screen);
  /* 07.09, producer: the hint is re-openable as often as the learner wants.
     It used to lock after the first close (hintUsed), which made the button a
     one-shot. The button is already removed outright once a question is
     answered (quizFinish / the two branches in quizCheck), so `done` is the
     only state that still closes it off. */
  if (st.done) return;
  const overlay = document.getElementById('quiz-hint-overlay');
  overlay.dataset.forScreen = screen;
  /* .hint-title-text, not .hint-title: the title element now holds the bulb
     icon as its first child, and assigning textContent to the PARENT would
     delete it on the first open. */
  /* producer 15.09.26: no standing title on the hint card. 04.10 — that
     blanked EVERY title, and 17 hints keep their first sentence in the title
     field ('מצאו תחילה כמה שורות…', 'היעזרו ביישומון', 'חשבו:'). Only the
     standing label is dropped; any other title opens the body as its first line. */
  overlay.querySelector('.hint-title-text').textContent = '';
  const t = (q.hint.title || '').trim();
  const lead = /^انتبهوا[!:.]?$/.test(t) ? '' : (t ? t + '<br>' : '');
  overlay.querySelector('.hint-body').innerHTML = lead + q.hint.body;
  overlay.classList.remove('hidden');
}

function quizCloseHint() {
  const overlay = document.getElementById('quiz-hint-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  const screen = Number(overlay.dataset.forScreen);
  overlay.classList.add('hidden');
  if (quizState[screen]) {
    quizState[screen].hintUsed = true;   /* recorded for reporting, no longer a lock */
  }
}

/* resetScreenState hook — completed questions stay locked (resume-state) */
function quizResetScreenState(screen) {
  quizStepperUpdate(screen);
  quizFitSelects(screen);
  quizDndHintInit(screen);
  quizTableZoomInit(document.getElementById(`q${screen}`) || undefined);
  const st = quizState[screen];
  if (!st || st.done) return;
  // in-progress state is left as-is on return navigation
}
