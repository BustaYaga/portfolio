/**
 * Config & Constants Module
 * Global tokens, MITRE ATT&CK datasets, and default settings.
 */

export const STORAGE_KEY = 'portfolio-recruiter-mode';
export const MAX_FEED_LINES = 6;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const BOOT_DIAGNOSTICS = [
  { bin: '01000010', tag: 'SEC_KERNEL v4.19', text: 'initializing cyber defense runtime...', status: 'OK' },
  { bin: '01001111', tag: 'MEM_MAP', text: '0x00007FFF0000 - 0x00007FFFFFFF verified', status: 'PASS' },
  { bin: '01010011', tag: 'SUBSYSTEMS', text: '[AD_KERBEROS] [WIRESHARK_PCAP] [SENTINEL_KQL]', status: 'ACTIVE' },
  { bin: '01010100', tag: 'CIPHER', text: '01000001 01101110 01101101 01101111 01101100', status: 'DECRYPTED' },
];

// export const ASCII_BANNER = `  █████╗ ███╗   ██╗███╗   ███╗ ██████╗ ██╗     
//  ██╔══██╗████╗  ██║████╗ ████║██╔═══██╗██║     
//  ███████║██╔██╗ ██║██╔████╔██║██║   ██║██║     
//  ██╔══██║██║╚██╗██║██║╚██╔╝██║██║   ██║██║     
//  ██║  ██║██║ ╚████║██║ ╚═╝ ██║╚██████╔╝███████╗`;
 
 export const ASCII_BANNER = `  ▄▄                                                                          
 ▄██                           ██                                             
  ██                           ██                                             
  ██▄████▄ ▀███  ▀███  ▄██▀████████ ▄█▀██▄ ▀██▀   ▀██▀▄█▀██▄  ▄█▀█████▄█▀██▄  
  ██    ▀██  ██    ██  ██   ▀▀ ██  ██   ██   ██   ▄█ ██   ██ ▄██  ██ ██   ██  
  ▓█     ██  ▓█    ██  ▀█████▄ ██   ▄███▓█    ██ ▄▓   ▄███▓█ ▀▓▓███▀  ▄███▓█  
  ▓▓▓   ▄█▓  ▓█    █▓       ██ █▓  █▓   ▓█     ██▓   █▓   ▓█ █▓      █▓   ▓█  
  ▓▓     ▓▓  ▓█    ▓▓  ▀▓   █▓ ▓▓   ▓▓▓▓▒▓     █▓▓    ▓▓▓▓▒▓ ▀▓▓▓▓▓▀  ▓▓▓▓▒▓  
  ▒▓▓   ▓▓▓  ▓▓    ▓▓  ▓▓   ▓▓ ▓▓  ▓▓   ▒▓     ▓▓▒   ▓▓   ▒▓ ▓▒      ▓▓   ▒▓  
  ▒ ▒ ▒ ▒▒   ▒▒ ▓▒ ▒▓▒ ▒ ▒▓▒   ▒▒▒ ▒▓▒ ▒ ▓▒    ▓▓    ▒▓▒ ▒ ▓▒ ▒ ▒▓▒ ▒▒▓▒ ▒ ▓▒ 
                                             ▒▒▓             ▒▒     ▒▒        
                                           ▒▒▒               ▒▒▒▒ ▒▒          
`;

export const BOOT_LINES = [
  { prompt: true, text: 'whoami' },
  { prompt: false, text: 'Anmol Chaudhary — Cybersecurity Researcher & Developer' },
];

export const ATTACK_TACTICS = {
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

export const ATTACK_TECHNIQUES = [
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
