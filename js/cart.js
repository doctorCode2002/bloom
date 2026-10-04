// Cart stored in localStorage. Each line keeps a snapshot of the product so the
// cart page can render without waiting for the API.

import { CONFIG } from "./config.js";

const KEY = "bloom-cart";
let memory = [];

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return memory;
  }
}

function write(items) {
  memory = items;
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  window.dispatchEvent(new CustomEvent("cart:change", { detail: items }));
}

export function getCart() {
  return read();
}

export function cartCount() {
  return read().reduce((n, item) => n + item.qty, 0);
}

export function addToCart(product, qty = 1) {
  const items = read();
  const line = items.find((i) => i.id === product.id);
  const max = product.stock || 99;
  if (line) line.qty = Math.min(line.qty + qty, max);
  else items.push({
    id: product.id,
    title: product.title,
    category: product.category,
    price: product.price,
    thumbnail: product.thumbnail,
    stock: max,
    qty: Math.min(qty, max),
  });
  write(items);
}

export function setQty(id, qty) {
  const items = read();
  const line = items.find((i) => i.id === id);
  if (!line) return;
  line.qty = Math.max(1, Math.min(qty, line.stock || 99));
  write(items);
}

export function removeFromCart(id) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export function cartTotals(items = read()) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= CONFIG.freeDeliveryThreshold ? 0 : CONFIG.deliveryFee;
  return { subtotal, delivery, total: subtotal + delivery };
}
