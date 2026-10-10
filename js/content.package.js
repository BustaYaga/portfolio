/**
 * ===================================================================
 * PORTFOLIO CONTENT PACKAGE (Paragraph & Copy Encapsulation)
 * ===================================================================
 * All paragraph <p> data from index.html is encapsulated in this package
 * for easy editing. Populated from Anmol Chaudhary's resumes & writeups.
 * ===================================================================
 */

(function (global) {
  'use strict';

  const contentData = {
    // -----------------------------------------------------------------
    // 1. HERO SECTION
    // -----------------------------------------------------------------
    hero: {
      hint: 'type <code>help</code> to inspect available commands, or explore sections below',
    },

    // -----------------------------------------------------------------
    // 2. DASHBOARD (Neofetch)
    // -----------------------------------------------------------------
    dashboard: {
      sub: 'Try typing <code>projects</code>, <code>writeups</code>, <code>skills</code>, <code>resume</code>, or <code>recruiter</code> in the shell above.',
    },

    // -----------------------------------------------------------------
    // 3. RECRUITER MODE SUMMARY
    // -----------------------------------------------------------------
    recruiter: {
      summary:
        "I'm <strong>Anmol Chaudhary</strong>, a Computer Applications graduate specializing in <strong>Cybersecurity (Offensive Security / SOC Analysis)</strong> and <strong>Software Development</strong> based in <strong>Dehradun, India</strong>. I have practical, hands-on experience through 20+ HackTheBox labs covering web exploitation, Active Directory penetration testing (Kerberos, BloodHound), network forensics (Wireshark PCAP analysis), CVE research, and cloud threat detection with Microsoft Sentinel (KQL). I'm seeking an entry-level role where I can contribute to securing critical infrastructure or developing reliable systems.",
    },

    // -----------------------------------------------------------------
    // 4. ABOUT ME
    // -----------------------------------------------------------------
    about: {
      intro:
        "I'm <strong>Anmol Chaudhary</strong> — a Computer Applications graduate (BCA, Rabindranath Tagore University) passionate about dissecting network protocols, offensive security, and system engineering. My practical foundation comes from compromising 20+ HackTheBox machines spanning web applications, Active Directory domains, and network forensics.",
      goals:
        "Currently mastering Active Directory privilege escalation chains, cloud detection engineering using Microsoft Sentinel with KQL, and modern web application security. Looking for an entry-level role in Cybersecurity (SOC Analyst, Junior Penetration Tester, Security Engineer) or Software Engineering.",
    },

    // -----------------------------------------------------------------
    // 5. PROJECTS
    // -----------------------------------------------------------------
    projects: {
      project1:
        'Exploited IDOR, SSTI, and Next.js unauthenticated RCE (CVE-2025-55182) across 7 HTB targets. Escalated to root via Node.js V8 debug port hijacking, cron job write access, and pickle deserialization.',
      project2:
        'Compromised Kerberos-only Active Directory environments using BloodHound and NetExec to escalate to Domain Admin. Recovered FTP creds from PCAPs via Wireshark and chained CVEs on Flowise to escape containers.',
      project3:
        'Provisioned a cloud-native SIEM on Azure with Microsoft Sentinel. Ingested firewall, VM, and web logs into a centralized pipeline and wrote custom KQL detection rules for brute-force and lateral movement IOCs.',
      project4:
        'Audited multi-tier web applications for backend logic flaws and access-control vulnerabilities. Traced API workflows with Burp Suite, patched template injections, and debugged multi-container Docker deployments.',
    },

    // -----------------------------------------------------------------
    // 6. HTB WRITEUPS DIRECTORY
    // -----------------------------------------------------------------
    writeups: {
      sub: 'Detailed writeups of completed Hack The Box machines covering web exploitation, Active Directory, and privilege escalation. Click a row to read.',
    },

    // -----------------------------------------------------------------
    // 7. RESUME
    // -----------------------------------------------------------------
    resume: {
      note: 'Download verified resumes tailored for Network Security & Cybersecurity or Software Development.',
    },

    // -----------------------------------------------------------------
    // 8. CERTIFICATIONS
    // -----------------------------------------------------------------
    certs: {
      cert1: 'HackTheBox Labs — 20+ Machines Pwned (Web Exploitation, Active Directory, Network Forensics, CVE Research)',
      cert2: 'Bachelor of Computer Application (BCA) — Rabindranath Tagore University (2022 – 2025)',
      cert3: 'Cloud SIEM & Threat Hunting Lab — Microsoft Azure Sentinel & KQL Analytics',
    },

    // -----------------------------------------------------------------
    // 9. FOOTER
    // -----------------------------------------------------------------
    footer: {
      tagline:
        '&copy; <span id="year"></span> Anmol Chaudhary — built with HTML, CSS, and curiosity.',
    },

    // -----------------------------------------------------------------
    // 10. AMBIENT THREAT FEED (Initial Seeds)
    // -----------------------------------------------------------------
    threatFeed: {
      seed1: '<span class="bin-tag">[01000010]</span><span class="feed-id">[T1059]</span> Command and Scripting Interpreter :: Execution',
      seed2: '<span class="bin-tag">[01001111]</span><span class="feed-id">[T1190]</span> Exploit Public-Facing Application :: Initial Access',
    },
  };

  function getByPath(obj, path) {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : undefined), obj);
  }

  function setByPath(obj, path, value) {
    if (!obj || !path) return;
    const parts = path.split('.');
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
  }

  function applyContent() {
    if (typeof document === 'undefined') return;

    const elements = document.querySelectorAll('[data-content]');
    elements.forEach((el) => {
      const key = el.getAttribute('data-content');
      const val = getByPath(contentData, key);

      if (val !== undefined && val !== null) {
        el.innerHTML = val;

        if (key === 'footer.tagline') {
          const yearEl = el.querySelector('#year');
          if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
          }
        }
      }
    });
  }

  const ContentPackage = {
    data: contentData,
    get: function (path) {
      return getByPath(contentData, path);
    },
    set: function (path, value) {
      setByPath(contentData, path, value);
      applyContent();
    },
    apply: applyContent,
  };

  global.PortfolioContent = ContentPackage;
  global.ContentPackage = ContentPackage;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyContent);
    } else {
      applyContent();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
