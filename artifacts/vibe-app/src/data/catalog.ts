import {
  Shirt, UserRound, Baby, Dumbbell, Layers,
  Footprints, ShoppingBag, Timer,
  FlaskConical, Sparkles, Flame, Gift,
  Gem, CircleDot, Link2, Star, Package, Coins,
  Percent, Tag,
} from "lucide-react";
import type { ElementType } from "react";

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */
export interface L1Category {
  id:    string;
  label: string;
  img:   string;
}

export interface L2Category {
  id:       string;
  label:    string;
  Icon:     ElementType;
  parentId: string;     // → L1Category.id
}

export interface L3Category {
  id:       string;
  label:    string;
  count:    number;
  image:    string;
  parentId: string;     // → L2Category.id
}

/* ════════════════════════════════════════════════════════════════
   IMAGES REGISTRY
════════════════════════════════════════════════════════════════ */
/**
 * مشكلة 95 + 96: صور التصنيفات كانت من static.codia.ai — فشل الـ CDN = صور مكسورة
 * استُبدلت كلها بـ Unsplash images موثوقة مع ?fm=webp لتقليل حجم الصورة
 */
const IMG = {
  women:   "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=300&q=80&fm=webp",
  men:     "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=300&q=80&fm=webp",
  kids:    "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&q=80&fm=webp",
  sport:   "https://images.unsplash.com/photo-1556906781-9a412961a28c?w=300&q=80&fm=webp",
  shoes:   "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80&fm=webp",
  bags:    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80&fm=webp",
  perfume: "/perfume-hero.png",
  oud:     "https://images.unsplash.com/photo-1541643600914-78b084683702?w=300&q=80&fm=webp",
  jewelry: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&q=80&fm=webp",
  watches: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&q=80&fm=webp",
  acc:     "https://images.unsplash.com/photo-1574201635302-388dd92a4c3f?w=300&q=80&fm=webp",
  tech:    "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300&q=80&fm=webp",
};

/* ════════════════════════════════════════════════════════════════
   LEVEL 1 — MAIN CATEGORIES  (Horizontal bar)
════════════════════════════════════════════════════════════════ */
export const l1Categories: L1Category[] = [
  {
    id:    "new",
    label: "جديدنا",
    img:   "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80&fm=webp",
  },
  {
    id:    "clothes",
    label: "ملابس",
    img:   IMG.women,
  },
  {
    id:    "shoes",
    label: "أحذية",
    img:   IMG.shoes,
  },
  {
    id:    "perfumes",
    label: "عطور",
    img:   IMG.perfume,
  },
  {
    id:    "jewelry",
    label: "مجوهرات",
    img:   IMG.jewelry,
  },
  {
    id:    "offers",
    label: "عروض",
    img:   "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&q=80&fm=webp",
  },
];

/* ════════════════════════════════════════════════════════════════
   LEVEL 2 — SUB-CATEGORIES  (Sidebar)
════════════════════════════════════════════════════════════════ */
export const l2Categories: L2Category[] = [

  /* ── جديدنا ── */
  { id: "new-women",  label: "نسائي",        Icon: Shirt,       parentId: "new" },
  { id: "new-men",    label: "رجالي",        Icon: UserRound,   parentId: "new" },
  { id: "new-shoes",  label: "أحذية",        Icon: Footprints,  parentId: "new" },
  { id: "new-bags",   label: "شنط",          Icon: ShoppingBag, parentId: "new" },
  { id: "new-perf",   label: "عطور",         Icon: FlaskConical,parentId: "new" },
  { id: "new-jewel",  label: "مجوهرات",      Icon: Gem,         parentId: "new" },
  { id: "new-acc",    label: "إكسسوارات",   Icon: Sparkles,    parentId: "new" },

  /* ── ملابس ── */
  { id: "women-clothes", label: "نسائي",         Icon: Shirt,     parentId: "clothes" },
  { id: "men-clothes",   label: "رجالي",         Icon: UserRound, parentId: "clothes" },
  { id: "kids-clothes",  label: "أطفال",         Icon: Baby,      parentId: "clothes" },
  { id: "sport-clothes", label: "رياضة",         Icon: Dumbbell,  parentId: "clothes" },
  { id: "abayas",        label: "عبايات وأردية", Icon: Layers,    parentId: "clothes" },

  /* ── أحذية ── */
  { id: "women-shoes", label: "نسائي",              Icon: Footprints,  parentId: "shoes" },
  { id: "men-shoes",   label: "رجالي",              Icon: UserRound,   parentId: "shoes" },
  { id: "kids-shoes",  label: "أطفال",              Icon: Baby,        parentId: "shoes" },
  { id: "sport-shoes", label: "رياضة",              Icon: Timer,       parentId: "shoes" },
  { id: "bags",        label: "شنط وإكسسوارات",    Icon: ShoppingBag, parentId: "shoes" },

  /* ── عطور ── */
  { id: "women-perfume", label: "نسائية",        Icon: FlaskConical, parentId: "perfumes" },
  { id: "men-perfume",   label: "رجالية",        Icon: FlaskConical, parentId: "perfumes" },
  { id: "unisex",        label: "مشتركة",       Icon: Sparkles,     parentId: "perfumes" },
  { id: "oud",           label: "مجموعة العود",  Icon: Flame,        parentId: "perfumes" },
  { id: "perfume-sets",  label: "مجموعات عطرية", Icon: Gift,         parentId: "perfumes" },

  /* ── مجوهرات ── */
  { id: "rings",        label: "خواتم",         Icon: Gem,      parentId: "jewelry" },
  { id: "bracelets",    label: "أساور",          Icon: CircleDot,parentId: "jewelry" },
  { id: "necklaces",    label: "قلائد وعقود",   Icon: Link2,    parentId: "jewelry" },
  { id: "earrings",     label: "أقراط",          Icon: Star,     parentId: "jewelry" },
  { id: "jewelry-sets", label: "طقم مجوهرات",   Icon: Package,  parentId: "jewelry" },
  { id: "silver",       label: "مجوهرات فضة",   Icon: Coins,    parentId: "jewelry" },

  /* ── عروض ── */
  { id: "offers-women",  label: "نسائي",   Icon: Shirt,        parentId: "offers" },
  { id: "offers-men",    label: "رجالي",   Icon: UserRound,    parentId: "offers" },
  { id: "offers-shoes",  label: "أحذية",   Icon: Footprints,   parentId: "offers" },
  { id: "offers-bags",   label: "شنط",     Icon: ShoppingBag,  parentId: "offers" },
  { id: "offers-perf",   label: "عطور",    Icon: Percent,      parentId: "offers" },
  { id: "offers-jewel",  label: "مجوهرات", Icon: Tag,          parentId: "offers" },
];

/* ════════════════════════════════════════════════════════════════
   LEVEL 3 — SECONDARY CATEGORIES  (Grid)
════════════════════════════════════════════════════════════════ */
export const l3Categories: L3Category[] = [

  /* ─── جديدنا ─────────────────────────────────── */
  { id: "nw-dresses",   label: "فساتين",           count: 340, image: IMG.women,  parentId: "new-women"  },
  { id: "nw-tops",      label: "بلايز",             count: 280, image: IMG.women,  parentId: "new-women"  },
  { id: "nw-pants",     label: "بناطيل",            count: 190, image: IMG.women,  parentId: "new-women"  },
  { id: "nw-bags",      label: "شنط",               count: 155, image: IMG.bags,   parentId: "new-women"  },
  { id: "nw-shoes",     label: "أحذية",             count: 130, image: IMG.shoes,  parentId: "new-women"  },
  { id: "nw-acc",       label: "إكسسوارات",        count: 95,  image: IMG.acc,    parentId: "new-women"  },

  { id: "nm-shirts",    label: "قمصان",             count: 190, image: IMG.men,    parentId: "new-men"    },
  { id: "nm-pants",     label: "بناطيل",            count: 160, image: IMG.men,    parentId: "new-men"    },
  { id: "nm-suits",     label: "بدل وبليزر",        count: 95,  image: IMG.men,    parentId: "new-men"    },
  { id: "nm-shoes",     label: "أحذية",             count: 115, image: IMG.shoes,  parentId: "new-men"    },
  { id: "nm-acc",       label: "إكسسوارات",        count: 80,  image: IMG.acc,    parentId: "new-men"    },

  { id: "ns-women",     label: "نسائي",             count: 210, image: IMG.shoes,  parentId: "new-shoes"  },
  { id: "ns-men",       label: "رجالي",             count: 175, image: IMG.shoes,  parentId: "new-shoes"  },
  { id: "ns-kids",      label: "أطفال",             count: 130, image: IMG.shoes,  parentId: "new-shoes"  },
  { id: "ns-sport",     label: "رياضي",             count: 95,  image: IMG.sport,  parentId: "new-shoes"  },

  { id: "nb-hand",      label: "حقيبة يد",          count: 240, image: IMG.bags,   parentId: "new-bags"   },
  { id: "nb-back",      label: "حقيبة ظهر",         count: 180, image: IMG.bags,   parentId: "new-bags"   },
  { id: "nb-clutch",    label: "كلاتش",             count: 120, image: IMG.bags,   parentId: "new-bags"   },
  { id: "nb-travel",    label: "حقيبة سفر",         count: 80,  image: IMG.bags,   parentId: "new-bags"   },

  { id: "np-women",     label: "نسائية",            count: 120, image: IMG.perfume,parentId: "new-perf"   },
  { id: "np-men",       label: "رجالية",            count: 95,  image: IMG.perfume,parentId: "new-perf"   },
  { id: "np-oud",       label: "عود",               count: 65,  image: IMG.oud,    parentId: "new-perf"   },
  { id: "np-sets",      label: "مجموعات",           count: 45,  image: IMG.perfume,parentId: "new-perf"   },

  { id: "nj-rings",     label: "خواتم",             count: 130, image: IMG.jewelry,parentId: "new-jewel"  },
  { id: "nj-brace",     label: "أساور",             count: 110, image: IMG.jewelry,parentId: "new-jewel"  },
  { id: "nj-neck",      label: "قلائد",             count: 95,  image: IMG.jewelry,parentId: "new-jewel"  },
  { id: "nj-ear",       label: "أقراط",             count: 85,  image: IMG.jewelry,parentId: "new-jewel"  },

  { id: "na-sungl",     label: "نظارات",            count: 280, image: IMG.acc,    parentId: "new-acc"    },
  { id: "na-belts",     label: "أحزمة",             count: 180, image: IMG.acc,    parentId: "new-acc"    },
  { id: "na-scarves",   label: "أوشحة",             count: 150, image: IMG.acc,    parentId: "new-acc"    },
  { id: "na-hats",      label: "قبعات",             count: 110, image: IMG.acc,    parentId: "new-acc"    },

  /* ─── ملابس ─────────────────────────────────── */
  { id: "wc-dresses",   label: "فساتين",            count: 340, image: IMG.women,  parentId: "women-clothes" },
  { id: "wc-tops",      label: "بلايز وتيشرتات",    count: 280, image: IMG.women,  parentId: "women-clothes" },
  { id: "wc-pants",     label: "بناطيل وجينز",      count: 190, image: IMG.women,  parentId: "women-clothes" },
  { id: "wc-jackets",   label: "جاكيتات ومعاطف",   count: 145, image: IMG.women,  parentId: "women-clothes" },
  { id: "wc-skirts",    label: "تنورات",            count: 130, image: IMG.women,  parentId: "women-clothes" },
  { id: "wc-sport",     label: "بدل رياضية",        count: 95,  image: IMG.sport,  parentId: "women-clothes" },
  { id: "wc-abayas",    label: "عبايات",            count: 85,  image: IMG.acc,    parentId: "women-clothes" },
  { id: "wc-shorts",    label: "شورتات",            count: 70,  image: IMG.women,  parentId: "women-clothes" },

  { id: "mc-shirts",    label: "قمصان رسمية",       count: 190, image: IMG.men,    parentId: "men-clothes"   },
  { id: "mc-pants",     label: "بناطيل كلاسيك",    count: 160, image: IMG.men,    parentId: "men-clothes"   },
  { id: "mc-suits",     label: "بدل وبليزر",        count: 95,  image: IMG.men,    parentId: "men-clothes"   },
  { id: "mc-casual",    label: "كاجوال وسبور",      count: 210, image: IMG.men,    parentId: "men-clothes"   },
  { id: "mc-jackets",   label: "جاكيتات",           count: 80,  image: IMG.men,    parentId: "men-clothes"   },
  { id: "mc-thobe",     label: "دشاديش وثياب",      count: 120, image: IMG.men,    parentId: "men-clothes"   },
  { id: "mc-pyjama",    label: "بيجامات",           count: 65,  image: IMG.men,    parentId: "men-clothes"   },

  { id: "kc-girls",     label: "بنات 2-8 سنوات",    count: 220, image: IMG.kids,   parentId: "kids-clothes"  },
  { id: "kc-boys",      label: "أولاد 2-8 سنوات",   count: 185, image: IMG.kids,   parentId: "kids-clothes"  },
  { id: "kc-baby",      label: "رضع 0-24 شهر",      count: 95,  image: IMG.kids,   parentId: "kids-clothes"  },
  { id: "kc-school",    label: "ملابس مدرسية",       count: 130, image: IMG.kids,   parentId: "kids-clothes"  },
  { id: "kc-party",     label: "مناسبات وأعياد",     count: 75,  image: IMG.kids,   parentId: "kids-clothes"  },

  { id: "sc-gym",       label: "لياقة وجيم",        count: 210, image: IMG.sport,  parentId: "sport-clothes" },
  { id: "sc-swim",      label: "سباحة",             count: 95,  image: IMG.sport,  parentId: "sport-clothes" },
  { id: "sc-run",       label: "ركض وجري",          count: 150, image: IMG.sport,  parentId: "sport-clothes" },
  { id: "sc-football",  label: "كرة قدم",           count: 80,  image: IMG.sport,  parentId: "sport-clothes" },
  { id: "sc-yoga",      label: "يوغا وبيلاتس",      count: 65,  image: IMG.sport,  parentId: "sport-clothes" },

  { id: "ab-gulf",      label: "عبايات خليجية",     count: 185, image: IMG.acc,    parentId: "abayas"        },
  { id: "ab-flowy",     label: "عبايات كلوش",       count: 145, image: IMG.acc,    parentId: "abayas"        },
  { id: "ab-emb",       label: "عبايات مطرزة",      count: 110, image: IMG.acc,    parentId: "abayas"        },
  { id: "ab-shawl",     label: "أردية وشالات",      count: 80,  image: IMG.acc,    parentId: "abayas"        },
  { id: "ab-hijab",     label: "خمار وحجاب",        count: 95,  image: IMG.acc,    parentId: "abayas"        },

  /* ─── أحذية ─────────────────────────────────── */
  { id: "ws-heels",     label: "كعب عالي",          count: 210, image: IMG.shoes,  parentId: "women-shoes" },
  { id: "ws-flats",     label: "مسطح وبلر",         count: 180, image: IMG.shoes,  parentId: "women-shoes" },
  { id: "ws-sandals",   label: "صنادل صيفية",       count: 160, image: IMG.shoes,  parentId: "women-shoes" },
  { id: "ws-boots",     label: "بوت وأنكل بوت",     count: 130, image: IMG.shoes,  parentId: "women-shoes" },
  { id: "ws-sneakers",  label: "سنيكرز نسائي",      count: 110, image: IMG.sport,  parentId: "women-shoes" },

  { id: "ms-formal",    label: "أحذية رسمية",       count: 155, image: IMG.shoes,  parentId: "men-shoes" },
  { id: "ms-casual",    label: "حذاء كاجوال",       count: 180, image: IMG.shoes,  parentId: "men-shoes" },
  { id: "ms-sneakers",  label: "سنيكرز رجالي",      count: 175, image: IMG.sport,  parentId: "men-shoes" },
  { id: "ms-sandal",    label: "صندل وشبشب",        count: 120, image: IMG.shoes,  parentId: "men-shoes" },
  { id: "ms-boots",     label: "بوت رجالي",         count: 95,  image: IMG.shoes,  parentId: "men-shoes" },

  { id: "ks-girls",     label: "أحذية بنات",        count: 185, image: IMG.shoes,  parentId: "kids-shoes" },
  { id: "ks-boys",      label: "أحذية أولاد",       count: 170, image: IMG.shoes,  parentId: "kids-shoes" },
  { id: "ks-baby",      label: "أحذية رضع",         count: 90,  image: IMG.shoes,  parentId: "kids-shoes" },
  { id: "ks-sport",     label: "رياضي أطفال",       count: 130, image: IMG.sport,  parentId: "kids-shoes" },

  { id: "ss-run",       label: "أحذية جري",         count: 180, image: IMG.sport,  parentId: "sport-shoes" },
  { id: "ss-train",     label: "تدريب رياضي",       count: 145, image: IMG.sport,  parentId: "sport-shoes" },
  { id: "ss-football",  label: "كرة قدم",           count: 95,  image: IMG.sport,  parentId: "sport-shoes" },
  { id: "ss-walk",      label: "سير ومشي",          count: 110, image: IMG.sport,  parentId: "sport-shoes" },

  { id: "bg-hand",      label: "حقيبة يد",          count: 240, image: IMG.bags,   parentId: "bags" },
  { id: "bg-back",      label: "حقيبة ظهر",         count: 180, image: IMG.bags,   parentId: "bags" },
  { id: "bg-clutch",    label: "كلاتش ومحفظة",      count: 120, image: IMG.bags,   parentId: "bags" },
  { id: "bg-travel",    label: "حقيبة سفر",         count: 80,  image: IMG.bags,   parentId: "bags" },
  { id: "bg-belt",      label: "أحزمة جلدية",       count: 150, image: IMG.acc,    parentId: "bags" },

  /* ─── عطور ─────────────────────────────────── */
  { id: "wp-floral",    label: "فلورال",            count: 120, image: IMG.perfume,parentId: "women-perfume" },
  { id: "wp-oriental",  label: "شرقي",              count: 95,  image: IMG.oud,    parentId: "women-perfume" },
  { id: "wp-fruity",    label: "فروتي",             count: 75,  image: IMG.perfume,parentId: "women-perfume" },
  { id: "wp-sporty",    label: "سبورتي",            count: 55,  image: IMG.perfume,parentId: "women-perfume" },
  { id: "wp-classic",   label: "كلاسيك",           count: 85,  image: IMG.perfume,parentId: "women-perfume" },

  { id: "mp-oud",       label: "عود وخشب",          count: 110, image: IMG.oud,    parentId: "men-perfume" },
  { id: "mp-citrus",    label: "سيتروس",            count: 85,  image: IMG.perfume,parentId: "men-perfume" },
  { id: "mp-fruity",    label: "فاكهة",             count: 70,  image: IMG.perfume,parentId: "men-perfume" },
  { id: "mp-musk",      label: "مسك",               count: 90,  image: IMG.perfume,parentId: "men-perfume" },
  { id: "mp-marine",    label: "بحري",              count: 60,  image: IMG.perfume,parentId: "men-perfume" },

  { id: "un-oud",       label: "عود",               count: 75,  image: IMG.oud,    parentId: "unisex" },
  { id: "un-musk",      label: "مسك أبيض",          count: 55,  image: IMG.perfume,parentId: "unisex" },
  { id: "un-rose",      label: "ورد",               count: 45,  image: IMG.perfume,parentId: "unisex" },
  { id: "un-fruity",    label: "فاكهة",             count: 40,  image: IMG.perfume,parentId: "unisex" },

  { id: "od-saudi",     label: "عود سعودي",         count: 65,  image: IMG.oud,    parentId: "oud" },
  { id: "od-hindi",     label: "عود هندي",          count: 55,  image: IMG.oud,    parentId: "oud" },
  { id: "od-dehn",      label: "عود دهني",          count: 70,  image: IMG.oud,    parentId: "oud" },
  { id: "od-bkhur",     label: "عود بخور",          count: 45,  image: IMG.oud,    parentId: "oud" },

  { id: "ps-men",       label: "طقم رجالي",         count: 55,  image: IMG.perfume,parentId: "perfume-sets" },
  { id: "ps-women",     label: "طقم نسائي",         count: 60,  image: IMG.perfume,parentId: "perfume-sets" },
  { id: "ps-unisex",    label: "طقم مشترك",         count: 35,  image: IMG.perfume,parentId: "perfume-sets" },
  { id: "ps-gift",      label: "هدية خاصة",         count: 40,  image: IMG.perfume,parentId: "perfume-sets" },

  /* ─── مجوهرات ─────────────────────────────── */
  { id: "ri-gold",      label: "خاتم ذهب",          count: 130, image: IMG.jewelry,parentId: "rings" },
  { id: "ri-silver",    label: "خاتم فضة",          count: 110, image: IMG.jewelry,parentId: "rings" },
  { id: "ri-diamond",   label: "خاتم ماسي",         count: 80,  image: IMG.jewelry,parentId: "rings" },
  { id: "ri-crystal",   label: "خاتم كريستال",      count: 95,  image: IMG.jewelry,parentId: "rings" },
  { id: "ri-ring",      label: "طوق",               count: 65,  image: IMG.jewelry,parentId: "rings" },

  { id: "br-gold",      label: "سوار ذهب",          count: 120, image: IMG.jewelry,parentId: "bracelets" },
  { id: "br-silver",    label: "سوار فضة",          count: 105, image: IMG.jewelry,parentId: "bracelets" },
  { id: "br-chain",     label: "أساور شبكة",        count: 80,  image: IMG.jewelry,parentId: "bracelets" },
  { id: "br-ghway",     label: "غوايش",             count: 90,  image: IMG.jewelry,parentId: "bracelets" },
  { id: "br-charm",     label: "تشارم",             count: 70,  image: IMG.jewelry,parentId: "bracelets" },

  { id: "ne-gold",      label: "قلادة ذهب",         count: 115, image: IMG.jewelry,parentId: "necklaces" },
  { id: "ne-silver",    label: "قلادة فضة",         count: 100, image: IMG.jewelry,parentId: "necklaces" },
  { id: "ne-pearl",     label: "قلادة لؤلؤ",        count: 75,  image: IMG.jewelry,parentId: "necklaces" },
  { id: "ne-aqd",       label: "عقد",               count: 85,  image: IMG.jewelry,parentId: "necklaces" },
  { id: "ne-stone",     label: "قلادة حجر كريم",    count: 60,  image: IMG.jewelry,parentId: "necklaces" },

  { id: "ea-circle",    label: "حلق دائري",         count: 140, image: IMG.jewelry,parentId: "earrings" },
  { id: "ea-diamond",   label: "أقراط ماسية",       count: 100, image: IMG.jewelry,parentId: "earrings" },
  { id: "ea-drop",      label: "أقراط معلقة",       count: 120, image: IMG.jewelry,parentId: "earrings" },
  { id: "ea-stud",      label: "غرز ستد",           count: 110, image: IMG.jewelry,parentId: "earrings" },

  { id: "js-gold",      label: "طقم ذهب",           count: 55,  image: IMG.jewelry,parentId: "jewelry-sets" },
  { id: "js-silver",    label: "طقم فضة",           count: 65,  image: IMG.jewelry,parentId: "jewelry-sets" },
  { id: "js-crystal",   label: "طقم كريستال",       count: 45,  image: IMG.jewelry,parentId: "jewelry-sets" },
  { id: "js-pearl",     label: "طقم لؤلؤ",          count: 40,  image: IMG.jewelry,parentId: "jewelry-sets" },

  { id: "si-rings",     label: "خواتم فضة",         count: 130, image: IMG.jewelry,parentId: "silver" },
  { id: "si-brace",     label: "أساور فضة",         count: 115, image: IMG.jewelry,parentId: "silver" },
  { id: "si-neck",      label: "قلائد فضة",         count: 100, image: IMG.jewelry,parentId: "silver" },
  { id: "si-ear",       label: "أقراط فضة",         count: 95,  image: IMG.jewelry,parentId: "silver" },

  /* ─── عروض (نفس مجموعات الملابس والأحذية مع تمييز الخصم) ── */
  { id: "ow-dresses",   label: "فساتين",            count: 125, image: IMG.women,  parentId: "offers-women" },
  { id: "ow-tops",      label: "بلايز",             count: 98,  image: IMG.women,  parentId: "offers-women" },
  { id: "ow-pants",     label: "بناطيل",            count: 87,  image: IMG.women,  parentId: "offers-women" },
  { id: "ow-sport",     label: "رياضية",            count: 63,  image: IMG.sport,  parentId: "offers-women" },
  { id: "ow-abayas",    label: "عبايات",            count: 52,  image: IMG.acc,    parentId: "offers-women" },

  { id: "om-shirts",    label: "قمصان",             count: 88,  image: IMG.men,    parentId: "offers-men" },
  { id: "om-pants",     label: "بناطيل",            count: 72,  image: IMG.men,    parentId: "offers-men" },
  { id: "om-suits",     label: "بدل",               count: 45,  image: IMG.men,    parentId: "offers-men" },
  { id: "om-casual",    label: "كاجوال",            count: 95,  image: IMG.men,    parentId: "offers-men" },
  { id: "om-thobe",     label: "دشاديش",            count: 55,  image: IMG.men,    parentId: "offers-men" },

  { id: "os-women",     label: "نسائي",             count: 95,  image: IMG.shoes,  parentId: "offers-shoes" },
  { id: "os-men",       label: "رجالي",             count: 78,  image: IMG.shoes,  parentId: "offers-shoes" },
  { id: "os-kids",      label: "أطفال",             count: 55,  image: IMG.shoes,  parentId: "offers-shoes" },
  { id: "os-sport",     label: "رياضي",             count: 62,  image: IMG.sport,  parentId: "offers-shoes" },

  { id: "ob-hand",      label: "حقيبة يد",          count: 85,  image: IMG.bags,   parentId: "offers-bags" },
  { id: "ob-back",      label: "حقيبة ظهر",         count: 65,  image: IMG.bags,   parentId: "offers-bags" },
  { id: "ob-clutch",    label: "كلاتش",             count: 48,  image: IMG.bags,   parentId: "offers-bags" },
  { id: "ob-travel",    label: "سفر",               count: 35,  image: IMG.bags,   parentId: "offers-bags" },

  { id: "op-women",     label: "نسائية",            count: 55,  image: IMG.perfume,parentId: "offers-perf" },
  { id: "op-men",       label: "رجالية",            count: 42,  image: IMG.perfume,parentId: "offers-perf" },
  { id: "op-sets",      label: "مجموعات",           count: 28,  image: IMG.perfume,parentId: "offers-perf" },
  { id: "op-oud",       label: "عود",               count: 35,  image: IMG.oud,    parentId: "offers-perf" },

  { id: "oj-rings",     label: "خواتم",             count: 65,  image: IMG.jewelry,parentId: "offers-jewel" },
  { id: "oj-brace",     label: "أساور",             count: 50,  image: IMG.jewelry,parentId: "offers-jewel" },
  { id: "oj-neck",      label: "قلائد",             count: 42,  image: IMG.jewelry,parentId: "offers-jewel" },
  { id: "oj-sets",      label: "طقم",               count: 30,  image: IMG.jewelry,parentId: "offers-jewel" },
];

/* ════════════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════════════ */
export function getL2ByL1(l1Id: string): L2Category[] {
  return l2Categories.filter((c) => c.parentId === l1Id);
}

export function getL3ByL2(l2Id: string): L3Category[] {
  return l3Categories.filter((c) => c.parentId === l2Id);
}

export function defaultL2(l1Id: string): string {
  return getL2ByL1(l1Id)[0]?.id ?? "";
}
