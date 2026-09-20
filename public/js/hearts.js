// hearts.js — ambient floating background hearts + a heart-burst effect for correct answers.
// Purely decorative, original CSS/SVG shapes (no external assets).
document.addEventListener('DOMContentLoaded', () => {
  const HEART_PATH = 'M12 20.5s-7.5-4.6-9.8-9.4C.7 7.6 2.4 4 6 4c2 0 3.5 1.1 4.5 2.6.9 1.4.6 1.4 1.5 0C13 5.1 14.5 4 16.5 4c3.6 0 5.3 3.6 3.8 7.1C17.5 15.9 12 20.5 12 20.5Z';
  const COLORS = ['#f472b6', '#f9a8d4', '#c084fc', '#fb7185', '#f0abfc'];

  if (!document.querySelector('.floating-heart')) {
    const count = 7;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.setAttribute('aria-hidden', 'true');
      const size = 12 + Math.random() * 14;
      heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${COLORS[Math.floor(Math.random() * COLORS.length)]}"><path d="${HEART_PATH}"/></svg>`;
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.setProperty('--heart-drift', `${(Math.random() - 0.5) * 100}px`);
      heart.style.animationDuration = `${11 + Math.random() * 9}s`;
      heart.style.animationDelay = `${Math.random() * 12}s`;
      document.body.appendChild(heart);
    }
  }

  window.fireHeartBurst = function fireHeartBurst(x, y, count = 6) {
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'heart-burst-piece';
      const size = 10 + Math.random() * 10;
      piece.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${COLORS[Math.floor(Math.random() * COLORS.length)]}"><path d="${HEART_PATH}"/></svg>`;
      piece.style.left = `${x}px`;
      piece.style.top = `${y}px`;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const distance = 30 + Math.random() * 30;
      piece.style.setProperty('--burst-x', `${Math.cos(angle) * distance}px`);
      piece.style.setProperty('--burst-y', `${Math.sin(angle) * distance - 20}px`);
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 900);
    }
  };
});
