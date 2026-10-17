"use client";

import {
  AlertCircle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Moon,
  RefreshCw,
  Sun,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import React, { useCallback, useEffect, useRef, useState } from "react";
import HTMLFlipBookRaw from "react-pageflip";
import { SkeletonBar } from "@/components/ui/skeleton-bar";
import { useLocale } from "@/hooks/use-locale";
import { toLocalizedNumber } from "@/lib/banglaFormat";
import styles from "@/styles/pdf-reader.module.css";

// Set up the worker for pdfjs
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

const HTMLFlipBook = HTMLFlipBookRaw as any;
const CACHE_NAME = "pdf-books-cache-v1";

type ReadingMode = "light" | "sepia" | "dark";

// Component to render a single PDF page onto canvas
const PageCanvas = React.forwardRef<
  HTMLDivElement,
  {
    pageNumber: number;
    pdfDocument: any;
    isActive: boolean;
  }
>(({ pageNumber, pdfDocument, isActive }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (!isActive || !pdfDocument || rendered) return;

    let renderTask: any;
    let isMounted = true;

    const renderPage = async () => {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas || !isMounted) return;

        // Render at 2.0x scale so text stays sharp even when zoomed in
        const viewport = page.getViewport({ scale: 2.0 });
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          renderTask = page.render({
            canvasContext: context,
            viewport: viewport,
          });

          await renderTask.promise;
          if (isMounted) setRendered(true);
        }
      } catch (err) {
        // Ignore render cancellation errors
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [isActive, pdfDocument, pageNumber, rendered]);

  return (
    <div ref={ref} className={styles.flipPage}>
      <div className={styles.flipPageInner}>
        {isActive ? (
          <canvas ref={canvasRef} className={styles.flipCanvas} />
        ) : (
          <div className={styles.flipPlaceholder}>
            <SkeletonBar style={{ width: "100%", height: "100%" }} />
          </div>
        )}
      </div>
    </div>
  );
});
PageCanvas.displayName = "PageCanvas";

export default function PdfFlipbook({ url }: { url: string; title?: string }) {
  const { locale } = useLocale();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Zoom state (scaled via CSS transform without mouse click dragging)
  const [zoom, setZoom] = useState(1);
  const initialPinchDistRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef(1);

  // Dynamic dimensions for regular vs fullscreen mode
  const [bookDimensions, setBookDimensions] = useState({ width: 380, height: 560 });

  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [mode, setMode] = useState<ReadingMode>("light");
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const flipWrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Calculate book dimensions so that it fits nicely on screen and expands to full screen
  const updateDimensions = useCallback(() => {
    if (typeof window === "undefined") return;
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const isMob = winW < 768;
    setIsMobile(isMob);

    if (document.fullscreenElement) {
      // Fullscreen mode: book takes maximum available screen space
      const availH = winH - 80; // reserve space for toolbar
      const availW = winW - 32;

      if (isMob) {
        // Mobile fullscreen: single portrait page
        const targetW = Math.min(availW * 0.95, 520);
        const targetH = Math.min(availH * 0.95, targetW * 1.42);
        setBookDimensions({
          width: Math.round(targetW),
          height: Math.round(targetH),
        });
      } else {
        // Desktop fullscreen: 2-page spread
        const maxPageW = Math.floor((availW * 0.92) / 2);
        const targetH = Math.min(availH * 0.92, maxPageW * 1.42);
        const targetW = Math.round(targetH / 1.42);
        setBookDimensions({
          width: targetW,
          height: Math.round(targetH),
        });
      }
    } else {
      // In-page mode
      if (isMob) {
        const targetW = Math.min(winW - 48, 340);
        setBookDimensions({
          width: Math.round(targetW),
          height: Math.round(targetW * 1.42),
        });
      } else {
        setBookDimensions({ width: 380, height: 550 });
      }
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Sync fullscreen state with browser events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      updateDimensions();
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [updateDimensions]);

  // Touchpad pinch-to-zoom (wheel with ctrlKey on trackpads)
  useEffect(() => {
    const wrapper = flipWrapperRef.current;
    if (!wrapper) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.005;
        setZoom((prev) => Math.min(2.5, Math.max(0.7, +(prev + delta).toFixed(2))));
      }
    };

    wrapper.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      wrapper.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Mobile 2-finger pinch-to-zoom
  useEffect(() => {
    const wrapper = flipWrapperRef.current;
    if (!wrapper) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        initialPinchDistRef.current = dist;
        initialPinchZoomRef.current = zoom;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialPinchDistRef.current !== null) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY,
        );
        const ratio = dist / initialPinchDistRef.current;
        const nextZoom = Math.min(
          2.5,
          Math.max(0.7, +(initialPinchZoomRef.current * ratio).toFixed(2)),
        );
        setZoom(nextZoom);
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        initialPinchDistRef.current = null;
      }
    };

    wrapper.addEventListener("touchstart", onTouchStart, { passive: false });
    wrapper.addEventListener("touchmove", onTouchMove, { passive: false });
    wrapper.addEventListener("touchend", onTouchEnd);
    wrapper.addEventListener("touchcancel", onTouchEnd);

    return () => {
      wrapper.removeEventListener("touchstart", onTouchStart);
      wrapper.removeEventListener("touchmove", onTouchMove);
      wrapper.removeEventListener("touchend", onTouchEnd);
      wrapper.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [zoom]);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [localBlobUrl]);

  // Download PDF into browser cache if needed, and load from cache
  const handleLoadPdf = useCallback(
    async (forceRedownload = false) => {
      setIsLoading(true);
      setError(null);
      setDownloadProgress(0);

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        let blob: Blob | null = null;

        // 1. Check browser Cache Storage first (unless forceRedownload)
        if (!forceRedownload && typeof window !== "undefined" && "caches" in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            const cachedRes = await cache.match(url);
            if (cachedRes) {
              setDownloadProgress(100);
              blob = await cachedRes.blob();
            }
          } catch (e) {
            console.warn("Could not read from Cache API:", e);
          }
        }

        // 2. If not found in cache or forcing redownload, fetch from server with progress
        if (!blob) {
          const res = await fetch(url, { signal: abortController.signal });
          if (!res.ok) {
            throw new Error(`Server returned ${res.status} ${res.statusText}`);
          }

          const contentLength = res.headers.get("content-length");
          const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

          if (res.body && totalBytes > 0) {
            const reader = res.body.getReader();
            let loadedBytes = 0;
            const chunks: any[] = [];

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                chunks.push(value);
                loadedBytes += value.length;
                const pct = Math.round((loadedBytes / totalBytes) * 100);
                setDownloadProgress(Math.min(99, pct));
              }
            }
            blob = new Blob(chunks, { type: "application/pdf" });
            setDownloadProgress(100);
          } else {
            setDownloadProgress(50);
            blob = await res.blob();
            setDownloadProgress(100);
          }

          // 3. Save downloaded file into browser Cache Storage
          if (typeof window !== "undefined" && "caches" in window && blob) {
            try {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(
                url,
                new Response(blob.slice(0), {
                  headers: {
                    "content-type": "application/pdf",
                    "content-length": blob.size.toString(),
                  },
                }),
              );
            } catch (cacheErr) {
              console.warn("Failed saving PDF to Cache API:", cacheErr);
            }
          }
        }

        if (!blob) {
          throw new Error("Unable to retrieve PDF data");
        }

        // Create temporary browser file URL
        if (localBlobUrl) {
          URL.revokeObjectURL(localBlobUrl);
        }
        const tempBlob = URL.createObjectURL(blob);
        setLocalBlobUrl(tempBlob);

        // Load PDF document directly from memory
        const arrayBuffer = await blob.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: "https://unpkg.com/pdfjs-dist@3.11.174/cmaps/",
          cMapPacked: true,
        });

        const pdf = await loadingTask.promise;
        setPdfDocument(pdf);
        setNumPages(pdf.numPages);
        setCurrentPage(0);
        setIsLoaded(true);
      } catch (err: any) {
        if (err.name === "AbortError") {
          return;
        }
        console.error("PDF download or loading error:", err);
        if (typeof window !== "undefined" && "caches" in window) {
          try {
            const cache = await caches.open(CACHE_NAME);
            await cache.delete(url);
          } catch {}
        }
        setError(
          locale === "bn"
            ? "পিডিএফটি লোড করা সম্ভব হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন।"
            : "Failed to load PDF. Please check your internet connection and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [url, localBlobUrl, locale],
  );

  const handleCancelDownload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setDownloadProgress(0);
  };

  const handleCloseReader = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
    setIsLoaded(false);
    setZoom(1);
    if (localBlobUrl) {
      URL.revokeObjectURL(localBlobUrl);
      setLocalBlobUrl(null);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
    }
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(2.5, +(z + 0.2).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoom((z) => Math.max(0.7, +(z - 0.2).toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  function toggleMode() {
    if (mode === "light") setMode("sepia");
    else if (mode === "sepia") setMode("dark");
    else setMode("light");
  }

  const getFilterStyle = () => {
    if (mode === "dark") return "invert(0.9) hue-rotate(180deg) brightness(1.2) contrast(1.1)";
    if (mode === "sepia") return "sepia(0.5) contrast(0.95)";
    return "none";
  };

  const nextButtonClick = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const prevButtonClick = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  // State 1: Error during download or reading
  if (error) {
    return (
      <div className={styles.errorCard}>
        <AlertCircle size={36} color="#dc2626" />
        <h3 className={styles.errorTitle}>
          {locale === "bn" ? "পিডিএফ লোড ব্যাহত হয়েছে" : "Failed to Load PDF"}
        </h3>
        <p className={styles.errorText}>{error}</p>
        <button type="button" className={styles.retryBtn} onClick={() => handleLoadPdf(true)}>
          <RefreshCw size={16} />
          {locale === "bn" ? "পুনরায় চেষ্টা করুন" : "Try Again"}
        </button>
      </div>
    );
  }

  // State 2: Downloading & saving to browser cache
  if (isLoading) {
    return (
      <div className={styles.readPromptContainer}>
        <div className={styles.loadingBox}>
          <Loader2 size={36} className={`animate-spin ${styles.loadingSpinner}`} />
          <div className={styles.progressTrack}>
            {downloadProgress > 0 ? (
              <div className={styles.progressFill} style={{ width: `${downloadProgress}%` }} />
            ) : (
              <div className={styles.progressIndeterminate} />
            )}
          </div>
          <span className={styles.loadingText}>
            {downloadProgress > 0
              ? `${toLocalizedNumber(downloadProgress, locale)}%`
              : locale === "bn"
                ? "লোড হচ্ছে..."
                : "Loading..."}
          </span>
          <button type="button" className={styles.cancelBtn} onClick={handleCancelDownload}>
            {locale === "bn" ? "বাতিল" : "Cancel"}
          </button>
        </div>
      </div>
    );
  }

  // State 3: Clean "Read" Button
  if (!isLoaded || !pdfDocument) {
    return (
      <div className={styles.readPromptContainer}>
        <button type="button" className={styles.readMainBtn} onClick={() => handleLoadPdf(false)}>
          <BookOpen size={20} />
          <span>{locale === "bn" ? "পড়ুন" : "Read"}</span>
        </button>
      </div>
    );
  }

  // State 4: Book Flip Reader (Desktop mouse clicks turn pages without drag interference)
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div ref={containerRef} className={styles.flipContainer}>
      <div className={styles.toolbar}>
        {/* Left: Navigation */}
        <div className={styles.toolbarSection}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={prevButtonClick}
            disabled={currentPage === 0}
            title={locale === "bn" ? "আগের পৃষ্ঠা" : "Previous Page"}
            aria-label="Previous Page"
          >
            <ChevronLeft size={18} />
          </button>

          <span className={styles.pageIndicator}>
            {toLocalizedNumber(currentPage + 1, locale)} / {toLocalizedNumber(numPages, locale)}
          </span>

          <button
            type="button"
            className={styles.toolBtn}
            onClick={nextButtonClick}
            disabled={currentPage >= numPages - 1}
            title={locale === "bn" ? "পরের পৃষ্ঠা" : "Next Page"}
            aria-label="Next Page"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className={styles.toolbarSection}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleZoomOut}
            disabled={zoom <= 0.7}
            title={locale === "bn" ? "জুম আউট" : "Zoom Out"}
            aria-label="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>

          <button
            type="button"
            className={styles.zoomBadge}
            onClick={handleResetZoom}
            title={locale === "bn" ? "জুম রিসেট (১০০%)" : "Reset Zoom (100%)"}
          >
            {toLocalizedNumber(Math.round(zoom * 100), locale)}%
          </button>

          <button
            type="button"
            className={styles.toolBtn}
            onClick={handleZoomIn}
            disabled={zoom >= 2.5}
            title={locale === "bn" ? "জুম ইন" : "Zoom In"}
            aria-label="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Right: Theme, Fullscreen, and Close */}
        <div className={styles.toolbarSection}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={toggleMode}
            title={locale === "bn" ? "রিডিং মোড পরিবর্তন" : "Change Reading Mode"}
            aria-label="Change Mode"
          >
            {mode === "light" ? (
              <Sun size={18} />
            ) : mode === "sepia" ? (
              <BookOpen size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          <button
            type="button"
            className={styles.toolBtn}
            onClick={toggleFullscreen}
            title={
              isFullscreen
                ? locale === "bn"
                  ? "ফুলস্ক্রিন বন্ধ"
                  : "Exit Fullscreen"
                : locale === "bn"
                  ? "ফুলস্ক্রিন"
                  : "Fullscreen"
            }
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <button
            type="button"
            className={styles.closeReaderBtn}
            onClick={handleCloseReader}
            title={locale === "bn" ? "প্রিভিউ বন্ধ করুন" : "Close Preview"}
          >
            <X size={14} />
            {locale === "bn" ? "বন্ধ করুন" : "Close"}
          </button>
        </div>
      </div>

      <div
        ref={flipWrapperRef}
        className={styles.flipWrapper}
        onDoubleClick={handleResetZoom}
        style={{
          filter: getFilterStyle(),
          backgroundColor: mode === "dark" ? "#18181b" : mode === "sepia" ? "#fbf0d9" : "#f8fafc",
        }}
      >
        <div
          className={styles.zoomContainer}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
        >
          <HTMLFlipBook
            key={`${bookDimensions.width}-${bookDimensions.height}-${isFullscreen}`}
            width={bookDimensions.width}
            height={bookDimensions.height}
            size="stretch"
            minWidth={260}
            maxWidth={800}
            minHeight={380}
            maxHeight={1100}
            maxShadowOpacity={0.5}
            showCover={true}
            mobileScrollSupport={true}
            usePortrait={isMobile}
            startPage={currentPage}
            onFlip={onPage}
            className={styles.flipbook}
            ref={bookRef}
            style={{ margin: "0 auto" }}
          >
            {pages.map((pageNumber, index) => {
              // Only render the canvas if the page is within a close range to save memory
              const isActive = Math.abs(currentPage - index) <= (isMobile ? 2 : 3);
              return (
                <PageCanvas
                  key={pageNumber}
                  pageNumber={pageNumber}
                  pdfDocument={pdfDocument}
                  isActive={isActive}
                />
              );
            })}
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  );
}
