/**
 * Sections Module
 * Typewriter section headings (e.g. "$ ls ./projects") with a body that fades
 * in once the heading finishes typing. Used in both recruiter mode (triggered
 * on scroll into view) and terminal mode (triggered when a panel is shown).
 */

import { prefersReducedMotion } from './config.js';

export class Sections {
  constructor(options = {}) {
    this.speed = options.speed || 30;
    this.observer = null;
  }

  init() {
    document.querySelectorAll('.tw-section').forEach((s) => this.prepare(s));
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              this.play(e.target);
              this.observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
      );
    }
  }

  // Split the heading into its prompt + an empty .tw span that we type into.
  prepare(section) {
    const head = section.querySelector('.section-head, .rv-head');
    if (!head || head.dataset.twReady) return;
    const prompt = head.querySelector('.prompt-inline, .rv-prompt');
    let txt = '';
    head.childNodes.forEach((n) => {
      if (n !== prompt) txt += n.textContent;
    });
    txt = txt.replace(/\s+/g, ' ').trim();
    head.dataset.twReady = '1';
    head.dataset.twText = txt;
    head.innerHTML = '';
    if (prompt) {
      head.appendChild(prompt);
      head.appendChild(document.createTextNode(' '));
    }
    const tw = document.createElement('span');
    tw.className = 'tw';
    head.appendChild(tw);
  }

  reset(section) {
    section.classList.remove('tw-in');
    const tw = section.querySelector('.tw');
    if (tw) tw.textContent = '';
  }

  // Recruiter mode: reset every section and let the observer play them on scroll.
  armRecruiter() {
    const sections = document.querySelectorAll('.tw-section');
    sections.forEach((s) => this.reset(s));
    if (!this.observer) {
      sections.forEach((s) => this.play(s));
      return;
    }
    sections.forEach((s) => this.observer.observe(s));
  }

  // Terminal mode: play one section immediately (reset first so re-shows retype).
  playNow(section) {
    if (!section) return;
    this.reset(section);
    this.play(section);
  }

  play(section) {
    const head = section.querySelector('.section-head, .rv-head');
    const tw = head && head.querySelector('.tw');
    const full = head ? head.dataset.twText || '' : '';
    if (!tw || prefersReducedMotion()) {
      if (tw) tw.textContent = full;
      section.classList.add('tw-in');
      return;
    }
    tw.textContent = '';
    let i = 0;
    const step = () => {
      i += 1;
      tw.textContent = full.slice(0, i);
      if (i < full.length) {
        setTimeout(step, this.speed + Math.random() * 22);
      } else {
        section.classList.add('tw-in');
      }
    };
    step();
  }
}
