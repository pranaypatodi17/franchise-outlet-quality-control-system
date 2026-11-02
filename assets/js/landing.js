(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  hydrateIcons();

  /* nav */
  const nav = $('#nav');
  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 8), { passive: true });
  $('#burger').onclick = () => nav.classList.toggle('open');
  $$('.nav-links a').forEach((a) => (a.onclick = () => nav.classList.remove('open')));

  /* reveal on scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));

  /* hero photo */
  const META = {
    spill: { short: 'Spill on counter', conf: 0.94 }, bin_overflow: { short: 'Bin overflowing', conf: 0.96 },
    menu_old: { short: 'Menu prices outdated', conf: 0.91 }, cups_off: { short: 'Cup stacks misaligned', conf: 0.88 },
    no_apron: { short: 'Apron not worn', conf: 0.93 }, pastry_off: { short: 'Off-planogram', conf: 0.87 },
  };
  $('#heroPhoto').innerHTML = Scenes.render('counter', ['spill', 'bin_overflow'], { detect: 'fails', numbers: true });

  /* interactive demo */
  const DEMOS = {
    storefront: { defects: ['sign_unlit', 'promo_old', 'logo_blocked'], f: [['sign_unlit', 'Fascia sign partly unlit', 'Branding · Major', 94], ['promo_old', 'Expired promo poster', 'Branding · Minor', 89], ['logo_blocked', 'Brand plaque obstructed', 'Branding · Minor', 91]] },
    counter: { defects: ['spill', 'bin_overflow', 'cups_off', 'no_apron'], f: [['bin_overflow', 'Bin overflowing', 'Cleanliness · Critical', 96], ['spill', 'Spill on counter', 'Cleanliness · Major', 94], ['no_apron', 'Apron not worn', 'Staff · Minor', 93], ['cups_off', 'Cup stacks misaligned', 'Display · Minor', 88]] },
    dining: { defects: ['extinguisher_blocked', 'tables_unwiped', 'floor_debris', 'seasonal_missing'], f: [['extinguisher_blocked', 'Extinguisher blocked', 'Safety · Critical', 97], ['seasonal_missing', 'Seasonal display missing', 'Display · Major', 90], ['tables_unwiped', 'Tables not wiped', 'Cleanliness · Minor', 86], ['floor_debris', 'Debris on floor', 'Cleanliness · Minor', 84]] },
    back: { defects: ['handwash_nosoap', 'pest_log'], f: [['handwash_nosoap', 'Hand-wash soap empty', 'Cleanliness · Critical', 95], ['pest_log', 'Pest-control log missing', 'Safety · Major', 92]] },
  };
  const DM = {};
  Object.values(DEMOS).forEach((d) => d.f.forEach((f) => (DM[f[0]] = { short: f[1], conf: f[3] / 100 })));
  let cur = 'counter', busy = false;
  const photo = $('#demoPhoto');
  function drawDemo(detect) {
    const scan = $('#scan');
    photo.innerHTML = Scenes.render(cur, DEMOS[cur].defects, { detect: detect ? 'fails' : 'none', labels: true, meta: DM });
    photo.appendChild(scan);
  }
  function tabs() {
    $('#demoTabs').innerHTML = Scenes.keys.map((k) => `<button data-k="${k}" class="${k === cur ? 'on' : ''}">${Scenes.labels[k]}</button>`).join('');
    $$('#demoTabs button').forEach((b) => (b.onclick = () => { if (busy) return; cur = b.dataset.k; tabs(); drawDemo(false); $('#findings').innerHTML = `<div style="color:#9db3aa;font-size:14px;padding:6px 2px">Press <b style="color:#fff">Analyse photo</b> to run the AI check on this photo.</div>`; }));
  }
  function run() {
    if (busy) return; busy = true;
    const btn = $('#runDemo'); btn.disabled = true; btn.lastChild.textContent = ' Analysing…';
    drawDemo(false);
    const scan = $('#scan'); scan.classList.remove('run'); void scan.offsetWidth; scan.classList.add('run');
    const list = $('#findings'); list.innerHTML = '';
    setTimeout(() => {
      drawDemo(true);
      DEMOS[cur].f.forEach((f, i) => setTimeout(() => {
        list.insertAdjacentHTML('beforeend', `<div class="finding"><span class="dot"></span><div><b>${f[1]}</b><span>${f[2]}</span></div><em>${f[3]}%</em></div>`);
        if (i === DEMOS[cur].f.length - 1) {
          setTimeout(() => { list.insertAdjacentHTML('beforeend', `<div class="finding ok"><span class="dot"></span><div><b>${DEMOS[cur].f.length} corrective tasks created</b><span>Assigned to the outlet manager · due in 2–10 days</span></div></div>`); btn.disabled = false; btn.lastChild.textContent = ' Analyse again'; busy = false; }, 450);
        }
      }, 420 * (i + 1)));
    }, 1650);
  }
  $('#runDemo').onclick = run;
  tabs(); drawDemo(false);
  $('#findings').innerHTML = `<div style="color:#9db3aa;font-size:14px;padding:6px 2px">Press <b style="color:#fff">Analyse photo</b> to run the AI check on this photo.</div>`;

  /* industries */
  const IND = [
    { k: 'Restaurants & cafés', i: 'fork', h: 'Consistent plates, clean floors, safe kitchens.', p: 'Check presentation, hygiene and brand execution across dine-in, takeaway and cloud kitchens without a food-safety auditor in every city.', it: [['Plating & presentation', 'Compare dishes and counters to your reference photos'], ['Kitchen hygiene', 'Hand-wash stations, surfaces, bins, pest logs'], ['Menu & promo accuracy', 'Right prices, right campaign, right placement'], ['Uniform & grooming', 'Aprons, caps, gloves and badges on shift']] },
    { k: 'Retail franchises', i: 'cart', h: 'Planogram compliance, without the clipboard.', p: 'Verify shelf layouts, price tags and visual merchandising at every store, and catch empty facings or off-brand displays within hours.', it: [['Planogram & facings', 'Detect gaps, wrong products and wrong shelves'], ['Price tags & offers', 'Promotional signage matches the live campaign'], ['Window & entrance', 'Hero displays, lighting and storefront cleanliness'], ['Stockroom & safety', 'Aisle clearance, fire exits, extinguishers']] },
    { k: 'Salons & spas', i: 'scissors', h: 'Premium experience, every chair, every city.', p: 'Make sure stations, towel services and reception look the way your brand promises, no matter who is on shift.', it: [['Station readiness', 'Sanitised tools, fresh towels, tidy counters'], ['Reception & retail', 'Product walls, branded signage, queue area'], ['Hygiene controls', 'Sterilisers, waste bins, wet-area safety'], ['Staff presentation', 'Uniforms, name tags and grooming standards']] },
    { k: 'Education centres', i: 'book', h: 'Same classroom standard in every centre.', p: 'Keep branding, safety and learning environments consistent across franchise centres, and prove it to parents and regulators.', it: [['Classroom setup', 'Seating layout, boards, display of materials'], ['Branding & notice boards', 'Approved posters, certificates, fee notices'], ['Safety compliance', 'Fire exits, CCTV signage, first-aid kits'], ['Washrooms & common areas', 'Cleanliness and supply checks']] },
  ];
  let ii = 0;
  function ind() {
    $('#indTabs').innerHTML = IND.map((x, i) => `<button class="${i === ii ? 'on' : ''}" data-i="${i}">${ic(x.i)}${x.k}</button>`).join('');
    const x = IND[ii];
    $('#indPanel').innerHTML = `<h3>${x.h}</h3><p>${x.p}</p><div class="ind-grid">${x.it.map((t) => `<div class="ind-item"><b>${t[0]}</b><span>${t[1]}</span></div>`).join('')}</div>`;
    $$('#indTabs button').forEach((b) => (b.onclick = () => { ii = +b.dataset.i; ind(); }));
  }
  ind();

  /* pricing */
  let bill = 'm';
  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const rate = (n) => (n <= 10 ? 1499 : n <= 50 ? 1199 : 899) * (bill === 'y' ? 0.8 : 1);
  function plans() {
    const f = (x) => fmt(x * (bill === 'y' ? 0.8 : 1));
    const li = (a) => a.map((t) => `<li>${ic('check')}${t}</li>`).join('');
    $('#plans').innerHTML = `
      <div class="plan"><h3>Starter</h3><div class="sub">For growing brands with up to 10 outlets.</div><div class="amt">${f(1499)}<small> / outlet / month</small></div><ul>${li(['Up to 10 outlets', 'Weekly guided inspections', 'AI branding & cleanliness checks', 'Corrective task tracking', 'Email support'])}</ul><button class="btn" data-demo>Start free trial</button></div>
      <div class="plan pop"><h3>Growth</h3><div class="sub">For multi-city networks that need benchmarking and control.</div><div class="amt">${f(1199)}<small> / outlet / month</small></div><ul>${li(['11–50 outlets', 'Everything in Starter', 'AI fix re-verification', 'Outlet comparison & repeat-violation analytics', 'Custom standards with reference images', 'WhatsApp task reminders', 'Priority support'])}</ul><button class="btn btn-primary" data-demo>Book a demo</button></div>
      <div class="plan"><h3>Enterprise</h3><div class="sub">For 50+ outlets, franchisee hierarchies and compliance needs.</div><div class="amt">${f(899)}<small> / outlet / month</small></div><ul>${li(['Volume pricing from 51 outlets', 'SSO, audit logs & role hierarchy', 'API & BI export', 'Custom model tuning', 'Dedicated success manager', '99.9% uptime SLA'])}</ul><button class="btn" data-demo>Talk to sales</button></div>`;
    bind();
  }
  function calc() {
    const n = +$('#outletRange').value, r = rate(n);
    $('#calcTotal').textContent = fmt(n * r) + ' /mo';
    $('#calcNote').textContent = `${n} outlets × ${fmt(r)} per outlet · ${n <= 10 ? 'Starter' : n <= 50 ? 'Growth' : 'Enterprise'} tier${bill === 'y' ? ' · billed annually' : ''}`;
  }
  $$('#billSeg button').forEach((b) => (b.onclick = () => { bill = b.dataset.b; $$('#billSeg button').forEach((x) => x.classList.toggle('on', x === b)); plans(); calc(); }));
  $('#outletRange').oninput = calc;

  /* demo modal + toast */
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic('check') + `<span>${msg}</span>`; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200); }
  function modal() {
    const o = document.createElement('div'); o.className = 'overlay';
    o.innerHTML = `<form class="modal" role="dialog" aria-modal="true" aria-label="Book a demo"><div class="modal-h"><div><h3>Book a 20-minute demo</h3><p class="muted" style="margin-top:6px">We'll walk through Plumb using your own checklist. No slides.</p></div><button type="button" class="x" aria-label="Close">${ic('x')}</button></div>
    <div class="modal-b" style="display:grid;gap:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="f">Your name<input class="input" required placeholder="Priya Sharma"></label><label class="f">Work email<input class="input" type="email" required placeholder="priya@brand.com"></label></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="f">Company<input class="input" required placeholder="Brand name"></label><label class="f">Number of outlets<select class="select"><option>3–10</option><option>11–50</option><option>51–200</option><option>200+</option></select></label></div>
      <label class="f">Industry<select class="select"><option>Restaurant / café</option><option>Retail</option><option>Salon / spa</option><option>Education centres</option><option>Other</option></select></label>
    </div>
    <div class="modal-f"><button type="button" class="btn" data-close>Cancel</button><button class="btn btn-primary">Request demo</button></div></form>`;
    document.body.appendChild(o);
    const close = () => o.remove();
    o.onclick = (e) => { if (e.target === o) close(); };
    $('.x', o).onclick = close; $('[data-close]', o).onclick = close;
    $('form', o).onsubmit = (e) => { e.preventDefault(); close(); toast("Thanks — we'll email you within one working day to confirm a time."); };
    $('input', o).focus();
  }
  function bind() { $$('[data-demo]').forEach((b) => (b.onclick = modal)); }
  addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.overlay').forEach((o) => o.remove()); });
  plans(); calc(); bind();
})();
