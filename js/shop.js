import { CATEGORIES, GROUPS } from "./config.js";
import { getCatalog } from "./api.js";
import { t, categoryName, countLabel } from "./i18n.js";
import { icon } from "./icons.js";
import { initLayout, productCard, skeletonCards, errorState, esc, $ } from "./ui.js";
import { fontsReady, shopIntro, animateGrid, openFilters, magnetic } from "./motion.js";

initLayout("shop");

const main = document.getElementById("main");
const SORTS = ["featured", "priceAsc", "priceDesc", "newest", "discount", "rating"];

// ── State (kept in the URL so links like shop.html?category=skin-care work) ──

function readState() {
  const p = new URLSearchParams(location.search);
  let cats = (p.get("category") || "").split(",").filter((s) => CATEGORIES.some((c) => c.slug === s));
  const group = p.get("group");
  if (group && GROUPS.includes(group)) cats = CATEGORIES.filter((c) => c.group === group).map((c) => c.slug);
  const sort = SORTS.includes(p.get("sort")) ? p.get("sort") : "featured";
  return {
    q: p.get("q") || "",
    cats,
    sort,
    min: p.get("min") || "",
    max: p.get("max") || "",
  };
}

let state = readState();
let products = [];

function writeState() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.cats.length) p.set("category", state.cats.join(","));
  if (state.sort !== "featured") p.set("sort", state.sort);
  if (state.min) p.set("min", state.min);
  if (state.max) p.set("max", state.max);
  const qs = p.toString();
  history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
}

function filtered() {
  const q = state.q.trim().toLowerCase();
  const min = Number(state.min) || 0;
  const max = Number(state.max) || Infinity;
  const list = products.filter((p) =>
    (!state.cats.length || state.cats.includes(p.category)) &&
    p.price >= min && p.price <= max &&
    (!q || [p.title, p.brand, p.category, categoryName(p.category), p.description].join(" ").toLowerCase().includes(q))
  );
  const by = {
    featured: (a, b) => b.rating * 10 + b.discount / 10 - (a.rating * 10 + a.discount / 10),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    discount: (a, b) => b.discount - a.discount,
    rating: (a, b) => b.rating - a.rating,
  };
  return list.sort(by[state.sort]);
}

// ── Rendering ────────────────────────────────────────────────────────────────

function pageTitle() {
  if (state.cats.length === 1) return categoryName(state.cats[0]);
  const group = GROUPS.find((g) => {
    const slugs = CATEGORIES.filter((c) => c.group === g).map((c) => c.slug);
    return slugs.length === state.cats.length && slugs.every((s) => state.cats.includes(s));
  });
  return group ? t(`group.${group}`) : t("shop.title");
}

function filtersPanel() {
  return `
    <aside class="filters" id="filters" aria-label="${t("shop.filters")}">
      <div class="filters-head">
        <h2 class="h4">${t("shop.filters")}</h2>
        <button class="icon-btn show-mobile" type="button" data-filters-close aria-label="${t("shop.show")}">${icon("close", 20)}</button>
      </div>
      <form class="filters-form" data-filters>
        <label class="field">
          <span class="field-label">${t("shop.search")}</span>
          <span class="input-icon">${icon("search", 18)}<input class="input" type="search" name="q" value="${esc(state.q)}" placeholder="${t("header.search")}"></span>
        </label>
        <fieldset class="field">
          <legend class="field-label">${t("shop.categories")}</legend>
          ${GROUPS.map((g) => `
            <p class="filter-group">${t(`group.${g}`)}</p>
            ${CATEGORIES.filter((c) => c.group === g).map((c) => `
              <label class="check">
                <input type="checkbox" name="cat" value="${c.slug}" ${state.cats.includes(c.slug) ? "checked" : ""}>
                <span>${categoryName(c.slug)}</span>
                <small>${products.filter((p) => p.category === c.slug).length}</small>
              </label>`).join("")}`).join("")}
        </fieldset>
        <fieldset class="field">
          <legend class="field-label">${t("shop.price")}</legend>
          <div class="price-range">
            <input class="input" type="number" inputmode="numeric" min="0" name="min" value="${esc(state.min)}" placeholder="${t("shop.min")}" aria-label="${t("shop.min")}">
            <span aria-hidden="true">–</span>
            <input class="input" type="number" inputmode="numeric" min="0" name="max" value="${esc(state.max)}" placeholder="${t("shop.max")}" aria-label="${t("shop.max")}">
          </div>
        </fieldset>
        <div class="filters-actions">
          <button class="btn btn-outline btn-sm" type="button" data-clear>${t("shop.clear")}</button>
          <button class="btn btn-primary btn-sm show-mobile" type="button" data-filters-close>${t("shop.show")}</button>
        </div>
      </form>
    </aside>`;
}

function layout() {
  return `
    <section class="container page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">${t("nav.home")}</a> ${icon("chevron", 14)} <span aria-current="page" data-title>${pageTitle()}</span></nav>
      <h1 class="h1" data-title>${pageTitle()}</h1>
    </section>
    <section class="container shop">
      ${filtersPanel()}
      <div class="shop-results">
        <div class="toolbar">
          <p class="text-secondary" data-count aria-live="polite"></p>
          <div class="toolbar-actions">
            <button class="btn btn-outline btn-sm show-mobile" type="button" data-filters-open aria-controls="filters">${icon("filter", 16)} ${t("shop.filters")}</button>
            <label class="sort">
              <span class="hide-mobile">${t("shop.sort")}</span>
              <select class="input select" data-sort aria-label="${t("shop.sort")}">
                ${SORTS.map((s) => `<option value="${s}" ${s === state.sort ? "selected" : ""}>${t(`sort.${s}`)}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="product-grid" data-grid></div>
      </div>
    </section>`;
}

function renderResults() {
  const list = filtered();
  $("[data-count]").textContent = countLabel(list.length, "shop.result", "shop.results");
  document.querySelectorAll("[data-title]").forEach((el) => (el.textContent = pageTitle()));
  document.title = `${pageTitle()} · Bloom`;
  $("[data-grid]").innerHTML = list.length
    ? list.map(productCard).join("")
    : `<div class="state">
         <span class="state-icon">${icon("search", 28)}</span>
         <p><strong>${t("shop.emptyTitle")}</strong><br>${t("shop.emptyBody")}</p>
         <button class="btn btn-outline btn-sm" type="button" data-clear>${t("shop.clear")}</button>
       </div>`;
  animateGrid($("[data-grid]"));
}

function syncFromForm() {
  const form = $("[data-filters]");
  state.q = form.elements.q.value;
  state.cats = [...form.querySelectorAll('input[name="cat"]:checked')].map((i) => i.value);
  state.min = form.elements.min.value;
  state.max = form.elements.max.value;
  writeState();
  renderResults();
}

function bind() {
  const form = $("[data-filters]");
  let timer;
  form.addEventListener("input", (e) => {
    clearTimeout(timer);
    timer = setTimeout(syncFromForm, e.target.type === "checkbox" ? 0 : 250);
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  $("[data-sort]").addEventListener("change", (e) => {
    state.sort = e.target.value;
    writeState();
    renderResults();
  });

  main.addEventListener("click", (e) => {
    if (e.target.closest("[data-clear]")) {
      state = { q: "", cats: [], sort: state.sort, min: "", max: "" };
      form.reset();
      form.querySelectorAll("input").forEach((i) => (i.type === "checkbox" ? (i.checked = false) : (i.value = "")));
      writeState();
      renderResults();
    }
    if (e.target.closest("[data-filters-open]")) {
      document.body.classList.add("filters-open");
      openFilters($("#filters"));
    }
    if (e.target.closest("[data-filters-close]")) document.body.classList.remove("filters-open");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.body.classList.remove("filters-open");
  });
}

async function render() {
  main.innerHTML = `<section class="container page-head"><div class="skeleton skeleton-line" style="width:200px;height:40px"></div></section>
    <section class="container"><div class="product-grid">${skeletonCards(8)}</div></section>`;
  try {
    [products] = await Promise.all([getCatalog(), fontsReady]);
    main.innerHTML = layout();
    shopIntro();
    renderResults();
    bind();
    magnetic(main);
  } catch (err) {
    console.error(err);
    main.innerHTML = `<section class="section container">${errorState(render)}</section>`;
  }
}

render();
