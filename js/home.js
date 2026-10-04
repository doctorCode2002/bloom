import { CATEGORIES } from "./config.js";
import { getCatalog } from "./api.js";
import { t, categoryName, formatPrice } from "./i18n.js";
import { icon } from "./icons.js";
import { initLayout, productCard, skeletonCards, errorState, featuresStrip, stars, esc, toast, $ } from "./ui.js";
import { fontsReady, heroIntro, homeSections, magnetic } from "./motion.js";

initLayout("home");

const main = document.getElementById("main");

function hero(products) {
  const byCat = (slug) => products.find((p) => p.category === slug);
  const main = byCat("womens-dresses");
  const side = byCat("skin-care");
  const maxDiscount = Math.max(...products.map((p) => p.discount));
  return `
    <section class="container hero-wrap">
      <div class="hero">
        <div class="hero-copy">
          <p class="overline">${t("hero.overline")}</p>
          <h1 class="display">${t("hero.title")}</h1>
          <p class="body-l text-secondary">${t("hero.body")}</p>
          <div class="hero-buttons">
            <a class="btn btn-primary" href="shop.html">${t("hero.shop")} ${icon("arrow", 18)}</a>
            <a class="btn btn-outline hide-mobile" href="shop.html?category=skin-care">${t("hero.explore")} ${icon("arrow", 18)}</a>
          </div>
          <ul class="trust">
            <li>${icon("shield", 18)} ${t("trust.authentic")}</li>
            <li>${icon("truck", 18)} ${t("trust.delivery")}</li>
            <li class="hide-mobile">${icon("message", 18)} ${t("trust.whatsapp")}</li>
          </ul>
        </div>
        <div class="hero-visual">
          ${main ? `<a class="hero-image" href="product.html?id=${main.id}"><img src="${esc(main.images[0])}" alt="${esc(main.title)}" width="600" height="600" fetchpriority="high"></a>` : `<div class="hero-image"></div>`}
          <div class="sale-tag">
            <span class="overline">${t("hero.sale")}</span>
            <strong>${t("hero.upTo")} ${maxDiscount}%</strong>
            <small>${t("hero.off")}</small>
          </div>
          ${side ? `
            <a class="hero-mini" href="product.html?id=${side.id}">
              <img src="${esc(side.thumbnail)}" alt="" width="64" height="64">
              <span><small>${categoryName(side.category)}</small><strong>${esc(side.title)}</strong><b>${formatPrice(side.price)}</b></span>
            </a>` : ""}
        </div>
      </div>
    </section>`;
}

function heroSkeleton() {
  return `<section class="container hero-wrap"><div class="hero skeleton hero-skeleton"></div></section>`;
}

function categories(products) {
  return `
    <section class="section container" aria-labelledby="cat-title">
      <h2 class="visually-hidden" id="cat-title">${t("home.categories")}</h2>
      <ul class="category-row scroll-row">
        ${CATEGORIES.map((c) => {
          const p = products.find((x) => x.category === c.slug);
          return `
            <li>
              <a class="category-chip" href="shop.html?category=${c.slug}">
                <span class="chip-circle tint-${c.tint}">${p ? `<img src="${esc(p.thumbnail)}" alt="" loading="lazy" width="72" height="72">` : icon("flower", 28)}</span>
                <span>${categoryName(c.slug)}</span>
              </a>
            </li>`;
        }).join("")}
        <li>
          <a class="category-chip" href="shop.html">
            <span class="chip-circle chip-all">${icon("arrow", 24)}</span>
            <span>${t("home.viewAll")}</span>
          </a>
        </li>
      </ul>
    </section>`;
}

function topPicks(products) {
  const picks = [...products].sort((a, b) => b.discount - a.discount).slice(0, 10);
  return `
    <section class="section container" aria-labelledby="picks-title">
      <div class="section-header">
        <h2 class="h2" id="picks-title">${t("home.topPicks")} <span class="accent-icon">${icon("sparkles", 22)}</span></h2>
        <a class="link" href="shop.html?sort=discount">${t("home.seeAllDeals")} ${icon("arrow", 16)}</a>
      </div>
      <div class="carousel">
        <div class="carousel-track scroll-row" data-carousel>${picks.map(productCard).join("")}</div>
        <button class="carousel-btn carousel-prev" type="button" data-carousel-prev aria-label="${t("home.prev")}">${icon("chevron", 20)}</button>
        <button class="carousel-btn carousel-next" type="button" data-carousel-next aria-label="${t("home.next")}">${icon("chevron", 20)}</button>
      </div>
    </section>`;
}

function promos(products) {
  const items = [
    ["sage", "promo.new", "shop.html?sort=newest", "tops"],
    ["blush", "promo.care", "shop.html?category=skin-care", "skin-care"],
    ["sky", "promo.acc", "shop.html?category=womens-jewellery", "womens-jewellery"],
  ];
  return `
    <section class="section container">
      <div class="promos">
        ${items.map(([tint, key, href, cat]) => {
          const p = products.find((x) => x.category === cat);
          return `
            <a class="promo tint-${tint}" href="${href}">
              <span class="promo-copy">
                <span class="overline text-secondary">${t(key + ".over")}</span>
                <span class="h3">${t(key + ".title")}</span>
                <span class="link">${t("promo.shop")} ${icon("arrow", 16)}</span>
              </span>
              ${p ? `<img src="${esc(p.thumbnail)}" alt="" loading="lazy" width="140" height="140">` : ""}
            </a>`;
        }).join("")}
      </div>
    </section>`;
}

function testimonials() {
  const reviews = [["n1", "q1", "blush"], ["n2", "q2", "sage"], ["n3", "q3", "lilac"]];
  return `
    <section class="section container" aria-labelledby="reviews-title">
      <div class="section-header">
        <h2 class="h2" id="reviews-title">${t("reviews.title")} <span class="accent-icon is-sale">${icon("heart", 22)}</span></h2>
        <span class="average">${t("reviews.average")} ${stars(4.8, 16)}</span>
      </div>
      <ul class="reviews scroll-row">
        ${reviews.map(([n, q, tint]) => {
          const name = t("reviews." + n);
          return `
            <li class="review-card">
              <span class="avatar tint-${tint}">${esc(name.split(" ").map((w) => w[0]).join("").slice(0, 2))}</span>
              <div>
                <p class="review-name"><strong>${esc(name)}</strong> ${icon("check", 14)} <small>${t("reviews.verified")}</small></p>
                ${stars(5, 14)}
                <p class="body-s text-secondary">“${t("reviews." + q)}”</p>
              </div>
            </li>`;
        }).join("")}
      </ul>
    </section>`;
}

function newsletter() {
  return `
    <section class="section container">
      <div class="newsletter">
        <span class="newsletter-icon">${icon("mail", 36)}</span>
        <div class="newsletter-copy">
          <h2 class="h2">${t("news.title")}</h2>
          <p>${t("news.body")}</p>
        </div>
        <form class="newsletter-form" novalidate>
          <div class="pill-field">
            <input type="email" name="email" required placeholder="${t("news.placeholder")}" aria-label="${t("news.placeholder")}">
            <button class="btn btn-secondary btn-sm" type="submit">${t("news.subscribe")}</button>
          </div>
          <p class="form-note">${icon("shield", 14)} ${t("news.privacy")}</p>
        </form>
      </div>
    </section>`;
}

function bind() {
  const track = $("[data-carousel]");
  if (track) {
    const step = () => track.clientWidth * 0.8 * (document.dir === "rtl" ? -1 : 1);
    $("[data-carousel-next]").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    $("[data-carousel-prev]").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  }

  const form = $(".newsletter-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.elements.email;
    if (!input.checkValidity() || !input.value) {
      input.setAttribute("aria-invalid", "true");
      toast(t("news.invalid"));
      input.focus();
      return;
    }
    input.removeAttribute("aria-invalid");
    form.reset();
    toast(t("news.thanks"));
  });
}

async function render() {
  main.innerHTML = heroSkeleton() + `<section class="section container"><div class="carousel-track scroll-row">${skeletonCards(5)}</div></section>`;
  try {
    const [products] = await Promise.all([getCatalog(), fontsReady]);
    main.innerHTML = hero(products) + categories(products) + topPicks(products) + promos(products) + testimonials() + newsletter() + featuresStrip();
    bind();
    heroIntro();
    homeSections();
    magnetic(main);
  } catch (err) {
    console.error(err);
    main.innerHTML = `<section class="section container">${errorState(render)}</section>`;
  }
}

render();
