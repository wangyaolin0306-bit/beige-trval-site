# Project Handoff

Date: 2026-04-10

## Current Status

- Static site is prepared for deployment.
- GitHub repo: `https://github.com/wangyaolin0306-bit/beige-trval-site.git`
- Cloudflare Pages deployment is working.
- Public preview URL: `https://beige-trval-site.pages.dev/`
- Custom domain is connected and already accessible.

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

## Notes

- Do not store secrets here.
- If a future chat starts fresh, read this file first.
