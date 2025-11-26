import { useState } from 'react';
import type { Book } from '../services/dramaboxApi';
import { useNavigate } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';

interface DramaCarouselProps {
  dramas: Book[];
  isLoading?: boolean;
}

export default function DramaCarousel({ dramas, isLoading }: DramaCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-video rounded-lg overflow-hidden mb-6 bg-gray-800 animate-pulse" />
    );
  }

  if (dramas.length === 0) {
    return null;
  }

  const currentDrama = dramas[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % dramas.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + dramas.length) % dramas.length);
  };

  const handleDramaClick = () => {
    const id = currentDrama.bookId || currentDrama.id;
    if (id) {
      navigate(`/series/${id}`);
    }
  };

  return (
    <div className="relative w-full mb-6">
      {/* Main Carousel */}
      <div
        onClick={handleDramaClick}
        className="relative w-full aspect-[16/9] md:aspect-video rounded-lg overflow-hidden cursor-pointer group"
      >
        <img
          src={currentDrama.cover || '/placeholder.jpg'}
          alt={currentDrama.bookName || currentDrama.title || 'Featured Drama'}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23374151" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
          {/* Badge */}
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded">
              DramaBox EXCLUSIVE
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
            {currentDrama.bookName || currentDrama.title || 'Untitled'}
          </h2>

          {/* Meta Info */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
              <span>1h 34m</span>
            </div>
            {currentDrama.chapterCount != null && (
              <div className="flex items-center gap-1 bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                <span>{currentDrama.chapterCount} Eps</span>
              </div>
            )}
          </div>

          {/* Description */}
          {currentDrama.introduction && (
            <p className="text-gray-300 text-sm md:text-base line-clamp-2 mb-2">
              {currentDrama.introduction}
            </p>
          )}

          {/* Tags */}
          {currentDrama.tags && currentDrama.tags.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>2024</span>
              <span>•</span>
              <span>{currentDrama.tags[0]}</span>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {dramas.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Dots */}
      {dramas.length > 1 && (
        <div className="flex justify-center gap-2 mt-3">
          {dramas.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-blue-500 w-6' : 'bg-gray-600'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

