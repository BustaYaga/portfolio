# portfolio

Plain HTML/CSS/JS. No build step, no dependencies — open `index.html` in a browser and it works.

## File map

```
index.html              the whole single-page site (hero, about, projects, writeups, contact)
styles.css              all styling — color/font tokens are at the top as CSS variables
content.js              shortcut to js/content.package.js for easy copy editing
js/                     modular scripts and package architecture
  content.package.js    encapsulated paragraph copy & descriptions for easy editing
  portfolio.package.js  stacked production package called by index.html
  modules/              individual modules (content, threat-feed, terminal, modes, navigation, config)
script.js               legacy script entry point (delegates to package)
writeups/
  example-machine.html  template for one HTB writeup page — duplicate this per machine
```

## What to edit first

1. **`js/content.package.js`** (or **`content.js`**) — all paragraph `<p>` copy, bio paragraphs, project descriptions, hints, and notes are cleanly encapsulated here. Edit your text directly in this file without modifying HTML markup!
2. **`index.html`** — search for placeholder links (`href="#"`, `mailto:`, github/linkedin links) and custom tags.
3. **`js/modules/config.js`** or **`js/portfolio.package.js`** — controls what the hero terminal "types out" and threat feed options.
4. **`styles.css`** — the `:root` block at the top has every color/font used site-wide. Change
   `--accent` to re-theme the whole site in one edit.
5. **Add a writeup**: copy `writeups/example-machine.html`, rename it, edit the content sections,
   then add a new row to the table in `index.html` under `#writeups` pointing at it.

## Running locally

No build tools needed. Either:
- Just open `index.html` directly in a browser, or
- Serve it (avoids some browser file:// quirks): `python3 -m http.server 8000` then visit
  `http://localhost:8000`

## Deploying

### GitHub Pages
1. Push this folder to a GitHub repo.
2. Repo → Settings → Pages → Source: "Deploy from a branch" → branch `main`, folder `/root`.
3. Your site is live at `https://<username>.github.io/<repo>/` in a minute or two.
4. Custom domain: Settings → Pages → add your domain, then at your registrar add a `CNAME` record
   pointing to `<username>.github.io` (or `A` records to GitHub's IPs, listed in GitHub's docs).

### Vercel
1. Push this folder to a GitHub repo.
2. [vercel.com](https://vercel.com) → New Project → import the repo.
3. Framework preset: "Other". Leave build command and output directory blank — it's static.
4. Deploy. You get a `your-project.vercel.app` URL immediately, plus a preview URL on every
   future PR/branch push.
5. Custom domain: Project → Settings → Domains → add your domain → Vercel shows you the DNS
   records to add at your registrar. HTTPS is automatic.

Both options work fine for this site — pick whichever you want to get more comfortable with.
