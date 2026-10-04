// ─────────────────────────────────────────────────────────────────────────────
//  Bloom — Read screens
//  Run in Figma with the "Scripter" plugin. It writes a compact outline of the
//  screens (layers, layout, sizes, text, color variables, text styles,
//  component instances) so the changes can be reviewed outside Figma.
//
//  Output goes to two places:
//    1. Scripter's output panel (print)
//    2. A text layer on the page "Bloom — Export". Select it, double-click to
//       edit, Ctrl+A, Ctrl+C, then paste into a file.
// ─────────────────────────────────────────────────────────────────────────────

// Pages to read. Add 'Bloom — Design System' if you changed components there.
const PAGES = ['Bloom — Home']
// Dark frames are copies of the light ones; skip them unless you edited them.
const INCLUDE_DARK = false

const F: any = figma
const log = (...a: any[]) => { try { (print as any)(...a) } catch (e) { console.log(...a) } }

const varNames: any = {}
async function varName(id: string) {
  if (!(id in varNames)) {
    const v = await F.variables.getVariableByIdAsync(id)
    varNames[id] = v ? v.name : '?'
  }
  return varNames[id]
}

const styleNames: any = {}
async function styleName(id: any) {
  if (!id || typeof id !== 'string') return null
  if (!(id in styleNames)) {
    const s = await F.getStyleByIdAsync(id)
    styleNames[id] = s ? s.name.replace(/^Bloom\//, '') : '?'
  }
  return styleNames[id]
}

function hex(c: any) {
  const h = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0')
  return '#' + h(c.r) + h(c.g) + h(c.b)
}

async function paints(list: any) {
  if (typeof list === 'symbol') return 'mixed'
  if (!list || !list.length) return null
  const out = []
  for (const p of list) {
    if (p.visible === false) continue
    if (p.type === 'SOLID') {
      const b = p.boundVariables && p.boundVariables.color
      let s = b ? await varName(b.id) : hex(p.color)
      if (p.opacity !== undefined && p.opacity < 1) s += `@${Math.round(p.opacity * 100)}%`
      out.push(s)
    } else if (p.type === 'IMAGE') out.push('image')
    else out.push(p.type.toLowerCase())
  }
  return out.length ? out.join('+') : null
}

async function bound(node: any, field: string) {
  const b = node.boundVariables && node.boundVariables[field]
  return b ? await varName(b.id) : null
}

const r = (n: number) => Math.round(n)

async function layout(node: any) {
  if (!node.layoutMode || node.layoutMode === 'NONE') return ''
  const parts = [node.layoutMode === 'HORIZONTAL' ? 'H' : 'V']
  const gapVar = await bound(node, 'itemSpacing')
  parts.push(`gap=${gapVar || r(node.itemSpacing)}`)
  const pads = [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map(r)
  if (pads.some((p: number) => p)) parts.push(`pad=${pads.join('/')}`)
  if (node.primaryAxisAlignItems !== 'MIN') parts.push(`main=${node.primaryAxisAlignItems.toLowerCase()}`)
  if (node.counterAxisAlignItems !== 'MIN') parts.push(`cross=${node.counterAxisAlignItems.toLowerCase()}`)
  if (node.layoutWrap === 'WRAP') parts.push('wrap')
  return '[' + parts.join(' ') + ']'
}

function sizing(node: any) {
  const s = []
  if (node.layoutSizingHorizontal && node.layoutSizingHorizontal !== 'FIXED') s.push('w:' + node.layoutSizingHorizontal.toLowerCase())
  if (node.layoutSizingVertical && node.layoutSizingVertical !== 'FIXED') s.push('h:' + node.layoutSizingVertical.toLowerCase())
  if (node.layoutPositioning === 'ABSOLUTE') s.push(`abs@${r(node.x)},${r(node.y)}`)
  return s.join(' ')
}

async function componentKey(instance: any) {
  const main = instance.getMainComponentAsync ? await instance.getMainComponentAsync() : instance.mainComponent
  if (!main) return '?'
  return main.parent && main.parent.type === 'COMPONENT_SET' ? `${main.parent.name}/${main.name}` : main.name
}

function oneLine(s: string, max = 120) {
  const t = s.replace(/\s+/g, ' ')
  return t.length > max ? t.slice(0, max) + '…' : t
}

const lines: string[] = []

async function walk(node: any, depth: number) {
  const pad = '  '.repeat(depth)
  const hidden = node.visible === false ? ' (hidden)' : ''

  // Icons: one line, no children
  if (node.name.indexOf('Icon/') === 0) {
    const v = node.findOne ? node.findOne((x: any) => x.type === 'VECTOR' || x.type === 'ELLIPSE' || x.type === 'POLYGON' || x.type === 'LINE' || x.type === 'RECTANGLE') : null
    const color = v ? (await paints(v.strokes)) || (await paints(v.fills)) : null
    lines.push(`${pad}icon ${node.name.slice(5)} ${r(node.width)}${color ? ' ' + color : ''}${hidden}`)
    return
  }

  if (node.type === 'TEXT') {
    const st = await styleName(node.textStyleId)
    const color = await paints(node.fills)
    const extra = []
    if (st) extra.push(st)
    else if (typeof node.fontSize === 'number') extra.push(`${node.fontName.family} ${node.fontName.style} ${node.fontSize}`)
    if (color) extra.push(color)
    if (node.textAlignHorizontal !== 'LEFT') extra.push('align=' + node.textAlignHorizontal.toLowerCase())
    if (node.opacity < 1) extra.push(`opacity=${Math.round(node.opacity * 100)}%`)
    const sz = sizing(node)
    lines.push(`${pad}text "${oneLine(node.characters)}" ${extra.join(' ')}${sz ? ' ' + sz : ''}${hidden}`)
    return
  }

  if (node.type === 'INSTANCE') {
    const key = await componentKey(node)
    const texts = node.findAll((x: any) => x.type === 'TEXT' && x.visible !== false).map((t: any) => `"${oneLine(t.characters, 40)}"`)
    const sz = sizing(node)
    lines.push(`${pad}instance ${key} "${node.name}" ${r(node.width)}×${r(node.height)}${sz ? ' ' + sz : ''}${texts.length ? ' texts=' + texts.join(',') : ''}${hidden}`)
    return
  }

  const parts = [`${pad}${node.type.toLowerCase()} "${node.name}" ${r(node.width)}×${r(node.height)}`]
  if ('layoutMode' in node) { const l = await layout(node); if (l) parts.push(l) }
  const sz = sizing(node)
  if (sz) parts.push(sz)
  if ('fills' in node) { const f = await paints(node.fills); if (f) parts.push('fill=' + f) }
  if ('strokes' in node && node.strokes.length) {
    const s = await paints(node.strokes)
    const w = typeof node.strokeWeight === 'number' ? node.strokeWeight : 'mixed'
    if (s) parts.push(`stroke=${s}/${w}`)
  }
  const rad = await bound(node, 'topLeftRadius')
  if (rad) parts.push('r=' + rad)
  else if (typeof node.cornerRadius === 'number' && node.cornerRadius) parts.push('r=' + node.cornerRadius)
  if (node.effectStyleId) { const e = await styleName(node.effectStyleId); if (e) parts.push('fx=' + e) }
  if (node.opacity !== undefined && node.opacity < 1) parts.push(`opacity=${Math.round(node.opacity * 100)}%`)
  if (node.clipsContent) parts.push('clip')
  lines.push(parts.join(' ') + hidden)

  if ('children' in node) for (const c of node.children) await walk(c, depth + 1)
}

for (const name of PAGES) {
  const page: any = figma.root.children.find((p: any) => p.name === name)
  if (!page) { lines.push(`## Page "${name}" not found`); continue }
  if (page.loadAsync) await page.loadAsync()
  lines.push(`## Page "${name}"`)
  for (const top of page.children) {
    if (!INCLUDE_DARK && /Dark$/.test(top.name)) { lines.push(`(skipped "${top.name}")`); continue }
    lines.push('')
    lines.push(`# ${top.name}`)
    await walk(top, 0)
  }
  lines.push('')
}

const output = lines.join('\n')
log(output)

// Also write the output to a text layer so it is easy to copy
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
let exportPage: any = figma.root.children.find((p: any) => p.name === 'Bloom — Export')
if (!exportPage) { exportPage = figma.createPage(); exportPage.name = 'Bloom — Export' }
if (exportPage.loadAsync) await exportPage.loadAsync()
for (const c of exportPage.children.slice()) c.remove()
const t = figma.createText()
t.fontName = { family: 'Inter', style: 'Regular' }
t.fontSize = 12
t.characters = output
t.name = 'Screens outline'
exportPage.appendChild(t)
figma.notify(`Outline ready: ${lines.length} lines (see Scripter output or the "Bloom — Export" page)`)
