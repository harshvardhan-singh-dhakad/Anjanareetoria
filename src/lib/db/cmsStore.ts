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
            features: typeof r.features === 'string' ? JSON.parse(r.features) : (r.features || []),
            specifications: typeof r.specifications === 'string' ? JSON.parse(r.specifications) : (r.specifications || {}),
          } as Product;
        });
      }
      // Seed MySQL with initial products if table is empty
      for (const p of initialProducts) {
        await saveProductAsync(p);
      }
    } catch (err) {
      console.error('[cmsStore] MySQL getProducts error, falling back to disk:', err);
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
  saveProduct(product);
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
      console.error('[cmsStore] MySQL saveProduct error:', err);
    }
  }
}

export function deleteProduct(idOrSlug: string): void {
  const list = getProducts().filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
  writeJson(PRODUCTS_FILE, list);
}

export async function deleteProductAsync(idOrSlug: string): Promise<void> {
  deleteProduct(idOrSlug);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM products WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      console.error('[cmsStore] MySQL deleteProduct error:', err);
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
        return rows.map((r) => {
          const base = initialBooks.find((b) => b.id === r.id || b.slug === r.slug) || initialBooks[0];
          const desc = r.description || base.description || '';
          return {
            ...base,
            id: r.id,
            slug: r.slug,
            name: r.title || r.name || base.name,
            title: r.title || r.name || base.name,
            subtitle: r.subtitle || (base as any).subtitle || '',
            description: desc,
            shortDescription: desc.length > 120 ? desc.slice(0, 117) + '...' : desc,
            author: r.author || base.author || 'AR Blessings Council',
            price: r.price || base.price || 499,
            ebookPrice: r.ebook_price || base.ebookPrice || r.price || 499,
            physicalPrice: base.physicalPrice,
            image: r.cover_image || base.image || '/images/books/karodon-ka-rahasya.svg',
            coverImage: r.cover_image || base.image || '/images/books/karodon-ka-rahasya.svg',
            pdfSourceFile: r.pdf_source_file || undefined,
            rating: r.rating !== undefined && r.rating !== null ? Number(r.rating) : (base.rating || 5.0),
            reviewCount: r.reviews_count || base.reviewCount || 0,
            category: r.category || base.category || 'Books & E-Books',
            inStock: r.in_stock !== undefined ? Boolean(r.in_stock) : true,
            pages: r.pages || base.pages || 100,
            language: r.language || base.language || 'Hindi & English',
            formatType: base.formatType || 'both',
            publishedYear: base.publishedYear || 2024,
            tableOfContents: base.tableOfContents || [],
            sampleExcerpt: base.sampleExcerpt || { chapterTitle: 'Introduction', paragraphs: [] },
            features: base.features || [],
            previewPages: typeof r.preview_pages === 'string' ? JSON.parse(r.preview_pages) : (r.preview_pages || []),
            keyTakeaways: typeof r.key_takeaways === 'string' ? JSON.parse(r.key_takeaways) : (r.key_takeaways || []),
          } as ExtendedBook;
        });
      }
      // Seed MySQL with initial books if table is empty
      for (const b of initialBooks) {
        await saveBookAsync(b);
      }
    } catch (err) {
      console.error('[cmsStore] MySQL getBooks error, falling back to disk:', err);
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

export async function saveBookAsync(book: ExtendedBook): Promise<void> {
  saveBook(book);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      const query = `
        INSERT INTO books (id, slug, title, subtitle, description, author, price, ebook_price, cover_image, pdf_source_file, rating, reviews_count, category, in_stock, pages, language, preview_pages, key_takeaways)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          subtitle = VALUES(subtitle),
          description = VALUES(description),
          author = VALUES(author),
          price = VALUES(price),
          ebook_price = VALUES(ebook_price),
          cover_image = VALUES(cover_image),
          pdf_source_file = VALUES(pdf_source_file),
          rating = VALUES(rating),
          reviews_count = VALUES(reviews_count),
          category = VALUES(category),
          in_stock = VALUES(in_stock),
          pages = VALUES(pages),
          language = VALUES(language),
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
        author,
        book.price,
        book.ebookPrice || book.price,
        cover,
        book.pdfSourceFile || null,
        book.rating || 5.0,
        book.reviewCount || (book as any).reviewsCount || 0,
        book.category || 'Books & E-Books',
        book.inStock ? 1 : 0,
        book.pages || 100,
        book.language || 'Hindi & English',
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
            relatedProductSlugs: typeof r.related_product_slugs === 'string' ? JSON.parse(r.related_product_slugs) : (r.related_product_slugs || base.relatedProductSlugs || []),
            relatedBookSlugs: typeof r.related_book_slugs === 'string' ? JSON.parse(r.related_book_slugs) : (r.related_book_slugs || base.relatedBookSlugs || []),
          } as ExtendedBlogPost;
        });
      }
      for (const b of initialBlogs) {
        await saveBlogAsync(b);
      }
    } catch (err) {
      console.error('[cmsStore] MySQL getBlogs error, falling back to disk:', err);
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
  saveBlog(blog);
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
      console.error('[cmsStore] MySQL saveBlog error:', err);
    }
  }
}

export function deleteBlog(idOrSlug: string): void {
  const list = getBlogs().filter((b) => b.id !== idOrSlug && b.slug !== idOrSlug);
  writeJson(BLOGS_FILE, list);
}

export async function deleteBlogAsync(idOrSlug: string): Promise<void> {
  deleteBlog(idOrSlug);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM blogs WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      console.error('[cmsStore] MySQL deleteBlog error:', err);
    }
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
            agenda: typeof r.agenda === 'string' ? JSON.parse(r.agenda) : (r.agenda || []),
            whoShouldAttend: typeof r.who_should_attend === 'string' ? JSON.parse(r.who_should_attend) : (r.who_should_attend || []),
            reviews,
          });
        }
        return webinars;
      }
      for (const w of INITIAL_WEBINARS) {
        await saveWebinarAsync(w);
      }
    } catch (err) {
      console.error('[cmsStore] MySQL getWebinars error, falling back to disk:', err);
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
  saveWebinar(webinar);
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
      console.error('[cmsStore] MySQL saveWebinar error:', err);
    }
  }
}

export function deleteWebinar(idOrSlug: string): void {
  const list = getWebinars().filter((w) => w.id !== idOrSlug && w.slug !== idOrSlug);
  writeJson(WEBINARS_FILE, list);
}

export async function deleteWebinarAsync(idOrSlug: string): Promise<void> {
  deleteWebinar(idOrSlug);
  const pool = getMySQLPool();
  if (pool) {
    try {
      await initializeDatabaseTables();
      await pool.query('DELETE FROM webinar_reviews WHERE webinar_id IN (SELECT id FROM webinars WHERE id = ? OR slug = ?)', [idOrSlug, idOrSlug]);
      await pool.query('DELETE FROM webinars WHERE id = ? OR slug = ?', [idOrSlug, idOrSlug]);
    } catch (err) {
      console.error('[cmsStore] MySQL deleteWebinar error:', err);
    }
  }
}
