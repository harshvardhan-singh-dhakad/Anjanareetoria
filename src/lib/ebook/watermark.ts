import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { WATERMARKED_DIR, ensureStorageDirs, getOrGenerateSourcePdf } from './storage';
import { findOrderById } from './orderStore';

/**
 * Generates a per-buyer watermarked PDF and caches it on disk under
 * /private-ebooks/watermarked/{orderId}.pdf.
 *
 * Watermark format:
 * Diagonal, tiled, low-opacity text across every page containing:
 * Buyer Phone + Order ID + Purchase Date.
 */
export async function watermarkAndCache(orderId: string): Promise<string> {
  ensureStorageDirs();
  const cachedFilePath = path.join(WATERMARKED_DIR, `${orderId}.pdf`);

  // 1. Return cached copy if already generated
  if (fs.existsSync(cachedFilePath)) {
    return cachedFilePath;
  }

  // 2. Fetch order details
  const order = findOrderById(orderId);
  if (!order) {
    throw new Error(`Order not found for ID: ${orderId}`);
  }

  // 3. Load master source PDF
  const sourcePdfPath = await getOrGenerateSourcePdf();
  const sourceBytes = fs.readFileSync(sourcePdfPath);
  const pdfDoc = await PDFDocument.load(sourceBytes);

  // 4. Prepare font & watermark text
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const purchaseDateStr = new Date(order.purchaseTimestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const watermarkText = `${order.buyerPhone}  •  ${order.orderId}  •  ${purchaseDateStr}`;
  const fontSize = 11;
  const watermarkOpacity = 0.13; // low-opacity, non-intrusive yet tamper-evident
  const watermarkColor = rgb(0.35, 0.35, 0.35);

  const pages = pdfDoc.getPages();

  // 5. Apply tiled diagonal watermark to every page
  for (const page of pages) {
    const { width, height } = page.getSize();

    // Tile across a grid with 45-degree angle
    const stepX = 220;
    const stepY = 160;

    for (let x = -50; x < width + 150; x += stepX) {
      for (let y = -50; y < height + 150; y += stepY) {
        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font,
          color: watermarkColor,
          opacity: watermarkOpacity,
          rotate: degrees(45),
        });
      }
    }

    // Also place a discreet header running along the top edge
    page.drawText(`Licensed to: ${order.buyerPhone} | Order: ${order.orderId}`, {
      x: 55,
      y: height - 25,
      size: 7,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.45,
    });
  }

  // 6. Save watermarked PDF to private cache
  const watermarkedBytes = await pdfDoc.save();
  fs.writeFileSync(cachedFilePath, watermarkedBytes);

  return cachedFilePath;
}
