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
import { Sections } from './modules/sections.js';
import { Blob } from './modules/blob.js';
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
    this.sections = new Sections();
    this.blob = new Blob();
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
      // Typewriter the heading + fade the body when a panel opens.
      this.sections.playNow(document.getElementById(`panel-${panel}`));
      const viewport = document.getElementById('viewport');
      if (viewport) {
        viewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    this.terminal.onRecruiterRequested = () => this.modes.toggleRecruiterMode();
    this.terminal.onCsRequested = () => this.csMode.toggle();
    this.terminal.onThemeRequested = (mode) => {
      const next = mode || (this.theme.current === 'light' ? 'dark' : 'light');
      this.theme.switchTo(next);
    };
    this.terminal.init();

    this.modes.init();
    this.navigation.init();
    this.theme.init();

    // Rotating hero greeting (Hi / Hello / Howdy / Hey / Namaste) — kept as a
    // feature but disabled for now; the hero shows a static "Hi". Re-enable by
    // uncommenting the line below.
    // this.greeting.init();

    this.nameGlitch.init();
    this.sections.init();
    this.blob.init();
    this.watchRecruiter();

    this.setupIntroGate();
  }

  // Run the recruiter entry sequence whenever the recruiter view becomes active.
  watchRecruiter() {
    const enterIfRecruiter = () => {
      if (document.body.dataset.terminal === 'off') this.enterRecruiter();
    };
    enterIfRecruiter();
    const observer = new MutationObserver(enterIfRecruiter);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-terminal'] });
  }

  // Fade-IN only, staged: everything starts hidden; reveal the title (typed),
  // then the description, then resume/contact, then the facts, then the
  // sections — each step waiting for the previous one to settle.
  async enterRecruiter() {
    const inner = document.querySelector('.rv-hero-inner');
    if (!inner) return;
    const greet = document.getElementById('greetWord');
    const mid = document.getElementById('greetMid');
    const name = document.getElementById('heroName');
    const status = inner.querySelector('.rv-status');
    const role = inner.querySelector('.rv-role');
    const pitch = inner.querySelector('.rv-pitch');
    const cta = inner.querySelector('.rv-cta');
    const facts = inner.querySelector('.rv-facts');
    const parts = [status, role, pitch, cta, facts];

    const reveal = (el) => el && el.classList.add('rv-in');
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const finish = () => { this.nameGlitch.start(); this.sections.armRecruiter(); };

    // reset to the hidden resting state with transitions off, so re-entering
    // recruiter mode never produces a fade-OUT (fade-in only).
    inner.classList.add('no-anim');
    parts.forEach((el) => el && el.classList.remove('rv-in'));
    void inner.offsetWidth; // flush the instant reset
    inner.classList.remove('no-anim');

    if (greet) greet.textContent = '';
    if (mid) mid.textContent = '';
    if (name) { name.textContent = ''; name.setAttribute('data-text', ''); }

    if (Config.prefersReducedMotion()) {
      if (greet) greet.textContent = 'Hi';
      if (mid) mid.textContent = ", I'm ";
      if (name) { name.textContent = 'Anmol Chaudhary'; name.setAttribute('data-text', 'Anmol Chaudhary'); }
      parts.forEach(reveal);
      finish();
      return;
    }

    const STEP = 620; // pause between fade-in stages

    // 1) status badge, then typewriter the hero title
    reveal(status);
    await wait(260);
    await this.typeInto(greet, 'Hi');
    await this.typeInto(mid, ", I'm ");
    await this.typeInto(name, 'Anmol Chaudhary');
    if (name) name.setAttribute('data-text', 'Anmol Chaudhary');

    // 2) role subtitle + description
    reveal(role);
    await wait(380);
    reveal(pitch);
    await wait(STEP);

    // 3) resume / email / contact
    reveal(cta);
    await wait(STEP);

    // 4) looking-for / based-in / notice-period
    reveal(facts);
    await wait(STEP);

    // 5) capabilities and the rest (typewriter heading + body fade)
    finish();
  }

  typeInto(el, text, speed = 58) {
    return new Promise((resolve) => {
      if (!el) { resolve(); return; }
      el.classList.add('tw-caret');
      let i = 0;
      const step = () => {
        i += 1;
        el.textContent = text.slice(0, i);
        if (i < text.length) {
          setTimeout(step, speed + Math.random() * 28);
        } else {
          el.classList.remove('tw-caret');
          resolve();
        }
      };
      step();
    });
  }

  // One-time pop-in for the ambient .log feeds when the terminal first starts.
  popFeeds() {
    if (this._feedsPopped) return;
    this._feedsPopped = true;
    ['dedsec-feed', 'threat-feed'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add('feed-pop');
      setTimeout(() => el.classList.remove('feed-pop'), 750);
    });
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
      if (this.modes.currentMode === 'on') {
        this.terminal.typeBoot();
        this.popFeeds();
      }
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
        this.popFeeds();
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
