/**
 * Navigation Module
 * Handles mobile drawer toggle, nav link routing, dynamic content counters, and footer year.
 */

export class Navigation {
  constructor(options = {}) {
    this.modeManager = options.modeManager || null;
    this.terminal = options.terminal || null;
    this.navToggle = null;
    this.navLinks = null;
  }

  init() {
    this.navToggle = document.getElementById('navToggle');
    this.navLinks = document.getElementById('navLinks');

    this.updateYear();
    this.updateStats();
    this.setupMobileNav();
    this.setupNavLinks();
  }

  updateYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  updateStats() {
    const statProjects = document.getElementById('statProjects');
    if (statProjects) {
      statProjects.textContent = document.querySelectorAll('#panel-projects .card').length;
    }

    const statWriteups = document.getElementById('statWriteups');
    if (statWriteups) {
      statWriteups.textContent = document.querySelectorAll('#panel-writeups .wt-row:not(.wt-head)').length;
    }
  }

  setupMobileNav() {
    if (this.navToggle && this.navLinks) {
      this.navToggle.addEventListener('click', () => {
        this.navLinks.classList.toggle('open');
      });
    }
  }

  setupNavLinks() {
    if (!this.navLinks) return;

    this.navLinks.querySelectorAll('a[data-cmd]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navLinks.classList.remove('open');

        const cmd = link.dataset.cmd;

        // Recruiter mode link toggles recruiter mode (1 <-> 0)
        if (cmd === 'recruiter') {
          if (this.modeManager) {
            this.modeManager.toggleRecruiterMode();
          }
          return;
        }

        const isTerminalOff = document.body.dataset.terminal === 'off';

        if (isTerminalOff) {
          const target = document.getElementById(`panel-${cmd}`);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } else {
          // runCommand opens the panel and scrolls it into view
          if (this.terminal) {
            this.terminal.runCommand(cmd);
          }
        }
      });
    });
  }
}
