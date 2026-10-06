/* ==========================================================
   Sumi's Birthday - content
   Shob lekha, chhobi ar default setting ekhane.
   Website-er Admin panel theke o egulo bodlano jay.
   ========================================================== */

export type PageId = 'home' | 'cake' | 'gallery' | 'wishes' | 'letter' | 'admin';

export interface Photo { src: string; caption: string; poem?: string }
export interface Memory { year: string; title: string; text: string; photo: string }
export interface Wish {
  name: string;
  text: string;
  emoji: string;
  /** Note colour (index into WISH_BG) */
  color?: number;
  /** When it was written (ms) */
  at?: number;
}
export type Paper = 'khata' | 'notepad' | 'diary' | 'grid' | 'sticky' | 'kraft' | 'airmail' | 'chalk' | 'dotted' | 'parchment' | 'midnight' | 'polaroid' | 'sakura' | 'gazette';
export interface Quote {
  text: string;
  orig?: string;
  author: string;
  /** Page style; empty = take turns */
  paper?: Paper | '';
}
export interface QuizItem { q: string; opts: string; a: number }
export interface StoryItem { date: string; title: string; text: string; photo: string }
export interface Effects { particles: boolean; fireworks: boolean; confetti: boolean; cursor: boolean }

export interface Config {
  v: number;
  name: string;
  fullName: string;
  sender: string;
  date: string;
  passcode: string;
  music: string;
  candles: number | string;
  lock: boolean;
  heroKicker: string;
  heroNote: string;
  heroSub: string;
  heroWords: string;
  reasons: string[];
  tags: string[];
  emojis: string;
  cakeTitle: string;
  cakePhoto: string;
  giftPhoto: string;
  photos: Photo[];
  letterIntro: string;
  timeline: Memory[];
  wishes: Wish[];
  letter: string;
  giftTitle: string;
  giftText: string;
  thanksText: string;
  quiz: QuizItem[];
  quotes: Quote[];
  status: string[];
  story: StoryItem[];
  effects: Effects;
}

export const IMG = (i: number): string => 'assets/sumi-' + i + '.jpeg';
export const KEY = 'sumi_bday_cfg_v1';
export const COLORS = ['#cbec95', '#ecf5a8', '#ffd27a', '#9ad677', '#f2f8e6', '#7fe0b0', '#d7f56f'];
export const PAGES: [PageId, string, string][] = [['home','home','Home'],['cake','cake','Cake'],['gallery','photo_library','Photos'],['wishes','volunteer_activism','Wishes'],['letter','mail','Letter']];
export const CH: [string, string][] = [['Cake time', 'আগে wish, তারপর ফুঁ'], ['Photos', 'তোমার সব ছবি এক জায়গায়'], ['Wishes', 'সবাই কী লিখলো দেখো'], ['The letter', 'সামনে যেগুলো বলতে পারি না']];
export const PHASE: Record<string, [string, string]> = { wish: ['চোখ বন্ধ করো, wish করো…', 'তাড়াহুড়ো নেই'], blow: ['এবার ফুঁ…', 'সবগুলো একবারে!'], granted: ['হয়ে গেছে!', 'wish টা পূরণ হবেই'], cut: ['এবার কাটি', 'প্রথম টুকরো কার?'], served: ['প্রথম টুকরো তোমার', 'happy birthday'] };
export const DRIPS: [number, number][] = [[3,22],[12,34],[21,18],[30,40],[40,24],[49,30],[58,16],[67,38],[76,22],[85,32],[93,18]];
export const WISH_BG = [{ bg: '#cbec95', fg: '#0f2218', sig: '#2b4a33' }, { bg: '#183224', fg: '#f2f8e6', sig: '#ecf5a8' }, { bg: '#ecf5a8', fg: '#0f2218', sig: '#2b4a33' }, { bg: '#f2f8e6', fg: '#0f2218', sig: '#3f6a3a' }];
export const FILM_ORG = ['50% 35%', '30% 50%', '70% 40%', '50% 65%'];
export const TEXT_KEYS: string[] = ['quotes', 'heroKicker', 'heroNote', 'heroSub', 'heroWords', 'reasons', 'tags', 'cakeTitle', 'letterIntro', 'letter', 'giftTitle', 'giftText', 'thanksText', 'timeline', 'quiz', 'status'];
export const NEW_QUOTE_V9 = "এই যে তোমাকে দেখিয়া আমার ভালো লাগে,\nএটাই কি কম লাভ?\nজীবনে ভালো লাগিবার লোক\nকোটিতে গুটিক মেলে।";

export const DEF: Config = {
  v: 9, name: 'SUMI', fullName: 'KHADIZA SUMI', sender: 'SOUROVE', date: '2026-10-07T00:00', passcode: 'sumi07',
  music: 'https://www.youtube.com/watch?v=_z-1fTlSDF0', candles: 5, lock: false,
  heroKicker: "০৭ অক্টোবর · তোমার দিন",
  heroNote: "অনেকদিন ধরে লুকিয়ে লুকিয়ে বানাচ্ছিলাম এটা। আস্তে আস্তে নিচে নামো, তাড়াহুড়ো করো না।",
  heroSub: "আজ তোমার জন্মদিন,\nআর আমি সকাল থেকে শুধু তোমার কথাই ভাবছি।\nতুমি হাসলে আমার দিনটা ভালো যায়,\nতাই আজ সারাদিন হাসবে, ঠিক আছে?\nশুভ জন্মদিন, Sumi।",
  heroWords: "আমার প্রিয় মানুষ, পাগলি একটা, My Sunshine, সবচেয়ে সুন্দর, Forever mine",
  reasons: ["তুমি হাসলে মনে হয়, দিনটা ঠিকঠাক যাবে","তোমার পাশে চুপ করে বসে থাকলেও শান্তি লাগে","ছোট ছোট জিনিসে তুমি বাচ্চাদের মতো খুশি হয়ে যাও","আমার সব পাগলামি তুমি হাসিমুখে সামলে নাও","রাগ করো ঠিকই, কিন্তু বেশিক্ষণ থাকতে পারো না","তোমার চেহারায় একটা মায়া আছে, যেটা আর কোথাও পাই না","আর সবচেয়ে বড় কারণ, তুমি তুমি বলেই"],
  tags: ['My Sunshine','লম্বা চুলের রানি','আমার প্রিয় মানুষ','Flower Soul','The Drum Girl','চাঁদের মতো হাসি','Forever Mine'],
  emojis: '💖🌸🎀🎈✨🎂🦋🌷',
  cakeTitle: 'Cake time',
  cakePhoto: IMG(3), giftPhoto: IMG(9),
  photos: [
    { src: IMG(7), caption: 'মেঘের নিচে রাজকন্যা', poem: 'ছাদের কোণে দাঁড়িয়ে তুমি হাসলে,\nআর মেঘগুলো একটু সরে দাঁড়াল,\nযাতে রোদ্দুর তোমাকে ছুঁতে পারে।' },
    { src: IMG(3), caption: 'এই হাসিটার জন্য', poem: 'চুলে আঙুল, চোখে দুষ্টুমি।\nএই একটা হাসির জন্য\nআমি সারাটা জীবন অপেক্ষা করতে পারি।' },
    { src: IMG(9), caption: 'বাতাসে উড়ছে চুল', poem: 'আকাশ নীল, বাতাস পাগল,\nআর তোমার চুলের ভাঁজে লুকিয়ে আছে\nআমার সব প্রিয় বিকেল।' },
    { src: IMG(8), caption: 'সোনালি বিকেল', poem: 'শেষ বিকেলের সোনালি আলো\nতোমার মুখে এসে থেমে গেল।\nআলোও জানে কোথায় থামতে হয়।' },
    { src: IMG(5), caption: 'লাল ওড়নার রানি', poem: 'লাল ওড়নায় একটু লাজুক তুমি,\nএকটু রানি, একটু রহস্য,\nআর পুরোটাই আমার।' },
    { src: IMG(6), caption: 'আকাশের দিকে চোখ', poem: 'তুমি তাকিয়ে থাকো আকাশের দিকে,\nআমি তাকিয়ে থাকি তোমার দিকে।\nআমার আকাশ তো তুমিই।' },
    { src: IMG(4), caption: 'The drum girl', poem: 'মাঠের সবুজে বসে drum-এর তালে\nতুমি একবার হাসলে,\nআর আমার হৃদয় তাল হারাল।' },
    { src: IMG(2), caption: 'একটা কাঠগোলাপ', poem: 'হাতে একটা কাঠগোলাপ এগিয়ে দিলে।\nফুলটা সুন্দর ছিল,\nকিন্তু তোমার চেয়ে বেশি না।' },
    { src: IMG(1), caption: 'ছোট্ট Sumi', poem: 'লাল টুপি, দুটো বেণী, দুই হাতে peace sign।\nসেই ছোট্ট মেয়েটাই\nআজ আমার পুরো পৃথিবী।' }
  ],
  letterIntro: "তোমার কিছু পুরোনো ছবি খুঁজে পেলাম।\nদেখতে দেখতে মনে হলো, ছোট্ট মেয়েটা কত বড় হয়ে গেছে।\nতাই একটু লিখে রাখলাম।",
  timeline: [
    { year: 'ছোটবেলা', title: 'The little dreamer', text: 'লাল টুপি, দুটো বেণী,\nদুই হাতে peace sign।\nসেদিনও তুমি জানতে,\nহাসি দিয়েই পৃথিবী জয় করা যায়।', photo: IMG(1) },
    { year: 'স্কুলের দিন', title: 'Rhythm of her heart', text: 'মাঠের সবুজে বসে,\ndrum-এর উপর থুতনি রেখে,\nএক চিলতে হাসিতে বলে দিলে,\nthe beat goes on.', photo: IMG(4) },
    { year: 'এক বিকেলে', title: 'একটা ফুল, এক আকাশ', text: 'হাতে একটা কাঠগোলাপ,\nমাথার উপর মেঘের সমুদ্র।\nছোট ছোট জিনিসে সৌন্দর্য খুঁজে পাওয়া,\nএটাই তো তুমি।', photo: IMG(2) },
    { year: 'রোদ্দুর দুপুর', title: 'That smile', text: 'চুলে আঙুল, চোখে দুষ্টু হাসি,\nক্যামেরার দিকে তাকিয়ে যেন বললে, তোলো তো।\nসেই ছবিটা আজও দেখলে\nমনটা এমনিই ভালো হয়ে যায়।', photo: IMG(3) },
    { year: 'লাল ওড়নার দিন', title: 'Wrapped in red', text: 'লাল ওড়নায় মুখ ঢেকে,\nএকটু লাজুক, একটু রানি।\nবাতাস এসে চুল ছুঁয়ে গেল,\nআর আকাশটা যেন থমকে দাঁড়াল।', photo: IMG(5) },
    { year: 'আজ', title: 'আজকের তুমি', text: 'আরও একটু সুন্দর,\nআরও একটু strong।\nএকটা নতুন বছর, একটা নতুন গল্প,\nশুরু হোক আজ থেকে।', photo: IMG(7) }
  ],
  wishes: [
    { name: 'SOUROVE', text: 'শুভ জন্মদিন, আমার প্রিয় মানুষ। তোমার প্রতিটা সকাল হোক আজকের মতো আলো ঝলমলে, আর প্রতিটা রাতে আমি থাকি তোমার পাশে।', emoji: '💖' }
  ],
  letter: "প্রিয় Sumi,\n\nশুভ জন্মদিন।\n\nসামনাসামনি এসব কথা বলতে গেলে আমি আটকে যাই, তাই লিখে দিলাম।\n\nতুমি আসার পর অনেক কিছু বদলে গেছে। খারাপ দিনগুলো আর আগের মতো খারাপ লাগে না, ভালো দিনগুলো আরো ভালো লাগে। তোমার সাথে কথা না হলে দিনটাই অসম্পূর্ণ লাগে।\n\nমাঝে মাঝে রাগ করি, বোকার মতো কথা বলি, তবুও তুমি থেকে যাও। এটার জন্য কখনো ঠিকমতো thank you বলা হয়নি। আজ বলছি, thank you।\n\nএই বছরটা তোমার খুব ভালো কাটুক। যা চাও, সব যেন পাও। আর যা-ই হোক, আমি পাশে আছি।\n\nভালোবাসি।\nতোমার,",
  giftTitle: "সে সুন্দর কিনা জানি না!",
  giftText: "তবে এটুকু জানি যে,\nতাকে দেখলে আমার অদ্ভুত একটা মায়া লাগে, শান্তি লাগে।\n\nএটা খুবই ভিন্ন রকমের এক অনুভূতি।\nযেই অনুভূতিটা দুনিয়ার আর কারো চেহারায়\nআমি খুঁজে পাই না।",
  thanksText: "তোমাকে নিয়ে আমার খুব বড় কোনো চাওয়া নেই।\nশুধু চাই, দিনশেষে কথা বলার মানুষটা তুমিই থাকো।\nআজ, কাল, সবসময়।",
  quiz: [
    { q: 'Sumi-র সবচেয়ে সুন্দর জিনিস কোনটা?', opts: 'লম্বা চুল|Drum বাজানো|মিষ্টি হাসি|সবগুলোই', a: 3 },
    { q: 'Sumi-র জন্মদিন কবে?', opts: '৫ অক্টোবর|৭ অক্টোবর|১০ অক্টোবর|৭ নভেম্বর', a: 1 },
    { q: 'School band-এ Sumi কী বাজাতো?', opts: 'Guitar|Drum|Flute|Piano', a: 1 },
    { q: 'Sumi রেগে গেলে কী করা উচিত?', opts: 'চুপ থাকা|আইসক্রিম দেওয়া|সরি বলা|সবগুলো একসাথে!', a: 3 },
    { q: 'Sumi-র best friend কে?', opts: 'জানি না|অন্য কেউ|কেউ না|SOUROVE ছাড়া আর কে!', a: 3 }
  ],
  quotes: [
    { text: "এই যে তোমাকে দেখিয়া আমার ভালো লাগে,\nএটাই কি কম লাভ?\nজীবনে ভালো লাগিবার লোক\nকোটিতে গুটিক মেলে।", orig: '', author: '' },
    {text: "মায়া এক কঠিন জিনিস...\n\nমানুষ অপমান ভুলে যায়, অধিক অত্যাচার ভুলে যায়,\nঅধিক ভালোবাসাও ভুলে যায়,\nকিন্তু কারোর মায়ায় পড়ে গেলে তাকে ভুলে যায় না!!",orig: "",author: ""},
    {text: "সুন্দর বলে কিছু হয় না,\nতুমি যাকে যত বেশি ভালোবাসবে,\nতাকে তত বেশি সুন্দর মনে হবে!",orig: "",author: ""},
    {text: "তোমাকে দেখার পর বুঝলাম,\nশান্তি জিনিসটা কোনো জায়গা না,\nএকটা মানুষ।",orig: "",author: ""},
    {text: "কিছু মানুষ চোখের সামনে না থাকলেও\nমনের ভেতর ঠিকই থেকে যায়।\nতুমি সেরকমই একজন।",orig: "",author: ""},
    {text: "ভালোবাসা হয়তো কখনো কমে যায়,\nকিন্তু মায়া শুধু বাড়তেই থাকে।",orig: "",author: ""},
    { text: 'তোমারেই যেন ভালোবাসিয়াছি শত রূপে শত বার,\nজনমে জনমে, যুগে যুগে অনিবার।', orig: '', author: 'রবীন্দ্রনাথ ঠাকুর' },
    { text: 'চুল তার কবেকার অন্ধকার বিদিশার নিশা,\nমুখ তার শ্রাবস্তীর কারুকার্য।', orig: '', author: 'জীবনানন্দ দাশ' },
    { text: 'ভালোবাসায় জোর খাটে না, এ এমন এক আগুন, গালিব,\nচাইলেই জ্বলে না, নেভাতে চাইলেও নেভে না।', orig: 'Ishq par zor nahin, hai ye woh aatish Ghalib\nKe lagaye na lage aur bujhaye na bane', author: 'মির্জা গালিব' },
    { text: 'ভালোবাসায় বাঁচা আর মরার কোনো তফাত নেই,\nযাকে দেখে প্রাণ যায়, তাকে দেখেই তো বেঁচে থাকি।', orig: 'Mohabbat mein nahin hai farq jeene aur marne ka\nUsi ko dekh kar jeete hain jis kafir pe dam nikle', author: 'মির্জা গালিব' },
    { text: 'আমি তাকেই চেয়েছি যে আমার নীরবতা পড়তে পারে,\nযে হাজারো ভিড়েও শুধু আমার চোখের ভাষা বোঝে।', orig: '', author: '', paper: 'parchment' },
    { text: 'তুমি আমার রাতের আকাশের সবচেয়ে উজ্জ্বল ধ্রুবতারা,\nযার আলোতে পথ হারিয়েও ফিরে আসা যায়।', orig: 'You are my brightest star in the endless night sky', author: '', paper: 'midnight' },
    { text: 'প্রতিটি সাধারণ মুহূর্তও অসাধারণ হয়ে ওঠে,\nযখন তুমি পাশে থাকো।', orig: '', author: 'স্মৃতির ফ্রেম', paper: 'polaroid' },
    { text: 'বসন্তের সব ফুল একপাশে, আর তোমার এক চিলতে হাসি অন্যপাশে—\nতবু তোমার হাসিটাই পৃথিবীর সবচেয়ে স্নিগ্ধ অনুভূতি।', orig: '', author: '', paper: 'sakura' },
    { text: 'যেখানে ভালোবাসা সত্যি,\nসেখানে হাজারো দূরত্বের মাঝেও দুটি হৃদয় সবসময় পাশাপাশি থাকে।', orig: 'Love knows no distance', author: 'Love Chronicle', paper: 'gazette' }
  ],
  status: [
    "কিছু মানুষকে দেখলেই শান্তি লাগে। আমার সেই মানুষটার আজ জন্মদিন।",
    "শুভ জন্মদিন, Sumi। সবসময় এভাবেই হাসতে থেকো।",
    "৭ অক্টোবর। বছরের সবচেয়ে প্রিয় তারিখ।",
    "Happy birthday to my favourite person."
  ],
  story: [
    {
      date: 'প্রথম আলাপ',
      title: 'সেই সুন্দর শুরুটা',
      text: 'কখন যে সাধারণ কিছু কথা থেকে তুমি আমার পুরো পৃথিবী হয়ে উঠলে, বুঝতেই পারিনি। জীবনের সেরা প্রাপ্তিগুলো এভাবেই অজান্তে চলে আসে।',
      photo: IMG(2)
    },
    {
      date: 'এক সোনালি বিকেল',
      title: 'তোমার সেই মিষ্টি দুষ্টুমি',
      text: 'ক্যামেরার দিকে তাকিয়ে তোমার সেই দুষ্টু মিষ্টি হাসি। সেদিন প্রথম বুঝেছিলাম—কিছু মানুষকে ভালোবাসতে আসলেই কোনো কারণ লাগে না।',
      photo: IMG(3)
    },
    {
      date: 'লাল ওড়নার দিন',
      title: 'একটু লাজুক, একটু রানি',
      text: 'লাল ওড়নায় মুখ ঢেকে তোমার সেই লাজুক চাহনি। বাতাস এসে চুল ছুঁয়ে গেল, আর আমি নির্বাক হয়ে চেয়ে রইলাম।',
      photo: IMG(5)
    },
    {
      date: '০৭ অক্টোবর',
      title: 'আজকের এই বিশেষ দিন',
      text: 'আজ তোমার জন্মদিন। সৃষ্টিকর্তার কাছে একটাই চাওয়া—তোমার মুখে এই সুন্দর অমলিন হাসিটা যেন সারাজীবন এভাবেই থাকে। ভালোবাসি।',
      photo: IMG(7)
    }
  ],
  effects: { particles: true, fireworks: true, confetti: true, cursor: true }
};
