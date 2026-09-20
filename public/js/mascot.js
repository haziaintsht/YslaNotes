// mascot.js — an original decorative bunny mascot that hops across the screen.
// Not affiliated with or based on any copyrighted character.
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.mascot-walker')) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'mascot-walker';
  wrapper.setAttribute('aria-hidden', 'true');
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
  document.body.appendChild(wrapper);
});
