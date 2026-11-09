'use strict';
/* ═══════════════════════════════════════════════════════════════════
   methodica-liquid-uses-01 — question configs (יעד 16, נוזלים)
   ONE array for the whole unit; each component builds only its own range
   (window.PART_CONFIG in script.js). Copy, keys and feedback come from
   docs/forensics/slides-*.md — read from the deck XML + render, not inferred.
   Schema: template-library/templates/_engine-proportion-03/README.md.
   Attempts (Elad 14.10): 2 everywhere, 1 on a two-option question.
   ═══════════════════════════════════════════════════════════════════ */

/* the applet's 4-stage bar (deck strip image22, rebuilt live; the deck's
   picture always shows stage 1 — the notes give the real states). RTL: the
   FIRST station renders rightmost. `active` = 1..4; earlier stages are done. */
const LQ_STAGES = ['التخطيط', 'تنفيذ الاختبار وجمع البيانات', 'تحليل النتائج', 'استخلاص الاستنتاجات'];
function lqStageBar(active) {
  let h = '';
  LQ_STAGES.forEach((lab, k) => {
    const i = k + 1;
    const cls = i < active ? ' is-correct' : (i === active ? ' is-current' : '');
    /* QA 25.10: the regular stepper's dot (no numbers) */
    h += `<div class="qprog-station${cls}" data-step="${i}"><span class="qprog-dot">${typeof QP_TICK !== 'undefined' ? QP_TICK : ''}</span><span class="qprog-label">${lab}</span></div>`;
    if (i < LQ_STAGES.length) h += `<span class="qprog-line${i < active ? ' is-done' : ''}" data-after="${i}"></span>`;
  });
  return `<div class="qprog lq-stagebar" aria-label="المرحلة ${active} من 4">${h}</div>`;
}

/* deck 21: the two averages, rebuilt as live text (the deck's picture bakes
   them at ~12px, under the 18px floor) */
const LQ_AVG_CARDS = `<div class="lq-avg-cards" data-no-zoom>
  <div class="lq-avg-card lq-avg-card--a"><p class="lq-avg-name">سائل أ</p><p>متوسط زمن الغوص:</p><p class="lq-lcd" dir="ltr">3.0</p><p>ثوانٍ</p></div>
  <div class="lq-avg-card lq-avg-card--b"><p class="lq-avg-name">سائل ب</p><p>متوسط زمن الغوص:</p><p class="lq-lcd" dir="ltr">6.0</p><p>ثوانٍ</p></div>
</div>`;

/* ═══ component 01 · deck slides 3-26 ═══════════════════════════════ */

/* deck 12 — the sorting table (2×2, rtl=1): the FIRST header renders
   rightmost. Three zones per column; order inside a column is free, so each
   zone `accept`s its column's tokens. Token order = the bank as rendered. */
const S8_LAYOUT = `<table class="car-table lq-sort-table">
  <thead><tr><th>المشتركة لجميع السوائل</th><th>قد تختلف من سائل إلى آخر</th></tr></thead>
  <tbody><tr><td><div class="lq-sort-col">{{0}}{{1}}{{2}}</div></td><td><div class="lq-sort-col">{{3}}{{4}}{{5}}</div></td></tr></tbody>
</table>`;
const S8_COMMON = [0, 1, 3], S8_DIFFERENT = [2, 4, 5];

const QUESTIONS = [
  /* ═══ screen 8 · deck slide 12 · אתגר: גם ניחוש נחשב! ═══════════════
     No hint, no check pill drawn — the check is the engine's צדקתי?; the deck's
     forward label is "ממשיכים לחקור". Key = the solved copy drawn in the table,
     agrees with slides 9 + 14 and the correct popup. */
  {
    screen: 8,
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-sort',
    stem: `<h1 class="ts-title lq-q-title">تحدي: التخمين أيضًا يُحتسب!</h1>
      <p>هل أنتم مستعدون لتحدٍّ صغير في التصنيف؟ أمامكم ست خصائص للسوائل، بعضها مألوف وبعضها جديد.</p>
      <p><strong class="lq-blue">اسحبوا كل خاصية إلى المجموعة التي تبدو مناسبة لكم.</strong><br>لستم متأكدين؟ حان وقت التخمين!</p>`,
    tokens: ['يأخذ شكل الوعاء الذي يحتويه', 'ينساب', 'درجة الغليان', 'ذو حجم ثابت', 'الكثافة', 'لزوجة'],
    layout: S8_LAYOUT,
    zones: [
      { correct: 1, accept: S8_COMMON }, { correct: 3, accept: S8_COMMON }, { correct: 0, accept: S8_COMMON },
      { correct: 2, accept: S8_DIFFERENT }, { correct: 4, accept: S8_DIFFERENT }, { correct: 5, accept: S8_DIFFERENT },
    ],
    maxAttempts: 1,
    hintPolicy: 'none',
    nextLabel: 'متابعة',   /* QA 25.10 */
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>قمتم بترتيب خصائص السوائل.</p><p>الآن، هيا نتعرّف عن قرب إلى الخصائص التي تميّز بينها.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>بعض هذه الخصائص ما زالت جديدة عليكم، وهذا أمر طبيعي تماماً.</p><p><strong>سنتعرّف عليها حالًا ونفهم ما يميّز<br>كلّ واحدة منها.</strong></p>` },
    },
  },

  /* ═══ screen 17 · deck slide 21 · applet שלב 3 ═════════════════════
     "אין רמז". Key = green pill (נוזל ב'); agrees with the data (6.0 > 3.0).
     The deck authors NO feedback popup and no check pill for this slide →
     `fb: null` (mark only). Two options → one attempt. The question/options
     mismatch (asks "slower", options are viscosity) is the deck's — flagged. */
  {
    screen: 17,
    type: 'single',
    stem: `${lqStageBar(3)}
      <p class="lq-stage-title"><strong>المرحلة 3 | نقارن النتائج</strong></p>
      <p>فحصتم كم استغرقت الكرة الزجاجية من الوقت لتغوص في كل سائل.</p>
      ${LQ_AVG_CARDS.replace('class="lq-avg-cards"', 'class="lq-avg-cards lq-avg-cards--stem"')}
      <p><strong class="lq-blue">في أي سائل غاصت ببطء أكبر؟</strong></p>`,
    /* QA 25.10 (Elad's mock): the whole question sits in the right column -
       title, the two average cards, the question, the options */
    /* QA 28.10: options read only the liquid name (they answer "which sank slower") */
    options: [
      { id: 'a', html: "سائل أ" },
      { id: 'b', html: "سائل ب" },
    ],
    correct: 'b',
    maxAttempts: 1,
    hintPolicy: 'none',
    fb: null,
  },

  /* ═══ screen 18 · deck slide 22 · applet שלב 4 ═════════════════════
     "אין רמז". Key = green pill (option 3); agrees with the feedback. */
  {
    screen: 18,
    type: 'single',
    stem: `${lqStageBar(4)}
      <p class="lq-stage-title"><strong>المرحلة 4 | نستخلص الاستنتاجات</strong></p>
      <p>اكتشفنا أن الكرة الزجاجية استغرقت وقتاً أطول لتغوص في السائل ب.</p>
      ${LQ_AVG_CARDS.replace('class="lq-avg-cards"', 'class="lq-avg-cards lq-avg-cards--stem"')}
      <p><strong class="lq-blue">ما الذي يمكن استنتاجه عن لزوجة السوائل؟</strong></p>`,
    /* QA 25.10: the two average cards from S17 repeat here, same place */
    /* QA 04.11.26 (dslide 18): "צמיגי יותר" in both options; a hint after the first wrong try,
       so a second attempt (was one) */
    options: [
      { id: 'a', html: 'لكلا السائلين اللزوجة نفسها' },
      { id: 'b', html: "السائل أ أكثر لزوجة" },
      { id: 'c', html: "السائل ب أكثر لزوجة" },
    ],
    correct: 'c',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>تذكّروا:<br>لزوجة منخفضة - سائل ينساب بسهولة (مثل الماء)، ولذلك فإن الجسم الذي يغوص فيه سيغوص<br>عادةً بسرعة أكبر.<br>لزوجة عالية - سائل ينساب ببطء أكبر (مثل العسل)، ولذلك فإن الجسم الذي يغوص فيه سيغوص<br>عادةً ببطء أكبر.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'بالضبط', body: `<p>كلما كان زمن الغوص أطول،<br>كان السائل أكثر لزوجة.</p>` },
      wrong:   { title: 'أوه، ليس تماماً!', body: `<p>كلما كان زمن الغوص أطول،<br>كان السائل أكثر لزوجة.</p>` },
    },
  },

  /* ═══ screen 21 · deck slide 25 · warm-up שאלה 1 מתוך 2 ════════════
     Dropdown. Key = the highlighted row; agrees with both popups.
     "רמז מופיע אחרי ניסיון ראשון". */
  {
    screen: 21,
    step: { group: 'c01w', index: 1, total: 2 },
    type: 'dropdown',
    stem: `<p><strong class="lq-blue">اختاروا:</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/lab-pouring-pair.jpg" alt="تقف فتاة وفتى في المختبر؛ تسكب الفتاة سائلاً أزرق في أوعية تحتوي على سوائل بألوان أخضر وأحمر وأصفر.">`,
    sentence: ['إحدى الخصائص المشتركة بين جميع السوائل هي ', '.'],
    blanks: [{ pool: ['لزوجة عالية', 'حجم ثابت عند درجة حرارة معينة', 'كثافة متساوية', 'درجة الغليان نفسها'], correct: 'حجم ثابت عند درجة حرارة معينة' }],
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا فيما ينطبق على كل سائل، بغضّ النظر عن نوع السائل.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>لجميع السوائل حجم ثابت عند درجة حرارة معينة.<br>أمّا اللزوجة والكثافة ودرجة الغليان<br>فقد تختلف من سائل إلى آخر.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>لجميع السوائل حجم ثابت عند درجة حرارة معينة.<br>أمّا اللزوجة والكثافة ودرجة الغليان<br>فقد تختلف من سائل إلى آخر.</p>` },
    },
  },

  /* ═══ screen 22 · deck slide 26 · warm-up שאלה 2 מתוך 2 ════════════
     Key = green pill (option 3); agrees with the feedback. Copy verbatim incl.
     "לתוך לשלושה" (comment marked תוקן, text unchanged — flagged). */
  {
    screen: 22,
    step: { group: 'c01w', index: 2, total: 2 },
    type: 'single',
    stem: `<p>في فحص اللزوجة، تُسقَط كرة زجاجية مماثلة في كل واحد من ثلاثة مخابر مدرّجة تحتوي على سوائل مختلفة، ويُقاس زمن غوص الكرة الزجاجية في كل مخبار.</p>
      <p><strong class="lq-blue">ما العوامل التي يجب أن تبقى ثابتة في الفحوصات الثلاثة، لكي تكون المقارنة دقيقة؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/cylinders-stopwatch.jpg" alt="ساعة إيقاف وثلاثة مخابر مدرّجة تحتوي على سوائل أصفر وشفاف وبرتقالي؛ فوق كل مخبار كرة زجاجية وسهم متقطّع متجه إلى الأسفل.">`,
    options: [
      { id: 'a', html: 'نوع السائل الذي يُفحص في كل واحد من المخابر المدرّجة.' },
      { id: 'b', html: 'زمن الغوص الذي يُقاس بساعة الإيقاف.' },
      { id: 'c', html: 'الكرة الزجاجية وارتفاع السقوط ودرجة حرارة الغرفة.' },
      { id: 'd', html: 'عدد المخابر المدرّجة التي تُفحص أثناء التجربة.' },
    ],
    correct: 'c',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكروا: ما الذي يجب أن يكون متماثلا في جميع التجارب<br>إذا أردنا اختبار تأثير نوع السائل فقط؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح!', body: `<p>نوع السائل هو المتغير المستقل، وزمن الغوص<br>هو المتغير التابع. ولفحص العلاقة بينهما،<br>تُحافَظ على بقية ظروف التجربة ثابتة.</p>` },
      wrong:   { title: 'أخطأتَ،<br>هذه هي الطريقة الصحيحة، لكنك تحتاج إلى مزيد من الدقة.', body: `<p>نوع السائل هو المتغير المستقل، وزمن الغوص<br>هو المتغير التابع. ولفحص العلاقة بينهما،<br>تُحافَظ على بقية ظروف التجربة ثابتة.</p>` },
    },
  },

  /* ═══ component 02 · deck slides 28-34 · תרגול סטנדרטי (6 q, pass 4) ═══
     All six: "רמז מופיע אחרי ניסיון ראשון", 2 attempts, retry line is the
     engine standard. Popup line breaks are ours (the deck's popups are
     off-canvas and never rendered) — each line fits the 640px panel. */

  /* ═══ screen 24 · deck slide 29 · שאלה 1 מתוך 6 ═══════════════════════
     Matching table (3 cols, rtl=1: the FIRST header is the rightmost). KEY
     BUILT PER THE FEEDBACK (Elad 14.10): pipes = זרימה, container = קבלת
     צורת הכלי, 200 מ״ל = נפח קבוע. The deck's drawn answer state swaps the
     first and last — flagged. Bank order = rendered right → left. */
  {
    screen: 24,
    step: { group: 'c02', index: 1, total: 6 },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-match',
    stem: `<p>في مصنع النور تُستخدم السوائل بطرق مختلفة.<br>لكل استخدام تُشترط خاصية معينة للسائل.</p>
      <p class="lq-gap-top"><strong class="lq-blue">طابقوا بين الخصائص والاستخدامات المناسبة لها.</strong></p>`,
    tokens: ['جريان', 'حجم ثابت عند درجة حرارة معينة', 'اتخاذ شكل الوعاء'],
    layout: `<table class="car-table lq-match-table">
      <thead><tr><th>نقل السائل عبر<br>أنابيب النظام</th><th>ملء وعاء<br>غير منتظم الشكل</th><th>قياس 200 مل من السائل<br>ونقله إلى النظام</th></tr></thead>
      <tbody><tr><td>{{0}}</td><td>{{1}}</td><td>{{2}}</td></tr></tbody>
    </table>`,
    zones: [{ correct: 0 }, { correct: 2 }, { correct: 1 }],
    maxAttempts: 1,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا فيما يحدث للسائل في كل حالة من هذه الاستخدامات:<br>هل ينتقل من مكان إلى آخر، أم يتخذ شكل الإناء الذي يوضع فيه،<br>أم يبقى بالكمية نفسها؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>لكل خاصية من خصائص السائل أهمية عملية: فالقدرة على الجريان<br>تتيح نقل السوائل عبر الأنابيب، واتخاذ شكل الوعاء<br>يتيح لها التلاؤم مع الوعاء الذي توجد فيه،<br>والحجم الثابت يتيح قياس كمية محدّدة من السائل.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>لكل خاصية من خصائص السائل أهمية عملية: فالقدرة على الجريان<br>تتيح نقل السوائل عبر الأنابيب، واتخاذ شكل الوعاء<br>يتيح لها التلاؤم مع الوعاء الذي توجد فيه،<br>والحجم الثابت يتيح قياس كمية محدّدة من السائل.</p>` },
    },
  },

  /* ═══ screen 25 · deck slide 30 · שאלה 2 מתוך 6 ═══════════════════════
     PointSelectionHotspot (engine `hotspot`). Key = chunk B (green dashed
     border); agrees with the feedback. Notes: "להפוך את המשפטים למהבהבים" →
     the chunks pulse until the first pick. Copy verbatim, incl. the comma
     inside chunk B, no "?" and the wrong popup's "המושפע- התוצאה" — flagged. */
  {
    screen: 25,
    step: { group: 'c02', index: 2, total: 6 },
    type: 'single',
    stem: `<p>أمامكم سؤال البحث الذي صيغ في مختبر السوائل قبل فحص اللزوجة.</p>
      <p class="lq-gap-top"><strong class="lq-blue">انقروا على الجزء من الجملة الذي يشير إلى المتغير التابع.</strong><br>أي الخاصية التي تُقاس في الفحص.</p>`,
    hotspot: [
      ['كيف يؤثر', { id: 'a', html: 'نوع السائل' }, 'عَلى', { id: 'b', html: 'المدة بالثواني التي تستغرقها الكرة الزجاجية لتغوص من سطح السائل إلى قاع المخبار المدرّج،' }],
      [{ id: 'c', html: 'عندما تُستخدم الكرة الزجاجية نفسها وارتفاع السقوط نفسه في جميع الفحوصات' }],
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>المتغير التابع هو النتيجة التي نقيسها في التجربة.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>زمن الغوص هو المتغير التابع -<br>النتيجة التي تُقاس في التجربة. نوع السائل هو المتغير<br>المستقل، والكرة الزجاجية وارتفاع السقوط عاملان<br>يُحافَظ عليهما ثابتين.</p>` },
      wrong:   { title: 'لقد أخطأت،<br>كل خطأ يعزز قدرتكم.', body: `<p>زمن الغوص هو المتغير التابع -<br>النتيجة التي تُقاس في التجربة. نوع السائل هو المتغير<br>المستقل، والكرة الزجاجية وارتفاع السقوط عاملان<br>يُحافَظ عليهما ثابتين.</p>` },
    },
  },

  /* ═══ screen 26 · deck slide 31 · שאלה 3 מתוך 6 ═══════════════════════
     Key = green pill (option 1); agrees with the feedback. Table rtl=1:
     שם הנוזל is the RIGHT column. The deck's stray blue frame around the
     1.5 cell (מלבן 76) is built as a highlight (Elad 15.10). */
  {
    screen: 26,
    step: { group: 'c02', index: 3, total: 6 },
    type: 'single',
    stem: `<p>لفحص لزوجة ثلاثة سوائل، أُسقطت الكرة نفسها (مثلًا، كرة زجاجية)<br>من الارتفاع نفسه في كل سائل، وقياس زمن غوصها بساعة إيقاف (ستوبر).<br>سُجّلت البيانات في الجدول أمامكم، لكن أحد عناوين الجدول اختفى.</p>
      <p class="lq-gap-top"><strong class="lq-blue">ما هو عنوان العمود الأيسر؟</strong><br>(المتغير التابع الذي تقيسه التجربة)</p>`,
    content: `<table class="car-table lq-data-table">
      <thead><tr><th>اسم السائل</th><th>???</th></tr></thead>
      <tbody><tr><td>ماء</td><td class="lq-cell-hi">1.5</td></tr><tr><td>زيت</td><td>16</td></tr><tr><td>عسل</td><td>45</td></tr></tbody>
    </table>`,
    options: [
      { id: 'a', html: 'زمن غوص الكرة الزجاجية (بالثواني).' },
      { id: 'b', html: 'نوع السائل الموجود في كل مخبار مدرّج.' },
      { id: 'c', html: 'الارتفاع الذي تُسقَط منه الكرة الزجاجية (سم).' },
      { id: 'd', html: 'عدد التكرارات التي أُجريت في كل قياس.' },
    ],
    correct: 'a',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>تذكّروا النتيجة التي قسناها في التجربة ودوّنّاها في الجدول.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'أحسنتم!', body: `<p>زمن غوص الكرة الزجاجية (بالثواني) هو المتغير التابع -<br>وهو النتيجة التي تُقاس في التجربة.</p><p>نوع السائل هو المتغير المستقل، وهو العامل الذي نغيّره بين التجارب.</p><p>يُحافَظ على ارتفاع السقوط والكرة الزجاجية ثابتين لإتاحة<br>مقارنة موثوقة وصالحة بين السوائل.</p>` },
      wrong:   { title: 'أوه، ليس تماماً!', body: `<p>زمن غوص الكرة الزجاجية (بالثواني) هو المتغير التابع -<br>وهو النتيجة التي تُقاس في التجربة.</p><p>نوع السائل هو المتغير المستقل، وهو العامل الذي نغيّره بين التجارب.</p><p>يُحافَظ على ارتفاع السقوط والكرة الزجاجية ثابتين لإتاحة<br>مقارنة موثوقة وصالحة بين السوائل.</p>` },
    },
  },

  /* ═══ screen 27 · deck slide 32 · שאלה 4 מתוך 6 ═══════════════════════
     Key = green pill (קשת - כי היא ביצעה בידוד משתנים); agrees with the
     feedback. The two plan cards are the deck's own photo crop (image34,
     srcRect r=69%) + the deck's live text. Option 1 keeps "מהשתנה" — flagged. */
  {
    screen: 27,
    step: { group: 'c02', index: 4, total: 6 },
    type: 'single',
    /* QA 04.11.26 (dslide 27): ONE scroll - the two plan cards on top, the question and the
       options under them (scrollMain; the cards moved from `content` into the stem) */
    scrollMain: true,
    stem: `<p>خطّط طالبان لتجربة لمقارنة لزوجة سائلين باستخدام زمن غوص كرة زجاجية.</p>
      <div class="lq-plans lq-plans--row" data-no-zoom>
      <div class="lq-plan-card lq-plan-card--a">
        <div class="lq-plan-text"><p><strong>أمير خطّط:</strong></p><p>ارتفاع السقوط نفسه وكمية السائل نفسها<br>في المخبارين المدرّجين، لكن كرة زجاجية<br>في السائل أ وكرة معدنية في السائل ب.</p><p>في كل سائل يُجري 3 قياسات<br>ويحسب المتوسط.</p></div>
        <img src="assets/img/plan-amir.png" alt="طالب يرتدي معطف مختبر ونظارات واقية ويمسك كرة زجاجية بجانب مخابر مدرّجة." data-no-zoom>
      </div>
      <div class="lq-plan-card lq-plan-card--b">
        <div class="lq-plan-text"><p><strong>خطّطت ليان:</strong></p><p>الكرة الزجاجية نفسها وارتفاع السقوط نفسه وكمية<br>السائل نفسها في المخبارين المدرّجين.</p><p>في كل سائل تُجري 3 قياسات<br>وتحسب المتوسط.</p></div>
        <img src="assets/img/plan-keshet.png" alt="طالبة ترتدي معطف مختبر ونظارات واقية وتمسك كرة زجاجية بجانب مخابر مدرّجة." data-no-zoom>
      </div>
    </div>
      <p class="lq-gap-top"><strong class="lq-blue">أيّ التصميمين، تصميم أمير أم تصميم ليان،<br>يتيح استنتاجًا صالحًا بشأن أيّ السائلين أكثر لزوجة؟</strong></p>`,
    options: [
      { id: 'a', html: 'أمير - لأن نوع الكرة هو المتغير التابع الذي نفحصه<br>في التجربة، والتكرارات تعزّز موثوقية البيانات.' },
      { id: 'b', html: 'ليان - لأنها عزلت المتغيرات (غيّرت نوع السائل فقط) وأضافت<br>تكرارات لتعزيز موثوقية البيانات.' },
      { id: 'c', html: 'كلاهما - لأن زمن الغوص يُقاس في التصميمين،<br>ولذلك سيعطي كل تصميم الاستنتاج نفسه.' },
      { id: 'd', html: 'ليان - لكن فقط إذا أجرت قياسًا واحدًا في كل سائل، كي لا<br>تختلط عليها نتائج القياسات.' },
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>افحصوا أمرين:<br>1. هل يتغيّر في التجربة نوع السائل فقط (المتغير المستقل)؟<br>2. هل توجد تكرارات تعزّز النتيجة؟</p>` },   /* the deck numbers these two (buAutoNum) */
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>يحافظ التصميم العلمي الصالح على ثبات جميع ظروف التجربة<br>ويغيّر المتغير المستقل فقط - وهو في هذه الحالة<br>نوع السائل. كذلك فإن تكرار القياس وحساب المتوسط<br>يعزّزان موثوقية البيانات.</p>` },
      wrong:   { title: 'أخطأتَ،<br>وهذا جزء طبيعي من عملية التعلّم.', body: `<p>يحافظ التصميم العلمي الصالح على ثبات جميع ظروف التجربة<br>ويغيّر المتغير المستقل فقط - وهو في هذه الحالة<br>نوع السائل. كذلك فإن تكرار القياس وحساب المتوسط<br>يعزّزان موثوقية البيانات.</p>` },
    },
  },

  /* ═══ screen 28 · deck slide 33 · שאלה 5 מתוך 6 ═══════════════════════
     Key = green pill (option 4); agrees with the feedback ("כיול ובדיקת
     תקינות"). Picture = the slide-17 cylinder (image21), re-encoded. */
  {
    screen: 28,
    step: { group: 'c02', index: 5, total: 6 },
    type: 'single',
    stem: `<p>قبل فحص سائلين جديدين في مختبر السوائل،<br>تُسقَط الكرة الزجاجية نفسها أولًا في مخبار مدرّج يحتوي على الماء - وهو سائل يُعرف زمن غوص الكرة فيه ويُتوقّع مسبقًا.</p>
      <p class="lq-gap-top"><strong class="lq-blue">ما هو هدف هذا النشاط؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/cylinder-drop.jpg" alt='أسطوانة زجاجية تحتوي على سائل أزرق فاتح، وكرة معدنية في الجزء العلوي منها، وسهم متقطع متجه نحو الأسفل. وقد وُسِمَ "ارتفاع السقوط" و"حجم السائل"، وبجانب الأسطوانة مسطرة بالسنتيمترات عليها التدريجان 0 و20.'>`,
    options: [
      { id: 'a', html: 'تسخين الكرة قبل الفحص، كي تغوص بالمعدل نفسه في كل سائل.' },
      { id: 'b', html: 'زيادة عدد السوائل التي يتم اختبارها، حتى تشمل المقارنة أنواعًا أكثر من السوائل.' },
      { id: 'c', html: 'تقصير مدة الفحص كله، لأن الكرة تغوص في الماء أسرع مما تغوص في بقية السوائل.' },
      { id: 'd', html: 'لضمان أن إعداد الاختبار يعمل بشكل صحيح، حتى يمكن الاعتماد على النتائج الخاصة بالسوائل الجديدة.' },
    ],
    correct: 'd',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا فيما يمكن تعلّمه من غوص الكرة الزجاجية في الماء<br>بالمعدل المتوقّع تمامًا؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>هذه معايرة وفحص لسلامة النظام. نستخدم<br>نتيجة نعرفها مسبقًا للتأكّد من أن النظام يعمل<br>كما ينبغي، قبل فحص السوائل الجديدة.</p>` },
      wrong:   { title: 'لا بأس، لقد أخطأت', body: `<p>هذه معايرة وفحص لسلامة النظام. نستخدم<br>نتيجة نعرفها مسبقًا للتأكّد من أن النظام يعمل<br>كما ينبغي، قبل فحص السوائل الجديدة.</p>` },
    },
  },

  /* ═══ screen 29 · deck slide 34 · שאלה 6 מתוך 6 ═══════════════════════
     Classification: bank LEFT (DOM last), table right. Key = the drawn
     answer state (author-confirmed in the comment thread); order inside a
     column is free → `accept`. Bank order = rendered top → bottom. */
  {
    screen: 29,
    step: { group: 'c02', index: 6, total: 6 },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-sort lq-sort6',
    stem: `<p>أمامكم خصائص مختلفة للسوائل.</p>
      <p class="lq-gap-top"><strong class="lq-blue">اسحبوا كل خاصية إلى المجموعة المناسبة لها:</strong></p>`,
    tokens: ['درجة الغليان', 'الكثافة', 'جريان', 'حجم ثابت عند درجة حرارة معينة', 'لزوجة', 'اتخاذ شكل الوعاء'],
    layout: `<table class="car-table lq-sort-table">
      <thead><tr><th>الخاصية المشتركة بين جميع السوائل</th><th>الخاصية التي تميّز سائلاً عن آخر</th></tr></thead>
      <tbody><tr><td><div class="lq-sort-col">{{0}}{{1}}{{2}}</div></td><td><div class="lq-sort-col">{{3}}{{4}}{{5}}</div></td></tr></tbody>
    </table>`,
    zones: [
      { correct: 2, accept: [2, 3, 5] }, { correct: 3, accept: [2, 3, 5] }, { correct: 5, accept: [2, 3, 5] },
      { correct: 0, accept: [0, 1, 4] }, { correct: 1, accept: [0, 1, 4] }, { correct: 4, accept: [0, 1, 4] },
    ],
    maxAttempts: 1,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا في كل خاصية على حدة:</p><p>هل تنطبق على جميع السوائل، أم يمكن أن<br>تختلف من نوع سائل إلى آخر؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'كلّ الاحترام!', body: `<p>تشترك جميع السوائل في خصائص الجريان واتخاذ شكل<br>الوعاء والحجم الثابت عند درجة حرارة معينة. أمّا<br>السوائل فقد تختلف في اللزوجة والكثافة<br>ودرجة الغليان.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>تشترك جميع السوائل في خصائص الجريان واتخاذ شكل<br>الوعاء والحجم الثابت عند درجة حرارة معينة. أمّا<br>السوائل فقد تختلف في اللزوجة والكثافة<br>ودرجة الغليان.</p>` },
    },
  },

  /* ═══ component 03 · deck slides 36-43 ═════════════════════════════════
     Basic set (37-40, 4 q, pass 3): "רמז מופיע על ההתחלה" → hint button
     visible from the start. Standard-B (42-43, 2 q, no pass rule): 42 "אין
     רמז", 43 after the first attempt. Popup line breaks are ours. */

  /* ═══ screen 31 · deck slide 37 · בסיסי 1 מתוך 4 ═══════════════════════
     Dropdown in the sentence. Key = the highlighted row (משנה את); agrees with
     the feedback. A two-item pool → ONE attempt (§1i). */
  {
    screen: 31,
    step: { group: 'c03', index: 1, total: 4 },
    type: 'dropdown',
    stem: `<p><strong class="lq-blue">أكملوا الجملة باستخدام الخيار المناسب.</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/pour-jug-vessels.jpg" alt="يد تسكب الماء من إبريق زجاجي؛ على طاولة خشبية كوب زجاجي وزجاجة بلاستيكية ومرطبان، جميعها فارغة." data-no-zoom>`,
    sentence: ['عندما يُسكب سائل في كوب أو زجاجة أو مرطبان،<br>فإن السائل ', ' شكله وفقًا للوعاء الذي يوجد فيه.'],
    blanks: [{ pool: ['يحافظ على', 'يغيّر'], correct: 'يغيّر' }],
    maxAttempts: 1,
    hintPolicy: 'always',
    hint: { body: `<p>فكّروا فيما يحدث لشكل السائل عندما ننقله من كأس دائرية الشكل إلى زجاجة ضيقة:</p><p>هل تبقى كما هي؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>لا يحافظ السائل على شكل ثابت، بل يأخذ شكل<br>الوعاء الذي يوجد فيه. لذلك قد يبدو السائل نفسه<br>مختلفًا في الكأس أو في الزجاجة أو في الجرة.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>لا يحافظ السائل على شكل ثابت، بل يأخذ شكل<br>الوعاء الذي يوجد فيه. لذلك قد يبدو السائل نفسه<br>مختلفًا في الكأس أو في الزجاجة أو في الجرة.</p>` },
    },
  },

  /* ═══ screen 32 · deck slide 38 · בסיסי 2 מתוך 4 ═══════════════════════
     Key = green pill (נפח המים); agrees with the feedback. Feedback keeps the
     deck's "שמעבירים" (the comment's "כשמעבירים" fix was applied to the stem
     only) — flagged. The photo's whiteboard shows the answer — flagged. */
  {
    /* QA 04.11.26 (dslide 32): the producer's classroom photo; "כשמעבירים" in the feedback; the
       options lose their final full stop */
    screen: 32,
    step: { group: 'c03', index: 2, total: 4 },
    type: 'single',
    stem: `<p><strong class="lq-blue">ما الذي يبقى ثابتًا عند نقل الماء من الكوب إلى الزجاجة؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/classroom-water-pour.jpg" alt="يصب صبيّ الماء من إبريق في زجاجة، وعلى الطاولة كأس وجرّة فارغتان؛ وفتاة تراقب. على اللوح في الخلفية: حجم ثابت، شكل متغيّر." data-no-zoom>`,
    options: [
      { id: 'a', html: 'شكل الماء في الوعاء' },
      { id: 'b', html: 'نوع الوعاء الذي يُصبّ فيه' },
      { id: 'c', html: 'حجم الماء (الكمية)' },
    ],
    correct: 'c',
    maxAttempts: 2,
    hintPolicy: 'always',
    hint: { body: `<p>تخيّلوا أنكم تنقلون نفس الماء من وعاء عريض إلى وعاء ضيّق.<br>ما الذي يتغير بعد النقل، وما الذي لا يتغير؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>عند نقل السائل من وعاء إلى آخر، يتغيّر شكله - لكن حجمه<br>يبقى ثابتًا.</p><p class="lq-nowrap">لذلك يوجد في الكوب وفي الزجاجة الكمية نفسها من الماء، على الرغم من أنهما يبدوان مختلفين.</p>` },
      wrong:   { title: 'لقد أخطأتَ، هذه المرة لم تنجح الأمور', body: `<p>عند نقل السائل من وعاء إلى آخر، يتغيّر شكله - لكن حجمه<br>يبقى ثابتًا.</p><p class="lq-nowrap">لذلك يوجد في الكوب وفي الزجاجة الكمية نفسها من الماء، على الرغم من أنهما يبدوان مختلفين.</p>` },
    },
  },

  /* ═══ screen 33 · deck slide 39 · בסיסי 3 מתוך 4 ═══════════════════════
     Multi-select picture cards, rendered RIGHT → LEFT מים, דבש, מיץ, שמן
     (RTL: the first option is rightmost). Keys = the two green pills (דבש,
     שמן); agree with "סמנו את שני" and the feedback. */
  {
    screen: 33,
    step: { group: 'c03', index: 3, total: 4 },
    type: 'multi',
    stem: `<p>لديكم أربعة سوائل من المطبخ.</p>
      <p class="lq-gap-top"><strong class="lq-blue">حدّدوا السائلين الأعلى لزوجة</strong><br>(اللذين ينسابان ببطء).</p>`,
    options: [
      { id: 'a', html: `<img class="lq-pic" src="assets/img/kitchen-water.png" alt="كوب ماء." data-no-zoom><span class="lq-pic-label">ماء</span>` },
      { id: 'b', html: `<img class="lq-pic" src="assets/img/kitchen-honey.png" alt="وعاء عسل مع عود عسل." data-no-zoom><span class="lq-pic-label">عسل</span>` },
      { id: 'c', html: `<img class="lq-pic" src="assets/img/kitchen-juice.png" alt="كوب عصير برتقال." data-no-zoom><span class="lq-pic-label">عصير</span>` },
      { id: 'd', html: `<img class="lq-pic" src="assets/img/kitchen-oil.png" alt="زجاجة زجاجية بسدادة فلينية تحتوي على زيت." data-no-zoom><span class="lq-pic-label">زيت</span>` },
    ],
    correctSet: ['b', 'd'],
    maxPicks: 2,   /* QA 04.11.26: "שני הנוזלים" - only two can be ticked */
    maxAttempts: 2,
    hintPolicy: 'always',
    hint: { body: `<p>فكّروا في السوائل التي تعرفونها: إذا سكبنا كلًّا منها على طاولة،<br>فأيّها سيجري نحو الأرض بسرعة أكبر وأيّها ببطء أكبر؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>تصف اللزوجة مدى مقاومة السائل للجريان.<br>ينساب العسل والزيت ببطء أكبر من الماء والعصير،<br>ولذلك فهما أكثر لزوجة.</p>` },
      wrong:   { title: 'لا بأس، فالتعلّم يأتي أيضًا من الأخطاء!', body: `<p>تصف اللزوجة مدى مقاومة السائل للجريان.<br>ينساب العسل والزيت ببطء أكبر من الماء والعصير،<br>ولذلك فهما أكثر لزوجة.</p>` },
    },
  },

  /* ═══ screen 34 · deck slide 40 · בסיסי 4 מתוך 4 ═══════════════════════
     Key = green pill (option 1); agrees with the feedback. Stem keeps the
     deck's "העבודה" (→ העובדה) — flagged. */
  {
    screen: 34,
    step: { group: 'c03', index: 4, total: 4 },
    type: 'single',
    stem: `<p>ملأنا الكمية نفسها من الزيت في زجاجتين مختلفتي الشكل.</p>
      <p class="lq-gap-top"><strong class="lq-blue">أيّ خصائص السائل تفسّر اتّخاذ الزيت<br>شكل كل زجاجة، مع بقاء كميته نفسها؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/oil-bottles.jpg" alt="يصب فتى في المطبخ الزيت في زجاجة زجاجية ذات شكل ملتوٍ، وبجانبه زجاجة دائرية أخرى تحتوي على زيت." data-no-zoom>`,
    options: [
      { id: 'a', html: 'السائل يأخذ شكل الإناء، لكن حجمه يبقى ثابتاً.' },
      { id: 'b', html: 'للسائل لون ثابت، ويبدو متماثلًا في كل وعاء.' },
      { id: 'c', html: 'يبقى السائل عند درجة الحرارة نفسها حتى عند نقله إلى وعاء آخر.' },
      { id: 'd', html: 'للسائل درجة غليان ثابتة، لا تعتمد على شكل الوعاء.' },
    ],
    correct: 'a',
    maxAttempts: 2,
    hintPolicy: 'always',
    hint: { body: `<p>فكّروا في أمرين كلٌّ على حدة:<br>1. ماذا يحدث لشكل الزيت<br>2. ماذا يحدث لكمية الزيت</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح!', body: `<p>يأخذ السائل شكل الوعاء، لكن حجمه يبقى ثابتًا.<br>لذلك يمكن للزيت أن يأخذ شكلًا مختلفًا في كل زجاجة،<br>دون أن تتغيّر كميته.</p>` },
      wrong:   { title: 'أخطأتَ،<br>واصلوا المحاولة، أنتم على الطريق الصحيح.', body: `<p>يأخذ السائل شكل الوعاء، لكن حجمه يبقى ثابتًا.<br>لذلك يمكن للزيت أن يأخذ شكلًا مختلفًا في كل زجاجة،<br>دون أن تتغيّر كميته.</p>` },
    },
  },

  /* ═══ screen 36 · deck slide 42 · סטנדרטי ב 1 מתוך 2 ═══════════════════
     "אין רמז" (the author: intentional). Key = green pill (סוג הגולה); agrees
     with the feedback. The two popups end differently (מסוג הגולה / מהגולה)
     — built as the deck has them. "זמן השקיעה" not replaced (comment says
     תוקן) — flagged. The infographic carries its text at ~10px → zoom. */
  {
    screen: 36,
    step: { group: 'c03b', index: 1, total: 2 },
    type: 'single',
    stem: `<p>خطّط السيد سالم لتجربة لمقارنة لزوجة سائلين.<br>أعدّ مخبارين مدرّجين يحتويان على سائلين مختلفين وكرة زجاجية وكرة معدنية،<br>وخطّط لقياس زمن الغوص في كل سائل.</p>
      <p class="lq-gap-top"><strong class="lq-blue">ما الذي قد يؤثر سلباً في نتائج التجربة؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/experiment-infographic.jpg" alt='رسم معلوماتي من ثلاثة أجزاء. "الأدوات والمواد": مخباران مدرّجان متطابقان، سائل أ وسائل ب، كرة زجاجية وكرة معدنية، ساعة إيقاف. "المتغيرات": المتغير المستقل - نوع السائل؛ المتغير التابع - زمن غوص الكرة في السائل؛ المتغيرات الثابتة - كمية السائل، ارتفاع السقوط، درجة الحرارة. "خطوات التجربة": 1. يُملأ كل مخبار بسائل مختلف. 2. تُسقَط كرة من ارتفاع 20 سم ويُقاس الزمن. 3. يُكرّر الفحص 3 مرات في كل سائل. 4. يُحسب المتوسط وتُجرى المقارنة.'>`,
    options: [
      { id: 'a', html: 'ظل ارتفاع السقوط ثابتًا، مع أنه كان ينبغي أن يتغير.' },
      { id: 'b', html: 'التجربة أُعيدت ثلاث مرات، بدلاً من الاكتفاء بقياس واحد.' },
      { id: 'c', html: 'كان نوع الكرة مختلفًا، مع أنه كان ينبغي أن يبقى ثابتًا.' },
      { id: 'd', html: 'لا يوجد عيب في التصميم.' },
    ],
    correct: 'c',
    maxAttempts: 2,
    hintPolicy: 'none',
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>لمقارنة لزوجة السوائل، يجب تغيير<br>نوع السائل فقط. استخدم السيد سالم أيضًا كرات مختلفة -<br>زجاجية ومعدنية، ولذلك لا يمكن معرفة ما إذا كان الفرق في زمن<br>الغوص ناتجًا عن السائل أم عن نوع الكرة.</p>` },
      wrong:   { title: 'أخطأتَ،<br>محاولتُكم لا تقل أهمية عن الإجابة.', body: `<p>لمقارنة لزوجة السوائل، يجب تغيير<br>نوع السائل فقط. استخدم السيد سالم أيضًا كرات مختلفة -<br>زجاجية ومعدنية، ولذلك لا يمكن معرفة ما إذا كان الفرق في زمن<br>الغوص ناتجًا عن السائل أم عن الكرة.</p>` },
    },
  },

  /* ═══ screen 37 · deck slide 43 · סטנדרטי ב 2 מתוך 2 ═══════════════════
     Key = green pill (נוזל ג' הצמיג ביותר); agrees with the feedback. Table
     rtl=1: נוזל is the RIGHT column; the reviewer's "כותרת" was applied as
     the left header — built as drawn. */
  {
    screen: 37,
    step: { group: 'c03b', index: 2, total: 2 },
    type: 'single',
    stem: `<p>أُجري في مختبر السوائل فحص للزوجة ثلاثة سوائل بطريقة غوص كرة زجاجية.</p>
      <p class="lq-gap-top"><strong class="lq-blue">أيّ عبارة صحيحة بشأن خصائص السوائل الثلاثة وفقًا للبيانات في الجدول؟</strong></p>`,
    content: `<table class="car-table lq-data-table lq-data-table--sink">
      <thead><tr><th>سائل</th><th>زمن غوص كرة زجاجية في سوائل<br>مختلفة (بالثواني)</th></tr></thead>
      <tbody><tr><td>سائل أ</td><td>2</td></tr><tr><td>سائل ب</td><td>5</td></tr><tr><td>سائل ج</td><td>11</td></tr></tbody>
    </table>`,
    options: [
      { id: 'a', html: "تختلف اللزوجة من سائل إلى آخر، والسائل ج هو الأكثر لزوجة." },
      { id: 'b', html: "اللزوجة تختلف من سائل إلى آخر، والسائل أ هو الأكثر لزوجة." },
      { id: 'c', html: 'لجميع السوائل نفس اللزوجة.' },
      { id: 'd', html: 'لا توجد علاقة بين زمن الغوص واللزوجة.' },
    ],
    correct: 'a',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>قارنوا بين أزمنة الغوص.<br>في أي سائل استغرقت الكرة الزجاجية أطول وقت لتغوص؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>أزمنة الغوص مختلفة، ولذلك تختلف لزوجة السوائل<br>أيضًا. كلما غاصت الكرة الزجاجية ببطء أكبر، كان السائل أكثر لزوجة.<br>لذلك فإن السائل ج، الذي كان زمن الغوص فيه الأطول، هو<br>الأكثر لزوجة.</p>` },
      wrong:   { title: 'أخطأتَ،<br>لا بأس، فالتدريب يصنع الفرق.', body: `<p>أزمنة الغوص مختلفة، ولذلك تختلف لزوجة السوائل<br>أيضًا. كلما غاصت الكرة الزجاجية ببطء أكبر، كان السائل أكثر لزوجة.<br>لذلك فإن السائل ج، الذي كان زمن الغوص فيه الأطول، هو<br>الأكثر لزوجة.</p>` },
    },
  },

  /* ═══ component 04 · deck slides 45-57 · תרגול מתקדם (5 q, no pass rule) ══
     Stepper = the 5 questions the intro announces; 4 and 5 are א/ב/ג across
     three screens each (one station, resolved when all three are). Popup line
     breaks are ours. */

  /* ═══ screen 39 · deck slide 46 · שאלה 1 מתוך 5 ════════════════════════
     Two blanks in the explanation; 4 cards (2 distractors). Key = the answered
     state drawn in the blanks; agrees with the feedback. The hint + feedback
     speak of a pipe while the question is tap → glass — built as written,
     flagged. */
  {
    screen: 39,
    step: { group: 'c04', index: 1, total: 5 },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-sentence-dnd',
    stem: `<p>ماذا يحدث للماء عندما ينتقل من الصنبور إلى الكوب؟</p>
      <p class="lq-gap-top"><strong class="lq-blue">اسحبوا العبارات المناسبة وأكملوا الشرح:</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/tap-glass.jpg" alt="يد تمسك كوبًا تحت الصنبور، والماء يجري من الصنبور إلى الكوب." data-no-zoom>`,
    tokens: ['تأخذ شكل الكوب', 'تحافظ على شكل ثابت', 'تجري', 'تغيّر حجمها'],
    layout: `<div class="dnd-sentence lq-dnd-lines">
      <p>عندما تخرج المياه من الصنبور، فإنها {{0}} ،</p>
      <p>وعندما تدخل الكوب فإنها {{1}}.</p>
      <p>على الرغم من تغيّر شكلها، لا تتغيّر كمية المياه.</p>
    </div>`,
    zones: [{ correct: 2 }, { correct: 0 }],
    maxAttempts: 1,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا في ما يحدث للماء عندما ينحني الأنبوب ويغيّر اتجاهه.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'كلّ الاحترام!', body: `<p>يمكن للماء أن يجري ويتخذ شكل الأنبوب الذي<br>يوجد فيه. تتيح له هذه الخصائص المرور عبر أنابيب<br>بأشكال مختلفة والوصول إلى الصنبور.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>يمكن للماء أن يجري ويتخذ شكل الأنبوب الذي<br>يوجد فيه. تتيح له هذه الخصائص المرور عبر أنابيب<br>بأشكال مختلفة والوصول إلى الصنبور.</p>` },
    },
  },

  /* ═══ screen 40 · deck slide 47 · שאלה 2 מתוך 5 ════════════════════════
     Key = green pill (option 2); agrees with the feedback. Table rtl=1: נוזל
     is the narrow RIGHT column. */
  {
    screen: 40,
    step: { group: 'c04', index: 2, total: 5 },
    type: 'single',
    stem: `<p>في مقارنة علمية (في الظروف نفسها)، قيس زمن غوص كرة زجاجية في سوائل مختلفة.</p>
      <p class="lq-gap-top"><strong class="lq-blue">ما الذي يمكن استنتاجه من البيانات في الجدول؟</strong></p>`,
    content: `<table class="car-table lq-data-table lq-data-table--avg">
      <thead><tr><th>سائل</th><th>متوسط زمن غوص<br>الكرة الزجاجية (بالثواني)</th></tr></thead>
      <tbody><tr><td>سائل أ</td><td>2</td></tr><tr><td>سائل ب</td><td>4</td></tr><tr><td>سائل ج</td><td>4</td></tr></tbody>
    </table>`,
    options: [
      { id: 'a', html: "السائل أ يقاوم الجريان أكثر من جميع السوائل الأخرى، لأن زمن الغوص فيه هو الأقصر." },
      { id: 'b', html: "السائلان ب و ج يقاومان التدفق بالدرجة نفسها، وكلاهما أكثر من السائل أ." },
      { id: 'c', html: 'لا يمكن المقارنة بينها، لأنها تتعلق بثلاثة سوائل مختلفة تمامًا.' },
      { id: 'd', html: "السائل ج يقاوم الجريان أقل من السائل ب، على الرغم من تساوي زمن الغوص." },
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>ما الذي يمكن أن يخبرنا به زمن غوص الكرة الزجاجية<br>عن مقاومة السائل للحركة؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح!', body: `<p>كلما طال زمن الغوص، زادت مقاومة السائل<br>للحركة. قيس الزمن نفسه، 4 ثوانٍ، في السائلين ب وج،<br>ولذلك فإن مقاومتهما متساوية وأكبر من مقاومة السائل أ.</p>` },
      wrong:   { title: 'أخطأتَ،<br>لا بأس، فالتدريب يصنع الفرق.', body: `<p>كلما طال زمن الغوص، زادت مقاومة السائل<br>للحركة. قيس الزمن نفسه، 4 ثوانٍ، في السائلين ب وج،<br>ولذلك فإن مقاومتهما متساوية وأكبر من مقاومة السائل أ.</p>` },
    },
  },

  /* ═══ screen 41 · deck slide 48 · שאלה 3 מתוך 5 ════════════════════════
     Ordered drag: 5 numbered slots (right), the bank (left). Key = the
     numbered right column. The deck draws the bank IN key order; the bank is
     shuffled here so the order is not handed to the learner — flagged. Token
     array = bank order; each zone names the stage it takes. */
  {
    screen: 41,
    step: { group: 'c04', index: 3, total: 5 },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-order',
    stem: `<p>أمامكم مراحل تجربة لفحص لزوجة سائلين.</p>
      <p class="lq-gap-top"><strong class="lq-blue">اسحبوها بالترتيب، من المرحلة الأولى إلى الأخيرة.</strong></p>`,
    /* QA 04.11.26 (dslide 41): the stage NAMES leave the cards and label the slots on the right */
    tokens: [
      'نستنتج أيُّ السائلين أكثر لزوجة.',
      'نُسقط الكرة الزجاجية نفسها من الارتفاع نفسه ونقيس<br>زمن الغوص. نكرّر القياس 3 مرات في كل سائل.',
      'يمكن طرح ادعاء وتبريره باستخدام دليل (بيانات).',
      'نحدّد ما نغيّره وما نقيسه وما يبقى ثابتًا.',
      'جمع البيانات وتنظيمها في جدول ومعالجتها: نحسب<br>متوسط زمن الغوص في كل سائل.',
    ],
    layout: `<div class="lq-order-slots">
      <div class="lq-order-row"><span class="lq-order-num">1</span><span class="lq-order-name">تخطيط التجربة</span>{{0}}</div>
      <div class="lq-order-row"><span class="lq-order-num">2</span><span class="lq-order-name">تنفيذ التجربة</span>{{1}}</div>
      <div class="lq-order-row"><span class="lq-order-num">3</span><span class="lq-order-name">النتائج</span>{{2}}</div>
      <div class="lq-order-row"><span class="lq-order-num">4</span><span class="lq-order-name">الاستنتاج</span>{{3}}</div>
      <div class="lq-order-row"><span class="lq-order-num">5</span><span class="lq-order-name">الحجة العلمية</span>{{4}}</div>
    </div>`,
    zones: [{ correct: 3 }, { correct: 1 }, { correct: 4 }, { correct: 0 }, { correct: 2 }],
    maxAttempts: 1,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا فيما يجب أن نفعله قبل أن نبدأ القياس،<br>وفيما يمكن أن نفعله فقط بعد أن نحصل على النتائج.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>نخطّط وننفّذ ونجمع النتائج وننظّمها،<br>نستخلص الاستنتاجات، ويمكننا أن نُقدّم ادعاءً حول هذه الاستنتاجات</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>نخطّط وننفّذ ونجمع النتائج وننظّمها،<br>نستخلص الاستنتاجات، ويمكننا أن نُقدّم ادعاءً حول هذه الاستنتاجات</p>` },
    },
  },

  /* ═══ screen 42 · deck slide 49 · שאלה 4 סעיף א ════════════════════════
     Statement rows, THREE pills each, words per row (engine: `s.pills`).
     Key = the 00FF00 highlight (an authoring marker — not shipped); all four
     agree with the feedback. */
  {
    screen: 42,
    step: { group: 'c04', index: 4, total: 5 },
    type: 'statement',
    listClass: 'lq-stmt3',
    stem: `<p>قارورة الكاتشب أُخرجت من الثلاجة ووُضعت في وعاء ماء ساخن.<br>الكاتشب نفسه تسخّن، لكن القارورة بقيت مغلقة ومحكمة الإغلاق.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">أ. ماذا يحدث لخصائص الكاتشب عندما ترتفع درجة حرارته؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/ketchup-hot-bath.jpg" alt="زجاجة كاتشب حمراء داخل وعاء زجاجي يحتوي على ماء يتصاعد منه البخار." data-no-zoom>`,
    statements: [
      { text: 'حجم الكاتشب', pills: [{ val: 'up', label: 'يزداد' }, { val: 'down', label: 'يقلّ' }, { val: 'same', label: 'لا يتغير' }], correct: 'up' },
      { text: 'كثافة الكاتشب', pills: [{ val: 'up', label: 'تزداد' }, { val: 'down', label: 'تقلّ' }, { val: 'same', label: 'لا يتغير' }], correct: 'down' },
      { text: 'ارتفاع الكاتشب في الزجاجة', pills: [{ val: 'up', label: 'يرتفع' }, { val: 'down', label: 'ينخفض' }, { val: 'same', label: 'يبقى ثابتًا' }], correct: 'up' },
      { text: 'لزوجة الكاتشب', pills: [{ val: 'up', label: 'تزداد' }, { val: 'down', label: 'تقلّ' }, { val: 'same', label: 'لا يتغير' }], correct: 'down' },
    ],
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا في الخصائص التي تتغير عند تسخين السائل،<br>وفي الخصائص التي تبقى ثابتة.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>عندما يسخن الكاتشب، يزداد حجمه، ولذلك تقل كثافته<br>ويرتفع مستواه في الزجاجة.</p><p>كذلك تقلّ لزوجته، ولذلك ينساب بسهولة أكبر.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>عندما يسخن الكاتشب، يزداد حجمه، ولذلك تقل كثافته<br>ويرتفع مستواه في الزجاجة.</p><p>كذلك تقلّ لزوجته، ولذلك ينساب بسهولة أكبر.</p>` },
    },
  },

  /* ═══ screen 43 · deck slide 50 · שאלה 4 סעיף ב ════════════════════════
     Key = green pill (option 2); agrees with the feedback. Option 4 is close
     to the key (reviewer thread) and the picture shows 51's content — flagged.
     "החורג" unified to "החריג" (QA 04.11.26). */
  {
    screen: 43,
    step: { group: 'c04', index: 4, total: 5 },
    type: 'single',
    stem: `<p>قبل بدء تجربة لفحص لزوجة الكاتشب:<br>تُجرى ثلاثة قياسات لزمن جريانه في الظروف نفسها.<br>في أحد القياسات تظهر نتيجة مختلفة جدًا عن النتائج الأخرى.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ب. ما الذي ينبغي فعله؟</strong></p>`,
    /* QA 04.11.26: the producer's ketchup video replaces the picture; plays once on entry, muted (sound is for dslide 0 only) */
    content: `<div class="lq-q-video"><video class="lq-q-photo" id="q43-video" src="assets/video/ketchup-pouring.mp4" poster="assets/img/ketchup-pouring.jpg" muted playsinline preload="auto" role="img" aria-label="يد تميل زجاجة كاتشب مقلوبة، فينساب الكاتشب بتيار كثيف إلى طبق زجاجي صغير ويشكّل فيه بركة متعرّجة." data-no-zoom></video></div>`,
    options: [
      { id: 'a', html: 'تجاهل القيمة الشاذة وعدم تسجيلها في التقرير، وحساب<br>المتوسط من التكرارين المتبقيين.' },
      { id: 'b', html: 'إجراء قياسات إضافية، وإذا تبيّن أن القيمة الشاذة ناتجة عن خطأ،<br>فلا تُدرجها في المتوسط.' },
      { id: 'c', html: 'تسجيل القيمة الشاذة بوصفها النتيجة النهائية للفحص، وتفضيلها<br>على القيمتين الأخريين.' },
      { id: 'd', html: 'تسجيل القيمة الشاذة في التقرير، وإعادة القياس، وفحص<br>سير التجربة.' },
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>هل يكفي قياس واحد مختلف<br>لنحكم بأن التجربة كلها غير صحيحة؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>عندما يظهر قياس شاذ، يُستحسن إجراء قياسات إضافية<br>وفحص النتائج. إذا تبيّن أن القيمة الشاذة ناتجة<br>عن خطأ، فلا تُدرج في حساب المتوسط.</p>` },
      wrong:   { title: 'أخطأتَ،<br>محاولتُكم لا تقل أهمية عن الإجابة.', body: `<p>عندما يظهر قياس شاذ، يُستحسن إجراء قياسات إضافية<br>وفحص النتائج. إذا تبيّن أن القيمة الشاذة ناتجة<br>عن خطأ، فلا تُدرج في حساب المتوسط.</p>` },
    },
  },

  /* ═══ screen 44 · deck slide 51 · שאלה 4 סעיף ג ════════════════════════
     "אין רמז". Key = green pill (option 2); agrees with the feedback. */
  {
    screen: 44,
    step: { group: 'c04', index: 4, total: 5 },
    type: 'single',
    stem: `<p>لفحص كيفية تأثير درجة الحرارة في لزوجة الكاتشب، قيس زمن جريان<br>الكمية نفسها من الكاتشب عند درجتي حرارة مختلفتين، مع إبقاء بقية الظروف متطابقة.<br>ظهرت النتائج الآتية: كاتشب ساخن - 3 ثوانٍ، كاتشب بارد - 8 ثوانٍ</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ج. ما الذي يمكن استنتاجه من النتائج؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/ketchup-cold-warm.jpg" alt="زجاجتا كاتشب مقلوبتان. من الزجاجة اليسرى، الموضوعة في وعاء به ثلج، خرج القليل من الكاتشب إلى الطبق الصغير. أما من الزجاجة اليمنى، الموضوعة في وعاء به ماء، فيتدفق الكاتشب بسهولة ويكوّن بركة كبيرة." data-no-zoom>`,
    options: [
      { id: 'a', html: 'الكاتشب الساخن أكثر لزوجة.' },
      { id: 'b', html: 'الكاتشب البارد أكثر لزوجة.' },
      { id: 'c', html: 'لكلا نوعي الكاتشب اللزوجة نفسها.' },
      { id: 'd', html: 'لا يمكن استنتاج ذلك من النتائج.' },
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'none',
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'ممتاز!', body: `<p>كلما طال زمن التدفق، أبدى السائل مقاومة أكبر<br>للجريان، ولذلك تكون لزوجته أعلى. استغرق الكاتشب البارد 8 ثوانٍ ليتدفق،<br>مقارنةً بـ 3 ثوانٍ في الكاتشب الساخن، ولذلك يكون الكاتشب البارد<br>أكثر لزوجة.</p>` },
      wrong:   { title: 'لا بأس، لقد أخطأت', body: `<p>كلما طال زمن التدفق، أبدى السائل مقاومة أكبر<br>للجريان، ولذلك تكون لزوجته أعلى. استغرق الكاتشب البارد 8 ثوانٍ ليتدفق،<br>مقارنةً بـ 3 ثوانٍ في الكاتشب الساخن، ولذلك يكون الكاتشب البارد<br>أكثر لزوجة.</p>` },
    },
  },

  /* ═══ screen 45 · deck slide 52 · שאלה 5 סעיף א ════════════════════════
     Two cells, four cards (2 distractors). Key = the answered state; agrees
     with the feedback. Notes number this "שאלה 6 מתוך 6" — the on-slide
     letters make it question 5 of the 5 announced. */
  {
    screen: 45,
    step: { group: 'c04', index: 5, total: 5 },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-match lq-match2',
    stem: `<p>في مختبر السوائل، قُطّر الماء والصابون السائل وفُحص قطر البقعة الناتجة.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">أ. اسحبوا كل بطاقة إلى المكان المناسب:</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/pipette-drops.jpg" alt='الفتاة تقطّر سائلًا بقطّارة في طبق صغير، والفتى يراقب. على الطاولة كؤوس عليها بطاقات مكتوب عليها "صابون سائل" و"ماء".'>`,
    tokens: ['حجم القطرة', 'درجة الحرارة', 'قطر البقعة', 'نوع السائل (ماء وصابون سائل)'],
    layout: `<table class="car-table lq-match-table lq-match-table--2">
      <thead><tr><th>العامل المؤثِّر</th><th>العامل المتأثِّر</th></tr></thead>
      <tbody><tr><td>{{0}}</td><td>{{1}}</td></tr></tbody>
    </table>`,
    zones: [{ correct: 3 }, { correct: 2 }],
    maxAttempts: 1,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>اطرحوا سؤالين:<br>1. ما الذي غُيّر في التجربة؟<br>2. ما الذي قيس نتيجةً للتغيير؟</p>` },   /* deck numbers these (buAutoNum) */
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>نوع السائل هو المتغير المستقل - وهو ما نغيّره في التجربة.<br>قطر البقعة هو المتغير التابع - النتيجة التي نقيسها.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>نوع السائل هو المتغير المستقل - وهو ما نغيّره في التجربة.<br>قطر البقعة هو المتغير التابع - النتيجة التي نقيسها.</p>` },
    },
  },

  /* ═══ screen 46 · deck slide 53 · שאלה 5 סעיף ב ════════════════════════
     Key = green pill (option 1); agrees with the feedback. The deck's red
     marker run (a space) is not shipped. */
  {
    screen: 46,
    step: { group: 'c04', index: 5, total: 5 },
    type: 'single',
    stem: `<p>هناك عوامل يجب أن تبقى متطابقة في الفحصين،<br>حتى تكون المقارنة بين الماء والصابون السائل صالحة.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ب. أيّ زوج من المتغيرات يجب أن يبقى ثابتًا؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/pair-two-glasses.jpg" alt="يقف فتى وفتاة بجانب طاولة عليها كأسان بهما سائل شفاف، وطبق صغير وقارورة زرقاء." data-no-zoom>`,
    options: [
      { id: 'a', html: 'حجم القطرة وارتفاع التقطير.' },
      { id: 'b', html: 'نوع السائل وقطر البقعة.' },
      { id: 'c', html: 'اللون الذي يحمله السائل واسم السائل.' },
      { id: 'd', html: 'عدد الباحثين ومدة النشاط.' },
    ],
    correct: 'a',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا في العوامل التي قد تؤثر، إذا تغيّرت بين المحاولات،<br>في حجم البقعة نفسها، وبذلك تُربك نتائج التجربة.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>لكي تكون المقارنة صالحة، <strong>نغيّر نوع<br>السائل فقط ونحافظ على بقية الظروف ثابتة،</strong> مثل حجم<br>القطرة وارتفاع التقطير. بذلك يمكن إرجاع الفرق<br>في النتيجة إلى نوع السائل.</p>` },
      wrong:   { title: 'لا بأس، الإجابة غير صحيحة!', body: `<p>لكي تكون المقارنة صالحة، <strong>نغيّر نوع<br>السائل فقط ونحافظ على بقية الظروف ثابتة،</strong> مثل حجم<br>القطرة وارتفاع التقطير. بذلك يمكن إرجاع الفرق<br>في النتيجة إلى نوع السائل.</p>` },
    },
  },

  /* ═══ screen 47 · deck slide 54 · שאלה 5 סעיף ג ════════════════════════
     Three dropdowns in a scientific argument (the template + the drawing;
     the notes' "מחסן קטן משלה" describes card banks — flagged). Keys = the
     values drawn; agree with the feedback. "גבוה יותר" kept as drawn —
     flagged (צמיגותו → גבוהה). Each pool is a pair, but a hint is promised
     "after the first attempt", so 2 attempts. The two spots are the deck's
     crops, cut tighter: the source image bakes the soap/water labels in
     REVERSED, so the slide's own labels are live text. */
  {
    screen: 47,
    step: { group: 'c04', index: 5, total: 5 },
    type: 'dropdown',
    stem: `<p>بعد إجراء تجربة ومشاهدة النتائج واستخلاص الاستنتاجات، يمكن بناء حجة علمية.<br><strong>تأمّلوا نتائج التجربة المعروضة في الصورة.</strong></p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ج. أكملوا الحجة العلمية بالكلمات المناسبة:</strong></p>`,
    content: `<div class="lq-spots" data-no-zoom>
      <figure class="lq-spot lq-spot--large"><figcaption>ماء<br>القطر 4 سم</figcaption><img src="assets/img/spot-large.png" alt="بقعة سائلة دائرية كبيرة، مع سهم متقطع على طول القطر." data-no-zoom></figure>
      <figure class="lq-spot lq-spot--small"><figcaption>صابون سائل<br>القطر 2 سم</figcaption><img src="assets/img/spot-small.png" alt="بقعة سائلة دائرية صغيرة، مع سهم متقطع يمتد على طول القطر." data-no-zoom></figure>
    </div>`,
    sentence: [
      '<strong>الادعاء: </strong>السائل الصابوني ينتشر ',
      ' من الماء.<br><strong>الدليل: </strong>كان قطر بقعة الصابون ',
      ' من قطر بقعة الماء.<br><strong>التعليل: </strong>في الظروف نفسها، كلما انتشر السائل أكثر على السطح، كانت لزوجته ',
      '.',
    ],
    blanks: [
      { pool: ['أكثر', 'أقل'], correct: 'أقل' },
      { pool: ['أكبر', 'أصغر'], correct: 'أصغر' },
      { pool: ['أقلّ', 'أعلى'], correct: 'أقلّ' },
    ],
    /* QA 04.11.26 (dslide 47): ONE attempt (so no hint), the feedback keeps only its first sentence */
    maxAttempts: 1,
    hintPolicy: 'none',
    fb: {
      correct: { title: 'صحيح جدًا‎!', body: `<p>كلما كان السائل أكثر لزوجة، انتشر أقل على السطح، وأصبح قطر بقعته<br>أصغر.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>كلما كان السائل أكثر لزوجة، انتشر أقل على السطح، وأصبح قطر بقعته<br>أصغر.</p>` },
    },
  },

  /* ═══ component 05 · deck slides 59-65 · שאלת שיא מועד א ═══════════════
     4 lettered sections, pass 3 (copy only — no fail route is stated). The
     stepper labels the stations by section letter. The deck's red marker run
     (63) is not shipped; popup line breaks are ours. */

  /* ═══ screen 53 · deck slide 61 · סעיף א ════════════════════════════════
     "אין רמז". Key = green pill (דשן ב'); agrees with the table (25 < 40 s)
     and the feedback. Geresh kept as each element has it (' vs ׳) — flagged. */
  {
    screen: 53,
    step: { group: 'c05', index: 1, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'single',
    stem: `<p>انظروا إلى نتائج التجربة.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">أ. أيّ سماد أقلّ لزوجة ويمكنه مساعدة مزارعنا؟</strong></p>`,
    content: `<div class="lq-table-block"><p class="lq-table-cap"><strong>مقارنة بين الأسمدة</strong></p>
      <table class="car-table lq-data-table lq-data-table--fert">
        <thead><tr><th>سماد</th><th>متوسط زمن الامتصاص<br>في التربة بمنطقة الجذور</th></tr></thead>
        <tbody><tr><td>أ</td><td>40 ثانية</td></tr><tr><td>ب</td><td>25 ثانية</td></tr></tbody>
      </table></div>`,
    options: [
      { id: 'a', html: "السماد أ" },
      { id: 'b', html: "السماد ب" },
      { id: 'c', html: 'يستغرق امتصاص كليهما المدة نفسها' },
      { id: 'd', html: 'لا يمكن المعرفة' },
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'none',
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      /* QA 04.11.26 (dslide 53, Maya): corrected feedback */
      correct: { title: 'صحيح جدًا‎!', body: `<p>السماد ب يُمتص أسرع في التربة،<br>ولذلك تكون لزوجته أقل.</p>` },
      wrong:   { title: 'للأسف، ليس هذه المرة!', body: `<p>السماد ب يُمتص أسرع في التربة،<br>ولذلك تكون لزوجته أقل.</p>` },
    },
  },

  /* ═══ screen 55 · deck slide 63 · סעיף ב ════════════════════════════════
     Key = green pill (option 4); agrees with the feedback. "רמז אחרי ניסיון
     ראשון" (the deck draws no pill; the policy wins). Same soil / same amount
     are first mentioned in this question — flagged. */
  {
    screen: 55,
    step: { group: 'c05', index: 2, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'single',
    stem: `<p class="q-part"><strong class="lq-blue">ب. لماذا من المهم معرفة أن السمادين فُحصا في نوع التربة نفسه وبكمية السائل نفسها؟</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/farmer-pouring-labelled.jpg" alt='الفلاح في حقل البطاطس يسكب سائلاً بنياً وسائلاً شفافاً على التربة، بين وعاءين عليهما الملصقان "السماد أ" و"السماد ب". في الخلفية جرار زراعي.' data-no-zoom>`,
    options: [
      { id: 'a', html: 'لكي ينتهي الاختبار بسرعة أكبر ويوفر الوقت.' },
      { id: 'b', html: 'لكي نضمن أن تكون النتائج متطابقة ومتسقة في كل تكرار للتجربة.' },
      { id: 'c', html: 'لكي يُختبر كل سماد على نوع التربة المناسب له.' },
      { id: 'd', html: 'لكي نعرف أن الفرق في زمن الامتصاص ناتج عن السماد وليس عن نوع التربة.' },
    ],
    correct: 'd',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>إذا غيّرنا أيضًا نوع السماد ونوع التربة،<br>فهل سنعرف ما الذي تسبب في الفرق في زمن الامتصاص؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>عند فحص تأثير نوع السماد، من المهم إبقاء بقية<br>الظروف متطابقة. بذلك يمكن معرفة أن الفرق في زمن الامتصاص<br>ناتج عن نوع السماد، وليس عن نوع التربة أو كمية السائل.</p>` },
      wrong:   { title: 'أخطأتَ،<br>تدريب إضافي سيساعد على ربط الأجزاء ببعضها.', body: `<p>عند فحص تأثير نوع السماد، من المهم إبقاء بقية<br>الظروف متطابقة. بذلك يمكن معرفة أن الفرق في زمن الامتصاص<br>ناتج عن نوع السماد، وليس عن نوع التربة أو كمية السائل.</p>` },
    },
  },

  /* ═══ screen 56 · deck slide 64 · סעיף ג ════════════════════════════════
     Two blanks in the research question, 4 tiles (2 distractors). Key = the
     answered state; agrees with the feedback. "אין רמז" (the deck draws a
     pill — the notes win). Both blanks one size: the deck's differently sized
     blanks would hand over which tile goes where. */
  {
    screen: 56,
    step: { group: 'c05', index: 3, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-rq-dnd',
    stem: `<p>الآن، بعدما اتّضح لنا كيف أُجريت المقارنة، يمكن صياغة سؤال البحث الذي تستند إليه.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ج. أكملوا سؤال البحث:</strong></p>`,
    content: `<img class="lq-q-photo" src="assets/img/soil-test-table.jpg" alt="على الطاولة: شتلة في أصيص، كوب ماء، صحن صغير وملعقة بها تراب، صندوق بطاطس، دفتر وقلم." data-no-zoom>`,
    tokens: ['كمية السائل', 'نوع التربة', 'نوع السماد', 'زمن الامتصاص في منطقة الجذور بالثواني'],
    layout: `<div class="dnd-sentence lq-dnd-lines lq-rq-line"><p>كيف يؤثر {{0}} على {{1}} ؟</p></div>`,
    zones: [{ correct: 2 }, { correct: 3 }],
    maxAttempts: 2,   /* QA 04.11.26 (dslide 56): two attempts (was one) */
    hintPolicy: 'none',
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>نوع السماد هو المتغير المستقل - وهو العامل الذي يتم تغييره<br>في التجربة. زمن الامتصاص هو المتغير التابع - وهو<br>العامل الذي يُقاس لمعرفة كيف تأثّر.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>نوع السماد هو المتغير المستقل - وهو العامل الذي يتم تغييره<br>في التجربة. زمن الامتصاص هو المتغير التابع - وهو<br>العامل الذي يُقاس لمعرفة كيف تأثّر.</p>` },
    },
  },

  /* ═══ screen 57 · deck slide 65 · סעיף ד ════════════════════════════════
     Key = green pill (option 1); agrees with the feedback. No picture on the
     slide (§1c). Option 2's "שלוש חזרות" is never given in this component —
     flagged. Option breaks as the deck renders them. */
  {
    screen: 57,
    step: { group: 'c05', index: 4, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'single',
    stem: `<p>بناءً على نتائج الفحص، يريد المزارع أن يوصي باستخدام السماد ب لجميع حقول البطاطس في المنطقة.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">د. ما المشكلة الرئيسية في هذه التوصية؟</strong></p>`,
    options: [
      { id: 'a', html: 'فُحص نوع واحد فقط من التربة، ولذلك لا يُعرف إن كانت النتيجة ستكون مشابهة<br>في أنواع تربة أخرى.' },
      { id: 'b', html: 'أُجريت ثلاثة تكرارات فقط، ولذلك لا يُعرف إن كان يمكن الاعتماد على<br>متوسط القياسات.' },
      { id: 'c', html: 'قيس زمن الامتصاص فقط، ولذلك لا يُعرف إن كان يمكن بهذه الطريقة المقارنة بين<br>السمادين.' },
      { id: 'd', html: 'تم اختبار كمية واحدة فقط من كل سماد، ولذلك لا يمكن المقارنة بين الأسمدة.' },
    ],
    correct: 'a',
    nextLabel: 'انتهيت',   /* QA 28.10: the last question of מועד א */
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكروا في الانتقال من تجربة واحدة إلى توصية تشمل المنطقة بأكملها:<br>هل التربة في جميع الحقول متطابقة بالضرورة؟</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>يُمتص السماد ب أسرع، وبفضل الظروف المتطابقة يمكن أن نعزو الفرق إلى نوع السماد.<br>لكن بما أنه تم اختبار نوع تربة واحد فقط، ما زال من غير الممكن الاستنتاج أن الأمر سيكون كذلك في جميع الحقول.</p>` },
      wrong:   { title: 'أخطأتَ،<br>تدريب إضافي سيساعد على ربط الأجزاء ببعضها.', body: `<p>يُمتص السماد ب أسرع، وبفضل الظروف المتطابقة يمكن أن نعزو الفرق إلى نوع السماد.<br>لكن بما أنه تم اختبار نوع تربة واحد فقط، ما زال من غير الممكن الاستنتاج أن الأمر سيكون كذلك في جميع الحقول.</p>` },
    },
  },

  /* ═══ component 06 · deck slides 67-72 · שאלת שיא מועד ב ═══════════════
     Mirrors 05 (no transition screen). 4 sections, pass 3 (copy only).
     Temperatures are LTR isolates so "25°C" never scrambles. */

  /* ═══ screen 60 · deck slide 69 · סעיף א ════════════════════════════════
     "אין רמז". Key = green pill (option 3); agrees with the table (9 > 4 s)
     and the feedback. */
  {
    screen: 60,
    step: { group: 'c06', index: 1, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'single',
    stem: `<p>فُحص زيتان في ورشة الصيانة بطريقة غوص كرة زجاجية:<br>تُسقَط الكرة الزجاجية نفسها من الارتفاع نفسه في مخابر مدرّجة متطابقة تحتوي على زيوت مختلفة، ويُقاس<br>زمن غوص الكرة الزجاجية. كُرّر كل فحص ثلاث مرات، ويظهر في الجدول متوسط زمن الغوص.</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">أ. استنادًا إلى نتائج التجربة، أيّ الزيتين أكثر لزوجة؟</strong></p>`,
    content: `<div class="lq-table-block"><p class="lq-table-cap"><strong>مقارنة بين الزيوت عند درجات حرارة متطابقة</strong></p>
      <table class="car-table lq-data-table lq-oil-table">
        <thead><tr><th>اختبار</th><th>درجة حرارة الزيت<br>(بالدرجات المئوية)</th><th>متوسط زمن الغوص<br>(بالثواني)</th></tr></thead>
        <tbody><tr><td><strong>زيت أ</strong></td><td><span dir="ltr">25°C</span></td><td>4</td></tr><tr><td><strong>زيت ب</strong></td><td><span dir="ltr">25°C</span></td><td>9</td></tr></tbody>
      </table></div>`,
    options: [
      { id: 'a', html: 'لا يمكن استنتاج أي الزيوت أكثر لزوجة من البيانات.' },
      { id: 'b', html: 'لِلزيتين نفس اللزوجة.' },
      { id: 'c', html: 'زيت ب أكثر لزوجة من زيت أ.' },
      { id: 'd', html: 'الزيت أ أكثر لزوجة من الزيت ب.' },
    ],
    correct: 'c',
    maxAttempts: 2,
    hintPolicy: 'none',
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>كان زمن الغوص في الزيت أ 4 ثوانٍ، مقابل 9 ثوانٍ<br>في الزيت ب. كلما كان الزيت أكثر لزوجة، غاصت فيه الكرة الزجاجية ببطء<br>أكبر. غاصت الكرة الزجاجية ببطء أكبر في الزيت ب، ولذلك فإن الزيت ب<br>أكثر لزوجة.</p>` },
      wrong:   { title: 'ليس تمامًا،', body: `<p>كان زمن الغوص في الزيت أ 4 ثوانٍ، مقابل 9 ثوانٍ<br>في الزيت ب. كلما كان الزيت أكثر لزوجة، غاصت فيه الكرة الزجاجية ببطء<br>أكبر. غاصت الكرة الزجاجية ببطء أكبر في الزيت ب، ولذلك فإن الزيت ب<br>أكثر لزوجة.</p>` },
    },
  },

  /* ═══ screen 61 · deck slide 70 · סעיף ב ════════════════════════════════
     Key = green pill (option 1); agrees with the feedback. The deck's blue
     frame on the new row (מלבן 36) is built as a row highlight. Caption kept
     as written ("בין שמנים", the reviewer asked "בין שמן ב'…") — flagged. */
  {
    screen: 61,
    step: { group: 'c06', index: 2, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'single',
    stem: `<p>زيت ب تم فحصه مرة أخرى، هذه المرة في صباح أبرد.<br>انظروا إلى البيانات في الجدول وأجيبوا:</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ب. ما الذي يمكن أن يفسّر الفرق في زمن الغوص؟</strong></p>`,
    content: `<div class="lq-table-block" data-persist><p class="lq-table-cap"><strong>مقارنة بين الزيوت عند درجات حرارة مختلفة</strong></p>
      <table class="car-table lq-data-table lq-oil-table">
        <thead><tr><th>اختبار</th><th>درجة حرارة الزيت<br>(بالدرجات المئوية)</th><th>متوسط زمن الغوص<br>(بالثواني)</th></tr></thead>
        <tbody><tr><td><strong>زيت ب</strong></td><td><span dir="ltr">25°C</span></td><td>9</td></tr><tr class="lq-row-hi"><td><strong>زيت ب -</strong><br>فحص إضافي</td><td><span dir="ltr">5°C</span></td><td>16</td></tr></tbody>
      </table></div>`,
    options: [
      { id: 'a', html: 'عند درجة حرارة منخفضة يكون الزيت أكثر لزوجة، ولذلك تغوص الكرة الزجاجية ببطء<br>أكبر.' },
      { id: 'b', html: 'عند درجة حرارة منخفضة يكون الزيت أقلّ لزوجة، ولذلك تغوص الكرة الزجاجية ببطء<br>أكبر.' },
      { id: 'c', html: 'عند درجة حرارة منخفضة يزداد حجم الزيت، ولذلك تقطع الكرة الزجاجية مسافة<br>أطول.' },
      { id: 'd', html: 'عند درجة حرارة منخفضة تزداد كتلة الكرة الزجاجية، ولذلك تغوص ببطء أكبر.' },
    ],
    correct: 'a',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>فكّروا فيما يحدث للزوجة الزيت عندما تنخفض درجة الحرارة،<br>وكيف سيؤثّر ذلك في حركة الكرة الزجاجية.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'صحيح جدًا‎!', body: `<p>عندما انخفضت درجة الحرارة، <strong>ازداد زمن الغوص</strong>. أي إنّ<br>الزيت أصبح <strong>أكثر لزوجة</strong> عند درجة حرارة منخفضة،<br>ولذلك غاصت فيه الكرة الزجاجية ببطء أكبر.</p>` },
      wrong:   { title: 'أخطأتَ،<br>هذه هي الطريقة الصحيحة، لكنك تحتاج إلى مزيد من الدقة.', body: `<p>عندما انخفضت درجة الحرارة، <strong>ازداد زمن الغوص</strong>. أي إنّ<br>الزيت أصبح <strong>أكثر لزوجة</strong> عند درجة حرارة منخفضة،<br>ولذلك غاصت فيه الكرة الزجاجية ببطء أكبر.</p>` },
    },
  },

  /* ═══ screen 62 · deck slide 71 · סעיף ג ════════════════════════════════
     Two blanks in the explanation, 4 tiles. Key = the answered state; agrees
     with the feedback. Hint after the first try (here the deck agrees). The
     notes name "תמונה59" but the slide has the table, no picture (§1c). */
  {
    screen: 62,
    step: { group: 'c06', index: 3, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'dnd',
    reusable: false,
    bankFirst: false,
    wrapClass: 'lq-sentence-dnd lq-oil-dnd',
    stem: `<p>رأينا أن درجة الحرارة أثّرت في زمن الغوص في الزيت ب.<br>الآن نريد مقارنته بالزيت أ - لكن هل المقارنة صالحة؟</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue">ج. أكملوا الشرح:</strong></p>`,
    content: `<div class="lq-table-block" data-persist><p class="lq-table-cap"><strong>مقارنة بين الزيوت</strong></p>
      <table class="car-table lq-data-table lq-oil-table">
        <thead><tr><th>اختبار</th><th>درجة حرارة الزيت<br>(بالدرجات المئوية)</th><th>متوسط زمن الغوص<br>(بالثواني)</th></tr></thead>
        <tbody><tr><td><strong>زيت أ</strong></td><td><span dir="ltr">25°C</span></td><td>4</td></tr><tr><td><strong>زيت ب -</strong><br>فحص إضافي</td><td><span dir="ltr">5°C</span></td><td>16</td></tr></tbody>
      </table></div>`,
    /* QA 04.11.26 (dslide 62): corrected sentence - the two blanks = הטמפרטורה, זמן השקיעה;
       שונה / קבועה stay in the bank as distractors */
    tokens: ['درجة الحرارة', 'زمن الغوص', 'مختلفة', 'ثابتة'],
    layout: `<div class="dnd-sentence lq-dnd-lines">
      <p>المقارنة غير مناسبة لأن {{0}} تغيّرت بين الفحوصات،</p>
      <p>لذلك لا يمكن مقارنة {{1}} للزيتين.</p>
    </div>`,
    zones: [{ correct: 0 }, { correct: 1 }],
    maxAttempts: 2,   /* QA 26.10: the deck gives a hint after the first try */
    hintPolicy: 'after-wrong',
    hint: { body: `<p class="lq-nowrap">قارنوا بين شروط الاختبار، لا بين النتائج التي تم الحصول عليها.</p>` },
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>لكي تكون المقارنة بين الزيوت صحيحة،<br>يجب أن تكون درجة الحرارة في الاختبار متساوية في الزيتين.</p>` },
      wrong:   { title: 'الإجابة غير صحيحة. الإجابة الصحيحة معروضة.', body: `<p>لكي تكون المقارنة بين الزيوت صحيحة،<br>يجب أن تكون درجة الحرارة في الاختبار متساوية في الزيتين.</p>` },
    },
  },

  /* ═══ screen 63 · deck slide 72 · סעיף ד ════════════════════════════════
     Key = green pill (option 2); agrees with the hint + feedback. The deck's
     options render the temperature scrambled ("ב- ,°C 25"); built as the
     intended "ב-25°C," (an LTR isolate) — flagged. */
  {
    screen: 63,
    step: { group: 'c06', index: 4, total: 4, labels: ['البند أ', 'البند ب', 'البند ج', 'البند د'] },
    type: 'single',
    stem: `<p>الآن أصبح واضحاً لنا أنه لكي نقارن بين الزيوت، يجب فحصها في الظروف نفسها.<br>لكن هل البيانات التي جمعناها بالفعل كافية لاختيار زيت للشتاء؟</p>
      <p class="lq-gap-top q-part"><strong class="lq-blue lq-nowrap">د. ماذا يمكن استنتاجه من الفحوصات، وما الذي سنفحصه أيضًا قبل اختيار زيت للشتاء؟</strong></p>`,
    content: `<div class="lq-table-block" data-persist><p class="lq-table-cap"><strong>مقارنة بين الزيوت</strong></p>
      <table class="car-table lq-data-table lq-oil-table">
        <thead><tr><th>اختبار</th><th>درجة حرارة الزيت<br>(بالدرجات المئوية)</th><th>متوسط زمن الغوص<br>(بالثواني)</th></tr></thead>
        <tbody><tr><td><strong>زيت أ</strong></td><td><span dir="ltr">25°C</span></td><td>4</td></tr><tr><td><strong>زيت ب</strong></td><td><span dir="ltr">25°C</span></td><td>9</td></tr><tr><td><strong>زيت ب -</strong><br>فحص إضافي</td><td><span dir="ltr">5°C</span></td><td>16</td></tr></tbody>
      </table></div>`,
    options: [
      { id: 'a', html: `الزيت أ أقلّ لزوجة عند <span dir="ltr">25°C</span>،<br>ولذلك يمكن افتراض أنه سيكون أقلّ لزوجة أيضًا عند درجة حرارة منخفضة.` },
      { id: 'b', html: `الزيت أ أقلّ لزوجة عند <span dir="ltr">25°C</span>،<br>لكن يجب مقارنة الزيتين أيضًا عند درجة حرارة منخفضة.` },
      { id: 'c', html: `الزيت ب أقلّ لزوجة عند <span dir="ltr">5°C</span>،<br>ولذلك يمكن الجزم بأنه أنسب للصباحات الباردة.` },
      { id: 'd', html: `الزيت ب أكثر لزوجة عند <span dir="ltr">25°C</span>،<br>ولذلك يجب إعادة فحصه وحده عند درجة حرارة منخفضة.` },
    ],
    correct: 'b',
    maxAttempts: 2,
    hintPolicy: 'after-wrong',
    hint: { body: `<p>هل تمت مقارنة الزيتين ببعضهما في ظروف الصباح البارد؟</p>` },
    nextLabel: 'انتهيت',   /* QA 25.10: the unit's last question */
    fb: {
      retry: 'هذا خطأ. حاولوا مرة أخرى!',
      correct: { title: 'رائع!', body: `<p>لاحظنا أن درجة الحرارة تؤثر في لزوجة الزيت، وأنه لكي نقارن بين الزيوت من المهم فحصها في الظروف نفسها.<br>وبذلك يمكن استخلاص استنتاجات صحيحة من النتائج.</p>` },
      wrong:   { title: 'أخطأت،<br>محاولتكم مهمة لا تقلّ أهمية عن الإجابة.', body: `<p>لاحظنا أن درجة الحرارة تؤثر في لزوجة الزيت، وأنه لكي نقارن بين الزيوت من المهم فحصها في الظروف نفسها.<br>وبذلك يمكن استخلاص استنتاجات صحيحة من النتائج.</p>` },
    },
  },
];
