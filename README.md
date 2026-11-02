# Plumb — Franchise Outlet Quality Control System

A static, no-backend product site + working-feeling dashboard for an AI-powered outlet quality control SaaS.

- `index.html` — marketing site (interactive AI demo, pricing calculator, industries, FAQ)
- `app.html` — product dashboard for the demo brand "Kettle & Co." (18 outlets): overview, inspections with AI detection overlays, new-inspection flow, corrective-task board with AI fix verification, outlet comparison & repeat violations, standards editor, billing

Open `index.html` in a browser, or serve with `python3 -m http.server`. State changes (task updates, submitted inspections, AI toggles) persist in `localStorage`.

Sample café photographs in `assets/img/` are from Unsplash (free to use under the Unsplash licence).
