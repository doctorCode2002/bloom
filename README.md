# Bloom 🌸

A bilingual (English / Arabic) beauty and fashion **demo store** for young women in Saudi Arabia. Customers browse products, fill a cart and send their order on **WhatsApp**. It's built with plain HTML, CSS and JavaScript, animated with **GSAP** and **Lenis**, and designed first in **Figma** with the **Scripter** plugin.

**Live site:** https://doctorcode2002.github.io/bloom/
**Repository:** https://github.com/doctorCode2002/bloom

> This is a demo project. Product data comes from the free [DummyJSON](https://dummyjson.com) API, and no real payments are taken.

---

## Contents

1. [Features](#features)
2. [Run it locally](#run-it-locally)
3. [Configuration](#configuration)
4. [Project structure](#project-structure)
5. [How it was built, step by step](#how-it-was-built-step-by-step)
   - [Step 1: Name](#step-1-name)
   - [Step 2: Project folder](#step-2-project-folder)
   - [Step 3: PRD interview](#step-3-prd-interview)
   - [Step 4: Light and dark theme](#step-4-light-and-dark-theme)
   - [Step 5: Design system in Figma with Scripter](#step-5-design-system-in-figma-with-scripter)
   - [Step 6: Home page in Figma](#step-6-home-page-in-figma)
   - [Step 7: Reading the Figma screens back](#step-7-reading-the-figma-screens-back)
   - [Step 8: Choosing a product API](#step-8-choosing-a-product-api)
   - [Step 9: Turning the design into code](#step-9-turning-the-design-into-code)
   - [Step 10: Testing in a real browser](#step-10-testing-in-a-real-browser)
   - [Step 11: WhatsApp number](#step-11-whatsapp-number)
   - [Step 12: GSAP animations](#step-12-gsap-animations)
   - [Step 13: Lenis smooth scroll and scrubbed animations](#step-13-lenis-smooth-scroll-and-scrubbed-animations)
   - [Step 14: Page transitions](#step-14-page-transitions)
   - [Step 15: Publishing to GitHub Pages](#step-15-publishing-to-github-pages)
6. [Figma Scripter scripts reference](#figma-scripter-scripts-reference)
7. [Design system reference](#design-system-reference)
8. [Known limitations](#known-limitations)
9. [Credits](#credits)

---

## Features

- **4 pages:** Home, Shop, Product details, Cart.
- **English and Arabic:** a language switch in the header. Arabic flips the whole layout to right-to-left.
- **Light and dark theme:** the site starts with the device's setting and remembers the shopper's choice. It never flashes the wrong theme on load.
- **Shop:** search, category filters (grouped as Beauty and Fashion), a price range and 6 sort options. The filters are stored in the URL, so links like `shop.html?category=skin-care` work.
- **Product page:** image gallery, stock status, quantity picker, Add to cart and Buy now, details, reviews and related products.
- **Cart:** kept in the browser (`localStorage`). Change quantities, remove items, and see progress toward free delivery.
- **WhatsApp checkout:** the customer enters name, phone, city and address, and WhatsApp opens with the full order already written in her language.
- **Animations:** GSAP timelines, scroll-scrubbed reveals, Lenis smooth scrolling, a curtain page transition, the product image flying into the cart, and a circular theme switch. Everything is turned off for people who prefer reduced motion.
- **Mobile first:** works from 360px phones to large desktops.

---

## Run it locally

The pages load their JavaScript as ES modules, so they need to be served over HTTP. Opening the files directly (`file://`) doesn't work.

```bash
cd bloom
python3 -m http.server 8765
```

Then open http://localhost:8765.

There are no build steps and no npm packages. GSAP, Lenis and the fonts load from CDNs.

To stop a server running in the background:

```bash
pkill -f "http.server 8765"
```

---

## Configuration

Store settings are in `js/config.js`:

| Setting | Value | Meaning |
|---|---|---|
| `whatsappNumber` | `972592607179` | Number that receives orders, in international format without `+` |
| `apiBase` | `https://dummyjson.com` | Product API |
| `usdToSar` | `3.75` | DummyJSON prices are in USD and converted to SAR |
| `freeDeliveryThreshold` | `200` | Orders of SAR 200 or more get free delivery |
| `deliveryFee` | `25` | Delivery fee in SAR below the threshold |
| `CATEGORIES` | 10 categories | Which DummyJSON categories the store shows, their group (beauty / fashion) and their tint color |

All interface text, in both languages, is in `js/i18n.js`.

---

## Project structure

```
bloom/
├── index.html              Home
├── shop.html               Shop with search, filters and sorting
├── product.html            Product details (?id=…)
├── cart.html               Cart and WhatsApp checkout
├── css/
│   ├── tokens.css          Design tokens from Figma (colors, spacing, radius, shadows, fonts) for light and dark
│   └── styles.css          All styles: mobile-first, logical properties for right-to-left
├── js/
│   ├── config.js           Store settings and categories
│   ├── i18n.js             English and Arabic strings, price formatting, Saudi cities
│   ├── api.js              Loads and caches the DummyJSON catalog and converts prices to SAR
│   ├── cart.js             Cart in localStorage and totals
│   ├── ui.js               Shared header, navigation, footer, product card, toasts
│   ├── icons.js            Inline SVG icons (Lucide)
│   ├── motion.js           All GSAP / Lenis animation code and page transitions
│   ├── home.js             Home page
│   ├── shop.js             Shop page
│   ├── product.js          Product page
│   └── cart-page.js        Cart page and WhatsApp order message
├── assets/favicon.svg
├── design-system/          Figma Scripter scripts (see below)
│   ├── bloom-design-system.ts
│   ├── bloom-home.ts
│   └── bloom-read-screens.ts
├── PRD.md                  Product Requirements Document (kept up to date throughout)
├── CLAUDE.md               Project rule: always update the PRD
├── .nojekyll               Tells GitHub Pages to serve the files as they are
└── README.md
```

---

## How it was built, step by step

### Step 1: Name

We started with the name. The brief was **an English name of 4 or 5 letters**.

- First round: **Crate**, **Nook**, **Stash**
- Second round: **Haven**, **Bloom**, **Swift**, **Vault**, **Mart**

We picked **Bloom**, which suits beauty and fashion and suggests growth and freshness.

### Step 2: Project folder

The empty working folder was renamed from `newfolder` to `bloom`. We agreed to use **plain HTML, CSS and JavaScript** with no frameworks.

### Step 3: PRD interview

We wrote the requirements through a **PRD interview** in multiple-choice form: three answers per question, with one marked as recommended. (A custom "prd interview" skill was mentioned, but it wasn't installed on this machine, so the interview was run by hand.)

The decisions were:

| Topic | Decision |
|---|---|
| Products | Beauty and skincare, plus women's fashion |
| Audience | Young women aged 18–35 |
| Checkout | **Order via WhatsApp** (no backend needed) |
| Language | **English and Arabic** |
| Pages (v1) | Home, Shop, Product details, Cart |
| Product data | An API (chosen later in Step 8) |
| Visual style | From a reference image (Step 5) |
| Market | **Saudi Arabia, SAR** |
| Categories | Follow the API's structure |
| v1 features | Search and filters |
| WhatsApp message | Items, quantities, total and customer details (name, phone, city, address) |
| Hosting | **GitHub Pages** |

The answers became **`PRD.md`**. From then on the PRD was updated after every decision, with a version number and a changelog (version 1.0 to 1.9). That rule is saved in `CLAUDE.md`, so it carries over to future sessions.

### Step 4: Light and dark theme

We added a light and a dark theme to the requirements:

- a sun/moon toggle in the header
- the device's setting (`prefers-color-scheme`) on the first visit
- the shopper's choice saved in `localStorage`
- the theme applied before the first paint, so it never flashes

### Step 5: Design system in Figma with Scripter

The visual direction came from an **inspiration image** of a marketplace home page. It had a deep green and cream palette, serif headlines, pastel category circles, coral sale badges, a product carousel, promo banners, reviews, a newsletter block and a dark green footer.

Before writing any code, we asked about the colors (again as multiple choice):

| Question | Choice |
|---|---|
| Palette | **Sage & Blush**: the inspiration's deep green softened with a blush-pink accent |
| Sale color | **Coral red** `#E5534B` |
| Dark theme | **Tinted dark**: very dark green-tinted surfaces with lighter brand colors |
| Fonts | **Playfair Display** + **Inter** for English, **IBM Plex Sans Arabic** for Arabic |

Then we generated the whole design system in Figma with code, using the **[Scripter](https://www.figma.com/community/plugin/757836922707087381/scripter)** plugin. It runs TypeScript against Figma's plugin API. The script is **`design-system/bloom-design-system.ts`**.

**How to run it:**

1. Open a Figma file and run **Plugins → Scripter**.
2. Paste the entire contents of `bloom-design-system.ts`.
3. Press **Run**.

**What it creates:**

- **Color variables:** a `Bloom / Color` collection with **Light and Dark modes** and 30 colors (backgrounds, text, borders, brand, accent, sale, feedback, rating, 5 category tints). Each variable also carries its CSS name, e.g. `var(--color-brand-primary)`, which carries straight over to `css/tokens.css`.
- **Number variables:** a `Bloom / Tokens` collection with spacing on a 4px scale (`space/1` … `space/20`) and radii (`radius/sm, md, lg, xl, full`).
- **30 text styles:** 15 for English (`Bloom/EN/…`) and 15 for Arabic (`Bloom/AR/…`): Display, H1–H4, Body L/Body/Body S, Label, Caption, Overline, Badge, Button, Button S, Price.
- **3 effect styles:** `Bloom/Shadow/sm, md, lg`, tinted with the brand green.
- **Components**, built with auto layout and linked to the variables:
  - Button: Primary, Secondary, Outline, Ghost, each in Medium and Small
  - Badge: Sale, New, Soft
  - Icon Button: Primary, Soft, Surface, each with a Cart or Heart icon
  - Input: Default, Focus
  - Category Chip: 5 tints
  - Product Card
- **A documentation page** called "Bloom — Design System": color swatches showing light and dark side by side, English and Arabic typography samples, the spacing, radius and shadow scales, all components, and a full preview in light and dark.

**Details:**

- Running it again only replaces what it created before (anything named `Bloom / …`, `Bloom/…`, and its page).
- If a font is missing it falls back to Inter and prints a warning.
- If your Figma plan doesn't allow a second variable mode, the dark values still appear on the swatches and the dark preview is skipped.

**A bug we hit:** the first run failed with `unexpected token in expression: ';'`, and Scripter pointed at an unrelated line (the heart icon). The real cause was the `||=` operator. Scripter's bundled TypeScript is older and doesn't recognise it, so it produced broken JavaScript. We replaced it with a plain `if`, and gave every `catch` block a named error (`catch (e)`). **Avoid newer syntax in Scripter scripts:** `||=`, `??=` and `catch {}`.

### Step 6: Home page in Figma

Next, **`design-system/bloom-home.ts`** builds the home page in Figma. It reuses the variables, text styles, effect styles and components from Step 5 by looking them up by name, so **run the design system script first**.

It creates a page called **"Bloom — Home"** with four frames:

- Home — Desktop (1440) — Light
- Home — Desktop — Dark
- Home — Mobile (390) — Light
- Home — Mobile — Dark

The dark frames are copies of the light ones, switched to the Dark mode of the color variables.

The sections follow the inspiration, changed to suit Bloom:

1. Announcement bar (free delivery over SAR 200 · easy returns · order on WhatsApp)
2. Header (logo, search, العربية language switch, dark-mode toggle, cart with a count)
3. Navigation (an "All Categories" button and links; on mobile these go into a menu)
4. Hero ("Bloom Into Your Best Self", two buttons, trust points, image with a "Summer Sale 40%" tag, carousel dots)
5. Category chips and "View All"
6. Top Picks For You (product cards with sale badges)
7. Three promo banners
8. Loved By Thousands (rating and reviews)
9. Newsletter
10. Features strip
11. Footer

We left out the inspiration's wishlist and account icons, because neither feature is in v1.

### Step 7: Reading the Figma screens back

After you edited the design in Figma, **`design-system/bloom-read-screens.ts`** turns the screens into a compact text outline. It's a way to send the design back to the code side without screenshots. For every layer it records:

- type and name, size, auto-layout settings, whether it fills or hugs
- color variables used for fills and strokes, and the radius variable
- text content, text style and alignment
- shadow style, opacity, clipping, hidden layers
- for component instances: the component and variant they come from, plus their text

Icons are shortened to one line each. The outline is printed in Scripter's output panel **and** written to a text layer on a page called **"Bloom — Export"**, so it's easy to copy. Settings at the top:

- `PAGES`: which pages to read (add `'Bloom — Design System'` if you changed components)
- `INCLUDE_DARK`: whether to read the dark frames, which are skipped by default because they're copies

Comparing the outline with the generated design showed that the frames matched what the script built. The only differences were five "landing page" label layers and that the dark frames weren't present. It also showed two small design problems, which we fixed in the code:

- the Outline button was 3px taller than the others
- the review cards had different heights

### Step 8: Choosing a product API

For a demo we needed a free product API that browsers are allowed to call directly. We compared FakeStoreAPI, Platzi Fake Store, Dummy Products and **DummyJSON**, and chose **DummyJSON** because:

- It's the only one with categories that suit Bloom: `skin-care`, `beauty` (makeup), `fragrances`, `womens-dresses`, `tops`, `womens-bags`, `womens-shoes`, `womens-jewellery`, `womens-watches` and `sunglasses`. That's **46 products** in total.
- It allows cross-origin requests, so it works on GitHub Pages.
- It needs no API key.
- Product images are WebP files with **transparent backgrounds**, so they look good on tinted panels in both themes.

DummyJSON's search endpoint returned nothing in testing, and the catalog is small. So the site **loads all 10 categories once** (cached in `sessionStorage`), and **search, filtering and sorting happen in the browser**. Prices are converted from USD to SAR (×3.75, rounded), and the old price is worked out from the API's discount percentage.

### Step 9: Turning the design into code

We built the site with the same tokens as Figma:

- **`css/tokens.css`** holds every Figma variable as a CSS custom property, for light (`:root`) and dark (`[data-theme="dark"]`). Arabic switches the font variables to IBM Plex Sans Arabic.
- **`css/styles.css`** is mobile-first and uses **logical properties** (`inline-start` and `inline-end` instead of left and right), so the layout mirrors correctly for Arabic.
- Each HTML page is a small shell. A **script in `<head>`** applies the saved theme and language before anything is drawn. JavaScript then renders the header, footer and page content.
- **`js/i18n.js`** has every string in English and Arabic. The Arabic copy addresses the reader in the feminine form, to suit the audience.
- **WhatsApp checkout** (`js/cart-page.js`): the form checks for required fields and a valid Saudi phone number (`05XXXXXXXX`, or `+9665…` / `9665…`). It builds a numbered order message with subtotal, delivery, total and customer details, and opens `https://wa.me/<number>?text=…`. The form remembers what was typed, and after sending a "Almost done!" screen offers to clear the cart.
- **Delivery rule:** free from SAR 200, otherwise SAR 25, with a progress bar in the cart.
- The **wishlist heart** from the Figma product card was left off, because the wishlist isn't in v1.
- **Accessibility:** a skip link, visible focus styles, labels and `aria-*` on controls, live regions for result counts and toasts, alt text, and keyboard support (Escape closes menus).

### Step 10: Testing in a real browser

Every page was checked in **headless Chromium**: first with screenshots, then with a small Chrome DevTools Protocol script that waits in real time, collects console errors, scrolls, and clicks things. These bugs were found and fixed:

| Bug | Fix |
|---|---|
| Footer logo, text and social icons sat side by side | The header's `grid-area: logo` rule also matched the footer logo, so it was limited to the header only |
| Newsletter text ran past its box on mobile | The email field widened the grid column, so the column is now `minmax(0, 1fr)` |
| Discount badges read `11%-` in Arabic | The badges are forced left-to-right with `dir="ltr"` |
| Outline button 3px taller than the others | All buttons now have a 1.5px border (transparent on filled buttons) |
| Review cards had uneven heights | They're laid out in a grid, which stretches them to the same height |
| Hero text invisible after the GSAP intro | A scroll-fade read its starting opacity while the page was still hidden; it now uses `fromTo` with explicit `opacity` |
| Page could scroll sideways on phones | Elements waiting to slide in from the side widened the page; `#main` and the footer now use `overflow-x: clip` |
| Mobile menu opened at the wrong height | The drawer now measures the header when it opens |

### Step 11: WhatsApp number

The order number was set to **+972 59 260 7179**. It appears in `js/config.js` (`whatsappNumber: "972592607179"`) and on the footer's WhatsApp button.

### Step 12: GSAP animations

We added **GSAP 3.15** with **ScrollTrigger** and **SplitText** from jsDelivr. All animation code is in **`js/motion.js`**.

**No flash of unstyled content:**

- The `<head>` script adds `is-loading` to `<html>`, which hides the header, content and footer.
- `revealPage()` waits for the web fonts (at most 1.5s), removes the class and starts the intro in the same frame. A small spinner appears if loading takes longer than 0.5s.
- Content rendered later gets its starting animation state in the same step it's added, before the browser draws it.
- A **3-second safety timer** shows the page even if the scripts fail.

**Animations:**

- **Intro:** on the first page of a visit, the announcement bar, header items and navigation slide in.
- **Hero timeline:**
  - the card unmasks, and the headline rises **word by word** out of a line mask (SplitText splits by words, which keeps Arabic letters joined)
  - the body text un-blurs, and the buttons and trust points stagger in
  - the image reveals in a circle, the sale tag pops in and the mini product card slides in
  - after that they float gently, follow the mouse on desktop, and drift at different speeds while scrolling
- **Add to cart:** the product image flies along an arc into the header cart, and the cart icon bounces while its count pops.
- **Theme switch:** the new theme spreads out in a **circle from the toggle** (View Transitions API).
- **Buttons:** primary buttons follow the mouse slightly on desktop.
- **Smaller touches:** gallery images crossfade, removed cart lines slide out and collapse, the cart total pulses, and the menu, dropdown and filters panel stagger open.
- **Reduced motion:** everything is turned off when the device asks for reduced motion.

### Step 13: Lenis smooth scroll and scrubbed animations

We added **Lenis 1.3.26** for smooth scrolling:

- It runs on GSAP's ticker (`lenis.raf` inside `gsap.ticker`), and every Lenis scroll updates ScrollTrigger.
- Scrollable panels (mobile menu, filters, category dropdown) have `data-lenis-prevent`, so they keep normal scrolling.
- The page stops scrolling while those panels are open, and while leaving for another page.

All **section animations are now scrubbed** (`scrub: true`): they follow the scroll position and reverse when you scroll back up.

- headings rise word by word
- category chips pop up in sequence
- the product carousel rises and its cards slide in with a tilt
- promo banners come from alternating sides, with images that spin in and drift
- review cards and avatars rise and spin in
- the newsletter unmasks
- features and footer columns stagger in

The end points use `clamp()`, so sections near the bottom of the page still finish. **Content already on screen when a page loads** (the hero, the top of the shop and product pages, the cart, shop cards in view) keeps its time-based entrance, because a scrubbed animation there would already be finished. Product cards no longer lift on hover (their shadow deepens instead), so CSS doesn't fight GSAP over the same transform.

### Step 14: Page transitions

Clicking a link to another page plays a **curtain transition**:

1. **Leaving:** a blush layer, then a deep-green layer, sweep up from the bottom with a curved top edge, and the Bloom logo rises into the middle.
2. **Arriving:** the next page starts **covered by the curtain**. The curtain is part of each page's HTML, and the `<head>` script shows it before the first paint if a `sessionStorage` flag says we arrived through a transition. The curtain then lifts away and the content rises in.

Pages restored with the browser's back button are reset. New-tab clicks, external links and links to a spot on the same page are left alone.

### Step 15: Publishing to GitHub Pages

1. The project became a git repository (branch `main`), with `.gitignore` and **`.nojekyll`**.
2. We logged in with `gh auth login`.
3. We created the public repository and pushed:

   ```bash
   gh repo create bloom --public --source . --remote origin --push
   ```

4. We turned on GitHub Pages from the `main` branch root:

   ```bash
   gh api -X POST repos/doctorCode2002/bloom/pages -f "source[branch]=main" -f "source[path]=/"
   ```

5. We ran `gh auth setup-git`, so `git push` uses the GitHub CLI login.
6. We checked the live site in headless Chrome: products load, animations run, and there are no console errors.

**Every push to `main` republishes the site** within a minute or two.

---

## Figma Scripter scripts reference

| Script | Run order | Creates | Safe to re-run |
|---|---|---|---|
| `design-system/bloom-design-system.ts` | 1st | Variables (Color: Light/Dark, Tokens), 30 text styles, 3 shadow styles, 6 components, the "Bloom — Design System" page | Yes: replaces only its own items |
| `design-system/bloom-home.ts` | 2nd | The "Bloom — Home" page: desktop and mobile, light and dark | Yes: replaces only that page |
| `design-system/bloom-read-screens.ts` | Any time | A text outline of the screens, in Scripter's output and on a "Bloom — Export" page | Yes: rewrites the export page |

**How to run any of them:** open Figma, run **Plugins → Scripter**, paste the whole file and press **Run**. Fonts come from Google Fonts, which Figma includes.

---

## Design system reference

### Colors

| Token | Light | Dark |
|---|---|---|
| bg/canvas | `#FAF7F2` | `#0F1512` |
| bg/surface | `#FFFFFF` | `#18211C` |
| bg/muted | `#F3EEE6` | `#1F2A24` |
| bg/brand-deep | `#1F3D2B` | `#123527` |
| text/primary | `#1C1C1A` | `#EDEAE4` |
| text/secondary | `#5E5E58` | `#B5B2AA` |
| text/muted | `#9A9A94` | `#7E8580` |
| brand/primary | `#1F3D2B` | `#8FC4A3` |
| brand/primary-hover | `#2F5A41` | `#A8D5B8` |
| accent/blush | `#E8A8A0` | `#F0B9B1` |
| accent/blush-subtle | `#F6DCD7` | `#3A2826` |
| sale/badge | `#E5534B` | `#E5534B` |
| sale/price | `#C73E37` | `#FF8A82` |
| border/default | `#E7E1D7` | `#2C3A32` |
| rating/star | `#F2B33D` | `#F2C46D` |

The full list, including the category tints and feedback colors, is in `css/tokens.css`.

### Typography

| Use | English | Arabic |
|---|---|---|
| Headings | Playfair Display SemiBold | IBM Plex Sans Arabic SemiBold |
| Body | Inter 400–700 | IBM Plex Sans Arabic 400–700 |

### Spacing, radius and shadows

- **Spacing:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
- **Radius:** sm 6, md 10, lg 16, xl 24, full 999
- **Shadows:** sm (cards), md (dropdowns and hover), lg (modals and drawers)

---

## Known limitations

- **Demo data:** product names and descriptions come from DummyJSON in English only. In Arabic mode everything else is translated.
- **Prices:** converted from USD at a fixed rate of 3.75.
- **Home page reviews:** the three reviews on the home page are sample text. Product pages show the API's reviews.
- **Phone validation:** the checkout form only accepts Saudi phone numbers for the customer.
- **Payments:** there are no online payments and no accounts. Orders are completed on WhatsApp.
- **Not in v1:** About, Contact and FAQ pages, a wishlist, product variants, discount codes and online payments. They're listed as future ideas in `PRD.md`.

---

## Credits

- Product data: [DummyJSON](https://dummyjson.com)
- Animation: [GSAP](https://gsap.com) (ScrollTrigger, SplitText) and [Lenis](https://lenis.darkroom.engineering)
- Icons: [Lucide](https://lucide.dev) (ISC license)
- Fonts: [Playfair Display](https://fonts.google.com/specimen/Playfair+Display), [Inter](https://fonts.google.com/specimen/Inter), [IBM Plex Sans Arabic](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic)
- Figma scripting: [Scripter](https://www.figma.com/community/plugin/757836922707087381/scripter)
