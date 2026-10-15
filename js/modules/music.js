/**
 * Music Module
 * Omarchy-style now-playing card for the terminal view: cover art, title,
 * artist and a pixel equalizer. The track streams from SoundCloud through its
 * Widget API (a hidden embed), so no audio is hosted here.
 *
 * The player starts MUTED on every visit (the choice is never persisted).
 * Muted means paused, so nothing streams until the visitor unmutes. The embed
 * itself only loads once the visitor reaches for the card (hover, focus,
 * click or the `music` command).
 *
 * The audio lives in a cross-origin iframe, so its signal can't be analysed:
 * the equalizer is a stepped animation that runs only while the track plays.
 */

const TRACK_URL = 'https://soundcloud.com/alrtmusic/alrt-ft-liam-elliott-dopamine-hit';
const API_SRC = 'https://w.soundcloud.com/player/api.js';
const LOAD_TIMEOUT = 12000; // ms before the card gives up and shows offline
const PLAY_TIMEOUT = 4000;  // ms to wait for PLAY before reverting to muted
const BARS = 5;
const LEVELS = 6;           // pixel segments per bar
const EQ_FPS = 9;           // stepped, retro update rate

export class MusicPlayer {
  constructor() {
    this.el = null;
    this.bars = [];
    this.widget = null;
    this.loading = null;     // promise while the embed loads
    this.muted = true;
    this.playing = false;
    this.playGuard = 0;
    this.eqTimer = 0;
    this.levels = new Array(BARS).fill(1);
  }

  init() {
    this.el = document.getElementById('music-player');
    if (!this.el) return;

    const eq = this.el.querySelector('.mp-eq');
    for (let i = 0; i < BARS; i++) {
      const bar = document.createElement('span');
      bar.className = 'mp-bar';
      eq.appendChild(bar);
      this.bars.push(bar);
    }

    // warm the embed up as soon as the visitor reaches for the card
    const warm = () => this.load();
    this.el.addEventListener('pointerenter', warm, { once: true });
    this.el.addEventListener('focus', warm, { once: true });
    this.el.addEventListener('click', () => this.toggleMute());

    // Only the terminal view plays; the recruiter view hides and pauses it.
    new MutationObserver(() => {
      if (document.body.dataset.terminal === 'off') this.pause();
      else if (!this.muted) this.play();
    }).observe(document.body, { attributes: true, attributeFilter: ['data-terminal'] });

    this.render();
  }

  get offline() {
    return this.el && this.el.dataset.state === 'offline';
  }

  /** Inject the SoundCloud API + a hidden embed once; resolves with the widget. */
  load() {
    if (this.loading) return this.loading;
    this.loading = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), LOAD_TIMEOUT);
      const ready = () => {
        const frame = document.createElement('iframe');
        frame.className = 'mp-frame';
        frame.title = 'SoundCloud player';
        frame.allow = 'autoplay';
        frame.setAttribute('aria-hidden', 'true');
        frame.tabIndex = -1;
        frame.src = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(TRACK_URL) +
          '&auto_play=false&buying=false&sharing=false&download=false&show_comments=false&visual=false';
        document.body.appendChild(frame);

        const widget = window.SC.Widget(frame);
        const E = window.SC.Widget.Events;
        widget.bind(E.READY, () => {
          clearTimeout(timer);
          widget.setVolume(60);
          widget.getCurrentSound((sound) => this.setArtwork(sound));
          resolve(widget);
        });
        widget.bind(E.PLAY, () => { clearTimeout(this.playGuard); this.playing = true; this.render(); });
        widget.bind(E.PAUSE, () => { this.playing = false; this.render(); });
        widget.bind(E.FINISH, () => { widget.seekTo(0); if (!this.muted) widget.play(); });
        widget.bind(E.ERROR, () => this.setOffline());
        this.widget = widget;
      };

      if (window.SC && window.SC.Widget) { ready(); return; }
      const script = document.createElement('script');
      script.src = API_SRC;
      script.async = true;
      script.onload = ready;
      script.onerror = () => { clearTimeout(timer); reject(new Error('api')); };
      document.head.appendChild(script);
    });
    this.loading.catch(() => this.setOffline());
    return this.loading;
  }

  setArtwork(sound) {
    const url = sound && (sound.artwork_url || (sound.user && sound.user.avatar_url));
    if (!url) return;
    const art = this.el.querySelector('.mp-art');
    if (art) art.style.backgroundImage = `url("${url.replace('-large', '-t200x200')}")`;
  }

  /** Flip mute. Returns false when the track is unavailable. */
  toggleMute() {
    if (this.offline) return false;
    this.muted = !this.muted;
    if (this.muted) this.pause();
    else this.play();
    this.render();
    return true;
  }

  play() {
    if (this.offline || document.body.dataset.terminal === 'off') return;
    this.load().then((widget) => {
      if (this.muted) return;
      widget.play();
      // if the browser blocks playback no PLAY event arrives — don't claim
      // we're unmuted when nothing is audible
      clearTimeout(this.playGuard);
      this.playGuard = setTimeout(() => {
        if (!this.playing) { this.muted = true; this.render(); }
      }, PLAY_TIMEOUT);
    }, () => {});
  }

  pause() {
    clearTimeout(this.playGuard);
    if (this.widget) this.widget.pause();
    this.playing = false;
    this.render();
  }

  setOffline() {
    this.muted = true;
    this.playing = false;
    this.el.dataset.state = 'offline';
    this.render();
  }

  render() {
    if (!this.el) return;
    this.el.classList.toggle('is-muted', this.muted);
    this.el.setAttribute('aria-pressed', String(!this.muted));
    this.el.setAttribute(
      'aria-label',
      this.offline
        ? 'Music unavailable'
        : this.muted ? 'Unmute music: Dopamine Hit by ALRT ft. Liam Elliott' : 'Mute music'
    );

    clearInterval(this.eqTimer);
    if (this.muted || !this.playing) {
      this.bars.forEach((b) => b.style.setProperty('--lvl', 1));
      return;
    }
    // stepped random walk per bar, biased so the low bars run hotter
    this.eqTimer = setInterval(() => {
      for (let i = 0; i < BARS; i++) {
        const bias = 1 - i * 0.08;
        const target = 1 + Math.random() * (LEVELS - 1) * bias;
        this.levels[i] += (target - this.levels[i]) * 0.6;
        this.bars[i].style.setProperty('--lvl', Math.max(1, Math.round(this.levels[i])));
      }
    }, 1000 / EQ_FPS);
  }
}
