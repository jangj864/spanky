import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, cp, rm, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { renderLayout } from "../src/layout.mjs";
import { concepts, products, asset } from "../src/scripts/catalog.js";
const root = fileURLToPath(new URL("../", import.meta.url));
const pages = JSON.parse(await readFile(`${root}src/pages.json`, "utf8"));
await rm(`${root}dist`, { recursive: true, force: true });
await mkdir(`${root}dist`, { recursive: true });
await cp(`${root}public`, `${root}dist`, { recursive: true });
// Hash the entire module graph together so relative imports share the same version.
const scriptFiles = (await readdir(`${root}src/scripts`)).sort();
const scriptHash = createHash("sha256");
for (const file of scriptFiles)
  scriptHash.update(file).update(await readFile(`${root}src/scripts/${file}`));
const scriptVersion = scriptHash.digest("hex").slice(0, 12);
const css = await readFile(`${root}src/styles/main.css`);
const styleVersion = createHash("sha256")
  .update(css)
  .digest("hex")
  .slice(0, 12);
await mkdir(`${root}dist/styles`, { recursive: true });
await writeFile(`${root}dist/styles/main.${styleVersion}.css`, css);
await cp(`${root}src/scripts`, `${root}dist/scripts/${scriptVersion}`, {
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
    renderLayout({ page, ...meta, content, scriptVersion, styleVersion }),
  );
}
await writeFile(`${root}dist/.nojekyll`, "");
console.log(
  `Built ${Object.keys(pages).length} pages and ${products.length} collection products.`,
);
