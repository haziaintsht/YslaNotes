// nav-menu.js — toggles the mobile hamburger dropdown in the nav bar.
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-menu-toggle');
  const menu = document.getElementById('nav-menu-mobile');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    menu.classList.toggle('hidden');
    menu.classList.toggle('flex');
  });

  // close the mobile menu automatically if the viewport is resized past the mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 640 && !menu.classList.contains('hidden')) {
      menu.classList.add('hidden');
      menu.classList.remove('flex');
    }
  });
});
