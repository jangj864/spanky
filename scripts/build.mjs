import { readFile, writeFile, mkdir, cp, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { renderLayout } from "../src/layout.mjs";
import { concepts, products, asset } from "../src/scripts/catalog.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const pages = JSON.parse(await readFile(`${root}src/pages.json`, "utf8"));
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
await cp(`${root}public`, `${root}dist`, { recursive: true });
for (const directory of ["styles", "scripts"])
  await cp(`${root}src/${directory}`, `${root}dist/${directory}`, {
    recursive: true,
  });
const conceptCards = products
  .map((product) => {
    const concept = concepts[product.c];
    return `<article class="concept-item"><img src="${asset(product)}" alt="${product.name}" width="1536" height="1024" loading="lazy"><h3>${concept.name}</h3><p>${concept.motif}</p><button class="text-link" data-product="${product.id}">Explore design ↗</button></article>`;
  })
  .join("");
for (const [page, meta] of Object.entries(pages)) {
  const content = (
    await readFile(`${root}src/pages/${page}.html`, "utf8")
  ).replace("{{conceptCards}}", conceptCards);
  await writeFile(
    `${root}dist/${page}.html`,
    renderLayout({ page, ...meta, content }),
  );
}
await writeFile(`${root}dist/.nojekyll`, "");
console.log(
  `Built ${Object.keys(pages).length} pages and ${products.length} collection products.`,
);
