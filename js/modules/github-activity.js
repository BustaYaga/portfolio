/**
 * GitHub Activity Module
 * Fetches the repo's recent commit history from the public GitHub REST
 * API and renders it as a lightweight log. Caches in sessionStorage for
 * a few minutes to stay well under the unauthenticated rate limit, and
 * fails quietly (never throws, never blocks the page) if the API is
 * unreachable.
 */

import { GITHUB_REPO } from './config.js';

const CACHE_KEY = 'portfolio-gh-activity-cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export class GithubActivity {
  constructor(options = {}) {
    this.owner = options.owner || GITHUB_REPO.owner;
    this.repo = options.repo || GITHUB_REPO.repo;
    this.perPage = options.perPage || 5;
    this.listEl = null;
    this.statusEl = null;
  }

  init() {
    this.listEl = document.getElementById('ghActivityList');
    this.statusEl = document.getElementById('ghActivityStatus');
    if (!this.listEl) return false;

    this.load();
    return true;
  }

  readCache() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts > CACHE_TTL) return null;
      return parsed.data;
    } catch {
      return null;
    }
  }

  writeCache(data) {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      // sessionStorage may be restricted (private browsing, etc.) — non-fatal
    }
  }

  async load() {
    const cached = this.readCache();
    if (cached) {
      this.render(cached);
      return;
    }

    this.setStatus('fetching recent commits…');

    try {
      const url = `https://api.github.com/repos/${this.owner}/${this.repo}/commits?per_page=${this.perPage}`;
      const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

      if (!res.ok) {
        throw new Error(`GitHub API responded ${res.status}`);
      }

      const commits = await res.json();
      this.writeCache(commits);
      this.render(commits);
    } catch (err) {
      this.renderError();
    }
  }

  render(commits) {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    if (!Array.isArray(commits) || commits.length === 0) {
      this.setStatus('no commits found.');
      return;
    }

    this.setStatus(`repo: ${this.owner}/${this.repo}`);

    commits.forEach((c) => {
      const row = document.createElement('a');
      row.className = 'gh-commit-row';
      row.href = c.html_url || '#';
      row.target = '_blank';
      row.rel = 'noopener';

      const sha = (c.sha || '').slice(0, 7);
      const rawMessage = (c.commit && c.commit.message) || '';
      const message = rawMessage.split('\n')[0];
      const author = (c.commit && c.commit.author && c.commit.author.name) || 'unknown';
      const when = this.relativeTime(c.commit && c.commit.author && c.commit.author.date);

      row.innerHTML = `
        <span class="gh-commit-sha">${sha}</span>
        <span class="gh-commit-msg">${this.escape(message)}</span>
        <span class="gh-commit-meta">${this.escape(author)} · ${when}</span>
      `;
      this.listEl.appendChild(row);
    });
  }

  renderError() {
    this.setStatus('github api unreachable', 'err');
    if (this.listEl) {
      this.listEl.innerHTML =
        '<p class="gh-activity-empty">Could not load live commit data right now. Check back shortly.</p>';
    }
  }

  setStatus(text, cls) {
    if (!this.statusEl) return;
    this.statusEl.textContent = text;
    this.statusEl.className = 'gh-activity-status' + (cls ? ` ${cls}` : '');
  }

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  relativeTime(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 30) return `${day}d ago`;
    const mo = Math.floor(day / 30);
    return `${mo}mo ago`;
  }
}
