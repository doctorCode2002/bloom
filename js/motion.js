// Animations with GSAP (loaded from the CDN in each page's <head>).
//
// No flash of unstyled content: the inline <head> script adds `is-loading` to
// <html>, which hides the page. `revealPage()` waits for the web fonts (max
// 1.5s), removes the class and plays the intro in the same frame. Content that
// is rendered later gets its "from" state applied synchronously, before the
// browser paints it. Everything is skipped for prefers-reduced-motion.
//
// Smooth scrolling comes from Lenis, driven by GSAP's ticker so ScrollTrigger
// stays in sync. Section reveals are scrubbed: they follow the scroll position
// (`scrub: true`) and play backwards when scrolling up. Content that is already
// on screen when a page loads gets a time-based intro instead.

const gsap = window.gsap;
const { ScrollTrigger, SplitText } = window;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const animate = Boolean(gsap && ScrollTrigger && SplitText) && !reducedMotion;

if (animate) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power3.out", duration: 0.8 });
  gsap.config({ nullTargetWarn: false });
}

// ── Smooth scroll (Lenis) ────────────────────────────────────────────────────

export const lenis = animate && window.Lenis ? new window.Lenis({ lerp: 0.09, smoothWheel: true }) : null;
if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.2 });
  else window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
}

/** Stop page scrolling while a drawer or menu is open. */
export function lockScroll(locked) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

const dir = () => (document.dir === "rtl" ? -1 : 1);
const finePointer = window.matchMedia("(pointer: fine)").matches;
const CLEAR = "transform,opacity,visibility,transition,filter";

// ── Page reveal ──────────────────────────────────────────────────────────────

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
export const fontsReady = Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), wait(1500)]);

let markReady;
export const ready = new Promise((r) => (markReady = r));

export async function revealPage() {
  await fontsReady;
  clearTimeout(window.__bloomReveal);
  document.documentElement.classList.remove("is-loading");

  if (animate) {
    let firstVisit = true;
    try {
      firstVisit = !sessionStorage.getItem("bloom-intro");
      sessionStorage.setItem("bloom-intro", "1");
    } catch {}

    const tl = gsap.timeline();
    if (firstVisit) {
      tl.from(".announcement", { yPercent: -100, duration: 0.6, ease: "power2.out" })
        .from(".header-row > *", { y: -16, autoAlpha: 0, stagger: 0.08, duration: 0.6, clearProps: CLEAR }, 0.15)
        .from(".all-categories, .nav-links li", { y: 12, autoAlpha: 0, stagger: 0.045, duration: 0.5, clearProps: CLEAR }, 0.3);
    }
    tl.from("#main", { autoAlpha: 0, duration: 0.5, ease: "power1.out", clearProps: "opacity,visibility" }, firstVisit ? 0.2 : 0);
  }
  markReady();
  if (animate) {
    window.addEventListener("load", () => ScrollTrigger.refresh());
    // Images can change heights after first layout; keep trigger positions accurate
    let timer;
    new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 200);
    }).observe(document.getElementById("main"));
  }
}

// ── Scroll reveals ───────────────────────────────────────────────────────────

const NEUTRAL = {
  x: 0, y: 0, xPercent: 0, yPercent: 0, scale: 1, scaleX: 1, scaleY: 1,
  rotation: 0, rotationX: 0, rotationY: 0, skewX: 0, skewY: 0,
  autoAlpha: 1, filter: "blur(0px)",
};

const SCRUB = { start: "top 95%", end: "clamp(top 70%)" };

/**
 * Hide `targets` now, then reveal them as they scroll into view. The animation
 * is scrubbed: its progress follows the scroll position, in both directions.
 *   opts.group  - animate all targets as one staggered tween, triggered by this
 *                 element (selector or node) instead of one trigger per target
 *   opts.start / opts.end / opts.stagger / opts.ease
 * Returns a cleanup function.
 */
export function reveal(targets, from = { y: 40, autoAlpha: 0 }, opts = {}) {
  if (!animate) return () => {};
  const els = gsap.utils.toArray(targets);
  if (!els.length) return () => {};

  const to = {};
  for (const key of Object.keys(from)) if (key in NEUTRAL) to[key] = NEUTRAL[key];
  gsap.set(els, from);

  const tweens = [];
  let killed = false;
  ready.then(() => {
    if (killed) return;
    const make = (targetEls, trigger) => gsap.to(targetEls, {
      ...to,
      ease: opts.ease || "power2.out",
      stagger: opts.stagger ?? 0.08,
      scrollTrigger: { trigger, start: opts.start || SCRUB.start, end: opts.end || SCRUB.end, scrub: true },
    });
    if (opts.group) tweens.push(make(els, opts.group));
    else els.forEach((el) => tweens.push(make(el, el)));
  });
  return () => {
    killed = true;
    tweens.forEach((t) => { t.scrollTrigger?.kill(); t.kill(); });
  };
}

/** Time-based entrance for content that is already on screen. */
function enter(targets, from, opts = {}) {
  if (!animate) return;
  const els = gsap.utils.toArray(targets);
  if (!els.length) return;
  gsap.set(els, from);
  const to = { clearProps: CLEAR, duration: opts.duration || 0.8, ease: opts.ease || "power3.out", stagger: opts.stagger ?? 0.06, delay: opts.delay || 0 };
  for (const key of Object.keys(from)) if (key in NEUTRAL) to[key] = NEUTRAL[key];
  ready.then(() => gsap.to(els, to));
}

/** Headings: words rise out of a line mask, scrubbed with the scroll. */
export function revealHeading(targets) {
  if (!animate) return;
  gsap.utils.toArray(targets).forEach((el) => {
    const split = SplitText.create(el, { type: "lines,words", mask: "lines" });
    gsap.set(split.words, { yPercent: 110 });
    ready.then(() => {
      gsap.to(split.words, {
        yPercent: 0, ease: "power2.out", stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 95%", end: "clamp(top 65%)", scrub: true },
      });
    });
  });
}

// ── Home hero ────────────────────────────────────────────────────────────────

export function heroIntro() {
  if (!animate) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;
  const d = dir();

  const split = SplitText.create(hero.querySelector(".display"), { type: "lines,words", mask: "lines" });

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  tl.fromTo(hero, { clipPath: "inset(6% 4% 6% 4% round 48px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.3, ease: "expo.out", clearProps: "clipPath" }, 0)
    .from(".hero-copy .overline", { y: 20, autoAlpha: 0, duration: 0.6 }, 0.35)
    .from(split.words, { yPercent: 115, duration: 1.1, stagger: 0.07, ease: "expo.out" }, 0.45)
    .from(".hero-copy .body-l", { y: 24, autoAlpha: 0, filter: "blur(6px)", duration: 0.9, clearProps: CLEAR }, 0.85)
    .from(".hero-buttons > *", { y: 20, autoAlpha: 0, scale: 0.94, stagger: 0.1, duration: 0.7, ease: "back.out(1.7)", clearProps: CLEAR }, 1.0)
    .from(".trust li", { x: -18 * d, autoAlpha: 0, stagger: 0.08, duration: 0.6, clearProps: CLEAR }, 1.15)
    .fromTo(".hero-image", { clipPath: "circle(0% at 50% 60%)" }, { clipPath: "circle(75% at 50% 60%)", duration: 1.5, ease: "expo.inOut", clearProps: "clipPath" }, 0.2)
    .from(".hero-image img", { scale: 1.35, yPercent: 12, rotation: -4 * d, duration: 1.8, ease: "expo.out" }, 0.55)
    .from(".sale-tag", { scale: 0, rotation: -16 * d, autoAlpha: 0, duration: 0.9, ease: "back.out(2.2)" }, 1.15)
    .from(".hero-mini", { x: -48 * d, y: 16, autoAlpha: 0, duration: 0.9, ease: "power4.out" }, 1.3)
    .add(() => split.revert())
    .add(idleHero);

  ready.then(() => tl.play());

  // Scroll: the visual drifts slower than the page, the copy fades away
  ready.then(() => {
    gsap.to(".hero-visual", { yPercent: 6, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.fromTo(".hero-copy", { y: 0, opacity: 1 }, { y: -40, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  });

  // Pointer parallax on desktop
  if (finePointer) {
    const img = hero.querySelector(".hero-image");
    const tag = hero.querySelector(".sale-tag");
    const imgX = gsap.quickTo(img, "x", { duration: 0.8, ease: "power3" });
    const imgY = gsap.quickTo(img, "y", { duration: 0.8, ease: "power3" });
    const tagX = gsap.quickTo(tag, "x", { duration: 1, ease: "power3" });
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      imgX(px * 18); imgY(py * 14); tagX(px * -24);
    });
    hero.addEventListener("pointerleave", () => { imgX(0); imgY(0); tagX(0); });
  }
}

function idleHero() {
  gsap.to(".hero-image img", { y: -12, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".sale-tag", { y: -6, rotation: 2.5 * dir(), duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".hero-mini", { y: -8, duration: 2.8, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.4 });
}

// ── Home sections ────────────────────────────────────────────────────────────

export function homeSections() {
  if (!animate) return;
  const d = dir();

  revealHeading(".section-header .h2");
  reveal(".section-header .link, .average", { x: 40 * d, autoAlpha: 0 });
  reveal(".category-chip", { y: 60, scale: 0.7, autoAlpha: 0 }, { group: ".category-row", stagger: 0.05, ease: "back.out(1.4)" });
  reveal(".carousel", { y: 80, scale: 0.97, autoAlpha: 0 }, { end: "clamp(top 60%)" });
  reveal(".carousel .product-card", { x: 120 * d, rotation: 2 * d, autoAlpha: 0 }, { group: ".carousel", stagger: 0.06, end: "clamp(top 45%)" });

  // Promos slide in from alternating sides; their images spin in and drift
  document.querySelectorAll(".promo").forEach((promo, i) => {
    reveal(promo, { x: (i % 2 ? 120 : -120) * d, autoAlpha: 0 }, { end: "clamp(top 60%)" });
    const img = promo.querySelector("img");
    if (!img) return;
    reveal(img, { scale: 0.3, rotation: -30 * d, autoAlpha: 0 }, { group: promo, ease: "back.out(1.6)", end: "clamp(top 50%)" });
    ready.then(() => gsap.fromTo(img, { yPercent: 14 }, { yPercent: -14, ease: "none", scrollTrigger: { trigger: promo, start: "top bottom", end: "bottom top", scrub: true } }));
  });

  reveal(".review-card", { y: 100, rotation: 3 * d, autoAlpha: 0 }, { group: ".reviews", stagger: 0.12, end: "clamp(top 50%)" });
  reveal(".review-card .avatar", { scale: 0, rotation: -90, autoAlpha: 0 }, { group: ".reviews", stagger: 0.12, ease: "back.out(2)", end: "clamp(top 45%)" });

  const news = document.querySelector(".newsletter");
  if (news) {
    gsap.set(news, { clipPath: "inset(18% 12% 18% 12% round 64px)", autoAlpha: 0.4 });
    gsap.set(".newsletter-icon", { scale: 0, rotation: -120 });
    gsap.set(".newsletter-copy, .newsletter-form", { y: 50, autoAlpha: 0 });
    ready.then(() => {
      gsap.timeline({ scrollTrigger: { trigger: news, start: "top 95%", end: "clamp(top 45%)", scrub: true } })
        .to(news, { clipPath: "inset(0% 0% 0% 0% round 24px)", autoAlpha: 1, duration: 1, ease: "power2.out" })
        .to(".newsletter-icon", { scale: 1, rotation: 0, duration: 0.6, ease: "back.out(2)" }, 0.35)
        .to(".newsletter-copy, .newsletter-form", { y: 0, autoAlpha: 1, stagger: 0.15, duration: 0.6 }, 0.45);
    });
  }

  reveal(".feature", { y: 50, autoAlpha: 0 }, { group: ".features", stagger: 0.1 });
  reveal(".feature .icon-circle", { scale: 0, rotation: -90, autoAlpha: 0 }, { group: ".features", stagger: 0.1, ease: "back.out(2)" });
}

export function footerReveal() {
  if (!animate) return;
  reveal(".footer-brand, .footer-col, .footer-contact", { y: 60, autoAlpha: 0 }, { group: ".site-footer", stagger: 0.08, start: "top 100%", end: "clamp(top 60%)" });
  reveal(".footer-bottom", { y: 20, autoAlpha: 0 }, { start: "top 100%", end: "clamp(top 90%)" });
}

// ── Shop, product, cart ──────────────────────────────────────────────────────

let gridCleanup = () => {};
export function animateGrid(grid) {
  if (!animate) return;
  gridCleanup();
  const items = gsap.utils.toArray(grid.querySelectorAll(".product-card, .state"));
  const fold = window.innerHeight * 0.95;
  // Cards already on screen get a quick staggered entrance; the rest are scrubbed
  const visible = items.filter((el) => el.getBoundingClientRect().top < fold);
  const below = items.filter((el) => el.getBoundingClientRect().top >= fold);
  enter(visible, { y: 30, scale: 0.96, autoAlpha: 0 }, { stagger: 0.05, duration: 0.6 });
  gridCleanup = reveal(below, { y: 80, scale: 0.92, autoAlpha: 0 });
}

export function shopIntro() {
  if (!animate) return;
  const d = dir();
  enter(".breadcrumb, .page-head .h1", { y: 20, autoAlpha: 0 }, { stagger: 0.1 });
  if (window.matchMedia("(min-width: 1024px)").matches) {
    enter(".filters", { x: -30 * d, autoAlpha: 0 }, { delay: 0.1 });
    enter(".filters-form > *", { y: 16, autoAlpha: 0 }, { delay: 0.2 });
  }
  enter(".toolbar", { y: 16, autoAlpha: 0 }, { delay: 0.15 });
}

export function openFilters(panel) {
  if (!animate) return;
  gsap.fromTo(panel.querySelectorAll(".filters-form > *"), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.05, duration: 0.5, delay: 0.1, clearProps: CLEAR });
}

export function productIntro() {
  if (!animate) return;
  const d = dir();
  const tl = gsap.timeline({ paused: true });
  tl.fromTo(".gallery-main", { clipPath: "inset(0% 0% 100% 0% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 24px)", duration: 1.2, ease: "expo.inOut", clearProps: "clipPath" }, 0)
    .from(".gallery-main img", { scale: 1.3, duration: 1.6, ease: "expo.out" }, 0.3)
    .from(".gallery-main .badge", { scale: 0, rotation: -20, duration: 0.7, ease: "back.out(2.5)" }, 0.9)
    .from(".thumb", { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.5, clearProps: CLEAR }, 0.7)
    .from(".product-detail > *", { x: 30 * d, autoAlpha: 0, stagger: 0.07, duration: 0.8, ease: "power4.out", clearProps: CLEAR }, 0.25);
  ready.then(() => tl.play());
  revealHeading(".section .h2");
  reveal(".section-header .link", { x: 40 * d, autoAlpha: 0 });
  reveal(".reviews-grid .review-card", { y: 80, rotation: 2 * d, autoAlpha: 0 }, { group: ".reviews-grid", stagger: 0.12 });
  reveal(".section .product-card", { y: 100, scale: 0.92, autoAlpha: 0 }, { group: ".section .product-grid", stagger: 0.08, end: "clamp(top 50%)" });
}

export function swapImage(img, src) {
  if (!animate) { img.src = src; return; }
  gsap.timeline()
    .to(img, { autoAlpha: 0, scale: 0.92, filter: "blur(6px)", duration: 0.2, ease: "power2.in" })
    .add(() => { img.src = src; })
    .to(img, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "power3.out", clearProps: CLEAR });
}

export function cartIntro() {
  if (!animate) return;
  const tl = gsap.timeline({ paused: true });
  tl.from(".page-head > *", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.6, clearProps: CLEAR })
    .from(".cart-line", { x: -40 * dir(), autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: "power4.out", clearProps: CLEAR }, 0.15)
    .from(".cart-aside > *", { y: 40, autoAlpha: 0, stagger: 0.12, duration: 0.8, clearProps: CLEAR }, 0.25)
    .from(".state > *", { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.6, clearProps: CLEAR }, 0);
  ready.then(() => tl.play());
}

/** Collapse a cart line before it is removed. */
export function collapse(el) {
  if (!animate) return Promise.resolve();
  return new Promise((resolve) => {
    gsap.timeline({ onComplete: resolve })
      .to(el, { x: 60 * dir(), autoAlpha: 0, duration: 0.35, ease: "power2.in" })
      .to(el, { height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, borderWidth: 0, duration: 0.3, ease: "power2.inOut" });
  });
}

export function pulse(el) {
  if (!animate || !el) return;
  gsap.fromTo(el, { scale: 1.12 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)", clearProps: "transform" });
}

export function popIn(targets) {
  if (!animate) return;
  gsap.from(targets, { y: 20, scale: 0.9, autoAlpha: 0, stagger: 0.08, duration: 0.7, ease: "back.out(1.8)", clearProps: CLEAR });
}

// ── Add to cart: the product image flies into the header cart ────────────────

export function bumpCart() {
  if (!animate) return;
  const icon = document.querySelector('.action[href="cart.html"] .action-icon');
  const count = document.querySelector("[data-cart-count]");
  if (icon) gsap.fromTo(icon, { scale: 1 }, { scale: 1.3, rotation: -12 * dir(), duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", clearProps: "transform" });
  if (count) gsap.fromTo(count, { scale: 0.3 }, { scale: 1, duration: 0.7, ease: "elastic.out(1.2, 0.4)", clearProps: "transform" });
}

export function flyToCart(img) {
  const target = document.querySelector('.action[href="cart.html"] .action-icon');
  if (!animate || !img || !target) { bumpCart(); return; }
  const from = img.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.min(from.width, from.height, 140);

  const clone = img.cloneNode();
  clone.removeAttribute("loading");
  clone.className = "fly-image";
  Object.assign(clone.style, {
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
  });
  document.body.append(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  gsap.timeline({ onComplete: () => { clone.remove(); bumpCart(); } })
    .to(clone, { scale: 1.1, duration: 0.15, ease: "power2.out" })
    .to(clone, { x: dx, duration: 0.85, ease: "power1.inOut" }, 0.15)
    .to(clone, { y: dy, duration: 0.85, ease: "back.in(1.6)" }, 0.15)
    .to(clone, { scale: 0.12, rotation: 25 * dir(), duration: 0.85, ease: "power2.in" }, 0.15)
    .to(clone, { autoAlpha: 0, duration: 0.15 }, 0.88);
}

// ── Header bits ──────────────────────────────────────────────────────────────

export function spinIcon(el) {
  if (!animate || !el) return;
  gsap.fromTo(el, { rotation: -120, scale: 0.4, autoAlpha: 0 }, { rotation: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: "back.out(2)", clearProps: CLEAR });
}

export function openMenu(nav) {
  if (!animate) return;
  gsap.fromTo(nav, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "expo.out", clearProps: "clipPath" });
  gsap.fromTo(nav.querySelectorAll(".all-categories, .nav-links li, .nav-lang"), { x: -24 * dir(), autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.04, duration: 0.5, delay: 0.1, clearProps: CLEAR });
}

export function openDropdown(menu) {
  if (!animate) return;
  gsap.fromTo(menu, { y: -10, autoAlpha: 0, scale: 0.97, transformOrigin: "top" }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.35, ease: "power3.out", clearProps: CLEAR });
  gsap.fromTo(menu.querySelectorAll("a, .menu-group-title"), { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.02, duration: 0.3, delay: 0.05, clearProps: CLEAR });
}

/** Magnetic hover for primary buttons (desktop only). */
export function magnetic(root = document) {
  if (!animate || !finePointer) return;
  root.querySelectorAll(".btn-primary, .btn-secondary").forEach((btn) => {
    if (btn.dataset.magnetic) return;
    btn.dataset.magnetic = "1";
    const x = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
    const y = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      x((e.clientX - r.left - r.width / 2) * 0.25);
      y((e.clientY - r.top - r.height / 2) * 0.35);
    });
    btn.addEventListener("pointerleave", () => { x(0); y(0); });
  });
}

// ── Theme switch: circular reveal from the toggle (View Transitions API) ─────

export function themeTransition(button, apply) {
  if (!document.startViewTransition || reducedMotion) { apply(); return; }
  const r = button.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
  const transition = document.startViewTransition(apply);
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${cx}px ${cy}px)`, `circle(${radius}px at ${cx}px ${cy}px)`] },
      { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
    );
  });
}

// ── Leaving the page: fade content out before navigating ────────────────────

export function pageTransitions() {
  if (!animate) return;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.href === location.href || (url.pathname === location.pathname && url.hash)) return;
    e.preventDefault();
    lockScroll(true);
    gsap.to("#main, #site-bottom", { autoAlpha: 0, y: -12, duration: 0.28, ease: "power2.in", onComplete: () => (location.href = url.href) });
  });
  // Coming back with the browser's back button restores the page from cache
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      gsap.set("#main, #site-bottom", { clearProps: "all" });
      lockScroll(false);
    }
  });
}
