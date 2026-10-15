/**
 * Theme Module
 * Light / dark toggle with a retro pixel-whirlpool reveal: the new theme
 * spirals out from the toggle button in dithered blocks (via the View
 * Transitions API). Falls back to an instant switch where that API is
 * unavailable, and honours prefers-reduced-motion.
 */

import { prefersReducedMotion } from './config.js';

const KEY = 'portfolio-theme';

export class Theme {
  constructor() {
    this.btn = null;
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

    const transition = document.startViewTransition(() => this.apply(next));
    transition.ready.then(() => this.pixelWhirlpool(x, y));
  }

  /**
   * Retro reveal: the new theme appears through a mask of chunky blocks that
   * flip on in a dithered spiral (whirlpool) around (x, y), advancing in
   * discrete steps like an old console screen transition.
   */
  pixelWhirlpool(x, y) {
    const CELL = 16;          // block size in CSS px
    const DURATION = 720;     // ms
    const STEPS = 22;         // discrete animation frames
    const ARMS = 3;           // spiral arms
    const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

    const cols = Math.ceil(window.innerWidth / CELL);
    const rows = Math.ceil(window.innerHeight / CELL);
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    // per-block reveal threshold in 0..1: distance + spiral arm + dither
    const thr = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const dx = (i + 0.5) * CELL - x;
        const dy = (j + 0.5) * CELL - y;
        const r = Math.hypot(dx, dy) / maxR;
        const turn = (Math.atan2(dy, dx) / (2 * Math.PI) + 1) % 1;
        const arm = (turn * ARMS + r * 2.2) % 1;
        const dither = BAYER[(j & 3) * 4 + (i & 3)] / 16;
        thr[j * cols + i] = r * 0.62 + arm * 0.22 + dither * 0.16;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(cols, rows);
    const style = document.createElement('style');
    document.head.appendChild(style);

    // A no-op animation keeps the view transition alive for DURATION and
    // gives a clock that respects the document's animation playback rate.
    const clock = document.documentElement.animate(
      { opacity: [1, 1] },
      { duration: DURATION, pseudoElement: '::view-transition-new(root)' }
    );

    let lastStep = -1;
    const draw = (step) => {
      const p = step / STEPS;
      for (let k = 0; k < thr.length; k++) {
        img.data[k * 4 + 3] = thr[k] <= p ? 255 : 0;
      }
      ctx.putImageData(img, 0, 0);
      const url = canvas.toDataURL();
      style.textContent =
        `::view-transition-new(root){-webkit-mask:url(${url}) 0 0/${cols * CELL}px ${rows * CELL}px no-repeat;` +
        `mask:url(${url}) 0 0/${cols * CELL}px ${rows * CELL}px no-repeat;image-rendering:pixelated;}`;
    };

    const tick = () => {
      const t = Math.min(1, (clock.currentTime || 0) / DURATION);
      const step = Math.min(STEPS, Math.floor(t * (STEPS + 1)));
      if (step !== lastStep) { lastStep = step; draw(step); }
      if (clock.playState !== 'finished') requestAnimationFrame(tick);
    };
    draw(0);
    requestAnimationFrame(tick);
    clock.finished.then(() => style.remove(), () => style.remove());
  }
}
