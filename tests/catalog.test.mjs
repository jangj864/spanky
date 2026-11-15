import test from "node:test";
import assert from "node:assert/strict";
import {
  asset,
  concepts,
  money,
  products,
  getProduct,
  filterProducts,
} from "../src/scripts/catalog.js";
import { normalizeCart, createCartStore } from "../src/scripts/cart.js";
test("only seven collection designs remain with stable IDs", () => {
  assert.equal(products.filter((p) => p.collection === "core").length, 7);
  assert.deepEqual(
    products.filter((p) => p.collection === "core").map((p) => p.id),
    [3, 7, 11, 15, 19, 23, 27],
  );
  assert(
    products
      .filter((p) => p.collection === "core")
      .every((p) => p.t === 3 && p.name === concepts[p.c].name),
  );
  assert.equal(getProduct(0), undefined);
});
test("search matches concept, motif and color without mutating catalog", () => {
  assert.equal(filterProducts({ query: "bipolar" })[0].id, 7);
  assert.equal(filterProducts({ query: "lime" })[0].id, 11);
  assert.equal(filterProducts({ query: "not a pattern" }).length, 0);
  filterProducts({ sort: "name" });
  assert.equal(products[0].id, 3);
});
test("storage drops retired designs and malformed rows; merges and clamps quantities", () => {
  assert.deepEqual(normalizeCart(null), []);
  assert.deepEqual(
    normalizeCart([
      { id: 0, size: "M", qty: 1 },
      { id: 3, size: "M", qty: 2 },
      { id: 3, size: "M", qty: 100 },
      { id: 7, size: "XXL", qty: 1 },
      null,
    ]),
    [{ id: 3, size: "M", qty: 10 }],
  );
});
test("cart works with corrupt or blocked storage and updates totals correctly", () => {
  const cart = createCartStore({
    getItem: () => "{bad",
    setItem: () => {
      throw Error("blocked");
    },
  });
  assert.equal(cart.count(), 0);
  cart.add(3, "M");
  cart.add(3, "M");
  cart.add(7, "L");
  assert.equal(cart.subtotal(), 45);
  cart.change(3, "M", -2);
  assert.equal(cart.count(), 1);
  cart.remove(7, "L");
  assert.equal(cart.subtotal(), 0);
  cart.add(0, "M");
  assert.equal(cart.count(), 0);
});

test("all products cost USD 15 and format in dollars", () => {
  assert(products.every((product) => product.price === 15));
  assert.equal(money(15), "$15");
  assert.equal(money(30), "$30");
});

test("special category has five artist concepts with valid stable IDs and front assets", () => {
  const special = filterProducts({ collection: "special" });
  assert.deepEqual(
    special.map((p) => p.id),
    [100, 101, 102, 103, 104],
  );
  assert(
    special.every(
      (p) =>
        p.hasBack &&
        p.price === 15 &&
        p.image &&
        asset(p, "back") === p.backImage &&
        p.backImage !== p.image,
    ),
  );
  assert.equal(filterProducts({ collection: "core" }).length, 7);
  assert.equal(
    filterProducts({ query: "kaws", collection: "special" })[0].id,
    103,
  );
});

test("custom designs stay distinct, persist and reject malformed configuration", async () => {
  const { defaultDesign } = await import("../src/scripts/design.js");
  const a = { ...defaultDesign },
    b = { ...a, band: "#ffffff" };
  let saved = "[]";
  const storage = {
    getItem: () => saved,
    setItem: (_, value) => {
      saved = value;
    },
  };
  const cart = createCartStore(storage);
  cart.add(200, "M", a);
  cart.add(200, "M", b);
  cart.add(200, "M", a);
  assert.equal(cart.items().length, 2);
  assert.equal(cart.subtotal(), 45);
  const restored = createCartStore(storage);
  assert.equal(restored.items()[0].design.band, a.band);
  restored.change(200, "M", -1, a);
  assert.equal(restored.items()[0].qty, 1);
  restored.remove(200, "M", b);
  assert.equal(restored.items().length, 1);
  restored.add(200, "M", { ...a, logo: "<script>" });
  assert.equal(restored.count(), 1);
});
