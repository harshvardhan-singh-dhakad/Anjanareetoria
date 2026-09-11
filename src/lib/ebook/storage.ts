import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Storage path outside the public web root.
// On Hostinger VPS, can be configured to /var/app/private-ebooks via environment variable.
const DEFAULT_STORAGE_DIR = path.join(process.cwd(), 'private-ebooks');
export const EBOOK_STORAGE_DIR = process.env.EBOOK_STORAGE_PATH || DEFAULT_STORAGE_DIR;

export const SOURCE_DIR = path.join(EBOOK_STORAGE_DIR, 'source');
export const WATERMARKED_DIR = path.join(EBOOK_STORAGE_DIR, 'watermarked');
export const DATA_DIR = path.join(EBOOK_STORAGE_DIR, 'data');

/**
 * Ensures all required private directory trees exist on disk.
 */
export function ensureStorageDirs(): void {
  const dirs = [EBOOK_STORAGE_DIR, SOURCE_DIR, WATERMARKED_DIR, DATA_DIR];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Returns the path to the master source PDF.
 * If no source PDF exists, generates a rich, 5-page sample booklet
 * so the entire system works immediately out of the box.
 */
export async function getOrGenerateSourcePdf(filename = 'karodon-ka-rahasya.pdf'): Promise<string> {
  ensureStorageDirs();
  const filePath = path.join(SOURCE_DIR, filename);

  if (fs.existsSync(filePath)) {
    return filePath;
  }

  // Generate a starter booklet for demonstration
  const pdfDoc = await PDFDocument.create();
  const fontTimes = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const pagesData = [
    {
      title: "KARODON KA RAHASYA",
      subtitle: "The Sacred Science of Wealth & Prosperity",
      body: [
        "Welcome to the authentic consecrated digital edition.",
        "Published exclusively by AR Blessings Spiritual Guild.",
        "",
        "This master booklet contains ancient Vedic prosperity principles,",
        "the science of sacred geometric containers, and daily manifestation regimens.",
        "",
        "NOTICE: This document is protected by personalized digital watermarking.",
        "Unauthorized redistribution, re-hosting, or duplication is strictly monitored."
      ]
    },
    {
      title: "CHAPTER 1: The Law of Currency Resonance",
      subtitle: "Understanding the Living Frequency of Wealth",
      body: [
        "In the Vedic tradition, wealth is known as Chanchala—dynamic, flowing energy.",
        "Money does not move toward anxiety, desperation, or cluttered minds.",
        "It settles where there is order, reverence, gratitude, and consecrated alignment.",
        "",
        "When you hold currency in an organized, consecrated vessel like Karodon Ka Wallet,",
        "you eliminate chaotic electromagnetic interference. You broadcast a signal of abundance."
      ]
    },
    {
      title: "CHAPTER 2: Brahma Muhurta Manifestation",
      subtitle: "The 4:00 AM Window of Pure Prana",
      body: [
        "The period 90 minutes before sunrise is when cosmic noise is at its minimum.",
        "Starting your morning with Kara Darshana (recognizing divine abundance in your palms),",
        "consuming sacred energized water, and applying pure herbal tilak sets your vibration.",
        "",
        "Devote 10 minutes each morning to writing your goals in the present tense."
      ]
    },
    {
      title: "CHAPTER 3: Spatial Alignment & Vastu",
      subtitle: "Activating the North & Northeast Quadrants",
      body: [
        "Lord Kuber governs the North quadrant of any building.",
        "Keep the North direction free from clutter, heavy dustbins, or fire elements.",
        "Place consecrated water or metallic tokens in the Northern zone to unlock receivables.",
        "",
        "The Northeast (Ishanya) corner must remain light, clean, and elevated with divine fragrance."
      ]
    },
    {
      title: "EPILOGUE & DAILY BLESSINGS",
      subtitle: "Maintaining Your Personal Sanctuary of Abundance",
      body: [
        "Prosperity is a habitual alignment of conscious thought, sacred reverence, and steady action.",
        "Carry this wisdom with humility, share blessings with those in need, and watch miracles unfold.",
        "",
        "Blessings and divine fortune on your journey.",
        "— AR Blessings Council"
      ]
    }
  ];

  for (const pData of pagesData) {
    const page = pdfDoc.addPage([595, 842]); // Standard A4 (points)
    const { width, height } = page.getSize();

    // Decorative page border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderColor: rgb(0.8, 0.65, 0.2),
      borderWidth: 1.5,
    });

    // Inner subtle border
    page.drawRectangle({
      x: 36,
      y: 36,
      width: width - 72,
      height: height - 72,
      borderColor: rgb(0.9, 0.8, 0.4),
      borderWidth: 0.5,
    });

    // Header Title
    page.drawText(pData.title, {
      x: 55,
      y: height - 80,
      size: 20,
      font: fontTimes,
      color: rgb(0.05, 0.1, 0.4),
    });

    // Subtitle
    page.drawText(pData.subtitle, {
      x: 55,
      y: height - 105,
      size: 11,
      font: fontItalic,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Horizontal Rule
    page.drawLine({
      start: { x: 55, y: height - 118 },
      end: { x: width - 55, y: height - 118 },
      thickness: 1,
      color: rgb(0.8, 0.65, 0.2),
    });

    // Body Paragraphs
    let currentY = height - 155;
    for (const line of pData.body) {
      if (line === "") {
        currentY -= 12;
      } else {
        page.drawText(line, {
          x: 55,
          y: currentY,
          size: 11,
          font: fontRegular,
          color: rgb(0.2, 0.2, 0.2),
          lineHeight: 16,
        });
        currentY -= 20;
      }
    }

    // Footer
    page.drawText("AR Blessings • Consecrated Sacred Literature • All Rights Reserved", {
      x: 55,
      y: 48,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}
