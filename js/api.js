// Product data from DummyJSON (https://dummyjson.com), converted to SAR.
// The whole catalog (~46 products) is small, so it is loaded once and cached
// for the browser session; search, filters and sorting happen client-side.

import { CONFIG, CATEGORIES } from "./config.js";

const CACHE_KEY = "bloom-products-v1";
const FIELDS = [
  "id", "title", "description", "category", "price", "discountPercentage", "rating",
  "stock", "brand", "thumbnail", "images", "reviews", "availabilityStatus",
  "shippingInformation", "returnPolicy", "warrantyInformation", "meta", "tags",
].join(",");

let catalogPromise = null;

async function getJSON(path) {
  const res = await fetch(CONFIG.apiBase + path);
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${path}`);
  return res.json();
}

function toSar(usd) {
  return Math.round(usd * CONFIG.usdToSar);
}

function normalize(p) {
  const discount = Math.round(p.discountPercentage || 0);
  const price = toSar(p.price);
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    brand: p.brand || "",
    price,
    oldPrice: discount > 0 ? toSar(p.price / (1 - p.discountPercentage / 100)) : null,
    discount,
    rating: p.rating || 0,
    reviews: p.reviews || [],
    stock: p.stock ?? 0,
    thumbnail: p.thumbnail,
    images: p.images && p.images.length ? p.images : [p.thumbnail],
    shipping: p.shippingInformation || "",
    returns: p.returnPolicy || "",
    warranty: p.warrantyInformation || "",
    createdAt: p.meta?.createdAt || "",
  };
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCache(products) {
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(products)); } catch {}
}

async function fetchCatalog() {
  const cached = readCache();
  if (cached) return cached;
  const lists = await Promise.all(
    CATEGORIES.map((c) => getJSON(`/products/category/${c.slug}?limit=0&select=${FIELDS}`))
  );
  const products = lists.flatMap((l) => l.products).map(normalize);
  writeCache(products);
  return products;
}

export function getCatalog() {
  if (!catalogPromise) {
    catalogPromise = fetchCatalog().catch((err) => {
      catalogPromise = null; // allow retry
      throw err;
    });
  }
  return catalogPromise;
}

export async function getProduct(id) {
  const products = await getCatalog();
  return products.find((p) => p.id === Number(id)) || null;
}
