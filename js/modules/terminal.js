/**
 * Terminal Module
 * Interactive shell emulator, binary text scramble/decryption engine,
 * fancy cyber initialization sequence, command dispatcher, and history navigation.
 */

import { BOOT_DIAGNOSTICS, ASCII_BANNER, BOOT_LINES, prefersReducedMotion } from './config.js';

export class Terminal {
  constructor(options = {}) {
    this.terminalEl = null;
    this.outputEl = null;
    this.inputEl = null;
    this.skipBtn = null;
    this.commands = {};
    this.history = [];
    this.historyIndex = -1;
    this.onCommandExecuted = options.onCommandExecuted || null;
    this.onPanelRequested = options.onPanelRequested || null;
    this.onRecruiterRequested = options.onRecruiterRequested || null;
    this.initialized = false;
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
    this.initialized = true;
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

    // Dynamic support for panel ids (e.g. "writeups" -> #panel-writeups)
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

    if (this.onCommandExecuted) {
      this.onCommandExecuted(name, result);
    }

    this.scrollToBottom();
  }

  /**
   * Scrambles binary characters and progressively decodes them into the destination text.
   */
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

  /**
   * Skips all animations immediately and prints the final initialized state.
   */
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

  /**
   * Executes the fancy cyber terminal initialization sequence.
   */
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

    // Phase 1: Diagnostics with binary & monospace fonts
    BOOT_DIAGNOSTICS.forEach((d) => {
      addStep(() => {
        const line = `<span class="bin-tag">[${d.bin}]</span> <span class="font-binary-accent">${d.tag}:</span> <span>${d.text}</span> <span class="font-binary-green">[${d.status}]</span>`;
        this.printLine(line, 'diag-line');
      }, 160);
    });

    // Phase 2: Binary Cipher Scramble / Decryption
    addStep(() => {
      const p = this.printLine('<span class="bin-tag">[DECRYPT]</span> <span class="bin-stream">01000001 01101110 01101101 01101111 01101100</span>', 'diag-line');
      if (p) {
        this.scrambleDecode('&gt;&gt; IDENTITY VERIFIED: ANMOL CHAUDHARY [HTB: 20+ PWNED]', p, 700);
      }
    }, 850);

    // Phase 3: ASCII Cyber Banner
    addStep(() => {
      this.printLine(`<pre class="ascii-banner">${ASCII_BANNER}</pre>`);
      this.printLine('<span class="font-binary-green">[SYSTEM ONLINE]</span> <span class="font-binary">SHELL INITIALIZED // ACCESSIBILITY: WCAG 2.1 AA</span>', 'diag-line');
    }, 450);

    // Phase 4: Typewriter prompt for whoami
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

            // Type help command
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
