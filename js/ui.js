// Shared layout (announcement bar, header, navigation, footer), product cards,
// toasts and small helpers used by every page.

import { CATEGORIES, GROUPS } from "./config.js";
import { t, lang, setLang, formatPrice, categoryName } from "./i18n.js";
import { icon } from "./icons.js";
import { addToCart, cartCount } from "./cart.js";
import { revealPage, footerReveal, magnetic, pageTransitions, flyToCart, spinIcon, openMenu, openDropdown, themeTransition, lockScroll } from "./motion.js";

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function stars(rating, size = 14) {
  const full = Math.round(rating);
  let out = "";
  for (let i = 1; i <= 5; i++) out += `<span class="star ${i <= full ? "is-on" : ""}">${icon("star", size)}</span>`;
  return `<span class="stars" role="img" aria-label="${rating.toFixed(1)} / 5">${out}</span>`;
}

// ── Theme ────────────────────────────────────────────────────────────────────

function currentTheme() {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function toggleTheme(button) {
  const next = currentTheme() === "dark" ? "light" : "dark";
  themeTransition(button, () => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("bloom-theme", next); } catch {}
    updateThemeButtons();
  });
  spinIcon(button.querySelector(".action-icon"));
}

function updateThemeButtons() {
  const dark = currentTheme() === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.querySelector(".action-icon").innerHTML = icon(dark ? "sun" : "moon", 22);
    const label = btn.querySelector(".action-label");
    if (label) label.textContent = dark ? t("header.light") : t("header.dark");
  });
}

// ── Header & navigation ──────────────────────────────────────────────────────

function logo(onDark = false) {
  return `
    <a class="logo ${onDark ? "logo-on-dark" : ""}" href="index.html" aria-label="Bloom">
      <span class="logo-mark">${icon("flower", 24)}</span>
      <span class="logo-words">
        <span class="logo-name">Bloom</span>
        <span class="logo-tag">${t("footer.tagline")}</span>
      </span>
    </a>`;
}

function announcement() {
  return `
    <div class="announcement">
      <div class="container announcement-row">
        <span class="announce-item">${icon("truck", 16)} ${t("announce.delivery")}</span>
        <span class="announce-item hide-mobile">${icon("rotate", 16)} ${t("announce.returns")}</span>
        <span class="announce-item hide-mobile">${icon("message", 16)} ${t("announce.whatsapp")}</span>
      </div>
    </div>`;
}

const NAV_LINKS = [
  { key: "home", href: "index.html" },
  { key: "shop", href: "shop.html" },
  { key: "skincare", href: "shop.html?category=skin-care" },
  { key: "makeup", href: "shop.html?category=beauty" },
  { key: "fashion", href: "shop.html?group=fashion" },
  { key: "newArrivals", href: "shop.html?sort=newest" },
  { key: "offers", href: "shop.html?sort=discount" },
];

function categoryMenu() {
  return GROUPS.map((g) => `
    <div class="menu-group">
      <p class="menu-group-title">${t(`group.${g}`)}</p>
      ${CATEGORIES.filter((c) => c.group === g).map((c) => `<a href="shop.html?category=${c.slug}">${categoryName(c.slug)}</a>`).join("")}
    </div>`).join("");
}

function header(active) {
  const q = new URLSearchParams(location.search).get("q") || "";
  return `
    <header class="site-header">
      <div class="container header-row">
        <button class="icon-btn menu-btn" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-nav" aria-label="${t("header.menu")}">${icon("menu", 24)}</button>
        ${logo()}
        <form class="search" action="shop.html" role="search">
          <span class="search-icon">${icon("search", 18)}</span>
          <input class="search-input" type="search" name="q" value="${esc(q)}" placeholder="${t("header.search")}" aria-label="${t("header.searchLabel")}">
        </form>
        <div class="header-actions">
          <button class="action hide-mobile" type="button" data-lang-toggle aria-label="${t("header.langLabel")}" lang="${lang === "ar" ? "en" : "ar"}">
            <span class="action-icon">${icon("globe", 22)}</span>
            <span class="action-label">${t("header.lang")}</span>
          </button>
          <button class="action" type="button" data-theme-toggle aria-label="${t("header.themeLabel")}">
            <span class="action-icon">${icon("moon", 22)}</span>
            <span class="action-label hide-mobile">${t("header.dark")}</span>
          </button>
          <a class="action" href="cart.html" ${active === "cart" ? 'aria-current="page"' : ""}>
            <span class="action-icon">${icon("cart", 22)}<span class="cart-count" data-cart-count hidden>0</span></span>
            <span class="action-label hide-mobile">${t("header.cart")}</span>
          </a>
        </div>
      </div>
    </header>
    <nav class="site-nav" id="site-nav" aria-label="Main" data-lenis-prevent>
      <div class="container nav-row">
        <div class="all-categories">
          <button class="btn btn-primary btn-sm all-categories-btn" type="button" data-categories-toggle aria-expanded="false">
            ${icon("menu", 18)} ${t("nav.allCategories")} ${icon("chevronDown", 16)}
          </button>
          <div class="categories-menu" hidden data-lenis-prevent>${categoryMenu()}</div>
        </div>
        <ul class="nav-links">
          ${NAV_LINKS.map((l) => `<li><a href="${l.href}" ${l.key === active ? 'aria-current="page"' : ""}>${t(`nav.${l.key}`)}</a></li>`).join("")}
        </ul>
        <button class="nav-lang show-mobile" type="button" data-lang-toggle lang="${lang === "ar" ? "en" : "ar"}">${icon("globe", 18)} ${t("header.lang")}</button>
      </div>
    </nav>`;
}

// ── Footer ───────────────────────────────────────────────────────────────────

export function featuresStrip() {
  const items = [
    ["truck", "feat.delivery", "feat.deliverySub"],
    ["rotate", "feat.returns", "feat.returnsSub"],
    ["message", "feat.whatsapp", "feat.whatsappSub"],
    ["headphones", "feat.help", "feat.helpSub"],
  ];
  return `
    <section class="section container">
      <ul class="features">
        ${items.map(([ic, title, sub]) => `
          <li class="feature">
            <span class="icon-circle">${icon(ic, 20)}</span>
            <span><strong>${t(title)}</strong><small>${t(sub)}</small></span>
          </li>`).join("")}
      </ul>
    </section>`;
}

function footer() {
  const cols = [
    ["footer.shop", [["footer.allProducts", "shop.html"], ["nav.newArrivals", "shop.html?sort=newest"], ["nav.offers", "shop.html?sort=discount"], ["footer.bestsellers", "shop.html?sort=rating"]]],
    ["footer.categories", [["cat.skin-care", "shop.html?category=skin-care"], ["cat.beauty", "shop.html?category=beauty"], ["nav.fashion", "shop.html?group=fashion"], ["cat.womens-bags", "shop.html?category=womens-bags"]]],
    ["footer.help", [["footer.orderWhatsapp", "cart.html"], ["footer.cart", "cart.html"]]],
  ];
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-top">
          <div class="footer-brand">
            ${logo(true)}
            <p>${t("footer.about")}</p>
            <div class="social">
              <a href="#" aria-label="Instagram">${icon("instagram", 18)}</a>
              <a href="#" aria-label="TikTok">${icon("music", 18)}</a>
              <a href="#" aria-label="WhatsApp">${icon("message", 18)}</a>
            </div>
          </div>
          <div class="footer-cols">
            ${cols.map(([title, links]) => `
              <div class="footer-col">
                <h2>${t(title)}</h2>
                <ul>${links.map(([k, href]) => `<li><a href="${href}">${t(k)}</a></li>`).join("")}</ul>
              </div>`).join("")}
          </div>
          <div class="footer-contact">
            <h2>${t("footer.contact")}</h2>
            <a class="whatsapp-pill" href="cart.html">${icon("message", 18)} <span dir="ltr">+972 59 260 7179</span></a>
            <small>${t("footer.hours")}</small>
          </div>
        </div>
        <div class="footer-bottom">
          <small>${t("footer.rights")} ${t("footer.demo")}</small>
          <button class="footer-lang" type="button" data-lang-toggle>${icon("globe", 16)} <span lang="en">English</span> / <span lang="ar">العربية</span> · SAR</button>
        </div>
      </div>
    </footer>`;
}

// ── Product card ─────────────────────────────────────────────────────────────

const registry = new Map();

export function productCard(p) {
  registry.set(p.id, p);
  const url = `product.html?id=${p.id}`;
  return `
    <article class="product-card">
      <a class="product-media" href="${url}" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.thumbnail)}" alt="" loading="lazy" width="300" height="300">
        ${p.discount > 0 ? `<span class="badge badge-sale" dir="ltr">-${p.discount}%</span>` : ""}
      </a>
      <div class="product-info">
        <span class="product-category">${categoryName(p.category)}</span>
        <h3 class="product-title"><a href="${url}">${esc(p.title)}</a></h3>
        <span class="product-rating">${stars(p.rating, 12)} <small>${t("card.reviews", { n: p.reviews.length })}</small></span>
      </div>
      <div class="product-bottom">
        <span class="price">
          <strong class="price-now">${formatPrice(p.price)}</strong>
          ${p.oldPrice ? `<s class="price-old">${formatPrice(p.oldPrice)}</s>` : ""}
        </span>
        <button class="icon-btn icon-btn-primary" type="button" data-add-to-cart="${p.id}" aria-label="${t("card.add")}: ${esc(p.title)}" ${p.stock < 1 ? "disabled" : ""}>${icon("cart", 18)}</button>
      </div>
    </article>`;
}

export function skeletonCards(n) {
  return Array.from({ length: n }, () => `
    <div class="product-card is-skeleton" aria-hidden="true">
      <div class="product-media skeleton"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line short"></div>
    </div>`).join("");
}

export function errorState(onRetry) {
  const id = "retry-" + Math.random().toString(36).slice(2);
  queueMicrotask(() => document.getElementById(id)?.addEventListener("click", onRetry));
  return `
    <div class="state">
      <span class="state-icon">${icon("alert", 28)}</span>
      <p>${t("error.load")}</p>
      <button class="btn btn-primary" id="${id}" type="button">${t("error.retry")}</button>
    </div>`;
}

// ── Toast ────────────────────────────────────────────────────────────────────

export function toast(message) {
  let region = $(".toast-region");
  if (!region) {
    region = document.createElement("div");
    region.className = "toast-region";
    region.setAttribute("role", "status");
    region.setAttribute("aria-live", "polite");
    document.body.append(region);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = `${icon("check", 18)}<span>${esc(message)}</span>`;
  region.append(el);
  setTimeout(() => el.classList.add("is-leaving"), 2400);
  setTimeout(() => el.remove(), 2800);
}

// ── Cart badge ───────────────────────────────────────────────────────────────

function updateCartCount() {
  const n = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = n > 99 ? "99+" : String(n);
    el.hidden = n === 0;
  });
}

// ── Page setup ───────────────────────────────────────────────────────────────

export function initLayout(active) {
  document.getElementById("site-top").innerHTML = announcement() + header(active);
  document.getElementById("site-bottom").innerHTML = footer();
  updateThemeButtons();
  updateCartCount();
  revealPage();
  footerReveal();
  magnetic();
  pageTransitions();

  window.addEventListener("cart:change", updateCartCount);
  window.addEventListener("storage", (e) => { if (e.key === "bloom-cart") updateCartCount(); });

  document.addEventListener("click", (e) => {
    const target = e.target.closest("button, a");
    if (!target) {
      closeCategories();
      return;
    }

    if (target.matches("[data-theme-toggle]")) toggleTheme(target);
    else if (target.matches("[data-lang-toggle]")) setLang(lang === "ar" ? "en" : "ar");
    else if (target.matches("[data-menu-toggle]")) toggleMenu(target);
    else if (target.matches("[data-categories-toggle]")) toggleCategories(target);
    else if (target.matches("[data-add-to-cart]")) {
      const product = registry.get(Number(target.dataset.addToCart));
      if (product) {
        flyToCart(target.closest(".product-card")?.querySelector(".product-media img"));
        addToCart(product, 1);
        toast(t("card.added"));
      }
    }

    if (!target.closest(".all-categories")) closeCategories();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeCategories();
      const btn = $("[data-menu-toggle]");
      if (btn?.getAttribute("aria-expanded") === "true") toggleMenu(btn);
    }
  });
}

function toggleMenu(btn) {
  const open = btn.getAttribute("aria-expanded") !== "true";
  btn.setAttribute("aria-expanded", String(open));
  btn.innerHTML = icon(open ? "close" : "menu", 24);
  const bottom = $(".site-header").getBoundingClientRect().bottom;
  document.documentElement.style.setProperty("--header-bottom", `${Math.max(0, bottom)}px`);
  document.body.classList.toggle("nav-open", open);
  lockScroll(open);
  if (open) openMenu($("#site-nav"));
}

function toggleCategories(btn) {
  const menu = btn.nextElementSibling;
  const open = menu.hidden;
  menu.hidden = !open;
  btn.setAttribute("aria-expanded", String(open));
  if (open) openDropdown(menu);
}

function closeCategories() {
  const btn = $("[data-categories-toggle]");
  if (!btn) return;
  btn.setAttribute("aria-expanded", "false");
  btn.nextElementSibling.hidden = true;
}
