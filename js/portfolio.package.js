/**
 * Portfolio Package (Stacked Architecture)
 * Complete, standalone package bundling all modules:
 * - Threat Feed (MITRE ATT&CK live ticker with binary telemetry tags)
 * - Interactive Terminal & Binary Scramble / Decrypt Engine
 * - Mode Manager (Recruiter Mode toggle state: 0 = terminal on, 1 = recruiter mode / terminal off)
 * - Navigation & Dynamic Statistics
 */

(function (global) {
  'use strict';

  // -------------------------------------------------------------
  // CONFIGURATION & DATASETS
  // -------------------------------------------------------------
  const STORAGE_KEY = 'portfolio-recruiter-mode';
  const MAX_FEED_LINES = 6;

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const BOOT_DIAGNOSTICS = [
    { bin: '01000010', tag: 'SEC_KERNEL v4.19', text: 'initializing cyber defense runtime...', status: 'OK' },
    { bin: '01001111', tag: 'MEM_MAP', text: '0x00007FFF0000 - 0x00007FFFFFFF verified', status: 'PASS' },
    { bin: '01010011', tag: 'SUBSYSTEMS', text: '[AD_KERBEROS] [WIRESHARK_PCAP] [SENTINEL_KQL]', status: 'ACTIVE' },
    { bin: '01010100', tag: 'CIPHER', text: '01000001 01101110 01101101 01101111 01101100', status: 'DECRYPTED' },
  ];

  const ASCII_BANNER = `  █████╗ ███╗   ██╗███╗   ███╗ ██████╗ ██╗     
 ██╔══██╗████╗  ██║████╗ ████║██╔═══██╗██║     
 ███████║██╔██╗ ██║██╔████╔██║██║   ██║██║     
 ██╔══██║██║╚██╗██║██║╚██╔╝██║██║   ██║██║     
 ██║  ██║██║ ╚████║██║ ╚═╝ ██║╚██████╔╝███████╗`;

  const ATTACK_TACTICS = {
    TA0043: 'Reconnaissance',
    TA0042: 'Resource Development',
    TA0001: 'Initial Access',
    TA0002: 'Execution',
    TA0003: 'Persistence',
    TA0004: 'Privilege Escalation',
    TA0005: 'Defense Evasion',
    TA0006: 'Credential Access',
    TA0007: 'Discovery',
    TA0008: 'Lateral Movement',
    TA0009: 'Collection',
    TA0011: 'Command and Control',
    TA0010: 'Exfiltration',
    TA0040: 'Impact',
  };

  const ATTACK_TECHNIQUES = [
    ['T1566', 'Phishing', 'TA0001'],
    ['T1190', 'Exploit Public-Facing Application', 'TA0001'],
    ['T1133', 'External Remote Services', 'TA0001'],
    ['T1059', 'Command and Scripting Interpreter', 'TA0002'],
    ['T1203', 'Exploitation for Client Execution', 'TA0002'],
    ['T1053', 'Scheduled Task/Job', 'TA0002'],
    ['T1547', 'Boot or Logon Autostart Execution', 'TA0003'],
    ['T1543', 'Create or Modify System Process', 'TA0003'],
    ['T1098', 'Account Manipulation', 'TA0003'],
    ['T1134', 'Access Token Manipulation', 'TA0004'],
    ['T1068', 'Exploitation for Privilege Escalation', 'TA0004'],
    ['T1055', 'Process Injection', 'TA0005'],
    ['T1027', 'Obfuscated Files or Information', 'TA0005'],
    ['T1070', 'Indicator Removal', 'TA0005'],
    ['T1036', 'Masquerading', 'TA0005'],
    ['T1562', 'Impair Defenses', 'TA0005'],
    ['T1003', 'OS Credential Dumping', 'TA0006'],
    ['T1110', 'Brute Force', 'TA0006'],
    ['T1552', 'Unsecured Credentials', 'TA0006'],
    ['T1082', 'System Information Discovery', 'TA0007'],
    ['T1087', 'Account Discovery', 'TA0007'],
    ['T1018', 'Remote System Discovery', 'TA0007'],
    ['T1016', 'System Network Configuration Discovery', 'TA0007'],
    ['T1049', 'System Network Connections Discovery', 'TA0007'],
    ['T1021', 'Remote Services', 'TA0008'],
    ['T1570', 'Lateral Tool Transfer', 'TA0008'],
    ['T1560', 'Archive Collected Data', 'TA0009'],
    ['T1119', 'Automated Collection', 'TA0009'],
    ['T1071', 'Application Layer Protocol', 'TA0011'],
    ['T1105', 'Ingress Tool Transfer', 'TA0011'],
    ['T1573', 'Encrypted Channel', 'TA0011'],
    ['T1041', 'Exfiltration Over C2 Channel', 'TA0010'],
    ['T1048', 'Exfiltration Over Alternative Protocol', 'TA0010'],
    ['T1486', 'Data Encrypted for Impact', 'TA0040'],
    ['T1489', 'Service Stop', 'TA0040'],
  ];

  // -------------------------------------------------------------
  // MODULE 1: THREAT FEED
  // -------------------------------------------------------------
  class ThreatFeedComponent {
    constructor() {
      this.container = null;
      this.body = null;
      this.timer = null;
      this.maxLines = MAX_FEED_LINES;
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

      if (!this.body) return false;

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
      this.init();
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
  }

  // -------------------------------------------------------------
  // MODULE 2: INTERACTIVE TERMINAL
  // -------------------------------------------------------------
  class TerminalComponent {
    constructor() {
      this.terminalEl = null;
      this.outputEl = null;
      this.inputEl = null;
      this.skipBtn = null;
      this.commands = {};
      this.history = [];
      this.historyIndex = -1;
      this.onPanelRequested = null;
      this.onRecruiterRequested = null;
      this.bootActive = false;
      this.bootTimeouts = [];
    }

    init() {
      this.terminalEl = document.getElementById('terminal');
      this.outputEl = document.getElementById('termOutput');
      this.inputEl = document.getElementById('termInput');
      this.skipBtn = document.getElementById('termSkipBtn');

      if (!this.terminalEl || !this.outputEl || !this.inputEl) {
        return false;
      }

      this.registerDefaultCommands();
      this.setupListeners();
      return true;
    }

    registerDefaultCommands() {
      this.registerCommand('help', () => ({
        print: [
          '<span class="font-binary">[01]</span> <strong>whoami</strong>      : quick intro & identity',
          '<span class="font-binary">[02]</span> <strong>about</strong>       : bio, education & goals',
          '<span class="font-binary">[03]</span> <strong>skills</strong>      : offensive/defensive stack & tools',
          '<span class="font-binary">[04]</span> <strong>projects</strong>    : open lab & engineering projects',
          '<span class="font-binary">[05]</span> <strong>writeups</strong>    : HTB writeups directory (6 boxes)',
          '<span class="font-binary">[06]</span> <strong>resume</strong>      : view & download resumes',
          '<span class="font-binary">[07]</span> <strong>certs</strong>       : practical lab credentials & degrees',
          '<span class="font-binary">[08]</span> <strong>contact</strong>     : ways to reach me',
          '<span class="font-binary">[09]</span> <strong>recruiter</strong>   : toggle recruiter mode (1 <-> 0)',
          '<span class="font-binary">[10]</span> <strong>home</strong>        : back to overview dashboard',
          '<span class="font-binary">[11]</span> <strong>clear</strong>       : clear terminal screen',
        ],
      }));

      this.registerCommand('whoami', () => ({
        print: [
          'Anmol Chaudhary — Cybersecurity Researcher & Developer',
          'BCA Graduate (Rabindranath Tagore University) | 20+ HackTheBox Machines Pwned',
          'Focus: Active Directory attacks, Network forensics, CVE exploitation & Microsoft Sentinel (KQL)',
        ],
      }));

      this.registerCommand('skills', () => ({
        print: [
          '<span class="font-binary-accent">[OFFENSIVE SECURITY]</span> Burp Suite, Metasploit, BloodHound, NetExec, Gobuster, Hydra, Hashcat, LinPEAS, Python Exploit Scripting',
          '<span class="font-binary-green">[DEFENSIVE / SOC & SIEM]</span> Microsoft Sentinel, KQL (Kusto Query Language), SIEM Log Triage, MITRE ATT&CK, IOC Hunting',
          '<span class="font-binary">[NETWORKING & FORENSICS]</span> Wireshark PCAP & TCP Stream Analysis, TCP/IP, DNS, DHCP, VLANs, Subnetting, OSI Model',
          '<span class="font-binary-accent">[SYSTEMS & DEVELOPMENT]</span> Python, Bash, SQL, Linux (Kali/Ubuntu), Windows Server, Active Directory, Docker, Git, Azure',
        ],
      }));

      this.registerCommand('about', () => ({
        panel: 'about',
        print: ['opening about.md below ↓'],
      }));

      this.registerCommand('projects', () => ({
        panel: 'projects',
        print: ['opening ./projects below ↓'],
      }));

      this.registerCommand('writeups', () => ({
        panel: 'writeups',
        print: ['opening ./writeups archive (6 HTB machines) below ↓'],
      }));

      this.registerCommand('resume', () => ({
        panel: 'resume',
        print: ['opening resume.sh below ↓'],
      }));

      this.registerCommand('certs', () => ({
        panel: 'certs',
        print: ['opening ./certs below ↓'],
      }));

      this.registerCommand('contact', () => ({
        panel: 'contact',
        print: ['opening contact.sh below ↓'],
      }));

      this.registerCommand('recruiter', () => {
        if (this.onRecruiterRequested) {
          this.onRecruiterRequested();
        }
        return {
          print: ['toggling recruiter mode state (1 <-> 0)...'],
        };
      });

      this.registerCommand('home', () => ({
        panel: 'dashboard',
        print: ['back to overview ↓'],
      }));

      this.registerCommand('status', () => ({
        panel: 'dashboard',
        print: ['system status: operational | 20+ HTB boxes pwned | open to opportunities ↓'],
      }));

      this.registerCommand('clear', () => ({ clear: true }));

      this.registerCommand('sudo', () => ({
        print: ['guest is not in the sudoers file. this incident will be reported to /var/log/auth.log.'],
        err: true,
      }));
    }

    registerCommand(name, handler) {
      this.commands[name.toLowerCase()] = handler;
    }

    setupListeners() {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = this.inputEl.value;
          if (val.trim()) {
            this.history.push(val);
            this.historyIndex = this.history.length;
          }
          this.runCommand(val);
          this.inputEl.value = '';
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (this.historyIndex > 0) {
            this.historyIndex--;
            this.inputEl.value = this.history[this.historyIndex] || '';
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.inputEl.value = this.history[this.historyIndex] || '';
          } else {
            this.historyIndex = this.history.length;
            this.inputEl.value = '';
          }
        } else if (e.key === 'Escape') {
          if (this.bootActive) {
            this.skipBoot();
          }
        }
      });

      if (this.skipBtn) {
        this.skipBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.skipBoot();
        });
      }

      this.terminalEl.addEventListener('click', () => {
        if (this.bootActive) {
          this.skipBoot();
        }
        this.inputEl.focus();
      });
    }

    printLine(htmlContent, cls) {
      if (!this.outputEl) return null;
      const p = document.createElement('p');
      if (cls) p.className = cls;
      p.innerHTML = htmlContent;
      this.outputEl.appendChild(p);
      this.scrollToBottom();
      return p;
    }

    printCommandEcho(cmdText) {
      if (!this.outputEl) return;
      const p = document.createElement('p');
      const prompt = document.createElement('span');
      prompt.className = 'prompt';
      prompt.textContent = 'anmol@portfolio:~$';
      p.appendChild(prompt);
      p.appendChild(document.createTextNode(' ' + cmdText));
      this.outputEl.appendChild(p);
      this.scrollToBottom();
    }

    scrollToBottom() {
      if (this.outputEl) {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
      }
    }

    runCommand(raw) {
      const cmdText = (raw || '').trim();
      if (!cmdText) return;

      this.printCommandEcho(cmdText);

      const name = cmdText.toLowerCase().split(/\s+/)[0];
      let handler = this.commands[name];

      if (!handler) {
        const panelExists = document.getElementById(`panel-${name}`);
        if (panelExists) {
          handler = () => ({
            panel: name,
            print: [`opening ./${name} below ↓`],
          });
        }
      }

      if (!handler) {
        this.printLine(`command not found: ${name} — type 'help' to see available commands`, 'out err');
        this.scrollToBottom();
        return;
      }

      const result = handler();

      if (result.clear) {
        this.outputEl.innerHTML = '';
        return;
      }

      if (result.print) {
        result.print.forEach((line) =>
          this.printLine(line, result.err ? 'out err' : 'out')
        );
      }

      if (result.panel && this.onPanelRequested) {
        this.onPanelRequested(result.panel);
      }

      this.scrollToBottom();
    }

    scrambleDecode(targetText, element, duration = 600, onDone) {
      const binaryChars = '01';
      const hexChars = '0123456789ABCDEF';
      const totalFrames = Math.max(12, Math.floor(duration / 30));
      let frame = 0;

      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const revealedCount = Math.floor(progress * targetText.length);

        let result = '';
        for (let i = 0; i < targetText.length; i++) {
          if (i < revealedCount) {
            result += targetText[i];
          } else if (targetText[i] === ' ') {
            result += ' ';
          } else {
            const rand = Math.random() < 0.6 ? binaryChars : hexChars;
            result += `<span class="scramble-char">${rand[Math.floor(Math.random() * rand.length)]}</span>`;
          }
        }

        element.innerHTML = result;

        if (frame >= totalFrames) {
          clearInterval(interval);
          element.innerHTML = targetText;
          if (onDone) onDone();
        }
      }, 28);

      this.bootTimeouts.push(interval);
    }

    skipBoot() {
      this.bootTimeouts.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      this.bootTimeouts = [];
      this.bootActive = false;

      if (this.skipBtn) {
        this.skipBtn.style.display = 'none';
      }

      this.clear();
      this.printLine(`<pre class="ascii-banner">${ASCII_BANNER}</pre>`);
      this.printLine('<span class="font-binary-green">[SEC_CORE_READY]</span> <span class="font-binary">OPERATOR: ANMOL CHAUDHARY // 20+ HTB MACHINES PWNED</span>', 'diag-line');
      this.printLine('anmol@portfolio:~$ whoami', 'prompt-line');
      this.printLine('Anmol Chaudhary — Cybersecurity Researcher & Developer', 'out');
      this.printLine('anmol@portfolio:~$ help', 'prompt-line');
      this.runCommand('help');
      this.focus();
    }

    typeBoot(speed = 22, onComplete) {
      if (prefersReducedMotion()) {
        this.skipBoot();
        if (onComplete) onComplete();
        return;
      }

      this.bootActive = true;
      this.clear();

      if (this.skipBtn) {
        this.skipBtn.style.display = 'inline-block';
      }

      let delay = 100;

      const addStep = (fn, wait) => {
        const t = setTimeout(() => {
          if (!this.bootActive) return;
          fn();
        }, delay);
        this.bootTimeouts.push(t);
        delay += wait;
      };

      BOOT_DIAGNOSTICS.forEach((d) => {
        addStep(() => {
          const line = `<span class="bin-tag">[${d.bin}]</span> <span class="font-binary-accent">${d.tag}:</span> <span>${d.text}</span> <span class="font-binary-green">[${d.status}]</span>`;
          this.printLine(line, 'diag-line');
        }, 160);
      });

      addStep(() => {
        const p = this.printLine('<span class="bin-tag">[DECRYPT]</span> <span class="bin-stream">01000001 01101110 01101101 01101111 01101100</span>', 'diag-line');
        if (p) {
          this.scrambleDecode('&gt;&gt; IDENTITY VERIFIED: ANMOL CHAUDHARY [HTB: 20+ PWNED]', p, 700);
        }
      }, 850);

      addStep(() => {
        this.printLine(`<pre class="ascii-banner">${ASCII_BANNER}</pre>`);
        this.printLine('<span class="font-binary-green">[SYSTEM ONLINE]</span> <span class="font-binary">SHELL INITIALIZED // ACCESSIBILITY: WCAG 2.1 AA</span>', 'diag-line');
      }, 450);

      addStep(() => {
        const p = document.createElement('p');
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = 'anmol@portfolio:~$';
        p.appendChild(promptSpan);
        p.appendChild(document.createTextNode(' '));

        const cmdSpan = document.createElement('span');
        p.appendChild(cmdSpan);
        const cursor = document.createElement('span');
        cursor.className = 'type-cursor';
        p.appendChild(cursor);
        this.outputEl.appendChild(p);

        const targetCmd = 'whoami';
        let charIdx = 0;

        const typeNext = () => {
          if (!this.bootActive) return;
          if (charIdx < targetCmd.length) {
            cmdSpan.textContent += targetCmd[charIdx];
            charIdx++;
            const t = setTimeout(typeNext, speed + Math.random() * 20);
            this.bootTimeouts.push(t);
          } else {
            cursor.remove();
            const t2 = setTimeout(() => {
              if (!this.bootActive) return;
              this.printLine('Anmol Chaudhary — Cybersecurity Researcher & Developer', 'out');

              const t3 = setTimeout(() => {
                if (!this.bootActive) return;
                this.printLine('anmol@portfolio:~$ help', 'prompt-line');
                this.runCommand('help');
                this.bootActive = false;
                if (this.skipBtn) this.skipBtn.style.display = 'none';
                this.focus();
                if (onComplete) onComplete();
              }, 300);
              this.bootTimeouts.push(t3);
            }, 200);
            this.bootTimeouts.push(t2);
          }
        };

        typeNext();
      }, 400);
    }

    focus() {
      if (this.inputEl) {
        this.inputEl.focus();
      }
    }

    clear() {
      if (this.outputEl) {
        this.outputEl.innerHTML = '';
      }
    }
  }

  // -------------------------------------------------------------
  // MODULE 3: MODE MANAGER (Recruiter Mode Toggle State)
  // -------------------------------------------------------------
  class ModeManagerComponent {
    constructor(options = {}) {
      this.threatFeed = options.threatFeed || null;
      this.terminal = options.terminal || null;
      this.toggleBtn = null;
      this.viewportEl = null;
      this.recruiterMode = 0;
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
      } catch {}
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

      document.body.dataset.terminal = isRecruiterActive ? 'off' : 'on';
      document.body.dataset.recruiter = isRecruiterActive ? '1' : '0';

      if (this.toggleBtn) {
        this.toggleBtn.setAttribute('aria-checked', isRecruiterActive ? 'true' : 'false');
      }

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

  // -------------------------------------------------------------
  // MODULE 4: NAVIGATION
  // -------------------------------------------------------------
  class NavigationComponent {
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
            if (this.terminal) {
              this.terminal.runCommand(cmd);
            }
            const viewport = document.getElementById('viewport');
            if (viewport) {
              viewport.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    }
  }

  // -------------------------------------------------------------
  // APPLICATION CONTROLLER
  // -------------------------------------------------------------
  class PortfolioApplication {
    constructor() {
      this.threatFeed = new ThreatFeedComponent();
      this.terminal = new TerminalComponent();
      this.modes = new ModeManagerComponent({ threatFeed: this.threatFeed, terminal: this.terminal });
      this.navigation = new NavigationComponent({ modeManager: this.modes, terminal: this.terminal });
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;

      if (global.PortfolioContent && typeof global.PortfolioContent.apply === 'function') {
        global.PortfolioContent.apply();
      }

      this.threatFeed.init();

      this.terminal.onPanelRequested = (panel) => this.modes.showPanel(panel);
      this.terminal.onRecruiterRequested = () => this.modes.toggleRecruiterMode();
      this.terminal.init();

      this.modes.init();
      this.navigation.init();

      if (this.modes.currentMode === 'on') {
        this.terminal.typeBoot();
      }

      this.initialized = true;
    }
  }

  const app = new PortfolioApplication();

  global.PortfolioPackage = {
    app,
    ThreatFeed: ThreatFeedComponent,
    Terminal: TerminalComponent,
    ModeManager: ModeManagerComponent,
    Navigation: NavigationComponent,
    init: () => app.init(),
    get initialized() {
      return app.initialized;
    },
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
      app.init();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
