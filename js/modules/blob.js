/**
 * Blob Module
 * The ambient orange glow slowly chases the cursor. When the page loses focus
 * (blur or hidden tab), it roams to random points instead. Movement is a heavy
 * lerp, so it always drifts rather than snaps. Disabled under reduced-motion.
 */

import { prefersReducedMotion } from './config.js';

export class Blob {
  constructor(options = {}) {
    this.ease = options.ease || 0.015; // very slow follow
    this.el = null;
    this.x = 0; this.y = 0;      // current
    this.tx = 0; this.ty = 0;    // target
    this.following = true;
    this.roamTimer = null;
    this.raf = null;
  }

  init() {
    this.el = document.querySelector('.bg-blob');
    if (!this.el || prefersReducedMotion()) return;

    this.x = this.tx = window.innerWidth / 2;
    this.y = this.ty = window.innerHeight * 0.3;

    window.addEventListener('mousemove', (e) => {
      if (this.following) { this.tx = e.clientX; this.ty = e.clientY; }
    });
    window.addEventListener('blur', () => this.setFollowing(false));
    window.addEventListener('focus', () => this.setFollowing(true));
    document.addEventListener('visibilitychange', () => this.setFollowing(!document.hidden));

    if (!document.hasFocus()) this.setFollowing(false);
    this.tick();
  }

  setFollowing(on) {
    this.following = on;
    if (!on) {
      // roam: pick a fresh random target periodically
      this.pickRoam();
      if (!this.roamTimer) this.roamTimer = setInterval(() => this.pickRoam(), 3200);
    } else if (this.roamTimer) {
      clearInterval(this.roamTimer);
      this.roamTimer = null;
    }
  }

  pickRoam() {
    this.tx = Math.random() * window.innerWidth;
    this.ty = Math.random() * window.innerHeight;
  }

  tick() {
    this.x += (this.tx - this.x) * this.ease;
    this.y += (this.ty - this.y) * this.ease;
    if (this.el) this.el.style.transform = `translate(${this.x}px, ${this.y}px)`;
    this.raf = requestAnimationFrame(() => this.tick());
  }
}
