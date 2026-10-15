/**
 * Theme Module
 * Light / dark toggle with a retro pixel reveal: the new theme grows out of
 * the toggle button as a blocky, dither-rimmed circle (via the View
 * Transitions API). Falls back to an instant switch where that API is
 * unavailable, and honours prefers-reduced-motion.
 */

import { prefersReducedMotion } from './config.js';

const KEY = 'portfolio-theme';

export class Theme {
  constructor() {
    this.btn = null;
    this.revealStyle = null; // shared <style> driving the reveal clip
    this.revealToken = 0;    // bumps per switch so stale loops stop
  }

  get current() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage may be restricted */
    }
  }

  init() {
    this.btn = document.getElementById('themeToggle');
    if (!this.btn) return;
    this.btn.addEventListener('click', (e) => this.toggle(e));
  }

  toggle(e) {
    this.switchTo(this.current === 'light' ? 'dark' : 'light', e);
  }

  switchTo(next, e) {
    if (next !== 'light' && next !== 'dark') return;
    if (next === this.current) return;

    // No animation available / wanted — switch instantly.
    if (!document.startViewTransition || prefersReducedMotion()) {
      this.apply(next);
      return;
    }

    // Emergence point: the toggle button's centre (fallback to click coords).
    let x = window.innerWidth - 60;
    let y = 40;
    if (this.btn) {
      const r = this.btn.getBoundingClientRect();
      x = r.left + r.width / 2;
      y = r.top + r.height / 2;
    }
    if (e && e.clientX) { x = e.clientX; y = e.clientY; }

    // Hide the incoming snapshot *before* the transition starts, so its first
    // frame can never paint the whole new theme ahead of the reveal.
    const token = ++this.revealToken;
    if (!this.revealStyle) {
      this.revealStyle = document.createElement('style');
      document.head.appendChild(this.revealStyle);
    }
    this.setRevealClip('inset(50%)');

    const transition = document.startViewTransition(() => this.apply(next));
    transition.ready
      .then(() => this.pixelReveal(x, y, token))
      .catch(() => {});
    transition.finished.finally(() => {
      if (token === this.revealToken) this.setRevealClip(null);
    });
  }

  setRevealClip(clip) {
    this.revealStyle.textContent = clip
      ? `::view-transition-new(root){clip-path:${clip};}`
      : '';
  }

  /**
   * Retro reveal: the new theme grows from (x, y) as a single blocky circle
   * whose rim is broken up by an ordered dither, advancing in discrete steps
   * like an old console screen transition. The clip is a path of block
   * rectangles, which applies synchronously (an image mask decodes async and
   * flashes the unmasked snapshot between steps).
   */
  pixelReveal(x, y, token) {
    const CELL = 16;      // block size in CSS px
    const DURATION = 620; // ms
    const STEPS = 20;     // discrete animation frames
    const RIM = 0.14;     // width of the dithered rim, as a share of the radius
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

    const cols = Math.ceil(window.innerWidth / CELL);
    const rows = Math.ceil(window.innerHeight / CELL);
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // per-block reveal threshold in 0..1: distance from the origin, nudged by
    // the dither so the rim breaks into a checker of blocks
    const thr = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const r = Math.hypot((i + 0.5) * CELL - x, (j + 0.5) * CELL - y) / maxR;
        const dither = (BAYER[(j & 3) * 4 + (i & 3)] + 0.5) / 16;
        thr[j * cols + i] = r * (1 - RIM) + dither * RIM;
      }
    }

    // union of revealed blocks, merged into horizontal runs per row
    const pathAt = (p) => {
      let d = '';
      for (let j = 0; j < rows; j++) {
        let run = -1;
        for (let i = 0; i <= cols; i++) {
          const on = i < cols && thr[j * cols + i] <= p;
          if (on && run < 0) run = i;
          if (!on && run >= 0) {
            d += `M${run * CELL} ${j * CELL}h${(i - run) * CELL}v${CELL}h${-(i - run) * CELL}z`;
            run = -1;
          }
        }
      }
      return d ? `path('${d}')` : 'inset(50%)';
    };

    // A no-op animation keeps the view transition alive for DURATION and
    // gives a clock that respects the document's animation playback rate.
    const clock = document.documentElement.animate(
      { opacity: [1, 1] },
      { duration: DURATION, pseudoElement: '::view-transition-new(root)' }
    );

    let lastStep = -1;
    const tick = () => {
      if (token !== this.revealToken) return; // a newer switch took over
      const t = Math.min(1, (clock.currentTime || 0) / DURATION);
      const step = Math.min(STEPS, Math.floor(t * (STEPS + 1)));
      if (step !== lastStep) {
        lastStep = step;
        this.setRevealClip(step >= STEPS ? 'none' : pathAt(step / STEPS));
      }
      if (clock.playState === 'running') requestAnimationFrame(tick);
    };
    tick();
  }
}
