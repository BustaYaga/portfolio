/**
 * Greeting Module
 * Rotates the hero greeting word (Hi → Hello → Howdy → Hey) with a fade,
 * for the recruiter view. Respects prefers-reduced-motion.
 */

import { prefersReducedMotion } from './config.js';

export class Greeting {
  constructor(options = {}) {
    this.words = options.words || ['Hi', 'Hello', 'Howdy', 'Hey', 'Namaste'];
    this.interval = options.interval || 2400;
    this.el = null;
    this.index = 0;
    this.timer = null;
  }

  init() {
    this.el = document.getElementById('greetWord');
    if (!this.el) return;

    this.el.textContent = this.words[0];

    // Static for reduced-motion users.
    if (prefersReducedMotion()) return;

    this.timer = setInterval(() => this.next(), this.interval);
  }

  next() {
    if (!this.el) return;
    this.el.classList.add('greet-out');
    setTimeout(() => {
      this.index = (this.index + 1) % this.words.length;
      this.el.textContent = this.words[this.index];
      this.el.classList.remove('greet-out');
    }, 320);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}
