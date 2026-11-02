/* Plumb — illustrated outlet "photos" with AI detection overlays.
   Each scene draws an 800x500 view of a cafe outlet. Defects (violation ids)
   change what is drawn, and every supported check has a bounding box so the
   AI layer can mark it as passed or failed. */
(function () {
  const G = '#12372d', G2 = '#1c5a47', CREAM = '#f4e9d0', WOOD = '#b98e5e', WOOD2 = '#8b5e3c';

  /* ---------- helpers ---------- */
  const leaf = (x, y, s, c) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -20 C 18 -14 22 6 0 20 C -22 6 -18 -14 0 -20Z" fill="${c}"/><path d="M0 -12 L0 17" stroke="${G}" stroke-width="2" fill="none"/></g>`;

  /* ---------- STOREFRONT ---------- */
  function storefront(d) {
    const has = (i) => d.includes(i);
    let stripes = '';
    for (let i = 0; i < 14; i++) stripes += `<rect x="${60 + i * 50.7}" y="146" width="50.7" height="46" fill="${i % 2 ? CREAM : G2}"/>`;
    const sign = has('sign_unlit')
      ? `<text x="222" y="110" font-size="46" font-weight="800" letter-spacing="4" fill="${CREAM}" font-family="Inter,Arial,sans-serif"><tspan opacity=".22">KE</tspan>TTL<tspan opacity=".22">E</tspan> &amp; C<tspan opacity=".22">O</tspan>.</text>`
      : `<text x="222" y="110" font-size="46" font-weight="800" letter-spacing="4" fill="${CREAM}" font-family="Inter,Arial,sans-serif">KETTLE &amp; CO.</text>`;
    const poster = has('promo_old')
      ? `<g transform="rotate(-2 140 290)"><rect x="95" y="228" width="100" height="125" fill="#d9c58d" stroke="#b9a266"/><path d="M195 353 l-16 0 l16 -16z" fill="#b9a266"/><text x="145" y="262" text-anchor="middle" font-size="15" font-weight="800" fill="#8a7440" font-family="Inter,Arial">SUMMER</text><text x="145" y="280" text-anchor="middle" font-size="15" font-weight="800" fill="#8a7440" font-family="Inter,Arial">SIPS</text><rect x="110" y="294" width="70" height="26" fill="#c9b273"/><text x="145" y="312" text-anchor="middle" font-size="11" font-weight="700" fill="#8a7440" font-family="Inter,Arial">ENDED 30 JUN</text><rect x="120" y="222" width="40" height="12" fill="#e8dca8" opacity=".8"/></g>`
      : `<rect x="95" y="228" width="100" height="125" rx="3" fill="#a3361f"/><text x="145" y="262" text-anchor="middle" font-size="15" font-weight="800" fill="${CREAM}" font-family="Inter,Arial">DIWALI</text><text x="145" y="281" text-anchor="middle" font-size="15" font-weight="800" fill="${CREAM}" font-family="Inter,Arial">BLEND</text>${leaf(145, 318, 1.1, '#f0b429')}<text x="145" y="346" text-anchor="middle" font-size="10" font-weight="600" fill="#f6d7b0" font-family="Inter,Arial">Now brewing</text>`;
    const aframe = has('logo_blocked')
      ? `<g><path d="M612 430 L650 262 L692 262 L730 430Z" fill="#3b2f2a"/><path d="M620 424 L654 272 L688 272 L722 424Z" fill="#26302d"/><text x="671" y="318" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Inter,Arial">TODAY'S</text><text x="671" y="336" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Inter,Arial">SPECIAL</text><path d="M648 352 h46 M644 366 h54 M648 380 h46" stroke="#9fb7ae" stroke-width="3"/></g>`
      : '';
    const svg = `
      <defs><linearGradient id="sf-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bcd7e6"/><stop offset="1" stop-color="#e8f1f4"/></linearGradient>
      <linearGradient id="sf-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9c0"/><stop offset="1" stop-color="#9fc9c4"/></linearGradient></defs>
      <rect width="800" height="500" fill="url(#sf-sky)"/>
      <rect x="0" y="440" width="800" height="60" fill="#cfc8bd"/><path d="M0 470 H800" stroke="#bdb5a8" stroke-width="2"/>
      <rect x="30" y="28" width="740" height="414" rx="6" fill="#efe4d0"/>
      <rect x="120" y="44" width="560" height="92" rx="10" fill="${G}"/><rect x="128" y="52" width="544" height="76" rx="7" fill="none" stroke="#2b7a62" stroke-width="2"/>
      ${leaf(172, 90, 1.3, '#7fd1a8')}${sign}
      ${stripes}<path d="M60 192 h680" stroke="${G}" stroke-width="3"/>
      <rect x="70" y="208" width="310" height="205" rx="4" fill="${G}"/><rect x="78" y="216" width="294" height="189" fill="url(#sf-glass)"/>
      <path d="M225 216 V405" stroke="${G}" stroke-width="5"/>
      <g opacity=".85"><circle cx="270" cy="250" r="14" fill="#f6c76a"/><path d="M270 216 V236" stroke="#6b4b2a" stroke-width="2"/><circle cx="330" cy="250" r="14" fill="#f6c76a"/><path d="M330 216 V236" stroke="#6b4b2a" stroke-width="2"/>
      <rect x="262" y="340" width="90" height="8" rx="3" fill="#6b4b2a"/><rect x="304" y="348" width="6" height="50" fill="#6b4b2a"/></g>
      ${poster}
      <rect x="440" y="208" width="125" height="214" rx="4" fill="${G}"/><rect x="450" y="218" width="105" height="196" fill="url(#sf-glass)"/><rect x="494" y="218" width="4" height="196" fill="${G}"/>
      <rect x="520" y="312" width="5" height="40" rx="2" fill="${CREAM}"/>
      <rect x="470" y="228" width="55" height="22" rx="4" fill="#ffffff" opacity=".9"/><text x="497" y="244" text-anchor="middle" font-size="12" font-weight="800" fill="${G}" font-family="Inter,Arial">OPEN</text>
      <rect x="605" y="252" width="130" height="102" rx="8" fill="${G}"/>${leaf(670, 292, 1.9, '#7fd1a8')}
      <text x="670" y="342" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="2" fill="${CREAM}" font-family="Inter,Arial">SINCE 2011</text>
      ${aframe}
      <ellipse cx="410" cy="446" rx="60" ry="5" fill="#000" opacity=".08"/>`;
    return {
      svg,
      boxes: {
        sign_unlit: [120, 44, 560, 92],
        promo_old: [92, 222, 108, 134],
        logo_blocked: [600, 250, 140, 185],
      },
    };
  }

  /* ---------- COUNTER ---------- */
  function counter(d) {
    const has = (i) => d.includes(i);
    // menu board
    const rows = [['Espresso', 120], ['Cappuccino', 160], ['Cold Brew', 190], ['Masala Chai', 90], ['Filter Kaapi', 110]];
    let menu = '';
    rows.forEach((r, i) => {
      const y = 100 + i * 20;
      const old = has('menu_old') && (i === 1 || i === 2);
      menu += `<text x="92" y="${y}" font-size="13" fill="#e9efe9" font-family="Inter,Arial">${r[0]}</text><path d="M180 ${y - 4} H292" stroke="#41524c" stroke-dasharray="2 4"/>
        <text x="320" y="${y}" text-anchor="end" font-size="13" font-weight="700" fill="${old ? '#9aa6a1' : '#f0c75e'}" font-family="Inter,Arial">&#8377;${r[1]}</text>`;
      if (old) menu += `<path d="M298 ${y - 5} H322" stroke="#e5484d" stroke-width="2"/>`;
    });
    if (has('menu_old')) menu += `<g transform="rotate(-4 250 176)"><rect x="205" y="160" width="110" height="34" fill="#f5d7de"/><text x="260" y="175" text-anchor="middle" font-size="10" font-weight="700" fill="#8a2a3c" font-family="Inter,Arial">PRICES VALID TILL</text><text x="260" y="188" text-anchor="middle" font-size="10" font-weight="700" fill="#8a2a3c" font-family="Inter,Arial">MARCH (HANDWRITTEN)</text></g>`;
    // cups
    let cups = '';
    for (let s = 0; s < 6; s++) {
      const bad = has('cups_off') && (s === 1 || s === 4);
      const x = 392 + s * 46;
      let stack = '';
      const n = has('cups_off') && s === 2 ? 2 : 4;
      for (let k = 0; k < n; k++) stack += `<path d="M${x} ${128 - k * 14} h34 l-4 14 h-26z" fill="${s % 2 ? '#f6efe2' : '#e7d7b9'}" stroke="#c7b48f"/>`;
      cups += bad ? `<g transform="rotate(${s === 1 ? -9 : 11} ${x + 17} 142)">${stack}</g>` : stack;
    }
    if (has('cups_off')) cups += `<g transform="rotate(78 640 134)"><path d="M626 126 h34 l-4 14 h-26z" fill="#f6efe2" stroke="#c7b48f"/></g>`;
    // pastries
    let pastry = '';
    const pc = ['#d79a4e', '#c47a34', '#e1b06a', '#b9692c'];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 6; c++) {
        let x = 76 + c * 44, y = 372 + r * 52, fill = pc[(c + r) % 4], rot = 0;
        if (has('pastry_off')) {
          if (r === 0 && c === 3) continue;
          if (r === 1 && c === 1) { fill = '#6b8f71'; }
          if (r === 0 && c === 1) { rot = 24; y += 4; }
          x += (c * 7) % 11 - 5;
        }
        pastry += `<g transform="rotate(${rot} ${x + 16} ${y})"><ellipse cx="${x + 16}" cy="${y}" rx="17" ry="11" fill="${fill}"/><path d="M${x + 6} ${y - 6} q10 -8 20 0" stroke="#fff" stroke-opacity=".35" stroke-width="2" fill="none"/></g>`;
      }
    }
    if (has('pastry_off')) pastry += `<rect x="150" y="418" width="26" height="14" rx="3" fill="#fff" stroke="#c7b48f"/><text x="163" y="428" text-anchor="middle" font-size="7" fill="#777" font-family="Inter,Arial">???</text>`;
    // barista
    const barista = has('no_apron')
      ? `<rect x="378" y="176" width="64" height="118" rx="12" fill="#7b8794"/><rect x="400" y="176" width="20" height="14" fill="#6a7580"/>`
      : `<rect x="378" y="176" width="64" height="118" rx="12" fill="#e9e2d3"/><path d="M388 190 h44 v104 h-44z" fill="${G2}"/><path d="M394 190 L410 176 L426 190" fill="none" stroke="${G}" stroke-width="3"/><rect x="396" y="226" width="28" height="18" rx="3" fill="${G}"/><circle cx="410" cy="204" r="4" fill="#7fd1a8"/>`;
    const svg = `
      <rect width="800" height="500" fill="#f2e8d8"/>
      <rect y="300" width="800" height="200" fill="${WOOD2}"/>
      <rect x="60" y="30" width="290" height="190" rx="8" fill="#6a4a2d"/><rect x="68" y="38" width="274" height="174" rx="5" fill="#1f2a27"/>
      <text x="205" y="68" text-anchor="middle" font-size="15" font-weight="800" letter-spacing="4" fill="#7fd1a8" font-family="Inter,Arial">KETTLE &amp; CO.</text>${menu}
      <rect x="380" y="146" width="300" height="9" rx="2" fill="${WOOD}"/>${cups}
      <rect x="500" y="170" width="150" height="124" rx="10" fill="#aeb8bb"/><rect x="512" y="182" width="126" height="40" rx="6" fill="#8b979b"/><circle cx="545" cy="252" r="14" fill="#5d686c"/><circle cx="605" cy="252" r="14" fill="#5d686c"/><rect x="520" y="268" width="110" height="8" fill="#6f7b7f"/>
      <circle cx="410" cy="150" r="22" fill="#d7a77f"/><path d="M388 142 q22 -26 44 0 q-22 -8 -44 0z" fill="${G}"/>${barista}
      <rect x="0" y="288" width="800" height="26" fill="${WOOD}"/><rect x="0" y="312" width="800" height="6" fill="#00000022"/>
      <rect x="560" y="268" width="62" height="20" rx="3" fill="#2c3a37"/><rect x="574" y="254" width="34" height="14" fill="#2c3a37"/>
      <rect x="40" y="326" width="320" height="150" rx="8" fill="#e9f2f2" stroke="#5a6b6b" stroke-width="3"/>
      <path d="M40 396 H360" stroke="#5a6b6b" stroke-width="2"/>${pastry}
      <rect x="380" y="330" width="280" height="150" fill="#00000012"/><path d="M420 330 V480 M520 330 V480 M620 330 V480" stroke="#00000020" stroke-width="2"/>
      ${has('spill')
        ? `<path d="M425 302 q10 -18 40 -14 q34 -8 56 6 q18 12 -6 24 q-30 12 -58 4 q-34 2 -32 -20z" fill="#5b3a22" opacity=".85"/><path d="M470 314 q4 10 2 20" stroke="#5b3a22" stroke-width="3" opacity=".7"/><ellipse cx="420" cy="296" rx="16" ry="5" fill="#5b3a22" opacity=".5"/>`
        : `<path d="M430 298 h90" stroke="#fff" stroke-opacity=".35" stroke-width="3"/><path d="M450 306 h50" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`}
      <rect x="690" y="356" width="76" height="118" rx="8" fill="#6c7678"/><rect x="684" y="350" width="88" height="10" rx="3" fill="#5a6466"/>
      ${has('bin_overflow')
        ? `<g><circle cx="708" cy="338" r="16" fill="#e8e1d4"/><circle cx="738" cy="332" r="18" fill="#f7f3ea"/><path d="M716 352 l14 -34 l22 30z" fill="#d7c9a6"/><circle cx="756" cy="344" r="12" fill="#c8bda6"/><path d="M690 345 l-10 22 l22 -6z" fill="#e8e1d4"/><g transform="rotate(60 676 392)"><path d="M662 384 h28 l-4 14 h-20z" fill="#f6efe2" stroke="#c7b48f"/></g></g>`
        : `<path d="M700 372 h56" stroke="#9aa5a7" stroke-width="3"/>`}
      <rect x="708" y="404" width="40" height="24" rx="3" fill="#8e989a"/><text x="728" y="421" text-anchor="middle" font-size="11" font-weight="700" fill="#fff" font-family="Inter,Arial">WASTE</text>`;
    return {
      svg,
      boxes: {
        menu_old: [60, 30, 290, 190],
        cups_off: [380, 70, 300, 90],
        pastry_off: [40, 326, 320, 150],
        spill: [418, 280, 124, 46],
        bin_overflow: [676, 316, 104, 164],
        no_apron: [372, 128, 76, 170],
      },
    };
  }

  /* ---------- DINING ---------- */
  function dining(d) {
    const has = (i) => d.includes(i);
    const table = (cx, cy, k) => {
      const dirty = has('tables_unwiped') && k !== 2;
      return `<g><ellipse cx="${cx}" cy="${cy + 70}" rx="46" ry="9" fill="#00000022"/><rect x="${cx - 6}" y="${cy + 6}" width="12" height="64" fill="#4a3a2c"/>
        <ellipse cx="${cx}" cy="${cy}" rx="72" ry="22" fill="#d9b88a"/><ellipse cx="${cx}" cy="${cy - 3}" rx="72" ry="22" fill="#e8cfa6"/>
        ${dirty
          ? `<ellipse cx="${cx - 24}" cy="${cy - 4}" rx="12" ry="4" fill="none" stroke="#7a4f2a" stroke-width="2" opacity=".7"/><ellipse cx="${cx + 14}" cy="${cy - 2}" rx="18" ry="5" fill="#7a4f2a" opacity=".35"/><path d="M${cx + 30} ${cy - 14} h16 l-3 12 h-10z" fill="#f6efe2" stroke="#c7b48f"/><path d="M${cx - 44} ${cy} h6 m10 -4 h5 m6 9 h6" stroke="#b78a52" stroke-width="3"/><path d="M${cx - 8} ${cy - 12} l14 -3 l3 10 l-14 3z" fill="#fff" opacity=".9"/>`
          : `<rect x="${cx - 8}" y="${cy - 16}" width="16" height="14" rx="2" fill="${G2}"/>${leaf(cx, cy - 22, .35, '#7fd1a8')}<path d="M${cx - 40} ${cy - 3} h18" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`}
        <g fill="#6f4f33"><rect x="${cx - 104}" y="${cy + 14}" width="26" height="8" rx="3"/><rect x="${cx - 100}" y="${cy + 22}" width="4" height="46"/><rect x="${cx + 78}" y="${cy + 14}" width="26" height="8" rx="3"/><rect x="${cx + 96}" y="${cy + 22}" width="4" height="46"/></g></g>`;
    };
    const stand = has('seasonal_missing')
      ? `<rect x="42" y="112" width="116" height="188" rx="4" fill="#d6c3a2"/><path d="M42 172 H158 M42 236 H158" stroke="#a88f68" stroke-width="5"/><rect x="52" y="84" width="96" height="24" rx="3" fill="#bfae8c"/><text x="100" y="101" text-anchor="middle" font-size="9" font-weight="700" fill="#7b6a4c" font-family="Inter,Arial">COMING SOON</text><path d="M60 150 h20 M110 214 h24" stroke="#c4b18e" stroke-width="2"/><circle cx="130" cy="290" r="5" fill="#cdbb99"/>`
      : `<rect x="42" y="112" width="116" height="188" rx="4" fill="#d6c3a2"/><path d="M42 172 H158 M42 236 H158" stroke="#a88f68" stroke-width="5"/><rect x="52" y="84" width="96" height="24" rx="3" fill="#a3361f"/><text x="100" y="101" text-anchor="middle" font-size="9" font-weight="800" fill="${CREAM}" font-family="Inter,Arial">FESTIVE HAMPERS</text>
         ${['#a3361f', '#f0b429', G2, '#c47a34', '#7a3b2e', '#e1b06a'].map((c, i) => { const r = Math.floor(i / 2), col = i % 2; return `<rect x="${54 + col * 50}" y="${126 + r * 64 - (r ? 0 : 0)}" width="42" height="40" rx="3" fill="${c}"/><rect x="${73 + col * 50}" y="${126 + r * 64}" width="4" height="40" fill="#fff" opacity=".6"/>`; }).join('')}`;
    const ext = `<g><rect x="736" y="186" width="30" height="76" rx="9" fill="#d83a34"/><rect x="744" y="172" width="14" height="16" fill="#222"/><path d="M758 178 q18 4 12 30" stroke="#222" stroke-width="3" fill="none"/><rect x="722" y="150" width="58" height="22" rx="3" fill="#fff"/><text x="751" y="165" text-anchor="middle" font-size="11" font-weight="800" fill="#d83a34" font-family="Inter,Arial">FIRE</text></g>`;
    const crates = has('extinguisher_blocked')
      ? `<g><rect x="694" y="262" width="92" height="64" fill="#b78a52" stroke="#8c6636" stroke-width="2"/><rect x="706" y="212" width="78" height="52" fill="#c89a5c" stroke="#8c6636" stroke-width="2"/><path d="M694 280 H786 M706 230 H784" stroke="#8c6636" stroke-width="3"/><text x="740" y="302" text-anchor="middle" font-size="13" font-weight="800" fill="#6e4d22" font-family="Inter,Arial">STOCK</text></g>`
      : '';
    const debris = has('floor_debris')
      ? `<g fill="#fff" stroke="#d6cdb8"><path d="M96 458 l16 -6 l8 12 l-14 8z"/><path d="M180 470 l12 -4 l5 10 l-12 4z"/><path d="M240 452 l14 3 l-2 12 l-12 -3z"/></g><g fill="#a9743f"><circle cx="140" cy="480" r="3"/><circle cx="150" cy="486" r="2.5"/><circle cx="130" cy="474" r="2"/><circle cx="214" cy="488" r="3"/><circle cx="224" cy="482" r="2"/><circle cx="64" cy="468" r="2.5"/></g><ellipse cx="170" cy="458" rx="26" ry="6" fill="#7a4f2a" opacity=".3"/>`
      : '';
    const planks = Array.from({ length: 8 }, (_, i) => `<path d="M0 ${330 + i * 22} H800" stroke="#00000015" stroke-width="2"/>`).join('');
    const svg = `
      <rect width="800" height="500" fill="#f4ecdf"/>
      <rect y="300" width="800" height="200" fill="#c79e6b"/>${planks}
      <rect x="240" y="40" width="320" height="200" rx="6" fill="${G}"/><rect x="250" y="50" width="300" height="180" fill="#cfe6ee"/><path d="M250 190 h40 v-50 h30 v60 h40 v-90 h34 v90 h36 v-40 h38 v40 h42 v30 h-260z" fill="#9fbfcd"/><path d="M400 50 V230 M250 140 H550" stroke="${G}" stroke-width="5"/>
      <rect x="0" y="288" width="800" height="14" fill="#e3d7c2"/>
      ${stand}${ext}${crates}
      ${table(190, 372, 1)}${table(420, 404, 2)}${table(630, 372, 3)}
      ${debris}`;
    return {
      svg,
      boxes: {
        seasonal_missing: [36, 80, 128, 226],
        tables_unwiped: [300, 372, 250, 60],
        floor_debris: [62, 440, 220, 56],
        extinguisher_blocked: [690, 146, 102, 184],
      },
    };
  }

  /* ---------- BACK OF HOUSE ---------- */
  function back(d) {
    const has = (i) => d.includes(i);
    let tiles = '';
    for (let x = 0; x < 800; x += 50) tiles += `<path d="M${x} 0 V330" stroke="#c9d6da" stroke-width="2"/>`;
    for (let y = 0; y < 330; y += 50) tiles += `<path d="M0 ${y} H800" stroke="#c9d6da" stroke-width="2"/>`;
    const soap = has('handwash_nosoap')
      ? `<rect x="290" y="206" width="38" height="74" rx="8" fill="#e5e9ea" stroke="#9aa8ac" stroke-width="2"/><rect x="298" y="216" width="22" height="30" rx="3" fill="#fff"/><circle cx="309" cy="262" r="6" fill="#e5484d"/><rect x="304" y="280" width="10" height="14" fill="#9aa8ac"/><path d="M300 232 h18" stroke="#c7ced0" stroke-width="3"/>`
      : `<rect x="290" y="206" width="38" height="74" rx="8" fill="#e5e9ea" stroke="#9aa8ac" stroke-width="2"/><rect x="298" y="216" width="22" height="30" rx="3" fill="#bde7d5"/><circle cx="309" cy="262" r="6" fill="#2fa36b"/><rect x="304" y="280" width="10" height="14" fill="#9aa8ac"/><path d="M300 232 h18" stroke="#2fa36b" stroke-width="3"/>`;
    const pest = has('pest_log')
      ? `<rect x="508" y="88" width="144" height="146" rx="4" fill="#a98558" stroke="#7a5b37" stroke-width="4"/><rect x="520" y="100" width="120" height="122" fill="#c9a877"/><circle cx="545" cy="130" r="2" fill="#7a5b37"/><circle cx="600" cy="168" r="2" fill="#7a5b37"/><circle cx="576" cy="196" r="2" fill="#7a5b37"/><text x="580" y="214" text-anchor="middle" font-size="9" fill="#7a5b37" font-family="Inter,Arial">no document on display</text>`
      : `<rect x="508" y="88" width="144" height="146" rx="4" fill="#a98558" stroke="#7a5b37" stroke-width="4"/><rect x="520" y="100" width="120" height="122" fill="#fff"/><text x="580" y="116" text-anchor="middle" font-size="8.5" font-weight="800" fill="${G}" font-family="Inter,Arial">PEST CONTROL SERVICE LOG</text>${Array.from({ length: 6 }, (_, i) => `<path d="M528 ${130 + i * 15} h104" stroke="#cfd8da"/><path d="M${532 + (i % 2) * 2} ${134 + i * 15} l3 3 l6 -7" stroke="#2fa36b" stroke-width="2" fill="none"/>`).join('')}<circle cx="580" cy="96" r="4" fill="#d83a34"/>`;
    const dirtyApron = has('uniform_stained')
      ? `<path d="M676 300 q18 -8 38 0 l4 110 h-46z" fill="#fafafa"/><path d="M660 330 q20 14 46 6 q8 26 -10 40 q-30 10 -40 -14z" fill="#8a5a2b" opacity=".75"/><ellipse cx="722" cy="384" rx="12" ry="8" fill="#b4781f" opacity=".65"/><path d="M646 300 h108 v-12 q-54 -14 -108 0z" fill="#fff"/>`
      : '';
    const staff = `<g><circle cx="700" cy="262" r="26" fill="#d7a77f"/><path d="M672 254 q28 -32 56 0 q-28 -10 -56 0z" fill="${G}"/>
      <rect x="656" y="292" width="88" height="148" rx="16" fill="${has('uniform_stained') ? '#f4f6f4' : '#f4f6f4'}"/>
      ${has('uniform_stained') ? '' : `<path d="M668 304 h64 v136 h-64z" fill="${G2}"/><rect x="686" y="344" width="28" height="18" rx="3" fill="${G}"/><circle cx="688" cy="322" r="4" fill="#7fd1a8"/>`}
      ${has('uniform_stained') ? `<path d="M668 304 h64 v136 h-64z" fill="#eceee9"/><path d="M670 340 q18 -8 40 4 q10 30 -6 50 q-30 8 -36 -14z" fill="#8a5a2b" opacity=".7"/><ellipse cx="724" cy="402" rx="12" ry="9" fill="#b4781f" opacity=".65"/><circle cx="688" cy="322" r="4" fill="#7fd1a8"/>` : ''}
      <rect x="664" y="436" width="30" height="58" fill="#34414a"/><rect x="706" y="436" width="30" height="58" fill="#34414a"/></g>`;
    const svg = `
      <rect width="800" height="500" fill="#e8eff1"/>${tiles}
      <rect y="330" width="800" height="170" fill="#a9b2b6"/><path d="M0 400 H800 M0 470 H800" stroke="#00000014"/>
      <rect x="40" y="56" width="400" height="80" fill="#cfd8da"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${52 + i * 48}" y="66" width="38" height="60" rx="4" fill="${['#e8e1d4', '#dfe9e2', '#e7e0cf'][i % 3]}" stroke="#9aa8ac"/><rect x="${57 + i * 48}" y="80" width="28" height="12" fill="#fff" opacity=".8"/>`).join('')}
      <rect x="110" y="136" width="170" height="34" rx="4" fill="#fff"/><text x="195" y="153" text-anchor="middle" font-size="12" font-weight="800" fill="#1a6fb0" font-family="Inter,Arial">WASH HANDS</text><text x="195" y="165" text-anchor="middle" font-size="8.5" fill="#667" font-family="Inter,Arial">20 seconds - soap &amp; water</text>
      ${soap}
      <rect x="60" y="296" width="400" height="14" rx="3" fill="#cfd5d8"/><rect x="70" y="310" width="8" height="150" fill="#aab3b6"/><rect x="442" y="310" width="8" height="150" fill="#aab3b6"/><rect x="70" y="404" width="380" height="8" fill="#bcc4c7"/>
      <rect x="130" y="270" width="140" height="28" rx="4" fill="#8fa0a6"/><rect x="142" y="278" width="116" height="16" fill="#6f8187"/><path d="M200 270 v-26 q0 -10 10 -10 h22" stroke="#7d8d93" stroke-width="7" fill="none"/>
      ${pest}${staff}${dirtyApron}`;
    return {
      svg,
      boxes: {
        handwash_nosoap: [104, 130, 232, 170],
        pest_log: [500, 80, 160, 160],
        uniform_stained: [646, 232, 112, 262],
      },
    };
  }

  const ILLUSTRATED = { storefront, counter, dining, back };
  const LABELS = { storefront: 'Storefront & signage', counter: 'Service counter', dining: 'Dining floor', back: 'Staff & billing' };

  /* Real photographs (Unsplash licence). Boxes are in the 800x500 frame of each photo. */
  const PHOTO = {
    storefront: { src: 'assets/img/storefront.jpg', boxes: { sign_unlit: [705, 25, 95, 110], promo_old: [590, 194, 38, 54], logo_blocked: [458, 318, 145, 182] } },
    counter: { src: 'assets/img/counter.jpg', boxes: { menu_old: [72, 38, 135, 305], cups_off: [225, 205, 225, 55], pastry_off: [295, 410, 505, 90], spill: [290, 372, 330, 36] } },
    dining: { src: 'assets/img/dining.jpg', boxes: { seasonal_missing: [62, 318, 245, 72], tables_unwiped: [575, 350, 225, 72], floor_debris: [150, 428, 210, 72], bin_overflow: [0, 380, 92, 120], handwash_nosoap: [303, 284, 76, 54], extinguisher_blocked: [598, 190, 92, 130] } },
    back: { src: 'assets/img/back.jpg', boxes: { no_apron: [0, 140, 232, 350], uniform_stained: [18, 190, 170, 160], pest_log: [440, 18, 100, 150] } },
  };
  const DRAW = {};
  Object.keys(PHOTO).forEach((k) => (DRAW[k] = (d) => ({ svg: `<image href="${PHOTO[k].src}" x="0" y="0" width="800" height="500" preserveAspectRatio="xMidYMid slice"/>`, boxes: PHOTO[k].boxes })));
  const BOXES = {};
  Object.keys(PHOTO).forEach((k) => (BOXES[k] = PHOTO[k].boxes));

  /* opts: {detect:'fails'|'all'|'none', labels:bool, findings: {vid:{short,conf}}, vsupport} */
  function render(scene, defects, opts) {
    opts = opts || {};
    const s = DRAW[scene](defects || []);
    let overlay = '';
    const meta = opts.meta || {};
    let n = 0;
    if (opts.detect && opts.detect !== 'none') {
      Object.keys(s.boxes).forEach((vid) => {
        const fail = (defects || []).includes(vid);
        if (!fail && opts.detect !== 'all') return;
        const [x, y, w, h] = s.boxes[vid];
        const col = fail ? '#ff4d4f' : '#2fbf7a';
        overlay += `<g class="det ${fail ? 'det-fail' : 'det-pass'}" data-vid="${vid}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-width="3" ${fail ? 'stroke-dasharray="0"' : 'stroke-dasharray="9 6"'}/>`;
        if (opts.numbers && fail) { n++; overlay += `<circle cx="${x + 6}" cy="${y + 6}" r="21" fill="#ff4d4f" stroke="#fff" stroke-width="4"/><text x="${x + 6}" y="${y + 14}" text-anchor="middle" font-size="24" font-weight="800" fill="#fff" font-family="Inter,Arial,sans-serif">${n}</text>`; }
        if (opts.labels) {
          const m = meta[vid] || {};
          const txt = (m.short || vid) + (m.conf ? '  ' + Math.round(m.conf * 100) + '%' : '');
          const tw = txt.length * 9.4 + 18;
          const ty = y > 30 ? y - 28 : y + h + 4;
          const tx = Math.max(4, Math.min(x, 796 - tw));
          overlay += `<rect x="${tx}" y="${ty}" width="${tw}" height="25" rx="5" fill="${col}"/><text x="${tx + 9}" y="${ty + 17.5}" font-size="14.5" font-weight="700" fill="#fff" font-family="Inter,Arial,sans-serif">${fail ? '' : '✓ '}${txt}</text>`;
        }
        overlay += '</g>';
      });
    }
    const id = 'sc' + Math.random().toString(36).slice(2, 7);
    return `<svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" class="scene-svg" role="img" aria-label="${LABELS[scene]} photo" xmlns="http://www.w3.org/2000/svg">${s.svg.replace(/sf-sky|sf-glass/g, (m) => m + id)}${overlay}</svg>`;
  }

  window.Scenes = { render, boxes: BOXES, labels: LABELS, keys: Object.keys(DRAW), support: Object.fromEntries(Object.keys(BOXES).map((k) => [k, Object.keys(BOXES[k])])) };
})();
