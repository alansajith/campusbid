"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = images[activeIndex] || "/placeholder-auction.jpg";

  function prev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function next() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div
          className="relative rounded-2xl overflow-hidden cursor-zoom-in group"
          style={{
            background: "hsl(222 47% 8%)",
            aspectRatio: "4/3",
          }}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={activeImage}
            alt={`${title} — Image ${activeIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />

          {/* Zoom hint */}
          <div
            className="absolute top-4 right-4 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div
              className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full text-xs text-white"
              style={{ background: "rgba(0,0,0,0.5)" }}
            >
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden transition-all"
                style={{
                  border:
                    i === activeIndex
                      ? "2px solid hsl(239 84% 67%)"
                      : "2px solid transparent",
                  opacity: i === activeIndex ? 1 : 0.6,
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-7 h-7 text-white" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full hover:bg-white/10 transition-colors"
              >
                <ChevronRight className="w-7 h-7 text-white" />
              </button>
            </>
          )}

          <img
            src={activeImage}
            alt={title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
