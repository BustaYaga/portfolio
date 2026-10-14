/**
 * Portfolio Package - ES Module Entrypoint
 */
import { CertsPanel } from './modules/certs.js';
import { ThreatFeed } from './modules/threat-feed.js';
import { DedsecFeed } from './modules/dedsec-feed.js';
import { Terminal } from './modules/terminal.js';
import { ModeManager } from './modules/modes.js';
import { Navigation } from './modules/navigation.js';
import { Greeting } from './modules/greeting.js';
import { NameGlitch } from './modules/glitch.js';
import { CsMode } from './modules/csmode.js';
import { Theme } from './modules/theme.js';
import { PORTFOLIO_CONTENT, applyContent, CERTIFICATIONS } from './modules/content.js';
import * as Config from './modules/config.js';
import { CHOICE_KEY } from './modules/config.js';
import { SysMonitor } from './modules/sysmonitor.js';
import { GithubActivity } from './modules/github-activity.js';

export { ThreatFeed, DedsecFeed, Terminal, ModeManager, Navigation, SysMonitor, GithubActivity, Config, PORTFOLIO_CONTENT as Content, applyContent };

export class PortfolioApp {
  constructor() {
    this.threatFeed = new ThreatFeed();
    this.dedsecFeed = new DedsecFeed();
    this.terminal = new Terminal();
    this.certs = new CertsPanel({ certifications: CERTIFICATIONS });
    this.sysMonitor = new SysMonitor();
    this.githubActivity = new GithubActivity();
    this.modes = new ModeManager({
      threatFeed: this.threatFeed,
      dedsecFeed: this.dedsecFeed,
      terminal: this.terminal,
      sysMonitor: this.sysMonitor,
    });
    this.navigation = new Navigation({ modeManager: this.modes, terminal: this.terminal });
    this.greeting = new Greeting();
    this.theme = new Theme();
    this.nameGlitch = new NameGlitch();
    this.csMode = new CsMode({
      feeds: { dedsec: this.dedsecFeed, threat: this.threatFeed },
      sysMonitor: this.sysMonitor,
      githubActivity: this.githubActivity,
    });
  }

  init() {
    applyContent();
    this.threatFeed.init();
    this.dedsecFeed.init();
    this.sysMonitor.init();
    this.sysMonitor.start();
    this.githubActivity.init();
    this.certs.init();

    // Reveal the requested panel and bring it into view, so typed terminal
    // commands navigate the same way the navbar links do.
    this.terminal.onPanelRequested = (panel) => {
      if (!this.modes.showPanel(panel)) return;
      const viewport = document.getElementById('viewport');
      if (viewport) {
        viewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    this.terminal.onRecruiterRequested = () => this.modes.toggleRecruiterMode();
    this.terminal.onCsRequested = () => this.csMode.toggle();
    this.terminal.init();

    this.modes.init();
    this.navigation.init();
    this.theme.init();

    // Rotating hero greeting (Hi / Hello / Howdy / Hey / Namaste) — kept as a
    // feature but disabled for now; the hero shows a static "Hi". Re-enable by
    // uncommenting the line below.
    // this.greeting.init();

    this.nameGlitch.init();
    this.watchRecruiterGlitch();

    this.setupIntroGate();
  }

  // Start the hero name glitch once the recruiter view is actually visible
  // (and again is a no-op, since the glitch is idempotent and one-shot).
  watchRecruiterGlitch() {
    const startIfRecruiter = () => {
      if (document.body.dataset.terminal === 'off') this.nameGlitch.start();
    };
    startIfRecruiter();
    const observer = new MutationObserver(startIfRecruiter);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-terminal'] });
  }

  // First-time visitors pick a view (recruiter vs technical) at the intro gate.
  // Returning visitors skip it (the gate is hidden before first paint by the
  // inline head script) and resume their stored mode.
  setupIntroGate() {
    const gate = document.getElementById('intro-gate');

    let hasChosen = false;
    try {
      hasChosen = !!localStorage.getItem(CHOICE_KEY);
    } catch {
      hasChosen = false;
    }

    // Boot the shell only when the terminal view is already the active one.
    const bootIfTerminal = () => {
      if (this.modes.currentMode === 'on') this.terminal.typeBoot();
    };

    // No gate in the DOM, or the visitor already chose: behave as before.
    if (!gate || hasChosen) {
      if (gate) gate.remove();
      bootIfTerminal();
      return;
    }

    // First visit: hold the engineer experience (no boot, no live feeds)
    // behind the gate until a choice is made.
    this.threatFeed.stop();
    this.dedsecFeed.stop();
    this.sysMonitor.stop();

    const choose = (choice) => {
      try {
        localStorage.setItem(CHOICE_KEY, choice);
      } catch {
        /* storage may be restricted */
      }
      gate.classList.add('intro-gate--dismissed');
      setTimeout(() => gate.remove(), 450);

      if (choice === 'recruiter') {
        this.modes.setRecruiterMode(1);
      } else {
        this.modes.setRecruiterMode(0);
        this.terminal.typeBoot();
        this.terminal.focus();
      }
    };

    gate.querySelectorAll('[data-gate-choice]').forEach((btn) => {
      btn.addEventListener('click', () => choose(btn.dataset.gateChoice));
    });

    // Keyboard/accessibility: focus the first choice.
    const first = gate.querySelector('[data-gate-choice]');
    if (first) first.focus();
  }
}

export default PortfolioApp;

// -------------------------------------------------------------
// BOOTSTRAP
// Nothing above this point ever ran in the browser: the class was
// defined and exported, but no instance was created and init()
// was never called. This is what actually starts the app.
// -------------------------------------------------------------
function bootstrap() {
  const app = new PortfolioApp();
  app.init();

  // Exposed for debugging/parity with the legacy bundle (window.PortfolioPackage)
  if (typeof window !== 'undefined') {
    window.PortfolioApp = app;
  }

  return app;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
}
