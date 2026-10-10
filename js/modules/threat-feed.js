/**
 * Threat Feed Module
 * Generates and cycles ambient MITRE ATT&CK tactic/technique logs.
 */

import { ATTACK_TACTICS, ATTACK_TECHNIQUES, MAX_FEED_LINES, prefersReducedMotion } from './config.js';

export class ThreatFeed {
  constructor(options = {}) {
    this.maxLines = options.maxLines || MAX_FEED_LINES;
    this.container = null;
    this.body = null;
    this.timer = null;
    this.initialized = false;
  }

  init() {
    this.container =
      document.getElementById('threat-feed') ||
      document.getElementById('ambientTerm') ||
      document.querySelector('.ambient-term, .threat-feed');

    this.body =
      document.getElementById('threat-feed-body') ||
      document.getElementById('ambientTermBody') ||
      document.querySelector('.ambient-term-body, .threat-feed-body');

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
    const [id, name, tacticId] =
      ATTACK_TECHNIQUES[Math.floor(Math.random() * ATTACK_TECHNIQUES.length)];
    const tacticName = ATTACK_TACTICS[tacticId] || 'Tactics';
    return { id, name, tacticName };
  }

  pushLine() {
    if (!this.body) return;

    const { id, name, tacticName } = this.getRandomEntry();
    const p = document.createElement('p');

    const binPrefix = Math.floor(Math.random() * 256).toString(2).padStart(8, '0');
    const binSpan = document.createElement('span');
    binSpan.className = 'font-binary';
    binSpan.style.opacity = '0.7';
    binSpan.style.fontSize = '0.65rem';
    binSpan.style.marginRight = '6px';
    binSpan.textContent = `[${binPrefix}]`;

    const idSpan = document.createElement('span');
    idSpan.className = 'feed-id';
    idSpan.textContent = `[${id}]`;

    p.appendChild(binSpan);
    p.appendChild(idSpan);
    p.appendChild(document.createTextNode(` ${name} :: ${tacticName}`));
    this.body.appendChild(p);

    while (this.body.children.length > this.maxLines) {
      this.body.removeChild(this.body.firstChild);
    }
  }

  scheduleNext() {
    const delay = 2200 + Math.random() * 1800;
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
