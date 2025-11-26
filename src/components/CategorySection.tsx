import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../services/dramaboxApi';
import SeriesCard from './SeriesCard';
import { Star, Flame, Gem, ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  icon: 'star' | 'flame' | 'gem';
  dramas: Book[];
  isLoading?: boolean;
  seeAllPath?: string;
}

const iconMap = {
  star: Star,
  flame: Flame,
  gem: Gem,
};

export default function CategorySection({ title, icon, dramas, isLoading, seeAllPath }: CategorySectionProps) {
  const IconComponent = iconMap[icon];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navigate = useNavigate();

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(container.scrollLeft + container.clientWidth < container.scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [dramas]);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.9;
    const offset = direction === 'left' ? -scrollAmount : scrollAmount;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <div className="w-5 h-5 bg-gray-800 rounded animate-pulse" />
            <div className="w-24 h-6 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="w-20 h-5 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-40 md:w-48 bg-gray-800 rounded-lg aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (dramas.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <IconComponent className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white md:text-xl">{title}</h2>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handleScroll('left')}
              disabled={!canScrollLeft}
              className={`p-1.5 rounded-full border border-white/20 text-white transition-colors ${
                canScrollLeft ? 'hover:bg-white/10' : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              disabled={!canScrollRight}
              className={`p-1.5 rounded-full border border-white/20 text-white transition-colors ${
                canScrollRight ? 'hover:bg-white/10' : 'opacity-30 cursor-not-allowed'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {seeAllPath && (
            <button
              onClick={() => navigate(seeAllPath)}
              className="text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
            >
              Lihat Semua
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 z-10 p-2 text-white rounded-full shadow-lg transition-colors -translate-y-1/2 bg-black/60 hover:bg-black/80"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 z-10 p-2 text-white rounded-full shadow-lg transition-colors -translate-y-1/2 bg-black/60 hover:bg-black/80"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none via-gray-900/70" />
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none via-gray-900/70" />
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth"
        >
          {dramas.map((drama) => (
            <div key={drama.bookId || drama.id} className="flex-shrink-0 w-36 sm:w-40 lg:w-48 snap-start">
              <SeriesCard series={drama} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

