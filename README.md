# Czech–Indian Chamber of Commerce (CZINCC)

Marketing site for the Czech–Indian Chamber of Commerce. Static HTML/CSS/JS — no build step.

## Structure

- `index.html` — homepage
- `about.html` — about
- `membership.html` — membership
- `site.css` — shared styles (used by about/membership; the homepage carries its own inline styles)
- `site.js` — scroll reveals + light [Lenis](https://lenis.darkroom.engineering/) smooth scroll
- `assets/` — imagery (member logos, portraits, news). Web-optimized versions live under each `*/web/` subfolder.

## Develop

Any static server, e.g.:

```bash
python3 -m http.server 4321
```

Then open http://127.0.0.1:4321/

## Deploy

Deployed on Vercel as a static site (no framework, no build command).
