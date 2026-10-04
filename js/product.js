import { getCatalog, getProduct } from "./api.js";
import { t, lang, categoryName, formatPrice } from "./i18n.js";
import { icon } from "./icons.js";
import { initLayout, productCard, errorState, stars, esc, toast, $ } from "./ui.js";
import { addToCart } from "./cart.js";
import { fontsReady, productIntro, swapImage, flyToCart, magnetic } from "./motion.js";

initLayout("shop");

const main = document.getElementById("main");
const id = new URLSearchParams(location.search).get("id");

function stockLabel(p) {
  if (p.stock < 1) return `<span class="stock is-out">${t("product.outOfStock")}</span>`;
  if (p.stock <= 10) return `<span class="stock is-low">${t("product.lowStock", { n: p.stock })}</span>`;
  return `<span class="stock">${icon("check", 16)} ${t("product.inStock")}</span>`;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-GB", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function view(p, related) {
  const details = [
    ["product.brand", p.brand],
    ["product.shipping", p.shipping],
    ["product.returns", p.returns],
    ["product.warranty", p.warranty],
  ].filter(([, v]) => v);

  return `
    <section class="container page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="index.html">${t("nav.home")}</a> ${icon("chevron", 14)}
        <a href="shop.html?category=${p.category}">${categoryName(p.category)}</a> ${icon("chevron", 14)}
        <span aria-current="page">${esc(p.title)}</span>
      </nav>
    </section>

    <section class="container product-layout">
      <div class="gallery">
        <div class="gallery-main">
          <img src="${esc(p.images[0])}" alt="${esc(p.title)}" width="600" height="600" data-main-image>
          ${p.discount > 0 ? `<span class="badge badge-sale" dir="ltr">-${p.discount}%</span>` : ""}
        </div>
        ${p.images.length > 1 ? `
          <div class="gallery-thumbs">
            ${p.images.map((src, i) => `
              <button class="thumb ${i === 0 ? "is-active" : ""}" type="button" data-thumb="${esc(src)}" aria-label="${i + 1} / ${p.images.length}">
                <img src="${esc(src)}" alt="" loading="lazy" width="80" height="80">
              </button>`).join("")}
          </div>` : ""}
      </div>

      <div class="product-detail">
        <a class="overline" href="shop.html?category=${p.category}">${categoryName(p.category)}</a>
        <h1 class="h1">${esc(p.title)}</h1>
        <p class="product-rating">${stars(p.rating, 16)} <span>${p.rating.toFixed(1)}</span> <small class="text-muted">${t("card.reviews", { n: p.reviews.length })}</small></p>

        <div class="detail-price">
          <strong class="price-now">${formatPrice(p.price)}</strong>
          ${p.oldPrice ? `<s class="price-old">${formatPrice(p.oldPrice)}</s> <span class="badge badge-soft">${t("product.save", { amount: formatPrice(p.oldPrice - p.price) })}</span>` : ""}
        </div>

        ${stockLabel(p)}

        <p class="body text-secondary">${esc(p.description)}</p>

        <div class="buy">
          <div class="stepper" role="group" aria-label="${t("product.quantity")}">
            <button type="button" data-step="-1" aria-label="${t("product.decrease")}">${icon("minus", 16)}</button>
            <input type="number" min="1" max="${p.stock}" value="1" data-qty aria-label="${t("product.quantity")}">
            <button type="button" data-step="1" aria-label="${t("product.increase")}">${icon("plus", 16)}</button>
          </div>
          <button class="btn btn-primary" type="button" data-add ${p.stock < 1 ? "disabled" : ""}>${icon("cart", 18)} ${t("card.add")}</button>
          <button class="btn btn-secondary" type="button" data-buy ${p.stock < 1 ? "disabled" : ""}>${t("product.buyNow")} ${icon("arrow", 18)}</button>
        </div>

        ${details.length ? `
          <dl class="details">
            ${details.map(([k, v]) => `<div><dt>${t(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}
          </dl>` : ""}
      </div>
    </section>

    ${p.reviews.length ? `
      <section class="section container" aria-labelledby="reviews-title">
        <div class="section-header"><h2 class="h2" id="reviews-title">${t("product.reviews")}</h2></div>
        <ul class="reviews reviews-grid">
          ${p.reviews.map((r) => `
            <li class="review-card">
              <span class="avatar tint-blush">${esc(r.reviewerName.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span>
              <div>
                <p class="review-name"><strong>${esc(r.reviewerName)}</strong> <small>${formatDate(r.date)}</small></p>
                ${stars(r.rating, 14)}
                <p class="body-s text-secondary">${esc(r.comment)}</p>
              </div>
            </li>`).join("")}
        </ul>
      </section>` : ""}

    ${related.length ? `
      <section class="section container" aria-labelledby="related-title">
        <div class="section-header">
          <h2 class="h2" id="related-title">${t("product.related")}</h2>
          <a class="link" href="shop.html?category=${p.category}">${categoryName(p.category)} ${icon("arrow", 16)}</a>
        </div>
        <div class="product-grid">${related.map(productCard).join("")}</div>
      </section>` : ""}`;
}

function bind(p) {
  const qty = $("[data-qty]");
  const clamp = () => {
    qty.value = Math.max(1, Math.min(Number(qty.value) || 1, p.stock || 1));
  };
  qty.addEventListener("change", clamp);

  main.addEventListener("click", (e) => {
    const step = e.target.closest("[data-step]");
    if (step) {
      qty.value = Number(qty.value) + Number(step.dataset.step);
      clamp();
    }

    const thumb = e.target.closest("[data-thumb]");
    if (thumb) {
      swapImage($("[data-main-image]"), thumb.dataset.thumb);
      main.querySelectorAll(".thumb").forEach((b) => b.classList.toggle("is-active", b === thumb));
    }

    if (e.target.closest("[data-add]")) {
      clamp();
      flyToCart($("[data-main-image]"));
      addToCart(p, Number(qty.value));
      toast(t("card.added"));
    }

    if (e.target.closest("[data-buy]")) {
      clamp();
      addToCart(p, Number(qty.value));
      location.href = "cart.html";
    }
  });
}

async function render() {
  main.innerHTML = `<section class="container product-layout"><div class="gallery-main skeleton"></div><div><div class="skeleton skeleton-line"></div><div class="skeleton skeleton-line short"></div></div></section>`;
  try {
    const p = await getProduct(id);
    if (!p) {
      main.innerHTML = `
        <section class="section container">
          <div class="state">
            <span class="state-icon">${icon("search", 28)}</span>
            <p>${t("product.notFound")}</p>
            <a class="btn btn-primary" href="shop.html">${t("product.backToShop")}</a>
          </div>
        </section>`;
      return;
    }
    const [all] = await Promise.all([getCatalog(), fontsReady]);
    const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
    document.title = `${p.title} · Bloom`;
    main.innerHTML = view(p, related);
    bind(p);
    productIntro();
    magnetic(main);
  } catch (err) {
    console.error(err);
    main.innerHTML = `<section class="section container">${errorState(render)}</section>`;
  }
}

render();
