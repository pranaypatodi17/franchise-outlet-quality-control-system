/* Minimal stroke icon set (24x24, lucide-style paths) */
(function () {
  const P = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    camera: '<path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.8"/>',
    tasks: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.3 1.3L7 5M3.5 12l1.3 1.3L7 11M3.5 18l1.3 1.3L7 17"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 12.5V20h14v-7.5"/><path d="M10 20v-4.5h4V20"/>',
    list: '<rect x="5" y="3.5" width="14" height="17.5" rx="2"/><path d="M9 3.5V6h6V3.5M9 11h6M9 15h4"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>', bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', arrowup: '<path d="M7 17 17 7M8 7h9v9"/>', arrowdown: '<path d="M7 7l10 10M17 8v9H8"/>',
    sparkle: '<path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
    shield: '<path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4.5M12 17.4v.1"/>', clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    repeat: '<path d="M4 10V8.5A2.5 2.5 0 0 1 6.5 6H18M15 3l3 3-3 3M20 14v1.5a2.5 2.5 0 0 1-2.5 2.5H6M9 21l-3-3 3-3"/>',
    trend: '<path d="M3 17l5.5-5.5 3.5 3.5L21 6"/><path d="M15 6h6v6"/>', users: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><circle cx="17.5" cy="9.5" r="2.5"/><path d="M17 14.5c2.5 0 4 1.5 4.5 4"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>', filter: '<path d="M3.5 5h17L14 12.5V19l-4 1.5v-8z"/>',
    pin: '<path d="M12 21s7-5.7 7-11.5a7 7 0 0 0-14 0C5 15.300 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', calendar: '<rect x="3.5" y="5" width="17" height="15.500" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>', settings: '<circle cx="12" cy="12" r="3"/><path d="M19.400 15a1.700 1.700 0 0 0 .3 1.800l.1.1a2 2 0 1 1-2.800 2.800l-.1-.1a1.700 1.700 0 0 0-1.800-.3 1.700 1.700 0 0 0-1 1.500V21a2 2 0 1 1-4 0v-.1a1.700 1.700 0 0 0-1.100-1.500 1.700 1.700 0 0 0-1.800.3l-.1.1a2 2 0 1 1-2.800-2.800l.1-.1a1.700 1.700 0 0 0 .3-1.800 1.700 1.700 0 0 0-1.500-1H3a2 2 0 1 1 0-4h.1a1.700 1.700 0 0 0 1.500-1.100 1.700 1.700 0 0 0-.3-1.800l-.1-.1a2 2 0 1 1 2.800-2.800l.1.1a1.700 1.700 0 0 0 1.800.3H9a1.700 1.700 0 0 0 1-1.500V3a2 2 0 1 1 4 0v.1a1.700 1.700 0 0 0 1 1.500 1.700 1.700 0 0 0 1.800-.3l.1-.1a2 2 0 1 1 2.800 2.800l-.1.1a1.700 1.700 0 0 0-.3 1.800V9a1.700 1.700 0 0 0 1.500 1H21a2 2 0 1 1 0 4h-.1a1.700 1.700 0 0 0-1.500 1z"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>', chevdown: '<path d="m6 9 6 6 6-6"/>', download: '<path d="M12 4v12M7 11l5 5 5-5M4 19h16"/>', mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
    layers: '<path d="m12 3.500 9 4.500-9 4.500L3 8z"/><path d="m3 12.500 9 4.500 9-4.500M3 16.500l9 4.500 9-4.500"/>', zap: '<path d="M13 3 5 13.500h6L10 21l8-10.500h-6z"/>', globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    scissors: '<circle cx="6" cy="6.500" r="2.500"/><circle cx="6" cy="17.500" r="2.500"/><path d="M8 8l12 9M8 16 20 7"/>', book: '<path d="M5 4.500A1.500 1.500 0 0 1 6.500 3H19v15H6.500A1.500 1.500 0 0 0 5 19.500z"/><path d="M5 19.500A1.500 1.500 0 0 0 6.500 21H19v-3"/>', cart: '<circle cx="9" cy="20" r="1.500"/><circle cx="18" cy="20" r="1.500"/><path d="M3 4h2.500l2.200 11h11l2-8H6.500"/>', fork: '<path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8a2 2 0 0 1-2 2M7 3v5M11 3v5M17 3c-2.500 1.500-3 5-3 8h3v10"/>',
    edit: '<path d="M4 20h4L19 9a2.800 2.800 0 0 0-4-4L4 16z"/><path d="m14 6 4 4"/>', trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12.500A1.500 1.500 0 0 0 8.500 21h7a1.500 1.500 0 0 0 1.500-1.500L18 7M9 7V4h6v3"/>', flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', msg: '<path d="M4 5h16v11H9l-5 4z"/>', link: '<path d="M10 14a4 4 0 0 0 5.500 0l3-3a4 4 0 0 0-5.600-5.600l-1 1"/><path d="M14 10a4 4 0 0 0-5.500 0l-3 3a4 4 0 0 0 5.600 5.600l1-1"/>', play: '<path d="M7 4.500v15l12.500-7.500z"/>', star: '<path d="m12 3.500 2.600 5.400 5.900.8-4.300 4.100 1 5.900L12 16.900 6.800 19.700l1-5.900L3.500 9.700l5.900-.8z"/>',
  };
  window.ic = (n, cls) => `<svg class="${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;
  window.hydrateIcons = (root) => (root || document).querySelectorAll('[data-i]').forEach((el) => { if (!el.dataset.done) { el.innerHTML = ic(el.dataset.i) + el.innerHTML; el.dataset.done = 1; } });
})();
