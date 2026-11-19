// Маленька бібліотека графіків для дашбордів (SVG, без залежностей)
const fx = x => (x >= 10 ? x.toFixed(0) : x.toFixed(1)).replace('.', ',') + '×';
const fk = v => v >= 1e6 ? (v/1e6).toFixed(1).replace('.', ',') + ' млн' : v >= 1e4 ? Math.round(v/1e3) + ' тис' : v >= 1e3 ? (v/1e3).toFixed(1).replace('.', ',') + ' тис' : String(Math.round(v));
const fm = v => '$' + (v >= 1000 ? (v/1000).toFixed(1).replace('.', ',') + 'k' : v >= 100 ? Math.round(v) : v.toFixed(2).replace('.', ','));
const pct = v => (v > 0 ? '+' : '') + Math.round(v * 100) + '%';
const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
const median = a => { if (!a.length) return 0; const s = [...a].sort((p, q) => p - q), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m-1] + s[m]) / 2; };
const badge = (v, invert) => { if (!isFinite(v)) return ''; const good = invert ? v < 0 : v > 0; return `<span class="badge ${Math.abs(v) < .005 ? 'neu' : good ? 'pos' : 'neg'}">${pct(v)}</span>`; };

// декоративні фігури для кольорових плиток
const SHAPES = {
  plus: '<svg class="shape" viewBox="0 0 100 100"><path d="M38 0h24v38h38v24H62v38H38V62H0V38h38z" fill="currentColor"/></svg>',
  star: '<svg class="shape" viewBox="0 0 100 100"><path d="M50 0l11 27 29-9-14 26 24 17-29 6 3 30-24-18-24 18 3-30L0 61l24-17L10 18l29 9z" fill="currentColor"/></svg>',
  tri:  '<svg class="shape" viewBox="0 0 100 100"><path d="M0 10h100L50 100z" fill="currentColor"/></svg>',
  heart:'<svg class="shape" viewBox="0 0 100 100"><path d="M50 90S5 62 5 32C5 15 18 5 31 5c9 0 15 5 19 12 4-7 10-12 19-12 13 0 26 10 26 27 0 30-45 58-45 58z" fill="currentColor"/></svg>',
  circle:'<svg class="shape" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="currentColor"/></svg>'
};

// вертикальні стовпчики: найбільший виділено, підпис над ним «бульбашкою»
function vbars(data, o = {}) {
  if (!data.length) return '<div class="muted">Поки немає даних</div>';
  const W = o.W > 50 ? o.W : 320, H = o.h || 150, B = 22, T = 30, n = data.length, step = W / n, bw = Math.min(o.bw || 14, step * .55);
  const mx = Math.max(...data.map(d => d.v), o.min || 0) || 1, sy = v => H - B - v / mx * (H - B - T);
  const hi = data.reduce((a, d, i) => d.v > data[a].v ? i : a, 0);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%">`;
  if (o.ref != null) s += `<line class="rf" x1="0" x2="${W}" y1="${sy(o.ref)}" y2="${sy(o.ref)}"/><text x="${W}" y="${sy(o.ref) - 4}" text-anchor="end">${o.refLabel || ''}</text>`;
  data.forEach((d, i) => { const x = i * step + (step - bw) / 2, y = sy(d.v), h = Math.max(H - B - y, 2), isHi = i === hi;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="${bw / 2}" fill="${isHi ? 'var(--accent)' : (o.color || 'var(--text)')}" ${isHi ? '' : 'fill-opacity=".85"'} data-tip="${esc(d.tip || d.k + ': ' + (o.fmt || String)(d.v))}"/>`;
    const every = Math.max(1, Math.ceil(34 / step)); if (i % every === 0) s += `<text x="${Math.min(Math.max(x + bw / 2, 16), W - 16)}" y="${H - 6}" text-anchor="middle">${esc(d.short || d.k)}</text>`; });
  const d = data[hi], x = hi * step + step / 2, y = sy(d.v), lab = (o.fmt || String)(d.v), lw = lab.length * 7 + 14;
  const bx = Math.min(Math.max(x - lw / 2, 0), W - lw);
  s += `<rect x="${bx}" y="${y - 26}" width="${lw}" height="20" rx="10" fill="var(--esp)"/><text x="${bx + lw / 2}" y="${y - 12}" text-anchor="middle" style="fill:var(--esp-text);font-weight:700">${lab}</text>`;
  return s + '</svg>';
}

// концентричні кільця (частки), підписи окремим списком
function rings(data, o = {}) {
  const S = o.size || 150, c = S / 2, w = 9, gap = 5, cols = o.colors || ['var(--accent)', 'var(--text)', 'var(--hint)', 'var(--bar-track)'];
  let s = `<svg viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">`;
  data.slice(0, 4).forEach((d, i) => { const r = c - w / 2 - i * (w + gap), L = 2 * Math.PI * r * .75;
    s += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="var(--bg)" stroke-width="${w}" stroke-dasharray="${L} 999" stroke-linecap="round" transform="rotate(135 ${c} ${c})"/>`;
    s += `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${cols[i]}" stroke-width="${w}" stroke-dasharray="${Math.max(L * d.share, 1)} 999" stroke-linecap="round" transform="rotate(135 ${c} ${c})" data-tip="${esc(d.k)}: ${Math.round(d.share * 100)}%"/>`; });
  return s + '</svg>';
}
const ringLegend = (data, o = {}) => { const cols = o.colors || ['var(--accent)', 'var(--text)', 'var(--hint)', 'var(--bar-track)'];
  return data.slice(0, 4).map((d, i) => `<div style="display:flex;align-items:center;gap:8px;font-size:13px;margin-top:6px"><span style="width:10px;height:10px;border-radius:50%;background:${cols[i]};flex:0 0 10px"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.k)}</span><b>${o.val ? o.val(d) : Math.round(d.share * 100) + '%'}</b></div>`).join(''); };

// бульбашки: розмір = значення
function bubbles(data, o = {}) {
  const W = o.W > 50 ? o.W : 320, H = 200, mx = Math.max(...data.map(d => d.v)) || 1;
  const pts = data.slice(0, 6).map((d, i) => ({ ...d, r: 16 + Math.sqrt(d.v / mx) * 34 }));
  // проста розкладка спіраллю з відштовхуванням
  pts.forEach((p, i) => { const a = i * 2.4, rr = i ? 40 + i * 14 : 0; p.x = W / 2 + Math.cos(a) * rr; p.y = H / 2 + Math.sin(a) * rr * .7; });
  for (let k = 0; k < 400; k++) { for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const a = pts[i], b = pts[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, m = a.r + b.r + 4 - d;
    if (m > 0) { const ux = dx / d * m / 2, uy = dy / d * m / 2; a.x -= ux; a.y -= uy; b.x += ux; b.y += uy; } }
    pts.forEach(p => { p.x += (W / 2 - p.x) * .01; p.y += (H / 2 - p.y) * .01; p.x = Math.min(Math.max(p.x, p.r), W - p.r); p.y = Math.min(Math.max(p.y, p.r), H - p.r); }); }
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%">`;
  pts.forEach((p, i) => { s += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${i === 0 ? 'var(--accent)' : 'var(--text)'}" fill-opacity="${i === 0 ? 1 : Math.max(.85 - i * .1, .35)}" stroke="var(--tile)" stroke-width="3" data-tip="${esc(p.tip)}"/>`;
    s += `<text x="${p.x}" y="${p.y + 4}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:${p.r > 34 ? 13 : 11}px">${esc(p.label)}</text>`; });
  return s + '</svg>';
}

// лінія з точками (тренд)
function line(data, o = {}) {
  if (data.length < 2) return '<div class="muted">Замало точок</div>';
  const W = o.W > 50 ? o.W : 320, H = o.h || 120, B = 20, T = 12, mx = Math.max(...data.map(d => d.v)) * 1.1 || 1, mn = o.zero ? 0 : Math.min(...data.map(d => d.v)) * .9;
  const sx = i => 6 + i / (data.length - 1) * (W - 12), sy = v => H - B - (v - mn) / (mx - mn || 1) * (H - B - T);
  const p = data.map((d, i) => `${sx(i)},${sy(d.v)}`).join(' L');
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%"><path d="M${p}" fill="none" stroke="${o.color || 'var(--text)'}" stroke-width="2" stroke-linejoin="round"/>`;
  if (o.target != null) s += `<line class="rf" x1="0" x2="${W}" y1="${sy(o.target)}" y2="${sy(o.target)}"/><text x="${W}" y="${sy(o.target) - 4}" text-anchor="end">${o.targetLabel || ''}</text>`;
  data.forEach((d, i) => { s += `<circle cx="${sx(i)}" cy="${sy(d.v)}" r="${i === data.length - 1 ? 5 : 3}" fill="${i === data.length - 1 ? 'var(--accent)' : 'var(--text)'}" stroke="var(--tile)" stroke-width="2" data-tip="${esc(d.k + ': ' + (o.fmt || String)(d.v))}"/>`;
    if (i % Math.max(1, Math.ceil(data.length * 40 / W)) === 0) s += `<text x="${Math.min(Math.max(sx(i), 14), W - 14)}" y="${H - 4}" text-anchor="middle">${esc(d.k)}</text>`; });
  return s + '</svg>';
}

// підказки
(function () {
  const tip = document.createElement('div'); tip.className = 'tipb'; document.addEventListener('DOMContentLoaded', () => document.body.appendChild(tip));
  document.addEventListener('pointerover', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (!t) { tip.style.opacity = 0; return; } tip.textContent = t.dataset.tip; tip.style.opacity = 1; });
  document.addEventListener('pointermove', e => { tip.style.left = Math.min(e.clientX + 12, innerWidth - 250) + 'px'; tip.style.top = (e.clientY + 14) + 'px'; });
})();
function hello() {
  const h = new Date().getHours(), part = h < 5 ? 'Доброї ночі' : h < 12 ? 'Доброго ранку' : h < 18 ? 'Добрий день' : 'Добрий вечір';
  const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user; return { text: part + (u && u.first_name ? ', ' + u.first_name : ''), ini: u && u.first_name ? u.first_name[0] : 'BM' };
}
