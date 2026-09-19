import fs from 'fs';
import path from 'path';
import { DATA_DIR, ensureStorageDirs } from '../ebook/storage';
import { products as initialProducts, Product } from '@/data/products';
import { books as initialBooks, Book } from '@/data/books';
import { blogs as initialBlogs, BlogPost } from '@/data/blogs';
import { getMySQLPool, initializeDatabaseTables, isMySQLConfigured } from './database';

export interface ExtendedBook extends Book {
  subtitle?: string;
  coverImage?: string;
  pdfSourceFile?: string; // filename in private-ebooks/source/
  previewPages?: string[];
  keyTakeaways?: string[];
}

export interface ExtendedBlogPost extends BlogPost {
  htmlContent?: string; // Custom HTML/CSS styled markup written by admin
}

export interface WebinarReview {
  id: string;
  name: string;
  roleOrLocation?: string;
  rating: number; // 1 to 5
  comment: string;
  date?: string;
  avatar?: string;
}

export interface Webinar {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  speaker: {
    name: string;
    title: string;
    image?: string;
  };
  dateTime: string;
  duration: string;
  price: number;
  registrationUrl: string;
  status: 'upcoming' | 'live' | 'completed';
  bannerImage: string;
  agenda: string[];
  reviews?: WebinarReview[];
  whoShouldAttend?: string[];
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  duration: string;
  videoType: 'youtube' | 'direct_hls' | 'mp4' | 'bunny';
  videoUrl: string;
  isFreePreview?: boolean;
  notesPdfUrl?: string;
  description?: string;
  sortOrder: number;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  sortOrder: number;
  lessons: CourseLesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Mastery';
  instructor: {
    name: string;
    title: string;
    image?: string;
    bio?: string;
  };
  thumbnail: string;
  trailerVideoUrl?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  totalDuration: string;
  totalLessons: number;
  language: string;
  whatYouWillLearn: string[];
  requirements?: string[];
  certificateEnabled?: boolean;
  status: 'published' | 'draft';
  modules: CourseModule[];
}

export interface UserCourseEnrollment {
  id: string;
  userId: string;
  userPhone: string;
  courseId: string;
  orderId?: string;
  enrolledAt: string;
  completedAt?: string;
  progressPercentage: number;
  completedLessonIds: string[];
  lastLessonId?: string;
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const WEBINARS_FILE = path.join(DATA_DIR, 'webinars.json');
const COURSES_FILE = path.join(DATA_DIR, 'courses.json');
const ENROLLMENTS_FILE = path.join(DATA_DIR, 'course_enrollments.json');
const LAKSHMI_SPECIAL_SECTION_FILE = path.join(DATA_DIR, 'lakshmi_special_section.json');

async function markMySQLResourceSeeded(resource: string): Promise<void> {
  const pool = getMySQLPool();
  if (!pool) return;
  await pool.query(
    `INSERT INTO cms_seed_state (resource, seeded)
     VALUES (?, TRUE)
     ON DUPLICATE KEY UPDATE seeded = TRUE`,
    [resource]
  );
}

async function seedMySQLResourceOnce<T>(
  resource: string,
  items: T[],
  saveItem: (item: T) => Promise<void>
): Promise<boolean> {
  const pool = getMySQLPool();
  if (!pool) return false;

  const [rows] = await pool.query(
    'SELECT seeded FROM cms_seed_state WHERE resource = ? LIMIT 1',
    [resource]
  ) as [any[], any];

  if (rows && rows.length > 0 && Boolean(rows[0].seeded)) {
    return false;
  }

  for (const item of items) {
    await saveItem(item);
  }

  await pool.query(
    `INSERT INTO cms_seed_state (resource, seeded)
     VALUES (?, TRUE)
     ON DUPLICATE KEY UPDATE seeded = TRUE`,
    [resource]
  );
  return true;
}

export interface LakshmiSpecialSectionConfig {
  id: string;
  enabled: boolean;
  digitalImage: string;
  comboImage: string;
  physicalImage: string;
}

export interface SiteVideoItem {
  id: string;
  title: string;
  subtitle: string;
  poster: string;
  sources: string[];
  enabled?: boolean;
}

export interface SiteTestimonialItem {
  id: string;
  src: string;
  alt: string;
  enabled?: boolean;
}

export interface SiteSettings {
  topbarText: string;
  logoUrl: string;
  heroImage: string;
  heroLink: string;
  heroAlt: string;
  productsKicker: string;
  productsTitle: string;
  booksKicker: string;
  booksTitle: string;
  booksDescription: string;
  videosKicker: string;
  videosTitle: string;
  testimonialsKicker: string;
  testimonialsTitle: string;
  footerDescription: string;
  instagramUrl: string;
  videos: SiteVideoItem[];
  testimonials: SiteTestimonialItem[];
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  topbarText: '✨ Welcome to AR Blessings — Authentically Blessed Spiritual & Luxury Essentials ✨',
  logoUrl: '/images/logo.png',
  heroImage: '/images/banner-karodon-ka-wallet.png',
  heroLink: '/product/karodon-ka-wallet',
  heroAlt: 'Karodon Ka Wallet',
  productsKicker: 'Our Products',
  productsTitle: 'Uniquely Designed Gems',
  booksKicker: 'Sacred Literature',
  booksTitle: 'Books & Instant E-Books',
  booksDescription: 'Authentic Vedic prosperity guidebooks, manifestation journals, and Vastu blueprints available in instant digital and keepsake print editions.',
  videosKicker: 'Visualized Insights',
  videosTitle: 'Understanding Concepts and Ideas through Video Explanations',
  testimonialsKicker: 'Accomplishment Sagas',
  testimonialsTitle: 'Success Stories and Clients\' Positive Feedback',
  footerDescription: 'Connect with us for sacred updates, astrological guidance, and auspicious additions.',
  instagramUrl: 'https://www.instagram.com/ar_blessings_',
  videos: [
    { id: '1', title: 'Karodon Ki Yatra', subtitle: 'Passport Cover Spiritual Consecration', poster: '/images/products/passport.jpg', sources: ['/videos/Passport.mp4'], enabled: true },
    { id: '2', title: 'Karodon Ka Wallet', subtitle: 'Divine Blessing & Sacred Geometry', poster: '/images/products/wallet.jpg', sources: ['/videos/WALLET-BLESSED-.mp4'], enabled: true },
    { id: '3', title: 'Karodon Ka Cup', subtitle: 'Mindful Rituals for Abundance', poster: '/images/products/cup.jpg', sources: ['/videos/Cup-1.mp4'], enabled: true },
  ],
  testimonials: Array.from({ length: 18 }, (_, i) => ({
    id: String(i + 1),
    src: `/images/testimonials/review-${i + 1}.png`,
    alt: `Client Review ${i + 1}`,
    enabled: true,
  })),
};

export const DEFAULT_LAKSHMI_SPECIAL_SECTION: LakshmiSpecialSectionConfig = {
  id: 'lakshmi-journey',
  enabled: true,
  digitalImage: '/images/books/lakshmi-75-days.jpg',
  comboImage: '/images/books/lakshmi-combo.jpg',
  physicalImage: '/images/books/main-lakshmi-hoon.jpg',
};

const INITIAL_COURSES: Course[] = [
  {
    id: "course-101",
    slug: "brahma-muhurta-manifestation-mastery",
    title: "Brahma Muhurta Manifestation & Wealth Frequency Mastery",
    subtitle: "The Sacred 4:00 AM Vedic Science to Rewire Subconscious Money Vibration",
    description: "An authentic, step-by-step video masterclass created by AR Blessings spiritual guides. Understand the metaphysics of cosmic alignment, how to activate the Kuber wealth vortex in your daily routine, sacred water manifestation, and potent beej mantra transmissions.",
    category: "Manifestation & Sacred Energy",
    level: "All Levels",
    instructor: {
      name: "Acharya Rajesh Shastri",
      title: "Vedic Master & Energy Guide",
      image: "/images/testimonials/review-1.png",
      bio: "Over 22 years of Sadhana, consecrated temple Vastu, and guidance of thousands of seekers towards spiritual abundance."
    },
    thumbnail: "/images/blog/sacred-morning-rituals.svg",
    trailerVideoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    price: 0,
    originalPrice: 2999,
    rating: 4.9,
    reviewsCount: 342,
    totalDuration: "4.5 Hours",
    totalLessons: 8,
    language: "Hindi & English",
    whatYouWillLearn: [
      "The exact metaphysical science of Brahma Muhurta (3:45 AM - 5:15 AM)",
      "Kara Darshana: How to activate the divine Lakshmi-Saraswati palms energy",
      "Sacred Water Energization with the Gayatri & Kuber Beej Mantras",
      "Subconscious Financial Fear Clearing ritual with consecrated copper energy",
      "The Daily Sacred Geometry Journaling Method for steady abundance"
    ],
    requirements: [
      "An open mind and commitment to wake up 30 minutes earlier",
      "A peaceful corner in your home for 15 minutes of daily practice"
    ],
    certificateEnabled: true,
    status: "published",
    modules: [
      {
        id: "mod-101-1",
        courseId: "course-101",
        title: "Section 1: Awakening the Subtle Energy Body",
        sortOrder: 1,
        lessons: [
          {
            id: "les-101-1",
            moduleId: "mod-101-1",
            courseId: "course-101",
            title: "Lesson 1: Introduction to Vedic Space-Time & Prana",
            duration: "14:20",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: true,
            description: "Why the planetary magnetic field at 4:00 AM acts as a zero-resistance conduit for conscious intention.",
            sortOrder: 1,
          },
          {
            id: "les-101-2",
            moduleId: "mod-101-1",
            courseId: "course-101",
            title: "Lesson 2: Kara Darshana - Awakening Palm Energy Centers",
            duration: "18:45",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: true,
            description: "Step-by-step palm mudra meditation practiced the moment your eyes open.",
            sortOrder: 2,
          }
        ]
      },
      {
        id: "mod-101-2",
        courseId: "course-101",
        title: "Section 2: Sacred Water & Wealth Vibration",
        sortOrder: 2,
        lessons: [
          {
            id: "les-101-3",
            moduleId: "mod-101-2",
            courseId: "course-101",
            title: "Lesson 3: Consecrating Morning Water with Sound Frequencies",
            duration: "21:10",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: false,
            description: "Using sacred copper vessels and sound waves to structure drinking water for vitality and prosperity.",
            sortOrder: 3,
          },
          {
            id: "les-101-4",
            moduleId: "mod-101-2",
            courseId: "course-101",
            title: "Lesson 4: Tuning the Kuber Axis in Your Living Space",
            duration: "25:30",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: false,
            description: "How to locate and clean the North-Eastern magnetic corridor to prevent energetic wealth drain.",
            sortOrder: 4,
          }
        ]
      }
    ]
  },
  {
    id: "course-102",
    slug: "vedic-vastu-masterclass",
    title: "Zero-Demolition Vedic Vastu & Wealth Architecture",
    subtitle: "Transform Stagnant Space into a Magnet for Health, Peace & Financial Abundance",
    description: "Master the sacred 16 zones of Vedic Vastu Shastra without breaking a single wall or brick. Learn energetic remedies, pyramidal corrections, elemental color balancing, and directional altar consecration.",
    category: "Vastu Shastra & Space Healing",
    level: "Intermediate",
    instructor: {
      name: "Dr. Arvind Vashishtha",
      title: "Senior Vastu Architect & Geopathic Expert",
      image: "/images/testimonials/review-2.png",
      bio: "Pioneer in non-destructive Vastu remedies with 28+ years consulting for over 4,500 homes and commercial complexes globally."
    },
    thumbnail: "/images/blog/vastu-energy-guide.svg",
    trailerVideoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    price: 999,
    originalPrice: 4999,
    rating: 5.0,
    reviewsCount: 189,
    totalDuration: "6.0 Hours",
    totalLessons: 10,
    language: "Hindi & English",
    whatYouWillLearn: [
      "The Cosmic Vastu Purusha Mandala and the 16 energetic directions",
      "Zero-Demolition cures: Using metals, mirrors, lights, and sacred geometry",
      "Diagnosing health and financial blockages caused by toilet/kitchen placement",
      "Activating the South-East (Fire/Cash Liquidity) corner properly",
      "North-East (Ishanya) purity protocols for mental peace and intuitive clarity"
    ],
    requirements: [
      "Basic home floor plan or rough compass sketch of your house",
      "A measuring tape and a digital smartphone compass"
    ],
    certificateEnabled: true,
    status: "published",
    modules: [
      {
        id: "mod-102-1",
        courseId: "course-102",
        title: "Section 1: The 16 Cardinal Zones & The 5 Elements",
        sortOrder: 1,
        lessons: [
          {
            id: "les-102-1",
            moduleId: "mod-102-1",
            courseId: "course-102",
            title: "Lesson 1: Introduction to Pancha Tattva Elemental Cycles",
            duration: "20:15",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: true,
            description: "Understanding Water, Air, Fire, Earth, and Space interactions inside your walls.",
            sortOrder: 1,
          },
          {
            id: "les-102-2",
            moduleId: "mod-102-1",
            courseId: "course-102",
            title: "Lesson 2: Finding True North Using Compass Grids",
            duration: "16:40",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: false,
            description: "How to take accurate directional readings avoiding magnetic interference.",
            sortOrder: 2,
          }
        ]
      },
      {
        id: "mod-102-2",
        courseId: "course-102",
        title: "Section 2: Practical Remedies for Main Doors & Entrances",
        sortOrder: 2,
        lessons: [
          {
            id: "les-102-3",
            moduleId: "mod-102-2",
            courseId: "course-102",
            title: "Lesson 3: Entrance Energy Calibration (The 32 Pada System)",
            duration: "28:50",
            videoType: "youtube",
            videoUrl: "dQw4w9WgXcQ",
            isFreePreview: false,
            description: "Why certain doors create expenses and how to neutralize them with copper/brass thresholds.",
            sortOrder: 3,
          }
        ]
      }
    ]
  }
];

const INITIAL_WEBINARS: Webinar[] = [
  {
    id: "web-101",
    slug: "brahma-muhurta-manifestation-masterclass",
    title: "Brahma Muhurta & Wealth Manifestation Live Masterclass",
    subtitle: "Unlock the 4:00 AM Cosmic Frequency to Clear Financial Stagnation",
    description: "An exclusive 90-minute live transmission with the AR Blessings spiritual masters. Learn how to perform the sacred Kara Darshana, energize your drinking water, activate your Kuber axis, and reprogram subconscious money fear into steady certainty.",
    speaker: {
      name: "Acharya Rajesh Shastri",
      title: "Master Vedic Astrologer & Vastu Luminary",
      image: "/images/testimonials/review-1.png"
    },
    dateTime: "Sunday, October 6, 2024 at 10:00 AM IST",
    duration: "90 Minutes + 30 Min Live Q&A",
    price: 0, // Free Masterclass
    registrationUrl: "https://meet.google.com",
    status: "upcoming",
    bannerImage: "/images/blog/sacred-morning-rituals.svg",
    agenda: [
      "The Exact Metaphysical Science of Brahma Muhurta (3:45 AM - 5:15 AM)",
      "How to Tune Your Wallet & Daily Currency Flow to Lakshmi Frequency",
      "Live Guided Beej Mantra Transmission & Chanting Activation",
      "Direct Interactive Question & Answer Consultation"
    ],
    whoShouldAttend: [
      "Entrepreneurs & business owners facing unexpected financial stagnation",
      "Individuals experiencing persistent mental anxiety around cash flow",
      "Spiritual seekers wanting authentic morning Vedic discipline",
      "Anyone ready to attract effortless abundance through sacred alignment"
    ],
    reviews: [
      {
        id: "rev-1",
        name: "Vikram Malhotra",
        roleOrLocation: "Textile Manufacturer, Surat",
        rating: 5,
        comment: "Attending Acharya Ji's Brahma Muhurta transmission shifted something fundamental in my psyche. Within 14 days of practicing the morning palm darshana and water energization, two delayed payments worth ₹18 Lakhs were cleared unexpectedly!",
        date: "Last week",
        avatar: "/images/testimonials/review-1.png"
      },
      {
        id: "rev-2",
        name: "Sunita Agarwal",
        roleOrLocation: "Chartered Accountant, Jaipur",
        rating: 5,
        comment: "The clarity with which Vedic frequencies were explained was remarkable. No superstition, purely scientific energetic alignment. My home environment feels 10 times more peaceful and prosperous.",
        date: "2 weeks ago",
        avatar: "/images/testimonials/review-2.png"
      },
      {
        id: "rev-3",
        name: "Pooja Deshmukh",
        roleOrLocation: "Interior Architect, Pune",
        rating: 5,
        comment: "The live Beej Mantra chanting vibration gave me goosebumps. My whole morning routine has transformed. Truly blessed to have found AR Blessings!",
        date: "3 weeks ago",
        avatar: "/images/testimonials/review-3.png"
      }
    ]
  },
  {
    id: "web-102",
    slug: "sacred-geometry-and-vastu-vault",
    title: "Zero-Demolition Home & Office Vastu Alignment",
    subtitle: "Unlocking Financial Receivables & Removing Nazar from Business Premises",
    description: "Discover how simple spatial repositioning of cash counters, financial safes, energized tilak, and consecrated fragrances can revitalize cash flow without breaking a single brick.",
    speaker: {
      name: "Guru Devendra Nath",
      title: "Sacred Formats & Esoteric Researcher",
      image: "/images/testimonials/review-2.png"
    },
    dateTime: "Saturday, October 19, 2024 at 6:30 PM IST",
    duration: "75 Minutes",
    price: 499,
    registrationUrl: "https://meet.google.com",
    status: "upcoming",
    bannerImage: "/images/blog/vastu-shastra-energy-guide.svg",
    agenda: [
      "Identifying the 16 Vastu Zones in Modern Apartments and Offices",
      "Correct Placement of Karodon Ka Wallet, Consecrated Jal & Fragrances",
      "Eradicating Stagnant Commercial Debts and Overdue Payments",
      "Q&A and Personal Chart Consultations"
    ],
    whoShouldAttend: [
      "Shopkeepers and corporate office managers wanting to remove heaviness",
      "Homeowners seeking harmony between career and family wellness",
      "Anyone planning to move into a rented or newly bought property"
    ],
    reviews: [
      {
        id: "rev-4",
        name: "Manoj Khurana",
        roleOrLocation: "Retail Chain Owner, Delhi",
        rating: 5,
        comment: "I followed Guru Devendra's simple advice on realigning our cash locker and burning sacred fragrance in the North-East zone. Customer footfall increased by 30% within a single month without remodeling!",
        date: "October 2024",
        avatar: "/images/testimonials/review-4.png"
      },
      {
        id: "rev-5",
        name: "Ananya Iyer",
        roleOrLocation: "HR Director, Bengaluru",
        rating: 5,
        comment: "The zero-demolition remedies are pure gold. Highly practical guidance for modern flats where you cannot break walls. Worth ten times the fee.",
        date: "September 2024",
        avatar: "/images/testimonials/review-5.png"
      }
    ]
  }
];

function safeJsonParse<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== 'string') return val as T;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function readJson<T>(filePath: string, defaultData: T): T {
  try {
    ensureStorageDirs();
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
      } catch (wErr) {
        // Disk not writeable, non-fatal
      }
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[cmsStore] Error reading ${filePath}:`, err);
    return defaultData;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  try {
    ensureStorageDirs();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.warn('[cmsStore] writeJson warning (ignoring disk write):', err);
  }
}

// ---------------- PRODUCTS CRUD ----------------
export function getProducts(): Product[] {
  return readJson<Product[]>(PRODUCTS_FILE, initialProducts);
}

export async function getProductsAsync(): Promise<Product[]> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC') as [any[], any];
      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const desc = r.description || '';
          return {
            id: r.id,
            slug: r.slug,
            name: r.title || r.name || 'Product',
            title: r.title || r.name || 'Product',
            price: r.price,
            originalPrice: r.original_price,
            discountPercent: r.original_price && r.price ? Math.round(((r.original_price - r.price) / r.original_price) * 100) : undefined,
            rating: r.rating || 5.0,
            reviewCount: r.reviews_count || 0,
            image: r.image,
            hoverImage: r.hover_image || undefined,
            description: desc,
            shortDescription: desc.length > 120 ? desc.slice(0, 117) + '...' : desc,
            category: r.category || 'Sacred Essentials',
            inStock: Boolean(r.in_stock),
            features: safeJsonParse(r.features, []),
            specifications: safeJsonParse(r.specifications, {}),
          } as Product;
        });
      }
        await markMySQLResourceSeeded('products');
      }
      const didSeed = await seedMySQLResourceOnce(
        'products',
        initialProducts,
        async (item) => await saveProductAsync(item as any)
      );
      return didSeed ? initialProducts : [];
    } catch (err) {
      console.error('[cmsStore] getProductsAsync MySQL error:', err);
      throw err;
    }
  }
  return getProducts();
}

export function saveProduct(product: Product): void {
  const list = getProducts();
  const index = list.findIndex((p) => p.id === product.id || p.slug === product.slug);
  if (index >= 0) {
    list[index] = product;
  } else {
    list.unshift(product);
  }
  writeJson(PRODUCTS_FILE, list);
}

export async function saveProductAsync(product: Product): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const query = `
        INSERT INTO products (id, slug, title, price, original_price, rating, reviews_count, image, hover_image, description, category, in_stock, features, specifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          price = VALUES(price),
          original_price = VALUES(original_price),
          rating = VALUES(rating),
          reviews_count = VALUES(reviews_count),
          image = VALUES(image),
          hover_image = VALUES(hover_image),
          description = VALUES(description),
          category = VALUES(category),
          in_stock = VALUES(in_stock),
          features = VALUES(features),
          specifications = VALUES(specifications);
      `;
      const title = (product as any).name || (product as any).title || 'Product';
      await pool.query(query, [
        product.id,
        product.slug,
        title,
        product.price,
        product.originalPrice || product.price,
        product.rating || 5.0,
        product.reviewCount || (product as any).reviewsCount || 0,
        product.image,
        product.hoverImage || null,
        product.description || '',
        product.category || 'Sacred Essentials',
        product.inStock ? 1 : 0,
        JSON.stringify(product.features || []),
        JSON.stringify((product as any).specifications || {}),
      ]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    saveProduct(product);
  }
}

export function deleteProduct(idOrSlug: string): void {
  const list = getProducts().filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  writeJson(PRODUCTS_FILE, list);
}

export async function deleteProductAsync(idOrSlug: string): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM products WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    deleteProduct(idOrSlug);
  }
}

// ---------------- LAKSHMI SPECIAL SECTION ----------------
export function getLakshmiSpecialSection(): LakshmiSpecialSectionConfig {
  return readJson<LakshmiSpecialSectionConfig>(
    LAKSHMI_SPECIAL_SECTION_FILE,
    DEFAULT_LAKSHMI_SPECIAL_SECTION
  );
}

export async function getLakshmiSpecialSectionAsync(): Promise<LakshmiSpecialSectionConfig> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query(
        'SELECT id, enabled, digital_image, combo_image, physical_image FROM special_sections WHERE id = ? LIMIT 1',
        ['lakshmi-journey']
      ) as [any[], any];

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          enabled: row.enabled !== undefined ? Boolean(row.enabled) : true,
          digitalImage: row.digital_image || DEFAULT_LAKSHMI_SPECIAL_SECTION.digitalImage,
          comboImage: row.combo_image || DEFAULT_LAKSHMI_SPECIAL_SECTION.comboImage,
          physicalImage: row.physical_image || DEFAULT_LAKSHMI_SPECIAL_SECTION.physicalImage,
        };
      }

      await saveLakshmiSpecialSectionAsync(DEFAULT_LAKSHMI_SPECIAL_SECTION);
      return DEFAULT_LAKSHMI_SPECIAL_SECTION;
    } catch (err) {
      console.error('[cmsStore] MySQL getLakshmiSpecialSection error:', err);
      throw err;
    }
  }

  return getLakshmiSpecialSection();
}

export async function getLakshmiSpecialSectionFromMySQLAsync(): Promise<LakshmiSpecialSectionConfig> {
  const pool = getMySQLPool();
  if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');

  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');

  const [rows] = await pool.query(
    'SELECT id, enabled, digital_image, combo_image, physical_image FROM special_sections WHERE id = ? LIMIT 1',
    ['lakshmi-journey']
  ) as [any[], any];

  if (!rows || rows.length === 0) {
    return DEFAULT_LAKSHMI_SPECIAL_SECTION;
  }

  const row = rows[0];
  return {
    id: row.id,
    enabled: row.enabled !== undefined ? Boolean(row.enabled) : true,
    digitalImage: row.digital_image || DEFAULT_LAKSHMI_SPECIAL_SECTION.digitalImage,
    comboImage: row.combo_image || DEFAULT_LAKSHMI_SPECIAL_SECTION.comboImage,
    physicalImage: row.physical_image || DEFAULT_LAKSHMI_SPECIAL_SECTION.physicalImage,
  };
}

export async function saveLakshmiSpecialSectionToMySQLAsync(
  config: LakshmiSpecialSectionConfig
): Promise<LakshmiSpecialSectionConfig> {
  const pool = getMySQLPool();
  if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');

  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');

  await pool.query(
    `INSERT INTO special_sections
      (id, section_type, enabled, digital_image, combo_image, physical_image)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      section_type = VALUES(section_type),
      enabled = VALUES(enabled),
      digital_image = VALUES(digital_image),
      combo_image = VALUES(combo_image),
      physical_image = VALUES(physical_image)`,
    [
      'lakshmi-journey',
      'books-lakshmi-journey',
      config.enabled ? 1 : 0,
      config.digitalImage || DEFAULT_LAKSHMI_SPECIAL_SECTION.digitalImage,
      config.comboImage || DEFAULT_LAKSHMI_SPECIAL_SECTION.comboImage,
      config.physicalImage || DEFAULT_LAKSHMI_SPECIAL_SECTION.physicalImage,
    ]
  );

  return await getLakshmiSpecialSectionFromMySQLAsync();
}

export function saveLakshmiSpecialSection(config: LakshmiSpecialSectionConfig): void {
  writeJson(LAKSHMI_SPECIAL_SECTION_FILE, {
    ...DEFAULT_LAKSHMI_SPECIAL_SECTION,
    ...config,
    id: 'lakshmi-journey',
  });
}

export async function saveLakshmiSpecialSectionAsync(
  config: LakshmiSpecialSectionConfig
): Promise<void> {
  saveLakshmiSpecialSection(config);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query(
        `INSERT INTO special_sections
          (id, section_type, enabled, digital_image, combo_image, physical_image)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          section_type = VALUES(section_type),
          enabled = VALUES(enabled),
          digital_image = VALUES(digital_image),
          combo_image = VALUES(combo_image),
          physical_image = VALUES(physical_image)`,
        [
          'lakshmi-journey',
          'books-lakshmi-journey',
          config.enabled ? 1 : 0,
          config.digitalImage || DEFAULT_LAKSHMI_SPECIAL_SECTION.digitalImage,
          config.comboImage || DEFAULT_LAKSHMI_SPECIAL_SECTION.comboImage,
          config.physicalImage || DEFAULT_LAKSHMI_SPECIAL_SECTION.physicalImage,
        ]
      );
    } catch (err) {
      console.error('[cmsStore] MySQL saveLakshmiSpecialSection error:', err);
    }
  }
}

// ---------------- BOOKS CRUD ----------------
export function getBooks(): ExtendedBook[] {
  return readJson<ExtendedBook[]>(BOOKS_FILE, initialBooks);
}

export async function getBooksAsync(): Promise<ExtendedBook[]> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query('SELECT * FROM books ORDER BY created_at DESC') as [any[], any];
      if (rows && rows.length > 0) {
        const dbBooks = rows.map((r) => {
          const base = initialBooks.find((b) => b.id === r.id || b.slug === r.slug);
          const desc = r.description ?? base?.description ?? '';
          const shortDescription =
            r.short_description ??
            base?.shortDescription ??
            (desc.length > 120 ? desc.slice(0, 117) + '...' : desc);

          return {
            ...(base || {}),
            id: r.id,
            slug: r.slug,
            name: r.title || r.name || base?.name || 'Untitled Book',
            title: r.title || r.name || base?.name || 'Untitled Book',
            subtitle: r.subtitle ?? (base as any)?.subtitle ?? '',
            description: desc,
            shortDescription,
            author: r.author || base?.author || 'AR Blessings Council',
            price: r.price !== null && r.price !== undefined ? Number(r.price) : (base?.price || 499),
            originalPrice:
              r.original_price !== null && r.original_price !== undefined
                ? Number(r.original_price)
                : base?.originalPrice,
            discountPercent:
              r.discount_percent !== null && r.discount_percent !== undefined
                ? Number(r.discount_percent)
                : base?.discountPercent,
            ebookPrice:
              r.ebook_price !== null && r.ebook_price !== undefined
                ? Number(r.ebook_price)
                : (base?.ebookPrice || base?.price || 499),
            physicalPrice:
              r.physical_price !== null && r.physical_price !== undefined
                ? Number(r.physical_price)
                : base?.physicalPrice,
            image: r.cover_image || base?.image || '/images/books/karodon-ka-rahasya.svg',
            coverImage: r.cover_image || base?.image || '/images/books/karodon-ka-rahasya.svg',
            pdfSourceFile: r.pdf_source_file || undefined,
            rating:
              r.rating !== undefined && r.rating !== null
                ? Number(r.rating)
                : (base?.rating || 5.0),
            reviewCount:
              r.reviews_count !== undefined && r.reviews_count !== null
                ? Number(r.reviews_count)
                : (base?.reviewCount || 0),
            category: r.category || base?.category || 'Books & E-Books',
            formatType: r.format_type || base?.formatType || 'both',
            inStock: r.in_stock !== undefined ? Boolean(r.in_stock) : true,
            pages: r.pages !== undefined && r.pages !== null ? Number(r.pages) : (base?.pages || 100),
            language: r.language || base?.language || 'Hindi & English',
            publishedYear:
              r.published_year !== undefined && r.published_year !== null
                ? Number(r.published_year)
                : (base?.publishedYear || new Date().getFullYear()),
            isbn: r.isbn ?? base?.isbn,
            downloadFormat: r.download_format ?? base?.downloadFormat,
            badge: r.badge ?? base?.badge,
            features: safeJsonParse(r.features, base?.features || []),
            tableOfContents: safeJsonParse(r.table_of_contents, base?.tableOfContents || []),
            sampleExcerpt: safeJsonParse(
              r.sample_excerpt,
              base?.sampleExcerpt || { chapterTitle: 'Introduction', paragraphs: [] }
            ),
            previewPages: safeJsonParse(r.preview_pages, base?.previewPages || []),
            keyTakeaways: safeJsonParse(r.key_takeaways, base?.keyTakeaways || []),
          } as ExtendedBook;
        });

        // Once MySQL has been initialized, it is the CMS source of truth.
        // Do not auto-recreate a book that an admin intentionally deleted.
        // Mark the catalog as seeded the first time we see existing records.
        await pool.query(
          `INSERT INTO cms_seed_state (resource, seeded)
           VALUES (?, TRUE)
           ON DUPLICATE KEY UPDATE seeded = TRUE`,
          ['books']
        );
        return dbBooks;
      }

      // Fresh database: seed the initial catalog exactly once.
      // After that, an admin can intentionally delete every book without the
      // defaults silently coming back.
      const [seedRows] = await pool.query(
        'SELECT seeded FROM cms_seed_state WHERE resource = ? LIMIT 1',
        ['books']
      ) as [any[], any];

      if (seedRows && seedRows.length > 0 && Boolean(seedRows[0].seeded)) {
        return [];
      }

      for (const b of initialBooks) {
        await saveBookAsync(b as ExtendedBook);
      }

      await pool.query(
        `INSERT INTO cms_seed_state (resource, seeded)
         VALUES (?, TRUE)
         ON DUPLICATE KEY UPDATE seeded = TRUE`,
        ['books']
      );
      return initialBooks as ExtendedBook[];
    } catch (err) {
      console.error('[cmsStore] MySQL getBooks error:', err);
      throw err;
    }
  }
  return getBooks();
}

export function saveBook(book: ExtendedBook): void {
  const list = getBooks();
  const index = list.findIndex((b) => b.id === book.id || b.slug === book.slug);
  if (index >= 0) {
    list[index] = book;
  } else {
    list.unshift(book);
  }
  writeJson(BOOKS_FILE, list);
}

// ---------------- STRICT MYSQL BOOKS CRUD ----------------
// Admin writes use these functions so a database outage/SQL error can never
// silently fall back to the writable runtime filesystem and look successful.
export async function getBooksFromMySQLAsync(): Promise<ExtendedBook[]> {
  const pool = getMySQLPool();
  if (!pool) {
    throw new Error('MYSQL_NOT_CONFIGURED');
  }

  const initialized = await initializeDatabaseTables();
  if (!initialized) {
    throw new Error('MYSQL_INITIALIZATION_FAILED');
  }

  try {
    const [rows] = await pool.query('SELECT * FROM books ORDER BY created_at DESC') as [any[], any];

    // Fresh database bootstrap: seed the catalog once, but never after an admin
    // has previously seeded/deleted records intentionally.
    if (!rows || rows.length === 0) {
      const [seedRows] = await pool.query(
        'SELECT seeded FROM cms_seed_state WHERE resource = ? LIMIT 1',
        ['books']
      ) as [any[], any];

      const hasSeedState = Boolean(seedRows && seedRows.length > 0 && seedRows[0].seeded);
      if (!hasSeedState) {
        for (const b of initialBooks) {
          await saveBookToMySQLAsync(b as ExtendedBook);
        }
        await pool.query(
          `INSERT INTO cms_seed_state (resource, seeded)
           VALUES (?, TRUE)
           ON DUPLICATE KEY UPDATE seeded = TRUE`,
          ['books']
        );
        return await getBooksFromMySQLAsync();
      }
    }

    return rows.map((r) => {
      const base = initialBooks.find((b) => b.id === r.id || b.slug === r.slug);
      const desc = r.description ?? base?.description ?? '';
      return {
        ...(base || {}),
        id: r.id,
        slug: r.slug,
        name: r.title || r.name || base?.name || 'Untitled Book',
        title: r.title || r.name || base?.name || 'Untitled Book',
        subtitle: r.subtitle ?? (base as any)?.subtitle ?? '',
        description: desc,
        shortDescription:
          r.short_description ??
          base?.shortDescription ??
          (desc.length > 120 ? desc.slice(0, 117) + '...' : desc),
        author: r.author || base?.author || 'AR Blessings Council',
        price: r.price !== null && r.price !== undefined ? Number(r.price) : 499,
        originalPrice: r.original_price != null ? Number(r.original_price) : base?.originalPrice,
        discountPercent: r.discount_percent != null ? Number(r.discount_percent) : base?.discountPercent,
        ebookPrice: r.ebook_price != null ? Number(r.ebook_price) : (base?.ebookPrice || base?.price || 499),
        physicalPrice: r.physical_price != null ? Number(r.physical_price) : base?.physicalPrice,
        image: r.cover_image || base?.image || '/images/books/karodon-ka-rahasya.svg',
        coverImage: r.cover_image || base?.image || '/images/books/karodon-ka-rahasya.svg',
        pdfSourceFile: r.pdf_source_file || undefined,
        rating: r.rating != null ? Number(r.rating) : (base?.rating || 5.0),
        reviewCount: r.reviews_count != null ? Number(r.reviews_count) : (base?.reviewCount || 0),
        category: r.category || base?.category || 'Books & E-Books',
        formatType: r.format_type || base?.formatType || 'both',
        inStock: r.in_stock !== undefined ? Boolean(r.in_stock) : true,
        pages: r.pages != null ? Number(r.pages) : (base?.pages || 100),
        language: r.language || base?.language || 'Hindi & English',
        publishedYear: r.published_year != null ? Number(r.published_year) : (base?.publishedYear || new Date().getFullYear()),
        isbn: r.isbn ?? base?.isbn,
        downloadFormat: r.download_format ?? base?.downloadFormat,
        badge: r.badge ?? base?.badge,
        features: safeJsonParse(r.features, base?.features || []),
        tableOfContents: safeJsonParse(r.table_of_contents, base?.tableOfContents || []),
        sampleExcerpt: safeJsonParse(
          r.sample_excerpt,
          base?.sampleExcerpt || { chapterTitle: 'Introduction', paragraphs: [] }
        ),
        previewPages: safeJsonParse(r.preview_pages, base?.previewPages || []),
        keyTakeaways: safeJsonParse(r.key_takeaways, base?.keyTakeaways || []),
      } as ExtendedBook;
    });
  } catch (err) {
    console.error('[cmsStore] getBooksFromMySQLAsync error:', err);
    throw err;
  }
}

export async function saveBookToMySQLAsync(book: ExtendedBook): Promise<ExtendedBook> {
  const pool = getMySQLPool();
  if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');

  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');

  const query = `
    INSERT INTO books (
      id, slug, title, subtitle, description, short_description, author,
      price, original_price, discount_percent, ebook_price, physical_price,
      cover_image, pdf_source_file, rating, reviews_count, category, format_type,
      in_stock, pages, language, published_year, isbn, download_format, badge,
      features, table_of_contents, sample_excerpt, preview_pages, key_takeaways
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      slug = VALUES(slug),
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      description = VALUES(description),
      short_description = VALUES(short_description),
      author = VALUES(author),
      price = VALUES(price),
      original_price = VALUES(original_price),
      discount_percent = VALUES(discount_percent),
      ebook_price = VALUES(ebook_price),
      physical_price = VALUES(physical_price),
      cover_image = VALUES(cover_image),
      pdf_source_file = VALUES(pdf_source_file),
      rating = VALUES(rating),
      reviews_count = VALUES(reviews_count),
      category = VALUES(category),
      format_type = VALUES(format_type),
      in_stock = VALUES(in_stock),
      pages = VALUES(pages),
      language = VALUES(language),
      published_year = VALUES(published_year),
      isbn = VALUES(isbn),
      download_format = VALUES(download_format),
      badge = VALUES(badge),
      features = VALUES(features),
      table_of_contents = VALUES(table_of_contents),
      sample_excerpt = VALUES(sample_excerpt),
      preview_pages = VALUES(preview_pages),
      key_takeaways = VALUES(key_takeaways);
  `;

  const title = (book as any).title || (book as any).name || 'Book';
  const cover = book.coverImage || book.image || '';
  const author = typeof book.author === 'string'
    ? book.author
    : (book.author as any)?.name || 'AR Blessings Council';

  await pool.query(query, [
    book.id,
    book.slug,
    title,
    book.subtitle || '',
    book.description || '',
    book.shortDescription || '',
    author,
    Number(book.price) || 0,
    book.originalPrice != null ? Number(book.originalPrice) : null,
    book.discountPercent != null ? Number(book.discountPercent) : null,
    book.ebookPrice != null ? Number(book.ebookPrice) : (Number(book.price) || 0),
    book.physicalPrice != null ? Number(book.physicalPrice) : null,
    cover,
    book.pdfSourceFile || null,
    book.rating != null ? Number(book.rating) : 5.0,
    book.reviewCount != null ? Number(book.reviewCount) : ((book as any).reviewsCount || 0),
    book.category || 'Books & E-Books',
    book.formatType || 'both',
    book.inStock ? 1 : 0,
    Number(book.pages) || 100,
    book.language || 'Hindi & English',
    book.publishedYear != null ? Number(book.publishedYear) : null,
    book.isbn || null,
    book.downloadFormat || null,
    book.badge || null,
    JSON.stringify(book.features || []),
    JSON.stringify(book.tableOfContents || []),
    JSON.stringify(book.sampleExcerpt || null),
    JSON.stringify((book as any).previewPages || []),
    JSON.stringify((book as any).keyTakeaways || []),
  ]);

  const saved = (await getBooksFromMySQLAsync()).find((b) => b.id === book.id);
  if (!saved) throw new Error('BOOK_SAVE_VERIFICATION_FAILED');
  return saved;
}

export async function deleteBookFromMySQLAsync(idOrSlug: string): Promise<void> {
  const pool = getMySQLPool();
  if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');

  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');

  const [result] = await pool.query(
    'DELETE FROM books WHERE id = ? OR slug = ?',
    [idOrSlug, idOrSlug]
  ) as [any, any];

  if (!result || Number(result.affectedRows || 0) === 0) {
    throw new Error('BOOK_NOT_FOUND');
  }

  const remaining = await getBooksFromMySQLAsync();
  if (remaining.some((b) => b.id === idOrSlug || b.slug === idOrSlug)) {
    throw new Error('BOOK_DELETE_VERIFICATION_FAILED');
  }
}

export async function saveBookAsync(book: ExtendedBook): Promise<void> {
  saveBook(book);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const query = `
        INSERT INTO books (
          id, slug, title, subtitle, description, short_description, author,
          price, original_price, discount_percent, ebook_price, physical_price,
          cover_image, pdf_source_file, rating, reviews_count, category, format_type,
          in_stock, pages, language, published_year, isbn, download_format, badge,
          features, table_of_contents, sample_excerpt, preview_pages, key_takeaways
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          slug = VALUES(slug),
          title = VALUES(title),
          subtitle = VALUES(subtitle),
          description = VALUES(description),
          short_description = VALUES(short_description),
          author = VALUES(author),
          price = VALUES(price),
          original_price = VALUES(original_price),
          discount_percent = VALUES(discount_percent),
          ebook_price = VALUES(ebook_price),
          physical_price = VALUES(physical_price),
          cover_image = VALUES(cover_image),
          pdf_source_file = VALUES(pdf_source_file),
          rating = VALUES(rating),
          reviews_count = VALUES(reviews_count),
          category = VALUES(category),
          format_type = VALUES(format_type),
          in_stock = VALUES(in_stock),
          pages = VALUES(pages),
          language = VALUES(language),
          published_year = VALUES(published_year),
          isbn = VALUES(isbn),
          download_format = VALUES(download_format),
          badge = VALUES(badge),
          features = VALUES(features),
          table_of_contents = VALUES(table_of_contents),
          sample_excerpt = VALUES(sample_excerpt),
          preview_pages = VALUES(preview_pages),
          key_takeaways = VALUES(key_takeaways);
      `;
      const title = (book as any).title || (book as any).name || 'Book';
      const cover = book.coverImage || book.image || '';
      const author = typeof book.author === 'string' ? book.author : (book.author as any)?.name || 'AR Blessings Council';
      await pool.query(query, [
        book.id,
        book.slug,
        title,
        book.subtitle || '',
        book.description || '',
        book.shortDescription || '',
        author,
        Number(book.price) || 0,
        book.originalPrice != null ? Number(book.originalPrice) : null,
        book.discountPercent != null ? Number(book.discountPercent) : null,
        book.ebookPrice != null ? Number(book.ebookPrice) : (Number(book.price) || 0),
        book.physicalPrice != null ? Number(book.physicalPrice) : null,
        cover,
        book.pdfSourceFile || null,
        book.rating != null ? Number(book.rating) : 5.0,
        book.reviewCount != null ? Number(book.reviewCount) : ((book as any).reviewsCount || 0),
        book.category || 'Books & E-Books',
        book.formatType || 'both',
        book.inStock ? 1 : 0,
        Number(book.pages) || 100,
        book.language || 'Hindi & English',
        book.publishedYear != null ? Number(book.publishedYear) : null,
        book.isbn || null,
        book.downloadFormat || null,
        book.badge || null,
        JSON.stringify(book.features || []),
        JSON.stringify(book.tableOfContents || []),
        JSON.stringify(book.sampleExcerpt || null),
        JSON.stringify((book as any).previewPages || []),
        JSON.stringify((book as any).keyTakeaways || []),
      ]);
    } catch (err) {
      console.error('[cmsStore] MySQL saveBook error:', err);
    }
  }
}

export function deleteBook(idOrSlug: string): void {
  const list = getBooks().filter((b) => b.id !== idOrSlug && b.slug !== idOrSlug);
  writeJson(BOOKS_FILE, list);
}

export async function deleteBookAsync(idOrSlug: string): Promise<void> {
  deleteBook(idOrSlug);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM books WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      console.error('[cmsStore] MySQL deleteBook error:', err);
    }
  }
}

// ---------------- BLOGS CRUD ----------------
export function getBlogs(): ExtendedBlogPost[] {
  return readJson<ExtendedBlogPost[]>(BLOGS_FILE, initialBlogs);
}

export async function getBlogsAsync(): Promise<ExtendedBlogPost[]> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query('SELECT * FROM blogs ORDER BY created_at DESC') as [any[], any];
      if (rows && rows.length > 0) {
        return rows.map((r) => {
          const base = initialBlogs.find((b) => b.id === r.id || b.slug === r.slug) || initialBlogs[0];
          const authorName = typeof r.author === 'string' ? r.author : base.author.name;
          return {
            ...base,
            id: r.id,
            slug: r.slug,
            title: r.title,
            excerpt: r.excerpt || base.excerpt,
            author: {
              ...base.author,
              name: authorName,
            },
            publishedDate: r.date || base.publishedDate,
            readTimeMinutes: typeof r.read_time === 'number' ? r.read_time : parseInt(r.read_time || '5') || 5,
            category: r.category || base.category,
            coverImage: r.image || base.coverImage,
            htmlContent: r.html_content || undefined,
            relatedProductSlugs: safeJsonParse(r.related_product_slugs, base.relatedProductSlugs || []),
            relatedBookSlugs: safeJsonParse(r.related_book_slugs, base.relatedBookSlugs || []),
          } as ExtendedBlogPost;
        });
      }
        await markMySQLResourceSeeded('blogs');
      }
      const didSeed = await seedMySQLResourceOnce(
        'blogs',
        initialBlogs,
        async (item) => await saveBlogAsync(item as any)
      );
      return didSeed ? initialBlogs : [];
    } catch (err) {
      console.error('[cmsStore] getBlogsAsync MySQL error:', err);
      throw err;
    }
  }
  return getBlogs();
}

export function saveBlog(blog: ExtendedBlogPost): void {
  const list = getBlogs();
  const index = list.findIndex((b) => b.id === blog.id || b.slug === blog.slug);
  if (index >= 0) {
    list[index] = blog;
  } else {
    list.unshift(blog);
  }
  writeJson(BLOGS_FILE, list);
}

export async function saveBlogAsync(blog: ExtendedBlogPost): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const query = `
        INSERT INTO blogs (id, slug, title, excerpt, author, date, read_time, category, image, content, html_content, related_product_slugs, related_book_slugs)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          excerpt = VALUES(excerpt),
          author = VALUES(author),
          date = VALUES(date),
          read_time = VALUES(read_time),
          category = VALUES(category),
          image = VALUES(image),
          content = VALUES(content),
          html_content = VALUES(html_content),
          related_product_slugs = VALUES(related_product_slugs),
          related_book_slugs = VALUES(related_book_slugs);
      `;
      const authorStr = typeof blog.author === 'string' ? blog.author : blog.author?.name || 'AR Blessings Editorial';
      const dateStr = (blog as any).date || blog.publishedDate || new Date().toISOString();
      const readTimeStr = (blog as any).readTime || (blog.readTimeMinutes ? `${blog.readTimeMinutes} min read` : '5 min read');
      const imageStr = (blog as any).image || blog.coverImage || '';
      const contentStr = typeof blog.content === 'string' ? blog.content : JSON.stringify(blog.content || {});
      await pool.query(query, [
        blog.id,
        blog.slug,
        blog.title,
        blog.excerpt || '',
        authorStr,
        dateStr,
        readTimeStr,
        blog.category || 'Vedic Prosperity',
        imageStr,
        contentStr,
        blog.htmlContent || null,
        JSON.stringify(blog.relatedProductSlugs || []),
        JSON.stringify(blog.relatedBookSlugs || []),
      ]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    saveBlog(blog);
  }
}

export function deleteBlog(idOrSlug: string): void {
  const list = getBlogs().filter((b) => b.id !== idOrSlug && b.slug !== idOrSlug);
  writeJson(BLOGS_FILE, list);
}

export async function deleteBlogAsync(idOrSlug: string): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM blogs WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    deleteBlog(idOrSlug);
  }
}

// ---------------- WEBINARS CRUD ----------------
export function getWebinars(): Webinar[] {
  return readJson<Webinar[]>(WEBINARS_FILE, INITIAL_WEBINARS);
}

export async function getWebinarsAsync(): Promise<Webinar[]> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query('SELECT * FROM webinars ORDER BY created_at DESC') as [any[], any];
      if (rows && rows.length > 0) {
        const webinars: Webinar[] = [];
        for (const r of rows) {
          const [reviewRows] = await pool.query('SELECT * FROM webinar_reviews WHERE webinar_id = ? ORDER BY created_at DESC', [r.id]) as [any[], any];
          const reviews: WebinarReview[] = reviewRows.map((rev) => ({
            id: rev.id,
            name: rev.name,
            roleOrLocation: rev.role_or_location || undefined,
            rating: rev.rating || 5,
            comment: rev.comment || '',
            date: rev.date || undefined,
            avatar: rev.avatar || undefined,
          }));

          webinars.push({
            id: r.id,
            slug: r.slug,
            title: r.title,
            subtitle: r.subtitle || '',
            description: r.description || '',
            speaker: {
              name: r.speaker_name,
              title: r.speaker_title,
              image: r.speaker_image || undefined,
            },
            dateTime: r.date_time,
            duration: r.duration,
            price: r.price,
            registrationUrl: r.registration_url,
            status: r.status || 'upcoming',
            bannerImage: r.banner_image,
            agenda: safeJsonParse(r.agenda, []),
            whoShouldAttend: safeJsonParse(r.who_should_attend, []),
            reviews,
          });
        }
        return webinars;
      }
        await markMySQLResourceSeeded('webinars');
      }
      const didSeed = await seedMySQLResourceOnce(
        'webinars',
        INITIAL_WEBINARS,
        async (item) => await saveWebinarAsync(item as any)
      );
      return didSeed ? INITIAL_WEBINARS : [];
    } catch (err) {
      console.error('[cmsStore] getWebinarsAsync MySQL error:', err);
      throw err;
    }
  }
  return getWebinars();
}

export function saveWebinar(webinar: Webinar): void {
  const list = getWebinars();
  const index = list.findIndex((w) => w.id === webinar.id || w.slug === webinar.slug);
  if (index >= 0) {
    list[index] = webinar;
  } else {
    list.unshift(webinar);
  }
  writeJson(WEBINARS_FILE, list);
}

export async function saveWebinarAsync(webinar: Webinar): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const query = `
        INSERT INTO webinars (id, slug, title, subtitle, description, speaker_name, speaker_title, speaker_image, date_time, duration, price, registration_url, status, banner_image, agenda, who_should_attend)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          subtitle = VALUES(subtitle),
          description = VALUES(description),
          speaker_name = VALUES(speaker_name),
          speaker_title = VALUES(speaker_title),
          speaker_image = VALUES(speaker_image),
          date_time = VALUES(date_time),
          duration = VALUES(duration),
          price = VALUES(price),
          registration_url = VALUES(registration_url),
          status = VALUES(status),
          banner_image = VALUES(banner_image),
          agenda = VALUES(agenda),
          who_should_attend = VALUES(who_should_attend);
      `;
      await pool.query(query, [
        webinar.id,
        webinar.slug,
        webinar.title,
        webinar.subtitle,
        webinar.description,
        webinar.speaker.name,
        webinar.speaker.title,
        webinar.speaker.image || null,
        webinar.dateTime,
        webinar.duration,
        webinar.price,
        webinar.registrationUrl,
        webinar.status,
        webinar.bannerImage,
        JSON.stringify(webinar.agenda || []),
        JSON.stringify(webinar.whoShouldAttend || []),
      ]);

      if (webinar.reviews && webinar.reviews.length > 0) {
        for (const rev of webinar.reviews) {
          await pool.query(`
            INSERT INTO webinar_reviews (id, webinar_id, name, role_or_location, rating, comment, avatar, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              name = VALUES(name),
              role_or_location = VALUES(role_or_location),
              rating = VALUES(rating),
              comment = VALUES(comment),
              avatar = VALUES(avatar),
              date = VALUES(date);
          `, [
            rev.id,
            webinar.id,
            rev.name,
            rev.roleOrLocation || null,
            rev.rating || 5,
            rev.comment,
            rev.avatar || null,
            rev.date || null
          ]);
        }
      }
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    saveWebinar(webinar);
  }
}

export function deleteWebinar(idOrSlug: string): void {
  const list = getWebinars().filter((w) => w.id !== idOrSlug && w.slug !== idOrSlug);
  writeJson(WEBINARS_FILE, list);
}

export async function deleteWebinarAsync(idOrSlug: string): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM webinar_reviews WHERE webinar_id IN (SELECT id FROM webinars WHERE id = ? OR slug = ?)', [idOrSlug, idOrSlug]);
      await pool.query('DELETE FROM webinars WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    deleteWebinar(idOrSlug);
  }
}

// ==================== COURSES & LMS CMS ====================

export function getCourses(): Course[] {
  const disk = readJson<Course[]>(COURSES_FILE, []);
  if (!disk || disk.length === 0) {
    writeJson(COURSES_FILE, INITIAL_COURSES);
    return INITIAL_COURSES;
  }
  return disk;
}

export async function getCoursesAsync(): Promise<Course[]> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const [rows] = await pool.query('SELECT * FROM courses ORDER BY created_at DESC') as [any[], any];
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          subtitle: r.subtitle || '',
          description: r.description || '',
          category: r.category || 'Spiritual Wisdom',
          level: r.level || 'All Levels',
          instructor: {
            name: r.instructor_name || 'Aacharya Ji',
            title: r.instructor_title || 'Vedic Master',
            image: r.instructor_image || undefined,
          },
          thumbnail: r.thumbnail,
          trailerVideoUrl: r.trailer_video_url || undefined,
          price: Number(r.price) || 0,
          originalPrice: Number(r.original_price) || 0,
          rating: Number(r.rating) || 5.0,
          reviewsCount: Number(r.reviews_count) || 0,
          totalDuration: r.total_duration || '5 Hours',
          totalLessons: Number(r.total_lessons) || 10,
          language: r.language || 'Hindi & English',
          whatYouWillLearn: safeJsonParse(r.what_you_will_learn, []),
          requirements: safeJsonParse(r.requirements, []),
          certificateEnabled: Boolean(r.certificate_enabled),
          status: r.status || 'published',
          modules: safeJsonParse(r.modules, []),
        }));
      }
        await markMySQLResourceSeeded('courses');
      }
      const didSeed = await seedMySQLResourceOnce(
        'courses',
        INITIAL_COURSES,
        async (item) => await saveCourseAsync(item as any)
      );
      return didSeed ? INITIAL_COURSES : [];
    } catch (err) {
      console.error('[cmsStore] getCoursesAsync MySQL error:', err);
      throw err;
    }
  }
  return getCourses();
}

export function getCourseBySlug(slug: string): Course | undefined {
  return getCourses().find((c) => c.slug === slug || c.id === slug);
}

export async function getCourseBySlugAsync(slug: string): Promise<Course | undefined> {
  const list = await getCoursesAsync();
  return list.find((c) => c.slug === slug || c.id === slug);
}

export function saveCourse(course: Course): void {
  const list = getCourses();
  const index = list.findIndex((c) => c.id === course.id || c.slug === course.slug);
  if (index >= 0) {
    list[index] = course;
  } else {
    list.unshift(course);
  }
  writeJson(COURSES_FILE, list);
}

export async function saveCourseAsync(course: Course): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const query = `
        INSERT INTO courses (
          id, slug, title, subtitle, description, category, level,
          instructor_name, instructor_title, instructor_image, thumbnail, trailer_video_url,
          price, original_price, rating, reviews_count, total_duration, total_lessons,
          language, what_you_will_learn, requirements, certificate_enabled, status, modules
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          slug = VALUES(slug),
          title = VALUES(title),
          subtitle = VALUES(subtitle),
          description = VALUES(description),
          category = VALUES(category),
          level = VALUES(level),
          instructor_name = VALUES(instructor_name),
          instructor_title = VALUES(instructor_title),
          instructor_image = VALUES(instructor_image),
          thumbnail = VALUES(thumbnail),
          trailer_video_url = VALUES(trailer_video_url),
          price = VALUES(price),
          original_price = VALUES(original_price),
          rating = VALUES(rating),
          reviews_count = VALUES(reviews_count),
          total_duration = VALUES(total_duration),
          total_lessons = VALUES(total_lessons),
          language = VALUES(language),
          what_you_will_learn = VALUES(what_you_will_learn),
          requirements = VALUES(requirements),
          certificate_enabled = VALUES(certificate_enabled),
          status = VALUES(status),
          modules = VALUES(modules);
      `;
      await pool.query(query, [
        course.id,
        course.slug,
        course.title,
        course.subtitle || '',
        course.description || '',
        course.category,
        course.level,
        course.instructor.name,
        course.instructor.title,
        course.instructor.image || null,
        course.thumbnail,
        course.trailerVideoUrl || null,
        course.price,
        course.originalPrice || 0,
        course.rating,
        course.reviewsCount,
        course.totalDuration,
        course.totalLessons,
        course.language,
        JSON.stringify(course.whatYouWillLearn || []),
        JSON.stringify(course.requirements || []),
        course.certificateEnabled ? 1 : 0,
        course.status,
        JSON.stringify(course.modules || []),
      ]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    saveCourse(course);
  }
}

export function deleteCourse(idOrSlug: string): void {
  const list = getCourses().filter((c) => c.id !== idOrSlug && c.slug !== idOrSlug);
  writeJson(COURSES_FILE, list);
}

export async function deleteCourseAsync(idOrSlug: string): Promise<void> {
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM courses WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      throw err;
    }
  }
  if (!pool) {
    deleteCourse(idOrSlug);
  }
}

// Enrollments & Progress Store
export function getEnrollments(): UserCourseEnrollment[] {
  return readJson<UserCourseEnrollment[]>(ENROLLMENTS_FILE, []);
}

export function saveEnrollment(en: UserCourseEnrollment): void {
  const list = getEnrollments();
  const idx = list.findIndex((x) => x.id === en.id || (x.userPhone === en.userPhone && x.courseId === en.courseId));
  if (idx >= 0) {
    list[idx] = en;
  } else {
    list.unshift(en);
  }
  writeJson(ENROLLMENTS_FILE, list);
}

export async function enrollUserInCourse(userId: string, userPhone: string, courseId: string, orderId?: string): Promise<UserCourseEnrollment> {
  const cleanPhone = (userPhone || '').replace(/\D/g, '').slice(-10);
  const enrollment: UserCourseEnrollment = {
    id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId: userId || cleanPhone,
    userPhone: cleanPhone,
    courseId,
    orderId,
    enrolledAt: new Date().toISOString(),
    progressPercentage: 0,
    completedLessonIds: [],
  };
  saveEnrollment(enrollment);

  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query(`
        INSERT INTO user_course_enrollments (id, user_id, user_phone, course_id, order_id, progress_percentage, completed_lesson_ids, enrolled_at)
        VALUES (?, ?, ?, ?, ?, 0, '[]', NOW())
        ON DUPLICATE KEY UPDATE order_id = VALUES(order_id);
      `, [enrollment.id, enrollment.userId, enrollment.userPhone, enrollment.courseId, enrollment.orderId || null]);
    } catch (err) {
      console.error('[cmsStore] enrollUserInCourse MySQL error:', err);
    }
  }
  return enrollment;
}

export async function getUserEnrollmentsAsync(userPhone?: string, userId?: string): Promise<UserCourseEnrollment[]> {
  const cleanPhone = (userPhone || '').replace(/\D/g, '').slice(-10);
  if (!cleanPhone && !userId) return [];

  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      let query = 'SELECT * FROM user_course_enrollments WHERE ';
      const params: any[] = [];
      if (cleanPhone && userId) {
        query += '(user_phone = ? OR user_id = ?)';
        params.push(cleanPhone, userId);
      } else if (cleanPhone) {
        query += 'user_phone = ?';
        params.push(cleanPhone);
      } else if (userId) {
        query += 'user_id = ?';
        params.push(userId);
      }
      const [rows] = await pool.query(query, params) as [any[], any];
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          userPhone: r.user_phone,
          courseId: r.course_id,
          orderId: r.order_id || undefined,
          enrolledAt: r.enrolled_at,
          completedAt: r.completed_at || undefined,
          progressPercentage: Number(r.progress_percentage) || 0,
          completedLessonIds: safeJsonParse(r.completed_lesson_ids, []),
          lastLessonId: r.last_lesson_id || undefined,
        }));
      }
    } catch (err) {
      console.error('[cmsStore] getUserEnrollmentsAsync error:', err);
    }
  }
  return getEnrollments().filter((e) => (cleanPhone && e.userPhone === cleanPhone) || (userId && e.userId === userId));
}

export async function updateLessonProgressAsync(
  userPhone: string,
  courseId: string,
  lessonId: string,
  completed: boolean
): Promise<{ progressPercentage: number; completedLessonIds: string[] }> {
  const cleanPhone = (userPhone || '').replace(/\D/g, '').slice(-10);
  const enrollments = await getUserEnrollmentsAsync(cleanPhone);
  let enrollment = enrollments.find((e) => e.courseId === courseId);
  if (!enrollment) {
    enrollment = await enrollUserInCourse(cleanPhone, cleanPhone, courseId);
  }

  const course = await getCourseBySlugAsync(courseId);
  const totalLessons = course?.totalLessons || 10;

  let completedSet = new Set<string>(enrollment.completedLessonIds || []);
  if (completed) {
    completedSet.add(lessonId);
  } else {
    completedSet.delete(lessonId);
  }

  const completedLessonIds = Array.from(completedSet);
  const progressPercentage = Math.min(100, Math.round((completedLessonIds.length / totalLessons) * 100));

  enrollment.completedLessonIds = completedLessonIds;
  enrollment.progressPercentage = progressPercentage;
  enrollment.lastLessonId = lessonId;
  if (progressPercentage === 100 && !enrollment.completedAt) {
    enrollment.completedAt = new Date().toISOString();
  }

  saveEnrollment(enrollment);

  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query(`
        UPDATE user_course_enrollments
        SET progress_percentage = ?, completed_lesson_ids = ?, last_lesson_id = ?, completed_at = ?
        WHERE user_phone = ? AND course_id = ?
      `, [
        progressPercentage,
        JSON.stringify(completedLessonIds),
        lessonId,
        enrollment.completedAt || null,
        cleanPhone,
        courseId,
      ]);
    } catch (err) {
      console.error('[cmsStore] updateLessonProgressAsync error:', err);
    }
  }

  return { progressPercentage, completedLessonIds };
}


export async function getSiteSettingsAsync(): Promise<SiteSettings> {
  const pool = getMySQLPool();
  if (!pool) return DEFAULT_SITE_SETTINGS;

  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');

  const [rows] = await pool.query(
    'SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key ASC'
  ) as [any[], any];

  const merged: any = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
  for (const row of rows || []) {
    if (!row?.setting_key) continue;
    try {
      merged[row.setting_key] = JSON.parse(row.setting_value);
    } catch {
      merged[row.setting_key] = row.setting_value;
    }
  }

  // First production read seeds the settings table once. After that, an empty/changed
  // value remains authoritative in MySQL and is never replaced by source-code defaults.
  if (!rows || rows.length === 0) {
    await saveSiteSettingsToMySQLAsync(DEFAULT_SITE_SETTINGS);
    return DEFAULT_SITE_SETTINGS;
  }

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...merged,
    videos: Array.isArray(merged.videos) ? merged.videos : DEFAULT_SITE_SETTINGS.videos,
    testimonials: Array.isArray(merged.testimonials) ? merged.testimonials : DEFAULT_SITE_SETTINGS.testimonials,
  };
}

export async function getSiteSettingsFromMySQLAsync(): Promise<SiteSettings> {
  const pool = getMySQLPool();
  if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');
  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');
  const [rows] = await pool.query(
    'SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key ASC'
  ) as [any[], any];
  if (!rows || rows.length === 0) return DEFAULT_SITE_SETTINGS;
  const merged: any = JSON.parse(JSON.stringify(DEFAULT_SITE_SETTINGS));
  for (const row of rows) {
    if (!row?.setting_key) continue;
    try { merged[row.setting_key] = JSON.parse(row.setting_value); }
    catch { merged[row.setting_key] = row.setting_value; }
  }
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...merged,
    videos: Array.isArray(merged.videos) ? merged.videos : DEFAULT_SITE_SETTINGS.videos,
    testimonials: Array.isArray(merged.testimonials) ? merged.testimonials : DEFAULT_SITE_SETTINGS.testimonials,
  };
}

export async function saveSiteSettingsToMySQLAsync(settings: SiteSettings): Promise<SiteSettings> {
  const pool = getMySQLPool();
  if (!pool) throw new Error('MYSQL_NOT_CONFIGURED');
  const initialized = await initializeDatabaseTables();
  if (!initialized) throw new Error('MYSQL_INITIALIZATION_FAILED');

  const normalized: SiteSettings = {
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
    videos: Array.isArray(settings.videos) ? settings.videos : [],
    testimonials: Array.isArray(settings.testimonials) ? settings.testimonials : [],
  };

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    for (const [key, value] of Object.entries(normalized)) {
      await connection.query(
        `INSERT INTO site_settings (setting_key, setting_value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, typeof value === 'string' ? value : JSON.stringify(value)]
      );
    }
    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
  return getSiteSettingsFromMySQLAsync();
}
