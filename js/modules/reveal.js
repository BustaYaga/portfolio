/**
 * Reveal Module
 * Scroll-triggered fade + rise for recruiter-mode sections. Elements tagged
 * `.rv-reveal` start hidden (in recruiter mode only) and animate in as they
 * enter the viewport. One-shot per element; re-armed whenever recruiter mode
 * is (re)entered.
 */

export class Reveal {
  constructor(options = {}) {
    this.selector = options.selector || '.rv-reveal';
    this.observer = null;
  }

  init() {
    if (!('IntersectionObserver' in window)) return;
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('rv-reveal--in');
            this.observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
  }

  // (Re)arm all targets — call when recruiter mode becomes visible.
  start() {
    if (!this.observer) return;
    document.querySelectorAll(this.selector).forEach((el) => {
      el.classList.remove('rv-reveal--in');
      this.observer.observe(el);
    });
  }
}
