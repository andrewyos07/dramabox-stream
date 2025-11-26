import type { Book } from '../services/dramaboxApi';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SeriesCardProps {
  series: Book;
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    const id = series.bookId || series.id;
    if (id) {
      navigate(`/series/${id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="overflow-hidden h-full bg-gray-800 rounded-lg shadow-lg transition-all duration-300 cursor-pointer group hover:shadow-xl hover:scale-105"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={series.cover || '/placeholder.jpg'}
          alt={series.bookName || series.title || 'Untitled'}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="400"%3E%3Crect fill="%23374151" width="240" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        <div className="flex absolute inset-0 justify-center items-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-40">
          <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="p-2 bg-blue-500 rounded-full md:p-3">
              <Play className="w-4 h-4 text-white md:w-6 md:h-6" fill="white" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-2 md:p-3">
        <h3 className="mb-1 text-xs font-semibold text-white md:text-sm line-clamp-2">
          {series.bookName || series.title || 'Untitled'}
        </h3>
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center text-xs text-gray-400">
            {series.chapterCount != null && (
              <>
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">1h 34m</span>
                <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-xs">
                  {series.chapterCount} Eps
                </span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500">
            <span>2024</span>
            {series.tags && series.tags.length > 0 && (
              <>
                <span> • </span>
                <span>{series.tags[0]}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

