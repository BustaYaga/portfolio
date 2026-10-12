/**
 * DedSec-style Feed Module
 * Generates and cycles an ambient "hacktivist collective" operations log —
 * a sibling to ThreatFeed, same mechanics, different flavor/dataset.
 */

import { DEDSEC_OPS, DEDSEC_OPS_CATEGORIES, MAX_FEED_LINES, prefersReducedMotion } from './config.js';

export class DedsecFeed {
  constructor(options = {}) {
    this.maxLines = options.maxLines || MAX_FEED_LINES;
    this.container = null;
    this.body = null;
    this.timer = null;
    this.initialized = false;
  }

  init() {
    this.container =
      document.getElementById('dedsec-feed') ||
      document.querySelector('.dedsec-feed');

    this.body =
      document.getElementById('dedsec-feed-body') ||
      document.querySelector('.dedsec-feed-body');

    if (!this.body) {
      return false;
    }

    this.initialized = true;

    // Seed initial lines if empty so feed is never a blank box
    if (this.body.children.length === 0) {
      for (let i = 0; i < 2; i++) {
        this.pushLine();
      }
    }

    return true;
  }

  getRandomEntry() {
    const [id, name, catId] = DEDSEC_OPS[Math.floor(Math.random() * DEDSEC_OPS.length)];
    const catName = DEDSEC_OPS_CATEGORIES[catId] || 'Ops';
    return { id, name, catName };
  }

  pushLine() {
    if (!this.body) return;

    const { id, name, catName } = this.getRandomEntry();
    const p = document.createElement('p');

    const hexPrefix = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, '0')
      .toUpperCase();
    const hexSpan = document.createElement('span');
    hexSpan.className = 'font-binary';
    hexSpan.style.opacity = '0.7';
    hexSpan.style.fontSize = '0.65rem';
    hexSpan.style.marginRight = '6px';
    hexSpan.textContent = `[0x${hexPrefix}]`;

    const idSpan = document.createElement('span');
    idSpan.className = 'feed-id';
    idSpan.textContent = `[${id}]`;

    p.appendChild(hexSpan);
    p.appendChild(idSpan);
    p.appendChild(document.createTextNode(` ${name} :: ${catName}`));
    this.body.appendChild(p);

    while (this.body.children.length > this.maxLines) {
      this.body.removeChild(this.body.firstChild);
    }
  }

  scheduleNext() {
    const delay = 2600 + Math.random() * 2000;
    this.timer = setTimeout(() => {
      this.pushLine();
      this.scheduleNext();
    }, delay);
  }

  start() {
    if (!this.initialized) this.init();
    if (prefersReducedMotion() || this.timer || !this.body) return;
    this.pushLine();
    this.scheduleNext();
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  isRunning() {
    return this.timer !== null;
  }
}
