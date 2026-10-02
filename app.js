'use strict';
const weddingDate = new Date('2026-10-25T14:00:00+04:00');
const envelope = document.getElementById('envelope');
const invitation = document.getElementById('invitation');
const openButton = document.getElementById('open-invitation');
const reopenButton = document.getElementById('reopen');
let opening = false;
let openingTimeout;
function showEnvelope(focusSeal = false) {
  clearTimeout(openingTimeout);
  opening = false;
  envelope.classList.remove('opening');
  envelope.hidden = false;
  invitation.inert = true;
  document.body.classList.add('sealed');
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (focusSeal) openButton.focus({ preventScroll: true });
}
function openEnvelope() {
  if (opening || envelope.hidden) return;
  opening = true;
  envelope.classList.add('opening');
  invitation.inert = false;
  document.body.classList.remove('sealed');
  const finish = () => {
    envelope.hidden = true;
    const heading = document.getElementById('couple-title');
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
    opening = false;
  };
  openingTimeout = window.setTimeout(finish, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400);
}
openButton.addEventListener('click', openEnvelope);
document.getElementById('open-text').addEventListener('click', openEnvelope);
reopenButton.addEventListener('click', () => showEnvelope(true));
document.querySelector('.skip-link').addEventListener('click', () => {
  if (!envelope.hidden) {
    clearTimeout(openingTimeout);
    envelope.hidden = true;
    invitation.inert = false;
    document.body.classList.remove('sealed');
    opening = false;
  }
});
function updateCountdown(now = Date.now()) {
  const remaining = Math.max(0, Math.floor((weddingDate.getTime() - now) / 1000));
  const values = { days: Math.floor(remaining / 86400), hours: Math.floor(remaining % 86400 / 3600), minutes: Math.floor(remaining % 3600 / 60), seconds: remaining % 60 };
  for (const [id, value] of Object.entries(values)) document.getElementById(id).textContent = String(value).padStart(2, '0');
  if (!remaining) {
    document.getElementById('countdown-title').textContent = now < weddingDate.getTime() + 10 * 3600000 ? 'ჩვენი დღე დადგა' : 'ჩვენი სიყვარულის დღე';
    document.getElementById('countdown-message').textContent = '25 ოქტომბერი, 2026';
  }
}
const calendarDays = document.getElementById('calendar-days');
const calendarFragment = document.createDocumentFragment();
for (let cell = 0; cell < 35; cell++) {
  const day = cell - 2;
  const element = document.createElement('span');
  if (day > 0 && day <= 31) element.textContent = day;
  if (day === 25) element.className = 'wedding-day';
  calendarFragment.appendChild(element);
}
calendarDays.appendChild(calendarFragment);
updateCountdown();
window.setInterval(() => { if (!document.hidden) updateCountdown(); }, 1000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) updateCountdown(); });
reopenButton.hidden = false;
// Direct links to the day's program should bypass the envelope.
if (!window.location.hash) showEnvelope();
