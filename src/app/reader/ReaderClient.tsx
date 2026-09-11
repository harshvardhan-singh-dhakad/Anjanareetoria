"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  LogOut,
  AlertTriangle,
  Sparkles,
  BookOpen
} from 'lucide-react';

/*
 * ============================================================================
 * SECURITY ARCHITECTURE & DISCLAIMER NOTE:
 * ============================================================================
 * The browser restrictions below (preventing right-click contextmenu, intercepting
 * print shortcuts, overriding window.print, disabling text selection, and omitting
 * download affordances) serve as strong deterrents against casual piracy.
 *
 * They are NOT impenetrable DRM: OS-level screenshots, cameras, or advanced browser
 * memory debugging cannot be completely prevented in any standard web browser.
 * Real protection relies on our server-side pdf-lib watermarking, which permanently
 * tiles the buyer's Phone Number, Order ID, and Purchase Date across every page,
 * making any unauthorized distribution traceable directly to the offender.
 * ============================================================================
 */

interface PdfViewport {
  width: number;
  height: number;
}

interface PdfPageProxy {
  getViewport: (options: { scale: number }) => PdfViewport;
  render: (options: { canvasContext: CanvasRenderingContext2D; viewport: PdfViewport }) => {
    promise: Promise<void>;
    cancel: () => void;
  };
}

interface PdfDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfPageProxy>;
}

interface PdfJsLib {
  getDocument: (options: { data: ArrayBuffer }) => { promise: Promise<PdfDocumentProxy> };
  GlobalWorkerOptions: { workerSrc: string };
}

declare global {
  interface Window {
    pdfjsLib?: PdfJsLib;
  }
}

export const ReaderClient: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>('9876543210');
  const [orderId, setOrderId] = useState<string>('ARB-88991');
  const [buyerInfo, setBuyerInfo] = useState<{ orderId: string; buyerPhone: string } | null>(null);
  const [authError, setAuthError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // PDF Viewer state
  const [pdfDoc, setPdfDoc] = useState<PdfDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);

  // 1. Anti-piracy event deterrents (Right-click, Shortcuts, Print override)
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Intercept keyboard shortcuts (Ctrl/Cmd + P, S, C, U)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.ctrlKey || e.metaKey;
      if (
        (isCmdOrCtrl && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Override browser print function
    const originalPrint = window.print;
    window.print = () => {
      alert('Printing is disabled for this licensed digital publication.');
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.print = originalPrint;
    };
  }, []);

  // 2. Load PDF.js library dynamically from trusted CDN
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  // 3. Buyer verification handler
  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    setAuthError('');

    try {
      const res = await fetch('/api/ebook/verify-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setIsAuthenticated(true);
      setBuyerInfo({
        orderId: data.order.orderId,
        buyerPhone: data.order.buyerPhone,
      });

      // Load PDF after successful verification
      loadProtectedPdf();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to verify order.';
      setAuthError(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // 4. Fetch short-lived single-purpose token and load PDF
  const loadProtectedPdf = async () => {
    setIsLoadingPdf(true);
    setPdfError('');

    try {
      // Get 15-min stream token
      const tokenRes = await fetch('/api/ebook/view-token');
      const tokenData = await tokenRes.json();

      if (!tokenRes.ok) {
        throw new Error(tokenData.error || 'Failed to obtain access token.');
      }

      // Stream PDF bytes securely
      const pdfRes = await fetch(tokenData.streamUrl);
      if (!pdfRes.ok) {
        throw new Error('Failed to stream watermarked booklet.');
      }

      const pdfBytes = await pdfRes.arrayBuffer();

      // Ensure PDF.js is ready
      if (!window.pdfjsLib) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (!window.pdfjsLib) {
        throw new Error('PDF rendering engine could not be initialized.');
      }

      const loadingTask = window.pdfjsLib.getDocument({ data: pdfBytes });
      const loadedDoc = await loadingTask.promise;

      setPdfDoc(loadedDoc);
      setTotalPages(loadedDoc.numPages);
      setCurrentPage(1);
    } catch (err: unknown) {
      console.error('[ReaderClient] Error loading PDF:', err);
      const msg = err instanceof Error ? err.message : 'Error loading protected booklet.';
      setPdfError(msg);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // 5. Render page to canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: ctx,
          viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: unknown) {
        const isCancel =
          err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException';
        if (!isCancel) {
          console.error('[ReaderClient] Render error:', err);
        }
      }
    },
    [pdfDoc, scale]
  );

  useEffect(() => {
    if (pdfDoc && currentPage) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, renderPage]);

  // Handle Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setPdfDoc(null);
    setBuyerInfo(null);
  };

  // --- RENDER SCREEN 1: BUYER LOGIN / ORDER VERIFICATION ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-50 text-[#0008c1] rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Lock size={22} />
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#0008c1]">
              Secure E-Book Reader
            </h1>
            <p className="text-xs text-gray-500">
              Enter your registered WhatsApp phone number and Order ID to access your personalized consecrated booklet.
            </p>
          </div>

          {authError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-800">
              <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Order ID (Received after Razorpay / WhatsApp payment)
              </label>
              <input
                type="text"
                placeholder="e.g. ARB-88991"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0008c1] uppercase transition"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-[#1346af] hover:bg-[#3a3a3a] disabled:opacity-50 text-white text-sm font-semibold py-3 px-4 rounded-xl transition shadow-md"
            >
              {isVerifying ? 'Verifying Credentials...' : 'Unlock Protected Booklet'}
            </button>
          </form>

          {/* Seed Demo Shortcuts for instant testing */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setPhone('9876543210');
                  setOrderId('ARB-88991');
                }}
                className="p-2 rounded-lg bg-blue-50 text-[#0008c1] font-semibold text-center hover:bg-blue-100 transition"
              >
                Order #ARB-88991
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhone('9988776655');
                  setOrderId('ARB-50021');
                }}
                className="p-2 rounded-lg bg-blue-50 text-[#0008c1] font-semibold text-center hover:bg-blue-100 transition"
              >
                Order #ARB-50021
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link href="/books" className="text-xs text-gray-500 hover:text-[#0008c1] transition">
              ← Return to Books Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER SCREEN 2: IN-BROWSER RESTRICTED CANVAS VIEWER ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none print:hidden">
      {/* Print protection stylesheet */}
      <style jsx global>{`
        @media print {
          body, html, * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>

      {/* Reader Top Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center space-x-3">
          <Link
            href="/books"
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <span>← Store</span>
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center space-x-2">
            <BookOpen size={16} className="text-amber-400" />
            <h1 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
              Karodon Ka Rahasya (Licensed Copy)
            </h1>
          </div>
        </div>

        {/* Zoom & Navigation Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4 text-xs">
          <div className="hidden sm:flex items-center space-x-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setScale((s) => Math.max(0.8, s - 0.2))}
              className="p-1 hover:text-amber-400 transition"
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-[11px] font-mono px-1">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(2.0, s + 0.2))}
              className="p-1 hover:text-amber-400 transition"
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-xs px-2">
              {currentPage} / {totalPages || '...'}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition"
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center space-x-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs px-2.5 py-1.5 rounded-lg transition border border-rose-800/40"
            title="Exit reader"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Exit</span>
          </button>
        </div>
      </header>

      {/* Security Warning Notification Banner */}
      <div className="bg-amber-950/70 border-b border-amber-800/50 py-1.5 px-4 text-center text-[11px] text-amber-200/90 flex items-center justify-center space-x-2">
        <ShieldCheck size={14} className="text-amber-400 flex-shrink-0" />
        <span>
          Licensed exclusively to: <strong>{buyerInfo?.buyerPhone}</strong> (Order: {buyerInfo?.orderId}). All pages carry invisible &amp; visible digital identity fingerprints.
        </span>
      </div>

      {/* Main Canvas Viewer Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto bg-slate-900/90 relative">
        {isLoadingPdf && (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Verifying session &amp; streaming watermarked pages...</p>
          </div>
        )}

        {pdfError && (
          <div className="max-w-md bg-slate-950 p-6 rounded-2xl border border-rose-800/60 text-center space-y-3">
            <AlertTriangle size={32} className="text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Playback Error</h3>
            <p className="text-xs text-slate-400">{pdfError}</p>
            <button
              onClick={loadProtectedPdf}
              className="text-xs bg-[#1346af] text-white px-4 py-2 rounded-lg font-semibold"
            >
              Retry Loading
            </button>
          </div>
        )}

        {/* Canvas Presentation Frame */}
        <div
          className={`relative bg-white shadow-2xl rounded-lg overflow-hidden transition-opacity duration-300 ${
            isLoadingPdf ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ userSelect: 'none' }}
        >
          {/* Real PDF Canvas (rendered via PDF.js) */}
          <canvas ref={canvasRef} className="block max-w-full h-auto pointer-events-none" />

          {/* Floating In-Browser Diagonal Watermark Overlay (deterrent against web screen capture) */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
            aria-hidden="true"
          >
            <div className="transform -rotate-45 text-slate-800/10 font-bold text-2xl tracking-widest uppercase select-none text-center leading-relaxed">
              AR BLESSINGS LICENSED TO {buyerInfo?.buyerPhone}
              <br />
              ORDER #{buyerInfo?.orderId}
            </div>
          </div>
        </div>
      </main>

      {/* Reader Bottom Controls & Notice */}
      <footer className="bg-slate-950 border-t border-slate-800 px-4 py-2.5 text-center text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-1">
          <Sparkles size={12} className="text-amber-400" />
          <span>Copying, printing, and downloading disabled by digital publication rights.</span>
        </div>
        <div>
          <span>Press left/right arrow keys to navigate pages.</span>
        </div>
      </footer>
    </div>
  );
};
