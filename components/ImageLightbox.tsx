"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageLightbox({
  images,
  initialIndex = 0,
  open,
  onClose,
}: {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight")
        setIndex((i) => Math.min(images.length - 1, i + 1));
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, images.length, onClose]);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex flex-col"
      onClick={onClose}
      onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
      onTouchEnd={(e) => {
        setTouchEnd(e.changedTouches[0].clientX);
        if (touchStart - touchEnd > 75)
          setIndex((i) => Math.min(images.length - 1, i + 1));
        if (touchEnd - touchStart > 75) setIndex((i) => Math.max(0, i - 1));
      }}
    >
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm font-semibold">
          {index + 1} / {images.length}
        </span>
        <button
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
          <Image
            src={images[index]}
            alt={`Image ${index + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        </div>
        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => i - 1);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        {index < images.length - 1 && (
          <button
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
        {images.map((url, i) => (
          <button
            key={i}
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
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
