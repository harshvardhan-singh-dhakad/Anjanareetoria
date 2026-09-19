"use client";

import React from 'react';
import { Product } from '@/data/products';
import { Book } from '@/data/books';
import { BlogPost } from '@/data/blogs';

// ─────────────────────────────────────────────────────────────────
// 1. ORGANIZATION SCHEMA — Global business identity
// ─────────────────────────────────────────────────────────────────
export const OrganizationSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AR Blessings",
    "alternateName": "AR Blessings — Uniquely Designed Gems & Sacred Spiritual Essentials",
    "url": "https://arblessings.com",
    "logo": "https://arblessings.com/images/logo.png",
    "image": "https://arblessings.com/images/logo.png",
    "description": "India's premier spiritual e-commerce brand offering authentically consecrated prosperity essentials, sacred books, divine fragrances, and spiritual gems. Bridging ancient Vedic wisdom with modern lifestyle.",
    "email": "support@arblessings.com",
    "sameAs": [
      "https://www.instagram.com/ar_blessings_"
    ],
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "knowsAbout": [
      "Spiritual books and e-books",
      "Vedic literature",
      "Vastu",
      "Spiritual courses and webinars",
      "Sacred lifestyle products"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "support@arblessings.com",
      "contactType": "customer service",
      "availableLanguage": ["Hindi", "English"]
    },
    "foundingDate": "2022",
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "minValue": 2,
      "maxValue": 10
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 2. WEBSITE SCHEMA — Site-level with SearchAction (Sitelinks)
// ─────────────────────────────────────────────────────────────────
export const WebSiteSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AR Blessings",
    "url": "https://arblessings.com",
    "description": "Shop authentic consecrated prosperity essentials including Karodon Ka Wallet, Karodon Ka Dollar, divine fragrances, sacred books, and spiritual gems.",
    "publisher": {
      "@type": "Organization",
      "name": "AR Blessings",
      "logo": {
        "@type": "ImageObject",
        "url": "https://arblessings.com/images/logo.png"
      }
    },
    "inLanguage": ["en", "hi"]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 3. BREADCRUMB SCHEMA
// ─────────────────────────────────────────────────────────────────
interface BreadcrumbItem {
  name: string;
  url: string;
}

export const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 3A. BOOK CATALOG SCHEMA — Helps search/AI systems understand a collection page
// ─────────────────────────────────────────────────────────────────
export const BookListSchema: React.FC<{ books: Book[] }> = ({ books }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AR Blessings Books & E-Books",
    "description": "Sacred books, e-books, and guided spiritual literature from AR Blessings.",
    "url": "https://arblessings.com/books",
    "numberOfItems": books.length,
    "itemListElement": books.map((book, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": book.name,
      "url": `https://arblessings.com/books/${book.slug}`,
      "image": `https://arblessings.com${book.image}`,
      "item": {
        "@type": "Book",
        "name": book.name,
        "url": `https://arblessings.com/books/${book.slug}`,
        "author": {
          "@type": "Person",
          "name": book.author
        },
        ...(book.isbn ? { "isbn": book.isbn } : {}),
        ...(book.pages ? { "numberOfPages": book.pages } : {}),
        "inLanguage": book.language,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 4. PRODUCT SCHEMA — For individual product pages
// ─────────────────────────────────────────────────────────────────
export const ProductSchema: React.FC<{ product: Product }> = ({ product }) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": `https://arblessings.com${product.image}`,
    "url": `https://arblessings.com/product/${product.slug}`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "AR Blessings"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://arblessings.com/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().getFullYear() + 1, 11, 31).toISOString().split('T')[0],
      "availability": product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "AR Blessings"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "d"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "d"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "applicableCountry": "IN"
      }
    }
  };

  // Add aggregateRating if rating exists
  if (product.rating && product.reviewCount) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": product.reviewCount
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 5. BOOK SCHEMA — For individual book pages
// ─────────────────────────────────────────────────────────────────
export const BookSchema: React.FC<{ book: Book }> = ({ book }) => {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.name,
    "description": book.description,
    "image": `https://arblessings.com${book.image}`,
    "url": `https://arblessings.com/books/${book.slug}`,
    "isbn": book.isbn,
    "numberOfPages": book.pages,
    "inLanguage": book.language,
    "datePublished": String(book.publishedYear),
    "bookFormat": book.formatType === 'ebook'
      ? "https://schema.org/EBook"
      : "https://schema.org/Hardcover",
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "AR Blessings"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://arblessings.com/books/${book.slug}`,
      "priceCurrency": "INR",
      "price": book.ebookPrice || book.price,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "AR Blessings"
      }
    }
  };

  if (book.rating && book.reviewCount) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": book.rating,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": book.reviewCount
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 6. BLOG / ARTICLE SCHEMA — For individual blog pages
// ─────────────────────────────────────────────────────────────────
export const BlogArticleSchema: React.FC<{ post: BlogPost }> = ({ post }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": `https://arblessings.com${post.coverImage}`,
    "url": `https://arblessings.com/blog/${post.slug}`,
    "datePublished": new Date(post.publishedDate).toISOString(),
    "dateModified": new Date(post.publishedDate).toISOString(),
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role
    },
    "publisher": {
      "@type": "Organization",
      "name": "AR Blessings",
      "logo": {
        "@type": "ImageObject",
        "url": "https://arblessings.com/images/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://arblessings.com/blog/${post.slug}`
    },
    "articleSection": post.category,
    "keywords": post.tags.join(", "),
    "wordCount": post.readTimeMinutes * 200,
    "inLanguage": "en"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 7. LOCAL BUSINESS SCHEMA — For richer Google presence
// ─────────────────────────────────────────────────────────────────
export const LocalBusinessSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "AR Blessings",
    "image": "https://arblessings.com/images/logo.png",
    "url": "https://arblessings.com",
    "email": "support@arblessings.com",
    "description": "India's premier spiritual e-commerce brand offering consecrated prosperity essentials, sacred books, divine fragrances, and spiritual gems.",
    "priceRange": "₹200 - ₹15,000",
    "currenciesAccepted": "INR",
    "paymentAccepted": "UPI, Credit Card, Debit Card, Net Banking",
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://www.instagram.com/ar_blessings_"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 8. ITEM LIST SCHEMA — For Product Collection / Catalog pages
// ─────────────────────────────────────────────────────────────────
export const ProductListSchema: React.FC<{ products: Product[] }> = ({ products }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "AR Blessings Products — Uniquely Designed Gems & Sacred Spiritual Essentials",
    "description": "Browse all consecrated prosperity essentials from AR Blessings",
    "url": "https://arblessings.com/#products",
    "numberOfItems": products.length,
    "itemListElement": products.map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": product.name,
      "url": `https://arblessings.com/product/${product.slug}`,
      "image": `https://arblessings.com${product.image}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// 9. FAQ SCHEMA — Common questions for rich snippet
// ─────────────────────────────────────────────────────────────────
export const FAQSchema: React.FC = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is AR Blessings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AR Blessings is India's premier spiritual e-commerce brand offering authentically consecrated prosperity essentials, sacred books, divine fragrances, and spiritual gems. All products are individually blessed and energized by spiritual masters."
        }
      },
      {
        "@type": "Question",
        "name": "What is Karodon Ka Wallet?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Karodon Ka Wallet is the flagship product of AR Blessings — a premium quality genuine leather wallet designed according to sacred geometry and prosperity alignments. It includes specific compartments blessed for wealth retention and multiplication. Priced at ₹4,000."
        }
      },
      {
        "@type": "Question",
        "name": "How are AR Blessings products consecrated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each AR Blessings product undergoes specialized consecration rituals performed by Vedic spiritual masters. These rituals infuse the products with protective and magnetic spiritual frequencies to attract prosperity and positive energy."
        }
      },
      {
        "@type": "Question",
        "name": "What books does AR Blessings offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AR Blessings offers sacred literature including 'Karodon Ka Rahasya' (₹499, Bestseller), 'Vastu For Miracles' (₹399), 'Daily Vedic Mantras & 90-Day Manifestation Journal' (₹449), and 'The Cosmic Vault' (₹299, Digital Exclusive). All available in e-book and/or physical editions."
        }
      },
      {
        "@type": "Question",
        "name": "What is AR Blessings' refund policy?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AR Blessings has a 7-day return policy for physical products. For details, please visit the Refund Policy page at https://arblessings.com/refund-policy"
        }
      },
      {
        "@type": "Question",
        "name": "How can I contact AR Blessings?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "You can reach AR Blessings via email at support@arblessings.com, through Instagram @ar_blessings_, or via the WhatsApp chat button on the website."
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
