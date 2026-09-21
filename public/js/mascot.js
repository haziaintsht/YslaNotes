// mascot.js — an original decorative Shih Tzu mascot that toddles back and forth in the
// empty space of the nav bar, between the brand and the button group.
// Not affiliated with or based on any copyrighted character.
// Waits for full page load (not just DOMContentLoaded) because Tailwind's CDN
// script applies layout classes asynchronously — measuring the nav's flex gap
// any earlier can read stale (pre-layout) positions.
window.addEventListener('load', () => {
  if (document.querySelector('.mascot-walker')) return;

  const nav = document.querySelector('nav');
  if (!nav) return;

  const innerContent = nav.querySelector(':scope > div');
  if (!innerContent || innerContent.children.length < 2) return;

  const MASCOT_SIZE = 54;
  const PADDING = 16;

  const navRect = nav.getBoundingClientRect();
  const brandRect = innerContent.children[0].getBoundingClientRect();

  // The nav now has both a desktop button row and a mobile hamburger button as
  // siblings — only one is visible at a given viewport width (the other is
  // display:none and reports a zero-size rect). Use whichever is actually rendered.
  const children = Array.from(innerContent.children);
  let controlsRect = null;
  for (let i = children.length - 1; i >= 1; i--) {
    const rect = children[i].getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      controlsRect = rect;
      break;
    }
  }
  if (!controlsRect) return;

  const gapStart = brandRect.right - navRect.left + PADDING;
  const gapEnd = controlsRect.left - navRect.left - PADDING - MASCOT_SIZE;

  // Not enough empty space (e.g. narrow/mobile viewport) — skip rather than glitch.
  if (gapEnd - gapStart < 60) return;

  nav.style.position = 'relative';

  // An original Shih Tzu illustration (a dog breed, not a copyrighted character) —
  // fluffy floppy ears, a flat little muzzle, and a topknot tied with a bow.
  const SHIHTZU_SVG = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="96" rx="9" ry="4.5" fill="#e8c39e"/>
      <ellipse cx="68" cy="96" rx="9" ry="4.5" fill="#e8c39e"/>
      <path d="M26 36 C15 42, 11 58, 19 75 C23 82, 30 80, 30 71 C31 59, 30 46, 26 36 Z" fill="#e8c39e" stroke="#d4a373" stroke-width="2"/>
      <path d="M74 36 C85 42, 89 58, 81 75 C77 82, 70 80, 70 71 C69 59, 70 46, 74 36 Z" fill="#e8c39e" stroke="#d4a373" stroke-width="2"/>
      <path d="M22 52 C19 60, 20 68, 25 74" fill="none" stroke="#d4a373" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
      <path d="M78 52 C81 60, 80 68, 75 74" fill="none" stroke="#d4a373" stroke-width="1.3" stroke-linecap="round" opacity="0.7"/>
      <ellipse cx="50" cy="58" rx="29" ry="27" fill="#fdf6ec" stroke="#e8c39e" stroke-width="3"/>
      <ellipse cx="36" cy="46" rx="9" ry="7" fill="#e8c39e" opacity="0.5"/>
      <ellipse cx="64" cy="46" rx="9" ry="7" fill="#e8c39e" opacity="0.5"/>
      <ellipse cx="50" cy="69" rx="15" ry="10" fill="#fff"/>
      <circle cx="40" cy="58" r="4.3" fill="#3f2a1d"/>
      <circle cx="60" cy="58" r="4.3" fill="#3f2a1d"/>
      <circle cx="41.4" cy="56.5" r="1.2" fill="#fff"/>
      <circle cx="61.4" cy="56.5" r="1.2" fill="#fff"/>
      <ellipse cx="50" cy="67" rx="4.3" ry="3" fill="#2d2019"/>
      <path d="M50 70 Q46 74 42 72 M50 70 Q54 74 58 72" stroke="#c07a55" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="29" rx="8.5" ry="8.5" fill="#fdf6ec" stroke="#e8c39e" stroke-width="2"/>
      <g transform="translate(50,23)">
        <path d="M-7 0 L0 5 L-7 10 Z" fill="#f472b6"/>
        <path d="M7 0 L0 5 L7 10 Z" fill="#f472b6"/>
        <circle cx="0" cy="5" r="2.1" fill="#be185d"/>
      </g>
    </svg>
  `;

  const wrapper = document.createElement('div');
  wrapper.className = 'mascot-walker';
  wrapper.style.setProperty('--walk-start', `${gapStart}px`);
  wrapper.style.setProperty('--walk-end', `${gapEnd}px`);
  wrapper.innerHTML = SHIHTZU_SVG;

  // Tap/click Hoshi for a little message — name reveal plus random loving thoughts.
  const MESSAGES = [
    "Hi, I'm Hoshi!",
    'I love you, mommy!',
    "You're doing amazing today!",
    'Best mommy in the whole world!',
    "Keep going, you've got this!",
    'Sending you all my puppy love!',
    'You make my tail wag!',
    "Don't forget to rest a little!",
    'So proud of you, mommy!',
    "Woof! I'm cheering for you!"
  ];
  let lastMessage = null;
  let hideTimer = null;

  const bubble = document.createElement('div');
  bubble.className = 'mascot-bubble';
  wrapper.appendChild(bubble);

  wrapper.setAttribute('role', 'button');
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('aria-label', 'Pet Hoshi');

  function speak() {
    let message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    if (message === lastMessage && MESSAGES.length > 1) {
      message = MESSAGES[(MESSAGES.indexOf(message) + 1) % MESSAGES.length];
    }
    lastMessage = message;
    bubble.textContent = message;
    bubble.classList.add('visible');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => bubble.classList.remove('visible'), 2800);
  }

  wrapper.addEventListener('click', speak);
  wrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      speak();
    }
  });

  nav.appendChild(wrapper);
});
