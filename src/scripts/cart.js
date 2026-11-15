import { normalizeDesign, designKey } from "./design.js";
import { getProduct, sizes } from "./catalog.js";
export const CART_KEY = "spanky-cart";
export const MAX_QUANTITY = 10;
/** Untrusted or obsolete storage never enters the cart. Old A–C items are discarded. */
export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const result = new Map();
  for (const row of value) {
    if (
      !row ||
      !Number.isInteger(row.id) ||
      !getProduct(row.id) ||
      !sizes.includes(row.size) ||
      !Number.isInteger(row.qty) ||
      row.qty <= 0
    )
      continue;
    const design = row.id === 200 ? normalizeDesign(row.design) : null;
    if (row.id === 200 && !design) continue;
    const key = `${row.id}:${row.size}:${designKey(design)}`;
    const previous = result.get(key)?.qty || 0;
    result.set(key, {
      id: row.id,
      ...(design ? { design } : {}),
      size: row.size,
      qty: Math.min(MAX_QUANTITY, previous + row.qty),
    });
  }
  return [...result.values()];
}
export function createCartStore(storage) {
  let rows = [];
  const persist = () => {
    try {
      storage?.setItem(CART_KEY, JSON.stringify(rows));
    } catch {
      /* The current session still works when storage is unavailable. */
    }
  };
  const reload = () => {
    try {
      rows = normalizeCart(JSON.parse(storage?.getItem(CART_KEY) || "[]"));
    } catch {
      rows = [];
    }
  };
  reload();
  return {
    items: () => rows.map((row) => ({ ...row })),
    count: () => rows.reduce((total, row) => total + row.qty, 0),
    subtotal: () =>
      rows.reduce(
        (total, row) => total + getProduct(row.id).price * row.qty,
        0,
      ),
    reload,
    replace(value) {
      rows = normalizeCart(value);
      persist();
    },
    add(id, size, design) {
      if (!getProduct(id) || !sizes.includes(size)) return;
      rows = normalizeCart([...rows, { id, size, qty: 1, design }]);
      persist();
    },
    change(id, size, delta, design) {
      rows = normalizeCart(
        rows.map((row) =>
          row.id === id &&
          row.size === size &&
          designKey(row.design) === designKey(design)
            ? { ...row, qty: row.qty + delta }
            : row,
        ),
      );
      persist();
    },
    remove(id, size, design) {
      rows = rows.filter(
        (row) =>
          row.id !== id ||
          row.size !== size ||
          designKey(row.design) !== designKey(design),
      );
      persist();
    },
    clear() {
      rows = [];
      persist();
    },
  };
}
