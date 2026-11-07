# SPANKY

English-only brand storefront for Jinhyeok Jang's SPANKY design studio project. Seven original all-over boxer briefs and five Special Collection artist collaboration concepts. The collection names, colors, artwork and philosophy follow the supplied brand identity PDF.

Live: https://jangj864.github.io/spanky/

## Develop

Requires Node.js 22+ and npm. No runtime framework or client dependencies.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. After editing source, run `npm run build` and refresh. `npm run dev` builds once and starts a local static server; it does not watch files.

```sh
npm run check   # build + cart/catalogue tests + generated-page/link validation
npm run format  # format source, scripts and tests
npx playwright install chromium
npm run test:e2e # browser regression suite
```

## Where to make changes

| Task                                                         | File                        |
| ------------------------------------------------------------ | --------------------------- |
| Collection names, descriptions, prices, colors, search terms | `src/scripts/catalog.js`    |
| Shared navigation, footer, dialog shells and SEO tags        | `src/layout.mjs`            |
| Page titles and descriptions                                 | `src/pages.json`            |
| Page-specific editorial content                              | `src/pages/*.html`          |
| Brand palette, typography and responsive component styles    | `src/styles/main.css`       |
| Cart persistence, validation and quantity limits             | `src/scripts/cart.js`       |
| Product, search, cart and demo checkout interactions         | `src/scripts/storefront.js` |
| Mobile navigation                                            | `src/scripts/site.js`       |
| Original website assets and fonts                            | `public/assets/`            |

`dist/` is generated, ignored by Git and overwritten on each build. **Do not edit dist directly.** The build copies `public/` and source scripts/styles, then renders all pages through the shared layout. About collection cards also come from the catalogue, so names and artwork cannot drift from the store.

## Deploy

Push to `main`. `.github/workflows/deploy-pages.yml` installs pinned development dependencies, builds, runs checks, and publishes `dist/` to GitHub Pages. Catalogue/cart unit tests, page checks and browser regression tests must pass before deployment. Pages must use **GitHub Actions** as its source. All URLs are relative to support the `/spanky/` subdirectory. Build-generated content hashes version the complete JavaScript module graph and stylesheet, preventing stale catalogue and price data after deployment.

## Store behavior

- Seven original all-over designs and five Special Collection concepts (Keith Haring, Jean-Michel Basquiat, Kaikai Kiki KAWS and Piet Mondrian). A–C products and their public asset copies have been removed.
- Stable numeric product IDs preserve existing Type D carts; stored A–C entries are discarded.
- Cart storage contains only product ID, size and quantity. Invalid data is dropped, duplicates merge, and each design/size is limited to 10.
- Blocked or corrupt local storage does not prevent the current shopping session. Open tabs synchronize cart updates.
- The bag, size guide and shipping information work on every page.
- Native dialogs support Escape and focus return. Mobile navigation exposes its open state. Reduced-motion preferences are respected.

## Demo boundary

Prices, sizing and shipping are illustrative. Checkout is a **demo**, with no payment, order backend, transactional email, inventory or fulfilment. Use sample delivery details: they are not saved or transmitted. Real retail release requires those services and finalized policies.

## Brand assets and licensing

The SVG wordmark is the supplied master, independent of the display typeface. Product WebPs derive from the user's 28 supplied PNGs; the current storefront serves Type D only. Event, packaging and retail-space images are concept mockups. The wide model image `campaign-sagging-wide.png` was generated with built-in image_gen from SPANKY's purple wave and lime branching product references. It is explicitly labeled as an AI campaign visual.

TBJ Cinea Sans files supplied by the user are Demo/Trial, used for this noncommercial studio concept; verify the appropriate web/commercial license before retail use. The included notice is in `public/assets/fonts/Befonts-License.txt`. Pretendard is loaded from its version-pinned official distribution under the SIL Open Font License.

Special Collection assets are the five user-supplied front and back mockup pairs. All twelve designs are USD 15 in this demo. Category filtering can be linked with `index.html?collection=special#shop`.
