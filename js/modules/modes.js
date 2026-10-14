/**
 * Modes Module
 * Coordinates Recruiter Mode toggle state (0 = terminal on, 1 = recruiter mode / terminal off).
 * Dynamically handles all content panels.
 */

import { STORAGE_KEY } from './config.js';

export class ModeManager {
  constructor(options = {}) {
    this.threatFeed = options.threatFeed || null;
    this.dedsecFeed = options.dedsecFeed || null;
    this.terminal = options.terminal || null;
    this.sysMonitor = options.sysMonitor || null;
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

    // NOTE: data-cmd="recruiter" nav links (e.g. the #navLinks text link) are
    // wired up by Navigation.setupNavLinks(), which calls
    // modeManager.toggleRecruiterMode(). Do NOT also attach a listener here —
    // doing so double-fires the toggle on every click (on then immediately
    // off again), which made that link appear to do nothing.
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

      if (this.threatFeed) this.threatFeed.stop();
      if (this.dedsecFeed) this.dedsecFeed.stop();
      if (this.sysMonitor) this.sysMonitor.stop();
      
      this.showAllPanels();

      if (!options.isInitial) {
        // Recruiter view replaces the old text panel; land at the top of it.
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      this.showPanel('dashboard');
      
      if (this.threatFeed) this.threatFeed.start();
      if (this.dedsecFeed) this.dedsecFeed.start();
      if (this.sysMonitor) this.sysMonitor.start();

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