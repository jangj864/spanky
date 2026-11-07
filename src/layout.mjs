const navigation = [
  ["index.html#shop", "Shop", "shop"],
  ["index.html#lookbook", "Lookbook", "lookbook"],
  ["world.html", "Explore", "world"],
  ["about.html", "About", "about"],
];
export function renderLayout({ page, title, description, dark, content }) {
  const links = navigation
    .map(
      ([url, label, key]) =>
        `<a href="${url}" ${page === key ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#24104f"><meta name="description" content="${description}">
<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:type" content="website"><meta property="og:image" content="https://jangj864.github.io/spanky/assets/campaign-sagging-wide.png">
<title>${title}</title><link rel="icon" href="assets/favicon.svg">
<link rel="preload" href="assets/fonts/cinea-700.ttf" as="font" type="font/ttf" crossorigin>
<link rel="stylesheet" href="styles/main.css"><script type="module" src="scripts/site.js"></script><script type="module" src="scripts/storefront.js"></script>
</head>
<body class="${dark ? "world-page" : "store-page"}">
<a class="skip-link" href="#main">Skip to content</a>
<div class="announce">COLLECTION 01 / TYPE D <span>Seven concepts. All-over expression.</span></div>
<header class="site-header">
<a href="index.html" class="logo" aria-label="SPANKY home"><img src="assets/logo.svg" width="158" height="43" alt="spanky"></a>
<nav id="site-nav" aria-label="Main navigation">${links}</nav>
<div class="header-actions"><button id="bag" class="bag" data-open-cart aria-label="Open shopping bag">Bag <span data-cart-count>0</span> ↗</button><button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu <span>+</span></button></div>
</header>
<main id="main">${content}</main>
<footer class="site-footer">
<div class="footer-lead"><div class="eyebrow">YOUR FIRST LAYER OF SELF-EXPRESSION</div><a href="index.html#shop">Stay a little spanky. ↗</a></div>
<div class="footer-columns"><div><h2>Collection</h2><a href="index.html#shop">Type D / All-over</a><a href="index.html#lookbook">Lookbook</a></div><div><h2>Discover</h2><a href="about.html">Our belief</a><a href="world.html">Explore</a><a href="campaign.html">After hours</a><a href="packaging.html">Packaging</a></div><div><h2>Good to know</h2><button id="sizeGuide">Size guide</button><button id="shipping">Shipping & returns</button><p>A design studio storefront.<br>All orders are demonstrations.</p></div></div>
<div class="footer-legal"><span>SPANKY® © 2026 · JINHYEOK JANG</span><span>Different expressions. Same you.</span><a href="#main">Back to top ↑</a></div>
</footer>
<dialog id="productDialog" aria-label="Product options"><button class="close" aria-label="Close product options">×</button><div id="productDetail"></div></dialog>
<dialog id="cartDialog" aria-label="Shopping bag and demo checkout"><button class="close" aria-label="Close shopping bag">×</button><div id="cartContent"></div></dialog>
<dialog id="infoDialog" aria-label="Store information"><button class="close" aria-label="Close store information">×</button><div id="infoContent"></div></dialog>
<div id="toast" role="status" aria-live="polite"></div>
</body></html>`;
}
