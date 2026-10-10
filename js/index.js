/**
 * Portfolio Package - ES Module Entrypoint
 */

import { ThreatFeed } from './modules/threat-feed.js';
import { Terminal } from './modules/terminal.js';
import { ModeManager } from './modules/modes.js';
import { Navigation } from './modules/navigation.js';
import { PORTFOLIO_CONTENT, applyContent } from './modules/content.js';
import * as Config from './modules/config.js';

export { ThreatFeed, Terminal, ModeManager, Navigation, Config, PORTFOLIO_CONTENT as Content, applyContent };

export class PortfolioApp {
  constructor() {
    this.threatFeed = new ThreatFeed();
    this.terminal = new Terminal();
    this.modes = new ModeManager({ threatFeed: this.threatFeed, terminal: this.terminal });
    this.navigation = new Navigation({ modeManager: this.modes, terminal: this.terminal });
  }

  init() {
    applyContent();
    this.threatFeed.init();

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
