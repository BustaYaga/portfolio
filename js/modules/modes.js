/**
 * Modes Module
 * Coordinates Recruiter Mode toggle state (0 = terminal on, 1 = recruiter mode / terminal off).
 * Dynamically handles all content panels.
 */

import { STORAGE_KEY } from './config.js';

export class ModeManager {
  constructor(options = {}) {
    this.threatFeed = options.threatFeed || null;
    this.terminal = options.terminal || null;
    this.toggleBtn = null;
    this.viewportEl = null;
    this.recruiterMode = 0; // 0 = standard terminal mode, 1 = recruiter mode
  }

  init() {
    this.toggleBtn = document.getElementById('recruiterToggle') || document.getElementById('terminalToggle');
    this.viewportEl = document.getElementById('viewport');

    this.recruiterMode = this.getStoredMode();
    this.applyRecruiterMode(this.recruiterMode, { isInitial: true });

    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleRecruiterMode();
      });
    }

    // Also support any nav elements with data-cmd="recruiter"
    document.querySelectorAll('[data-cmd="recruiter"]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggleRecruiterMode();
      });
    });
  }

  getStoredMode() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === '1' ? 1 : 0;
    } catch {
      return 0;
    }
  }

  storeMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode.toString());
    } catch {
      // storage may be restricted in private browsing
    }
  }

  getAllPanels() {
    return Array.from(document.querySelectorAll('#viewport .panel'));
  }

  showAllPanels() {
    const panels = this.getAllPanels();
    panels.forEach((panel) => {
      panel.hidden = panel.id === 'panel-dashboard';
    });
  }

  showPanel(name) {
    const targetId = `panel-${name}`;
    const panels = this.getAllPanels();
    let found = false;

    panels.forEach((panel) => {
      if (panel.id === targetId) {
        panel.hidden = false;
        found = true;
      } else {
        panel.hidden = true;
      }
    });

    return found;
  }

  applyRecruiterMode(mode, options = {}) {
    this.recruiterMode = mode === 1 ? 1 : 0;
    const isRecruiterActive = this.recruiterMode === 1;

    // Body state: when recruiter is 1, terminal is off
    document.body.dataset.terminal = isRecruiterActive ? 'off' : 'on';
    document.body.dataset.recruiter = isRecruiterActive ? '1' : '0';

    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-checked', isRecruiterActive ? 'true' : 'false');
    }

    // Update nav links styling
    document.querySelectorAll('.nav-recruiter').forEach((el) => {
      if (isRecruiterActive) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    if (isRecruiterActive) {
      if (this.threatFeed) {
        this.threatFeed.stop();
      }
      this.showAllPanels();

      if (!options.isInitial) {
        const recruiterPanel = document.getElementById('panel-recruiter');
        if (recruiterPanel) {
          recruiterPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (this.viewportEl) {
          this.viewportEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } else {
      this.showPanel('dashboard');
      if (this.threatFeed) {
        this.threatFeed.start();
      }

      if (!options.isInitial) {
        const topEl = document.getElementById('top');
        if (topEl) {
          topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        if (this.terminal) {
          this.terminal.focus();
        }
      }
    }
  }

  toggleRecruiterMode() {
    const nextMode = this.recruiterMode === 1 ? 0 : 1;
    this.setRecruiterMode(nextMode);

    // Ripple flash feedback on toggle knob
    if (this.toggleBtn) {
      const knob = this.toggleBtn.querySelector('.recruiter-toggle-knob, .term-toggle-knob');
      if (knob) {
        knob.classList.remove('flash');
        void knob.offsetWidth;
        knob.classList.add('flash');
      }
    }

    if (nextMode === 0 && this.terminal) {
      this.terminal.printLine('[recruiter mode: 0 (disabled)] restoring interactive shell...', 'out font-binary');
      this.terminal.focus();
    } else if (nextMode === 1 && this.terminal) {
      this.terminal.printLine('[recruiter mode: 1 (enabled)] switching to full document portfolio...', 'out font-binary');
    }
  }

  setRecruiterMode(mode) {
    this.applyRecruiterMode(mode);
    this.storeMode(mode);
  }

  enableRecruiterMode() {
    this.setRecruiterMode(1);
  }

  disableRecruiterMode() {
    this.setRecruiterMode(0);
  }

  get currentMode() {
    return this.recruiterMode === 1 ? 'off' : 'on';
  }
}
