import { readFile, readdir, access } from "node:fs/promises";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { products, asset } from "../src/scripts/catalog.js";
for (const filename of (await readdir("dist")).filter((f) =>
  f.endsWith(".html"),
)) {
  const html = await readFile(`dist/${filename}`, "utf8");
  assert.match(html, /lang="en"/);
  assert.doesNotMatch(html, /type\s+d/i, `${filename}: retired display label`);
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.match(html, /aria-label="Main navigation"/);
  assert.match(html, /name="description"/);
  assert.doesNotMatch(
    html,
    /TYPE [ABC](?:\s|<)|Type [ABC](?:\s|<)|28 DESIGNS|four graphic/i,
  );
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${filename}: duplicate IDs`);
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|#|mailto:)/.test(url)) continue;
    await access(resolve("dist", url.split(/[?#]/)[0]));
  }
}
for (const p of products) {
  await access(resolve("dist", asset(p)));
  if (p.hasBack) await access(resolve("dist", asset(p, "back")));
}
assert.equal(products.length, 11);
console.log(
  "Pages, metadata, local links, IDs and collection assets verified.",
);
