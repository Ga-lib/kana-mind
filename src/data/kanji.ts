import type { Item } from './types'
import { PICTURES } from './pictures'

// [char, meaning, on'yomi, kun'yomi, mnemonic, examples "word|reading|meaning;..."] grouped by theme
type K = [string, string, string, string, string, string]

export const KANJI_GROUPS: { key: string; label: string; list: K[] }[] = [
  {
    key: 'numbers',
    label: 'Numbers',
    list: [
      ['一', 'one', 'イチ、イツ', 'ひと(つ)', 'One finger laid flat: a single line.', '一つ|ひとつ|one thing;一月|いちがつ|January'],
      ['二', 'two', 'ニ', 'ふた(つ)', 'Two lines, two fingers. Same sound as the kana に.', '二つ|ふたつ|two things;二人|ふたり|two people'],
      ['三', 'three', 'サン', 'みっ(つ)', 'Three lines stacked like a podium for third place.', '三つ|みっつ|three things;三月|さんがつ|March'],
      ['四', 'four', 'シ', 'よ、よん、よっ(つ)', 'A window with four sides and curtains hanging inside.', '四つ|よっつ|four things;四月|しがつ|April'],
      ['五', 'five', 'ゴ', 'いつ(つ)', 'A spool of thread with five turns; "go" → five fingers, GO!', '五つ|いつつ|five things;五月|ごがつ|May'],
      ['六', 'six', 'ロク', 'むっ(つ)', 'A little house with a roof and two legs. "Rock" the six kids to sleep inside.', '六つ|むっつ|six things;六月|ろくがつ|June'],
      ['七', 'seven', 'シチ', 'なな(つ)', 'An upside-down 7 with a slash through it.', '七つ|ななつ|seven things;七月|しちがつ|July'],
      ['八', 'eight', 'ハチ', 'やっ(つ)', 'Two lines spreading like the slopes of a mountain. Hachi the loyal dog waited 8 years.', '八つ|やっつ|eight things;八月|はちがつ|August'],
      ['九', 'nine', 'キュウ、ク', 'ここの(つ)', 'A leg kicking out: "Kyu!" a ninja’s nine-tailed kick.', '九つ|ここのつ|nine things;九月|くがつ|September'],
      ['十', 'ten', 'ジュウ', 'とお', 'A cross. Ten in Roman numerals is X, a cross tipped over.', '十|とお|ten;十月|じゅうがつ|October'],
      ['百', 'hundred', 'ヒャク', '', 'One (一) on top of white (白): a hundred white sheep.', '百|ひゃく|hundred;三百|さんびゃく|three hundred'],
      ['千', 'thousand', 'セン', 'ち', 'Ten (十) with a slanted hat: a thousand ants marching.', '千|せん|thousand;千円|せんえん|1,000 yen'],
      ['万', 'ten thousand', 'マン、バン', '', 'A man (マン) with a big hook carrying ten thousand yen.', '一万|いちまん|10,000;万年筆|まんねんひつ|fountain pen'],
      ['円', 'yen, circle', 'エン', 'まる(い)', 'A cash register drawer with a coin divider inside: yen.', '円|えん|yen;百円|ひゃくえん|100 yen'],
    ],
  },
  {
    key: 'nature',
    label: 'Nature & days',
    list: [
      ['日', 'sun, day', 'ニチ、ジツ', 'ひ、か', 'A window with the sun shining through it. Each sun = one day.', '日曜日|にちようび|Sunday;毎日|まいにち|every day'],
      ['月', 'moon, month', 'ゲツ、ガツ', 'つき', 'A crescent moon with two clouds drifting across it.', '月曜日|げつようび|Monday;一月|いちがつ|January'],
      ['火', 'fire', 'カ', 'ひ', 'A campfire: flames leaping, sparks flying off both sides.', '火曜日|かようび|Tuesday;花火|はなび|fireworks'],
      ['水', 'water', 'スイ', 'みず', 'A river splashing from a central stream to both sides.', '水曜日|すいようび|Wednesday;水|みず|water'],
      ['木', 'tree', 'モク、ボク', 'き', 'A tree: trunk, branches stretching out, roots spreading down.', '木曜日|もくようび|Thursday;木|き|tree'],
      ['金', 'gold, money', 'キン、コン', 'かね', 'A roof over a gold mine with nuggets glittering under the soil.', '金曜日|きんようび|Friday;お金|おかね|money'],
      ['土', 'earth, soil', 'ド、ト', 'つち', 'A sprout (十) pushing up out of the ground (一).', '土曜日|どようび|Saturday;土|つち|soil'],
      ['山', 'mountain', 'サン', 'やま', 'Three peaks, the middle one tallest. Mt. Fuji = 富士山 (ふじさん).', '山|やま|mountain;富士山|ふじさん|Mt. Fuji'],
      ['川', 'river', 'セン', 'かわ', 'Three lines of water flowing downstream.', '川|かわ|river;小川|おがわ|stream'],
      ['田', 'rice field', 'デン', 'た', 'A rice paddy seen from above, split into four plots.', '田んぼ|たんぼ|rice paddy;田中|たなか|Tanaka (name)'],
      ['天', 'heaven, sky', 'テン', 'あめ', 'A big person (大) with a line above their head: the sky.', '天気|てんき|weather;天国|てんごく|heaven'],
      ['気', 'spirit, air', 'キ、ケ', '', 'Steam rising and swirling over a pot: energy in the air.', '元気|げんき|healthy;天気|てんき|weather'],
      ['雨', 'rain', 'ウ', 'あめ', 'A window in a roof with raindrops falling inside.', '雨|あめ|rain;大雨|おおあめ|heavy rain'],
      ['花', 'flower', 'カ', 'はな', 'Grass on top (艹) and a person changing (化) below: a bud changes into a flower.', '花|はな|flower;花火|はなび|fireworks'],
    ],
  },
  {
    key: 'people',
    label: 'People & body',
    list: [
      ['人', 'person', 'ジン、ニン', 'ひと', 'A person walking: two legs striding apart.', '人|ひと|person;日本人|にほんじん|Japanese person'],
      ['口', 'mouth', 'コウ、ク', 'くち', 'An open square mouth.', '口|くち|mouth;入口|いりぐち|entrance'],
      ['目', 'eye', 'モク', 'め', 'An eye turned on its side, with its two lids. Same sound as め!', '目|め|eye;一つ目|ひとつめ|the first one'],
      ['耳', 'ear', 'ジ', 'みみ', 'An ear seen from the side with its folds and earlobe.', '耳|みみ|ear'],
      ['手', 'hand', 'シュ', 'て', 'A hand with fingers spread and a long wrist. Read て, like the kana!', '手|て|hand;上手|じょうず|skilled'],
      ['足', 'foot, leg; enough', 'ソク', 'あし、た(りる)', 'A knee cap (口) on top of a leg and a foot.', '足|あし|foot;一足|いっそく|one pair (of shoes)'],
      ['子', 'child', 'シ、ス', 'こ', 'A baby wrapped in a blanket, arms stretched out.', '子ども|こども|child;女の子|おんなのこ|girl'],
      ['女', 'woman', 'ジョ、ニョ', 'おんな', 'A woman with crossed legs, gracefully dancing.', '女|おんな|woman;女性|じょせい|female'],
      ['男', 'man', 'ダン、ナン', 'おとこ', 'A rice field (田) + power (力): the one who works the field.', '男|おとこ|man;男の子|おとこのこ|boy'],
      ['友', 'friend', 'ユウ', 'とも', 'Two hands reaching across to shake: a friend.', '友だち|ともだち|friend;親友|しんゆう|best friend'],
      ['先', 'ahead, previous', 'セン', 'さき', 'A person with legs (儿) racing ahead of everyone.', '先生|せんせい|teacher;先週|せんしゅう|last week'],
      ['生', 'life, birth', 'セイ、ショウ', 'い(きる)、う(まれる)', 'A sprout growing out of the earth (土): life!', '先生|せんせい|teacher;学生|がくせい|student'],
      ['学', 'study', 'ガク', 'まな(ぶ)', 'A child (子) under a roof with sparks of ideas on top: a school.', '学生|がくせい|student;大学|だいがく|university'],
      ['名', 'name', 'メイ、ミョウ', 'な', 'Evening (夕) + mouth (口): at night you must call out your name.', '名前|なまえ|name;有名|ゆうめい|famous'],
    ],
  },
  {
    key: 'position',
    label: 'Position & size',
    list: [
      ['上', 'up, above', 'ジョウ', 'うえ、あ(げる)', 'A line pointing UP from the ground.', '上|うえ|above;上手|じょうず|skilled'],
      ['下', 'down, below', 'カ、ゲ', 'した、さ(げる)', 'A line hanging DOWN from the ceiling.', '下|した|below;地下鉄|ちかてつ|subway'],
      ['中', 'middle, inside', 'チュウ', 'なか', 'A line piercing right through the middle of a box.', '中|なか|inside;中国|ちゅうごく|China'],
      ['大', 'big', 'ダイ、タイ', 'おお(きい)', 'A person stretching their arms out wide: "This big!"', '大きい|おおきい|big;大学|だいがく|university'],
      ['小', 'small', 'ショウ', 'ちい(さい)、こ', 'A tiny hook with two small drops beside it.', '小さい|ちいさい|small;小学校|しょうがっこう|elementary school'],
      ['左', 'left', 'サ', 'ひだり', 'A hand holding a tool (工) with the LEFT hand.', '左|ひだり|left;左手|ひだりて|left hand'],
      ['右', 'right', 'ウ、ユウ', 'みぎ', 'A hand bringing food to the mouth (口) with the RIGHT hand.', '右|みぎ|right;右手|みぎて|right hand'],
      ['外', 'outside', 'ガイ', 'そと', 'Evening (夕) + a fortune-teller (卜) who works outside.', '外|そと|outside;外国|がいこく|foreign country'],
      ['前', 'before, front', 'ゼン', 'まえ', 'Horns on top, a moon and a knife: the bull charges to the front.', '前|まえ|front;名前|なまえ|name'],
      ['後', 'after, behind', 'ゴ、コウ', 'あと、うし(ろ)', 'Footsteps (彳) and a short thread: walking behind, following later.', '後ろ|うしろ|behind;午後|ごご|afternoon'],
      ['東', 'east', 'トウ', 'ひがし', 'The sun (日) rising behind a tree (木): east.', '東|ひがし|east;東京|とうきょう|Tokyo'],
      ['西', 'west', 'セイ、サイ', 'にし', 'A bird settling into its nest at sunset, in the west.', '西|にし|west;関西|かんさい|Kansai'],
      ['南', 'south', 'ナン', 'みなみ', 'A warm tent (冂) with a cross on top, pointing south to the sun.', '南|みなみ|south;南口|みなみぐち|south exit'],
      ['北', 'north', 'ホク', 'きた', 'Two people sitting back-to-back against the cold north wind.', '北|きた|north;北海道|ほっかいどう|Hokkaido'],
      ['長', 'long; boss', 'チョウ', 'なが(い)', 'An old man with long flowing hair: long, and the boss.', '長い|ながい|long;社長|しゃちょう|company president'],
      ['高', 'tall, expensive', 'コウ', 'たか(い)', 'A tall tower with a roof, windows and a door.', '高い|たかい|tall / expensive;高校|こうこう|high school'],
      ['安', 'cheap, safe', 'アン', 'やす(い)', 'A woman (女) under a roof: she feels safe at home.', '安い|やすい|cheap;安全|あんぜん|safety'],
      ['新', 'new', 'シン', 'あたら(しい)', 'Stand on a tree (立+木) and chop with an axe (斤) to make something new.', '新しい|あたらしい|new;新聞|しんぶん|newspaper'],
      ['古', 'old', 'コ', 'ふる(い)', 'Ten (十) mouths (口) have told this story: it is old.', '古い|ふるい|old;中古|ちゅうこ|second-hand'],
    ],
  },
  {
    key: 'time',
    label: 'Time',
    list: [
      ['年', 'year', 'ネン', 'とし', 'A farmer carrying a sheaf of rice: one harvest = one year.', '今年|ことし|this year;毎年|まいとし|every year'],
      ['今', 'now', 'コン', 'いま', 'A roof (人) gathering everyone under it right NOW.', '今|いま|now;今日|きょう|today'],
      ['時', 'time, hour', 'ジ', 'とき', 'Sun (日) + temple (寺): the temple bell rings the hours.', '時間|じかん|time;一時|いちじ|1 o’clock'],
      ['分', 'minute; divide', 'ブン、フン', 'わ(ける)', 'A knife (刀) under a split (八): cut time into minutes.', '五分|ごふん|5 minutes;自分|じぶん|oneself'],
      ['半', 'half', 'ハン', 'なか(ば)', 'A cow cut right down the middle into two halves.', '半分|はんぶん|half;三時半|さんじはん|3:30'],
      ['週', 'week', 'シュウ', '', 'Moving along (辶) around a whole circuit (周): a week.', '今週|こんしゅう|this week;週末|しゅうまつ|weekend'],
      ['毎', 'every', 'マイ', 'ごと', 'A person with a hat over a mother (母): mum does it every day.', '毎日|まいにち|every day;毎朝|まいあさ|every morning'],
      ['午', 'noon', 'ゴ', '', 'A horse’s pestle pounding at exactly noon: like 牛 (cow) without the horn.', '午前|ごぜん|a.m.;午後|ごご|p.m.'],
      ['何', 'what', 'カ', 'なに、なん', 'A person (亻) holding a box (可): "What is in it?"', '何|なに|what;何時|なんじ|what time'],
      ['本', 'book, origin', 'ホン', 'もと', 'A tree (木) with a line marking its root: the origin. Books are made of trees!', '本|ほん|book;日本|にほん|Japan'],
      ['白', 'white', 'ハク', 'しろ', 'A ray of light above the sun (日): blinding white.', '白い|しろい|white;面白い|おもしろい|interesting'],
    ],
  },
  {
    key: 'verbs',
    label: 'Actions',
    list: [
      ['行', 'go', 'コウ、ギョウ', 'い(く)', 'A crossroads: step left (彳) and go right.', '行く|いく|to go;銀行|ぎんこう|bank'],
      ['来', 'come', 'ライ', 'く(る)', 'Rice stalks bending as someone comes walking through.', '来る|くる|to come;来年|らいねん|next year'],
      ['見', 'see', 'ケン', 'み(る)', 'A big eye (目) on legs (儿), walking around to see.', '見る|みる|to see;花見|はなみ|flower viewing'],
      ['聞', 'hear, ask', 'ブン', 'き(く)', 'An ear (耳) pressed to a gate (門), listening.', '聞く|きく|to listen / ask;新聞|しんぶん|newspaper'],
      ['食', 'eat', 'ショク', 'た(べる)', 'A lid on a bowl of good food: time to eat.', '食べる|たべる|to eat;食堂|しょくどう|cafeteria'],
      ['飲', 'drink', 'イン', 'の(む)', 'Food (飠) + a person yawning (欠) with a wide-open mouth to drink.', '飲む|のむ|to drink;飲み物|のみもの|a drink'],
      ['言', 'say', 'ゲン', 'い(う)', 'Words (lines) coming out of a mouth (口).', '言う|いう|to say;言葉|ことば|word'],
      ['話', 'talk', 'ワ', 'はな(す)', 'Words (言) + tongue (舌): talking.', '話す|はなす|to speak;電話|でんわ|telephone'],
      ['読', 'read', 'ドク', 'よ(む)', 'Words (言) you sell (売): you read them aloud at the market.', '読む|よむ|to read;読書|どくしょ|reading'],
      ['書', 'write', 'ショ', 'か(く)', 'A hand holding a brush (聿) above the sun (日): writing a diary.', '書く|かく|to write;辞書|じしょ|dictionary'],
      ['買', 'buy', 'バイ', 'か(う)', 'A net (罒) over a shell (貝; shells were money): scoop up and buy.', '買う|かう|to buy;買い物|かいもの|shopping'],
      ['休', 'rest', 'キュウ', 'やす(む)', 'A person (亻) leaning against a tree (木) to rest.', '休む|やすむ|to rest;休み|やすみ|holiday'],
      ['出', 'exit, go out', 'シュツ', 'で(る)、だ(す)', 'Two mountains stacked: climb up and out.', '出る|でる|to leave;出口|でぐち|exit'],
      ['入', 'enter', 'ニュウ', 'はい(る)、い(れる)', 'A tent flap opening for you to step in.', '入る|はいる|to enter;入口|いりぐち|entrance'],
      ['立', 'stand', 'リツ', 'た(つ)', 'A person standing on the ground with arms out.', '立つ|たつ|to stand;国立|こくりつ|national'],
      ['会', 'meet', 'カイ', 'あ(う)', 'People under one roof (人) gathering to meet.', '会う|あう|to meet;会社|かいしゃ|company'],
    ],
  },
  {
    key: 'places',
    label: 'Places & things',
    list: [
      ['国', 'country', 'コク', 'くに', 'A jewel (玉) protected inside borders (囗): a country.', '国|くに|country;外国|がいこく|foreign country'],
      ['校', 'school', 'コウ', '', 'A tree (木) + a crossing (交): kids cross paths under the school tree.', '学校|がっこう|school;高校|こうこう|high school'],
      ['車', 'car', 'シャ', 'くるま', 'A cart seen from above: the axle and two wheels.', '車|くるま|car;電車|でんしゃ|train'],
      ['電', 'electricity', 'デン', '', 'Rain (雨) above a field with lightning flashing down.', '電車|でんしゃ|train;電気|でんき|electricity'],
      ['語', 'language', 'ゴ', 'かた(る)', 'Words (言) of five (五) mouths (口): a language.', '日本語|にほんご|Japanese;英語|えいご|English'],
      ['駅', 'station', 'エキ', '', 'A horse (馬) waiting to be swapped at a post station.', '駅|えき|station;東京駅|とうきょうえき|Tokyo Station'],
      ['道', 'road, way', 'ドウ', 'みち', 'A head (首) walking along (辶) the road.', '道|みち|road;柔道|じゅうどう|judo'],
      ['店', 'shop', 'テン', 'みせ', 'A roof (广) over a fortune-teller (占): a little shop.', '店|みせ|shop;店員|てんいん|shop clerk'],
      ['社', 'company, shrine', 'シャ', 'やしろ', 'An altar (礻) on the earth (土): a shrine, and later a company.', '会社|かいしゃ|company;神社|じんじゃ|shrine'],
    ],
  },
]

function toRomaji(kana: string): string {
  const map: Record<string, string> = {
    あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o', か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
    が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go', さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
    ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo', た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
    だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do', な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
    は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho', ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
    ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po', ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
    や: 'ya', ゆ: 'yu', よ: 'yo', ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro', わ: 'wa', を: 'wo', ん: 'n',
  }
  const small: Record<string, string> = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' }
  let out = ''
  const chars = [...kana]
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    const next = chars[i + 1]
    if (c === 'っ') {
      const r = map[next] ?? ''
      out += r[0] ?? ''
      continue
    }
    if (next && small[next]) {
      const base = map[c] ?? ''
      if (base === 'shi') out += 'sh' + small[next][1]
      else if (base === 'chi') out += 'ch' + small[next][1]
      else if (base === 'ji') out += 'j' + small[next][1]
      else out += base[0] + small[next]
      i++
      continue
    }
    out += map[c] ?? ''
  }
  return out
}

function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

export const kanji: Item[] = KANJI_GROUPS.flatMap((g) =>
  g.list.map(([char, meaning, on, kun, mnemonic, ex]) => {
    const examples = ex.split(';').map((s) => {
      const [w, r, m] = s.split('|')
      return { w, r, m }
    })
    const onList = on ? on.split('、') : []
    const kunList = kun ? kun.split('、') : []
    const first = (kunList[0] ?? kataToHira(onList[0] ?? '')).replace(/[()]/g, '')
    return {
      id: `k-${char}`,
      script: 'kanji' as const,
      char,
      romaji: toRomaji(first),
      group: g.key,
      keyword: meaning.split(",")[0],
      picture: PICTURES[char] ?? "",
      mnemonic,
      meaning,
      on: onList,
      kun: kunList,
      examples,
      speak: examples[0].r,
    }
  }),
)

export { toRomaji, kataToHira }
