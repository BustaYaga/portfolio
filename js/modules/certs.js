/**
 * Certifications Module
 * Renders the certifications panel as data-driven rows and powers
 * the inline PDF viewer opened when a row is clicked.
 */

export class CertsPanel {
  constructor(options = {}) {
    this.certifications = options.certifications || [];
    this.tableBody = null;
    this.emptyState = null;
    this.viewerEl = null;
    this.viewerFrame = null;
    this.viewerTitle = null;
    this.viewerDownload = null;
  }

  init() {
    this.tableBody = document.getElementById('certTableBody');
    this.emptyState = document.getElementById('certEmptyState');
    this.viewerEl = document.getElementById('certViewer');
    this.viewerFrame = document.getElementById('certViewerFrame');
    this.viewerTitle = document.getElementById('certViewerTitle');
    this.viewerDownload = document.getElementById('certViewerDownload');

    if (!this.tableBody) return false;

    this.render();
    this.setupViewer();
    return true;
  }

  render() {
    this.tableBody.innerHTML = '';

    if (this.certifications.length === 0) {
      if (this.emptyState) this.emptyState.hidden = false;
      return;
    }

    if (this.emptyState) this.emptyState.hidden = true;

    this.certifications.forEach((cert) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'cert-row';
      row.dataset.certId = cert.id;
      row.innerHTML = `
        <span class="cert-name">${cert.name}</span>
        <span class="cert-issuer">${cert.issuer}</span>
        <span class="cert-date">${cert.date}</span>
        <span class="cert-view">view →</span>
      `;
      row.addEventListener('click', () => this.openViewer(cert));
      this.tableBody.appendChild(row);
    });
  }

  setupViewer() {
    if (!this.viewerEl) return;

    const closeBtn = document.getElementById('certViewerClose');
    const backdrop = document.getElementById('certViewerBackdrop');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeViewer());
    if (backdrop) backdrop.addEventListener('click', () => this.closeViewer());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.viewerEl.hidden) {
        this.closeViewer();
      }
    });
  }

  openViewer(cert) {
    if (!this.viewerEl || !this.viewerFrame) return;

    this.viewerTitle.textContent = cert.name;
    this.viewerFrame.src = cert.file;

    if (this.viewerDownload) {
      this.viewerDownload.href = cert.file;
      this.viewerDownload.setAttribute('download', `${cert.id}.pdf`);
    }

    this.viewerEl.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  closeViewer() {
    if (!this.viewerEl) return;
    this.viewerEl.hidden = true;
    this.viewerFrame.src = '';
    document.body.style.overflow = '';
  }

  get count() {
    return this.certifications.length;
  }
}