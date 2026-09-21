// nav-menu.js — toggles the mobile hamburger dropdown in the nav bar.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-menu-toggle');
  const menu = document.getElementById('nav-menu-mobile');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
  });

  // Close the mobile menu automatically once the desktop row takes over. Checking the
  // toggle button's own computed visibility (rather than a hardcoded width) keeps this
  // correct even on pages like the dashboard that use a wider breakpoint than the rest.
  window.addEventListener('resize', () => {
    const toggleHidden = getComputedStyle(toggle).display === 'none';
    if (toggleHidden && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
    }
  });
});
