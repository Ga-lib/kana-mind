// Hand-drawn memory scenes for kana. Coordinates use the KanjiVG 109×109 grid so each scene
// fits around the real strokes of its character. Mini-language: see components/Illustration.tsx.

export const HIRAGANA_SCENES: Record<string, string[]> = {
  // A capital A with an apple rolling round its legs
  あ: [
    '!M86 77c-6-5-15-1-14 8c1 9 8 14 14 11c6 3 13-2 14-11c1-9-8-13-14-8z',
    'M86 77c0-4 1-6 3-8',
    '*M89 71c3-4 8-4 10-2c-3 3-7 4-10 2z',
    'M58 100h10M62 105h8',
    '-M20 92h40',
  ],
  // two eels side by side
  い: [
    '#c 25 34 1.8',
    '#c 76 41 1.8',
    'M18 28l-6-4M18 33l-7 1',
    'M86 36l7-4M87 41l7 0',
    'M8 92q7-5 14 0t14 0t14 0t14 0t14 0t14 0t14 0',
    'c 52 22 3',
    'c 58 13 2',
  ],
  // bent over with a hat, groaning
  う: [
    '*M47 30c-7 0-11 4-11 9s4 8 9 8',
    '#c 41 37 1.4',
    'M78 24c4-5 11-1 8 5c-3 5-10 3-9-2',
    'M86 46c3-4 8-1 6 3',
    '*M22 52q-4 6 0 9q4-3 0-9z',
    'T 92 100 9 uuuh',
  ],
  // exotic bird: feather crest on top, zig-zag body
  え: [
    '!M47 12q-8-9-15-6',
    '!M51 12q2-10 9-10',
    '!M33 44l-10 3l10 3z',
    '#c 40 41 1.8',
    'M84 90q10-3 17 4M84 90q7 5 9 13',
    'M54 92v12M62 91v12',
  ],
  // golfer swings, the ball flies off
  お: [
    'c 79 28 8',
    '#c 77 25 .9',
    '#c 82 30 .9',
    'M66 46q6-6 6-11M60 42q6-6 8-12',
    '!M94 66l10 4l-10 4z',
    'M94 66v30M80 96h26',
  ],
  // karate punch with a flying sweat drop
  か: [
    'M12 30l7 5M10 40h8M13 50l7-4',
    '!M26 52h18v5h-18z',
    'M44 52l8-4M44 56l8 4',
    'M70 66q6 4 10 0',
    'T 92 100 10 KA!',
  ],
  // an old key
  き: [
    'c 42 8 6',
    'c 42 8 2',
    '!M88 16l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z',
    'M16 98h22M76 98h20',
  ],
  // cuckoo's open beak
  く: [
    '*c 84 55 23',
    '#c 88 44 3',
    '*M78 78q8 10 20 6',
    'M94 56q6 2 8 8',
    '%M20 41a3 2.4 0 1 0 0.1 0z',
    'M23 40v-13l9-3v13',
    '%M32 37a3 2.4 0 1 0 0.1 0z',
  ],
  // keg on the left, beer pouring on the right
  け: [
    '*M12 20q-4 26 0 54h22q4-28 0-54z',
    'M11 34h24M11 60h24',
    '!M56 94h16l-2 13h-12z',
    'M55 94q4-4 9 0q4-4 9 0',
  ],
  // two koi fish
  こ: [
    '#c 38 28 1.6',
    '!M63 32l8-6l-2 7l2 7z',
    '#c 33 70 1.6',
    '!M79 82l9-6l-2 7l3 7z',
    'M8 50q8-4 16 0M84 52q8-4 16 0',
    'c 90 18 2.5',
    'c 96 12 1.5',
  ],
  // samurai sword and hook-shaped sheath
  さ: [
    '!M12 41l15-3l1 5l-15 3z',
    'M28 34l2 12',
    'M76 26l9-3',
    'M86 70q8-10 0-20',
    'T 92 104 9 sa!',
  ],
  // fishing hook, a fish caught
  し: [
    'M39 18V2',
    '*M86 70q10-6 18 2q-8 8-18 2z',
    'M86 72l-6-5v10z',
    '#c 98 72 1.3',
    'M4 58q6-3 12 0t12 0',
  ],
  // a swing hanging from a beam
  す: [
    '*M34 98h26v5h-26z',
    'M10 36q-6-8 0-16q6 8 0 16z',
    '*M99 30q-6-8 0-16q6 8 0 16z',
    'M80 50q6 8 4 18M86 46q8 8 8 20',
  ],
  // settee seen from the side
  せ: [
    'M17 50q-8-2-8-11q0-7 7-7',
    'M94 42q8-2 8-10q0-7-6-7',
    'M22 52v14M88 50v14',
    '*M42 38q8-8 16 0z',
  ],
  // thread zig-zagging from a spool
  そ: [
    '*M26 4h18v4h-18z',
    '*M26 16h18v4h-18z',
    'M29 8v8M41 8v8',
    '-M36 20v4',
    '!M80 90l16 12',
    'c 96 102 1.5',
  ],
  // t + a
  た: [
    '-M48 46v48',
    'T 30 104 10 t',
    'T 72 104 10 a',
  ],
  // a face with a big chin
  ち: [
    '*c 62 58 34',
    'M40 26q20-22 46-4',
    '#c 68 46 2.5',
    'M78 58q4 2 4 6',
    '!c 84 68 4',
  ],
  // one tsunami wave
  つ: [
    '*M58 32q6-10 14-4q6-8 14 0',
    'M4 100q8-4 16 0t16 0t16 0t16 0t16 0t16 0',
    '!M18 92h14l-3 5h-8z',
    'M25 92v-8',
  ],
  // a hand reaching out
  て: [
    '*M74 86q-4 12 6 16q12 2 14-8l-6-10z',
    'M78 100l-2 6M86 102l0 5',
    'M10 18l8 4M14 10l6 6',
  ],
  // a toe with a splinter
  と: [
    'M28 14l-6-6M48 12l4-7M26 30h-8',
    '!M30 4l3 6l6 1l-4 4l1 6l-6-3l-6 3l1-6l-4-4l6-1z',
    '*M70 92q10-2 14 4q-6 6-14 4z',
  ],
  // a nun praying by a cross
  な: [
    '*M60 44q-26 4-24 46h52q2-42-28-46z',
    '-c 80 30 10',
    'M48 10l-3-6M58 18l5-3M30 10l-4-5',
    '*M58 70q-6-6-1-12q6 4 1 12z',
  ],
  // a knee next to two lines (に = 2)
  に: [
    '*c 24 50 7',
    '*M18 77q-4 10 8 10h10',
    'T 98 104 10 2',
  ],
  // noodles on chopsticks over a bowl
  ぬ: [
    '*M10 88h88q-4 20-44 20q-40 0-44-20z',
    'M40 14q-5-5 0-10M54 14q-5-5 0-10M68 14q-5-5 0-10',
  ],
  // a cat with a curly tail
  ね: [
    '*c 33 13 9',
    '*M25 8l1-8l7 5z',
    '*M41 8l-1-8l-7 5z',
    '#c 30 13 1.3',
    '#c 37 13 1.3',
    'M24 17h-8M42 17h8',
  ],
  // a big "No" sign
  の: [
    '^c 46 56 44',
    'T 96 104 10 no',
  ],
  // laughing "HA!"
  は: [
    '*c 25 10 7',
    '!M22 12q3 4 6 0',
    'T 92 18 11 HA!',
    'M100 30l5 4M98 40h7',
  ],
  // a big grin, hee hee
  ひ: [
    '#c 46 40 3',
    '#c 66 40 3',
    '!c 30 60 5',
    '!c 86 60 5',
    'T 54 104 9 hee hee',
  ],
  // Mount Fuji with clouds
  ふ: [
    '*M2 104L36 44q18-12 36 0L107 104z',
    'M36 44l6 8l6-6l6 6l6-6l6 6l6-8',
    '*M6 26q2-8 10-6q4-6 10 0q6-1 6 6z',
    '*M80 18q2-7 9-5q4-5 9 0q5 0 5 5z',
  ],
  // a small hill with a flag on top
  へ: [
    '*M2 98L36 38q2-3 6 0L107 98z',
    '!M38 36v-16l12 4l-12 4',
    'c 18 64 3',
    'M18 67v9M18 76l-3 6M18 76l3 6M18 70l-4 3',
  ],
  // Santa's belly, belt and hat
  ほ: [
    '!M48 16l20-14l22 14z',
    'c 68 3 3',
    '*c 66 76 10',
    'T 94 106 9 ho ho',
  ],
  // mama carrying a baby
  ま: [
    '!M86 18c-4-6-12 0-6 6l6 6l6-6c6-6-2-12-6-6z',
    '*c 56 7 6',
    '*c 44 81 5',
    '#c 42 80 .9',
    '#c 46 80 .9',
  ],
  // looks like 21: me at 21
  み: [
    'T 96 104 12 21',
    '!M26 16v-8M36 14v-8M46 16v-8',
    '%M26 6q-3-3 0-6q3 3 0 6z',
    '%M36 4q-3-3 0-6q3 3 0 6z',
    '%M46 6q-3-3 0-6q3 3 0 6z',
  ],
  // a cow going moo
  む: [
    'M16 24q-8-10 0-18',
    'M62 22q8-8 4-16',
    '*c 86 74 6',
    '#c 84 73 1',
    '#c 89 73 1',
    'T 98 22 10 moo',
  ],
  // an eye (め = eye)
  め: [
    'M30 22l-4-8M44 18v-9M58 18l4-8M72 22l6-7',
    '*c 50 58 9',
    '#c 50 58 4',
  ],
  // a hook with more and more worms
  も: [
    'M49 15V0',
    '!M68 30q3-5 6 0t6 0',
    '!M64 52q3-5 6 0t6 0t6 0',
  ],
  // a yak with horns and shaggy fur
  や: [
    'M46 16q-10-4-12-14',
    'M60 16q10-4 12-14',
    'M30 92l-4 9M38 92v10M46 92l3 9',
    '#c 70 50 1.8',
  ],
  // hot-spring steam (ゆ = hot water)
  ゆ: [
    'M30 20q-5-5 0-10q5-5 0-10',
    'M46 18q-5-5 0-10q5-5 0-10',
    'M62 16q-5-5 0-10q5-5 0-10',
    '*M6 98q48 16 98 0q-48 10-98 0z',
  ],
  // a yo-yo on a string
  よ: [
    '!c 38 82 12',
    'c 38 82 4',
    'M55 14q-6-6 0-12',
    'M20 70q-6 12 0 24',
  ],
  // a rabbit
  ら: [
    '*M36 40q48-8 48 28q-2 28-34 28q-16 0-18-10z',
    '*M48 16q2-14 10-14q0 9-8 16',
    '#c 56 50 2',
    '*c 82 86 5',
    'M64 56h10M64 60l9 3',
  ],
  // reeds by a river
  り: [
    '!M39 10q-3 7 0 14q3-7 0-14z',
    '!M70 4q-3 7 0 14q3-7 0-14z',
    'M8 100q8-4 16 0t16 0t16 0t16 0t16 0t16 0',
  ],
  // a winding route that ends in a loop
  る: [
    '!M20 8h14v6h-14z',
    '#c 23 15 2',
    '#c 31 15 2',
    '^M82 66v-16l9 3l-9 3',
  ],
  // a man resting on one knee
  れ: [
    '*c 35 7 5',
    'T 88 22 10 z z',
    'M14 98h86',
  ],
  // a road that keeps going
  ろ: [
    '-M60 96q16 2 30-4',
    'M90 92l8-4l-2 8',
    'M14 102h40',
  ],
  // water pouring into a bowl
  わ: [
    '*M60 98h44q-4 10-22 10q-18 0-22-10z',
    '*M86 80q-3 5 0 7q3-2 0-7z',
    '*M94 70q-3 5 0 7q3-2 0-7z',
  ],
  // tripping over a bar: whoa!
  を: [
    '*c 50 7 5',
    'T 94 20 10 whoa!',
    'M88 54l6 4M90 64h8',
  ],
  // a cursive n written with a pen
  ん: [
    '!M90 69l10-12l4 4z',
    'T 22 104 12 n',
  ],
}

export const KATAKANA_SCENES: Record<string, string[]> = {
  // an ice-cream cone tipped over
  ア: [
    '!M26 21q-4-16 16-16q12-8 24 2q18-2 15 14z',
    'M40 21v7M66 21v9',
    'M44 52l12 6M42 64l10 6M40 76l8 4',
    '*M24 100q12-6 28 0z',
  ],
  // an easel with a canvas
  イ: [
    '*M60 20h32v28h-32z',
    '!c 74 30 4',
    'M62 44q10-8 28 0',
    'M40 70l-16 34M70 70l14 34',
  ],
  // う wearing a crown
  ウ: [
    '!M36 14l3-12l8 7l7-9l7 9l8-7l3 12z',
    '#c 54 6 1.4',
  ],
  // an elevator shaft
  エ: [
    'M12 8v96M98 8v96',
    '-M54 4v28',
    '!M104 44l-4 6h8z',
    '!M104 62l-4-6h8z',
  ],
  // an opera singer flinging an arm out
  オ: [
    '*c 60 8 6',
    '*M53 87l-16 18h34z',
    '%M86 22a3 2.4 0 1 0 .1 0z',
    'M89 21v-13l8-2v12',
    '%M97 18a3 2.4 0 1 0 .1 0z',
  ],
  // a karate punch
  カ: [
    'M14 30l7 5M12 40h8M14 50l7-4',
    '!M60 60h18v5h-18z',
    'T 92 104 10 KA!',
  ],
  // a key
  キ: [
    'c 49 9 7',
    'c 49 9 2.5',
    '!M92 80l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z',
  ],
  // a cuckoo's open beak
  ク: [
    '*c 86 56 21',
    '#c 90 44 3',
    '%M18 30a3 2.4 0 1 0 .1 0z',
    'M21 29v-13l8-3v13',
    '%M29 26a3 2.4 0 1 0 .1 0z',
  ],
  // a crooked letter K
  ケ: [
    '-M14 18v76M14 56l30-38M14 56l30 38',
  ],
  // a box: two corners
  コ: [
    '*M30 35l14-12h44l-12 12z',
    'M82 31l12-10v44l-12 10',
    '-M30 35v40',
    '^M96 24l-10 6M100 80l-10-4',
  ],
  // a torii gate
  サ: [
    '!M6 30q48-10 98 0l-4 6q-45-8-90 0z',
    'M8 100h94',
  ],
  // she smiles
  シ: [
    '*c 56 56 48',
    '!c 22 68 5',
    'M30 8q20-8 40 0',
  ],
  // a superhero with a cape
  ス: [
    '*c 52 13 8',
    '!M44 22q-30 20-34 50l20-12z',
    'M4 82h12M2 92h14M6 102h10',
  ],
  // señor with sombrero and moustache
  セ: [
    '!M8 30q46-8 94 0q-10 6-47 6q-37 0-47-6z',
    '*M36 26q0-20 19-20q19 0 19 20',
  ],
  // sewing: a needle and a button
  ソ: [
    '!M38 91l-16 14',
    'c 24 103 1.4',
    '*c 82 80 9',
    '#c 79 77 1.4',
    '#c 85 77 1.4',
    '#c 79 83 1.4',
    '#c 85 83 1.4',
  ],
  // ク wearing a tie: ta-da!
  タ: [
    '!M58 61l6 12l-4 8l-8-6z',
    'T 90 104 9 ta-da!',
    '!M14 30l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z',
  ],
  // a cheerleader with pom-poms
  チ: [
    '*c 72 8 6',
    '!c 13 50 7',
    '!c 98 48 7',
  ],
  // drops fall from the top, the wave crashes down
  ツ: [
    'M22 14v8M46 8v8',
    '*M4 100q20-10 40 0t40 0t26 0v8h-106z',
    'M84 20q8-6 14 2',
  ],
  // a telescope on a tripod
  テ: [
    'M48 90l-14 16M48 90l14 16',
    '!M90 8l2 5l5 2l-5 2l-2 5l-2-5l-5-2l5-2z',
    'M80 22q-2 6 2 10',
  ],
  // a totem pole with a branch, and a bird
  ト: [
    '*M38 16h16v20h-16z',
    '#c 42 24 1.5',
    '#c 50 24 1.5',
    '*M74 62c6-10 18-8 20 0z',
    '#c 88 58 1.2',
  ],
  // nailing into the wall
  ナ: [
    '*M42 4h22v8h-22z',
    'M62 12l14 10',
    'M36 18l-6-4M68 18l6-4',
    'M106 10v96',
  ],
  // two lines = 2
  ニ: [
    'T 100 40 10 1',
    'T 100 82 10 2',
  ],
  // noodles in a bowl
  ヌ: [
    '*M12 88h88q-6 20-44 20q-38 0-44-20z',
    'M44 14q-5-5 0-10M60 14q-5-5 0-10',
  ],
  // a neckerchief tied round a neck
  ネ: [
    '!M42 28l14 6l14-6l-4 10l-10-2l-10 2z',
    'M74 60q10 0 14 6M74 66q8 2 12 8',
  ],
  // a No sign
  ノ: [
    '^c 52 57 42',
  ],
  // laughter lines
  ハ: [
    'M40 22q5-5 10 0M60 22q5-5 10 0',
    'T 54 106 10 ha ha',
  ],
  // a high heel
  ヒ: [
    '!M32 84l-3 20h5l4-20z',
    '*M81 84q14 0 18-8l-18 2z',
  ],
  // Mount Fuji's flat top
  フ: [
    '*M2 106L26 26h58L107 106z',
    'M26 26l8 10l8-6l10 8l10-8l8 6l8-10',
  ],
  // a small hill
  ヘ: [
    '*M2 98L36 38q2-3 6 0L107 98z',
    '!M38 36v-16l12 4l-12 4',
  ],
  // a holy cross with two candles
  ホ: [
    '%M24 52q-3-4 0-8q3 4 0 8z',
    '%M82 46q-3-4 0-8q3 4 0 8z',
    'M54 2v8M38 6l4 6M70 6l-4 6',
  ],
  // a martini glass, tipped over
  マ: [
    '!c 68 44 5',
    'M68 44l10-12',
    '*M70 90q10-4 20 0q-10 4-20 0z',
  ],
  // singing mi mi mi
  ミ: [
    '%M86 30a3 2.4 0 1 0 .1 0z',
    'M89 29v-14l9-3v14',
    '%M98 26a3 2.4 0 1 0 .1 0z',
    'T 92 104 9 mi mi mi',
  ],
  // a cow's nose: moo
  ム: [
    '#c 46 70 3',
    '#c 62 70 3',
    'M22 22q-10-8-4-18M90 20q10-8 4-18',
    'T 96 106 9 moo',
  ],
  // a medic's X bandage
  メ: [
    '!M84 6h8v8h8v8h-8v8h-8v-8h-8v-8h8z',
    '#c 48 55 1.2',
    '#c 55 60 1.2',
    '#c 62 55 1.2',
  ],
  // a hook with more worms
  モ: [
    '!M38 18q3-5 6 0t6 0',
    '!M60 44q3-5 6 0t6 0t6 0',
  ],
  // a yacht on the water
  ヤ: [
    '*M8 96h88l-10 10h-68z',
    '!M38 19l14 5l-14 5',
  ],
  // a U-boat
  ユ: [
    '*M8 76q0-12 16-12h62q16 0 16 12q0 12-16 12h-62q-16 0-16-12z',
    'M48 33v-16h10',
    'M4 98q8-4 16 0t16 0t16 0t16 0t16 0t16 0',
  ],
  // yoga
  ヨ: [
    '*c 96 44 5',
    'M96 49v14M86 72q10-8 20 0M96 56l-8 6M96 56l8 6',
  ],
  // a rabbit with a flat ear
  ラ: [
    '*M78 20q16-10 22 0q-10 6-22 0z',
    '#c 66 52 2',
    '*c 30 94 5',
  ],
  // reeds
  リ: [
    '!M36 4q-3 7 0 14q3-7 0-14z',
    '!M72 2q-3 6 0 12q3-6 0-12z',
    'M8 104q8-4 16 0t16 0t16 0t16 0t16 0t16 0',
  ],
  // tree roots underground
  ル: [
    '-M4 28h100',
    '*c 46 12 10',
    'M46 22v6',
    '#c 70 92 1.5',
    '#c 30 100 1.5',
  ],
  // a leg kicking a ball
  レ: [
    '!M86 44l12-6l2 8l-10 4z',
    '*c 96 22 7',
    'M78 30l6 4M74 38l7 2',
  ],
  // a robot's square mouth
  ロ: [
    'M54 32v-16',
    '!c 54 12 4',
    'M38 54h32M46 50v8M54 50v8M62 50v8',
    '*c 14 56 5',
    '*c 94 56 5',
  ],
  // a tipped wine glass, spilling
  ワ: [
    '!M44 100q22-8 44 0q-22 8-44 0z',
    '!M78 88q-3 5 0 7q3-2 0-7z',
  ],
  // ワ with a bar to trip over
  ヲ: [
    'T 94 106 9 whoa!',
    'M90 60l6 4M92 70h8',
  ],
  // a winking face
  ン: [
    '*c 56 56 48',
    '#c 74 30 3',
    '!c 92 66 5',
  ],
}
