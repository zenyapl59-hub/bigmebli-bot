// Нижнє меню між розділами + екран завантаження
(function () {
  const pages = [['dashboard.html', '📊', 'Конкуренти'], ['ideas.html', '💡', 'Ідеї'], ['ourads.html', '📈', 'Реклама'], ['check.html', '🎬', 'Перевірка', true]];
  const cur = location.pathname.split('/').pop() || 'index.html';
  document.addEventListener('DOMContentLoaded', () => {
    const n = document.createElement('nav'); n.className = 'nav';
    n.innerHTML = pages.map(([h, i, t, soon]) => `<a href="${h}" class="${h === cur ? 'on' : ''}${soon ? ' soon' : ''}"><span>${i}</span>${t}</a>`).join('');
    document.body.appendChild(n); document.body.classList.add('has-nav');
  });
})();
function loader(text) {
  const l = document.createElement('div'); l.className = 'loader'; l.id = 'loader';
  l.innerHTML = `<div class="brand">Big Mebli</div><div class="bars"><i></i><i></i><i></i><i></i><i></i></div><b>${text || 'Завантажую аналітику…'}</b><small>Збираю дані з таблиці</small>`;
  document.body.appendChild(l);
  return { done: () => { l.classList.add('hide'); setTimeout(() => l.remove(), 400); }, fail: msg => { l.querySelector('b').textContent = msg; l.querySelector('small').textContent = ''; l.querySelector('.bars').style.animationPlayState = 'paused'; } };
}
