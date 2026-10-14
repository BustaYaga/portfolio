/**
 * Name Glitch Module
 * Adds a cybersecurity-style glitch to the recruiter hero name.
 *
 * Behaviour:
 *  - After the recruiter view becomes visible, the name glitches in short
 *    bursts at random intervals for random durations.
 *  - After a few bursts it runs a one-time "reveal" finale: it reverse-types
 *    (un-types) "Anmol Chaudhary", types out the alias "bustayaga", holds it
 *    briefly, then reverse-types that and re-types the real name.
 *  - Once the finale completes it settles on "Anmol Chaudhary" and never
 *    glitches again.
 *  - Disabled entirely under prefers-reduced-motion.
 */

import { prefersReducedMotion } from './config.js';

export class NameGlitch {
  constructor(options = {}) {
    this.el = null;
    this.realName = options.realName || 'Anmol Chaudhary';
    this.alias = options.alias || 'bustayaga';
    this.started = false;
    this.done = false;
    this.timers = [];
    // Run 2–4 purely-visual bursts before the one-time reveal finale.
    this.burstsBeforeFinale = 2 + Math.floor(Math.random() * 3);
    this.burstCount = 0;
  }

  init() {
    this.el = document.getElementById('heroName');
    if (!this.el) return;
    this.setText(this.realName);
  }

  // Keep textContent and data-text (used by the CSS glitch layers) in sync.
  setText(text) {
    this.el.textContent = text;
    this.el.setAttribute('data-text', text);
  }

  rand(min, max) {
    return min + Math.random() * (max - min);
  }

  track(fn, delay) {
    const id = setTimeout(fn, delay);
    this.timers.push(id);
    return id;
  }

  sleep(ms) {
    return new Promise((resolve) => this.track(resolve, ms));
  }

  // Idempotent: safe to call on every switch into recruiter mode.
  start() {
    if (!this.el || this.started) return;
    this.started = true;
    if (prefersReducedMotion()) {
      this.done = true;
      return;
    }
    this.scheduleNext();
  }

  scheduleNext() {
    if (this.done) return;
    this.track(() => this.tick(), this.rand(2600, 6200));
  }

  tick() {
    if (this.done) return;
    if (this.burstCount >= this.burstsBeforeFinale) {
      this.finale();
      return;
    }
    this.burstCount++;
    this.burst(() => this.scheduleNext());
  }

  // A short visual glitch flicker, random duration.
  burst(onDone) {
    this.el.classList.add('rv-name--glitch');
    this.track(() => {
      this.el.classList.remove('rv-name--glitch');
      if (onDone) onDone();
    }, this.rand(140, 640));
  }

  // One-time reveal: erase -> type alias -> hold -> erase -> retype real name.
  async finale() {
    this.el.classList.add('rv-name--glitch');
    await this.erase();
    await this.sleep(140);
    await this.type(this.alias);
    this.el.classList.remove('rv-name--glitch');

    await this.sleep(2200);

    this.el.classList.add('rv-name--glitch');
    await this.erase();
    await this.sleep(120);
    await this.type(this.realName);
    this.el.classList.remove('rv-name--glitch');

    this.finish();
  }

  // Reverse typewriter — like the terminal's typing, backwards.
  erase() {
    return new Promise((resolve) => {
      const step = () => {
        const cur = this.el.textContent;
        if (cur.length === 0) {
          resolve();
          return;
        }
        this.setText(cur.slice(0, -1));
        this.track(step, this.rand(32, 68));
      };
      step();
    });
  }

  type(text) {
    return new Promise((resolve) => {
      this.el.classList.add('rv-name--typing');
      let i = 0;
      const step = () => {
        i += 1;
        this.setText(text.slice(0, i));
        if (i >= text.length) {
          this.el.classList.remove('rv-name--typing');
          resolve();
          return;
        }
        this.track(step, this.rand(55, 115));
      };
      step();
    });
  }

  finish() {
    this.done = true;
    this.setText(this.realName);
    this.el.classList.remove('rv-name--glitch', 'rv-name--typing');
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  stop() {
    this.finish();
  }
}
