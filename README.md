# smanotasa.github.io

Source for [santiagomanotas.com](https://smanotasa.github.io) — Santiago Manotas Arroyave's personal CV/portfolio site.

A plain static site (no framework, no build step) hosted on GitHub Pages: profile, experience, education, skills, and project links, with a downloadable CV and a dark/light theme that follows the visitor's system preference by default.

## Structure

```text
index.html              Single-page site
assets/css/style.css    Design tokens + layout (light/dark via CSS custom properties)
assets/js/theme.js      Theme toggle (system preference by default, manual override persisted in localStorage)
assets/js/dot-grid.js   Cursor-reactive dot-grid canvas in the hero
assets/img/             Photo and favicons
assets/files/           Downloadable CV PDF
```

## Local preview

No build step — just serve the directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment

GitHub Pages serves this repo directly from the `main` branch. `.nojekyll` disables Jekyll processing so files are served as-is.

## License

MIT — see [LICENSE](LICENSE).
