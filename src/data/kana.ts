import type { Item, Script } from './types'

// [char, romaji, emoji, mnemonic]
type Row = [string, string, string, string]

export const GROUPS: { key: string; label: string }[] = [
  { key: 'a', label: 'Vowels' },
  { key: 'k', label: 'K-row' },
  { key: 's', label: 'S-row' },
  { key: 't', label: 'T-row' },
  { key: 'n', label: 'N-row' },
  { key: 'h', label: 'H-row' },
  { key: 'm', label: 'M-row' },
  { key: 'y', label: 'Y-row' },
  { key: 'r', label: 'R-row' },
  { key: 'w', label: 'W + n' },
  { key: 'dakuten', label: 'Dakuten ゛゜' },
  { key: 'combo', label: 'Combos (きゃ)' },
]

const ROW_OF: Record<string, string> = {
  a: 'a', i: 'a', u: 'a', e: 'a', o: 'a',
}
function groupOf(romaji: string): string {
  if (ROW_OF[romaji]) return 'a'
  if (romaji === 'n' || romaji === 'wa' || romaji === 'wo') return 'w'
  if (romaji === 'shi') return 's'
  if (romaji === 'chi' || romaji === 'tsu') return 't'
  if (romaji === 'fu') return 'h'
  return romaji[0]
}

const TIPS: Record<string, string> = {
  shi: 'Say "she", never "see". The tongue is close to the roof of the mouth.',
  chi: 'Like "chee" in "cheese", short and crisp.',
  tsu: 'Like the end of "cats" + a short u. Practise: "cats-u, ts-u, tsu".',
  fu: 'Halfway between "fu" and "hu". Blow gently as if cooling soup; the lips stay apart, teeth do not touch the lip.',
  ra: 'The Japanese R is a quick tongue tap behind the top teeth, between English r, l and d (like the "tt" in American "butter").',
  ri: 'Quick tongue tap: between "ree", "lee" and "dee".',
  ru: 'Quick tongue tap: between "roo", "loo" and "doo".',
  re: 'Quick tongue tap: between "reh", "leh" and "deh".',
  ro: 'Quick tongue tap: between "roh", "loh" and "doh".',
  wo: 'Pronounced just "o" in modern Japanese. It is used almost only as the object particle を.',
  n: 'A nasal hum. Before b/p/m it sounds like "m" (さんぽ = sampo).',
  u: 'Lips relaxed, not rounded much. Often almost silent at the end of words (です = "dess").',
  ha: 'As the topic particle は it is read "wa".',
  he: 'As the direction particle へ it is read "e".',
  hu: '',
}

const HIRAGANA: Row[] = [
  ['あ', 'a', '🍎', 'A capital "A" with an apple rolling round its legs. You bite it and go "Ahh!"'],
  ['い', 'i', '🐍', 'Two eels standing side by side. "Eel" starts with the "i" sound (ee).'],
  ['う', 'u', '🤢', 'A person bent over with a dash for a hat, groaning "Uuuh, my stomach…"'],
  ['え', 'e', '🦤', 'An exotic bird with a feather on top and a zig-zag body. It squawks "Eh?!"'],
  ['お', 'o', '⛳', 'A golfer swings (the cross), the ball flies off as the dot: "Oh! Hole in one!"'],
  ['か', 'ka', '🥋', 'A karate fighter throwing a punch with a sweat drop flying off: "KA!"'],
  ['き', 'ki', '🔑', 'It looks like an old key with two teeth. Key → ki.'],
  ['く', 'ku', '🐦', 'The open beak of a cuckoo bird calling "ku-ku!"'],
  ['け', 'ke', '🍺', 'A keg on the left, a tap on the right pouring beer. Keg → ke.'],
  ['こ', 'ko', '🎏', 'Two koi fish swimming one above the other. Koi → ko.'],
  ['さ', 'sa', '⚔️', 'A samurai sword crossing a hook-shaped sheath. Samurai → sa.'],
  ['し', 'shi', '🎣', 'A fishing hook. You catch a fish and shout "Look, SHE caught one!"'],
  ['す', 'su', '🎠', 'A swing on a rope with a loop in it. Swing → su.'],
  ['せ', 'se', '🛋️', 'A settee (sofa) seen from the side: back, seat and a cushion. Settee → se.'],
  ['そ', 'so', '🧵', 'A thread zig-zagging as you sew. Sew → so.'],
  ['た', 'ta', '🔤', 'The letters "t" and "a" squeezed together. t + a = ta!'],
  ['ち', 'chi', '🧔', 'A face looking left with a big chin sticking out. Chin → chi.'],
  ['つ', 'tsu', '🌊', 'A single tsunami wave curling over. Tsunami → tsu.'],
  ['て', 'te', '✋', 'て is "te", which literally means hand (手) in Japanese. An arm reaching out with a hand.'],
  ['と', 'to', '🦶', 'A toe with a splinter stuck in it. Toe → to.'],
  ['な', 'na', '✝️', 'A nun kneeling by a cross, praying with her hands looped. Nun → na.'],
  ['に', 'ni', '🦵', 'A knee (the stick on the left) next to two lines. Knee → ni. (Also: に = 2 = 二 = ni!)'],
  ['ぬ', 'nu', '🍜', 'Noodles twirled around chopsticks, with a loop at the end. Noodles → nu.'],
  ['ね', 'ne', '🐈', 'A cat (neko) with a curly tail sitting tall. Neko → ne.'],
  ['の', 'no', '🚫', 'A big "No" sign: a circle with a slash. No → no.'],
  ['は', 'ha', '😆', 'A person on the left laughing "HA!" at the funny thing on the right.'],
  ['ひ', 'hi', '😁', 'A big grin: "hee hee!" Hee → hi.'],
  ['ふ', 'fu', '🗻', 'Mount Fuji with clouds puffing around it. Fuji → fu.'],
  ['へ', 'he', '⛰️', 'A small hill. You huff and puff ("heh heh") climbing it. Same shape in katakana.'],
  ['ほ', 'ho', '🎅', 'Santa’s belt and buckle: "Ho ho ho!" The left line is his walking stick.'],
  ['ま', 'ma', '🤱', 'Mama carrying a baby in a sling on her back. Mama → ma.'],
  ['み', 'mi', '🎂', 'It looks like the number 21: "That’s me at 21!" Me → mi.'],
  ['む', 'mu', '🐄', 'A cow with a tail and a loop for a nose saying "Moo." Moo → mu.'],
  ['め', 'me', '👁️', 'め is "me", which means eye (目) in Japanese. A big eye with its pupil.'],
  ['も', 'mo', '🪝', 'A fishing hook with more and more worms on it. More → mo.'],
  ['や', 'ya', '🐂', 'A yak with horns, seen from the side. Yak → ya.'],
  ['ゆ', 'yu', '♨️', 'ゆ (yu) means hot water. You see it on every Japanese hot-spring curtain: a loop of steam.'],
  ['よ', 'yo', '🪀', 'A yo-yo dangling on a string from a stick. Yo-yo → yo.'],
  ['ら', 'ra', '🐇', 'A rabbit with one ear up and a round body. Rabbit → ra.'],
  ['り', 'ri', '🌾', 'Reeds swaying by a river. Reeds → ri.'],
  ['る', 'ru', '🛣️', 'A winding route that ends in a loop. Route → ru. (No loop = ろ ro)'],
  ['れ', 're', '🧎', 'A man kneeling with his leg kicked out: he needs a REst. Rest → re.'],
  ['ろ', 'ro', '🛤️', 'A road with no loop at the end: the road just goes on. Road → ro.'],
  ['わ', 'wa', '💧', 'Water pouring from a jug into a bowl. Water → wa.'],
  ['を', 'wo', '🤸', 'A person tripping over a bar: "Whoa!" Wo (said "o").'],
  ['ん', 'n', '✍️', 'A lowercase cursive "n". The only kana that is a single consonant.'],
]

const KATAKANA: Row[] = [
  ['ア', 'a', '🍦', 'An ice-cream cone tipped over: "Ahh, I dropped it!"'],
  ['イ', 'i', '🎨', 'An easel with a canvas leaning on it. Easel → i (ee).'],
  ['ウ', 'u', '👑', 'う wearing a flat crown on top. "Ooh, a king!"'],
  ['エ', 'e', '🛗', 'An elevator shaft: floor, cable, ceiling. Elevator → e.'],
  ['オ', 'o', '🎭', 'An opera singer flinging one arm out: "Ohhh!"'],
  ['カ', 'ka', '🥋', 'The same karate punch as か, minus the sweat drop. "KA!"'],
  ['キ', 'ki', '🔑', 'A key with two teeth, like き without the bottom curl.'],
  ['ク', 'ku', '🐦', 'A cuckoo’s beak opening wide from above: "ku!"'],
  ['ケ', 'ke', '🌿', 'A crooked letter K made of sticks. K → ke.'],
  ['コ', 'ko', '📦', 'Two corners of a box. Corner → ko.'],
  ['サ', 'sa', '🏯', 'A samurai gate: one beam, two posts. Samurai → sa.'],
  ['シ', 'shi', '😊', 'SHE is smiling: her eyes are side by side and her smile sweeps UP from the bottom left.'],
  ['ス', 'su', '🦸', 'A superhero running with a cape flapping behind. Super → su.'],
  ['セ', 'se', '🥸', 'Señor with a big moustache, looking left. Señor → se. (Close cousin of せ.)'],
  ['ソ', 'so', '🪡', 'Sewing: one dot, then a needle stitch falling DOWN from the top. Sew → so.'],
  ['タ', 'ta', '👔', 'ク with a tie added in the middle: "Ta-da! I’m dressed!"'],
  ['チ', 'chi', '📣', 'A cheerleader jumping, arms stretched out on the bar. Cheer → chi.'],
  ['ツ', 'tsu', '🌊', 'A tsunami: the drops fall from the TOP and the wave crashes DOWN.'],
  ['テ', 'te', '🔭', 'A telescope on a tripod. Telescope → te.'],
  ['ト', 'to', '🪵', 'A totem pole with one branch sticking out. Totem → to.'],
  ['ナ', 'na', '🔨', 'Nail a cross to the wall. Nail → na.'],
  ['ニ', 'ni', '2️⃣', 'Two lines = two = 二 = "ni" in Japanese!'],
  ['ヌ', 'nu', '🍜', 'A bowl of noodles with chopsticks crossing it. Noodles → nu.'],
  ['ネ', 'ne', '🧣', 'A neckerchief tied round a neck, flapping. Neck → ne.'],
  ['ノ', 'no', '🚫', 'A single slash, like a "No" sign without the circle. No → no.'],
  ['ハ', 'ha', '😆', 'Laughter lines bursting out: "HA HA!"'],
  ['ヒ', 'hi', '👠', 'A high heel seen from the side. Heel → hi.'],
  ['フ', 'fu', '🗻', 'The flat top of Mount Fuji. Fuji → fu.'],
  ['ヘ', 'he', '⛰️', 'The same hill as へ. You huff ("heh") up it.'],
  ['ホ', 'ho', '✝️', 'A holy cross with two candles beside it. Holy → ho.'],
  ['マ', 'ma', '🍸', 'A martini glass, tipped over. Martini → ma.'],
  ['ミ', 'mi', '🎶', 'Three lines singing "Mi mi mi!" (warming up the voice)'],
  ['ム', 'mu', '🐄', 'A cow’s nose seen from the front, going "Moo." Moo → mu.'],
  ['メ', 'me', '🩹', 'An X-shaped bandage on a medic’s kit. Medic → me.'],
  ['モ', 'mo', '🪝', 'Like も, the hook with more worms, just straightened out. More → mo.'],
  ['ヤ', 'ya', '⛵', 'A yacht with its sail leaning in the wind. Yacht → ya.'],
  ['ユ', 'yu', '🛥️', 'A U-boat (submarine) seen from the side. U → yu.'],
  ['ヨ', 'yo', '🧘', 'A yoga mat folded into three, or a backwards E. Yoga → yo.'],
  ['ラ', 'ra', '🐇', 'A rabbit with a flat ear on top and its body below. Rabbit → ra.'],
  ['リ', 'ri', '🌾', 'The same reeds as り, standing straight. Reeds → ri.'],
  ['ル', 'ru', '🌳', 'Two tree roots spreading underground. Roots → ru.'],
  ['レ', 're', '🦵', 'A leg kicking forward: the letter L leaning back. Leg → re.'],
  ['ロ', 'ro', '🤖', 'A robot’s square mouth. Robot → ro.'],
  ['ワ', 'wa', '🍷', 'A wine glass, tilted. "Wah, it spilled!" Wine → wa.'],
  ['ヲ', 'wo', '🤸', 'ワ with an extra bar to trip over: "Whoa!" Wo (said "o").'],
  ['ン', 'n', '😉', 'A winking face: one eye, and the stroke flicks UP from the bottom. Compare ソ which falls down.'],
]

const DAKUTEN_ROMAJI: Record<string, string> = {
  ka: 'ga', ki: 'gi', ku: 'gu', ke: 'ge', ko: 'go',
  sa: 'za', shi: 'ji', su: 'zu', se: 'ze', so: 'zo',
  ta: 'da', chi: 'ji', tsu: 'zu', te: 'de', to: 'do',
  ha: 'ba', hi: 'bi', fu: 'bu', he: 'be', ho: 'bo',
}
const HANDAKUTEN_ROMAJI: Record<string, string> = {
  ha: 'pa', hi: 'pi', fu: 'pu', he: 'pe', ho: 'po',
}

const COMBO_BASE = ['ki', 'shi', 'chi', 'ni', 'hi', 'mi', 'ri', 'gi', 'ji', 'bi', 'pi']
const SMALL_Y: [string, string, string][] = [
  ['ゃ', 'ャ', 'a'],
  ['ゅ', 'ュ', 'u'],
  ['ょ', 'ョ', 'o'],
]
function comboRomaji(base: string, v: string): string {
  if (base === 'shi') return 'sh' + v
  if (base === 'chi') return 'ch' + v
  if (base === 'ji') return 'j' + v
  return base[0] + 'y' + v
}

function build(script: Script, rows: Row[]): Item[] {
  const items: Item[] = rows.map(([char, romaji, emoji, mnemonic]) => ({
    id: `${script[0]}-${romaji}`,
    script,
    char,
    romaji,
    group: groupOf(romaji),
    emoji,
    mnemonic,
    tip: TIPS[romaji] || undefined,
    speak: char,
  }))

  const byRomaji = new Map(items.map((i) => [i.romaji, i]))
  const extra: Item[] = []
  for (const base of items) {
    const v = DAKUTEN_ROMAJI[base.romaji]
    if (v) {
      const char = String.fromCodePoint(base.char.codePointAt(0)! + 1)
      extra.push({
        id: `${script[0]}-${base.romaji}-d`,
        script,
        char,
        romaji: v,
        group: 'dakuten',
        emoji: base.emoji,
        mnemonic: `${base.char} (${base.romaji}) + ゛ two "buzz" marks. The marks make your throat buzz, so ${base.romaji[0] === 'f' ? 'h' : base.romaji[0]} → ${v[0]}.`,
        tip:
          base.romaji === 'chi' || base.romaji === 'tsu'
            ? `Rare. Sounds the same as ${v === 'ji' ? 'じ' : 'ず'}; you will mostly see the other one.`
            : undefined,
        speak: char,
      })
    }
    const p = HANDAKUTEN_ROMAJI[base.romaji]
    if (p) {
      const char = String.fromCodePoint(base.char.codePointAt(0)! + 2)
      extra.push({
        id: `${script[0]}-${base.romaji}-p`,
        script,
        char,
        romaji: p,
        group: 'dakuten',
        emoji: '⭕',
        mnemonic: `${base.char} + ゜ a little circle. Picture your lips making a round "P"-op bubble: h → p.`,
        speak: char,
      })
    }
  }

  for (const b of COMBO_BASE) {
    const baseItem = byRomaji.get(b) ?? extra.find((e) => e.romaji === b && !e.id.includes('chi') && !e.id.includes('tsu'))
    if (!baseItem) continue
    for (const [h, k, v] of SMALL_Y) {
      const small = script === 'hiragana' ? h : k
      const char = baseItem.char + small
      const romaji = comboRomaji(b, v)
      extra.push({
        id: `${script[0]}-${romaji}`,
        script,
        char,
        romaji,
        group: 'combo',
        emoji: '🧲',
        mnemonic: `${baseItem.char} (${b}) + small ${small} (y${v}). The small kana glues onto the one before it and they blend into ONE beat: ${b} + y${v} → ${romaji}.`,
        speak: char,
      })
    }
  }

  return [...items, ...extra]
}

export const hiragana = build('hiragana', HIRAGANA)
export const katakana = build('katakana', KATAKANA)

// Look-alike sets that are worth drilling side by side.
export const LOOKALIKES: { chars: string[]; hint: string }[] = [
  { chars: ['シ', 'ツ'], hint: 'シ shi: dots side by side, stroke sweeps UP from the bottom. ツ tsu: dots on top, stroke falls DOWN from the top.' },
  { chars: ['ソ', 'ン'], hint: 'ソ so: stroke falls DOWN from the top (sewing). ン n: stroke flicks UP from the bottom (wink).' },
  { chars: ['ぬ', 'め'], hint: 'ぬ nu has a loop at the end (noodle curl). め me has no loop (just the eye).' },
  { chars: ['ね', 'れ', 'わ'], hint: 'ね ne ends in a loop (cat tail). れ re kicks out (leg). わ wa curls back in (water jug).' },
  { chars: ['る', 'ろ'], hint: 'る ru ends in a loop (route). ろ ro has no loop (the road goes on).' },
  { chars: ['さ', 'ち'], hint: 'さ sa opens to the left like a sword sheath. ち chi faces the other way, a chin pointing left.' },
  { chars: ['は', 'ほ'], hint: 'ほ ho has a closed top line (Santa’s belt). は ha has the line crossing through.' },
  { chars: ['い', 'り'], hint: 'い i: two short eels side by side. り ri: the right stroke is long (reeds by the river).' },
  { chars: ['ク', 'ケ', 'タ'], hint: 'ク ku: plain beak. ケ ke: the top stroke sticks out (crooked K). タ ta: extra line inside (the tie).' },
  { chars: ['コ', 'ユ', 'ロ'], hint: 'コ ko: two corners, open left. ユ yu: open top, long base. ロ ro: closed box (robot mouth).' },
  { chars: ['ウ', 'ワ', 'フ'], hint: 'ウ u has a dash on top (crown). ワ wa has a left post (glass). フ fu is just the hook.' },
  { chars: ['ア', 'マ'], hint: 'ア a: the stroke drops down to the left (cone). マ ma: the hook goes back right (martini).' },
  { chars: ['チ', 'テ'], hint: 'チ chi: top stroke slants. テ te: two flat lines on top (telescope).' },
  { chars: ['ノ', 'メ'], hint: 'ノ no: one slash. メ me: a slash crossed by a second stroke (X bandage).' },
]
