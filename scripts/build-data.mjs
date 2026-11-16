// Builds the JLPT kanji (N5–N3), vocabulary and artwork data used by the app.
// Run with: node scripts/build-data.mjs   (needs network; outputs are committed)
//
// Sources (all free, open licences):
//   kanji-data (MIT, from KANJIDIC © EDRDG, CC BY-SA)   https://github.com/davidluzgouveia/kanji-data
//   open-anki-jlpt-decks (MIT, from Jonathan Waller's JLPT lists, CC BY)  https://github.com/jamsinclair/open-anki-jlpt-decks
//   KanjiVG r20260714 (CC BY-SA 3.0)                    https://kanjivg.tagaini.net
//   OpenMoji 15.1.0 line-art "black" set (CC BY-SA 4.0) https://openmoji.org
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..')
const out = (p) => path.join(root, p)
const get = async (url, type = 'text') => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(url)
      if (r.ok) return type === 'json' ? r.json() : r.text()
      if (r.status === 404) return null
    } catch {}
  }
  return null
}
async function pool(items, n, fn) {
  const res = []
  let i = 0
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; res[k] = await fn(items[k]) } }))
  return res
}

// ---------- sources ----------
const KD = await get('https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json', 'json')
const CSV = {}
for (const l of ['n5', 'n4', 'n3']) CSV[l] = await get(`https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/${l}.csv`)
const OM = await get('https://cdn.jsdelivr.net/npm/openmoji@15.1.0/data/openmoji.json', 'json')

// ---------- vocabulary ----------
function parseCsv(text) {
  const rows = []
  let row = [], cur = '', q = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cur += '"'; i++ } else if (ch === '"') q = false
      else cur += ch
    } else if (ch === '"') q = true
    else if (ch === ',') { row.push(cur); cur = '' }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = '' }
    else cur += ch
  }
  if (cur || row.length) { row.push(cur); rows.push(row) }
  return rows.slice(1).filter((r) => r[0])
}

// ---------- artwork matching (OpenMoji line art) ----------
const SKIP_GROUPS = new Set(['flags', 'symbols', 'extras-unicode', 'component', 'extras-openmoji'])
const TAG_GROUPS = new Set(['animals-nature', 'food-drink', 'travel-places', 'objects', 'activities'])
const byAnno = new Map()
const byTag = new Map()
for (const e of OM) {
  if (e.skintone || SKIP_GROUPS.has(e.group) || e.hexcode.includes('-200D-')) continue
  const a = e.annotation.toLowerCase()
  if (!byAnno.has(a)) byAnno.set(a, e.hexcode)
  if (TAG_GROUPS.has(e.group)) for (const t of `${e.tags}`.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)) if (!byTag.has(t)) byTag.set(t, e.hexcode)
}
const STOP = new Set(['to', 'a', 'an', 'the', 'be', 'one', 'some', 'etc', 'of', 'in', 'on', 'at', 'is', 'do'])
function pictureFor(meaning) {
  // Verbs and adjectives rarely have a clear picture; only nouns get one.
  if (/^to /i.test(meaning.trim())) return ''
  const senses = meaning.toLowerCase().replace(/\([^)]*\)/g, '').split(/[,;/]/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
  for (const s of senses) {
    const clean = s.replace(/^(to|a|an|the) /, '').trim()
    if (byAnno.has(clean)) return byAnno.get(clean)
  }
  for (const s of senses) {
    const words = s.replace(/^(to|a|an|the) /, '').split(/\s+/).filter((w) => w.length >= 3 && !STOP.has(w))
    if (words.length === 1 && s.split(/s+/).length <= 2 && byAnno.has(words[0])) return byAnno.get(words[0])
  }
  const first = senses[0]?.replace(/^(a|an|the) /, '')
  if (first && /^[a-z]{3,}$/.test(first) && byTag.has(first)) return byTag.get(first)
  return ''
}
const hexOfEmoji = new Map(OM.map((e) => [e.emoji.replace(/️/g, ''), e.hexcode]))

// Reviewed by hand: pictures that would mislead are removed ('') or replaced.
const OVERRIDE = {
  青: '', 青い: '', 一: '', 二: '', 三: '', 五: '', 六: '', 七: '', 八: '', 九: '', 十: '', 顔: '', 風邪: '', 小さい: '', 小さな: '', 細かい: '', 小: '',
  つまらない: '', だめ: '', 箱: '1F4E6', 話: '', 店: '', 漫画: '', 点: '', 印: '', 目標: '', お祭り: '', 祭: '', 間: '', 間隔: '', 文化: '',
  字: '', 文字: '', 芝居: '', 順番: '', 人生: '', 生命: '', 命: '', 墨: '', インク: '', セット: '', 円: '', 丸: '', 応援: '', お辞儀: '',
  カード: '', 名刺: '', 器械: '', 管: '', パイプ: '', 魅力: '', 面: '', 衣料: '', 癌: '', 中止: '', 頂上: '', トップ: '', 釣: '', 鉄: '', 党: '',
  隊: '', 野: '', 畑: '', 原: '', 分野: '', 秒: '', ボール: '', 並: '', 単位: '', 弾: '', 浅い: '', 一杯: '', たっぷり: '', 毛: '', 髪: '',
  髪の毛: '', まず: '', 鳴る: '', 鳴らす: '', 結ぶ: '', 取り上げる: '', 摘む: '', 局: '',
  車: '1F697', カー: '1F697', 手: '270B', 水: '1F4A7', 熱: '1F321', 心: '2764', 心臓: '2764', 愛: '2764', 愛情: '2764', 恋: '2764', 光: '1F4A1',
  灯: '1F4A1', ケーキ: '1F370', 植物: '1FAB4', 泡: '1FAE7', 渦: '1F300', 翼: '1FABD', トラック: '1F69A', ビール: '1F37A', 包装: '1F4E6',
  飲み物: '1F964', 手袋: '1F9E4', 道具: '1F9F0', 葉: '1F343', 月: '1F319',
}
const vocab = {}
const allWords = []
for (const l of ['n5', 'n4', 'n3']) {
  const seen = new Set()
  vocab[l] = parseCsv(CSV[l])
    .map(([w, r, m]) => [w.trim(), r.trim(), m.trim().replace(/\s+/g, ' ')])
    .filter(([w, r, m]) => w && r && m && !seen.has(w + r) && seen.add(w + r))
    .map(([w, r, m]) => [w, r, m, w in OVERRIDE ? OVERRIDE[w] : pictureFor(m)])
  allWords.push(...vocab[l].map((v) => [...v, l]))
}

// ---------- kanji N5–N3 ----------
const LEVEL = { 5: 'n5', 4: 'n4', 3: 'n3' }
const kanjiList = Object.entries(KD)
  .filter(([, v]) => v.jlpt_new >= 3 && v.jlpt_new <= 5)
  .sort((a, b) => b[1].jlpt_new - a[1].jlpt_new || (a[1].freq ?? 9999) - (b[1].freq ?? 9999))

const RADICAL = {
  '亻': 'person', '氵': 'water', '扌': 'hand', '忄': 'heart', '艹': 'grass', '宀': 'roof', '辶': 'road', '冖': 'cover', '囗': 'enclosure',
  '广': 'shelter', '疒': 'sickness', '礻': 'altar', '衤': 'clothes', '糸': 'thread', '阝': 'village', '刂': 'knife', '灬': 'fire', '罒': 'net',
  '癶': 'feet', '夂': 'walking legs', '彳': 'step', '廴': 'stride', '尸': 'flag', '冫': 'ice', '丷': 'horns', '⺌': 'small', '亠': 'lid',
  '儿': 'legs', '卩': 'seal', '厶': 'private', '匕': 'spoon', '勹': 'wrap', '几': 'table', '凵': 'container', '匚': 'box', '卜': 'fortune',
  '丶': 'dot', '丿': 'slash', '丨': 'line', '乙': 'hook', '亅': 'hook', '爫': 'claw', '耂': 'old', '⺮': 'bamboo', '𧾷': 'foot', '飠': 'food',
  '牜': 'cow', '犭': 'dog', '王': 'king', '攵': 'strike', '殳': 'weapon', '隹': 'bird', '頁': 'head', '彡': 'hair', '欠': 'yawn', '斤': 'axe',
  '戈': 'spear', '酉': 'sake jar', '豕': 'pig', '貝': 'shell', '门': 'gate', '𠂉': 'hat', '龷': 'sprout', '业': 'business', '疋': 'leg',
  '⺍': 'small', '罓': 'net', '䒑': 'grass', '𠃊': 'hook', '乚': 'hook', '𠂇': 'hand', '彐': 'snout', '肀': 'brush', '聿': 'brush', '冂': 'frame',
  '一': 'one', '十': 'ten', '口': 'mouth', '日': 'sun', '月': 'moon', '木': 'tree', '人': 'person', '大': 'big', '小': 'small', '土': 'earth',
}
const svgCache = {}
async function kanjiSvg(c) {
  const f = c.codePointAt(0).toString(16).padStart(5, '0') + '.svg'
  svgCache[c] ??= await get(`https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@r20260714/kanji/${f}`)
  return svgCache[c]
}
function parse(svg, c) {
  const hex = c.codePointAt(0).toString(16).padStart(5, '0')
  const strokes = [...svg.matchAll(/<path id="kvg:[0-9a-f]+-s\d+"[^>]*?\sd="([^"]+)"/g)].map((m) => m[1])
  // top-level parts: groups whose parent is the root group
  const parts = []
  const stack = []
  for (const m of svg.matchAll(/<g\b([^>]*)>|<\/g>/g)) {
    if (m[0] === '</g>') { stack.pop(); continue }
    const attrs = m[1]
    const id = attrs.match(/id="([^"]+)"/)?.[1] ?? ''
    if (stack.length && stack[stack.length - 1] === `kvg:${hex}`) {
      const el = attrs.match(/kvg:element="([^"]+)"/)?.[1]
      const orig = attrs.match(/kvg:original="([^"]+)"/)?.[1]
      if (el) parts.push([el, orig ?? el])
    }
    stack.push(id)
  }
  return { strokes, parts }
}
const meaningOf = (ch) => RADICAL[ch] ?? (KD[ch]?.meanings?.[0] ? KD[ch].meanings[0].toLowerCase() : null)
const toKata = (s) => s.replace(/[ぁ-ゖ]/g, (x) => String.fromCharCode(x.charCodeAt(0) + 0x60))

const KANJI_OVERRIDE = {
  一: '', 二: '', 三: '', 五: '', 六: '', 七: '', 八: '', 九: '', 十: '', 大: '', 生: '', 円: '', 男: '1F468', 公: '', 空: '', 店: '', 秋: '1F341',
  洋: '1F30A', 服: '1F455', 現: '', 産: '', 解: '', 面: '', 放: '', 球: '', 番: '', 望: '', 満: '', 精: '', 静: '', 捕: '', 舞: '', 顔: '',
  列: '', 心: '2764', 愛: '2764', 具: '1F9F0', 箱: '1F4E6', 水: '1F4A7', 車: '1F697', 手: '270B', 葉: '1F343', 杯: '', 飛: '2708',
}
const kanjiOut = []
const strokesOut = {}
await pool(kanjiList, 12, async ([c, v]) => {
  const svg = await kanjiSvg(c)
  const { strokes, parts } = svg ? parse(svg, c) : { strokes: [], parts: [] }
  if (strokes.length) strokesOut[c] = strokes
  const examples = allWords
    .filter(([w]) => w.includes(c) && w.length <= 4)
    .sort((a, b) => a[0].length - b[0].length || a[4].localeCompare(b[4], 'en', { numeric: true }) * -1)
    .slice(0, 3)
    .map(([w, r, m]) => ({ w, r, m: m.split(/[,;]/).slice(0, 2).join(',').trim() }))
  const named = parts.map(([el, orig]) => [el, meaningOf(orig) ?? meaningOf(el)]).filter(([, m]) => m)
  const meanings = v.meanings.map((m) => m.toLowerCase()).filter((m) => !m.includes('kokuji'))
  kanjiOut.push({
    c,
    l: LEVEL[v.jlpt_new],
    m: meanings.slice(0, 3).join(', '),
    on: v.readings_on.map(toKata),
    kun: v.readings_kun.map((k) => k.replace('.', '(') + (k.includes('.') ? ')' : '')).filter((k) => !k.startsWith('-')),
    parts: named,
    ex: examples,
    p: c in KANJI_OVERRIDE ? KANJI_OVERRIDE[c] : pictureFor(meanings.join(', ')),
    n: strokes.length,
  })
})
const order = new Map(kanjiList.map(([c], i) => [c, i]))
kanjiOut.sort((a, b) => order.get(a.c) - order.get(b.c))

// ---------- artwork files ----------
const kanaPics = fs.readFileSync(out('src/data/pictures.ts'), 'utf8')
const pictureHex = {}
for (const m of kanaPics.matchAll(/'(.)': '([^']+)'/g)) {
  const hex = hexOfEmoji.get(m[2].replace(/️/g, ''))
  if (hex) pictureHex[m[1]] = hex
}
const hexes = new Set([...Object.values(pictureHex), ...kanjiOut.map((k) => k.p), ...Object.values(vocab).flat().map((v) => v[3])].filter(Boolean))
fs.mkdirSync(out('public/art'), { recursive: true })
let saved = 0
await pool([...hexes], 16, async (hex) => {
  const file = out(`public/art/${hex}.svg`)
  if (fs.existsSync(file)) return saved++
  const svg = await get(`https://cdn.jsdelivr.net/npm/openmoji@15.1.0/black/svg/${hex}.svg`)
  if (svg && svg.length < 60000 && !/<script|on\w+=|href=/i.test(svg)) { fs.writeFileSync(file, svg); saved++ }
})
const available = new Set(fs.readdirSync(out('public/art')).map((f) => f.replace('.svg', '')))
const keep = (h) => (available.has(h) ? h : '')

// ---------- write ----------
fs.mkdirSync(out('src/data/jlpt'), { recursive: true })
fs.writeFileSync(out('src/data/jlpt/kanji.json'), JSON.stringify(kanjiOut.map((k) => ({ ...k, p: keep(k.p) }))))
for (const l of ['n5', 'n4', 'n3']) fs.writeFileSync(out(`src/data/jlpt/vocab-${l}.json`), JSON.stringify(vocab[l].map((v) => [v[0], v[1], v[2], keep(v[3])])))
fs.writeFileSync(out('src/data/jlpt/kanji-strokes.json'), JSON.stringify(strokesOut))
fs.writeFileSync(out('src/data/art.json'), JSON.stringify(Object.fromEntries(Object.entries(pictureHex).filter(([, h]) => available.has(h)))))

const withPic = Object.values(vocab).flat().filter((v) => keep(v[3])).length
console.log(`kanji ${kanjiOut.length} (n5 ${kanjiOut.filter((k) => k.l === 'n5').length}, n4 ${kanjiOut.filter((k) => k.l === 'n4').length}, n3 ${kanjiOut.filter((k) => k.l === 'n3').length}), strokes ${Object.keys(strokesOut).length}`)
console.log(`vocab n5 ${vocab.n5.length}, n4 ${vocab.n4.length}, n3 ${vocab.n3.length}; with picture ${withPic}`)
console.log(`artwork files ${saved}; kanji with picture ${kanjiOut.filter((k) => keep(k.p)).length}`)
