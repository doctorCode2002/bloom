# Bloom — Product Requirements Document

**Version:** 1.7
**Date:** 2026-10-04
**Stack:** Vanilla HTML, CSS, JavaScript (no frameworks, no backend)

---

## 1. Overview

Bloom is a bilingual (English + Arabic) online store selling **beauty & skincare** and **women's fashion** products to customers in **Saudi Arabia**. Customers browse products, add them to a cart, and place orders through **WhatsApp**. There is no online payment in v1.

## 2. Target Audience

- **Primary:** Young women aged 18–35
- Mobile-first shoppers, trend-driven, active on social media
- Comfortable ordering via WhatsApp

## 3. Market

- **Country:** Saudi Arabia
- **Currency:** SAR (Saudi Riyal)
- **Languages:** English (LTR) and Arabic (RTL), switchable

## 4. Scope — v1 Pages

| Page | Purpose |
|------|---------|
| **Home** | Hero, featured categories, featured / new products |
| **Shop** | All products with search, filters and sorting |
| **Product details** | Images, name, price, description, add to cart |
| **Cart** | Edit items/quantities, customer details form, send order via WhatsApp |

Out of scope for v1: About, Contact, FAQ, wishlist, accounts, online payments.

## 5. Features

### 5.1 Product catalog
- **Demo data:** [DummyJSON](https://dummyjson.com) (free, no key, allows cross-origin requests). 10 categories, 46 products:
  - Beauty: skin-care, beauty (makeup), fragrances
  - Fashion: womens-dresses, tops, womens-bags, womens-shoes, womens-jewellery, womens-watches, sunglasses
- The whole catalog is loaded once per browser session (cached in `sessionStorage`), and search, filters and sorting run in the browser.
- API prices are in USD and converted to SAR at 3.75, rounded to whole riyals. The old price is worked out from the API's discount percentage.
- Product names and descriptions come from the API in English only. Category names and all interface text are translated.
- Prices shown in SAR.

### 5.2 Search & filters
- Search products by name
- Filter by category and price range
- Sort by price (low/high) and newest

### 5.3 Cart
- Add / remove items, change quantities
- Cart persisted in `localStorage` so it survives page reloads
- Cart item count shown in the header
- **Delivery:** free on orders of SAR 200 or more, otherwise SAR 25 (demo values in `js/config.js`). The cart shows progress toward free delivery.

### 5.4 WhatsApp checkout
The customer fills in a form on the cart page:
- Full name
- Phone number
- City
- Address

Clicking **"Order via WhatsApp"** opens WhatsApp with a pre-filled message containing:
- Each item: name, quantity, unit price, line total
- Order total (SAR)
- Customer name, phone, city, address

The message is written in the customer's currently selected language.

### 5.5 Bilingual support
- Language switcher in the header (EN / ع)
- Switches text and layout direction (`dir="ltr"` / `dir="rtl"`)
- Selected language saved in `localStorage`

### 5.6 Light & dark theme
- Theme toggle in the header (sun / moon icon)
- On first visit, follows the device setting (`prefers-color-scheme`)
- The customer's choice is saved in `localStorage` and overrides the device setting
- Theme is applied before the page renders, so the wrong theme never flashes on screen
- Works with both languages and with LTR and RTL layouts

### 5.7 Animations (GSAP)
- GSAP 3.15 with ScrollTrigger and SplitText, loaded from jsDelivr. All animation code is in `js/motion.js`.
- **No flash of unstyled content:** the page stays hidden until the web fonts are ready (at most 1.5s), then one timeline reveals it. Content added later gets its starting animation state before the browser draws it. A 3-second safety timer shows the page even if the scripts fail.
- **Intro:** the announcement bar, header and navigation slide in on the first page of a visit. Later pages only fade in.
- **Home hero:** a timeline where the card unmasks, the headline rises word by word, then the copy, buttons and trust points stagger in. The image reveals in a circle, the sale tag pops in and the mini product card slides in. After that they float gently, follow the pointer on desktop, and drift at different speeds while scrolling.
- **Smooth scrolling:** Lenis 1.3, driven by GSAP's clock so ScrollTrigger stays in sync. Scrollable panels (mobile menu, filters, category dropdown) keep normal scrolling, and the page stops scrolling while they're open.
- **Scrolling (scrubbed, `scrub: true`):** section animations follow the scroll position and play backwards when scrolling up. Headings rise word by word. Category chips, product cards, promo banners (alternating sides, with spinning and drifting images), reviews, the newsletter (unmasks), features and the footer animate in. The end points use `clamp()`, so sections near the bottom of the page still finish.
- **Content visible on load** (hero, top of the shop and product pages, cart, shop cards already on screen) uses time-based entrances, because a scrubbed animation there would already be finished.
- **Interactions:** the product image flies into the cart icon when added, and the cart icon bounces and its count pops. The theme switch spreads from the toggle in a circle (View Transitions API). Primary buttons follow the pointer slightly on desktop. Product gallery images crossfade, removed cart lines collapse, the cart total pulses, and menus and the filters panel stagger open. Content fades out before moving to another page.
- **Reduced motion:** everything is switched off when the device asks for reduced motion.

## 6. Design

- Visual style is inspired by a client reference (a clean marketplace layout: deep green, cream backgrounds, serif headlines, pastel category circles, coral sale badges), adapted for a beauty & fashion audience.
- The design system is generated in Figma with the **Scripter** plugin from `design-system/bloom-design-system.ts`. It creates color variables (Light + Dark modes), spacing and radius variables, EN/AR text styles, shadow styles, components and theme previews.
- Must be fully responsive and designed **mobile-first**.
- Must work correctly in both LTR and RTL.
- Must have a **light and a dark theme**. All colors are defined as CSS variables, with one set for each theme.
- Product images, text and form fields must stay readable and have enough contrast in both themes.

### 6.1 Color palette — "Sage & Blush"

| Token | Light | Dark |
|-------|-------|------|
| bg/canvas | `#FAF7F2` | `#0F1512` |
| bg/surface | `#FFFFFF` | `#18211C` |
| bg/muted | `#F3EEE6` | `#1F2A24` |
| bg/brand-deep (footer, banners) | `#1F3D2B` | `#123527` |
| text/primary | `#1C1C1A` | `#EDEAE4` |
| text/secondary | `#5E5E58` | `#B5B2AA` |
| text/muted | `#9A9A94` | `#7E8580` |
| brand/primary | `#1F3D2B` | `#8FC4A3` |
| brand/primary-hover | `#2F5A41` | `#A8D5B8` |
| accent/blush | `#E8A8A0` | `#F0B9B1` |
| accent/blush-subtle | `#F6DCD7` | `#3A2826` |
| sale/badge | `#E5534B` | `#E5534B` |
| sale/price | `#C73E37` | `#FF8A82` |
| sale/old-price | `#9A9A94` | `#7E8580` |
| border/default | `#E7E1D7` | `#2C3A32` |
| rating/star | `#F2B33D` | `#F2C46D` |

Category tints (blush, sage, sand, sky, lilac) and feedback colors (success, warning, error) are also defined. The full list is in the script. In CSS each token becomes `var(--color-<group>-<name>)`.

- **Dark theme:** "tinted dark": very dark green-tinted surfaces with lighter versions of the brand colors.
- **Sales:** coral red badges and sale prices; the old price is gray with a strikethrough.

### 6.2 Typography

| Use | English | Arabic |
|-----|---------|--------|
| Headings | Playfair Display SemiBold | IBM Plex Sans Arabic SemiBold |
| Body | Inter Regular / Medium / SemiBold | IBM Plex Sans Arabic Regular / Medium |

Scale (EN size / line height): Display 56/64, H1 40/48, H2 32/40, H3 24/32, H4 20/28, Body L 18/28, Body 16/24, Body S 14/20, Label 14/20, Caption 12/16, Overline 12/16, Badge 12/16, Button 15/20, Button S 13/16, Price 18/24. Arabic sizes are slightly smaller and have taller line heights.

### 6.3 Spacing, radius, shadows

- **Spacing (4px scale):** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
- **Radius:** sm 6, md 10, lg 16, xl 24, full 999
- **Shadows:** sm (cards), md (dropdowns, hover), lg (modals, drawers), tinted with the brand green

### 6.4 Components (v1)

Button (Primary / Secondary / Outline / Ghost × Medium / Small), Badge (Sale / New / Soft), Icon Button (Primary / Soft / Surface × Cart / Heart), Input (Default / Focus), Category Chip (5 tints), Product Card.

### 6.5 Home page layout

Designed in Figma by `design-system/bloom-home.ts` (run after the design system script). Desktop (1440) and mobile (390), each in light and dark. Sections from top to bottom:

1. **Announcement bar:** free delivery over SAR 200, easy returns, order on WhatsApp
2. **Header:** logo, search, language switch (العربية), theme toggle, cart with item count. Mobile: menu, logo, theme, cart, with search on its own row.
3. **Navigation** (desktop only): "All Categories" button and links: Home, Shop, Skincare, Makeup, Fashion, New Arrivals, Offers
4. **Hero:** "Bloom Into Your Best Self", Shop Now / Explore Skincare buttons, trust points, hero image with a "Summer Sale 40%" tag, carousel dots
5. **Categories:** round category chips plus "View All" (scrolls sideways on mobile)
6. **Top Picks For You:** product cards with sale badges (scrolls sideways on mobile)
7. **Promo banners:** New Arrivals, Self-Care, Accessories
8. **Loved By Thousands:** average rating and customer reviews
9. **Newsletter:** "Stay in the Loop" email signup
10. **Features strip:** free delivery, easy returns, order on WhatsApp, support hours
11. **Footer:** brand, social links, Shop / Categories / Help links, WhatsApp contact, language and currency

## 7. Technical Requirements

- Pure HTML, CSS, JS. No build step required.
- Must run as a static site on **GitHub Pages**.
- Product data fetched client-side from the API (the API must allow CORS).
- Basic SEO: page titles, meta descriptions, semantic HTML.
- Accessibility: alt text, keyboard navigation, sufficient contrast.

### 7.1 Code structure

| Path | Purpose |
|------|---------|
| `index.html`, `shop.html`, `product.html`, `cart.html` | Page shells. An inline script in `<head>` applies the saved theme and language before the page appears. |
| `css/tokens.css` | Design tokens from the Figma design system (light + dark) |
| `css/styles.css` | All styles. Mobile-first, with logical properties so the layout mirrors for Arabic. |
| `js/config.js` | Store settings: WhatsApp number, API, currency rate, delivery, categories |
| `js/i18n.js` | English/Arabic strings, price formatting |
| `js/api.js` | Fetches and caches the DummyJSON catalog |
| `js/cart.js` | Cart in `localStorage` |
| `js/ui.js`, `js/icons.js` | Shared header, navigation, footer, product card, toasts, icons |
| `js/home.js`, `js/shop.js`, `js/product.js`, `js/cart-page.js` | Page logic |

Run locally with `python3 -m http.server` from the project folder. The pages use ES modules, so opening them as files directly doesn't work.

## 8. Open Items (waiting on client)

- [x] **Product API:** using DummyJSON for the demo (5.1)
- [x] **Design reference image** (received; design system created)
- [x] **WhatsApp business number:** +972 59 260 7179 (`whatsappNumber` in `js/config.js`)
- [ ] Logo (or should one be created?)
- [ ] Delivery fees / shipping rules (demo: free from SAR 200, otherwise SAR 25)

## 9. Future Ideas (post-v1)

- About, Contact, FAQ pages
- Wishlist
- Product variants (size / color / shade)
- Discount codes
- Online payments (e.g. Stripe, Moyasar, Tap)

---

## Changelog

- **1.7 (2026-10-04):** Added Lenis smooth scrolling. Section animations are now scrubbed to the scroll position (5.7).
- **1.6 (2026-10-04):** Added GSAP animations (5.7).
- **1.5 (2026-10-04):** WhatsApp order number set to +972 59 260 7179.
- **1.4 (2026-10-04):** Built v1 in vanilla HTML/CSS/JS: Home, Shop, Product and Cart pages with WhatsApp checkout, EN/AR and light/dark. Product data from DummyJSON (5.1). Added delivery rule (5.3) and code structure (7.1). The wishlist heart was left off product cards, because the wishlist isn't in v1.
- **1.3 (2026-10-04):** Added the home page layout (6.5) and its Figma script.
- **1.2 (2026-10-04):** Added the design system (6.1–6.4): Sage & Blush palette, coral sale color, tinted dark theme, Playfair + Inter + IBM Plex Sans Arabic, and a Figma Scripter script.
- **1.1 (2026-10-04):** Added light & dark theme (5.6, section 6).
- **1.0 (2026-10-04):** First draft from the PRD interview.
