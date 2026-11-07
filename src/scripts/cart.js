import { getProduct, sizes } from './catalog.js';
export const CART_KEY = 'spanky-cart';
export const MAX_QUANTITY = 10;
/** Untrusted or obsolete storage never enters the cart. Old A–C items are discarded. */
export function normalizeCart(value) {
  if (!Array.isArray(value)) return [];
  const result = new Map();
  for (const row of value) {
    if (!row || !Number.isInteger(row.id) || !getProduct(row.id) || !sizes.includes(row.size) || !Number.isInteger(row.qty) || row.qty <= 0) continue;
    const key = `${row.id}:${row.size}`;
    const previous = result.get(key)?.qty || 0;
    result.set(key, { id: row.id, size: row.size, qty: Math.min(MAX_QUANTITY, previous + row.qty) });
  }
  return [...result.values()];
}
export function createCartStore(storage) {
  let rows = [];
  const persist = () => { try { storage?.setItem(CART_KEY, JSON.stringify(rows)); } catch { /* The current session still works when storage is unavailable. */ } };
  const reload = () => { try { rows = normalizeCart(JSON.parse(storage?.getItem(CART_KEY) || '[]')); } catch { rows = []; } };
  reload();
  return {
    items: () => rows.map(row => ({ ...row })),
    count: () => rows.reduce((total, row) => total + row.qty, 0),
    subtotal: () => rows.reduce((total, row) => total + getProduct(row.id).price * row.qty, 0),
    reload,
    replace(value) { rows = normalizeCart(value); persist(); },
    add(id, size) { if (!getProduct(id) || !sizes.includes(size)) return; rows = normalizeCart([...rows, { id, size, qty: 1 }]); persist(); },
    change(id, size, delta) { rows = normalizeCart(rows.map(row => row.id === id && row.size === size ? { ...row, qty: row.qty + delta } : row)); persist(); },
    remove(id, size) { rows = rows.filter(row => row.id !== id || row.size !== size); persist(); },
    clear() { rows = []; persist(); },
  };
}
