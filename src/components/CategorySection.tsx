import type { Book } from '../services/dramaboxApi';
import SeriesCard from './SeriesCard';
import { Star, Flame, Gem } from 'lucide-react';

interface CategorySectionProps {
  title: string;
  icon: 'star' | 'flame' | 'gem';
  dramas: Book[];
  isLoading?: boolean;
}

const iconMap = {
  star: Star,
  flame: Flame,
  gem: Gem,
};

export default function CategorySection({ title, icon, dramas, isLoading }: CategorySectionProps) {
  const IconComponent = iconMap[icon];

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-800 rounded animate-pulse" />
            <div className="w-24 h-6 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="w-20 h-5 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        </div>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          Lihat Semua
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {dramas.map((drama) => (
          <div key={drama.bookId || drama.id} className="flex-shrink-0 w-40 md:w-48">
            <SeriesCard series={drama} />
          </div>
        ))}
      </div>
    </div>
  );
}

