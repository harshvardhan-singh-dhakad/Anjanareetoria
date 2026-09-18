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
    id: "bk-lakshmi-75",
    slug: "75-days-to-welcome-maa-lakshmi",
    name: "माँ लक्ष्मी के स्वागत के 75 दिन (75 Days to Welcome Maa Lakshmi)",
    price: 500,
    originalPrice: 999,
    discountPercent: 50,
    rating: 5.0,
    reviewCount: 64,
    image: "/images/books/lakshmi-75-days.jpg",
    inStock: true,
    category: "Books & E-Books",
    author: "Anjanaa Reetoria",
    formatType: "ebook",
    ebookPrice: 500,
    pages: 75,
    language: "Hindi & English",
    publishedYear: 2026,
    downloadFormat: "Instant PDF / Digital Guide via Email",
    badge: "Digital Guide",
    shortDescription: "Start whenever you are ready. Your Day 1 begins today, and after completing the 75-day journey, celebrate Day 75 as your Personal Diwali.",
    description: "यह केवल Diwali के पहले शुरू होने वाली booklet नहीं है। Customer किसी भी दिन Day 1 शुरू कर सकता है। जिस दिन उसके 75 दिन पूरे हों, उस completion को वह अपनी Personal Diwali की तरह celebrate कर सकता है। इस journey का उद्देश्य घर की तैयारी के साथ अपनी daily habits, discipline, अन्न के प्रति सम्मान, धन के प्रति awareness, दान, साधना और जीवन की व्यवस्था पर काम करना है।",
    features: [
      "75 Days • Daily Practices • Digital Access",
      "Daily practices: Sankalp, 1 Mala, Evening Diya/Rangoli",
      "Vishnu/Annapurna Bhajan & Awareness against food wastage",
      "Weekly Daan & Clearing pending responsibilities",
      "Non-promotional, authentic spiritual & discipline practice"
    ],
    tableOfContents: [
      { number: 1, title: "Sankalp & Inner Purification", summary: "Beginning your Day 1 whenever ready—no waiting for festive dates required." },
      { number: 2, title: "Daily Sadhana: 1 Mala & Evening Diya", summary: "Establishing peaceful resonance with evening rangoli and prayer." },
      { number: 3, title: "De-cluttering & Sacred Space Management", summary: "Creating space for divine energy through clean environments." },
      { number: 4, title: "Respect for Food & Weekly Daan", summary: "Cultivating mindful awareness around food wastage and purposeful charity." },
      { number: 5, title: "Day 75: Your Personal Diwali Celebration", summary: "Honoring the completion of your 75-day spiritual discipline." }
    ],
    sampleExcerpt: {
      chapterTitle: "The Philosophy of 75 Days",
      subheading: "दीपावली की तारीख का इंतज़ार क्यों? आज से अपने 75 दिन शुरू कीजिए।",
      paragraphs: [
        "यह केवल Diwali के पहले शुरू होने वाली booklet नहीं है। Customer किसी भी दिन Day 1 शुरू कर सकता है। जिस दिन उसके 75 दिन पूरे हों, उस completion को वह अपनी Personal Diwali की तरह celebrate कर सकता है।",
        "इस journey का उद्देश्य घर की तैयारी के साथ अपनी daily habits, discipline, अन्न के प्रति सम्मान, धन के प्रति awareness, दान, साधना और जीवन की व्यवस्था पर काम करना है।",
        "यह एक guided spiritual और discipline practice है जो आपके भीतर स्थिरता और श्रद्धा का निर्माण करती है।"
      ]
    }
  },
  {
    id: "prod-lakshmi-combo",
    slug: "the-complete-lakshmi-journey-combo",
    name: "The Complete Lakshmi Journey (Combo: Book + 75-Day Digital Guide)",
    price: 1750,
    originalPrice: 2150,
    discountPercent: 19,
    rating: 5.0,
    reviewCount: 112,
    image: "/images/books/lakshmi-combo.jpg",
    inStock: true,
    category: "Books & E-Books",
    author: "Anjanaa Reetoria",
    formatType: "both",
    ebookPrice: 500,
    physicalPrice: 1750,
    pages: 395,
    language: "Hindi & English",
    publishedYear: 2026,
    badge: "RECOMMENDED",
    shortDescription: "First understand Lakshmi. Then begin your 75-day preparation. Includes Main Lakshmi Hoon physical book + 75-Day Digital Guide.",
    description: "The complete Lakshmi journey: First understand Lakshmi through Anjanaa Reetoria's book 'Main Lakshmi Hoon', and then begin your 75-day preparation journey. Includes physical printed book delivered to your doorstep + digital booklet access.",
    features: [
      "📖 Main Lakshmi Hoon — Physical Book (Doorstep delivery across India)",
      "🪔 75-Day Lakshmi Digital Guide (Instant digital access & email delivery)",
      "Includes ₹150 physical-book delivery charge (Total ₹1,750)",
      "Dual fulfillment: Digital access + physical parcel dispatch"
    ],
    tableOfContents: [
      { number: 1, title: "Part 1: Understand Her (Main Lakshmi Hoon)", summary: "Deep philosophical and spiritual exploration by Anjanaa Reetoria." },
      { number: 2, title: "Part 2: Prepare for Her (75-Day Daily Guide)", summary: "Daily structured practices, sankalp, 1 mala, and decluttering protocol." }
    ],
    sampleExcerpt: {
      chapterTitle: "The Complete Journey",
      subheading: "First Understand Lakshmi. Then Begin Your 75-Day Preparation.",
      paragraphs: [
        "ज्ञान के बिना साधना अधूरी है, और साधना के बिना ज्ञान मात्र विचार बनकर रह जाता है।",
        "The Complete Lakshmi Journey combines deep understanding with daily committed practice. Read 'Main Lakshmi Hoon' to cultivate reverence, and practice the 75-Day Guide to transform your daily lifestyle."
      ]
    }
  },
  {
    id: "bk-main-lakshmi-hoon",
    slug: "main-lakshmi-hoon",
    name: "Main Lakshmi Hoon (मैं लक्ष्मी हूँ)",
    price: 1250,
    originalPrice: 1400,
    discountPercent: 11,
    rating: 5.0,
    reviewCount: 88,
    image: "/images/books/main-lakshmi-hoon.jpg",
    inStock: true,
    category: "Books & E-Books",
    author: "Anjanaa Reetoria",
    formatType: "physical",
    physicalPrice: 1250,
    pages: 320,
    language: "Hindi",
    publishedYear: 2026,
    badge: "Physical Book",
    shortDescription: "A book by Anjanaa Reetoria for readers who want to understand Maa Lakshmi and the philosophy and perspective she shares through her work.",
    description: "Main Lakshmi Hoon is a book by Anjanaa Reetoria for readers who want to understand Maa Lakshmi and the philosophy and perspective she shares through her work. Includes ₹1,100 Direct Price + ₹150 Delivery.",
    features: [
      "A book by Anjanaa Reetoria to understand Maa Lakshmi",
      "Deep spiritual insights & philosophical perspectives",
      "₹1,100 Direct Price + ₹150 Delivery (Total ₹1,250)",
      "High quality printed physical book with Pan-India courier delivery"
    ],
    tableOfContents: [
      { number: 1, title: "Who is Lakshmi? The Cosmic Principle", summary: "Moving beyond superficial concepts to understand Maa Lakshmi's true essence." },
      { number: 2, title: "Consciousness & Inner Purity", summary: "Why consciousness precedes currency in every dimension of existence." },
      { number: 3, title: "Living with Reverence & Gratitude", summary: "How living in pure devotion invites sustained prosperity." }
    ],
    sampleExcerpt: {
      chapterTitle: "Introduction: The Living Essence of Lakshmi",
      subheading: "Understanding Beyond the Surface",
      paragraphs: [
        "लक्ष्मी केवल स्वर्ण और मुद्राओं का नाम नहीं है। वह इस ब्रह्मांड का वह पोषणकारी चैतन्य है जो जीवन को सजीव, सुंदर और पूर्ण बनाता है।",
        "जब हम श्रद्धा और सेवाभाव से जीवन जीते हैं, तो लक्ष्मी का वास स्वतः हमारे विचारों, कर्मों और परिवेश में होने लगता है।"
      ]
    }
  },
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
