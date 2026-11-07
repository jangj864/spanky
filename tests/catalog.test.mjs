import test from "node:test";
import assert from "node:assert/strict";
import {
  concepts,
  products,
  getProduct,
  filterProducts,
} from "../src/scripts/catalog.js";
import { normalizeCart, createCartStore } from "../src/scripts/cart.js";
test("only seven collection designs remain with stable IDs", () => {
  assert.equal(products.length, 7);
  assert.deepEqual(
    products.map((p) => p.id),
    [3, 7, 11, 15, 19, 23, 27],
  );
  assert(products.every((p) => p.t === 3 && p.name === concepts[p.c].name));
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
  assert.equal(cart.subtotal(), 114000);
  cart.change(3, "M", -2);
  assert.equal(cart.count(), 1);
  cart.remove(7, "L");
  assert.equal(cart.subtotal(), 0);
  cart.add(0, "M");
  assert.equal(cart.count(), 0);
});
