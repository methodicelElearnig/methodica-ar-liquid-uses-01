/* =====================================================================
   720-core — report flag + modal (shared; vendored per unit).
   The APPROVED block from the delivered units — copy the matching markup
   from shared/720-core/chrome/chrome-snippets.html into index.html and the
   flag pngs land in assets/img via sync-core.sh. Unit id derives from the
   unit folder name; override REPORT_UNIT_ID only for split part builds.
   ===================================================================== */

'use strict';

function openReportModal() {
  document.getElementById('report-modal').removeAttribute('hidden');
  setTimeout(function () { var el = document.getElementById('report-type'); if (el) el.focus(); }, 40);
}
function tryCloseReportModal() {
  var typeVal = document.getElementById('report-type').value;
  var textVal = document.getElementById('report-text').value.trim();
  if (typeVal || textVal) {
    document.getElementById('report-modal').setAttribute('hidden', '');
    document.getElementById('report-confirm-modal').removeAttribute('hidden');
  } else { forceCloseReportModal(); }
}
function forceCloseReportModal() {
  document.getElementById('report-modal').setAttribute('hidden', '');
  document.getElementById('report-confirm-modal').setAttribute('hidden', '');
  resetReportForm();
}
function backToReportForm() {
  document.getElementById('report-confirm-modal').setAttribute('hidden', '');
  document.getElementById('report-modal').removeAttribute('hidden');
  setTimeout(function () { var el = document.getElementById('report-type'); if (el) el.focus(); }, 40);
}

var REPORT_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSfFq5XFtH1pPpLgV5RWT4m3NanYPW5GKremqTvkp6zKjEGqcw/formResponse';
var REPORT_UNIT_ID = (location.pathname.match(/(methodica-[a-z0-9-]+?)(?:-0\d)?\//) || [,'unknown-unit'])[1];
function reportComponentId() {
  if (!window.PART_CONFIG) return REPORT_UNIT_ID + '-master';
  var m = location.pathname.match(new RegExp(REPORT_UNIT_ID + '-(0\\d)/'));
  return REPORT_UNIT_ID + '-' + (m ? m[1] : 'xx');
}

function submitReport() {
  var typeSel = document.getElementById('report-type');
  var textVal = document.getElementById('report-text').value.trim();
  var errEl = document.getElementById('report-error');
  if (!typeSel.value || !textVal) {
    if (errEl) errEl.removeAttribute('hidden');
    (typeSel.value ? document.getElementById('report-text') : typeSel).focus();
    return;
  }
  if (errEl) errEl.setAttribute('hidden', '');
  var now = new Date();
  var body = new URLSearchParams();
  body.append('entry.301404029_year', now.getFullYear());
  body.append('entry.301404029_month', now.getMonth() + 1);
  body.append('entry.2066097581_hour', now.getHours());
  body.append('entry.301404029_day', now.getDate());
  body.append('entry.2066097581_minute', now.getMinutes());
  body.append('entry.1933069481', REPORT_UNIT_ID);
  body.append('entry.2070680092', reportComponentId());
  body.append('entry.1555704258', '');
  body.append('entry.1671046914', String(currentScreen));
  body.append('entry.1179822443', typeSel.options[typeSel.selectedIndex].text);
  body.append('entry.806447525', textVal);
  fetch(REPORT_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: body })
    .catch(function (e) { console.error('[Report] send failed', e); });
  showReportThanks();
}
function showReportThanks() {
  document.querySelectorAll('#report-modal .report-field, #report-modal .report-actions, #report-modal .report-modal-body')
    .forEach(function (el) { el.setAttribute('hidden', ''); });
  var t = document.getElementById('report-thanks');
  if (t) t.removeAttribute('hidden');
}
function resetReportForm() {
  document.getElementById('report-type').value = '';
  document.getElementById('report-text').value = '';
  document.getElementById('report-char-count').textContent = '0 / 250';
  var errEl = document.getElementById('report-error');
  if (errEl) errEl.setAttribute('hidden', '');
  var t = document.getElementById('report-thanks');
  if (t) t.setAttribute('hidden', '');
  document.querySelectorAll('#report-modal .report-field, #report-modal .report-actions, #report-modal .report-modal-body')
    .forEach(function (el) { el.removeAttribute('hidden'); });
}
(function wireReport() {
  // by CLASS, not id — some units clone the flag into every screen
  document.querySelectorAll('.flag-btn').forEach(function (b) { b.addEventListener('click', openReportModal); });
  var ta = document.getElementById('report-text');
  var counter = document.getElementById('report-char-count');
  if (ta && counter) ta.addEventListener('input', function () { counter.textContent = ta.value.length + ' / 250'; });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var confirmModal = document.getElementById('report-confirm-modal');
    var reportModal = document.getElementById('report-modal');
    if (confirmModal && !confirmModal.hasAttribute('hidden')) { forceCloseReportModal(); return; }
    if (reportModal && !reportModal.hasAttribute('hidden')) { tryCloseReportModal(); return; }
  });
})();
