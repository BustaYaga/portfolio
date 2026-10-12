/**
 * Portfolio Package - ES Module Entrypoint
 */
import { CertsPanel } from './modules/certs.js';
import { ThreatFeed } from './modules/threat-feed.js';
import { DedsecFeed } from './modules/dedsec-feed.js';
import { Terminal } from './modules/terminal.js';
import { ModeManager } from './modules/modes.js';
import { Navigation } from './modules/navigation.js';
import { PORTFOLIO_CONTENT, applyContent, CERTIFICATIONS } from './modules/content.js';
import * as Config from './modules/config.js';
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
  }

  init() {
    applyContent();
    this.threatFeed.init();
    this.dedsecFeed.init();
    this.sysMonitor.init();
    this.sysMonitor.start();
    this.githubActivity.init();
    this.certs.init();

    this.terminal.onPanelRequested = (panel) => this.modes.showPanel(panel);
    this.terminal.onRecruiterRequested = () => this.modes.toggleRecruiterMode();
    this.terminal.init();

    this.modes.init();
    this.navigation.init();

    if (this.modes.currentMode === 'on') {
      this.terminal.typeBoot();
    }
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
