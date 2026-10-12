/**
 * System Monitor Module
 * Decorative "vitals" panel — animated CPU/memory/threat/network bars
 * that random-walk within a believable range, plus a live session-uptime
 * clock. Sits parallel to the GitHub activity widget under neofetch.
 */

import { prefersReducedMotion } from './config.js';

const METRICS = [
  { id: 'cpu', label: 'CPU LOAD', unit: '%', min: 8, max: 68, start: 22 },
  { id: 'mem', label: 'MEMORY', unit: '%', min: 15, max: 72, start: 38 },
  { id: 'threat', label: 'THREAT LVL', unit: '%', min: 2, max: 45, start: 12 },
  { id: 'net', label: 'NET I/O', unit: 'Mb/s', min: 1, max: 95, start: 14 },
];

export class SysMonitor {
  constructor(options = {}) {
    this.metrics = options.metrics || METRICS;
    this.container = null;
    this.uptimeEl = null;
    this.values = {};
    this.stepTimer = null;
    this.uptimeTimer = null;
    this.startedAt = Date.now();
    this.initialized = false;
  }

  init() {
    this.container = document.getElementById('sysMonitor');
    this.uptimeEl = document.getElementById('sysUptime');

    if (!this.container) return false;

    this.container.innerHTML = '';
    this.metrics.forEach((m) => {
      this.values[m.id] = m.start;
      this.container.appendChild(this.buildRow(m));
    });

    this.initialized = true;
    this.paintAll();
    this.renderUptime();

    return true;
  }

  buildRow(metric) {
    const row = document.createElement('div');
    row.className = 'vitals-row';
    row.innerHTML = `
      <span class="vitals-label">${metric.label}</span>
      <span class="vitals-track"><span class="vitals-fill" id="vitals-fill-${metric.id}"></span></span>
      <span class="vitals-value" id="vitals-value-${metric.id}">${Math.round(metric.start)}${metric.unit}</span>
    `;
    return row;
  }

  paintAll() {
    this.metrics.forEach((m) => this.paint(m));
  }

  paint(metric) {
    const value = this.values[metric.id];
    const pct = ((value - metric.min) / (metric.max - metric.min)) * 100;
    const fill = document.getElementById(`vitals-fill-${metric.id}`);
    const label = document.getElementById(`vitals-value-${metric.id}`);
    if (fill) fill.style.width = `${Math.max(4, Math.min(100, pct))}%`;
    if (label) label.textContent = `${Math.round(value)}${metric.unit}`;
  }

  step() {
    this.metrics.forEach((m) => {
      const current = this.values[m.id];
      const range = m.max - m.min;
      const drift = (Math.random() - 0.5) * range * 0.3;
      let next = current + drift;
      next = Math.max(m.min, Math.min(m.max, next));
      this.values[m.id] = next;
      this.paint(m);
    });
  }

  renderUptime() {
    if (!this.uptimeEl) return;
    const diff = Date.now() - this.startedAt;
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    this.uptimeEl.textContent = `${h}:${m}:${s}`;
  }

  scheduleStep() {
    this.stepTimer = setTimeout(() => {
      this.step();
      this.scheduleStep();
    }, 1800 + Math.random() * 1400);
  }

  /**
   * Starts both loops: the bar random-walk (skipped entirely under
   * prefers-reduced-motion, same convention as ThreatFeed/DedsecFeed)
   * and the uptime clock (plain text tick, left running either way).
   */
  start() {
    if (!this.initialized) this.init();
    if (!this.container) return;

    if (!this.uptimeTimer) {
      this.uptimeTimer = setInterval(() => this.renderUptime(), 1000);
    }

    if (prefersReducedMotion() || this.stepTimer) return;
    this.scheduleStep();
  }

  stop() {
    if (this.stepTimer) {
      clearTimeout(this.stepTimer);
      this.stepTimer = null;
    }
    if (this.uptimeTimer) {
      clearInterval(this.uptimeTimer);
      this.uptimeTimer = null;
    }
  }

  isRunning() {
    return this.stepTimer !== null || this.uptimeTimer !== null;
  }
}
