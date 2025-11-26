import type { Book } from '../services/dramaboxApi';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';

interface FeaturedDramaProps {
  drama: Book;
  isLarge?: boolean;
}

export default function FeaturedDrama({ drama, isLarge = false }: FeaturedDramaProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const id = drama.bookId || drama.id;
    if (id) {
      navigate(`/series/${id}`);
    }
  };

  if (isLarge) {
    return (
      <div
        onClick={handleClick}
        className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="relative aspect-video overflow-hidden">
          <img
            src={drama.cover || '/placeholder.jpg'}
            alt={drama.bookName || drama.title || 'Untitled'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="450"%3E%3Crect fill="%23374151" width="800" height="450"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 line-clamp-2">
                {drama.bookName || drama.title || 'Untitled'}
              </h2>
              {drama.chapterCount != null && (
                <p className="text-gray-300 mb-3">{drama.chapterCount} Episodes</p>
              )}
              {drama.introduction && (
                <p className="text-gray-300 text-sm md:text-base line-clamp-3 mb-4">
                  {drama.introduction}
                </p>
              )}
              {drama.tags && drama.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {drama.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={drama.cover || '/placeholder.jpg'}
          alt={drama.bookName || drama.title || 'Untitled'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="400"%3E%3Crect fill="%23374151" width="240" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-pink-500 rounded-full p-3">
              <Play className="w-6 h-6 text-white" fill="white" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="mb-1 text-sm font-semibold text-white line-clamp-2">
          {drama.bookName || drama.title || 'Untitled'}
        </h3>
        {drama.chapterCount != null && (
          <p className="text-xs text-gray-400 mb-2">{drama.chapterCount} Episodes</p>
        )}
        {drama.introduction && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
            {drama.introduction}
          </p>
        )}
        {drama.tags && drama.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {drama.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-700/50 text-gray-300 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

