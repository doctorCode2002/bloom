// ─────────────────────────────────────────────────────────────────────────────
//  Bloom — Design System v1.0
//  Run in Figma with the "Scripter" plugin: paste this whole file and press Run.
//
//  Creates:
//    • Color variables   "Bloom / Color"   (Light + Dark modes)
//    • Number variables  "Bloom / Tokens"  (spacing + radius)
//    • Text styles       Bloom/EN/*  and  Bloom/AR/*
//    • Effect styles     Bloom/Shadow/*
//    • Page "Bloom — Design System" with docs, components and theme previews
//
//  Safe to re-run: it removes only what a previous run created (anything named
//  "Bloom / …" or "Bloom/…", and the "Bloom — Design System" page) and rebuilds it.
// ─────────────────────────────────────────────────────────────────────────────

const F: any = figma
const log = (...a: any[]) => { try { (print as any)(...a) } catch (e) { console.log(...a) } }

// ── Tokens ───────────────────────────────────────────────────────────────────

// [name, light, dark, scope]
const COLORS: any[] = [
  ['bg/canvas',            '#FAF7F2', '#0F1512', 'bg'],
  ['bg/surface',           '#FFFFFF', '#18211C', 'bg'],
  ['bg/muted',             '#F3EEE6', '#1F2A24', 'bg'],
  ['bg/brand-deep',        '#1F3D2B', '#123527', 'bg'],

  ['text/primary',         '#1C1C1A', '#EDEAE4', 'text'],
  ['text/secondary',       '#5E5E58', '#B5B2AA', 'text'],
  ['text/muted',           '#9A9A94', '#7E8580', 'text'],
  ['text/on-primary',      '#FFFFFF', '#0F1512', 'text'],
  ['text/on-accent',       '#1C1C1A', '#0F1512', 'text'],
  ['text/on-sale',         '#FFFFFF', '#FFFFFF', 'text'],
  ['text/on-brand-deep',   '#FAF7F2', '#EDEAE4', 'text'],

  ['border/default',       '#E7E1D7', '#2C3A32', 'stroke'],
  ['border/strong',        '#CFC7BA', '#3D4E44', 'stroke'],

  ['brand/primary',        '#1F3D2B', '#8FC4A3', 'any'],
  ['brand/primary-hover',  '#2F5A41', '#A8D5B8', 'any'],
  ['brand/primary-subtle', '#E4ECE5', '#1E3428', 'any'],

  ['accent/blush',         '#E8A8A0', '#F0B9B1', 'any'],
  ['accent/blush-subtle',  '#F6DCD7', '#3A2826', 'any'],

  ['sale/badge',           '#E5534B', '#E5534B', 'any'],
  ['sale/price',           '#C73E37', '#FF8A82', 'text'],
  ['sale/old-price',       '#9A9A94', '#7E8580', 'text'],

  ['feedback/success',     '#2E7D4F', '#6FCF97', 'any'],
  ['feedback/warning',     '#C98A1B', '#F2C46D', 'any'],
  ['feedback/error',       '#C73E37', '#FF8A82', 'any'],
  ['rating/star',          '#F2B33D', '#F2C46D', 'any'],

  ['tint/blush',           '#FBE7E3', '#3A2826', 'bg'],
  ['tint/sage',            '#E6EFE3', '#1E3428', 'bg'],
  ['tint/sand',            '#F5ECDD', '#33291D', 'bg'],
  ['tint/sky',             '#E3EEF6', '#1C2B36', 'bg'],
  ['tint/lilac',           '#EEE6F3', '#2B2236', 'bg'],
]

const SPACE: any = { '1': 4, '2': 8, '3': 12, '4': 16, '5': 20, '6': 24, '8': 32, '10': 40, '12': 48, '16': 64, '20': 80 }
const RADII: any = { sm: 6, md: 10, lg: 16, xl: 24, full: 999 }

const SHADOWS: any = {
  sm: [{ y: 1, blur: 3, a: 0.06 }, { y: 1, blur: 2, a: 0.04 }],
  md: [{ y: 4, blur: 12, a: 0.08 }],
  lg: [{ y: 12, blur: 32, a: 0.12 }],
}

const ICONS: any = {
  cart:   '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  arrow:  '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  heart:  '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  star:   '<polygon fill="#000" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  flower: '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/>',
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rgb(h: string): any {
  const n = h.replace('#', '')
  return { r: parseInt(n.slice(0, 2), 16) / 255, g: parseInt(n.slice(2, 4), 16) / 255, b: parseInt(n.slice(4, 6), 16) / 255, a: 1 }
}

async function goTo(page: any) {
  if (F.setCurrentPageAsync) await F.setCurrentPageAsync(page)
  else F.currentPage = page
}

async function loadFirst(family: string, styles: string[]): Promise<any> {
  for (const style of styles) {
    try { await figma.loadFontAsync({ family, style }); return { family, style } } catch (e) {}
  }
  const fallback = { family: 'Inter', style: 'Regular' }
  log(`⚠️ "${family} ${styles[0]}" is not available, using Inter Regular instead`)
  await figma.loadFontAsync(fallback)
  return fallback
}

const V: any = {}  // color variables by name
const N: any = {}  // number variables by name
const TS: any = {} // text styles by key
const ES: any = {} // effect styles by key

function paint(name: string): any {
  if (!V[name]) throw new Error('Unknown color token: ' + name)
  return F.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[name])
}

function strokeVar(node: any, name: string, weight = 1) {
  node.strokes = [paint(name)]
  node.strokeWeight = weight
  node.strokeAlign = 'INSIDE'
}

function radius(node: any, key: string) {
  for (const f of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) node.setBoundVariable(f, N['radius/' + key])
}

function pad(node: any, y: string, x: string) {
  node.setBoundVariable('paddingTop', N['space/' + y])
  node.setBoundVariable('paddingBottom', N['space/' + y])
  node.setBoundVariable('paddingLeft', N['space/' + x])
  node.setBoundVariable('paddingRight', N['space/' + x])
}

function gap(node: any, key: string) {
  node.setBoundVariable('itemSpacing', N['space/' + key])
}

// Auto-layout setup shared by frames and components
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
  if (o.r != null) node.cornerRadius = o.r
  if (o.name) node.name = o.name
  return node
}
const frame = (o: any = {}) => al(figma.createFrame(), o)
const comp = (o: any = {}) => al(figma.createComponent(), o)

function add(parent: any, ...kids: any[]) {
  for (const k of kids) parent.appendChild(k)
  return parent
}

function fillW(...nodes: any[]) {
  for (const n of nodes) n.layoutSizingHorizontal = 'FILL'
}

async function txt(chars: string, style: string, color: string, o: any = {}): Promise<any> {
  const t = figma.createText()
  const s = TS[style]
  t.fontName = s.fontName
  if (t.setTextStyleIdAsync) await t.setTextStyleIdAsync(s.id)
  else (t as any).textStyleId = s.id
  t.characters = chars
  t.fills = [paint(color)]
  t.name = o.name || chars.slice(0, 32)
  if (o.align) t.textAlignHorizontal = o.align
  if (o.strike) t.textDecoration = 'STRIKETHROUGH'
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

// Lay out a component set's variants in a grid
function grid(set: any, cols: number, gx = 24, gy = 24, p = 24) {
  const kids = set.children
  const w = Math.max(...kids.map((k: any) => k.width))
  const h = Math.max(...kids.map((k: any) => k.height))
  kids.forEach((k: any, i: number) => { k.x = p + (i % cols) * (w + gx); k.y = p + Math.floor(i / cols) * (h + gy) })
  const rows = Math.ceil(kids.length / cols)
  set.resizeWithoutConstraints(p * 2 + cols * w + (cols - 1) * gx, p * 2 + rows * h + (rows - 1) * gy)
  set.fills = [paint('bg/surface')]
  set.cornerRadius = 16
}

// ── 1. Clean up a previous run ───────────────────────────────────────────────

for (const c of await F.variables.getLocalVariableCollectionsAsync()) if (c.name.startsWith('Bloom /')) c.remove()
for (const s of await F.getLocalTextStylesAsync()) if (s.name.startsWith('Bloom/')) s.remove()
for (const s of await F.getLocalEffectStylesAsync()) if (s.name.startsWith('Bloom/')) s.remove()

const PAGE_NAME = 'Bloom — Design System'
const page = figma.createPage()
page.name = PAGE_NAME
for (const p of [...figma.root.children]) {
  if (p !== page && p.name === PAGE_NAME) {
    if (figma.currentPage === p) await goTo(page)
    p.remove()
  }
}
await goTo(page)
page.backgrounds = [{ type: 'SOLID', color: { r: 0.93, g: 0.91, b: 0.88 } }]

// ── 2. Fonts ─────────────────────────────────────────────────────────────────

const FONT: any = {
  serif:    await loadFirst('Playfair Display', ['SemiBold', 'Semi Bold', 'Bold']),
  sans:     await loadFirst('Inter', ['Regular']),
  sansMed:  await loadFirst('Inter', ['Medium']),
  sansSemi: await loadFirst('Inter', ['Semi Bold', 'SemiBold']),
  sansBold: await loadFirst('Inter', ['Bold']),
  ar:       await loadFirst('IBM Plex Sans Arabic', ['Regular']),
  arMed:    await loadFirst('IBM Plex Sans Arabic', ['Medium']),
  arSemi:   await loadFirst('IBM Plex Sans Arabic', ['SemiBold', 'Semi Bold']),
  arBold:   await loadFirst('IBM Plex Sans Arabic', ['Bold']),
}

// ── 3. Variables ─────────────────────────────────────────────────────────────

const colorCol = F.variables.createVariableCollection('Bloom / Color')
const LIGHT = colorCol.modes[0].modeId
colorCol.renameMode(LIGHT, 'Light')
let DARK: any = null
try {
  DARK = colorCol.addMode('Dark')
} catch (e) {
  log('⚠️ Could not add a "Dark" mode (your Figma plan may limit modes). Dark values are still shown on the color swatches.')
}

const SCOPES: any = {
  bg: ['FRAME_FILL', 'SHAPE_FILL'],
  text: ['TEXT_FILL'],
  stroke: ['STROKE_COLOR'],
  any: ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'],
}

for (const [name, light, dark, scope] of COLORS) {
  const v = F.variables.createVariable(name, colorCol, 'COLOR')
  v.setValueForMode(LIGHT, rgb(light))
  if (DARK) v.setValueForMode(DARK, rgb(dark))
  v.scopes = SCOPES[scope]
  v.setVariableCodeSyntax('WEB', `var(--color-${name.replace(/\//g, '-')})`)
  V[name] = v
}

const numCol = F.variables.createVariableCollection('Bloom / Tokens')
const NUM = numCol.modes[0].modeId
numCol.renameMode(NUM, 'Default')
for (const k of Object.keys(SPACE)) {
  const v = F.variables.createVariable(`space/${k}`, numCol, 'FLOAT')
  v.setValueForMode(NUM, SPACE[k])
  v.scopes = ['GAP']
  v.setVariableCodeSyntax('WEB', `var(--space-${k})`)
  N[`space/${k}`] = v
}
for (const k of Object.keys(RADII)) {
  const v = F.variables.createVariable(`radius/${k}`, numCol, 'FLOAT')
  v.setValueForMode(NUM, RADII[k])
  v.scopes = ['CORNER_RADIUS']
  v.setVariableCodeSyntax('WEB', `var(--radius-${k})`)
  N[`radius/${k}`] = v
}

// ── 4. Text styles ───────────────────────────────────────────────────────────

// key, EN [font, size, lineHeight, letterSpacing%], AR [...], EN sample, AR sample
const TYPE: any[] = [
  ['Display',   [FONT.serif, 56, 64, -1],    [FONT.arSemi, 52, 72, 0], 'Bloom into you',                           'تألّقي بأسلوبك'],
  ['H1',        [FONT.serif, 40, 48, -0.5],  [FONT.arSemi, 38, 56, 0], 'Fresh Styles Just In',                     'وصل حديثاً'],
  ['H2',        [FONT.serif, 32, 40, -0.5],  [FONT.arSemi, 30, 44, 0], 'Top Picks For You',                        'اختياراتنا لكِ'],
  ['H3',        [FONT.serif, 24, 32, 0],     [FONT.arSemi, 22, 34, 0], 'Loved By Thousands',                       'يحبّه الآلاف'],
  ['H4',        [FONT.serif, 20, 28, 0],     [FONT.arSemi, 19, 30, 0], 'Make Your Glow Last',                      'إشراقة تدوم'],
  ['Body L',    [FONT.sans, 18, 28, 0],      [FONT.ar, 18, 30, 0],     'Discover skincare and fashion picked for the way you live.', 'اكتشفي منتجات العناية والأزياء المختارة لأسلوب حياتك.'],
  ['Body',      [FONT.sans, 16, 24, 0],      [FONT.ar, 16, 26, 0],     'Discover skincare and fashion picked for the way you live.', 'اكتشفي منتجات العناية والأزياء المختارة لأسلوب حياتك.'],
  ['Body S',    [FONT.sans, 14, 20, 0],      [FONT.ar, 14, 22, 0],     'Discover skincare and fashion picked for the way you live.', 'اكتشفي منتجات العناية والأزياء المختارة لأسلوب حياتك.'],
  ['Label',     [FONT.sansSemi, 14, 20, 0],  [FONT.arSemi, 14, 22, 0], 'Hydrating Rose Serum',                     'سيروم الورد المرطّب'],
  ['Caption',   [FONT.sansMed, 12, 16, 0],   [FONT.arMed, 12, 18, 0],  'Free shipping on orders over SAR 200',     'شحن مجاني للطلبات فوق ٢٠٠ ريال'],
  ['Overline',  [FONT.sansSemi, 12, 16, 8],  [FONT.arSemi, 12, 18, 0], 'NEW ARRIVALS',                             'وصل حديثاً'],
  ['Badge',     [FONT.sansSemi, 12, 16, 0],  [FONT.arSemi, 12, 18, 0], '-20%',                                     'خصم ٢٠٪'],
  ['Button',    [FONT.sansSemi, 15, 20, 0],  [FONT.arSemi, 15, 22, 0], 'Shop Now',                                 'تسوّقي الآن'],
  ['Button S',  [FONT.sansSemi, 13, 16, 0],  [FONT.arSemi, 13, 18, 0], 'Add to Cart',                              'أضيفي للسلة'],
  ['Price',     [FONT.sansBold, 18, 24, 0],  [FONT.arBold, 18, 26, 0], 'SAR 89.00',                                '89.00 ر.س'],
]

function makeTextStyle(key: string, def: any[]) {
  const s = figma.createTextStyle()
  s.name = `Bloom/${key}`
  s.fontName = def[0]
  s.fontSize = def[1]
  s.lineHeight = { unit: 'PIXELS', value: def[2] }
  s.letterSpacing = { unit: 'PERCENT', value: def[3] }
  TS[key] = s
}
for (const t of TYPE) { makeTextStyle('EN/' + t[0], t[1]); makeTextStyle('AR/' + t[0], t[2]) }

// ── 5. Effect styles ─────────────────────────────────────────────────────────

for (const k of Object.keys(SHADOWS)) {
  const s = figma.createEffectStyle()
  s.name = `Bloom/Shadow/${k}`
  s.effects = SHADOWS[k].map((l: any) => ({
    type: 'DROP_SHADOW', color: { ...rgb('#1F3D2B'), a: l.a }, offset: { x: 0, y: l.y },
    radius: l.blur, spread: 0, visible: true, blendMode: 'NORMAL',
  }))
  ES[k] = s
}

async function shadow(node: any, key: string) {
  if (node.setEffectStyleIdAsync) await node.setEffectStyleIdAsync(ES[key].id)
  else node.effectStyleId = ES[key].id
}

// ── 6. Documentation page ────────────────────────────────────────────────────

const root = frame({ name: 'Bloom Design System', gap: 96, pad: [80, 80, 80, 80], fill: 'bg/canvas', r: 32 })
root.resize(1440, 100)
root.counterAxisSizingMode = 'FIXED'
root.primaryAxisSizingMode = 'AUTO'
root.setExplicitVariableModeForCollection(colorCol, LIGHT)

async function section(title: string, desc?: string) {
  const s = frame({ name: title, gap: 32 })
  add(root, s); fillW(s)
  const head = frame({ name: 'Heading', gap: 8 })
  add(s, head); fillW(head)
  add(head, await txt(title, 'EN/H2', 'text/primary'))
  if (desc) { const d = await txt(desc, 'EN/Body', 'text/secondary'); add(head, d); fillW(d) }
  return s
}

async function group(parent: any, title: string) {
  const g = frame({ name: title, gap: 16 })
  add(parent, g); fillW(g)
  add(g, await txt(title, 'EN/H4', 'text/primary'))
  return g
}

function wrapRow(parent: any, gapPx = 24) {
  const r = frame({ dir: 'HORIZONTAL', gap: gapPx })
  add(parent, r); fillW(r)
  r.layoutWrap = 'WRAP'
  r.counterAxisSpacing = gapPx
  return r
}

// Header
{
  const hero = frame({ name: 'Header', gap: 16, pad: [64, 64, 64, 64], fill: 'bg/brand-deep', r: 24 })
  add(root, hero); fillW(hero)
  add(hero,
    await txt('DESIGN SYSTEM  ·  v1.0', 'EN/Overline', 'accent/blush'),
    await txt('Bloom', 'EN/Display', 'text/on-brand-deep'),
  )
  const sub = await txt('Beauty & fashion for women 18–35 in Saudi Arabia. English + Arabic, light + dark, mobile-first.', 'EN/Body L', 'text/on-brand-deep')
  add(hero, sub); fillW(sub)
}

// Colors
{
  const s = await section('Colors', 'Every color is a variable with a Light and a Dark value. Each swatch shows Light (left) and Dark (right). In CSS: var(--color-group-name).')
  const groups: any = {}
  for (const c of COLORS) {
    const key = c[0].split('/')[0]
    if (!groups[key]) groups[key] = []
    groups[key].push(c)
  }
  for (const g of Object.keys(groups)) {
    const grp = await group(s, g)
    const row = wrapRow(grp)
    for (const [name, light, dark] of groups[g]) {
      const card = frame({ name, gap: 12, pad: [12, 12, 12, 12], fill: 'bg/surface', r: 16 })
      strokeVar(card, 'border/default')
      const pair = frame({ name: 'Swatch', dir: 'HORIZONTAL', r: 10 })
      pair.clipsContent = true
      strokeVar(pair, 'border/default')
      for (const [mode, id, hex] of [['Light', LIGHT, light], ['Dark', DARK, dark]]) {
        const box = figma.createFrame()
        box.name = mode
        box.resize(96, 64)
        if (id) { box.fills = [paint(name)]; box.setExplicitVariableModeForCollection(colorCol, id) }
        else box.fills = [{ type: 'SOLID', color: rgb(hex) }]
        add(pair, box)
      }
      add(card, pair, await txt(name, 'EN/Label', 'text/primary'), await txt(`${light}  ·  ${dark}`, 'EN/Caption', 'text/secondary'))
      add(row, card)
    }
  }
}

// Typography
{
  const s = await section('Typography', 'Headings: Playfair Display (EN) / IBM Plex Sans Arabic SemiBold (AR). Body: Inter (EN) / IBM Plex Sans Arabic (AR). Arabic sizes are slightly smaller with taller line heights.')
  const cols = frame({ name: 'Columns', dir: 'HORIZONTAL', gap: 64 })
  add(s, cols); fillW(cols)
  for (const lang of ['EN', 'AR']) {
    const col = frame({ name: lang, gap: 28, pad: [32, 32, 32, 32], fill: 'bg/surface', r: 24 })
    add(cols, col); fillW(col)
    add(col, await txt(lang === 'EN' ? 'English' : 'Arabic — العربية', 'EN/Overline', 'brand/primary'))
    for (const t of TYPE) {
      const def = lang === 'EN' ? t[1] : t[2]
      const row = frame({ name: t[0], gap: 4 })
      add(col, row); fillW(row)
      const meta = await txt(`${t[0]} — ${def[0].family} ${def[0].style} · ${def[1]}/${def[2]}`, 'EN/Caption', 'text/muted', { align: lang === 'AR' ? 'RIGHT' : 'LEFT' })
      const sample = await txt(lang === 'EN' ? t[3] : t[4], `${lang}/${t[0]}`, 'text/primary', { align: lang === 'AR' ? 'RIGHT' : 'LEFT' })
      add(row, meta, sample); fillW(meta, sample)
    }
  }
}

// Spacing, radius, shadows
{
  const s = await section('Spacing, Radius & Shadows', 'A 4px spacing scale, five corner radii and three shadow levels.')

  const sp = wrapRow(await group(s, 'Spacing'), 32)
  for (const k of Object.keys(SPACE)) {
    const item = frame({ name: `space/${k}`, gap: 8 })
    const bar = figma.createRectangle()
    bar.resize(SPACE[k], 24); bar.fills = [paint('accent/blush')]; bar.cornerRadius = 4
    add(item, bar, await txt(`space/${k}`, 'EN/Label', 'text/primary'), await txt(`${SPACE[k]}px`, 'EN/Caption', 'text/muted'))
    add(sp, item)
  }

  const rd = wrapRow(await group(s, 'Radius'), 32)
  for (const k of Object.keys(RADII)) {
    const item = frame({ name: `radius/${k}`, gap: 8 })
    const sq = figma.createFrame()
    sq.resize(80, 80); sq.fills = [paint('brand/primary-subtle')]; strokeVar(sq, 'brand/primary', 1.5); radius(sq, k)
    add(item, sq, await txt(`radius/${k}`, 'EN/Label', 'text/primary'), await txt(`${RADII[k]}px`, 'EN/Caption', 'text/muted'))
    add(rd, item)
  }

  const sh = wrapRow(await group(s, 'Shadows'), 40)
  for (const k of Object.keys(SHADOWS)) {
    const card = frame({ name: `Shadow/${k}`, gap: 4, pad: [24, 24, 24, 24], fill: 'bg/surface', r: 16 })
    card.resize(200, 120); card.primaryAxisSizingMode = 'FIXED'; card.counterAxisSizingMode = 'FIXED'
    await shadow(card, k)
    add(card, await txt(`Shadow/${k}`, 'EN/Label', 'text/primary'), await txt(k === 'sm' ? 'Cards' : k === 'md' ? 'Dropdowns, hover' : 'Modals, drawers', 'EN/Caption', 'text/muted'))
    add(sh, card)
  }
}

// ── 7. Components ────────────────────────────────────────────────────────────

const C: any = {} // components by key

const compSection = await section('Components', 'Built with auto layout, bound to the color, spacing and radius variables, so they switch themes automatically.')

// Button
{
  const TYPES: any = {
    Primary:   { bg: 'brand/primary', fg: 'text/on-primary' },
    Secondary: { bg: 'accent/blush',  fg: 'text/on-accent' },
    Outline:   { bg: null,            fg: 'brand/primary', stroke: 'brand/primary' },
    Ghost:     { bg: null,            fg: 'brand/primary' },
  }
  const SIZES: any = {
    Medium: { py: '3', px: '6', style: 'EN/Button',   icon: 18, label: 'Shop Now' },
    Small:  { py: '2', px: '4', style: 'EN/Button S', icon: 16, label: 'Add to Cart' },
  }
  const list = []
  for (const size of Object.keys(SIZES)) for (const type of Object.keys(TYPES)) {
    const t = TYPES[type], z = SIZES[size]
    const c = comp({ name: `Type=${type}, Size=${size}`, dir: 'HORIZONTAL', cross: 'CENTER', fill: t.bg })
    pad(c, z.py, z.px); gap(c, '2'); radius(c, 'md')
    if (t.stroke) strokeVar(c, t.stroke, 1.5)
    add(c, await txt(z.label, z.style, t.fg, { name: 'Label' }), icon('arrow', t.fg, z.icon))
    C[`Button/${type}/${size}`] = c
    list.push(c)
  }
  const set = figma.combineAsVariants(list, await group(compSection, 'Button'))
  set.name = 'Button'
  grid(set, 4)
}

// Badge
{
  const TYPES: any = {
    Sale: { bg: 'sale/badge',          fg: 'text/on-sale',    label: '-20%' },
    New:  { bg: 'brand/primary',       fg: 'text/on-primary', label: 'New' },
    Soft: { bg: 'accent/blush-subtle', fg: 'brand/primary',   label: 'Bestseller' },
  }
  const list = []
  for (const type of Object.keys(TYPES)) {
    const t = TYPES[type]
    const c = comp({ name: `Type=${type}`, dir: 'HORIZONTAL', cross: 'CENTER', fill: t.bg })
    pad(c, '1', '2'); radius(c, 'sm')
    add(c, await txt(t.label, 'EN/Badge', t.fg, { name: 'Badge Label' }))
    C[`Badge/${type}`] = c
    list.push(c)
  }
  const set = figma.combineAsVariants(list, await group(compSection, 'Badge'))
  set.name = 'Badge'
  grid(set, 3)
}

// Icon Button
{
  const TYPES: any = {
    Primary: { bg: 'brand/primary',        fg: 'text/on-primary' },
    Soft:    { bg: 'brand/primary-subtle', fg: 'brand/primary' },
    Surface: { bg: 'bg/surface',           fg: 'text/primary', shadow: 'sm' },
  }
  const list = []
  for (const ic of ['Cart', 'Heart']) for (const type of Object.keys(TYPES)) {
    const t = TYPES[type]
    const c = comp({ name: `Type=${type}, Icon=${ic}`, dir: 'HORIZONTAL', main: 'CENTER', cross: 'CENTER', fill: t.bg })
    radius(c, ic === 'Heart' ? 'full' : 'md')
    add(c, icon(ic.toLowerCase(), t.fg, 18))
    c.resize(36, 36)
    c.primaryAxisSizingMode = 'FIXED'; c.counterAxisSizingMode = 'FIXED'
    if (t.shadow) await shadow(c, t.shadow)
    C[`IconButton/${type}/${ic}`] = c
    list.push(c)
  }
  const set = figma.combineAsVariants(list, await group(compSection, 'Icon Button'))
  set.name = 'Icon Button'
  grid(set, 3)
}

// Input
{
  const list = []
  for (const state of ['Default', 'Focus']) {
    const c = comp({ name: `State=${state}`, dir: 'HORIZONTAL', cross: 'CENTER', fill: 'bg/surface' })
    pad(c, '3', '4'); gap(c, '2'); radius(c, 'md')
    strokeVar(c, state === 'Focus' ? 'brand/primary' : 'border/default', state === 'Focus' ? 2 : 1)
    const label = state === 'Focus'
      ? await txt('Rose serum', 'EN/Body S', 'text/primary', { name: 'Value' })
      : await txt('Search products, brands…', 'EN/Body S', 'text/muted', { name: 'Value' })
    add(c, icon('search', 'text/muted', 18), label)
    label.layoutGrow = 1
    c.resize(320, c.height)
    c.primaryAxisSizingMode = 'FIXED'
    C[`Input/${state}`] = c
    list.push(c)
  }
  const set = figma.combineAsVariants(list, await group(compSection, 'Input'))
  set.name = 'Input'
  grid(set, 2)
}

// Category Chip
{
  const TINTS: any = { Blush: 'Skincare', Sage: 'Makeup', Sand: 'Dresses', Sky: 'Bags', Lilac: 'Fragrance' }
  const list = []
  for (const tint of Object.keys(TINTS)) {
    const c = comp({ name: `Tint=${tint}`, cross: 'CENTER' })
    gap(c, '2')
    const circle = frame({ name: 'Circle', dir: 'HORIZONTAL', main: 'CENTER', cross: 'CENTER', fill: `tint/${tint.toLowerCase()}` })
    add(circle, icon('flower', 'brand/primary', 28))
    circle.resize(72, 72); circle.primaryAxisSizingMode = 'FIXED'; circle.counterAxisSizingMode = 'FIXED'
    radius(circle, 'full')
    add(c, circle, await txt(TINTS[tint], 'EN/Label', 'text/primary', { name: 'Label' }))
    C[`Category/${tint}`] = c
    list.push(c)
  }
  const set = figma.combineAsVariants(list, await group(compSection, 'Category Chip'))
  set.name = 'Category Chip'
  grid(set, 5)
}

// Product Card
{
  const g = await group(compSection, 'Product Card')
  const card = comp({ name: 'Product Card', fill: 'bg/surface' })
  pad(card, '3', '3'); gap(card, '3'); radius(card, 'lg')
  strokeVar(card, 'border/default')
  await shadow(card, 'sm')
  card.resize(232, 100)
  card.counterAxisSizingMode = 'FIXED'; card.primaryAxisSizingMode = 'AUTO'

  const img = frame({ name: 'Image', dir: 'HORIZONTAL', main: 'CENTER', cross: 'CENTER', fill: 'bg/muted' })
  radius(img, 'md')
  add(card, img); fillW(img)
  img.layoutSizingVertical = 'FIXED'
  img.resize(img.width, 208)
  add(img, icon('flower', 'text/muted', 48))
  const badge = C['Badge/Sale'].createInstance()
  add(img, badge)
  badge.layoutPositioning = 'ABSOLUTE'; badge.x = 10; badge.y = 10
  const wish = C['IconButton/Surface/Heart'].createInstance()
  add(img, wish)
  wish.layoutPositioning = 'ABSOLUTE'; wish.x = img.width - 46; wish.y = 10
  wish.constraints = { horizontal: 'MAX', vertical: 'MIN' }

  const info = frame({ name: 'Info', gap: 4 })
  add(card, info); fillW(info)
  const cat = await txt('Skincare', 'EN/Caption', 'text/muted', { name: 'Category' })
  const title = await txt('Hydrating Rose Serum', 'EN/Label', 'text/primary', { name: 'Title' })
  add(info, cat, title); fillW(cat, title)
  const rating = frame({ name: 'Rating', dir: 'HORIZONTAL', gap: 4, cross: 'CENTER' })
  const stars = frame({ name: 'Stars', dir: 'HORIZONTAL', gap: 2 })
  for (let i = 0; i < 5; i++) add(stars, icon('star', 'rating/star', 12))
  add(rating, stars, await txt('(1,234)', 'EN/Caption', 'text/muted', { name: 'Reviews' }))
  add(info, rating)

  const priceRow = frame({ name: 'Price Row', dir: 'HORIZONTAL', main: 'SPACE_BETWEEN', cross: 'CENTER' })
  add(card, priceRow); fillW(priceRow)
  const prices = frame({ name: 'Prices', gap: 0 })
  add(prices, await txt('SAR 89', 'EN/Price', 'sale/price', { name: 'Price' }), await txt('SAR 119', 'EN/Caption', 'sale/old-price', { name: 'Old Price', strike: true }))
  add(priceRow, prices, C['IconButton/Primary/Cart'].createInstance())

  add(g, card)
  C['ProductCard'] = card
}

// ── 8. Theme previews ────────────────────────────────────────────────────────

const PRODUCTS = [
  ['Hydrating Rose Serum',  'Skincare', 'SAR 89',  'SAR 119', '-25%'],
  ['Linen Wrap Dress',      'Dresses',  'SAR 249', 'SAR 299', '-15%'],
  ['Velvet Matte Lipstick', 'Makeup',   'SAR 59',  'SAR 79',  '-25%'],
  ['Mini Leather Tote',     'Bags',     'SAR 189', 'SAR 239', '-20%'],
]

function setText(inst: any, name: string, value: string) {
  const n = inst.findOne((x: any) => x.type === 'TEXT' && x.name === name)
  if (n) n.characters = value
}

async function preview(parent: any, label: string, modeId: any) {
  const p = frame({ name: `${label} theme`, gap: 32, pad: [40, 40, 40, 40], fill: 'bg/canvas', r: 24 })
  add(parent, p); fillW(p)
  strokeVar(p, 'border/default')
  p.setExplicitVariableModeForCollection(colorCol, modeId)

  add(p, await txt(`${label} theme`, 'EN/H3', 'text/primary'))

  const controls = frame({ name: 'Controls', dir: 'HORIZONTAL', gap: 16, cross: 'CENTER' })
  add(p, controls)
  for (const t of ['Primary', 'Secondary', 'Outline', 'Ghost']) add(controls, C[`Button/${t}/Medium`].createInstance())
  for (const t of ['Sale', 'New', 'Soft']) add(controls, C[`Badge/${t}`].createInstance())
  add(controls, C['Input/Default'].createInstance())

  const cats = frame({ name: 'Categories', dir: 'HORIZONTAL', gap: 32 })
  add(p, cats)
  for (const t of ['Blush', 'Sage', 'Sand', 'Sky', 'Lilac']) add(cats, C[`Category/${t}`].createInstance())

  const products = frame({ name: 'Products', dir: 'HORIZONTAL', gap: 24 })
  add(p, products)
  for (const [title, cat, price, old, off] of PRODUCTS) {
    const inst = C['ProductCard'].createInstance()
    add(products, inst)
    setText(inst, 'Title', title); setText(inst, 'Category', cat)
    setText(inst, 'Price', price); setText(inst, 'Old Price', old); setText(inst, 'Badge Label', off)
  }

  const banner = frame({ name: 'Banner', gap: 8, pad: [32, 32, 32, 32], fill: 'bg/brand-deep', r: 24 })
  add(p, banner); fillW(banner)
  const arH = await txt('اشتركي في نشرتنا', 'AR/H2', 'text/on-brand-deep', { align: 'RIGHT' })
  const arB = await txt('احصلي على عروض حصرية ووصول مبكر لأحدث المنتجات.', 'AR/Body', 'text/on-brand-deep', { align: 'RIGHT' })
  add(banner, arH, arB); fillW(arH, arB)
}

{
  const s = await section('Theme Preview', 'The same component instances rendered in each mode of the "Bloom / Color" collection.')
  await preview(s, 'Light', LIGHT)
  if (DARK) await preview(s, 'Dark', DARK)
}

// ── Done ─────────────────────────────────────────────────────────────────────

root.x = 0; root.y = 0
figma.viewport.scrollAndZoomIntoView([root])
figma.notify('🌸 Bloom design system created')
log(`✅ Bloom design system created
   ${COLORS.length} color variables (${DARK ? 'Light + Dark' : 'Light only'})
   ${Object.keys(SPACE).length + Object.keys(RADII).length} number variables
   ${TYPE.length * 2} text styles, ${Object.keys(SHADOWS).length} effect styles
   Components: Button, Badge, Icon Button, Input, Category Chip, Product Card`)
