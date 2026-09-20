// lib/icons.js — small hand-authored line-icon set (replaces emoji glyphs across the UI)
// All icons use stroke="currentColor" so they inherit text color / can be tinted via CSS.

const ICONS = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C4 4.67 4.67 4 5.5 4H11a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5H4V5.5Z"/><path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H13a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5H20V5.5Z"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5l1.6 4.9 4.9 1.6-4.9 1.6L12 15.5l-1.6-4.9-4.9-1.6 4.9-1.6L12 2.5Z"/><path d="M19 14l.8 2.4 2.4.8-2.4.8L19 20l-.8-2.4-2.4-.8 2.4-.8L19 14Z"/><path d="M5 13l.6 1.9 1.9.6-1.9.6L5 18l-.6-1.9-1.9-.6 1.9-.6L5 13Z"/></svg>`,
  pencil: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l4.2-.9L19 8.3a1.5 1.5 0 0 0 0-2.1l-1.2-1.2a1.5 1.5 0 0 0-2.1 0L4.9 15.8 4 20Z"/><path d="M14.5 6.5l3 3"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10"/><path d="M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10"/><path d="M12 13v3"/><path d="M9 20h6"/><path d="M10 16.5h4l.6 3.5H9.4l.6-3.5Z"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.3 2.3 4.7-5"/></svg>`,
  xCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5"/><path d="M20 4.5v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 15.5"/><path d="M4 19.5v-4h4"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M11 6l-6 6 6 6"/></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 20.5s-7.5-4.6-9.8-9.4C.7 7.6 2.4 4 6 4c2 0 3.5 1.1 4.5 2.6.9 1.4.6 1.4 1.5 0C13 5.1 14.5 4 16.5 4c3.6 0 5.3 3.6 3.8 7.1C17.5 15.9 12 20.5 12 20.5Z"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V6"/><path d="M8.5 9.5L12 6l3.5 3.5"/><path d="M5 15v2.5A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V15"/></svg>`,
  plusCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 8v8M8 12h8"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7"/><path d="M7 7l1 12.5A1.5 1.5 0 0 0 9.5 21h5a1.5 1.5 0 0 0 1.5-1.5L17 7"/><path d="M10 11v6M14 11v6"/></svg>`,
  speakerWave: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L11 6v12l-3.8-3.5H4v-5Z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 7a7 7 0 0 1 0 10"/></svg>`,
  speakerX: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L11 6v12l-3.8-3.5H4v-5Z"/><path d="M16 9l4 4M20 9l-4 4"/></svg>`,
  flame: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2c1.5 3 4 5 4 9a4 4 0 1 1-8 0c0-1.2.4-2 1-2.8-.1 1 .3 1.8 1 2.3-.4-2.5 1-3.5 1-5.5-.5.5-1 .8-1.5.8C10 4.5 11 3 12 2Z"/></svg>`,
  chartBar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M2 20h20"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.5-4.5"/></svg>`,
  printer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 8V4h10v4"/><rect x="5" y="8" width="14" height="8" rx="1.5"/><path d="M7 16v4h10v-4"/></svg>`,
  coin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5.2"/><path d="M12 9v6M10 10.3c0-.7.8-1.3 2-1.3s2 .5 2 1.2-1 1-2 1.2-2 .5-2 1.3 1 1.3 2 1.3 2-.6 2-1.3"/></svg>`,
  store: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8l1.5-4h13L20 8"/><path d="M4 8h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8Z"/><path d="M9 12a3 3 0 0 0 6 0"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  musicNote: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M9 18.5a2.75 2.75 0 1 1-1.6-2.5V6.8a1 1 0 0 1 .8-1l9-1.8a1 1 0 0 1 1.2 1V16a2.75 2.75 0 1 1-1.6-2.5V6.3l-7.8 1.6v10.6Z"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 5.3c0-.9 1-1.5 1.8-1l11 6.7a1.2 1.2 0 0 1 0 2l-11 6.7c-.8.5-1.8-.1-1.8-1V5.3Z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="5" width="4.5" height="14" rx="1.2"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.2"/></svg>`,
  skipBack: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="5" y="5" width="2.3" height="14" rx="1"/><path d="M19 5.3c0-.9-1-1.5-1.8-1l-9.3 6.7a1.2 1.2 0 0 0 0 2l9.3 6.7c.8.5 1.8-.1 1.8-1V5.3Z"/></svg>`,
  skipForward: `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="16.7" y="5" width="2.3" height="14" rx="1"/><path d="M5 5.3c0-.9 1-1.5 1.8-1l9.3 6.7a1.2 1.2 0 0 1 0 2l-9.3 6.7c-.8.5-1.8-.1-1.8-1V5.3Z"/></svg>`
};

function icon(name, className = 'icon') {
  const svg = ICONS[name];
  if (!svg) return '';
  return svg.replace('<svg ', `<svg class="${className}" `);
}

module.exports = icon;
