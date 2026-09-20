// confetti.js — lightweight DOM-based confetti burst, no external library
window.fireConfetti = function fireConfetti(count = 80) {
  const colors = ['#ec4899', '#f472b6', '#a78bfa', '#fbcfe8', '#f9a8d4', '#c4b5fd'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    const size = 6 + Math.random() * 6;
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.4}px`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    piece.style.animationDelay = `${Math.random() * 0.3}s`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
};
