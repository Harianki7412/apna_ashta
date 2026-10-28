"use client";
import { useState } from "react";
import Image from "next/image";
import { Home, Expand } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

export default function PropertyGallery({
  images,
  title,
  featured,
}: {
  images: string[];
  title: string;
  featured?: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  function open(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  if (!images?.length) {
    return (
      <div className="relative h-[300px] md:h-[450px] bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-gray-300 dark:text-slate-600">
        <Home size={64} />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 mb-6 rounded-2xl overflow-hidden">
        <button
          onClick={() => open(0)}
          className="col-span-4 md:col-span-3 row-span-2 relative h-[300px] md:h-[450px] bg-gray-100 dark:bg-slate-800 group cursor-pointer"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority
            sizes="(max-width: 768px) 100vw, 75vw"
          />
          {featured && (
            <div className="absolute top-4 left-4 badge badge-featured">
              ⭐ Featured
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand size={12} /> Click to expand
          </div>
        </button>
        {images.slice(1, 3).map((url, i) => (
          <button
            key={i}
            onClick={() => open(i + 1)}
            className="hidden md:block relative bg-gray-100 dark:bg-slate-800 group cursor-pointer"
          >
            <Image
              src={url}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="25vw"
            />
            {i === 1 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                +{images.length - 3} more
              </div>
            )}
          </button>
        ))}
      </div>
      <ImageLightbox
        images={images}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
