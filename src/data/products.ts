export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  rating?: number;
  reviewCount?: number;
  image: string;
  hoverImage?: string;
  inStock: boolean;
  category: string;
  description: string;
  shortDescription: string;
  features: string[];
}

export const products: Product[] = [
  {
    id: "1135",
    slug: "karodon-ka-dollar",
    name: "Karodon Ka Dollar",
    price: 888,
    image: "/images/products/dollar.jpg",
    inStock: true,
    category: "Dollar",
    shortDescription: "Special energized Karodon Ka Dollar for abundance and prosperity.",
    description: "Experience the aura of wealth and positive energy with the authentically energized Karodon Ka Dollar. Crafted with precision and blessed according to spiritual principles to invite prosperity and monetary growth.",
    features: ["Consecrated and Energized", "Premium Metallic Crafting", "Ideal for Wallet or Cash Register", "Attracts Positive Financial Energy"]
  },
  {
    id: "1298",
    slug: "karodon-ki-khusboo",
    name: "Karodon Ki Khushboo",
    price: 6000,
    originalPrice: 9999,
    discountPercent: 40,
    image: "/images/products/khushboo.jpg",
    inStock: true,
    category: "Khushboo",
    shortDescription: "Divine aromatic essence formulated to attract fortune and elevate vibrations.",
    description: "Karodon Ki Khushboo is a rare, divine fragrance formulated with high-vibration natural extracts. Designed to shift personal and atmospheric energy toward luxury, peace, and abundance.",
    features: ["100% Pure Natural Essence", "Long-lasting High-Vibration Aroma", "40% Limited Time Special Discount", "Spiritual Aura Cleansing"]
  },
  {
    id: "1304",
    slug: "karodon-ka-perfume",
    name: "Karodon Ka इत्र",
    price: 8000,
    originalPrice: 11000,
    discountPercent: 27,
    image: "/images/products/perfume.jpeg",
    inStock: true,
    category: "Khushboo",
    shortDescription: "Exquisite sacred Ittar for manifestation and majestic aura.",
    description: "A traditional royal formulation enriched with pure botanicals and energizing compounds. Karodon Ka Ittar creates an unforgettable impression and keeps your personal aura vibrant throughout the day.",
    features: ["Traditional Distillation Process", "Alcohol-free Pure Ittar", "Enhances Charm and Manifestation", "Exclusive Royal Aroma"]
  },
  {
    id: "1307",
    slug: "karodon-ka-hamper",
    name: "Karodon Ka Hamper",
    price: 15000,
    image: "/images/products/hamper.jpeg",
    inStock: true,
    category: "Hamper",
    shortDescription: "Complete ultimate blessings luxury gift hamper with all consecrated essentials.",
    description: "The complete divine ensemble containing the signature Karodon Ka Wallet, Karodon Ka Dollar, consecrated fragrances, and spiritual prosperity tokens all packaged in a magnificent luxury box.",
    features: ["All-in-One Luxury Prosperity Kit", "Premium Gift Packaging", "Individually Consecrated Products", "Best For Spiritual Gifting"]
  },
  {
    id: "1308",
    slug: "karodon-ka-pani",
    name: "Karodon Ka Pani",
    price: 200,
    image: "/images/products/pani.jpg",
    inStock: true,
    category: "Water",
    shortDescription: "Sacred energized jal for space cleansing and positivity.",
    description: "Sacred revitalizing water blessed through authentic Vedic mantras. Sprinkling this energized jal in homes, offices, or commercial premises removes negative obstacles and restores serenity.",
    features: ["Consecrated Holy Water", "Space & Aura Cleansing", "Infused with Sacred Chants", "Convenient Dispenser"]
  },
  {
    id: "1309",
    slug: "safalta-ka-tilak",
    name: "Safalta Ka Tilak",
    price: 200,
    image: "/images/products/tilak.jpg",
    hoverImage: "/images/products/tilak-hover.jpeg",
    inStock: false,
    category: "Tilak",
    shortDescription: "Auspicious Tilak formulated with sacred herbs for focus and victory.",
    description: "Crafted with pure herbal ingredients and divine scents, Safalta Ka Tilak is applied on the Ajna Chakra (forehead) before key meetings, exams, or business ventures to enhance confidence and triumph.",
    features: ["Pure Herbal Formulation", "Awakens Ajna Chakra", "Empowers Self-Confidence", "Currently Out of Stock"]
  },
  {
    id: "739",
    slug: "karodon-ka-wallet",
    name: "Karodon Ka Wallet",
    price: 4000,
    rating: 4.25,
    reviewCount: 28,
    image: "/images/products/wallet.jpg",
    hoverImage: "/images/products/wallet-hover.jpeg",
    inStock: true,
    category: "Wallet",
    shortDescription: "Our flagship genuine leather consecrated prosperity wallet.",
    description: "The flagship product of AR Blessings, Karodon Ka Wallet is designed according to sacred geometry and prosperity alignments. Made from premium quality genuine leather, it includes specific compartments blessed for wealth retention and multiplication.",
    features: ["100% Premium Genuine Leather", "Infused with Prosperity Geometry", "Multi-Card & Currency Sleeves", "Consecrated by Spiritual Masters"]
  },
  {
    id: "643",
    slug: "karodon-ki-yatra-passport-cover",
    name: "Karodon Ki Yatra (Passport Cover)",
    price: 1300,
    rating: 5.0,
    reviewCount: 14,
    image: "/images/products/passport.jpg",
    inStock: true,
    category: "Passport Cover",
    shortDescription: "Blessed travel accessory for safe, fortunate, and successful international journeys.",
    description: "Protect your most precious travel identity with the Karodon Ki Yatra Passport Cover. Specially energized to clear travel hurdles, attract prosperous opportunities abroad, and ensure safe travels.",
    features: ["Durable Luxury Finish", "Passport & Boarding Pass Pockets", "Travel Protection Energy", "5-Star Customer Rating"]
  },
  {
    id: "738",
    slug: "karodon-ka-cup",
    name: "Karodon Ka Cup",
    price: 1300,
    rating: 5.0,
    reviewCount: 19,
    image: "/images/products/cup.jpg",
    inStock: true,
    category: "Cup",
    shortDescription: "Energized ceramic cup for mindful morning rituals and high vibrations.",
    description: "Start your morning with high frequency thoughts. Every sip from Karodon Ka Cup reinforces affirmations of health, wealth, and gratitude. Dishwasher and microwave safe high-grade ceramic.",
    features: ["High-Grade Ceramic Build", "Positive Affirmation Emblem", "Microwave & Dishwasher Safe", "5-Star Customer Favorite"]
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
    shortDescription: "First understand Lakshmi. Then begin your 75-day preparation. Includes Main Lakshmi Hoon physical book + 75-Day Digital Guide.",
    description: "The complete Lakshmi journey: First understand Lakshmi through Anjanaa Reetoria's book 'Main Lakshmi Hoon', and then begin your 75-day preparation journey. Includes physical printed book delivered to your doorstep + digital booklet access.",
    features: [
      "📖 Main Lakshmi Hoon — Physical Book (Doorstep delivery across India)",
      "🪔 75-Day Lakshmi Digital Guide (Instant digital access & email delivery)",
      "Includes ₹150 physical-book delivery charge (Total ₹1,750)",
      "Dual fulfillment: Digital access + physical parcel dispatch"
    ]
  }
];

