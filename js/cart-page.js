import { CONFIG } from "./config.js";
import { t, lang, categoryName, formatPrice, countLabel, SAUDI_CITIES } from "./i18n.js";
import { icon } from "./icons.js";
import { initLayout, esc, $ } from "./ui.js";
import { getCart, setQty, removeFromCart, clearCart, cartTotals } from "./cart.js";
import { cartIntro, collapse, pulse, magnetic } from "./motion.js";

initLayout("cart");

const main = document.getElementById("main");
const FORM_KEY = "bloom-checkout";
let sent = false;

// ── Saved form values (so customers don't retype their details) ──────────────

function savedForm() {
  try { return JSON.parse(localStorage.getItem(FORM_KEY)) || {}; } catch { return {}; }
}

function saveForm(values) {
  try { localStorage.setItem(FORM_KEY, JSON.stringify(values)); } catch {}
}

// ── Rendering ────────────────────────────────────────────────────────────────

function emptyView() {
  return `
    <section class="section container">
      <div class="state">
        <span class="state-icon">${icon("bag", 28)}</span>
        <p><strong class="h3">${t("cart.emptyTitle")}</strong><br>${t("cart.emptyBody")}</p>
        <a class="btn btn-primary" href="shop.html">${t("cart.continue")} ${icon("arrow", 18)}</a>
      </div>
    </section>`;
}

function sentView() {
  return `
    <section class="section container">
      <div class="state">
        <span class="state-icon is-success">${icon("check", 28)}</span>
        <p><strong class="h3">${t("cart.sentTitle")}</strong><br>${t("cart.sentBody")}</p>
        <div class="state-actions">
          <button class="btn btn-outline" type="button" data-clear-cart>${t("cart.clear")}</button>
          <a class="btn btn-primary" href="shop.html">${t("cart.keepShopping")}</a>
        </div>
      </div>
    </section>`;
}

function line(item) {
  return `
    <li class="cart-line" data-id="${item.id}">
      <a class="cart-thumb" href="product.html?id=${item.id}"><img src="${esc(item.thumbnail)}" alt="" width="88" height="88"></a>
      <div class="cart-line-info">
        <small class="text-muted">${categoryName(item.category)}</small>
        <a class="cart-line-title" href="product.html?id=${item.id}">${esc(item.title)}</a>
        <span class="text-secondary">${formatPrice(item.price)}</span>
      </div>
      <div class="stepper stepper-sm" role="group" aria-label="${t("product.quantity")}">
        <button type="button" data-step="-1" aria-label="${t("product.decrease")}" ${item.qty <= 1 ? "disabled" : ""}>${icon("minus", 14)}</button>
        <input type="number" min="1" max="${item.stock}" value="${item.qty}" data-qty aria-label="${t("product.quantity")}">
        <button type="button" data-step="1" aria-label="${t("product.increase")}" ${item.qty >= item.stock ? "disabled" : ""}>${icon("plus", 14)}</button>
      </div>
      <strong class="cart-line-total">${formatPrice(item.price * item.qty)}</strong>
      <button class="icon-btn cart-remove" type="button" data-remove aria-label="${t("cart.remove")}: ${esc(item.title)}">${icon("trash", 18)}</button>
    </li>`;
}

function summary(items) {
  const { subtotal, delivery, total } = cartTotals(items);
  const remaining = CONFIG.freeDeliveryThreshold - subtotal;
  const progress = Math.min(100, (subtotal / CONFIG.freeDeliveryThreshold) * 100);
  return `
    <h2 class="h4">${t("cart.summary")}</h2>
    <div class="delivery-progress">
      <p class="body-s">${remaining > 0 ? t("cart.freeHint", { amount: formatPrice(remaining) }) : `${icon("check", 16)} ${t("cart.freeReached")}`}</p>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><span style="inline-size:${progress}%"></span></div>
    </div>
    <dl class="totals">
      <div><dt>${t("cart.subtotal")}</dt><dd>${formatPrice(subtotal)}</dd></div>
      <div><dt>${t("cart.delivery")}</dt><dd>${delivery ? formatPrice(delivery) : t("cart.free")}</dd></div>
      <div class="totals-total"><dt>${t("cart.total")}</dt><dd>${formatPrice(total)}</dd></div>
    </dl>`;
}

function field(name, type, required, extra = "") {
  const v = savedForm()[name] || "";
  const id = `f-${name}`;
  const control = type === "textarea"
    ? `<textarea class="input" id="${id}" name="${name}" rows="3" placeholder="${t(`cart.${name}Ph`)}" ${required ? "required" : ""}>${esc(v)}</textarea>`
    : `<input class="input" id="${id}" name="${name}" type="${type}" value="${esc(v)}" placeholder="${t(`cart.${name}Ph`)}" ${required ? "required" : ""} ${extra}>`;
  return `
    <div class="field">
      <label class="field-label" for="${id}">${t(`cart.${name}`)}</label>
      ${control}
      <p class="field-error" id="${id}-error" hidden></p>
    </div>`;
}

function view(items) {
  const count = items.reduce((n, i) => n + i.qty, 0);
  return `
    <section class="container page-head">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">${t("nav.home")}</a> ${icon("chevron", 14)} <span aria-current="page">${t("cart.title")}</span></nav>
      <h1 class="h1">${t("cart.title")} <small class="text-muted body">${countLabel(count, "cart.item", "cart.items")}</small></h1>
    </section>
    <section class="container cart-layout">
      <ul class="cart-lines">${items.map(line).join("")}</ul>
      <aside class="cart-aside">
        <div class="panel" data-summary>${summary(items)}</div>
        <form class="panel checkout-form" novalidate data-checkout>
          <h2 class="h4">${t("cart.detailsTitle")}</h2>
          ${field("name", "text", true, 'autocomplete="name"')}
          ${field("phone", "tel", true, 'autocomplete="tel" inputmode="tel" dir="ltr"')}
          ${field("city", "text", true, 'list="cities" autocomplete="address-level2"')}
          <datalist id="cities">${SAUDI_CITIES[lang].map((c) => `<option value="${c}">`).join("")}</datalist>
          ${field("address", "textarea", true)}
          ${field("notes", "textarea", false)}
          <button class="btn btn-primary btn-block" type="submit">${icon("message", 18)} ${t("cart.send")}</button>
          <p class="form-hint">${t("cart.sendHint")}</p>
        </form>
      </aside>
    </section>`;
}

function render() {
  const items = getCart();
  if (sent) main.innerHTML = sentView();
  else if (!items.length) main.innerHTML = emptyView();
  else main.innerHTML = view(items);
  cartIntro();
  magnetic(main);
}

// Re-render only the parts that change, so the form keeps focus and values
function refreshLines() {
  const items = getCart();
  if (!items.length) return render();
  for (const item of items) {
    const el = main.querySelector(`.cart-line[data-id="${item.id}"]`);
    if (el) el.outerHTML = line(item);
  }
  main.querySelectorAll(".cart-line").forEach((el) => {
    if (!items.some((i) => String(i.id) === el.dataset.id)) el.remove();
  });
  const count = items.reduce((n, i) => n + i.qty, 0);
  $(".page-head small").textContent = countLabel(count, "cart.item", "cart.items");
  $("[data-summary]").innerHTML = summary(items);
  pulse($(".totals-total dd"));
}

// ── Checkout ─────────────────────────────────────────────────────────────────

function normalizePhone(raw) {
  const digits = raw.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (/^05\d{8}$/.test(digits)) return digits;
  if (/^9665\d{8}$/.test(digits)) return "0" + digits.slice(3);
  if (/^5\d{8}$/.test(digits)) return "0" + digits;
  return null;
}

function validate(form) {
  let firstInvalid = null;
  for (const el of form.querySelectorAll("input, textarea")) {
    const error = form.querySelector(`#${el.id}-error`);
    let message = "";
    if (el.required && !el.value.trim()) message = t("cart.required");
    else if (el.name === "phone" && !normalizePhone(el.value)) message = t("cart.phoneInvalid");
    el.toggleAttribute("aria-invalid", !!message);
    if (message) el.setAttribute("aria-describedby", error.id);
    else el.removeAttribute("aria-describedby");
    error.textContent = message;
    error.hidden = !message;
    if (message && !firstInvalid) firstInvalid = el;
  }
  firstInvalid?.focus();
  return !firstInvalid;
}

function orderMessage(items, c) {
  const { subtotal, delivery, total } = cartTotals(items);
  const lines = items.map((i, n) => `${n + 1}. ${i.title} × ${i.qty} = ${formatPrice(i.price * i.qty)}`);
  return [
    t("msg.greeting"),
    "",
    ...lines,
    "",
    `${t("msg.subtotal")}: ${formatPrice(subtotal)}`,
    `${t("msg.delivery")}: ${delivery ? formatPrice(delivery) : t("cart.free")}`,
    `*${t("msg.total")}: ${formatPrice(total)}*`,
    "",
    `*${t("msg.customer")}*`,
    `${t("msg.name")}: ${c.name}`,
    `${t("msg.phone")}: ${c.phone}`,
    `${t("msg.city")}: ${c.city}`,
    `${t("msg.address")}: ${c.address}`,
    ...(c.notes ? [`${t("msg.notes")}: ${c.notes}`] : []),
  ].join("\n");
}

// ── Events ───────────────────────────────────────────────────────────────────

main.addEventListener("click", (e) => {
  const lineEl = e.target.closest(".cart-line");
  const id = lineEl ? Number(lineEl.dataset.id) : null;

  const step = e.target.closest("[data-step]");
  if (step && id) {
    const item = getCart().find((i) => i.id === id);
    if (item) setQty(id, item.qty + Number(step.dataset.step));
  }

  if (e.target.closest("[data-remove]") && id) collapse(lineEl).then(() => removeFromCart(id));

  if (e.target.closest("[data-clear-cart]")) {
    clearCart();
    sent = false;
    render();
  }
});

main.addEventListener("change", (e) => {
  if (e.target.matches("[data-qty]")) {
    const id = Number(e.target.closest(".cart-line").dataset.id);
    setQty(id, Number(e.target.value) || 1);
  }
});

main.addEventListener("input", (e) => {
  const form = e.target.closest("[data-checkout]");
  if (form) saveForm(Object.fromEntries(new FormData(form)));
});

main.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-checkout]");
  if (!form) return;
  e.preventDefault();
  if (!validate(form)) return;
  const data = Object.fromEntries(new FormData(form));
  const customer = {
    name: data.name.trim(),
    phone: normalizePhone(data.phone),
    city: data.city.trim(),
    address: data.address.trim(),
    notes: data.notes.trim(),
  };
  saveForm(data);
  const text = orderMessage(getCart(), customer);
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  sent = true;
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("cart:change", () => {
  if (!sent && main.querySelector(".cart-lines")) refreshLines();
});
window.addEventListener("storage", (e) => {
  if (e.key === "bloom-cart") render();
});

render();
