/* Plumb — data layer for the Kettle & Co. workspace.
   Everything is generated deterministically (seeded) so the numbers are stable
   between page loads, but dates are relative to today so the product always
   looks "live". */
(function () {
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const R = rng(20261102);
  const DAY = 864e5;
  const today = new Date(); today.setHours(9, 0, 0, 0);
  const daysAgo = (n, hour) => { const d = new Date(today.getTime() - n * DAY); d.setHours(hour == null ? 9 : hour, Math.floor(R() * 50), 0, 0); return d; };

  const COMPANY = {
    name: 'Kettle & Co.', industry: 'Specialty coffee', hq: 'Bengaluru', plan: 'Growth',
    user: { name: 'Rhea Kapoor', role: 'Head of Retail Operations', initials: 'RK' },
  };

  const CATS = [
    { id: 'branding', name: 'Branding & Signage', weight: 20, color: '#6d5bd0' },
    { id: 'display', name: 'Display & Merchandising', weight: 25, color: '#e08a1e' },
    { id: 'clean', name: 'Cleanliness & Hygiene', weight: 30, color: '#0e9f7e' },
    { id: 'staff', name: 'Staff & Uniform', weight: 15, color: '#2f7de1' },
    { id: 'safety', name: 'Safety & Compliance', weight: 10, color: '#d6455d' },
  ];
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));

  const SEV = { critical: { label: 'Critical', pen: 9, sla: 2 }, major: { label: 'Major', pen: 5, sla: 5 }, minor: { label: 'Minor', pen: 2.5, sla: 10 } };

  /* id, scene, category, severity, short label, standard text, corrective task, AI note */
  const V = [
    ['sign_unlit', 'storefront', 'branding', 'major', 'Signage letters unlit', 'Fascia sign must be fully illuminated and legible', 'Replace failed LED modules on the fascia sign and send a lit-sign photo', 'Detected 5 of 13 characters in the fascia sign below illumination threshold.'],
    ['promo_old', 'storefront', 'branding', 'minor', 'Expired promo poster', 'Only the current campaign artwork may be displayed', 'Remove the expired "Summer Sips" poster and install the current campaign artwork', 'Poster text matches a campaign that ended more than 90 days ago.'],
    ['logo_blocked', 'storefront', 'branding', 'minor', 'Brand plaque obstructed', 'Brand plaque must be unobstructed from 3 m', 'Move the A-frame board so the brand plaque is fully visible from the street', 'About 70% of the brand plaque is covered by a freestanding board.'],
    ['menu_old', 'counter', 'branding', 'major', 'Menu prices outdated', 'Menu board must match the current price list', 'Replace the menu board inserts with the current price list (rev. Oct)', 'Two price lines struck through and overwritten by hand; does not match current list.'],
    ['pastry_off', 'counter', 'display', 'minor', 'Pastry case off-planogram', 'Pastry case follows the planogram (rows, spacing, tray colours)', 'Reset the pastry case to planogram P-07 and photograph the result', 'Gap in top row; one item sits on the wrong tray colour; spacing deviates by more than 20%.'],
    ['cups_off', 'counter', 'display', 'minor', 'Cup stacks misaligned', 'Cup and lid stacks are upright, full and aligned', 'Restack and refill the cup and lid shelf; remove the fallen cup', 'Two stacks leaning over 8 degrees, one understocked, one cup fallen.'],
    ['spill', 'counter', 'clean', 'major', 'Spill on counter', 'Counters are wiped and dry at all times', 'Clean and sanitise the counter surface; log the cleaning on the hygiene sheet', 'Dark liquid residue over about 12% of the counter surface in frame.'],
    ['bin_overflow', 'dining', 'clean', 'critical', 'Bin overflowing', 'Waste bins emptied at two-thirds full', 'Empty the front-of-house bin immediately and add a hourly bin check to the shift sheet', 'Waste visible above the bin rim; items on the floor around the base.'],
    ['no_apron', 'back', 'staff', 'minor', 'Apron not worn', 'Apron and name badge worn on shift', 'Brief the shift team on uniform standard and confirm apron stock is available', 'Barista in frame is not wearing the branded apron.'],
    ['seasonal_missing', 'dining', 'display', 'major', 'Seasonal display missing', 'Seasonal hamper display set up for the full campaign', 'Set up the festive hamper display per the campaign guide and upload a photo', 'Display stand present but empty; "Coming soon" card still showing.'],
    ['tables_unwiped', 'dining', 'clean', 'minor', 'Tables not wiped', 'Tables cleared and wiped within 10 minutes of use', 'Clear and wipe all tables; add a 15-minute floor sweep to the peak-hour checklist', 'Cups, residue rings and crumbs on 2 of 3 tables in frame.'],
    ['floor_debris', 'dining', 'clean', 'minor', 'Debris on floor', 'Dining floor free of litter and spills', 'Sweep and mop the dining floor; place a wet-floor sign while drying', 'Napkins and crumbs detected across about 8% of visible floor area.'],
    ['extinguisher_blocked', 'dining', 'safety', 'critical', 'Extinguisher blocked', 'Fire extinguisher access clear within 1 m', 'Relocate stock crates and keep a 1 m clearance zone marked in front of the fire extinguisher', 'Stock crates obstruct the extinguisher; clear access width under 0.3 m.'],
    ['handwash_nosoap', 'dining', 'clean', 'critical', 'Hand-wash soap empty', 'Hand-wash station stocked with soap at all times', 'Refill the hand-wash soap dispenser and add it to the opening checklist', 'Soap dispenser level indicator reads empty.'],
    ['pest_log', 'back', 'safety', 'major', 'Pest-control log missing', 'Current pest-control service log displayed', 'Obtain the latest pest-control certificate from the vendor and display it', 'Display board present but no service log found.'],
    ['uniform_stained', 'back', 'staff', 'minor', 'Uniform stained', 'Uniform clean and presentable', 'Replace the soiled apron and review the laundry rota', 'Large stains detected across the front of the apron.'],
  ];
  const VIOL = {};
  V.forEach((v) => { VIOL[v[0]] = { id: v[0], scene: v[1], cat: v[2], sev: v[3], short: v[4], standard: v[5], task: v[6], ai: v[7] }; });
  const VIDS = V.map((v) => v[0]);

  /* [id, name, city, region, manager, base quality, drift, weak vids, seats] */
  const O = [
    ['blr-kor', 'Koramangala 5th Block', 'Bengaluru', 'South', 'Ananya Rao', .86, .02, ['bin_overflow'], 48],
    ['blr-ind', 'Indiranagar 100ft Road', 'Bengaluru', 'South', 'Rohit Menon', .91, .01, [], 56],
    ['blr-wf', 'Whitefield ITPL', 'Bengaluru', 'South', 'Divya Shetty', .62, -.08, ['spill', 'tables_unwiped', 'handwash_nosoap', 'floor_debris'], 72],
    ['blr-hsr', 'HSR Layout Sector 2', 'Bengaluru', 'South', 'Karthik Iyer', .8, .03, ['cups_off'], 40],
    ['maa-tn', 'T. Nagar Pondy Bazaar', 'Chennai', 'South', 'Meera Krishnan', .84, .0, ['menu_old'], 44],
    ['maa-ady', 'Adyar Besant Avenue', 'Chennai', 'South', 'Suresh Babu', .88, .02, [], 36],
    ['hyd-bh', 'Banjara Hills Road 12', 'Hyderabad', 'South', 'Arjun Reddy', .9, .01, [], 60],
    ['hyd-gc', 'Gachibowli Financial District', 'Hyderabad', 'South', 'Sana Khan', .76, -.03, ['pastry_off', 'no_apron'], 64],
    ['bom-bw', 'Bandra West Linking Road', 'Mumbai', 'West', 'Imran Qureshi', .92, .01, [], 52],
    ['bom-pw', 'Powai Hiranandani', 'Mumbai', 'West', 'Neha Kulkarni', .82, .02, ['promo_old'], 46],
    ['bom-lp', 'Lower Parel Kamala Mills', 'Mumbai', 'West', 'Siddharth Joshi', .7, -.05, ['sign_unlit', 'extinguisher_blocked', 'bin_overflow'], 58],
    ['pnq-kp', 'Koregaon Park Lane 7', 'Pune', 'West', 'Pooja Deshmukh', .94, .01, [], 50],
    ['pnq-vn', 'Viman Nagar Phoenix Mall', 'Pune', 'West', 'Aarav Mehta', .83, .03, ['seasonal_missing'], 42],
    ['del-cp', 'Connaught Place M-Block', 'Delhi NCR', 'North', 'Kabir Malhotra', .87, .0, ['logo_blocked'], 54],
    ['del-sk', 'Saket Select Citywalk', 'Delhi NCR', 'North', 'Ritika Sharma', .85, .02, [], 62],
    ['del-hk', 'Hauz Khas Village', 'Delhi NCR', 'North', 'Vikram Chauhan', .77, .04, ['pest_log'], 38],
    ['ggn-ch', 'Gurugram Cyber Hub', 'Delhi NCR', 'North', 'Tanya Bansal', .89, .01, [], 66],
    ['noi-18', 'Noida Sector 18', 'Delhi NCR', 'North', 'Gaurav Singh', .66, -.05, ['menu_old', 'sign_unlit', 'uniform_stained'], 44],
  ];
  const OUTLETS = O.map((o) => ({ id: o[0], name: o[1], city: o[2], region: o[3], manager: o[4], q: o[5], drift: o[6], weak: o[7], seats: o[8], opened: 2014 + Math.floor(R() * 10) }));
  const OUT = Object.fromEntries(OUTLETS.map((o) => [o.id, o]));

  /* ---------- inspections: 12 weekly submissions per outlet ---------- */
  const WEEKS = 12;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const INSPECTIONS = [];
  const TYPES = ['Weekly self-inspection', 'Weekly self-inspection', 'Weekly self-inspection', 'Opening checklist', 'HQ spot-check request'];
  let nid = 4100;
  OUTLETS.forEach((o) => {
    for (let w = WEEKS - 1; w >= 0; w--) {
      const t = (WEEKS - 1 - w) / (WEEKS - 1);
      const quality = clamp(o.q + o.drift * (t - 0.5) * 2 + (R() - 0.5) * 0.05, 0.3, 0.99);
      const target = 100 - (1 - quality) * 80 + (R() - 0.5) * 3;
      const wantLoss = (100 - target) / 1.0;
      const fails = [];
      let lost = 0, guard = 0;
      while (lost < wantLoss - 1.2 && guard++ < 40) {
        const pool = VIDS.filter((v) => !fails.includes(v));
        const wts = pool.map((v) => (o.weak.includes(v) ? 5 : 1) * (SEV[VIOL[v].sev].pen > 5 ? 0.8 : 1));
        let x = R() * wts.reduce((a, b) => a + b, 0), pick = pool[0];
        for (let k = 0; k < pool.length; k++) { x -= wts[k]; if (x <= 0) { pick = pool[k]; break; } }
        fails.push(pick); lost += SEV[VIOL[pick].sev].pen;
      }
      const catScore = {};
      CATS.forEach((c) => {
        let tot = 0, lost = 0;
        VIDS.forEach((vid) => { const v = VIOL[vid]; if (v.cat !== c.id) return; const p = SEV[v.sev].pen; tot += p; if (fails.includes(vid)) lost += p; });
        catScore[c.id] = Math.round(100 - (lost / tot) * 100 * 0.72 - R() * 2.5);
      });
      const score = Math.round(CATS.reduce((a, c) => a + catScore[c.id] * c.weight, 0) / 100);
      const date = daysAgo(w * 7 + Math.floor(R() * 3), 8 + Math.floor(R() * 9));
      const photos = Scenes.keys.map((sc) => ({ scene: sc, defects: fails.filter((f) => VIOL[f].scene === sc) }));
      INSPECTIONS.push({
        id: 'INS-' + nid++, outlet: o.id, date, week: w, type: TYPES[Math.floor(R() * TYPES.length)], by: o.manager,
        score, catScore, fails, photos, checks: 38 + Math.floor(R() * 4), duration: 14 + Math.floor(R() * 19),
      });
    }
  });
  INSPECTIONS.sort((a, b) => b.date - a.date);
  const INS = Object.fromEntries(INSPECTIONS.map((i) => [i.id, i]));

  /* ---------- corrective tasks: created from findings in the last 7 weeks ---------- */
  const TASKS = [];
  let tid = 2310;
  const staffNames = ['Shift lead', 'Store manager', 'Maintenance vendor', 'Assistant manager'];
  OUTLETS.forEach((o) => {
    const list = INSPECTIONS.filter((i) => i.outlet === o.id).sort((a, b) => a.date - b.date); // oldest→newest
    const open = {}; // vid → task
    list.forEach((ins, idx) => {
      if (ins.week > 6) return;
      VIDS.forEach((vid) => {
        const fail = ins.fails.includes(vid);
        const cur = open[vid];
        if (fail && !cur) {
          const sev = VIOL[vid].sev;
          const due = new Date(ins.date.getTime() + SEV[sev].sla * DAY);
          const t = {
            id: 'T-' + tid++, outlet: o.id, vid, sev, title: VIOL[vid].task, created: ins.date, due, inspection: ins.id,
            assignee: R() < 0.55 ? o.manager : staffNames[Math.floor(R() * staffNames.length)], status: 'open', recur: 1,
            events: [{ at: ins.date, text: 'Created from ' + ins.id + ' (AI detection, confidence ' + Math.round(88 + R() * 10) + '%)' }],
          };
          TASKS.push(t); open[vid] = t;
        } else if (fail && cur) {
          cur.recur++;
        } else if (!fail && cur) {
          cur.status = 'resolved'; cur.resolved = ins.date;
          cur.events.push({ at: ins.date, text: 'AI re-verification passed on ' + ins.id + ' — resolved automatically' });
          delete open[vid];
        }
      });
    });
    Object.values(open).forEach((t) => {
      const age = (today - t.created) / DAY;
      const roll = R();
      if (age > 1 && roll < 0.4) { t.status = 'progress'; t.events.push({ at: new Date(t.created.getTime() + DAY * 1.2), text: t.assignee + ' started work' }); }
      else if (roll > 0.82) { t.status = 'review'; t.events.push({ at: new Date(today.getTime() - DAY * 0.4), text: t.assignee + ' uploaded fix photo — awaiting AI verification' }); }
    });
  });
  TASKS.sort((a, b) => a.due - b.due);

  /* ---------- derived helpers ---------- */
  const latestIns = (oid) => INSPECTIONS.find((i) => i.outlet === oid);
  const series = (oid) => INSPECTIONS.filter((i) => i.outlet === oid).sort((a, b) => a.date - b.date).map((i) => i.score);
  const repeats = (oid, minCount) => {
    const out = {};
    INSPECTIONS.filter((i) => i.outlet === oid).forEach((i) => i.fails.forEach((f) => (out[f] = (out[f] || 0) + 1)));
    return Object.entries(out).filter(([, c]) => c >= (minCount || 4)).sort((a, b) => b[1] - a[1]).map(([vid, count]) => ({ vid, count }));
  };
  const networkSeries = () => {
    const arr = [];
    for (let w = WEEKS - 1; w >= 0; w--) {
      const xs = INSPECTIONS.filter((i) => i.week === w);
      arr.push({ week: w, avg: xs.reduce((a, i) => a + i.score, 0) / xs.length, n: xs.length, date: daysAgo(w * 7) });
    }
    return arr;
  };

  window.QC = { COMPANY, CATS, CAT, SEV, VIOL, VIDS, OUTLETS, OUT, INSPECTIONS, INS, TASKS, WEEKS, DAY, today, latestIns, series, repeats, networkSeries, rng };
})();
