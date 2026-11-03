"use client";
import { useState } from "react";
import Image from "next/image";
import { Home, Expand, Play, Video } from "lucide-react";
import ImageLightbox from "./ImageLightbox";

export default function PropertyGallery({
  images,
  videos = [],
  title,
  featured,
  verified,
}: {
  images: string[];
  videos?: string[];
  title: string;
  featured?: boolean;
  verified?: boolean;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const media = [
    ...images.map((src) => ({ src, type: "image" as const })),
    ...videos.map((src) => ({ src, type: "video" as const })),
  ];

  function open(index: number) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  if (!media.length) {
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
          type="button"
          onClick={() => open(0)}
          aria-label={`View ${media[0].type} 1 of ${media.length}`}
          className="col-span-4 md:col-span-3 row-span-2 relative h-[300px] md:h-[450px] bg-gray-100 dark:bg-slate-800 group cursor-pointer"
        >
          {media[0].type === "image" ? (
            <Image
              src={media[0].src}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              priority
              sizes="(max-width: 768px) 100vw, 75vw"
            />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-white">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                <Play size={30} fill="currentColor" />
              </span>
              <span className="text-sm font-semibold">Play property video</span>
            </span>
          )}
          {featured && (
            <div className="absolute top-4 left-4 badge badge-featured">
              ⭐ Featured
            </div>
          )}
          {verified && (
            <div className="absolute top-4 right-4 bg-success-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ✓ Physically Verified
            </div>
          )}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand size={12} /> Click to expand
          </div>
        </button>
        {media.slice(1, 3).map((item, i) => (
          <button
            type="button"
            key={item.src}
            onClick={() => open(i + 1)}
            aria-label={`View ${item.type} ${i + 2} of ${media.length}`}
            className="hidden md:flex relative items-center justify-center bg-gray-100 dark:bg-slate-800 group cursor-pointer"
          >
            {item.type === "image" ? (
              <Image
                src={item.src}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="25vw"
              />
            ) : (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-white">
                <Video size={32} />
                <span className="text-xs font-medium">Property video</span>
              </span>
            )}
            {i === 1 && media.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-bold">
                +{media.length - 3} more
              </div>
            )}
          </button>
        ))}
      </div>
      {lightboxOpen && (
        <ImageLightbox
          images={images}
          videos={videos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
