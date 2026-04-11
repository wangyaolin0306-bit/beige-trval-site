# Project Handoff

Date: 2026-04-10

## Current Status

- Static site is prepared for deployment.
- GitHub repo: `https://github.com/wangyaolin0306-bit/beige-trval-site.git`
- Cloudflare Pages deployment is working.
- Public preview URL: `https://beige-trval-site.pages.dev/`
- Custom domain is connected and already accessible.
- Latest content fix: product detail page `Specifications` block now follows language switching.

## Latest Work

- Fixed the product detail page spec section so title and labels translate with the selected language.
- Updated `js/product.js` and `js/product-media.js` to refresh spec labels/values on language change.
- Added spec label IDs in `product-detail.html` so the section can be re-rendered cleanly.
- Verified both JS files pass `node --check`.

## Domain

- Primary domain: `beige-trval.com`
- `www.beige-trval.com` is also available.

## Image Convention

Product folders live under:

- `images/products/<id>-<product-name>/`

Each product folder should contain:

- `PRODUCT MAIN IMAGE 1.jpg`
- `PRODUCT MAIN IMAGE 2.jpg`
- `PRODUCT MAIN IMAGE 3.jpg`
- `PRODUCT MAIN IMAGE 4.jpg`

Notes:

- Product card uses `PRODUCT MAIN IMAGE 1`
- Product detail page uses all 4 images
- Existing fallback support still exists for older folder/file naming

## Build / Deploy

- Cloudflare Pages build command: `bash build.sh`
- Build output directory: `dist`
- `build.sh` creates a clean `dist/` folder so `.git` is not packaged

## Important Files

- `build.sh`
- `js/product-media.js`
- `js/product-image-folders.js`
- `collections.html`
- `product-detail.html`
- `css/style.css`

## Update Workflow

1. User sends new product info or image files.
2. Update product data and/or folder mapping.
3. Push to GitHub.
4. Cloudflare Pages redeploys automatically.

## Git Notes

- One local repo state showed `No commits yet on main` and an empty `origin`.
- A later push failed with `fetch first`, which means the remote `main` already had commits.
- If that happens again, run `git fetch origin`, then `git pull origin main --allow-unrelated-histories`, then `git push origin main`.

## Notes

- Do not store secrets here.
- If a future chat starts fresh, read this file first.
