"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Play, Video } from "lucide-react";

export default function ImageLightbox({
  images,
  videos = [],
  initialIndex = 0,
  onClose,
}: {
  images: string[];
  videos?: string[];
  initialIndex?: number;
  onClose: () => void;
}) {
  const media = [
    ...images.map((src) => ({ src, type: "image" as const })),
    ...videos.map((src) => ({ src, type: "video" as const })),
  ];
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (media.length === 0) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(media.length - 1, i + 1));
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [media.length, onClose]);

  const [touchStart, setTouchStart] = useState(0);

  if (media.length === 0) return null;
  const currentMedia = media[index];

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
      onClick={onClose}
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
      onTouchEnd={(e) => {
        const distance = e.changedTouches[0].clientX - touchStart;
        if (distance < -75) setIndex((i) => Math.min(media.length - 1, i + 1));
        if (distance > 75) setIndex((i) => Math.max(0, i - 1));
      }}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-semibold">
          {index + 1} / {media.length}
        </span>
        <button
          type="button"
          aria-label="Close media viewer"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
        >
          <X size={20} />
        </button>
      </div>

      <div
        className="flex-1 relative flex items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          {currentMedia.type === "image" ? (
            <Image
              src={currentMedia.src}
              alt={`Image ${index + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          ) : (
            <video
              key={currentMedia.src}
              src={currentMedia.src}
              controls
              autoPlay
              preload="metadata"
              playsInline
              className="h-full w-full object-contain"
            />
          )}
        </div>
        {index > 0 && (
          <button
            type="button"
            aria-label="Previous media"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i - 1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {index < media.length - 1 && (
          <button
            type="button"
            aria-label="Next media"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i + 1);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide justify-center">
        {media.map((item, i) => (
          <button
            type="button"
            key={i}
            aria-label={`View ${item.type} ${i + 1}`}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
              i === index
                ? "ring-2 ring-brand-500 opacity-100"
                : "opacity-50 hover:opacity-100"
            }`}
          >
            {item.type === "image" ? (
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center bg-slate-800 text-white">
                <Video size={20} />
                <Play size={11} className="absolute bottom-1 right-1" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
