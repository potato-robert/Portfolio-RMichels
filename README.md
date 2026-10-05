# Portfolio-RMichels

[<img alt="Deployed with SFTP Deploy Action" src="https://img.shields.io/badge/Deployed With-SFTP Deploy-%3CCOLOR%3E?style=for-the-badge&color=228c8c">](https://github.com/wlixcc/SFTP-Deploy-Action)

[Hosted Portfolio Website](https://rmichels.com)

## About

My personal portfolio website which serves as an online presence for my software development work. Designed in Figma, built with Astro as a static site, and utilizing Three.js and Sass.

[![Screenshot](https://rmichels.com/assets/img/portfolio/portfolioSiteCapture.jpg)](https://rmichels.com)

## Tech

- **Stack:** Astro 5, TypeScript islands, Sass, Three.js
    - Refactored, the original implementation used the LAMP-stack
- **Local dev:** `npm install` then `npm run dev` (http://localhost:4321)
- **Build:** `npm run build` → output in `dist/`
- **Assets:** `npm run rm-assets` before build (also runs via `pretest:content` / Astro integration; CI caches `node_modules/.cache/rm-assets`)
- Hosted with Hostinger via GitHub Actions SFTP deploy (see [docs/DEPLOY.md](docs/DEPLOY.md))