// mascot.js — an original decorative bunny mascot that hops back and forth in the
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
  const controlsRect = innerContent.children[innerContent.children.length - 1].getBoundingClientRect();

  const gapStart = brandRect.right - navRect.left + PADDING;
  const gapEnd = controlsRect.left - navRect.left - PADDING - MASCOT_SIZE;

  // Not enough empty space (e.g. narrow/mobile viewport) — skip rather than glitch.
  if (gapEnd - gapStart < 60) return;

  nav.style.position = 'relative';

  const wrapper = document.createElement('div');
  wrapper.className = 'mascot-walker';
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.style.setProperty('--walk-start', `${gapStart}px`);
  wrapper.style.setProperty('--walk-end', `${gapEnd}px`);
  wrapper.innerHTML = `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="95" rx="9" ry="5" fill="#f9a8d4"/>
      <ellipse cx="70" cy="95" rx="9" ry="5" fill="#f9a8d4"/>
      <ellipse cx="50" cy="68" rx="30" ry="27" fill="#fff" stroke="#f9a8d4" stroke-width="3"/>
      <ellipse cx="33" cy="28" rx="9" ry="17" fill="#fbcfe8" stroke="#f472b6" stroke-width="2" transform="rotate(-14 33 28)"/>
      <ellipse cx="67" cy="28" rx="9" ry="17" fill="#fbcfe8" stroke="#f472b6" stroke-width="2" transform="rotate(14 67 28)"/>
      <ellipse cx="33" cy="30" rx="4" ry="10" fill="#fce7f3" transform="rotate(-14 33 30)"/>
      <ellipse cx="67" cy="30" rx="4" ry="10" fill="#fce7f3" transform="rotate(14 67 30)"/>
      <circle cx="29" cy="70" r="4.5" fill="#fecdd3" opacity="0.8"/>
      <circle cx="71" cy="70" r="4.5" fill="#fecdd3" opacity="0.8"/>
      <circle cx="40" cy="64" r="3.2" fill="#4b3b3b"/>
      <circle cx="60" cy="64" r="3.2" fill="#4b3b3b"/>
      <ellipse cx="50" cy="72" rx="3.5" ry="2.5" fill="#f472b6"/>
    </svg>
  `;
  nav.appendChild(wrapper);
});
