/**
 * Writeup Module
 * Controls per-writeup page states, toggled manually below:
 *
 *  - 'locked'    : machine is still active on HTB — blurs the writeup and
 *                  shows a "Protected Writeup" dialog (HTB's ToS forbids
 *                  publishing writeups for active Machines/Challenges/Sherlocks).
 *  - 'missing'   : machine is solved but the writeup hasn't been written
 *                  up yet — keeps header/meta/summary visible, strips any
 *                  placeholder content, drops a notice, keeps the trophy link.
 *  - 'published' : default — page renders as-is, nothing happens.
 *
 * To change a machine's state, edit WRITEUP_STATUS. Nothing else needs
 * touching — no HTML edits, no copy-pasted markup per page.
 */

import { WRITEUP_STATUS } from "./config.js";

function getMachineId() {
  return location.pathname.split('/').pop().replace('.html', '').toLowerCase();
}

function getStatus() {
  return WRITEUP_STATUS[getMachineId()] || 'published';
}

/* ---------------------------------------------------------
   LOCKED — blur the writeup, show a protected-writeup dialog
   --------------------------------------------------------- */
function applyLocked(main) {
  main.classList.add('wu-blurred');
  main.setAttribute('aria-hidden', 'true');

  const overlay = document.createElement('div');
  overlay.className = 'wu-lock-overlay';
  overlay.innerHTML = `
    <div class="wu-lock-backdrop"></div>
    <div class="wu-lock-dialog" role="dialog" aria-modal="true" aria-labelledby="wuLockTitle">
      <div class="wu-lock-bar">
        <span class="dot dot-r"></span><span class="dot dot-y"></span><span class="dot dot-g"></span>
        <span class="wu-lock-bar-title">protected-writeup.sh</span>
      </div>
      <div class="wu-lock-body">
        <span class="wu-lock-icon" aria-hidden="true">🔒</span>
        <h3 id="wuLockTitle">Protected Writeup</h3>
        <p>This machine hasn't retired yet on HackTheBox. Per HTB's Terms of Service, writeups for active Machines, Challenges, and Sherlocks can't be published, streamed, or shared — so this one stays locked until it retires.</p>
        <a href="../index.html#writeups" class="btn btn-ghost wu-lock-back">&larr; back to writeups</a>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

/* ---------------------------------------------------------
   MISSING — solved, but the full writeup isn't written yet
   --------------------------------------------------------- */
function applyMissing(main) {
  const headings = Array.from(main.querySelectorAll('h2'));
  const summaryHeading = headings.find((h) => h.textContent.trim().toLowerCase() === 'summary');
  if (!summaryHeading) return;

  // Keep everything through the summary paragraph(s)
  let anchor = summaryHeading;
  let next = summaryHeading.nextElementSibling;
  while (next && next.tagName === 'P') {
    anchor = next;
    next = next.nextElementSibling;
  }

  const trophyHeading = headings.find((h) => h.textContent.trim().toLowerCase() === 'trophy');

  const notice = document.createElement('div');
  notice.className = 'wu-notice';
  notice.setAttribute('role', 'note');
  notice.innerHTML = `
    <span class="wu-notice-icon" aria-hidden="true">⚠</span>
    <div>
      <strong>Writeup not uploaded yet</strong>
      <p>This machine is solved, but I haven't written up the full walkthrough yet. Check back soon — in the meantime the trophy link below confirms completion.</p>
    </div>
  `;

  // Strip everything between the summary and the trophy section (placeholder
  // content, {{...}} stubs, etc.) — keep the trophy link if one exists.
  let node = anchor.nextElementSibling;
  while (node && node !== trophyHeading) {
    const toRemove = node;
    node = node.nextElementSibling;
    toRemove.remove();
  }

  anchor.insertAdjacentElement('afterend', notice);
}

export function initWriteup() {
  const main = document.querySelector('main.wu');
  if (!main) return;

  const status = getStatus();
  if (status === 'locked') applyLocked(main);
  else if (status === 'missing') applyMissing(main);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWriteup);
  } else {
    initWriteup();
  }
}