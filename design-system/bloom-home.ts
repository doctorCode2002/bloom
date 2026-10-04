// ─────────────────────────────────────────────────────────────────────────────
//  Bloom — Home page (landing) v1.0
//  Run in Figma with the "Scripter" plugin AFTER bloom-design-system.ts.
//
//  Uses the Bloom variables, text styles, effect styles and components that
//  the design system script created, and builds a page "Bloom — Home" with:
//    • Desktop 1440 — Light   • Desktop 1440 — Dark
//    • Mobile 390   — Light   • Mobile 390   — Dark
//
//  Safe to re-run: it replaces only the "Bloom — Home" page.
// ─────────────────────────────────────────────────────────────────────────────

const F: any = figma
const log = (...a: any[]) => { try { (print as any)(...a) } catch (e) { console.log(...a) } }

// ── Load the design system ───────────────────────────────────────────────────

const collections = await F.variables.getLocalVariableCollectionsAsync()
const colorCol = collections.find((c: any) => c.name === 'Bloom / Color')
const numCol = collections.find((c: any) => c.name === 'Bloom / Tokens')
if (!colorCol || !numCol) throw new Error('Bloom design system not found. Run bloom-design-system.ts first.')

const lightMode = colorCol.modes.find((m: any) => m.name === 'Light')
const darkMode = colorCol.modes.find((m: any) => m.name === 'Dark')
const LIGHT = lightMode ? lightMode.modeId : colorCol.modes[0].modeId
const DARK = darkMode ? darkMode.modeId : null

const V: any = {} // color variables
const N: any = {} // number variables
for (const v of await F.variables.getLocalVariablesAsync()) {
  if (v.variableCollectionId === colorCol.id) V[v.name] = v
  else if (v.variableCollectionId === numCol.id) N[v.name] = v
}

const TS: any = {} // text styles, keyed like "EN/H1"
for (const s of await F.getLocalTextStylesAsync()) {
  if (s.name.indexOf('Bloom/') !== 0) continue
  await figma.loadFontAsync(s.fontName)
  TS[s.name.slice('Bloom/'.length)] = s
}

const ES: any = {} // effect styles, keyed like "sm"
for (const s of await F.getLocalEffectStylesAsync()) {
  if (s.name.indexOf('Bloom/Shadow/') === 0) ES[s.name.slice('Bloom/Shadow/'.length)] = s
}

const dsPage: any = figma.root.children.find((p: any) => p.name === 'Bloom — Design System')
if (!dsPage) throw new Error('Page "Bloom — Design System" not found. Run bloom-design-system.ts first.')
if (dsPage.loadAsync) await dsPage.loadAsync()
const C: any = {} // components, keyed like "Button/Type=Primary, Size=Medium" or "Product Card"
for (const n of dsPage.findAll((x: any) => x.type === 'COMPONENT')) {
  const key = n.parent && n.parent.type === 'COMPONENT_SET' ? `${n.parent.name}/${n.name}` : n.name
  C[key] = n
}

// ── Icons ────────────────────────────────────────────────────────────────────

const ICONS: any = {
  cart:       '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  arrow:      '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  heart:      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  star:       '<polygon fill="#000" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  flower:     '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/>',
  menu:       '<line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>',
  moon:       '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  globe:      '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  truck:      '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  shield:     '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  message:    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  rotate:     '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  mail:       '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  chevron:    '<path d="m9 18 6-6-6-6"/>',
  check:      '<path d="M20 6 9 17l-5-5"/>',
  instagram:  '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  music:      '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  sparkles:   '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function goTo(page: any) {
  if (F.setCurrentPageAsync) await F.setCurrentPageAsync(page)
  else F.currentPage = page
}

function paint(name: string): any {
  if (!V[name]) throw new Error('Unknown color token: ' + name)
  return F.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name])
}

function strokeVar(node: any, name: string, weight = 1) {
  node.strokes = [paint(name)]
  node.strokeWeight = weight
  node.strokeAlign = 'INSIDE'
}

function borderBottom(node: any, name: string) {
  strokeVar(node, name)
  node.strokeTopWeight = 0; node.strokeLeftWeight = 0; node.strokeRightWeight = 0; node.strokeBottomWeight = 1
}

function radius(node: any, key: string) {
  for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(f, N['radius/' + key])
}

async function shadow(node: any, key: string) {
  if (!ES[key]) return
  if (node.setEffectStyleIdAsync) await node.setEffectStyleIdAsync(ES[key].id)
  else node.effectStyleId = ES[key].id
}

function al(node: any, o: any = {}): any {
  node.layoutMode = o.dir || 'VERTICAL'
  node.primaryAxisSizingMode = 'AUTO'
  node.counterAxisSizingMode = 'AUTO'
  node.itemSpacing = o.gap || 0
  const p = o.pad || [0, 0, 0, 0]
  node.paddingTop = p[0]; node.paddingRight = p[1]; node.paddingBottom = p[2]; node.paddingLeft = p[3]
  node.primaryAxisAlignItems = o.main || 'MIN'
  node.counterAxisAlignItems = o.cross || 'MIN'
  node.fills = o.fill ? [paint(o.fill)] : []
  if (o.r) radius(node, o.r)
  if (o.name) node.name = o.name
  node.clipsContent = !!o.clip
  return node
}
const frame = (o: any = {}) => al(figma.createFrame(), o)

function add(parent: any, ...kids: any[]) {
  for (const k of kids) parent.appendChild(k)
  return parent
}

function fillW(...nodes: any[]) {
  for (const n of nodes) n.layoutSizingHorizontal = 'FILL'
}

function fixed(node: any, w: number, h: number) {
  node.resize(w, h)
  node.primaryAxisSizingMode = 'FIXED'
  node.counterAxisSizingMode = 'FIXED'
  return node
}

function fixedWidth(node: any, w: number) {
  node.resize(w, Math.max(node.height, 1))
  if (node.layoutMode === 'VERTICAL') { node.counterAxisSizingMode = 'FIXED'; node.primaryAxisSizingMode = 'AUTO' }
  else { node.primaryAxisSizingMode = 'FIXED'; node.counterAxisSizingMode = 'AUTO' }
  return node
}

async function txt(chars: string, style: string, color: string, o: any = {}): Promise<any> {
  const s = TS[style]
  if (!s) throw new Error('Unknown text style: ' + style)
  const t = figma.createText()
  t.fontName = s.fontName
  if (t.setTextStyleIdAsync) await t.setTextStyleIdAsync(s.id)
  else (t as any).textStyleId = s.id
  t.characters = chars
  t.fills = [paint(color)]
  t.name = o.name || chars.slice(0, 32)
  if (o.align) t.textAlignHorizontal = o.align
  if (o.opacity) t.opacity = o.opacity
  return t
}

function icon(name: string, color: string, size = 24): any {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`
  const n: any = figma.createNodeFromSvg(svg)
  n.name = 'Icon/' + name
  n.fills = []
  for (const c of n.findAll(() => true)) {
    if ('strokes' in c && c.strokes.length) c.strokes = [paint(color)]
    if ('fills' in c && Array.isArray(c.fills) && c.fills.length) c.fills = [paint(color)]
  }
  if (size !== 24) n.rescale(size / 24)
  return n
}

function inst(key: string): any {
  if (!C[key]) throw new Error(`Component "${key}" not found. Re-run bloom-design-system.ts.`)
  return C[key].createInstance()
}

function setText(node: any, name: string, value: string) {
  const t = node.findOne((x: any) => x.type === 'TEXT' && x.name === name)
  if (t) t.characters = value
}

function button(type: string, size: string, label: string) {
  const b = inst(`Button/Type=${type}, Size=${size}`)
  setText(b, 'Label', label)
  return b
}

function stars(size: number) {
  const s = frame({ name: 'Stars', dir: 'HORIZONTAL', gap: 2 })
  for (let i = 0; i < 5; i++) add(s, icon('star', 'rating/star', size))
  return s
}

async function placeholder(label: string, fill: string, w: number, h: number, iconSize = 48) {
  const p = frame({ name: 'Image', gap: 8, main: 'CENTER', cross: 'CENTER', fill, r: 'lg', clip: true })
  add(p, icon('flower', 'text/muted', iconSize), await txt(label, 'EN/Caption', 'text/muted', { align: 'CENTER' }))
  fixed(p, w, h)
  return p
}

function circle(size: number, fill: string, child: any, stroke?: string) {
  const c = frame({ name: 'Circle', dir: 'HORIZONTAL', main: 'CENTER', cross: 'CENTER', fill, r: 'full' })
  if (stroke) strokeVar(c, stroke)
  add(c, child)
  return fixed(c, size, size)
}

async function link(label: string, color = 'brand/primary') {
  const l = frame({ name: 'Link', dir: 'HORIZONTAL', gap: 6, cross: 'CENTER' })
  add(l, await txt(label, 'EN/Label', color), icon('arrow', color, 16))
  return l
}

// ── Content ──────────────────────────────────────────────────────────────────

const PRODUCTS = [
  ['Hydrating Rose Serum',  'Skincare', 'SAR 89',  'SAR 119', '-25%'],
  ['Linen Wrap Dress',      'Dresses',  'SAR 249', 'SAR 299', '-15%'],
  ['Velvet Matte Lipstick', 'Makeup',   'SAR 59',  'SAR 79',  '-25%'],
  ['Mini Leather Tote',     'Bags',     'SAR 189', 'SAR 239', '-20%'],
  ['Vitamin C Glow Cream',  'Skincare', 'SAR 129', 'SAR 159', '-20%'],
]

const CATEGORIES = [
  ['Skincare', 'Blush'], ['Makeup', 'Sage'], ['Fragrance', 'Lilac'], ['Hair Care', 'Sand'],
  ['Dresses', 'Sky'], ['Tops', 'Blush'], ['Bags', 'Sage'], ['Accessories', 'Lilac'],
]

const PROMOS = [
  ['tint/sage', 'NEW ARRIVALS', 'Fresh Styles Just In'],
  ['tint/blush', 'SELF-CARE', 'Your Glow Routine'],
  ['tint/sky', 'ACCESSORIES', 'Finish The Look'],
]

const REVIEWS = [
  ['Noura A.', 'NA', 'tint/blush', 'The rose serum changed my skin in two weeks. Ordering on WhatsApp was so easy!'],
  ['Reem K.', 'RK', 'tint/sage', 'Beautiful dresses and fast delivery to Jeddah. Bloom is my go-to store now.'],
  ['Lama S.', 'LS', 'tint/lilac', 'Great prices and everything arrived exactly as pictured. Highly recommend!'],
]

const FEATURES = [
  ['truck', 'Free Delivery', 'On orders over SAR 200'],
  ['rotate', 'Easy Returns', '14-day return policy'],
  ['message', 'Order on WhatsApp', 'Fast & simple checkout'],
  ['headphones', 'Here to Help', 'Daily, 10am – 10pm'],
]

const FOOTER_COLS = [
  ['Shop', ['All Products', 'New Arrivals', 'Offers', 'Bestsellers']],
  ['Categories', ['Skincare', 'Makeup', 'Fashion', 'Bags']],
  ['Help', ['Order on WhatsApp', 'Delivery Info', 'Returns Policy']],
]

// ── Sections ─────────────────────────────────────────────────────────────────
// M = mobile layout, W = frame width, PX = side padding

let M = false
let W = 1440
let PX = 80

function container(parent: any, name: string, top: number, o: any = {}) {
  const c = frame(Object.assign({ name, pad: [top, PX, o.bottom || 0, PX] }, o))
  add(parent, c); fillW(c)
  return c
}

async function logo(onDark = false) {
  const l = frame({ name: 'Logo', dir: 'HORIZONTAL', gap: 10, cross: 'CENTER' })
  const mark = circle(M ? 36 : 44, onDark ? 'accent/blush' : 'brand/primary-subtle', icon('flower', 'brand/primary', M ? 20 : 24))
  const words = frame({ name: 'Wordmark', gap: 0 })
  add(words, await txt('Bloom', 'EN/H3', onDark ? 'text/on-brand-deep' : 'brand/primary'))
  if (!M || onDark) add(words, await txt('BEAUTY & STYLE', 'EN/Overline', onDark ? 'accent/blush' : 'text/muted'))
  add(l, mark, words)
  return l
}

async function headerAction(iconName: string, label: string | null, count?: string, arabicLabel = false) {
  const a = frame({ name: label || iconName, gap: 4, cross: 'CENTER' })
  const wrap = frame({ name: 'Icon', dir: 'HORIZONTAL' })
  add(wrap, icon(iconName, 'text/primary', 22))
  if (count) {
    const bubble = circle(18, 'sale/badge', await txt(count, 'EN/Badge', 'text/on-sale'))
    add(wrap, bubble)
    bubble.layoutPositioning = 'ABSOLUTE'; bubble.x = 13; bubble.y = -7
  }
  add(a, wrap)
  if (label) add(a, await txt(label, arabicLabel ? 'AR/Caption' : 'EN/Caption', 'text/secondary'))
  return a
}

async function announcement(root: any) {
  const bar = container(root, 'Announcement', 10, { dir: 'HORIZONTAL', gap: 40, main: 'CENTER', cross: 'CENTER', fill: 'bg/brand-deep', bottom: 10 })
  const items = M ? [FEATURES[0]] : [FEATURES[0], FEATURES[1], FEATURES[2]]
  for (const [ic, title, sub] of items) {
    const it = frame({ name: title, dir: 'HORIZONTAL', gap: 8, cross: 'CENTER' })
    add(it, icon(ic, 'accent/blush', 16), await txt(M ? `${title} over SAR 200` : `${title} · ${sub}`, 'EN/Caption', 'text/on-brand-deep'))
    add(bar, it)
  }
}

async function header(root: any) {
  const h = container(root, 'Header', M ? 14 : 20, { gap: 14, fill: 'bg/surface', bottom: M ? 14 : 20 })
  borderBottom(h, 'border/default')

  const row = frame({ name: 'Row', dir: 'HORIZONTAL', gap: 32, cross: 'CENTER', main: 'SPACE_BETWEEN' })
  add(h, row); fillW(row)

  if (M) {
    const left = frame({ name: 'Left', dir: 'HORIZONTAL', gap: 12, cross: 'CENTER' })
    add(left, icon('menu', 'text/primary', 24), await logo())
    const right = frame({ name: 'Actions', dir: 'HORIZONTAL', gap: 18, cross: 'CENTER' })
    add(right, await headerAction('moon', null), await headerAction('cart', null, '2'))
    add(row, left, right)
    const search = inst('Input/State=Default')
    add(h, search); fillW(search)
    return
  }

  const search = inst('Input/State=Default')
  setText(search, 'Value', 'Search skincare, makeup, dresses…')
  const actions = frame({ name: 'Actions', dir: 'HORIZONTAL', gap: 28, cross: 'CENTER' })
  add(actions, await headerAction('globe', 'العربية', undefined, true), await headerAction('moon', 'Dark'), await headerAction('cart', 'Cart', '2'))
  add(row, await logo(), search, actions)
  search.layoutGrow = 1
}

async function nav(root: any) {
  if (M) return
  const n = container(root, 'Navigation', 12, { dir: 'HORIZONTAL', gap: 40, cross: 'CENTER', fill: 'bg/surface', bottom: 12 })
  borderBottom(n, 'border/default')

  const all = frame({ name: 'All Categories', dir: 'HORIZONTAL', gap: 10, cross: 'CENTER', pad: [12, 20, 12, 20], fill: 'brand/primary', r: 'md' })
  add(all, icon('menu', 'text/on-primary', 18), await txt('All Categories', 'EN/Label', 'text/on-primary'))
  add(n, all)

  const links = ['Home', 'Shop', 'Skincare', 'Makeup', 'Fashion', 'New Arrivals', 'Offers']
  for (const label of links) {
    const active = label === 'Home'
    const l = frame({ name: label, gap: 6, cross: 'CENTER' })
    add(l, await txt(label, 'EN/Label', active ? 'text/primary' : 'text/secondary'))
    if (active) {
      const line = figma.createRectangle()
      line.resize(10, 2); line.fills = [paint('brand/primary')]; line.cornerRadius = 1
      add(l, line); fillW(line)
    }
    add(n, l)
  }
}

async function hero(root: any) {
  const wrap = container(root, 'Hero', M ? 16 : 24, { gap: 16, cross: 'CENTER' })
  const card = frame({ name: 'Hero Card', dir: M ? 'VERTICAL' : 'HORIZONTAL', gap: M ? 24 : 40, main: 'SPACE_BETWEEN', cross: 'CENTER',
    pad: M ? [28, 20, 20, 20] : [56, 56, 56, 64], fill: 'tint/blush', r: 'xl', clip: true })
  add(wrap, card); fillW(card)

  const copy = frame({ name: 'Copy', gap: M ? 16 : 24 })
  add(card, copy)
  if (M) fillW(copy); else fixedWidth(copy, 540)

  const over = await txt('NEW SEASON EDIT', 'EN/Overline', 'brand/primary')
  const title = await txt('Bloom Into Your Best Self', M ? 'EN/H1' : 'EN/Display', 'text/primary')
  const body = await txt('Skincare, makeup and fashion picked for the way you live, delivered across Saudi Arabia.', M ? 'EN/Body' : 'EN/Body L', 'text/secondary')
  add(copy, over, title, body); fillW(title, body)

  const ctas = frame({ name: 'Buttons', dir: 'HORIZONTAL', gap: 12 })
  add(ctas, button('Primary', 'Medium', 'Shop Now'))
  if (!M) add(ctas, button('Outline', 'Medium', 'Explore Skincare'))
  add(copy, ctas)

  const trust = frame({ name: 'Trust', dir: 'HORIZONTAL', gap: M ? 16 : 28, cross: 'CENTER' })
  const trustItems = M ? [['shield', 'Authentic'], ['message', 'WhatsApp orders']] : [['shield', 'Authentic products'], ['truck', 'Fast delivery'], ['message', 'Order on WhatsApp']]
  for (const [ic, label] of trustItems) {
    const t = frame({ name: label, dir: 'HORIZONTAL', gap: 8, cross: 'CENTER' })
    add(t, icon(ic, 'brand/primary', 18), await txt(label, 'EN/Caption', 'text/secondary'))
    add(trust, t)
  }
  add(copy, trust)

  const img = await placeholder('Hero image — model with skincare & accessories', 'bg/surface', M ? 300 : 580, M ? 260 : 440, M ? 40 : 64)
  add(card, img)
  if (M) { fillW(img) }

  const tag = frame({ name: 'Sale Tag', gap: 0, cross: 'CENTER', pad: M ? [12, 14, 12, 14] : [18, 22, 18, 22], fill: 'bg/brand-deep', r: 'lg' })
  add(tag, await txt('SUMMER SALE', 'EN/Overline', 'accent/blush'), await txt('40%', M ? 'EN/H2' : 'EN/H1', 'text/on-brand-deep'), await txt('OFF SELECTED', 'EN/Caption', 'text/on-brand-deep'))
  add(img, tag)
  tag.layoutPositioning = 'ABSOLUTE'
  tag.x = img.width - tag.width - 16; tag.y = 16
  tag.constraints = { horizontal: 'MAX', vertical: 'MIN' }

  const dots = frame({ name: 'Carousel Dots', dir: 'HORIZONTAL', gap: 6, cross: 'CENTER' })
  for (let i = 0; i < 4; i++) {
    const d = figma.createRectangle()
    d.resize(i === 0 ? 24 : 6, 6); d.cornerRadius = 3
    d.fills = [paint(i === 0 ? 'brand/primary' : 'border/strong')]
    add(dots, d)
  }
  add(wrap, dots)
}

async function categories(root: any) {
  const wrap = container(root, 'Categories', M ? 32 : 48)
  const row = frame({ name: 'Row', dir: 'HORIZONTAL', gap: M ? 16 : 24, main: M ? 'MIN' : 'SPACE_BETWEEN', clip: M })
  add(wrap, row); fillW(row)
  for (const [label, tint] of CATEGORIES) {
    const c = inst(`Category Chip/Tint=${tint}`)
    setText(c, 'Label', label)
    add(row, c)
  }
  const all = frame({ name: 'View All', gap: 8, cross: 'CENTER' })
  add(all, circle(72, 'bg/surface', icon('arrow', 'brand/primary', 24), 'border/default'), await txt('View All', 'EN/Label', 'text/primary'))
  add(row, all)
}

async function sectionHeader(parent: any, title: string, action: string | null, accentIcon?: string) {
  const h = frame({ name: 'Section Header', dir: 'HORIZONTAL', main: 'SPACE_BETWEEN', cross: 'CENTER' })
  add(parent, h); fillW(h)
  const left = frame({ name: 'Title', dir: 'HORIZONTAL', gap: 8, cross: 'CENTER' })
  add(left, await txt(title, M ? 'EN/H3' : 'EN/H2', 'text/primary'))
  if (accentIcon) add(left, icon(accentIcon, accentIcon === 'heart' ? 'sale/badge' : 'accent/blush', M ? 18 : 22))
  add(h, left)
  if (action) add(h, await link(action))
  return h
}

async function topPicks(root: any) {
  const wrap = container(root, 'Top Picks', M ? 40 : 64, { gap: 24 })
  await sectionHeader(wrap, 'Top Picks For You', M ? 'See All' : 'See All Deals', 'sparkles')

  const panel = frame({ name: 'Products', dir: 'HORIZONTAL', gap: M ? 12 : 18, clip: M,
    pad: M ? [0, 0, 0, 0] : [24, 24, 24, 24], fill: M ? null : 'bg/surface', r: M ? null : 'xl' })
  add(wrap, panel); fillW(panel)
  if (!M) strokeVar(panel, 'border/default')

  for (const [title, cat, price, old, off] of PRODUCTS) {
    const card = inst('Product Card')
    setText(card, 'Title', title); setText(card, 'Category', cat)
    setText(card, 'Price', price); setText(card, 'Old Price', old); setText(card, 'Badge Label', off)
    add(panel, card)
    if (!M) card.layoutGrow = 1
  }

  if (!M) {
    const next = circle(44, 'bg/surface', icon('chevron', 'text/primary', 20), 'border/default')
    await shadow(next, 'md')
    add(panel, next)
    next.layoutPositioning = 'ABSOLUTE'
    next.x = panel.width - 22; next.y = panel.height / 2 - 22
  }
}

async function promos(root: any) {
  const wrap = container(root, 'Promo Banners', M ? 40 : 48, { dir: M ? 'VERTICAL' : 'HORIZONTAL', gap: M ? 12 : 24 })
  for (const [fill, over, title] of PROMOS) {
    const b = frame({ name: title, dir: 'HORIZONTAL', gap: 16, cross: 'CENTER', main: 'SPACE_BETWEEN', pad: [24, 24, 24, 28], fill, r: 'xl', clip: true })
    add(wrap, b)
    if (M) fillW(b); else b.layoutGrow = 1
    const copy = frame({ name: 'Copy', gap: 8 })
    add(copy, await txt(over, 'EN/Overline', 'text/secondary'), await txt(title, 'EN/H3', 'text/primary'))
    const l = await link('Shop Now')
    l.paddingTop = 8
    add(copy, l)
    add(b, copy, await placeholder('Image', 'bg/surface', M ? 110 : 130, M ? 110 : 140, 32))
  }
}

async function testimonials(root: any) {
  const wrap = container(root, 'Testimonials', M ? 40 : 64, { gap: 24 })
  const head = await sectionHeader(wrap, 'Loved By Thousands', null, 'heart')
  const rating = frame({ name: 'Average Rating', dir: 'HORIZONTAL', gap: 10, cross: 'CENTER' })
  add(rating, await txt('4.8/5 average rating', 'EN/Label', 'text/primary'), stars(16))
  if (M) add(wrap, rating); else add(head, rating)

  const row = frame({ name: 'Reviews', dir: 'HORIZONTAL', gap: M ? 12 : 24, clip: M })
  add(wrap, row); fillW(row)
  for (const [name, initials, tint, quote] of REVIEWS) {
    const card = frame({ name, dir: 'HORIZONTAL', gap: 16, pad: [24, 24, 24, 24], fill: 'bg/surface', r: 'lg' })
    strokeVar(card, 'border/default')
    await shadow(card, 'sm')
    add(row, card)
    if (M) fixedWidth(card, 300); else card.layoutGrow = 1

    add(card, circle(52, tint, await txt(initials, 'EN/H4', 'brand/primary')))
    const body = frame({ name: 'Body', gap: 6 })
    add(card, body); body.layoutGrow = 1
    const who = frame({ name: 'Name', dir: 'HORIZONTAL', gap: 6, cross: 'CENTER' })
    add(who, await txt(name, 'EN/Label', 'text/primary'), icon('check', 'feedback/success', 14), await txt('Verified buyer', 'EN/Caption', 'text/muted'))
    const q = await txt(`“${quote}”`, 'EN/Body S', 'text/secondary')
    add(body, who, stars(14), q); fillW(q)
  }
}

async function newsletter(root: any) {
  const wrap = container(root, 'Newsletter', M ? 40 : 64)
  const box = frame({ name: 'Newsletter Box', dir: M ? 'VERTICAL' : 'HORIZONTAL', gap: M ? 20 : 40, cross: M ? 'MIN' : 'CENTER',
    pad: M ? [28, 20, 28, 20] : [48, 56, 48, 56], fill: 'bg/brand-deep', r: 'xl' })
  add(wrap, box); fillW(box)

  add(box, circle(M ? 64 : 88, 'accent/blush', icon('mail', 'brand/primary', M ? 28 : 36)))

  const copy = frame({ name: 'Copy', gap: 8 })
  add(box, copy)
  if (M) fillW(copy); else copy.layoutGrow = 1
  const h = await txt('Stay in the Loop', M ? 'EN/H3' : 'EN/H2', 'text/on-brand-deep')
  const p = await txt('Get exclusive offers, new arrivals and beauty tips straight to your inbox.', 'EN/Body', 'text/on-brand-deep', { opacity: 0.85 })
  add(copy, h, p); fillW(h, p)

  const form = frame({ name: 'Form', gap: 10 })
  add(box, form)
  if (M) fillW(form); else fixedWidth(form, 440)
  const field = frame({ name: 'Email Field', dir: 'HORIZONTAL', gap: 8, cross: 'CENTER', pad: [6, 6, 6, 20], fill: 'bg/surface', r: 'full' })
  add(form, field); fillW(field)
  const ph = await txt('Enter your email address', 'EN/Body S', 'text/muted')
  add(field, ph, button('Secondary', 'Small', 'Subscribe'))
  ph.layoutGrow = 1
  const note = frame({ name: 'Privacy', dir: 'HORIZONTAL', gap: 6, cross: 'CENTER' })
  add(note, icon('shield', 'accent/blush', 14), await txt('We respect your privacy. Unsubscribe anytime.', 'EN/Caption', 'text/on-brand-deep', { opacity: 0.8 }))
  add(form, note)
}

async function features(root: any) {
  const wrap = container(root, 'Features', M ? 32 : 48)
  const box = frame({ name: 'Features Box', dir: M ? 'VERTICAL' : 'HORIZONTAL', gap: M ? 18 : 24, main: 'SPACE_BETWEEN',
    pad: M ? [20, 20, 20, 20] : [28, 40, 28, 40], fill: 'bg/surface', r: 'xl' })
  strokeVar(box, 'border/default')
  add(wrap, box); fillW(box)
  for (const [ic, title, sub] of FEATURES) {
    const it = frame({ name: title, dir: 'HORIZONTAL', gap: 14, cross: 'CENTER' })
    const text = frame({ name: 'Text', gap: 2 })
    add(text, await txt(title, 'EN/Label', 'text/primary'), await txt(sub, 'EN/Caption', 'text/muted'))
    add(it, circle(44, 'brand/primary-subtle', icon(ic, 'brand/primary', 20)), text)
    add(box, it)
  }
}

async function footer(root: any) {
  const f = container(root, 'Footer', M ? 40 : 64, { gap: M ? 32 : 40, fill: 'bg/brand-deep', bottom: 32 })
  root.itemSpacing = 0

  const top = frame({ name: 'Top', dir: M ? 'VERTICAL' : 'HORIZONTAL', gap: M ? 32 : 64 })
  add(f, top); fillW(top)

  const brand = frame({ name: 'Brand', gap: 16 })
  add(top, brand)
  if (M) fillW(brand); else fixedWidth(brand, 320)
  const about = await txt('Your destination for skincare, makeup and fashion, picked for the way you live.', 'EN/Body S', 'text/on-brand-deep', { opacity: 0.8 })
  const social = frame({ name: 'Social', dir: 'HORIZONTAL', gap: 10 })
  for (const ic of ['instagram', 'music', 'message']) add(social, circle(36, null as any, icon(ic, 'text/on-brand-deep', 18), 'text/on-brand-deep'))
  add(brand, await logo(true), about, social); fillW(about)

  const cols = frame({ name: 'Columns', dir: 'HORIZONTAL', gap: M ? 24 : 48 })
  add(top, cols)
  if (M) { fillW(cols); cols.layoutWrap = 'WRAP'; cols.counterAxisSpacing = 28 } else cols.layoutGrow = 1
  for (const [title, links] of FOOTER_COLS as any[]) {
    const col = frame({ name: title, gap: 12 })
    add(cols, col)
    if (M) fixedWidth(col, 150); else col.layoutGrow = 1
    add(col, await txt(title, 'EN/Label', 'accent/blush'))
    for (const l of links) add(col, await txt(l, 'EN/Body S', 'text/on-brand-deep', { opacity: 0.8 }))
  }

  const contact = frame({ name: 'Contact', gap: 12 })
  add(top, contact)
  if (M) fillW(contact)
  add(contact, await txt('Order on WhatsApp', 'EN/Label', 'accent/blush'))
  const wa = frame({ name: 'WhatsApp', dir: 'HORIZONTAL', gap: 8, cross: 'CENTER', pad: [10, 16, 10, 16], fill: 'accent/blush', r: 'full' })
  add(wa, icon('message', 'text/on-accent', 18), await txt('+966 5X XXX XXXX', 'EN/Label', 'text/on-accent'))
  add(contact, wa, await txt('Daily, 10am – 10pm', 'EN/Caption', 'text/on-brand-deep', { opacity: 0.8 }))

  const line = figma.createRectangle()
  line.resize(10, 1); line.fills = [paint('text/on-brand-deep')]; line.opacity = 0.15
  add(f, line); fillW(line)

  const bottom = frame({ name: 'Bottom', dir: M ? 'VERTICAL' : 'HORIZONTAL', gap: 12, main: 'SPACE_BETWEEN', cross: M ? 'MIN' : 'CENTER' })
  add(f, bottom); fillW(bottom)
  const lang = frame({ name: 'Locale', dir: 'HORIZONTAL', gap: 8, cross: 'CENTER' })
  add(lang, icon('globe', 'text/on-brand-deep', 16), await txt('English  /', 'EN/Caption', 'text/on-brand-deep'), await txt('العربية', 'AR/Caption', 'text/on-brand-deep'), await txt('·  SAR', 'EN/Caption', 'text/on-brand-deep'))
  add(bottom, await txt('© 2026 Bloom. All rights reserved.', 'EN/Caption', 'text/on-brand-deep', { opacity: 0.7 }), lang)
}

// ── Build ────────────────────────────────────────────────────────────────────

async function buildHome(mobile: boolean, modeName: string, modeId: any) {
  M = mobile
  W = mobile ? 390 : 1440
  PX = mobile ? 16 : 80
  const root = frame({ name: `Home — ${mobile ? 'Mobile' : 'Desktop'} — ${modeName}`, fill: 'bg/canvas', clip: true })
  fixedWidth(root, W)
  root.setExplicitVariableModeForCollection(colorCol, modeId)

  await announcement(root)
  await header(root)
  await nav(root)
  await hero(root)
  await categories(root)
  await topPicks(root)
  await promos(root)
  await testimonials(root)
  await newsletter(root)
  await features(root)
  await footer(root)
  return root
}

const PAGE_NAME = 'Bloom — Home'
const page = figma.createPage()
page.name = PAGE_NAME
for (const p of figma.root.children.slice()) {
  if (p !== page && p.name === PAGE_NAME) {
    if (figma.currentPage === p) await goTo(page)
    p.remove()
  }
}
await goTo(page)
page.backgrounds = [{ type: 'SOLID', color: { r: 0.93, g: 0.91, b: 0.88 } }]

const frames: any[] = []
const desktopLight = await buildHome(false, 'Light', LIGHT)
frames.push(desktopLight)
const mobileLight = await buildHome(true, 'Light', LIGHT)
frames.push(mobileLight)

let x = 0
desktopLight.x = x; desktopLight.y = 0; x += 1440 + 120
if (DARK) {
  const desktopDark = desktopLight.clone()
  desktopDark.name = 'Home — Desktop — Dark'
  desktopDark.setExplicitVariableModeForCollection(colorCol, DARK)
  desktopDark.x = x; desktopDark.y = 0; x += 1440 + 200
  frames.push(desktopDark)
}
mobileLight.x = x; mobileLight.y = 0; x += 390 + 80
if (DARK) {
  const mobileDark = mobileLight.clone()
  mobileDark.name = 'Home — Mobile — Dark'
  mobileDark.setExplicitVariableModeForCollection(colorCol, DARK)
  mobileDark.x = x; mobileDark.y = 0
  frames.push(mobileDark)
}

figma.viewport.scrollAndZoomIntoView(frames)
figma.notify('🌸 Bloom home page created')
log(`✅ Bloom home page created: ${frames.map((f: any) => f.name).join(', ')}`)
