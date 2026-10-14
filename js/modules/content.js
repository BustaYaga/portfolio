
export const PORTFOLIO_CONTENT = {
  // Hero section hint
  hero: {
    hint: 'type <code>help</code> to inspect available commands.',
  },

  dashboard: {
    sub: 'Try typing <code>projects</code>, <code>writeups</code>, <code>skills</code>, <code>resume</code>, or <code>recruiter</code> in the shell above.',
  },

  recruiter: {
    summary:
      "<p>I'm <strong>Anmol Chaudhary</strong>, a Computer Applications graduate specializing in <strong>Cybersecurity (Offensive Security / SOC Analysis)</strong> and <strong>Software Development</strong> based in <strong>Dehradun, India</strong>.<br>I have practical, hands-on experience through various labs covering web exploitation, Active Directory penetration testing (Kerberos, BloodHound), network forensics (Wireshark PCAP analysis), CVE research, and cloud threat detection with Microsoft Sentinel (KQL).<br>I'm seeking an entry-level role where I can contribute to securing critical infrastructure or developing reliable systems.</p>",
  },

  skills: {
    skill:
      '<p>Constantly evolving, forever learning, always building.<br><span class="font-binary-accent">[OFFENSIVE SECURITY]</span> Burp Suite, Metasploit, BloodHound, NetExec, Gobuster, Hydra, Hashcat, LinPEAS, Python Exploit Scripting<br><span class="font-binary-green">[DEFENSIVE / SOC & SIEM]</span> Microsoft Sentinel, KQL (Kusto Query Language), SIEM Log Triage, MITRE ATT&CK, IOC Hunting<br><span class="font-binary">[NETWORKING & FORENSICS]</span> Wireshark PCAP & TCP Stream Analysis, TCP/IP, DNS, DHCP, VLANs, Subnetting, OSI Model<br><span class="font-binary-accent">[SYSTEMS & DEVELOPMENT]</span> Python, Bash, SQL, Linux (Kali/Ubuntu), Windows Server, Active Directory, Docker, Git, Azure</p>',
    },

  projects: {
    vulnScanner:
      'CLI network vulnerability scanner. Scans ports with recon profiles (quick, web, AD, full), grabs banners and probes HTTP/S to identify service versions, builds CPE strings and maps them to CVEs through the NVD API with a SQLite cache, and fingerprints web apps. Results are rendered as severity-coloured terminal reports.',
    csfloater:
      'Market-data pipeline that flags CS2 skin listings priced well below their baseline. Pulls live listings from the CSFloat API with rate-limit-aware pagination, builds first-party price history through a daily GitHub Actions snapshot job, and serves flagged deals on a Flask dashboard with background scanning.',
    siemToolkit:
      'The detection stack I work with day to day: writing KQL hunting queries and analytics rules in Microsoft Sentinel, triaging alerts from firewall, VM and web logs, mapping activity to MITRE ATT&CK techniques, and pivoting into packet captures with Wireshark to confirm IOCs.',
    project1:
      'Exploited IDOR, SSTI, and Next.js unauthenticated RCE (CVE-2025-55182) across 7 HTB targets. Escalated to root via Node.js V8 debug port hijacking, cron job write access, and pickle deserialization.',
    project2:
      'Compromised Kerberos-only Active Directory environments using BloodHound and NetExec to escalate to Domain Admin. Recovered FTP creds from PCAPs via Wireshark and chained CVEs on Flowise to escape containers.',
    project3:
      'Provisioned a cloud-native SIEM on Azure with Microsoft Sentinel. Ingested firewall, VM, and web logs into a centralized pipeline and wrote custom KQL detection rules for brute-force and lateral movement IOCs.',
    project4:
      'Audited multi-tier web applications for backend logic flaws and access-control vulnerabilities. Traced API workflows with Burp Suite, patched template injections, and debugged multi-container Docker deployments.',
  },

  writeups: {
    sub: 'Detailed writeups of solved machines and labs covering various vulnerabilities and exploitation techniques. Click a row to read.',
  },

  resume: {
    note: 'Download verified resumes tailored for Network Security & Cybersecurity or Software Development.',
  },

  footer: {
    tagline:
      '&copy; <span id="year"></span> Anmol Chaudhary — built with HTML, CSS, and curiosity.',
  },

  // Ambient Threat Feed initial seed lines
  threatFeed: {
    initial: [
      { id: 'T1059', text: 'Command and Scripting Interpreter :: Execution' },
      { id: 'T1190', text: 'Exploit Public-Facing Application :: Initial Access' },
    ],
  },
};


export const CERTIFICATIONS = [
  {
    id: 'opsec',
    name: 'Opsec- Privacy for Security Professionals',
    issuer: 'Just Hacking Training',
    date: 'September 19, 2026',
    file: 'certs/opsec_privacy_certificate.pdf',
  },
  {
    id: 'bca-degree',
    name: 'Bachelor of Computer Application (BCA)',
    issuer: 'Rabindranath Tagore University',
    date: '2022 – 2025',
    file: 'certs/bca-degree.pdf',
  }
];

/**
 * Resolves a nested dot-notation path on an object (e.g. 'about.intro').
 */
export function getByPath(obj, path) {
  if (!obj || !path) return undefined;
  return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
}

/**
 * Applies encapsulated content to all matching [data-content] elements in the DOM.
 */
export function applyContent(customData) {
  const data = customData || PORTFOLIO_CONTENT;
  const elements = document.querySelectorAll('[data-content]');

  elements.forEach((el) => {
    const key = el.getAttribute('data-content');
    const val = getByPath(data, key);

    if (val !== undefined && val !== null) {
      el.innerHTML = val;

      // Ensure footer year is populated if tagline contains #year
      if (key === 'footer.tagline') {
        const yearEl = el.querySelector('#year');
        if (yearEl) {
          yearEl.textContent = new Date().getFullYear();
        }
      }
    }
  });
}
