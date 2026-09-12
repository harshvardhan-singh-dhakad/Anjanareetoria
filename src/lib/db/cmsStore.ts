import fs from 'fs';
import path from 'path';
import { DATA_DIR, ensureStorageDirs } from '../ebook/storage';
import { products as initialProducts, Product } from '@/data/products';
import { books as initialBooks, Book } from '@/data/books';
import { blogs as initialBlogs, BlogPost } from '@/data/blogs';

export interface ExtendedBook extends Book {
  pdfSourceFile?: string; // filename in private-ebooks/source/
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

const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BOOKS_FILE = path.join(DATA_DIR, 'books.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const WEBINARS_FILE = path.join(DATA_DIR, 'webinars.json');

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

function readJson<T>(filePath: string, defaultData: T): T {
  ensureStorageDirs();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[cmsStore] Error reading ${filePath}:`, err);
    return defaultData;
  }
}

function writeJson<T>(filePath: string, data: T): void {
  ensureStorageDirs();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ---------------- PRODUCTS CRUD ----------------
export function getProducts(): Product[] {
  return readJson<Product[]>(PRODUCTS_FILE, initialProducts);
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

export function deleteProduct(idOrSlug: string): void {
  const list = getProducts().filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  writeJson(PRODUCTS_FILE, list);
}

// ---------------- BOOKS CRUD ----------------
export function getBooks(): ExtendedBook[] {
  return readJson<ExtendedBook[]>(BOOKS_FILE, initialBooks);
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

export function deleteBook(idOrSlug: string): void {
  const list = getBooks().filter((b) => b.id !== idOrSlug && b.slug !== idOrSlug);
  writeJson(BOOKS_FILE, list);
}

// ---------------- BLOGS CRUD ----------------
export function getBlogs(): ExtendedBlogPost[] {
  return readJson<ExtendedBlogPost[]>(BLOGS_FILE, initialBlogs);
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

export function deleteBlog(idOrSlug: string): void {
  const list = getBlogs().filter((b) => b.id !== idOrSlug && b.slug !== idOrSlug);
  writeJson(BLOGS_FILE, list);
}

// ---------------- WEBINARS CRUD ----------------
export function getWebinars(): Webinar[] {
  return readJson<Webinar[]>(WEBINARS_FILE, INITIAL_WEBINARS);
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

export function deleteWebinar(idOrSlug: string): void {
  const list = getWebinars().filter((w) => w.id !== idOrSlug && w.slug !== idOrSlug);
  writeJson(WEBINARS_FILE, list);
}
