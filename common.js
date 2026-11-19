// Спільні налаштування для всіх сторінок
const API_URL = 'https://script.google.com/macros/s/AKfycby39z3pGOZ1iTe-MXAPXnuxT283kf8ONVsE2UVt8W71GvNBrV67EJlKMJ0n-XHiaTvR/exec';

const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

// Запит до сервера (Apps Script)
async function api(action, payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // так Google не блокує запит
    body: JSON.stringify({ action, payload: payload || {}, initData: tg ? tg.initData : '' })
  });
  const j = await res.json();
  if (!j.ok) throw new Error(j.error);
  return j.data;
}

// Кнопка "Назад" Telegram на внутрішніх сторінках
function enableBack() {   // меню знизу замінює кнопку «Назад»
  if (tg) tg.BackButton.hide();
}

function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
