/**
 * Theme Module
 * Light / dark toggle with a Hyprland-style circular reveal: the new theme
 * expands from the toggle button as a growing circle (via the View Transitions
 * API). Falls back to an instant switch where that API is unavailable, and
 * honours prefers-reduced-motion.
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

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => this.apply(next));

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 520,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  }
}
