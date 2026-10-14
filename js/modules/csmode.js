/**
 * CS Mode (hidden easter egg)
 * Triggered by `sudo cs` once the user is a (fake) superuser.
 *
 * Flow:
 *  1. A full-screen 50%-black overlay shows the quote, on top of everything.
 *  2. The overlay fades and the site enters "CS mode": an interactive canvas
 *     background, the two ambient .log feeds become weapon-skin tickers, and
 *     the btop dashboard (system monitor + git log) shows CS2-style stats.
 *  3. A floating button, a second `sudo cs`, or Escape exits and restores
 *     everything.
 *
 * No third-party assets are used — all content is text/canvas drawn here.
 */

import { prefersReducedMotion } from './config.js';

const QUOTE = 'bingo bongo bango, bish bash bosh';

// rarity → color class (mil=blue, res=purple, class=pink, covert=red, knife=gold)
const SKINS = [
  ['AK-47 | Redline', 'Field-Tested', 'covert'],
  ['AWP | Asiimov', 'Battle-Scarred', 'covert'],
  ['M4A4 | Howl', 'Minimal Wear', 'covert'],
  ['Desert Eagle | Blaze', 'Factory New', 'class'],
  ['USP-S | Kill Confirmed', 'Minimal Wear', 'covert'],
  ['Glock-18 | Fade', 'Factory New', 'class'],
  ['★ Karambit | Doppler', 'Factory New', 'knife'],
  ['★ Butterfly Knife | Fade', 'Factory New', 'knife'],
  ['AWP | Dragon Lore', 'Field-Tested', 'covert'],
  ['P250 | Nuclear Threat', 'Factory New', 'class'],
  ['MP9 | Hot Rod', 'Factory New', 'res'],
  ['FAMAS | Roll Cage', 'Minimal Wear', 'res'],
  ['Five-SeveN | Case Hardened', 'Field-Tested', 'res'],
  ['SSG 08 | Blood in the Water', 'Minimal Wear', 'covert'],
  ['P2000 | Ocean Foam', 'Factory New', 'mil'],
  ['Nova | Walnut', 'Field-Tested', 'mil'],
  ['★ Gloves | Crimson Kimono', 'Field-Tested', 'knife'],
  ['Sticker | Crown (Foil)', 'n/a', 'class'],
];

const STATS = [
  // 'range' values drift dynamically within [min, max]
  { label: 'Players online', type: 'range', min: 820000, max: 1420000 },
  { label: 'Servers online', type: 'range', min: 200000, max: 210000 },
  { label: 'Active matches', type: 'range', min: 180000, max: 200000 },
  // 'counter' values only ever tick upward, by 1–5 at random intervals
  { label: 'Accounts VAC-banned (24h)', type: 'counter', start: 12000 },
  { label: 'Cases opened (24h)', type: 'counter', start: 3400000 },
  { label: 'Chickens fed', type: 'counter', start: 420000 },
];

const DROPS = [
  ['✔ won 16–13 on Mirage', 'ok'],
  ['✖ lost 14–16 on Inferno', 'err'],
  ['✔ won 16–9 on Nuke', 'ok'],
  ['+ drop: Sticker | Crown (Foil)', 'rare'],
  ['+ rare drop: ★ Butterfly Knife | Fade', 'rare'],
  ['traded up 10× Mil-Spec → 1 Classified', 'ok'],
  ['✔ clutch 1v3 won on A site', 'ok'],
  ['✖ lost 13–16 on Ancient', 'err'],
  ['+ drop: AK-47 | Redline (FT)', 'rare'],
  ['rank up: Legendary Eagle → Supreme', 'ok'],
  ['✔ ace on Overpass (5k)', 'ok'],
  ['fed a chicken. it was grateful.', 'muted'],
];

const fmt = (n) => n.toLocaleString('en-US');
const rand = (min, max) => Math.floor(min + Math.random() * (max - min));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export class CsMode {
  constructor(options = {}) {
    this.feeds = options.feeds || {};
    this.sysMonitor = options.sysMonitor || null;
    this.githubActivity = options.githubActivity || null;
    this.active = false;
    this.timers = [];
    this.raf = null;
    this.canvas = null;
    this.onKey = null;
    this.origTitles = {};
  }

  track(fn, delay) {
    const id = setTimeout(fn, delay);
    this.timers.push(id);
    return id;
  }

  toggle() {
    if (this.active) this.deactivate();
    else this.activate();
  }

  activate() {
    if (this.active) return;
    this.active = true;
    document.body.classList.add('cs-mode');

    const ov = document.createElement('div');
    ov.className = 'cs-overlay';
    ov.id = 'csOverlay';
    ov.innerHTML = `<p class="cs-overlay-quote" data-text="${QUOTE}">${QUOTE}</p>`;
    document.body.appendChild(ov);
    // force reflow then fade in
    void ov.offsetWidth;
    ov.classList.add('cs-overlay--in');

    this.track(() => {
      ov.classList.remove('cs-overlay--in');
      ov.classList.add('cs-overlay--out');
      this.track(() => ov.remove(), 700);
      this.enterFull();
    }, 2800);
  }

  enterFull() {
    if (!this.active) return;
    this.startCanvas();
    this.hijackFeeds();
    this.hijackStats();
    this.addExitButton();

    this.onKey = (e) => {
      if (e.key === 'Escape') this.deactivate();
    };
    document.addEventListener('keydown', this.onKey);
  }

  // ---- interactive canvas background ----
  startCanvas() {
    const canvas = document.createElement('canvas');
    canvas.className = 'cs-canvas';
    document.body.appendChild(canvas);
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');

    let w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    this._resize = resize;
    window.addEventListener('resize', resize);

    const N = 70;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 1.8 + 0.4,
    }));
    const mouse = { x: w / 2, y: h / 2 };
    this._mouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', this._mouse);

    if (prefersReducedMotion()) {
      // single static frame, no crosshair — keep the OS cursor visible
      ctx.fillStyle = 'rgba(10,9,7,1)';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    // crosshair replaces the OS cursor
    document.body.classList.add('cs-nocursor');

    // Hyprland-style emergence: the CS background grows from the centre as an
    // expanding circle until it covers the viewport.
    if (canvas.animate) {
      const endRadius = Math.hypot(w, h) / 2;
      canvas.animate(
        { clipPath: [`circle(0px at 50% 50%)`, `circle(${endRadius}px at 50% 50%)`] },
        { duration: 700, easing: 'ease-out' }
      );
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 9, 7, 0.35)';
      ctx.fillRect(0, 0, w, h);

      // drifting tracer particles + links
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 150, 40, 0.8)';
        ctx.fill();
        // link to nearby
        for (let j = i + 1; j < parts.length; j++) {
          const q = parts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 120 * 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(90, 200, 255, ${0.14 * (1 - d2 / 14400)})`;
            ctx.stroke();
          }
        }
      }

      // crosshair that follows the mouse
      ctx.strokeStyle = 'rgba(120, 255, 170, 0.8)';
      ctx.lineWidth = 1.5;
      const g = 6, len = 14;
      ctx.beginPath();
      ctx.moveTo(mouse.x - g - len, mouse.y); ctx.lineTo(mouse.x - g, mouse.y);
      ctx.moveTo(mouse.x + g, mouse.y); ctx.lineTo(mouse.x + g + len, mouse.y);
      ctx.moveTo(mouse.x, mouse.y - g - len); ctx.lineTo(mouse.x, mouse.y - g);
      ctx.moveTo(mouse.x, mouse.y + g); ctx.lineTo(mouse.x, mouse.y + g + len);
      ctx.stroke();

      this.raf = requestAnimationFrame(draw);
    };
    draw();
  }

  // ---- ambient .log feeds -> weapon skin tickers ----
  hijackFeeds() {
    const setup = (feed, titleSel, title) => {
      if (!feed) return;
      if (feed.stop) feed.stop();
      const titleEl = document.querySelector(titleSel);
      if (titleEl) {
        this.origTitles[titleSel] = titleEl.textContent;
        titleEl.textContent = title;
      }
      const body = feed.body;
      if (!body) return;
      body.innerHTML = '';
      const addSkin = () => {
        const [name, wear, rarity] = pick(SKINS);
        const row = document.createElement('p');
        row.innerHTML =
          `<span class="cs-rar cs-rar-${rarity}">▮</span> ${name}` +
          (wear !== 'n/a' ? ` <span class="cs-wear">(${wear})</span>` : '');
        body.prepend(row);
        while (body.children.length > 6) body.lastElementChild.remove();
      };
      for (let i = 0; i < 4; i++) addSkin();
      const loop = () => { if (!this.active) return; addSkin(); this.track(loop, rand(1100, 2400)); };
      this.track(loop, rand(1100, 2400));
    };
    setup(this.feeds.dedsec, '.dedsec-feed-title', 'inventory.loot');
    setup(this.feeds.threat, '.threat-feed-title', 'market.feed');
  }

  // ---- btop dashboard -> CS2 stats ----
  hijackStats() {
    // system monitor -> live CS stats
    if (this.sysMonitor && this.sysMonitor.stop) this.sysMonitor.stop();
    const sys = document.getElementById('sysMonitor');
    const sysTitle = document.querySelector('#sysMonitorCard .widget-card-title');
    if (sysTitle) { this.origTitles.sys = sysTitle.textContent; sysTitle.textContent = 'cs2-stats.live'; }
    if (sys) {
      // seed current values
      this.statState = STATS.map((s) =>
        s.type === 'counter' ? s.start : rand(s.min, s.max)
      );
      sys.innerHTML = STATS.map((s, i) =>
        `<div class="cs-stat"><span class="cs-stat-label">${s.label}</span>` +
        `<span class="cs-stat-val" id="csstat-${i}">${fmt(this.statState[i])}</span></div>`
      ).join('');

      const setVal = (i) => {
        const el = document.getElementById(`csstat-${i}`);
        if (el) el.textContent = fmt(this.statState[i]);
      };

      // range stats drift gently within their band for a live feel
      const fluctuate = () => {
        if (!this.active) return;
        STATS.forEach((s, i) => {
          if (s.type !== 'range') return;
          const span = s.max - s.min;
          const delta = Math.round((Math.random() - 0.5) * span * 0.08);
          this.statState[i] = Math.min(s.max, Math.max(s.min, this.statState[i] + delta));
          setVal(i);
        });
        this.track(fluctuate, rand(1200, 2200));
      };
      this.track(fluctuate, 1200);

      // counters only increase: +1..5 on each stat's own random interval
      STATS.forEach((s, i) => {
        if (s.type !== 'counter') return;
        const bump = () => {
          if (!this.active) return;
          this.statState[i] += rand(1, 6); // 1..5
          setVal(i);
          this.track(bump, rand(700, 3000));
        };
        this.track(bump, rand(700, 3000));
      });
    }

    // git log -> match / drop feed
    const ghTitle = document.querySelector('#ghActivityCard .widget-card-title');
    if (ghTitle) { this.origTitles.gh = ghTitle.textContent; ghTitle.textContent = 'cs2 match history'; }
    const ghStatus = document.getElementById('ghActivityStatus');
    if (ghStatus) ghStatus.style.display = 'none';
    const ghList = document.getElementById('ghActivityList');
    if (ghList) {
      const addDrop = () => {
        const [text, kind] = pick(DROPS);
        const row = document.createElement('div');
        row.className = `cs-drop cs-drop-${kind}`;
        row.textContent = text;
        ghList.prepend(row);
        while (ghList.children.length > 6) ghList.lastElementChild.remove();
      };
      ghList.innerHTML = '';
      for (let i = 0; i < 5; i++) addDrop();
      const loop = () => { if (!this.active) return; addDrop(); this.track(loop, rand(1800, 3600)); };
      this.track(loop, rand(1800, 3600));
    }
  }

  addExitButton() {
    const btn = document.createElement('button');
    btn.className = 'cs-exit';
    btn.id = 'csExit';
    btn.type = 'button';
    btn.textContent = '[ exit cs2 ]';
    btn.addEventListener('click', () => this.deactivate());
    document.body.appendChild(btn);
  }

  deactivate() {
    if (!this.active) return;
    this.active = false;

    this.timers.forEach(clearTimeout);
    this.timers = [];
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;

    if (this._resize) window.removeEventListener('resize', this._resize);
    if (this._mouse) window.removeEventListener('mousemove', this._mouse);
    if (this.onKey) document.removeEventListener('keydown', this.onKey);
    if (this.canvas) this.canvas.remove();
    this.canvas = null;

    const ov = document.getElementById('csOverlay');
    if (ov) ov.remove();
    const btn = document.getElementById('csExit');
    if (btn) btn.remove();

    // restore titles
    Object.entries(this.origTitles).forEach(([key, text]) => {
      if (key === 'sys') { const el = document.querySelector('#sysMonitorCard .widget-card-title'); if (el) el.textContent = text; }
      else if (key === 'gh') { const el = document.querySelector('#ghActivityCard .widget-card-title'); if (el) el.textContent = text; }
      else { const el = document.querySelector(key); if (el) el.textContent = text; }
    });
    this.origTitles = {};

    const ghStatus = document.getElementById('ghActivityStatus');
    if (ghStatus) ghStatus.style.display = '';

    document.body.classList.remove('cs-mode', 'cs-nocursor');

    // restore live widgets
    if (this.feeds.dedsec && this.feeds.dedsec.body) this.feeds.dedsec.body.innerHTML = '';
    if (this.feeds.threat && this.feeds.threat.body) this.feeds.threat.body.innerHTML = '';
    if (this.feeds.dedsec && this.feeds.dedsec.start) this.feeds.dedsec.start();
    if (this.feeds.threat && this.feeds.threat.start) this.feeds.threat.start();
    // Rebuild the system monitor (CS mode replaced its DOM), then resume it.
    if (this.sysMonitor && this.sysMonitor.init) this.sysMonitor.init();
    if (this.sysMonitor && this.sysMonitor.start) this.sysMonitor.start();
    if (this.githubActivity && this.githubActivity.init) this.githubActivity.init();
  }
}
