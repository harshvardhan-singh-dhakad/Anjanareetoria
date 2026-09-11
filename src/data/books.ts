import { Product } from './products';

export type BookFormat = 'ebook' | 'physical' | 'both';

export interface BookChapter {
  number: number;
  title: string;
  summary: string;
}

export interface Book extends Product {
  author: string;
  formatType: BookFormat;
  pages: number;
  language: string;
  publishedYear: number;
  isbn?: string;
  ebookPrice?: number;
  physicalPrice?: number;
  tableOfContents: BookChapter[];
  sampleExcerpt: {
    chapterTitle: string;
    subheading?: string;
    paragraphs: string[];
  };
  downloadFormat?: string;
  badge?: string;
}

export const books: Book[] = [
  {
    id: "bk-101",
    slug: "karodon-ka-rahasya",
    name: "Karodon Ka Rahasya (करोड़ों का रहस्य)",
    price: 499,
    originalPrice: 999,
    discountPercent: 50,
    rating: 4.9,
    reviewCount: 48,
    image: "/images/books/karodon-ka-rahasya.svg",
    inStock: true,
    category: "Books & E-Books",
    author: "AR Blessings Research Guild",
    formatType: "both",
    ebookPrice: 499,
    physicalPrice: 899,
    pages: 284,
    language: "Hindi & English Edition",
    publishedYear: 2024,
    isbn: "978-81-965412-1-2",
    downloadFormat: "Instant PDF & EPUB (Mobile & Tablet Optimized)",
    badge: "Bestseller #1",
    shortDescription: "The ultimate definitive guide revealing ancient Vedic prosperity laws, wealth mindset secrets, and sacred monetary alignment.",
    description: "Karodon Ka Rahasya bridges ancient Vedic wisdom with modern financial psychology. Uncover how energetic frequencies dictate wealth retention, why certain physical conduits (like sacred wallets and consecrated metals) magnify your prosperity, and how to dissolve subconscious poverty patterns in 21 days.",
    features: [
      "Instant PDF/EPUB access + Optional Hardcover delivery",
      "Vedic Sri Yantra alignment techniques for bank accounts & cash boxes",
      "21-Day Abundance Habit & Frequency Calibration Protocol",
      "Includes sacred Wealth Manifestation Affirmation Cards"
    ],
    tableOfContents: [
      { number: 1, title: "The Cosmic Law of Currency Resonance", summary: "Understanding why money is pure energetic frequency and how subconscious barriers block flow." },
      { number: 2, title: "Brahma Muhurta & Financial Awakening", summary: "Harnessing the 4:00 AM energy window for exponential mental clarity and karmic resets." },
      { number: 3, title: "Sacred Vessels: Consecrated Wallets & Geometry", summary: "The architectural science behind Karodon Ka Wallet and sacred storage principles." },
      { number: 4, title: "Dissolving Ancestral Money Blockages", summary: "Clearing passed-down scarcity mindsets through authentic Vedic cleansing rituals." },
      { number: 5, title: "Daily Rituals for Multiplication", summary: "Morning and evening regimens practiced by India's most enlightened dynastic merchants." }
    ],
    sampleExcerpt: {
      chapterTitle: "Chapter 1: The Cosmic Law of Currency Resonance",
      subheading: "Why Wealth Moves Towards Calm Frequency, Not Desperation",
      paragraphs: [
        "In the ancient scriptures of the Atharva Veda, wealth (Lakshmi) is never described merely as metal coins or paper notes. She is described as Chanchala—the dynamic, swift frequency of universal movement.",
        "Most people spend their entire lives chasing currency with anxiety, fear of loss, and frantic worry. Yet, according to cosmic laws, fear is the lowest repulsive frequency. When you hold an empty or cluttered wallet with fear, you broadcast a signal of lack to the universe.",
        "The secret of enlightened masters who possessed boundless opulence was simple: they never pursued wealth; they cultivated an inner and outer temple of such harmonious vibration that prosperity had no choice but to settle there.",
        "When you align your mind with gratitude, place your currency inside sacred consecrated geometry, and begin each morning in stillness, the flow shifts from a struggle to an effortless stream. This book provides you the exact blueprint."
      ]
    }
  },
  {
    id: "bk-102",
    slug: "vastu-for-miracles",
    name: "Vastu For Miracles: Aligning Directions for Abundance",
    price: 399,
    originalPrice: 799,
    discountPercent: 50,
    rating: 4.85,
    reviewCount: 32,
    image: "/images/books/vastu-for-miracles.svg",
    inStock: true,
    category: "Books & E-Books",
    author: "Acharya Rajesh Shastri",
    formatType: "both",
    ebookPrice: 399,
    physicalPrice: 749,
    pages: 220,
    language: "Hindi & English",
    publishedYear: 2024,
    isbn: "978-81-965412-2-9",
    downloadFormat: "PDF with Color Vastu Direction Charts",
    badge: "Architect's Choice",
    shortDescription: "A comprehensive handbook to transform your home and workplace into powerful magnets of fortune and peace without structural demolition.",
    description: "Vastu For Miracles breaks down complex spatial energy dynamics into simple, practical steps. Discover the pivotal North (Kuber) zone, how to balance the Northeast (Ishanya) corner with sacred water, and where to position financial lockers, mirrors, and consecrated fragrances for maximum growth.",
    features: [
      "Zero-demolition Vastu remedies for flats, rented apartments & offices",
      "Full color 16-zone energy quadrant chart included",
      "Remedies for North, South-West & North-East doshas",
      "Step-by-step space blessing & smoke cleansing rituals"
    ],
    tableOfContents: [
      { number: 1, title: "The Pancha Bhutas (Five Elements) in Living Spaces", summary: "Balancing Fire, Earth, Water, Air, and Space within modern architectural confines." },
      { number: 2, title: "The Kuber Axis: The North Direction of Cash Flow", summary: "Activating the northern quadrant to eradicate delays in receivables and salary growth." },
      { number: 3, title: "Ishanya (North-East): The Gateway of Divine Grace", summary: "How holy water, silence, and uncluttered space open breakthroughs in life." },
      { number: 4, title: "South-West Stability: Preventing Wealth Drainage", summary: "Anchoring your master bedroom and financial safe to stop sudden unexpected expenditures." },
      { number: 5, title: "Commercial Vastu for Shops, Clinics & Offices", summary: "Arranging cash counters, customer entrances, and owner seating for thriving business." }
    ],
    sampleExcerpt: {
      chapterTitle: "Chapter 2: The Kuber Axis & The North Direction",
      subheading: "Unlocking The Unseen Stream of Liquid Cash",
      paragraphs: [
        "Every space you inhabit is a living bio-energetic organism. The Earth's magnetic grid flows continuously from the North Pole to the South Pole, creating subtle streams of geomagnetic pranic energy.",
        "In classical Vastu, Lord Kuber—the celestial treasurer of the universe—presides over the North. If your Northern quadrant is burdened with heavy junk, dustbins, or fire elements (like a red lamp or stove), the magnetic current carrying prosperity is burned or blocked.",
        "By simply clearing this zone, painting it in soft pale green or off-white, and introducing clean flowing water or a consecrated crystal, residents frequently notice delayed payments resolving within mere weeks.",
        "You do not need to tear down walls. Energy responds to consciousness, weight, color, and intent. Let us begin by calibrating your Northern threshold."
      ]
    }
  },
  {
    id: "bk-103",
    slug: "daily-vedic-mantras",
    name: "Daily Vedic Mantras & 90-Day Manifestation Journal",
    price: 649,
    originalPrice: 1199,
    discountPercent: 46,
    rating: 5.0,
    reviewCount: 39,
    image: "/images/books/daily-vedic-mantras.svg",
    inStock: true,
    category: "Books & E-Books",
    author: "Guru Devendra Nath",
    formatType: "both",
    ebookPrice: 449,
    physicalPrice: 649,
    pages: 310,
    language: "Sanskrit, Hindi & English",
    publishedYear: 2024,
    isbn: "978-81-965412-3-6",
    downloadFormat: "Printable PDF Workbook + Pronunciation Audio Links",
    badge: "Consecrated Journal",
    shortDescription: "A powerful daily manifestation workbook combining authentic Vedic Sanskrit chants, phonetic guides, and 90 daily reflection prompts.",
    description: "Your sacred companion for 90 days of personal transformation. Featuring authentic Vedic stotras, Beej mantras for Lakshmi and Ganesha, transliterated Sanskrit phonetics, and structured morning/evening manifestation writing sections designed to rewire neuro-spiritual pathways.",
    features: [
      "90 guided daily pages with Morning Intentions & Evening Gratitude",
      "Authentic Sanskrit Mantras with English & Hindi meanings",
      "QR codes linking to authentic master audio chants for proper pronunciation",
      "Thick gold-foil stamped keepsake edition (Physical) & printable sheets (Digital)"
    ],
    tableOfContents: [
      { number: 1, title: "The Science of Sound Vibration (Nada Brahma)", summary: "Why Sanskrit syllables alter mental chemistry and clear energetic debris." },
      { number: 2, title: "The Mahalakshmi & Kuber Beej Mantras", summary: "Step-by-step chanting rituals for wealth, debt eradication, and peace." },
      { number: 3, title: "Gayatri & Surya Mantras for Leadership & Charisma", summary: "Awakening self-belief, executive authority, and solar courage." },
      { number: 4, title: "The 90-Day Structured Manifestation Protocol", summary: "Daily structured journaling sheets to document goals, miracles, and syncs." },
      { number: 5, title: "Overcoming Spiritual Slump & Dry Spells", summary: "How to maintain high vibration even on demanding or challenging days." }
    ],
    sampleExcerpt: {
      chapterTitle: "Chapter 1: The Science of Sound Vibration (Nada Brahma)",
      subheading: "How Sacred Syllables Reprogram Your Quantum Field",
      paragraphs: [
        "Words are not merely symbols for thought; in the Vedic paradigm, sound is the primordial fabric of matter itself. Quantum physics today affirms what rishis perceived thousands of years ago: every solid particle is vibrating energy.",
        "When you chant a mantra such as 'Shreem'—the seed sound of supreme opulence—the specific friction of your tongue hitting the upper palate stimulates the pituitary and pineal glands, triggering hormones of peace, focus, and elevation.",
        "Chanting is not religious superstition; it is acoustic science. When paired with written journaling, the subconscious mind receives both auditory and kinesthetic reinforcement.",
        "As you embark on this 90-day journey, write with reverence. What you inscribe on these consecrated pages in the morning becomes your lived reality by dusk."
      ]
    }
  },
  {
    id: "bk-104",
    slug: "the-cosmic-vault",
    name: "The Cosmic Vault: Ancient Secrets of Money Attraction",
    price: 299,
    originalPrice: 599,
    discountPercent: 50,
    rating: 4.95,
    reviewCount: 56,
    image: "/images/books/the-cosmic-vault.svg",
    inStock: true,
    category: "Books & E-Books",
    author: "AR Blessings Esoteric Academy",
    formatType: "ebook",
    ebookPrice: 299,
    pages: 180,
    language: "English & Hindi",
    publishedYear: 2024,
    isbn: "978-81-965412-4-3",
    downloadFormat: "Instant Download • PDF + EPUB + Audio Summary",
    badge: "Digital Exclusive",
    shortDescription: "Exclusive digital masterclass e-book revealing the hidden laws of money magnetism, karmic accounts, and cosmic asset accumulation.",
    description: "Available strictly as an instant digital e-book. Designed for busy professionals, entrepreneurs, and seekers who want high-impact, actionable insights on wealth attraction that can be read and implemented over a single weekend.",
    features: [
      "Instant 1-click digital download immediately upon purchase",
      "Read on Kindle, iPad, Android, or desktop seamlessly",
      "Includes 45-minute audio narration summary",
      "Checklists for daily financial energy hygiene"
    ],
    tableOfContents: [
      { number: 1, title: "The Universal Treasury: Tapping Cosmic Reserves", summary: "Recognizing that true wealth originates in the infinite field of consciousness." },
      { number: 2, title: "Karmic Banking: The Art of Generous Receiving", summary: "Why hoarding repels money and how conscious circulation magnifies returns." },
      { number: 3, title: "Protecting Your Financial Aura from Jealousy", summary: "Ancient techniques to guard against Nazar (the evil eye) and envy in business." },
      { number: 4, title: "The 7 Cosmic Days Money Calendar", summary: "Which days to invest, sign agreements, make payments, and hold wealth rituals." }
    ],
    sampleExcerpt: {
      chapterTitle: "Chapter 2: Karmic Banking & The Flow of Wealth",
      subheading: "Why Closed Hands Cannot Receive New Blessings",
      paragraphs: [
        "Water that does not flow becomes stagnant, cloudy, and lifeless. The exact same principle governs currency. In fact, the word 'currency' shares its linguistic root with current—flow.",
        "When an individual hoards money in fear, counting every rupee with bitterness and grumbling when paying bills, they constrict the current. The universe mirrors back the exact emotion of tight constriction.",
        "The wealthiest titans of ancient Bharat understood that paying your obligations with blessings and giving a discreet percentage to noble causes opens an immense vacuum in the cosmos that must be filled.",
        "Learn to view every outgoing payment as a seed planted in fertile ground. When you hand over currency with an inner blessing of 'May you multiply and return', the entire energetic dynamic inverts."
      ]
    }
  }
];
