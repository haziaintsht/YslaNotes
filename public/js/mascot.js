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
      <ellipse cx="30" cy="95" rx="9" ry="5" fill="#e8c39e"/>
      <ellipse cx="70" cy="95" rx="9" ry="5" fill="#e8c39e"/>
      <ellipse cx="16" cy="56" rx="13" ry="24" fill="#e8c39e" stroke="#d4a373" stroke-width="2" transform="rotate(-8 16 56)"/>
      <ellipse cx="84" cy="56" rx="13" ry="24" fill="#e8c39e" stroke="#d4a373" stroke-width="2" transform="rotate(8 84 56)"/>
      <ellipse cx="50" cy="60" rx="34" ry="30" fill="#fdf6ec" stroke="#e8c39e" stroke-width="3"/>
      <ellipse cx="34" cy="47" rx="10" ry="8" fill="#e8c39e" opacity="0.55"/>
      <ellipse cx="66" cy="47" rx="10" ry="8" fill="#e8c39e" opacity="0.55"/>
      <ellipse cx="50" cy="73" rx="16" ry="11" fill="#fff"/>
      <circle cx="40" cy="60" r="4" fill="#3f2a1d"/>
      <circle cx="60" cy="60" r="4" fill="#3f2a1d"/>
      <circle cx="41.3" cy="58.6" r="1.1" fill="#fff"/>
      <circle cx="61.3" cy="58.6" r="1.1" fill="#fff"/>
      <ellipse cx="50" cy="70" rx="4.5" ry="3.2" fill="#2d2019"/>
      <path d="M50 73 Q46 77 42 75 M50 73 Q54 77 58 75" stroke="#c07a55" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="50" cy="30" rx="9" ry="9" fill="#fdf6ec" stroke="#e8c39e" stroke-width="2"/>
      <g transform="translate(50,24)">
        <path d="M-7 0 L0 5 L-7 10 Z" fill="#f472b6"/>
        <path d="M7 0 L0 5 L7 10 Z" fill="#f472b6"/>
        <circle cx="0" cy="5" r="2.2" fill="#be185d"/>
      </g>
    </svg>
  `;

  const wrapper = document.createElement('div');
  wrapper.className = 'mascot-walker';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.style.setProperty('--walk-start', `${gapStart}px`);
  wrapper.style.setProperty('--walk-end', `${gapEnd}px`);
  wrapper.innerHTML = SHIHTZU_SVG;
  nav.appendChild(wrapper);
});
