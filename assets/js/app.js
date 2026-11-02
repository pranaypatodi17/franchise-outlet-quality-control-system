(function () {
  'use strict';
  const Q = QC;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const view = $('#view');
  const NOW = Q.today;
  const SEVORD = { critical: 0, major: 1, minor: 2 };

  /* ---------- storage ---------- */
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('plumb.' + k)) ?? d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('plumb.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  };
  const overrides = store.get('tasks', {});
  Object.entries(overrides).forEach(([id, o]) => {
    const t = Q.TASKS.find((x) => x.id === id); if (!t) return;
    t.status = o.status; if (o.resolved) t.resolved = new Date(o.resolved); if (o.assignee) t.assignee = o.assignee;
    (o.events || []).forEach((e) => t.events.push({ at: new Date(e.at), text: e.text }));
  });
  const saveTask = (t, ev) => {
    const o = overrides[t.id] || (overrides[t.id] = { events: [] });
    o.status = t.status; o.assignee = t.assignee; if (t.resolved) o.resolved = t.resolved;
    if (ev) o.events.push({ at: new Date(), text: ev });
    store.set('tasks', overrides);
  };
  const addEvent = (t, text) => { t.events.push({ at: new Date(), text }); saveTask(t, text); };

  /* submitted-from-this-browser inspections */
  (store.get('newins', [])).forEach((s) => { s.date = new Date(s.date); s.photos = Scenes.keys.map((sc) => ({ scene: sc, defects: s.fails.filter((f) => Q.VIOL[f].scene === sc) })); addInspection(s, true); });
  function addInspection(ins, silent) {
    Q.INSPECTIONS.unshift(ins); Q.INS[ins.id] = ins;
    ins.fails.forEach((vid) => {
      const exists = Q.TASKS.find((t) => t.outlet === ins.outlet && t.vid === vid && t.status !== 'resolved');
      if (exists) { exists.recur++; return; }
      const sev = Q.VIOL[vid].sev;
      const t = { id: 'T-' + (2800 + Q.TASKS.length), outlet: ins.outlet, vid, sev, title: Q.VIOL[vid].task, created: ins.date, due: new Date(ins.date.getTime() + Q.SEV[sev].sla * Q.DAY), inspection: ins.id, assignee: Q.OUT[ins.outlet].manager, status: 'open', recur: 1, events: [{ at: ins.date, text: 'Created from ' + ins.id + ' (AI detection)' }] };
      Q.TASKS.push(t);
    });
    Q.TASKS.sort((a, b) => a.due - b.due);
  }

  /* ---------- helpers ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dShort = (d) => d.getDate() + ' ' + MON[d.getMonth()];
  const tShort = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  const ago = (d) => { if (d > NOW && d - NOW < Q.DAY) return 'today'; const dd = Math.round((NOW - d) / Q.DAY); return dd <= 0 ? 'today' : dd === 1 ? 'yesterday' : dd + ' days ago'; };
  const initials = (n) => n.split(' ').map((x) => x[0]).slice(0, 2).join('');
  const scCls = (s) => (s >= 85 ? 'g' : s >= 75 ? 'y' : 'r');
  const hv = (s) => (s >= 85 ? 'hv-g' : s >= 70 ? 'hv-y' : 'hv-r');
  const avg = (a) => a.reduce((x, y) => x + y, 0) / (a.length || 1);
  const sevBadge = (s) => `<span class="badge ${s === 'critical' ? 'b-crit' : s === 'major' ? 'b-warn' : 'b-info'} plain">${Q.SEV[s].label}</span>`;
  const colors = ['#0e7c66', '#6d5bd0', '#e08a1e', '#2f7de1', '#d6455d'];
  const AV = ['#0e7c66', '#2f7de1', '#6d5bd0', '#cf7b0f', '#d6455d', '#0891b2'];
  const avc = (n) => AV[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length];
  const av = (n, sz) => `<div class="avatar" style="background:${avc(n)};${sz ? `width:${sz}px;height:${sz}px;font-size:${sz / 2.7}px` : ''}">${initials(n)}</div>`;
  const tstate = (t) => (t.status === 'resolved' ? 'resolved' : t.due < NOW ? 'overdue' : t.status);
  const STLAB = { open: 'Open', progress: 'In progress', review: 'Awaiting verification', resolved: 'Resolved', overdue: 'Overdue' };
  const stBadge = (t) => { const s = tstate(t); return `<span class="badge ${{ open: 'b-info', progress: 'b-warn', review: 'b-brand', resolved: 'b-good', overdue: 'b-bad' }[s]}">${STLAB[s]}</span>`; };
  const dueTxt = (t) => { if (t.status === 'resolved') return 'Resolved ' + ago(t.resolved || t.due); const d = Math.ceil((t.due - NOW) / Q.DAY); return d < 0 ? `<span class="down" style="font-weight:700">Overdue ${-d}d</span>` : d === 0 ? 'Due today' : 'Due in ' + d + 'd'; };
  const outletScore = (o) => Q.latestIns(o).score;
  const scoreDelta = (o) => { const s = Q.series(o); return s[s.length - 1] - avg(s.slice(-5, -1)); };
  const metaFor = (ins) => { const m = {}; ins.fails.forEach((f, i) => (m[f] = { short: Q.VIOL[f].short, conf: 0.84 + ((f.length * 7 + i * 3 + ins.id.length) % 14) / 100 })); Q.VIDS.forEach((f) => { if (!m[f]) m[f] = { short: Q.VIOL[f].short, conf: 0.9 }; }); return m; };
  const toast = (msg, ico) => { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = ic(ico || 'check') + `<span>${msg}</span>`; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 4200); };
  const rg = (a, b) => a + Math.random() * (b - a);

  /* ---------- charts ---------- */
  function lineChart(series, o) {
    o = o || {}; const W = o.w || 680, H = o.h || 250, pl = 34, pr = 12, pt = 14, pb = 26;
    const all = series.flatMap((s) => s.data); const mn = o.min != null ? o.min : Math.floor(Math.min(...all, o.target || 100) / 5) * 5 - 5, mx = o.max != null ? o.max : Math.ceil(Math.max(...all) / 5) * 5 + 3;
    const n = series[0].data.length, x = (i) => pl + (i * (W - pl - pr)) / (n - 1), y = (v) => pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb);
    let g = '';
    for (let v = Math.ceil(mn / 5) * 5; v <= mx; v += 5) g += `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="#e8eeea"/><text x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
    (o.labels || []).forEach((l, i) => { if (i % (o.every || 2) === (n - 1) % (o.every || 2)) g += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${l}</text>`; });
    if (o.target) g += `<line x1="${pl}" x2="${W - pr}" y1="${y(o.target)}" y2="${y(o.target)}" stroke="#cf7b0f" stroke-dasharray="5 5"/><text x="${W - pr}" y="${y(o.target) - 6}" text-anchor="end" style="fill:#cf7b0f;font-weight:600">Target ${o.target}</text>`;
    series.forEach((s, k) => {
      const pts = s.data.map((v, i) => [x(i), y(v)]);
      const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
      if (o.area && k === 0) g += `<defs><linearGradient id="ga${o.id || 0}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".22"/><stop offset="1" stop-color="${s.color}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${pts[n - 1][0]} ${H - pb} L${pts[0][0]} ${H - pb}Z" fill="url(#ga${o.id || 0})"/>`;
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${o.thick || 2.5}" stroke-linejoin="round" stroke-linecap="round"/>`;
      if (!o.nodots) g += pts.map((p) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="#fff" stroke="${s.color}" stroke-width="2"/>`).join('');
    });
    g += `<line class="cur" x1="0" x2="0" y1="${pt}" y2="${H - pb}" stroke="#9aaba3" stroke-dasharray="3 3" opacity="0"/>`;
    return `<div class="chart" data-chart='${esc(JSON.stringify({ n, W, pl, pr, series: series.map((s) => ({ name: s.name, color: s.color, data: s.data })), labels: o.labels || [] }))}'><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.aria || 'Trend chart'}">${g}</svg></div>`;
  }
  function wireCharts(root) {
    $$('.chart[data-chart]', root).forEach((c) => {
      const cfg = JSON.parse(c.dataset.chart), svg = $('svg', c), cur = $('.cur', svg);
      const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; c.appendChild(tip);
      svg.addEventListener('mousemove', (e) => {
        const r = svg.getBoundingClientRect(), vx = ((e.clientX - r.left) / r.width) * cfg.W;
        const i = Math.max(0, Math.min(cfg.n - 1, Math.round(((vx - cfg.pl) / (cfg.W - cfg.pl - cfg.pr)) * (cfg.n - 1))));
        const px = cfg.pl + (i * (cfg.W - cfg.pl - cfg.pr)) / (cfg.n - 1);
        cur.setAttribute('x1', px); cur.setAttribute('x2', px); cur.setAttribute('opacity', 1);
        tip.hidden = false; tip.style.left = (px / cfg.W) * r.width + 'px'; tip.style.top = '20px';
        tip.innerHTML = `<b>${cfg.labels[i] || ''}</b>` + cfg.series.map((s) => `<span style="display:flex;gap:6px;align-items:center"><i style="width:8px;height:8px;border-radius:50%;background:${s.color}"></i>${s.name}: <b style="display:inline">${s.data[i].toFixed(1).replace('.0', '')}</b></span>`).join('');
      });
      svg.addEventListener('mouseleave', () => { tip.hidden = true; cur.setAttribute('opacity', 0); });
    });
  }
  const spark = (data, color) => {
    const W = 96, H = 30, mn = Math.min(...data) - 2, mx = Math.max(...data) + 2, x = (i) => (i * (W - 4)) / (data.length - 1) + 2, y = (v) => H - 3 - ((v - mn) / (mx - mn)) * (H - 6);
    const d = data.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    return `<svg class="spark" viewBox="0 0 ${W} ${H}"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${x(data.length - 1)}" cy="${y(data[data.length - 1])}" r="2.8" fill="${color}"/></svg>`;
  };
  const donut = (v, size, w, color) => { const r = (size - w) / 2, c = 2 * Math.PI * r; return `<div class="donut" style="width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#e7ede9" stroke-width="${w}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color || (v >= 85 ? '#1a9a69' : v >= 75 ? '#e0a02a' : '#d6455d')}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(c * v) / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg><b style="font-size:${size / 3.4}px">${Math.round(v)}</b></div>`; };
  const catBars = (cs) => Q.CATS.map((c) => `<div class="bar"><span>${c.name}</span><div class="tr"><i style="width:${cs[c.id]}%;background:${c.color}"></i></div><b>${Math.round(cs[c.id])}</b></div>`).join('');
  const photoCard = (scene, defects, opt) => `<div style="width:100%;height:100%">${Scenes.render(scene, defects, opt)}</div>`;
  const cropped = (scene, defects, vid, pad) => {
    const b = Scenes.boxes[scene][vid], p = pad == null ? 36 : pad;
    let x = Math.max(0, b[0] - p), y = Math.max(0, b[1] - p), w = Math.min(800 - x, b[2] + p * 2), h = Math.min(500 - y, b[3] + p * 2);
    const r = 16 / 9; if (w / h < r) { const nw = h * r; x = Math.max(0, Math.min(800 - nw, x - (nw - w) / 2)); w = nw; } else { const nh = w / r; y = Math.max(0, Math.min(500 - nh, y - (nh - h) / 2)); h = nh; }
    return Scenes.render(scene, defects, { detect: defects.includes(vid) ? 'fails' : 'all', labels: false }).replace('viewBox="0 0 800 500"', `viewBox="${x} ${y} ${w} ${h}"`);
  };

  /* ---------- role: outlet owner (simple) vs head office (analytics) ---------- */
  const ME = { outlet: 'bom-pw', name: 'Neha Kulkarni' };
  let ROLE = store.get('role', 'owner');
  const isOwner = () => ROLE === 'owner';
  const grade = (sc) => (sc >= 90 ? { k: 'g', w: 'Excellent', h: 'Your outlet is looking great', i: 'check' } : sc >= 80 ? { k: 'g', w: 'Good', h: 'Your outlet is in good shape', i: 'check' } : sc >= 70 ? { k: 'y', w: 'Needs work', h: 'A few things need your attention', i: 'alert' } : { k: 'r', w: 'Urgent', h: 'Your outlet needs help this week', i: 'alert' });
  const priLab = (sev) => ({ critical: ['u', 'Urgent'], major: ['i', 'Important'], minor: ['q', 'Quick fix'] }[sev]);
  function renderTop() {
    document.body.dataset.role = ROLE;
    $$('#roleSw button').forEach((b) => b.classList.toggle('on', b.dataset.r === ROLE));
    const o = Q.OUT[ME.outlet];
    $('#me').innerHTML = isOwner() ? `${av(ME.name, 34)}<span style="line-height:1.2"><b style="font-size:13.5px;display:block">${ME.name}</b><small class="muted">Manager · ${o.name.split(' ')[0]}</small></span>` : `<div class="avatar">RK</div><span style="line-height:1.2"><b style="font-size:13.5px;display:block">Rhea Kapoor</b><small class="muted">Head of Retail Ops</small></span>`;
    $('#coSub').textContent = isOwner() ? o.name : '18 outlets · 4 regions';
  }
  $$('#roleSw button').forEach((b) => (b.onclick = () => { ROLE = b.dataset.r; store.set('role', ROLE); location.hash = isOwner() ? '#/home' : '#/overview'; render(); }));

  /* ---------- shell ---------- */
  const NAV = [['overview', 'grid', 'Overview'], ['inspections', 'camera', 'Inspections'], ['tasks', 'tasks', 'Corrective tasks'], ['outlets', 'store', 'Outlets'], ['standards', 'list', 'Standards']];
  function renderNav(route) {
    if (isOwner()) {
      const mine = Q.TASKS.filter((t) => t.outlet === ME.outlet && t.status !== 'resolved').length;
      $('#nav').innerHTML = `<div class="nav-sec">My outlet</div>` + [['home', 'grid', 'Home'], ['todo', 'tasks', 'Things to fix'], ['new', 'camera', 'Start weekly check'], ['inspections', 'list', 'Past checks']].map(([id, i, l]) => `<a href="#/${id}" class="${route === id ? 'on' : ''}">${ic(i)}${l}${id === 'todo' && mine ? `<span class="n hot">${mine}</span>` : ''}</a>`).join('');
      return;
    }
    const open = Q.TASKS.filter((t) => t.status !== 'resolved').length, od = Q.TASKS.filter((t) => tstate(t) === 'overdue').length;
    $('#nav').innerHTML = `<div class="nav-sec">Workspace</div>` + NAV.map(([id, i, l]) => `<a href="#/${id}" class="${route === id ? 'on' : ''}">${ic(i)}${l}${id === 'tasks' ? `<span class="n ${od ? 'hot' : ''}">${open}</span>` : ''}</a>`).join('') +
      `<div class="nav-sec">Account</div><a href="#/new" class="${route === 'new' ? 'on' : ''}">${ic('plus')}New inspection</a><a href="#/billing" class="${route === 'billing' ? 'on' : ''}">${ic('card')}Plan &amp; billing</a>`;
  }
  hydrateIcons();
  $('#burger').onclick = () => { $('#side').classList.toggle('open'); $('#scrim').classList.toggle('show'); };
  $('#scrim').onclick = () => { $('#side').classList.remove('open'); $('#scrim').classList.remove('show'); };

  /* notifications */
  const NOTIFS = [['alert', 'var(--bad-l)', 'var(--bad)', 'Critical: Fire extinguisher blocked at Lower Parel', '2h ago · AI confidence 97%'], ['check', 'var(--good-l)', 'var(--good)', 'Koramangala resolved "Bin overflowing" — AI verified', '3h ago'], ['clock', 'var(--warn-l)', 'var(--warn)', '9 tasks are past their deadline', 'Today, 8:00 am'], ['camera', 'var(--info-l)', 'var(--info)', 'Koregaon Park submitted weekly inspection (score 90)', 'Yesterday'], ['repeat', '#f3e8fd', '#6a2c9c', 'Noida Sector 18: "Menu prices outdated" failed 11 of 12 weeks', 'Yesterday']];
  $('#notif').innerHTML = `<div class="pop-h"><span>Notifications</span><a class="link" href="#/tasks">View tasks</a></div>` + NOTIFS.map((n) => `<div class="pop-i"><div class="ico" style="background:${n[1]};color:${n[2]}">${ic(n[0])}</div><div><div>${n[3]}</div><small>${n[4]}</small></div></div>`).join('');
  $('#bell').onclick = (e) => { e.stopPropagation(); $('#notif').hidden = !$('#notif').hidden; $('#bell .dot').style.display = 'none'; };
  document.addEventListener('click', (e) => { if (!e.target.closest('#notif')) $('#notif').hidden = true; if (!e.target.closest('.search')) $('#results').hidden = true; });

  /* search */
  const qi = $('#q');
  qi.oninput = () => {
    const v = qi.value.trim().toLowerCase(), box = $('#results'); if (!v) { box.hidden = true; return; }
    const o = Q.OUTLETS.filter((x) => (x.name + x.city + x.manager).toLowerCase().includes(v)).slice(0, 4);
    const t = Q.TASKS.filter((x) => (x.id + Q.VIOL[x.vid].short + Q.OUT[x.outlet].name).toLowerCase().includes(v)).slice(0, 4);
    const i = Q.INSPECTIONS.filter((x) => (x.id + Q.OUT[x.outlet].name).toLowerCase().includes(v)).slice(0, 3);
    box.hidden = false;
    box.innerHTML = (o.length ? '<h6>Outlets</h6>' + o.map((x) => `<a href="#/outlets/${x.id}">${ic('store')}${x.name}<small>${x.city}</small></a>`).join('') : '') + (t.length ? '<h6>Tasks</h6>' + t.map((x) => `<a href="#/tasks/${x.id}">${ic('tasks')}${Q.VIOL[x.vid].short}<small>${Q.OUT[x.outlet].name.split(' ')[0]} · ${x.id}</small></a>`).join('') : '') + (i.length ? '<h6>Inspections</h6>' + i.map((x) => `<a href="#/inspections/${x.id}">${ic('camera')}${x.id} · ${Q.OUT[x.outlet].name}<small>${dShort(x.date)}</small></a>`).join('') : '') || '<div class="empty" style="padding:20px">No matches</div>';
    box.onclick = () => { box.hidden = true; qi.value = ''; };
  };
  addEventListener('keydown', (e) => { if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); qi.focus(); } if (e.key === 'Escape') { $$('.overlay').forEach((o) => o.remove()); closeDrawer(); } });

  /* ---------- modal / drawer ---------- */
  function openModal(html, wide) {
    const o = document.createElement('div'); o.className = 'overlay'; o.innerHTML = `<div class="modal" role="dialog" aria-modal="true" style="${wide ? 'width:min(860px,100%)' : ''}">${html}</div>`;
    document.body.appendChild(o); o.onclick = (e) => { if (e.target === o) o.remove(); }; $$('[data-x]', o).forEach((b) => (b.onclick = () => o.remove())); hydrateIcons(o); return o;
  }
  let drawerEl = null;
  function closeDrawer() { if (drawerEl) { drawerEl.remove(); drawerEl = null; if (location.hash.startsWith('#/tasks/')) history.replaceState(null, '', '#/tasks'); } }
  function openDrawer(html) { closeDrawer(); drawerEl = document.createElement('div'); drawerEl.className = 'drawer'; drawerEl.innerHTML = html; document.body.appendChild(drawerEl); $$('[data-x]', drawerEl).forEach((b) => (b.onclick = closeDrawer)); return drawerEl; }

  /* ---------- views ---------- */
  const views = {};

  /* OVERVIEW */
  views.overview = () => {
    const ns = Q.networkSeries(), cur = ns[ns.length - 1].avg, prev = ns[ns.length - 5].avg, d = cur - prev;
    const latest = Q.OUTLETS.map((o) => ({ o, ins: Q.latestIns(o.id) }));
    const netScore = avg(latest.map((x) => x.ins.score));
    const open = Q.TASKS.filter((t) => t.status !== 'resolved'), od = open.filter((t) => tstate(t) === 'overdue');
    const res = Q.TASKS.filter((t) => t.status === 'resolved' && t.resolved);
    const ttr = avg(res.map((t) => (t.resolved - t.created) / Q.DAY));
    const below = latest.filter((x) => x.ins.score < 80);
    const cat = {}; Q.CATS.forEach((c) => (cat[c.id] = avg(latest.map((x) => x.ins.catScore[c.id]))));
    const worst = [...latest].sort((a, b) => a.ins.score - b.ins.score).slice(0, 5);
    const rep = {}; Q.OUTLETS.forEach((o) => Q.repeats(o.id, 4).forEach((r) => { (rep[r.vid] = rep[r.vid] || []).push([o, r.count]); }));
    const repList = Object.entries(rep).map(([vid, l]) => ({ vid, l, tot: l.reduce((a, x) => a + x[1], 0) })).sort((a, b) => b.tot - a.tot).slice(0, 5);
    const recent = Q.INSPECTIONS.slice(0, 6);
    const soon = open.filter((t) => tstate(t) !== 'overdue').slice(0, 5);
    const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const arrow = (v) => `<span class="delta ${v > 0.2 ? 'up' : v < -0.2 ? 'down' : 'flat'}">${ic(v > 0 ? 'arrowup' : 'arrowdown')}${Math.abs(v).toFixed(1)} pts</span>`;
    return `<div class="page">
      <div class="ph"><div><h1>${greet}, Rhea</h1><p>Here's how your 18 outlets are performing. Last sync ${tShort(new Date())} · ${Q.INSPECTIONS.filter((i) => i.week === 0).length} inspections reviewed this week.</p></div><div class="acts"><select class="select" style="width:auto;height:40px" aria-label="Range"><option>Last 12 weeks</option><option>Last 4 weeks</option><option>Year to date</option></select><button class="btn" id="exportBtn" data-i="download">Export report</button></div></div>
      <div class="grid g4">
        <div class="card kpi"><div class="lab">Network compliance ${ic('shield')}</div><div class="val">${netScore.toFixed(1)}<small>/ 100</small></div><div class="foot">${arrow(d)} vs 4 weeks ago</div></div>
        <div class="card kpi"><div class="lab">Open corrective tasks ${ic('tasks')}</div><div class="val">${open.length}</div><div class="foot"><span class="badge b-bad plain">${od.length} overdue</span> ${open.filter((t) => t.sev === 'critical').length} critical</div></div>
        <div class="card kpi"><div class="lab">Avg. time to resolve ${ic('clock')}</div><div class="val">${ttr.toFixed(1)}<small>days</small></div><div class="foot"><span class="delta up">${ic('arrowdown')}0.8 d</span> faster than last month</div></div>
        <div class="card kpi"><div class="lab">Outlets below 80 ${ic('alert')}</div><div class="val">${below.length}<small>of 18</small></div><div class="foot">${below.slice(0, 3).map((x) => x.o.city === 'Delhi NCR' ? x.o.name.split(' ')[0] : x.o.name.split(' ')[0]).join(', ')}${below.length > 3 ? '…' : ''}</div></div>
      </div>
      <div class="grid g21 mt">
        <div class="card"><div class="card-h"><h3>Network compliance trend<span class="sub">Average inspection score across all outlets</span></h3><div class="legend" style="margin:0"><span><i style="background:#0e7c66"></i>Network average</span><span><i style="background:#cf7b0f"></i>Target</span></div></div><div class="card-b">${lineChart([{ name: 'Network avg', color: '#0e7c66', data: ns.map((x) => x.avg) }], { labels: ns.map((x) => dShort(x.date)), target: 85, area: true, id: 'ov', every: 2, aria: 'Network compliance over 12 weeks' })}</div></div>
        <div class="card"><div class="card-h"><h3>By category<span class="sub">Latest inspection, all outlets</span></h3></div><div class="card-b">${catBars(cat)}<div class="hint" style="margin-top:14px">${ic('sparkle')}<span><b>Cleanliness</b> is ${cat.clean < 85 ? 'your weakest' : 'steady'} category. ${worst.filter((w) => w.ins.catScore.clean < 75).length} outlets scored under 75.</span></div></div></div>
      </div>
      <div class="grid g2 mt">
        <div class="card"><div class="card-h"><h3>Needs attention<span class="sub">Lowest scores this week</span></h3><a class="link" href="#/outlets">All outlets ${ic('chevron')}</a></div><div class="list" style="margin-top:10px">${worst.map((x) => `<a class="row" href="#/outlets/${x.o.id}"><span class="sc ${scCls(x.ins.score)}">${x.ins.score}</span><div class="grow"><div class="ttl ell">${x.o.name}</div><div class="sm ell">${x.o.city} · ${x.ins.fails.length} open violations${Q.repeats(x.o.id, 4)[0] ? ' · repeat: ' + Q.VIOL[Q.repeats(x.o.id, 4)[0].vid].short.toLowerCase() : ''}</div></div>${spark(Q.series(x.o.id), x.ins.score < 70 ? '#d6455d' : '#e0a02a')}</a>`).join('')}</div></div>
        <div class="card"><div class="card-h"><h3>Repeated violations<span class="sub">Failed in 4+ of the last 12 inspections</span></h3><a class="link" href="#/outlets">Compare outlets ${ic('chevron')}</a></div><div class="list" style="margin-top:10px">${repList.map((r) => `<div class="row"><i class="sevdot sev-${Q.VIOL[r.vid].sev}"></i><div class="grow"><div class="ttl">${Q.VIOL[r.vid].short}</div><div class="sm ell">${r.l.sort((a, b) => b[1] - a[1]).slice(0, 3).map((x) => x[0].name.split(' ')[0] + ' ×' + x[1]).join(' · ')}</div></div><span class="tag-rep">${ic('repeat')}${r.l.length} outlet${r.l.length > 1 ? 's' : ''}</span></div>`).join('')}</div></div>
      </div>
      <div class="grid g21 mt">
        <div class="card"><div class="card-h"><h3>Latest AI-reviewed inspections</h3><a class="link" href="#/inspections">View all ${ic('chevron')}</a></div><div class="list" style="margin-top:10px">${recent.map((i) => `<a class="row" href="#/inspections/${i.id}"><div class="thumbs">${i.photos.slice(0, 3).map((p) => `<div>${photoCard(p.scene, p.defects, {})}</div>`).join('')}</div><div class="grow"><div class="ttl ell">${Q.OUT[i.outlet].name}</div><div class="sm">${i.id} · ${i.type} · ${ago(i.date)}</div></div>${i.fails.length ? `<span class="badge b-bad">${i.fails.length} violation${i.fails.length > 1 ? 's' : ''}</span>` : '<span class="badge b-good">Clean</span>'}<span class="sc ${scCls(i.score)}">${i.score}</span></a>`).join('')}</div></div>
        <div class="card"><div class="card-h"><h3>Overdue &amp; due soon</h3><a class="link" href="#/tasks">Board ${ic('chevron')}</a></div><div class="list" style="margin-top:10px">${[...od.slice(0, 3), ...soon.slice(0, 3)].map((t) => `<a class="row" href="#/tasks/${t.id}"><i class="sevdot sev-${t.sev}"></i><div class="grow"><div class="ttl ell">${Q.VIOL[t.vid].short}</div><div class="sm ell">${Q.OUT[t.outlet].name}</div></div><span class="sm">${dueTxt(t)}</span></a>`).join('')}</div></div>
      </div></div>`;
  };

  /* OWNER: HOME + TO-DO (plain language, no analytics) */
  const todoRow = (t) => { const v = Q.VIOL[t.vid], p = priLab(t.sev), late = tstate(t) === 'overdue'; return `<div class="todo"><span class="pri ${p[0]}">${p[1]}</span><div><b>${v.short}</b><p>${t.title}</p><div class="when">${t.status === 'review' ? 'Photo sent — waiting for head office to check' : late ? `<span class="down" style="font-weight:700">Late by ${Math.ceil((NOW - t.due) / Q.DAY)} day(s)</span>` : 'Fix by ' + dShort(t.due)}${t.recur > 2 ? ' · keeps coming back' : ''}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">${t.status === 'review' ? '<span class="badge b-brand">With head office</span>' : `<button class="btn btn-primary btn-sm" data-fix="${t.id}">${ic('camera')}I fixed it</button>`}<button class="btn btn-sm" data-task="${t.id}">Details</button></div></div>`; };
  const wireTodo = () => { $$('[data-fix]').forEach((b) => (b.onclick = () => { const t = Q.TASKS.find((x) => x.id === b.dataset.fix); fixModal(t, render); })); $$('[data-task]').forEach((b) => (b.onclick = () => taskDrawer(b.dataset.task))); };
  views.home = () => {
    const o = Q.OUT[ME.outlet], last = Q.latestIns(o.id), g = grade(last.score);
    const my = Q.TASKS.filter((t) => t.outlet === o.id && t.status !== 'resolved').sort((a, b) => SEVORD[a.sev] - SEVORD[b.sev] || a.due - b.due);
    const fix = my.filter((t) => t.status !== 'review'), late = my.filter((t) => tstate(t) === 'overdue');
    const done = Q.TASKS.filter((t) => t.outlet === o.id && t.status === 'resolved' && t.resolved && (NOW - t.resolved) / Q.DAY <= 30).sort((a, b) => b.resolved - a.resolved);
    const rank = [...Q.OUTLETS].sort((a, b) => outletScore(b.id) - outletScore(a.id)).findIndex((x) => x.id === o.id) + 1;
    const ser = Q.series(o.id), dlt = ser[ser.length - 1] - avg(ser.slice(-5, -1));
    const trend = dlt > 2 ? ['Getting better', 'Nice work — you are doing better than last month.'] : dlt < -2 ? ['Slipping a little', 'Your standards dropped compared with last month.'] : ['Steady', 'About the same as last month.'];
    const rep = Q.repeats(o.id, 4)[0];
    const dueIn = Math.ceil((new Date(last.date.getTime() + 7 * Q.DAY) - NOW) / Q.DAY);
    const nextTxt = dueIn < 0 ? `Your weekly check is ${-dueIn} day${dueIn < -1 ? 's' : ''} late` : dueIn === 0 ? 'Your weekly check is due today' : `Your next weekly check is due in ${dueIn} day${dueIn > 1 ? 's' : ''}`;
    const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    return `<div class="page owner"><div class="ph"><div><h1>${greet}, ${ME.name.split(' ')[0]}</h1><p>Here's what to do at ${o.name} today.</p></div></div>
    <div class="grid g21"><div class="card ohero"><div class="face ${g.k}">${ic(g.i)}</div><div><h2>${g.h}</h2><p>${fix.length ? `Your last photo check found <b>${fix.length} thing${fix.length > 1 ? 's' : ''} to fix</b>. Fix them to keep your outlet looking its best.` : 'Everything from your last check is sorted. Keep it up!'}</p><div class="chips"><span class="badge ${g.k === 'g' ? 'b-good' : g.k === 'y' ? 'b-warn' : 'b-bad'}">Rating: ${g.w}</span>${late.length ? `<span class="badge b-bad">${late.length} late</span>` : '<span class="badge b-good">Nothing late</span>'}</div></div></div>
    <div class="next"><div><h3>${nextTxt}</h3><p>Take 4 photos on your phone — counter, front, seating, and back. Takes about 12 minutes.</p></div><a class="btn btn-primary btn-lg" href="#/new">${ic('camera')}Start weekly check</a></div></div>
    <div class="card mt"><div class="card-h"><h3>Fix these first<span class="sub">Start at the top. Tap “I fixed it” and add a photo when done.</span></h3>${fix.length > 4 ? `<a class="link" href="#/todo">See all ${fix.length} ${ic('chevron')}</a>` : ''}</div><div style="margin-top:10px">${fix.slice(0, 4).map(todoRow).join('') || `<div class="empty">${ic('check')}Nothing to fix right now.</div>`}</div></div>
    <div class="tiles mt"><div class="card tile"><small>Compared with other outlets</small><b>${rank}${['th', 'st', 'nd', 'rd'][rank % 10 > 3 || ((rank % 100) / 10 | 0) === 1 ? 0 : rank % 10]} out of 18</b><p>${rank <= 6 ? 'You are in the top group.' : rank <= 12 ? 'You are in the middle. A few fixes will move you up.' : 'There is room to improve. Start with the urgent items.'}</p></div>
    <div class="card tile"><small>Compared with last month</small><b>${trend[0]}</b><p>${trend[1]}</p></div>
    <div class="card tile"><small>${rep ? 'Keeps coming back' : 'Repeat problems'}</small><b>${rep ? Q.VIOL[rep.vid].short : 'None'}</b><p>${rep ? 'Tip: ' + Q.VIOL[rep.vid].task + '.' : 'No problem has repeated in the last 3 months.'}</p></div></div>
    <div class="card mt"><div class="card-h"><h3>Fixed recently</h3></div><div style="margin-top:8px">${done.slice(0, 5).map((t) => `<div class="done-row">${ic('check')}<span>${Q.VIOL[t.vid].short}</span><small>${ago(t.resolved)}</small></div>`).join('') || '<div class="empty" style="padding:24px">Fixes you complete will show up here.</div>'}</div></div></div>`;
  };
  views.home.after = wireTodo;
  views.todo = () => {
    const mine = Q.TASKS.filter((t) => t.outlet === ME.outlet).sort((a, b) => SEVORD[a.sev] - SEVORD[b.sev] || a.due - b.due);
    const todo = mine.filter((t) => t.status !== 'resolved'), done = mine.filter((t) => t.status === 'resolved' && t.resolved).sort((a, b) => b.resolved - a.resolved).slice(0, 8);
    return `<div class="page owner"><div class="ph"><div><h1>Things to fix</h1><p>Everything that came up in your photo checks. Fix it, add a photo, and it's done.</p></div></div>
    <div class="card"><div class="card-h"><h3>To do (${todo.length})</h3></div><div style="margin-top:10px">${todo.map(todoRow).join('') || `<div class="empty">${ic('check')}You're all caught up.</div>`}</div></div>
    <div class="card mt"><div class="card-h"><h3>Done</h3></div><div style="margin-top:8px">${done.map((t) => `<div class="done-row">${ic('check')}<span>${Q.VIOL[t.vid].short}</span><small>${ago(t.resolved)}</small></div>`).join('')}</div></div></div>`;
  };
  views.todo.after = (id) => { wireTodo(); if (id) taskDrawer(id); };

  /* INSPECTIONS list */
  const insF = { q: '', region: 'all', status: 'all', n: 20 };
  views.inspections = () => {
    const rows = Q.INSPECTIONS.filter((i) => (!isOwner() || i.outlet === ME.outlet) && (insF.region === 'all' || Q.OUT[i.outlet].region === insF.region) && (insF.status === 'all' || (insF.status === 'viol' ? i.fails.some((f) => Q.VIOL[f].sev === 'critical') : insF.status === 'low' ? i.score < 80 : i.score >= 85)) && (Q.OUT[i.outlet].name + i.id + Q.OUT[i.outlet].city).toLowerCase().includes(insF.q.toLowerCase()));
    return `<div class="page"><div class="ph"><div><h1>${isOwner() ? 'Past checks' : 'Inspections'}</h1><p>${isOwner() ? 'Every photo check you have sent, and what was found.' : 'Every submission, reviewed by AI against your standards.'}</p></div><div class="acts"><a class="btn btn-primary" href="#/new" data-i="camera">New inspection</a></div></div>
    <div class="card"><div class="toolbar"><input class="input grow" id="fq" placeholder="Filter by outlet, city or ID…" value="${esc(insF.q)}"><select class="select" id="fr"><option value="all">All regions</option>${['South', 'West', 'North'].map((r) => `<option ${insF.region === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
      <div class="pills" id="fs">${[['all', 'All'], ['viol', 'Has critical'], ['low', 'Below 80'], ['top', '85+']].map(([k, l]) => `<button data-k="${k}" class="${insF.status === k ? 'on' : ''}">${l}</button>`).join('')}</div><span class="muted" style="margin-left:auto;font-size:13px">${rows.length} results</span></div>
    <div class="tw"><table class="t"><thead><tr><th>Inspection</th><th>Outlet</th><th>Photos</th><th>Submitted</th><th>Violations</th><th>Score</th><th></th></tr></thead><tbody>${rows.slice(0, insF.n).map((i) => `<tr class="click" data-go="#/inspections/${i.id}"><td><b>${i.id}</b><div class="sm muted" style="font-size:12.5px">${i.type}</div></td><td><div class="who">${av(Q.OUT[i.outlet].manager, 30)}<div><b>${Q.OUT[i.outlet].name}</b><small>${Q.OUT[i.outlet].city} · ${Q.OUT[i.outlet].manager}</small></div></div></td><td><div class="thumbs">${i.photos.map((p) => `<div>${photoCard(p.scene, p.defects, {})}</div>`).join('')}</div></td><td>${dShort(i.date)}<div class="muted" style="font-size:12.5px">${tShort(i.date)}</div></td><td>${i.fails.length ? `<span class="badge b-bad plain">${i.fails.length} found</span>${i.fails.some((f) => Q.VIOL[f].sev === 'critical') ? ' <span class="badge b-crit plain">critical</span>' : ''}` : '<span class="badge b-good plain">None</span>'}</td><td><span class="sc ${scCls(i.score)}">${i.score}</span></td><td>${ic('chevron')}</td></tr>`).join('')}</tbody></table></div>
    ${rows.length > insF.n ? `<div style="padding:16px;text-align:center;border-top:1px solid var(--line)"><button class="btn" id="more">Show more</button></div>` : ''}${rows.length ? '' : '<div class="empty">' + ic('search') + 'No inspections match these filters.</div>'}</div></div>`;
  };
  views.inspections.after = () => {
    $('#fq').oninput = (e) => { insF.q = e.target.value; const p = e.target.selectionStart; render(); const el = $('#fq'); el.focus(); el.setSelectionRange(p, p); };
    $('#fr').onchange = (e) => { insF.region = e.target.value; render(); };
    $$('#fs button').forEach((b) => (b.onclick = () => { insF.status = b.dataset.k; render(); }));
    const m = $('#more'); if (m) m.onclick = () => { insF.n += 20; render(); };
  };

  /* INSPECTION detail */
  views.inspection = (id) => {
    const ins = Q.INS[id]; if (!ins) return notFound();
    const o = Q.OUT[ins.outlet], prev = Q.INSPECTIONS.filter((i) => i.outlet === ins.outlet && i.date < ins.date)[0], dl = prev ? ins.score - prev.score : 0;
    const meta = metaFor(ins);
    const sorted = [...ins.fails].sort((a, b) => SEVORD[Q.VIOL[a].sev] - SEVORD[Q.VIOL[b].sev]);
    window.__ins = { ins, meta, scene: (sorted[0] && Q.VIOL[sorted[0]].scene) || 'storefront', all: false };
    return `<div class="page"><div class="crumb"><a href="#/inspections">Inspections</a>${ic('chevron')}<span>${ins.id}</span></div>
    <div class="ph"><div class="scorebig">${donut(ins.score, 76, 9)}<div><h1>${o.name}</h1><p>${ins.type} · submitted by ${o.manager} · ${dShort(ins.date)}, ${tShort(ins.date)} · ${ins.checks} checks in ${ins.duration} min ${prev ? `· <span class="delta ${dl >= 0 ? 'up' : 'down'}">${ic(dl >= 0 ? 'arrowup' : 'arrowdown')}${Math.abs(dl)} vs previous</span>` : ''}</p></div></div>
    <div class="acts"><button class="btn" id="shareIns" data-i="link">Share</button><a class="btn" href="#/outlets/${o.id}" data-i="store">Outlet profile</a></div></div>
    <div class="grid g21"><div class="card" style="align-self:start"><div class="viewer" id="viewer"></div><div class="vtabs" id="vtabs"></div><div class="toolbar" style="border-top:1px solid var(--line);border-bottom:0"><label style="display:flex;gap:10px;align-items:center;font-size:14px;font-weight:600"><span class="switch"><input type="checkbox" id="showAll"><i></i></span>Show passed checks</label><span class="muted" style="margin-left:auto;font-size:13px;display:flex;gap:6px;align-items:center">${ic('sparkle')} Analysed by Plumb Vision v4.2 in ${(3 + (ins.duration % 5) * 0.7).toFixed(1)}s</span></div></div>
    <div style="display:grid;gap:18px;align-content:start"><div class="card"><div class="card-h"><h3>${ins.fails.length ? ins.fails.length + ' violations detected' : 'No violations detected'}</h3>${ins.fails.length ? '<span class="muted" style="font-size:13px">Hover to locate</span>' : ''}</div><div class="card-b" style="display:grid;gap:10px">${sorted.map((f) => { const v = Q.VIOL[f], t = Q.TASKS.find((x) => x.vid === f && x.outlet === ins.outlet && (x.inspection === ins.id || (x.created <= ins.date && (!x.resolved || x.resolved > ins.date)))); return `<div class="finding-c" data-vid="${f}" data-scene="${v.scene}"><div class="h"><b>${v.short}</b>${sevBadge(v.sev)}</div><p>${v.ai}</p><div class="m"><span class="conf"><i><b style="width:${meta[f].conf * 100}%"></b></i>${Math.round(meta[f].conf * 100)}%</span><span>${Q.CAT[v.cat].name}</span>${t ? `<a class="link" href="#/tasks/${t.id}" style="margin-left:auto" onclick="event.stopPropagation()">${t.id} · ${STLAB[tstate(t)]}</a>` : ''}</div></div>`; }).join('') || `<div class="empty">${ic('shield')}Everything in this submission meets the standard.</div>`}</div></div>
    <div class="card"><div class="card-h"><h3>Category scores</h3></div><div class="card-b">${catBars(ins.catScore)}</div></div></div></div></div>`;
  };
  views.inspection.after = () => {
    const S = window.__ins; if (!S) return;
    const draw = () => {
      const p = S.ins.photos.find((x) => x.scene === S.scene);
      $('#viewer').innerHTML = Scenes.render(S.scene, p.defects, { detect: S.all ? 'all' : 'fails', labels: true, meta: S.meta });
      $('#vtabs').innerHTML = S.ins.photos.map((x) => `<button class="vtab ${x.scene === S.scene ? 'on' : ''}" data-s="${x.scene}"><div>${Scenes.render(x.scene, x.defects, {})}</div><span class="${x.defects.length ? '' : 'ok'}">${x.defects.length || '✓'}</span><small>${Scenes.labels[x.scene]}</small></button>`).join('');
      $$('.vtab').forEach((b) => (b.onclick = () => { S.scene = b.dataset.s; draw(); }));
    };
    draw();
    $('#showAll').onchange = (e) => { S.all = e.target.checked; draw(); };
    $$('.finding-c').forEach((c) => {
      c.onmouseenter = () => { if (S.scene !== c.dataset.scene) { S.scene = c.dataset.scene; draw(); } const v = $('#viewer'); v.classList.add('focus'); $$('.det', v).forEach((d) => d.classList.toggle('hl', d.dataset.vid === c.dataset.vid)); };
      c.onmouseleave = () => { $('#viewer').classList.remove('focus'); };
    });
    const sh = $('#shareIns'); if (sh) sh.onclick = () => toast('Link copied — only people in your workspace can open it');
  };

  /* NEW INSPECTION wizard */
  const W = { step: 1, outlet: '', list: 'Weekly Outlet Standard v3.2', slots: {}, result: null };
  const SLOTLAB = { storefront: ['Storefront & signage', 'Stand across the street; capture the full fascia, windows and entrance'], counter: ['Service counter', 'Capture the counter, menu board, pastry case and bin in one frame'], dining: ['Dining floor', 'Capture seating, floor, bin and the hand-wash station'], back: ['Staff & billing', 'Capture the billing desk with a staff member in uniform'] };
  views.new = () => {
    if (isOwner() && !W.outlet) { W.outlet = ME.outlet; W.step = 2; }
    const st = (n, l) => `<div class="${W.step === n ? 'on' : W.step > n ? 'done' : ''}"><b>${W.step > n ? '✓' : n}</b><span>${l}</span></div>`;
    let body = '';
    if (W.step === 1) {
      body = `<div class="card"><div class="card-b" style="display:grid;gap:18px;max-width:640px"><label class="f">Outlet<select class="select" id="wo" ${isOwner() ? 'disabled' : ''}><option value="">Select an outlet…</option>${Q.OUTLETS.map((o) => `<option value="${o.id}" ${W.outlet === o.id ? 'selected' : ''}>${o.name} — ${o.city}</option>`).join('')}</select></label>
      <label class="f">Checklist<select class="select" id="wl"><option>Weekly Outlet Standard v3.2</option><option>Opening Checklist v2.0</option><option>Festive Campaign — Oct–Nov</option></select></label>
      <div class="hint">${ic('camera')}<span>You'll capture <b>4 guided photos</b>. Plumb checks each photo for blur, lighting and angle before analysing it. Takes about 12 minutes.</span></div>
      <div><button class="btn btn-primary" id="w1" ${W.outlet ? '' : 'disabled'}>Continue ${ic('arrow')}</button></div></div></div>`;
    } else if (W.step === 2) {
      body = `<div class="slots">${Scenes.keys.map((k) => { const s = W.slots[k]; return `<div class="slot ${s ? 'has' : ''}">${s ? `<div class="img">${s.src ? `<img src="${s.src}" alt="Uploaded photo">` : Scenes.render(k, s.defects, {})}</div>` : `<div class="ph0"><div>${ic('camera')}<div style="margin-top:6px">${SLOTLAB[k][1]}</div></div></div>`}<div class="meta"><div><b>${SLOTLAB[k][0]}</b><small>${s ? (s.src ? 'Uploaded · quality check passed' : 'Captured · quality check passed') : 'Required'}</small></div><div style="display:flex;gap:6px">${s ? `<button class="btn btn-sm" data-retake="${k}">Retake</button>` : `<button class="btn btn-sm btn-primary" data-cap="${k}">Capture</button><label class="btn btn-sm" style="cursor:pointer">Upload<input type="file" accept="image/*" hidden data-up="${k}"></label>`}</div></div></div>`; }).join('')}</div>
      <div style="display:flex;gap:10px;margin-top:18px;align-items:center"><button class="btn" id="wb">Back</button><button class="btn btn-primary" id="w2" ${Object.keys(W.slots).length < 4 ? 'disabled' : ''}>Run AI analysis ${ic('sparkle')}</button><span class="muted" style="font-size:13px">${Object.keys(W.slots).length}/4 photos</span></div>`;
    } else if (W.step === 3) {
      body = `<div class="card" style="max-width:640px"><div class="card-b" style="display:grid;gap:18px"><div><h3 style="font-size:19px">Analysing ${Q.OUT[W.outlet].name}</h3><p class="muted">Plumb Vision is comparing each photo with the reference images in your checklist.</p></div><div class="progress"><i id="pg"></i></div><div class="steps-ai" id="aist"></div></div></div>`;
    } else {
      const r = W.result;
      body = `<div class="grid g21"><div style="display:grid;gap:18px;align-content:start"><div class="card"><div class="card-b scorebig">${donut(r.score, 92, 11)}<div><h3 style="font-size:20px">Submission score ${r.score}</h3><p class="muted">${r.fails.length ? r.fails.length + ' violations found · ' + r.fails.length + ' corrective tasks will be created' : 'No violations — nice work.'}</p></div></div></div>
      <div class="slots">${Scenes.keys.map((k) => `<div class="slot has"><div class="img">${W.slots[k].src ? `<img src="${W.slots[k].src}" alt="">` : Scenes.render(k, W.slots[k].defects, { detect: 'fails', labels: false })}</div><div class="meta"><div><b>${SLOTLAB[k][0]}</b><small>${W.slots[k].defects.length ? W.slots[k].defects.length + ' issue(s) flagged' : 'No issues'}</small></div><span class="badge ${W.slots[k].defects.length ? 'b-bad' : 'b-good'} plain">${W.slots[k].defects.length ? 'Review' : 'Pass'}</span></div></div>`).join('')}</div></div>
      <div class="card" style="align-self:start"><div class="card-h"><h3>Findings</h3></div><div class="card-b" style="display:grid;gap:10px">${r.fails.map((f) => `<div class="finding-c" style="cursor:default"><div class="h"><b>${Q.VIOL[f].short}</b>${sevBadge(Q.VIOL[f].sev)}</div><p>${Q.VIOL[f].task}</p><div class="m">Due in ${Q.SEV[Q.VIOL[f].sev].sla} days</div></div>`).join('') || '<div class="empty">All clear.</div>'}<button class="btn btn-primary" id="wsub">Submit inspection ${ic('check')}</button><button class="btn" id="wb">Back</button></div></div></div>`;
    }
    return `<div class="page"><div class="ph"><div><h1>New inspection</h1><p>Outlet manager flow — capture photos, get instant AI feedback, submit.</p></div></div><div class="stepper">${st(1, 'Outlet & checklist')}${st(2, 'Capture photos')}${st(3, 'AI analysis')}${st(4, 'Review & submit')}</div>${body}</div>`;
  };
  views.new.after = () => {
    const o = $('#wo'); if (o) o.onchange = () => { W.outlet = o.value; $('#w1').disabled = !o.value; };
    const w1 = $('#w1'); if (w1) w1.onclick = () => { W.step = 2; render(); };
    const wb = $('#wb'); if (wb) wb.onclick = () => { W.step = W.step === 4 ? 2 : 1; render(); };
    const defectsFor = (k) => { const out = Q.OUT[W.outlet]; return Q.VIDS.filter((v) => Q.VIOL[v].scene === k && Math.random() < (out.weak.includes(v) ? 0.72 : 0.07 + (1 - out.q) * 0.25)); };
    $$('[data-cap]').forEach((b) => (b.onclick = () => { const k = b.dataset.cap; b.textContent = 'Capturing…'; setTimeout(() => { W.slots[k] = { defects: defectsFor(k) }; render(); }, 500); }));
    $$('[data-retake]').forEach((b) => (b.onclick = () => { delete W.slots[b.dataset.retake]; render(); }));
    $$('[data-up]').forEach((i) => (i.onchange = () => { const f = i.files[0]; if (!f) return; const rd = new FileReader(); rd.onload = () => { W.slots[i.dataset.up] = { src: rd.result, defects: defectsFor(i.dataset.up) }; render(); }; rd.readAsDataURL(f); }));
    const w2 = $('#w2'); if (w2) w2.onclick = () => { W.step = 3; render(); };
    if (W.step === 3) {
      const steps = ['Checking photo quality (blur, light, angle)', 'Detecting signage, displays and people', 'Comparing with your reference images', 'Scoring against checklist weights', 'Preparing corrective tasks'];
      const box = $('#aist'), pg = $('#pg'); let i = 0;
      const tick = () => { box.innerHTML = steps.map((s, k) => `<div class="${k < i ? 'done' : ''}">${k < i ? ic('check') : k === i ? '<span class="sp"></span>' : '<span style="width:18px"></span>'}${s}</div>`).join(''); pg.style.width = (i / steps.length) * 100 + '%'; if (i < steps.length) { i++; setTimeout(tick, 650); } else { finish(); } };
      const finish = () => {
        const fails = Scenes.keys.flatMap((k) => W.slots[k].defects); const cs = {};
        Q.CATS.forEach((c) => { let tot = 0, lost = 0; Q.VIDS.forEach((v) => { if (Q.VIOL[v].cat !== c.id) return; const p = Q.SEV[Q.VIOL[v].sev].pen; tot += p; if (fails.includes(v)) lost += p; }); cs[c.id] = Math.round(100 - (lost / tot) * 72); });
        W.result = { fails, cs, score: Math.round(Q.CATS.reduce((a, c) => a + cs[c.id] * c.weight, 0) / 100) }; W.step = 4; render();
      };
      tick();
    }
    const sub = $('#wsub'); if (sub) sub.onclick = () => {
      const r = W.result, id = 'INS-' + (4400 + Q.INSPECTIONS.length);
      const ins = { id, outlet: W.outlet, date: new Date(), week: 0, type: 'Weekly self-inspection', by: Q.OUT[W.outlet].manager, score: r.score, catScore: r.cs, fails: r.fails, photos: Scenes.keys.map((k) => ({ scene: k, defects: W.slots[k].defects })), checks: 40, duration: 12 };
      addInspection(ins); const saved = store.get('newins', []); saved.push({ ...ins, photos: undefined }); store.set('newins', saved);
      W.step = 1; W.outlet = ''; W.slots = {}; W.result = null; toast(`Inspection ${id} submitted — ${r.fails.length} corrective task${r.fails.length === 1 ? '' : 's'} created`); location.hash = '#/inspections/' + id;
    };
  };

  /* TASKS */
  const TF = { st: 'all', region: 'all', sev: 'all', mode: 'board', q: '' };
  const taskCard = (t) => `<div class="tc sev-${t.sev}" data-task="${t.id}"><div class="t2"><span style="display:flex;gap:6px;align-items:center"><b style="color:var(--ink-2)">${t.id}</b>${sevBadge(t.sev)}${t.recur > 1 ? `<span class="tag-rep">${ic('repeat')}${t.recur}×</span>` : ''}</span><span>${dueTxt(t)}</span></div><div class="t1">${Q.VIOL[t.vid].short}</div><div class="t2"><span class="ell">${Q.OUT[t.outlet].name}</span><span style="display:flex;gap:6px;align-items:center">${av(t.assignee, 24)}</span></div></div>`;
  views.tasks = (id) => {
    let list = Q.TASKS.filter((t) => (TF.region === 'all' || Q.OUT[t.outlet].region === TF.region) && (TF.sev === 'all' || t.sev === TF.sev) && (Q.OUT[t.outlet].name + Q.VIOL[t.vid].short + t.id).toLowerCase().includes(TF.q.toLowerCase()));
    const cnt = { all: list.filter((t) => t.status !== 'resolved').length, overdue: list.filter((t) => tstate(t) === 'overdue').length, open: list.filter((t) => t.status === 'open').length, progress: list.filter((t) => t.status === 'progress').length, review: list.filter((t) => t.status === 'review').length, resolved: list.filter((t) => t.status === 'resolved').length };
    const filt = list.filter((t) => TF.st === 'all' ? t.status !== 'resolved' : TF.st === 'overdue' ? tstate(t) === 'overdue' : t.status === TF.st);
    const cols = [['open', 'Open'], ['progress', 'In progress'], ['review', 'Awaiting verification'], ['resolved', 'Resolved']];
    const content = TF.mode === 'board'
      ? `<div class="board">${cols.map(([k, l]) => { const items = list.filter((t) => t.status === k).sort((a, b) => (k === 'resolved' ? b.resolved - a.resolved : a.due - b.due)); return `<div class="col"><div class="col-h">${l}<span>${items.length}</span></div>${items.slice(0, k === 'resolved' ? 6 : 12).map(taskCard).join('') || '<div class="muted" style="padding:14px;text-align:center;font-size:13px">Nothing here</div>'}</div>`; }).join('')}</div>`
      : `<div class="card"><div class="tw"><table class="t"><thead><tr><th>Task</th><th>Outlet</th><th>Severity</th><th>Assignee</th><th>Status</th><th>Deadline</th></tr></thead><tbody>${filt.slice(0, 60).map((t) => `<tr class="click" data-task="${t.id}"><td><b>${Q.VIOL[t.vid].short}</b><div class="muted" style="font-size:12.5px">${t.id}${t.recur > 1 ? ' · repeated ' + t.recur + '×' : ''}</div></td><td>${Q.OUT[t.outlet].name}</td><td>${sevBadge(t.sev)}</td><td><div class="who">${av(t.assignee, 26)}<span>${t.assignee}</span></div></td><td>${stBadge(t)}</td><td>${dueTxt(t)}</td></tr>`).join('')}</tbody></table></div></div>`;
    return `<div class="page"><div class="ph"><div><h1>Corrective tasks</h1><p>Every violation becomes an owned, deadline-driven task — closed only when the fix is verified.</p></div><div class="acts"><div class="seg"><button class="${TF.mode === 'board' ? 'on' : ''}" data-m="board">Board</button><button class="${TF.mode === 'list' ? 'on' : ''}" data-m="list">List</button></div></div></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px"><div class="pills" id="tf">${[['all', 'Active'], ['overdue', 'Overdue'], ['open', 'Open'], ['progress', 'In progress'], ['review', 'Awaiting verification']].map(([k, l]) => `<button data-k="${k}" class="${TF.st === k ? 'on' : ''}">${l}<span>${cnt[k]}</span></button>`).join('')}</div><span style="flex:1"></span><input class="input" id="tq" placeholder="Search tasks…" style="width:200px;height:36px" value="${esc(TF.q)}"><select class="select" id="tr" style="width:auto;height:36px"><option value="all">All regions</option>${['South', 'West', 'North'].map((r) => `<option ${TF.region === r ? 'selected' : ''}>${r}</option>`).join('')}</select><select class="select" id="ts" style="width:auto;height:36px"><option value="all">All severities</option>${['critical', 'major', 'minor'].map((r) => `<option value="${r}" ${TF.sev === r ? 'selected' : ''}>${Q.SEV[r].label}</option>`).join('')}</select></div>${content}</div>`;
  };
  views.tasks.after = (id) => {
    $$('#tf button').forEach((b) => (b.onclick = () => { TF.st = b.dataset.k; if (TF.mode === 'board') TF.mode = 'list'; render(); }));
    $$('[data-m]').forEach((b) => (b.onclick = () => { TF.mode = b.dataset.m; if (TF.mode === 'board') TF.st = 'all'; render(); }));
    $('#tr').onchange = (e) => { TF.region = e.target.value; render(); }; $('#ts').onchange = (e) => { TF.sev = e.target.value; render(); };
    $('#tq').oninput = (e) => { TF.q = e.target.value; const p = e.target.selectionStart; render(); const el = $('#tq'); el.focus(); el.setSelectionRange(p, p); };
    $$('[data-task]').forEach((c) => (c.onclick = () => taskDrawer(c.dataset.task)));
    if (id) taskDrawer(id);
  };

  function taskDrawer(id) {
    const t = Q.TASKS.find((x) => x.id === id); if (!t) return;
    const v = Q.VIOL[t.vid], o = Q.OUT[t.outlet], st = tstate(t), ins = Q.INS[t.inspection], defs = ins ? ins.photos.find((p) => p.scene === v.scene).defects : [t.vid];
    const acts = t.status === 'resolved' ? '' : t.status === 'open' ? `<button class="btn" id="dStart">Start work</button><button class="btn btn-primary" id="dFix" data-i="camera">Submit fix photo</button>` : t.status === 'progress' ? `<button class="btn btn-primary" id="dFix" data-i="camera">Submit fix photo</button>` : `<button class="btn" id="dRej">Reject fix</button><button class="btn btn-primary" id="dApp" data-i="check">Approve &amp; close</button>`;
    const d = openDrawer(`<div class="drawer-h"><div><div style="display:flex;gap:8px;align-items:center;margin-bottom:8px"><b class="muted">${t.id}</b>${sevBadge(t.sev)}${stBadge(t)}${t.recur > 1 ? `<span class="tag-rep">${ic('repeat')}Repeated ${t.recur}×</span>` : ''}</div><h3 style="font-size:20px;line-height:1.25">${v.short}</h3><p class="muted" style="margin-top:4px">${o.name}, ${o.city}</p></div><button class="x" data-x aria-label="Close">${ic('x')}</button></div>
    <div class="drawer-b"><div class="crop">${cropped(v.scene, defs, t.vid)}</div>
    <div><h4 style="font-size:14px;margin-bottom:6px">What needs to happen</h4><p>${t.title}</p></div>
    <dl class="kv"><dt>Standard</dt><dd>${v.standard}</dd><dt>Category</dt><dd>${Q.CAT[v.cat].name}</dd><dt>Assigned to</dt><dd><div class="who">${av(t.assignee, 24)}${t.assignee}</div></dd><dt>Deadline</dt><dd>${dShort(t.due)} · ${dueTxt(t)}</dd><dt>Source</dt><dd><a class="link" href="#/inspections/${t.inspection}">${t.inspection}</a> · AI confidence ${88 + (t.id.length * 3 + t.vid.length) % 10}%</dd></dl>
    ${t.recur > 1 ? `<div class="hint" style="background:#f3e8fd;color:#5b2587">${ic('repeat')}<span>This violation has been flagged in <b>${t.recur} consecutive inspections</b>. Consider a root-cause review with ${o.manager}.</span></div>` : ''}
    <div><h4 style="font-size:14px;margin-bottom:12px">Activity</h4><div class="tl">${[...t.events].sort((a, b) => a.at - b.at).map((e) => `<div>${e.text}<small>${dShort(e.at)}, ${tShort(e.at)}</small></div>`).join('')}</div></div></div>
    <div class="drawer-f">${acts || `<span class="badge b-good" style="margin-right:auto">Verified closed</span><button class="btn" data-x>Close</button>`}</div>`);
    hydrateIcons(d); if (location.hash.startsWith('#/tasks')) history.replaceState(null, '', '#/tasks/' + id);
    const refresh = () => { closeDrawer(); render(); taskDrawer(id); };
    const s = $('#dStart', d); if (s) s.onclick = () => { t.status = 'progress'; addEvent(t, t.assignee + ' started work'); toast('Task marked in progress'); refresh(); };
    const f = $('#dFix', d); if (f) f.onclick = () => fixModal(t, refresh);
    const ap = $('#dApp', d); if (ap) ap.onclick = () => { t.status = 'resolved'; t.resolved = new Date(); addEvent(t, 'Approved by Rhea Kapoor — task closed'); toast('Task approved and closed'); refresh(); };
    const rj = $('#dRej', d); if (rj) rj.onclick = () => { t.status = 'open'; addEvent(t, 'Fix rejected by Rhea Kapoor — returned to ' + t.assignee); toast('Returned to outlet for rework', 'alert'); refresh(); };
  }

  function fixModal(t, done) {
    const v = Q.VIOL[t.vid]; let up = null;
    const m = openModal(`<div class="modal-h"><div><h3>Submit fix photo</h3><p class="muted" style="margin-top:4px">${v.short} · ${Q.OUT[t.outlet].name}</p></div><button class="x" data-x>${ic('x')}</button></div><div class="modal-b" id="fb"><div class="ba"><figure><figcaption>Before</figcaption><div class="crop">${cropped(v.scene, [t.vid], t.vid)}</div></figure><figure><figcaption>After</figcaption><div class="crop" id="after"><div class="ph-msg muted" style="font-size:13.5px;text-align:center">Add the after-photo to continue</div></div></figure></div>
    <div class="hint" style="margin-top:14px">${ic('sparkle')}<span>Plumb re-checks the same standard on the new photo. If it passes, the task closes automatically — otherwise it goes to HQ for review.</span></div></div>
    <div class="modal-f" id="ff"><button class="btn" id="mSample" data-i="camera">Capture sample photo</button><label class="btn" style="cursor:pointer" data-i="upload">Upload photo<input type="file" accept="image/*" hidden id="mUp"></label></div>`);
    const verify = (src) => {
      const after = $('#after', m); after.innerHTML = src ? `<img src="${src}" alt="After photo" style="width:100%;height:100%;object-fit:cover">` : cropped(v.scene, [], t.vid, 36);
      $('#ff', m).innerHTML = `<span class="muted" style="margin-right:auto;font-size:13.5px">Verifying…</span>`;
      const steps = ['Checking photo quality', 'Locating ' + v.short.toLowerCase() + ' area', 'Comparing with standard'];
      $('#fb', m).insertAdjacentHTML('beforeend', `<div class="steps-ai" id="vs" style="margin-top:16px"></div>`);
      let i = 0; const tick = () => {
        $('#vs', m).innerHTML = steps.map((s, k) => `<div class="${k < i ? 'done' : ''}">${k < i ? ic('check') : k === i ? '<span class="sp"></span>' : '<span style="width:18px"></span>'}${s}</div>`).join('');
        if (i++ < steps.length) return setTimeout(tick, 700);
        const auto = !src, conf = Math.round(rg(94, 99));
        $('#vs', m).innerHTML = auto ? `<div class="hint" style="background:var(--good-l);color:#0b6e49">${ic('check')}<span><b>Verified by AI · ${conf}% match.</b> The standard is now met — closing the task.</span></div>` : `<div class="hint" style="background:var(--warn-l);color:#7a4505">${ic('alert')}<span><b>Uploaded photo needs a human check.</b> Plumb couldn't match it to the reference angle with enough confidence (71%). Sent to HQ for review.</span></div>`;
        $('#ff', m).innerHTML = `<button class="btn btn-primary" id="mDone">Done</button>`;
        t.status = auto ? 'resolved' : 'review'; if (auto) t.resolved = new Date();
        addEvent(t, auto ? 'Fix photo uploaded — AI re-verification passed (' + conf + '% match). Task closed' : 'Fix photo uploaded — low-confidence match, sent to HQ for review');
        $('#mDone', m).onclick = () => { m.remove(); toast(auto ? 'Verified by AI — task resolved' : 'Sent to HQ for review', auto ? 'check' : 'clock'); done(); };
      }; tick();
    };
    $('#mSample', m).onclick = () => verify(null);
    $('#mUp', m).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => verify(r.result); r.readAsDataURL(f); };
  }

  /* OUTLETS */
  const OF = { region: 'all', sort: 'score', cmp: [] };
  views.outlets = () => {
    let rows = Q.OUTLETS.filter((o) => OF.region === 'all' || o.region === OF.region).map((o) => { const l = Q.latestIns(o.id); return { o, l, s: l.score, d: scoreDelta(o.id), open: Q.TASKS.filter((t) => t.outlet === o.id && t.status !== 'resolved').length, rep: Q.repeats(o.id, 4) }; });
    const key = { score: (a, b) => b.s - a.s, low: (a, b) => a.s - b.s, open: (a, b) => b.open - a.open, rep: (a, b) => b.rep.length - a.rep.length };
    rows.sort(key[OF.sort]);
    const sel = OF.cmp.map((id, i) => `<span class="cmp-chip"><i style="background:${colors[i]}"></i>${Q.OUT[id].name.split(' ')[0]}</span>`).join('');
    const regAvg = ['South', 'West', 'North'].map((r) => [r, avg(Q.OUTLETS.filter((o) => o.region === r).map((o) => outletScore(o.id)))]);
    return `<div class="page"><div class="ph"><div><h1>Outlets</h1><p>Compare performance across the network and see who keeps repeating the same mistakes.</p></div><div class="acts"><button class="btn btn-primary" id="cmpBtn" ${OF.cmp.length < 2 ? 'disabled' : ''} data-i="layers">Compare ${OF.cmp.length || ''} selected</button></div></div>
    <div class="grid g4" style="margin-bottom:18px">${regAvg.map(([r, v]) => `<div class="card kpi"><div class="lab">${r} region ${ic('pin')}</div><div class="val">${v.toFixed(1)}</div><div class="foot">${Q.OUTLETS.filter((o) => o.region === r).length} outlets · ${Q.OUTLETS.filter((o) => o.region === r && outletScore(o.id) < 80).length} below 80</div></div>`).join('')}<div class="card kpi"><div class="lab">Best this week ${ic('star')}</div><div class="val" style="font-size:22px;margin:12px 0 6px">${[...rows].sort(key.score)[0].o.name.split(' ').slice(0, 2).join(' ')}</div><div class="foot"><span class="sc g">${[...rows].sort(key.score)[0].s}</span> ${[...rows].sort(key.score)[0].o.city}</div></div></div>
    <div class="card"><div class="toolbar"><div class="pills" id="orf">${['all', 'South', 'West', 'North'].map((r) => `<button data-k="${r}" class="${OF.region === r ? 'on' : ''}">${r === 'all' ? 'All regions' : r}</button>`).join('')}</div><select class="select" id="osort" style="margin-left:auto"><option value="score" ${OF.sort === 'score' ? 'selected' : ''}>Sort: Highest score</option><option value="low" ${OF.sort === 'low' ? 'selected' : ''}>Sort: Lowest score</option><option value="open" ${OF.sort === 'open' ? 'selected' : ''}>Sort: Most open tasks</option><option value="rep" ${OF.sort === 'rep' ? 'selected' : ''}>Sort: Most repeat violations</option></select>${sel ? `<div style="display:flex;gap:6px">${sel}</div>` : ''}</div>
    <div class="tw"><table class="t"><thead><tr><th style="width:36px"></th><th>#</th><th>Outlet</th><th>Score</th><th>12-week trend</th><th>Δ 4 wk</th><th title="Branding, Display, Cleanliness, Staff, Safety">Categories</th><th>Open tasks</th><th>Repeat issues</th></tr></thead><tbody>${rows.map((r, i) => `<tr class="click" data-go="#/outlets/${r.o.id}"><td><input type="checkbox" class="cb" data-cmp="${r.o.id}" aria-label="Compare ${r.o.name}" ${OF.cmp.includes(r.o.id) ? 'checked' : ''}></td><td><span class="rank">${i + 1}</span></td><td><div class="who">${av(r.o.manager, 32)}<div><b>${r.o.name}</b><small>${r.o.city} · ${r.o.manager}</small></div></div></td><td><span class="sc ${scCls(r.s)}">${r.s}</span></td><td>${spark(Q.series(r.o.id), r.d >= 0 ? '#1a9a69' : '#d6455d')}</td><td><span class="delta ${r.d > 0.5 ? 'up' : r.d < -0.5 ? 'down' : 'flat'}">${r.d > 0.5 ? ic('arrowup') : r.d < -0.5 ? ic('arrowdown') : ''}${Math.abs(r.d).toFixed(1)}</span></td><td><div class="heat">${Q.CATS.map((c) => `<i class="${hv(r.l.catScore[c.id])}" title="${c.name}: ${r.l.catScore[c.id]}"></i>`).join('')}</div></td><td>${r.open ? `<b>${r.open}</b>` : '<span class="muted">0</span>'}</td><td>${r.rep.length ? `<span class="tag-rep">${ic('repeat')}${r.rep.length} · ${esc(Q.VIOL[r.rep[0].vid].short)}</span>` : '<span class="muted">None</span>'}</td></tr>`).join('')}</tbody></table></div>
    <div style="padding:12px 20px;border-top:1px solid var(--line);display:flex;gap:18px;font-size:12.5px;color:var(--muted);flex-wrap:wrap"><span class="legend" style="margin:0"><span><i class="hv-g"></i>85+</span><span><i class="hv-y"></i>70–84</span><span><i class="hv-r"></i>Below 70</span></span><span>Category order: Branding · Display · Cleanliness · Staff · Safety</span></div></div></div>`;
  };
  views.outlets.after = () => {
    $$('#orf button').forEach((b) => (b.onclick = () => { OF.region = b.dataset.k; render(); }));
    $('#osort').onchange = (e) => { OF.sort = e.target.value; render(); };
    $$('[data-cmp]').forEach((c) => { c.onclick = (e) => e.stopPropagation(); c.onchange = () => { const id = c.dataset.cmp; if (c.checked) { if (OF.cmp.length >= 4) { c.checked = false; toast('Compare up to 4 outlets', 'alert'); return; } OF.cmp.push(id); } else OF.cmp = OF.cmp.filter((x) => x !== id); render(); }; });
    const cb = $('#cmpBtn'); if (cb) cb.onclick = () => {
      const ids = OF.cmp, ser = ids.map((id, i) => ({ name: Q.OUT[id].name.split(' ').slice(0, 2).join(' '), color: colors[i], data: Q.series(id) })), labels = Q.networkSeries().map((x) => dShort(x.date));
      const m = openModal(`<div class="modal-h"><div><h3>Outlet comparison</h3><p class="muted" style="margin-top:4px">Weekly inspection score and category breakdown</p></div><button class="x" data-x>${ic('x')}</button></div><div class="modal-b">${lineChart(ser, { labels, w: 780, h: 250, id: 'cmp', every: 2, min: 50, max: 100, aria: 'Outlet score comparison' })}<div class="legend">${ser.map((s) => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('')}</div>
      <div class="tw" style="margin-top:14px"><table class="t"><thead><tr><th>Category</th>${ids.map((id, i) => `<th><span class="cmp-chip"><i style="background:${colors[i]}"></i>${Q.OUT[id].name.split(' ')[0]}</span></th>`).join('')}</tr></thead><tbody>${Q.CATS.map((c) => { const vals = ids.map((id) => Q.latestIns(id).catScore[c.id]), best = Math.max(...vals); return `<tr><td>${c.name}</td>${vals.map((x) => `<td><span class="sc ${scCls(x)}" style="${x === best ? 'outline:2px solid var(--brand);outline-offset:1px' : ''}">${x}</span></td>`).join('')}</tr>`; }).join('')}<tr><td><b>Overall</b></td>${ids.map((id) => `<td><span class="sc ${scCls(outletScore(id))}">${outletScore(id)}</span></td>`).join('')}</tr><tr><td>Open tasks</td>${ids.map((id) => `<td>${Q.TASKS.filter((t) => t.outlet === id && t.status !== 'resolved').length}</td>`).join('')}</tr><tr><td>Repeat violations</td>${ids.map((id) => `<td>${Q.repeats(id, 4).length}</td>`).join('')}</tr></tbody></table></div></div>`, true);
      wireCharts(m);
    };
  };

  views.outlet = (id) => {
    const o = Q.OUT[id]; if (!o) return notFound();
    const l = Q.latestIns(id), s = Q.series(id), labels = Q.INSPECTIONS.filter((i) => i.outlet === id).sort((a, b) => a.date - b.date).map((i) => dShort(i.date));
    const reps = Q.repeats(id, 3), tasks = Q.TASKS.filter((t) => t.outlet === id && t.status !== 'resolved'), hist = Q.INSPECTIONS.filter((i) => i.outlet === id).slice(0, 6);
    const rank = [...Q.OUTLETS].sort((a, b) => outletScore(b.id) - outletScore(a.id)).findIndex((x) => x.id === id) + 1;
    const net = Q.networkSeries().map((x) => x.avg);
    return `<div class="page"><div class="crumb"><a href="#/outlets">Outlets</a>${ic('chevron')}<span>${o.name}</span></div>
    <div class="ph"><div class="scorebig">${donut(l.score, 80, 10)}<div><h1>${o.name}</h1><p>${o.city} · Managed by ${o.manager} · ${o.seats} seats · Open since ${o.opened} · Ranked <b>#${rank}</b> of 18</p></div></div><div class="acts"><button class="btn" id="reqSpot" data-i="camera">Request spot-check</button><button class="btn btn-primary" id="msgMgr" data-i="msg">Message manager</button></div></div>
    <div class="grid g21"><div class="card"><div class="card-h"><h3>Score vs network average<span class="sub">Weekly inspection scores, last 12 weeks</span></h3><div class="legend" style="margin:0"><span><i style="background:#0e7c66"></i>${o.name.split(' ')[0]}</span><span><i style="background:#a9b7b0"></i>Network</span></div></div><div class="card-b">${lineChart([{ name: 'Network', color: '#a9b7b0', data: net }, { name: o.name.split(' ')[0], color: '#0e7c66', data: s }], { labels, every: 2, id: 'o', min: Math.min(55, Math.floor(Math.min(...s) / 5) * 5 - 5), max: 100, aria: 'Outlet trend' })}</div></div>
    <div class="card"><div class="card-h"><h3>Category scores</h3></div><div class="card-b">${catBars(l.catScore)}</div></div></div>
    <div class="grid g2 mt"><div class="card"><div class="card-h"><h3>Repeated violations<span class="sub">Failed in 3+ of the last 12 inspections</span></h3></div><div class="list" style="margin-top:10px">${reps.map((r) => `<div class="row"><i class="sevdot sev-${Q.VIOL[r.vid].sev}"></i><div class="grow"><div class="ttl">${Q.VIOL[r.vid].short}</div><div class="sm">Failed ${r.count} of 12 weeks · ${Q.CAT[Q.VIOL[r.vid].cat].name}</div></div><div style="width:90px"><div class="progress"><i style="width:${(r.count / 12) * 100}%;background:#8b46c7"></i></div></div></div>`).join('') || `<div class="empty">${ic('shield')}No repeated violations. Standards are holding.</div>`}</div>${reps.length ? `<div class="card-b" style="padding-top:0"><div class="hint" style="background:#f3e8fd;color:#5b2587">${ic('sparkle')}<span>${reps[0].count >= 8 ? 'A violation that fails more often than it passes usually signals a process or equipment gap, not individual discipline.' : 'Recurring issues suggest a training gap. Consider a short refresher with the shift team.'}</span></div></div>` : ''}</div>
    <div class="card"><div class="card-h"><h3>Open tasks (${tasks.length})</h3><a class="link" href="#/tasks">All tasks ${ic('chevron')}</a></div><div class="list" style="margin-top:10px">${tasks.map((t) => `<a class="row" href="#/tasks/${t.id}"><i class="sevdot sev-${t.sev}"></i><div class="grow"><div class="ttl ell">${Q.VIOL[t.vid].short}</div><div class="sm">${t.id} · ${t.assignee}</div></div><span class="sm">${dueTxt(t)}</span></a>`).join('') || `<div class="empty">${ic('check')}All caught up.</div>`}</div></div></div>
    <div class="card mt"><div class="card-h"><h3>Recent inspections</h3></div><div class="list" style="margin-top:10px">${hist.map((i) => `<a class="row" href="#/inspections/${i.id}"><div class="thumbs">${i.photos.slice(0, 3).map((p) => `<div>${photoCard(p.scene, p.defects, {})}</div>`).join('')}</div><div class="grow"><div class="ttl">${i.id} · ${i.type}</div><div class="sm">${dShort(i.date)} · ${i.fails.length} violation(s)</div></div><span class="sc ${scCls(i.score)}">${i.score}</span></a>`).join('')}</div></div></div>`;
  };
  views.outlet.after = (id) => {
    $('#reqSpot').onclick = () => toast('Spot-check requested — ' + Q.OUT[id].manager + ' has 30 minutes to submit a live photo set');
    $('#msgMgr').onclick = () => { const m = openModal(`<div class="modal-h"><h3>Message ${Q.OUT[id].manager}</h3><button class="x" data-x>${ic('x')}</button></div><div class="modal-b"><textarea class="input" rows="4" placeholder="Write a note about the open tasks…"></textarea></div><div class="modal-f"><button class="btn" data-x>Cancel</button><button class="btn btn-primary" id="send">Send via WhatsApp</button></div>`); $('#send', m).onclick = () => { m.remove(); toast('Message sent to ' + Q.OUT[id].manager); }; };
  };
  /* STANDARDS */
  const sdef = store.get('std', {});
  const CL = [['Weekly Outlet Standard', 'v3.2', 'Active', '38 checks · all outlets', 'Updated 12 Oct by Rhea Kapoor'], ['Opening Checklist', 'v2.0', 'Active', '14 checks · all outlets', 'Updated 3 Sep by Rhea Kapoor'], ['Festive Campaign — Oct–Nov', 'v1.1', 'Active', '9 checks · 18 outlets', 'Updated 21 Oct by Brand team'], ['Cloud Kitchen Hygiene', 'v0.4', 'Draft', '22 checks · not assigned', 'Edited yesterday by Rhea Kapoor']];
  let clSel = 0;
  views.standards = () => {
    const c = CL[clSel];
    const items = (id) => Q.VIDS.filter((v) => Q.VIOL[v].cat === id);
    return `<div class="page"><div class="ph"><div><h1>Standards &amp; checklists</h1><p>Define what "good" looks like. Plumb checks every submission against these standards.</p></div><div class="acts"><button class="btn" id="tpl" data-i="layers">Browse templates</button><button class="btn btn-primary" id="newCl" data-i="plus">New checklist</button></div></div>
    <div class="split"><div class="card" style="align-self:start">${CL.map((x, i) => `<div class="cl ${i === clSel ? 'on' : ''}" data-cl="${i}"><div style="display:flex;justify-content:space-between;gap:8px"><b>${x[0]}</b><span class="badge ${x[2] === 'Active' ? 'b-good' : 'b-warn'} plain">${x[2]}</span></div><small>${x[1]} · ${x[3]}</small><small>${x[4]}</small></div>`).join('')}</div>
    <div class="card"><div class="card-h" style="padding-bottom:14px;border-bottom:1px solid var(--line)"><div><h3 style="font-size:18px">${c[0]} <span class="muted" style="font-weight:500">${c[1]}</span></h3><span class="sub">${c[3]} · scoring weights set by category</span></div><div style="display:flex;gap:8px"><button class="btn btn-sm" id="addChk" data-i="plus">Add check</button><button class="btn btn-sm btn-primary" id="pub">Publish v${(parseFloat(c[1].slice(1)) + 0.1).toFixed(1)}</button></div></div>
    ${Q.CATS.map((cat) => `<div class="cat-h"><span><i style="background:${cat.color}"></i>${cat.name}</span><span class="muted">Weight ${cat.weight}%</span></div>${items(cat.id).map((v) => { const V = Q.VIOL[v], ai = sdef[v] ? sdef[v].ai : true; return `<div class="item"><div class="ref" title="Reference image: what good looks like">${Scenes.render(V.scene, [], {})}</div><div><b>${V.standard}</b><small>${Scenes.labels[V.scene]} photo · ${ai ? 'Checked by AI' : 'Manual confirmation'} · SLA ${Q.SEV[V.sev].sla} days</small></div><div class="ctl"><select class="select" data-sev="${v}">${['critical', 'major', 'minor'].map((s) => `<option value="${s}" ${V.sev === s ? 'selected' : ''}>${Q.SEV[s].label}</option>`).join('')}</select><label class="switch" title="AI check"><input type="checkbox" data-ai="${v}" ${ai ? 'checked' : ''}><i></i></label></div></div>`; }).join('')}`).join('')}</div></div></div>`;
  };
  views.standards.after = () => {
    $$('[data-cl]').forEach((e) => (e.onclick = () => { clSel = +e.dataset.cl; render(); }));
    $$('[data-ai]').forEach((e) => (e.onchange = () => { sdef[e.dataset.ai] = { ai: e.checked }; store.set('std', sdef); toast(e.checked ? 'AI check enabled for this standard' : 'AI check disabled — manual confirmation required', e.checked ? 'sparkle' : 'alert'); }));
    $$('[data-sev]').forEach((e) => (e.onchange = () => { Q.VIOL[e.dataset.sev].sev = e.value; toast('Severity updated — applies to new inspections'); }));
    $('#pub').onclick = () => { const v = (parseFloat(CL[clSel][1].slice(1)) + 0.1).toFixed(1); CL[clSel][1] = 'v' + v; CL[clSel][2] = 'Active'; CL[clSel][4] = 'Updated just now by Rhea Kapoor'; toast('Published v' + v + ' — outlet managers notified'); render(); };
    $('#tpl').onclick = () => { const m = openModal(`<div class="modal-h"><div><h3>Template library</h3><p class="muted" style="margin-top:4px">Start from a proven standard, then adapt it.</p></div><button class="x" data-x>${ic('x')}</button></div><div class="modal-b" style="display:grid;gap:10px">${[['fork', 'QSR & café — front of house', '42 checks'], ['cart', 'Retail store — visual merchandising', '36 checks'], ['scissors', 'Salon & spa — station & reception', '31 checks'], ['book', 'Education centre — classroom & safety', '28 checks']].map((t) => `<div class="row" style="border:1px solid var(--line);border-radius:12px;padding:12px 14px;display:flex;gap:12px;align-items:center"><div class="avatar" style="background:var(--brand-l);color:var(--brand-d);border-radius:10px">${ic(t[0])}</div><div style="flex:1"><b>${t[1]}</b><div class="muted" style="font-size:13px">${t[2]}</div></div><button class="btn btn-sm" data-use>Use</button></div>`).join('')}</div>`); $$('[data-use]', m).forEach((b) => (b.onclick = () => { m.remove(); toast('Template added as a draft checklist'); })); };
    $('#newCl').onclick = () => { const m = openModal(`<div class="modal-h"><h3>New checklist</h3><button class="x" data-x>${ic('x')}</button></div><div class="modal-b" style="display:grid;gap:14px"><label class="f">Name<input class="input" id="nn" placeholder="e.g. Monsoon readiness"></label><label class="f">Applies to<select class="select"><option>All outlets</option><option>South region</option><option>West region</option><option>North region</option></select></label></div><div class="modal-f"><button class="btn" data-x>Cancel</button><button class="btn btn-primary" id="mk">Create draft</button></div>`); $('#mk', m).onclick = () => { const n = $('#nn', m).value.trim() || 'Untitled checklist'; CL.push([n, 'v0.1', 'Draft', '0 checks · not assigned', 'Created just now']); clSel = CL.length - 1; m.remove(); toast('Draft checklist created'); render(); }; };
    $('#addChk').onclick = () => { const m = openModal(`<div class="modal-h"><h3>Add a check</h3><button class="x" data-x>${ic('x')}</button></div><div class="modal-b" style="display:grid;gap:14px"><label class="f">What should be true?<input class="input" placeholder="e.g. Loyalty QR stand is visible at the counter"></label><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><label class="f">Category<select class="select">${Q.CATS.map((c) => `<option>${c.name}</option>`).join('')}</select></label><label class="f">Severity<select class="select"><option>Major</option><option>Critical</option><option>Minor</option></select></label></div><label class="f">Reference image<div class="hint">${ic('upload')}<span>Upload 1–3 photos of what "right" looks like. Plumb learns the pattern in about 2 minutes.</span></div></label></div><div class="modal-f"><button class="btn" data-x>Cancel</button><button class="btn btn-primary" id="ad">Add check</button></div>`); $('#ad', m).onclick = () => { m.remove(); toast('Check added — training on your reference images'); }; };
  };

  /* BILLING */
  views.billing = () => `<div class="page"><div class="ph"><div><h1>Plan &amp; billing</h1><p>Billed monthly per active outlet. Add or pause outlets any time.</p></div><div class="acts"><button class="btn" id="addOut" data-i="plus">Add outlets</button></div></div>
    <div class="grid g21"><div class="card"><div class="card-b" style="display:grid;gap:20px"><div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap"><div><span class="badge b-brand plain">Growth plan</span><div style="font-size:38px;font-weight:800;letter-spacing:-.04em;margin-top:10px">₹21,582 <small style="font-size:15px;font-weight:500;color:var(--muted);letter-spacing:0">/ month + GST</small></div><p class="muted">18 outlets × ₹1,199 · Next invoice on ${dShort(new Date(NOW.getFullYear(), NOW.getMonth() + 1, 1))}</p></div><div style="text-align:right"><div class="muted" style="font-size:13px">Payment method</div><b>•••• 4821 · HDFC Visa</b></div></div>
    <div><div style="display:flex;justify-content:space-between;font-size:14px"><span>Outlets used</span><b>18 / 50</b></div><div class="progress" style="margin-top:8px"><i style="width:36%;background:var(--brand)"></i></div></div><div><div style="display:flex;justify-content:space-between;font-size:14px"><span>AI photo analyses this month</span><b>1,248 · unlimited</b></div><div class="progress" style="margin-top:8px"><i style="width:23%;background:#6d5bd0"></i></div></div></div></div>
    <div class="card"><div class="card-h"><h3>What's included</h3></div><div class="card-b" style="display:grid;gap:10px;font-size:14px">${['Unlimited users & checklists', 'AI fix re-verification', 'Outlet comparison & repeat analytics', 'WhatsApp task reminders', 'Priority support (4h response)'].map((x) => `<div style="display:flex;gap:10px">${ic('check').replace('<svg', '<svg style="width:18px;color:var(--brand);flex:none"')}${x}</div>`).join('')}</div></div></div>
    <div class="card mt"><div class="card-h"><h3>Invoices</h3></div><div class="tw" style="margin-top:12px"><table class="t"><thead><tr><th>Invoice</th><th>Period</th><th>Outlets</th><th>Amount</th><th>Status</th><th></th></tr></thead><tbody>${[0, 1, 2, 3, 4, 5].map((i) => { const d = new Date(NOW.getFullYear(), NOW.getMonth() - i, 1), n = i < 2 ? 18 : i < 4 ? 17 : 15, amt = n * 1199; return `<tr><td><b>PLB-${2026}${String(d.getMonth() + 1).padStart(2, '0')}-0${12 + i}</b></td><td>${MON[d.getMonth()]} ${d.getFullYear()}</td><td>${n}</td><td>₹${(amt * 1.18).toLocaleString('en-IN', { maximumFractionDigits: 0 })} <span class="muted">incl. GST</span></td><td><span class="badge b-good">${i === 0 ? 'Upcoming' : 'Paid'}</span></td><td><button class="btn btn-sm btn-ghost" data-dl data-i="download">PDF</button></td></tr>`; }).join('')}</tbody></table></div></div></div>`;
  views.billing.after = () => {
    $$('[data-dl]').forEach((b) => (b.onclick = () => toast('Invoice PDF downloaded')));
    $('#addOut').onclick = () => { let n = 2; const m = openModal(`<div class="modal-h"><h3>Add outlets</h3><button class="x" data-x>${ic('x')}</button></div><div class="modal-b" style="display:grid;gap:14px"><div style="display:flex;align-items:center;gap:14px"><button class="btn" id="mi">−</button><b id="nv" style="font-size:24px;min-width:30px;text-align:center">2</b><button class="btn" id="pl">+</button><span class="muted">new outlets</span></div><div class="hint">${ic('card')}<span id="est"></span></div></div><div class="modal-f"><button class="btn" data-x>Cancel</button><button class="btn btn-primary" id="go">Confirm</button></div>`); const up = () => { $('#nv', m).textContent = n; $('#est', m).innerHTML = `Adds <b>₹${(n * 1199).toLocaleString('en-IN')}</b> / month, billed pro rata from today.`; }; up(); $('#mi', m).onclick = () => { n = Math.max(1, n - 1); up(); }; $('#pl', m).onclick = () => { n++; up(); }; $('#go', m).onclick = () => { m.remove(); toast(n + ' outlets added to your plan'); }; };
  };

  const notFound = () => `<div class="page"><div class="empty">${ic('search')}<h3>Not found</h3><p>That item doesn't exist. <a class="link" href="#/overview">Back to overview</a></p></div></div>`;

  /* ---------- router ---------- */
  let lastKey = '';
  function parse() { const h = location.hash.replace(/^#\/?/, '') || (isOwner() ? 'home' : 'overview'); const [r, id] = h.split('/'); return { r, id }; }
  function render() {
    const { r, id } = parse(); let key = r, html, after;
    if (r === 'inspections' && id) { html = views.inspection(id); after = views.inspection.after; key = 'inspections'; }
    else if (r === 'outlets' && id) { html = views.outlet(id); after = () => views.outlet.after(id); key = 'outlets'; }
    else if (views[r] && r !== 'inspection' && r !== 'outlet') { html = views[r](id); after = views[r].after && (() => views[r].after(id)); }
    else { html = notFound(); }
    const sy = scrollY, same = lastKey === location.hash.split('/').slice(0, 2).join('/');
    view.innerHTML = html; hydrateIcons(view); wireCharts(view); renderNav(key); renderTop();
    $$('[data-go]', view).forEach((e) => (e.onclick = (ev) => { if (!ev.target.closest('a,button,input,label')) location.hash = e.dataset.go; }));
    $$('.bar .tr i', view).forEach((i) => { const w = i.style.width; i.style.width = 0; requestAnimationFrame(() => requestAnimationFrame(() => (i.style.width = w))); });
    if (after) after();
    const ex = $('#exportBtn'); if (ex) ex.onclick = () => toast('Network report exported as PDF (12 pages)');
    document.title = { home: 'Home', todo: 'Things to fix', overview: 'Overview', inspections: 'Inspections', tasks: 'Corrective tasks', outlets: 'Outlets', standards: 'Standards', new: 'New inspection', billing: 'Billing' }[key] + ' — Plumb';
    if (!same) scrollTo(0, 0); else scrollTo(0, sy);
    lastKey = location.hash.split('/').slice(0, 2).join('/');
    $('#side').classList.remove('open'); $('#scrim').classList.remove('show');
  }
  addEventListener('hashchange', () => { const { r, id } = parse(); if ((r === 'tasks' || r === 'todo') && id && lastKey.startsWith('#/' + r)) { taskDrawer(id); return; } closeDrawer(); render(); });
  render();
})();
