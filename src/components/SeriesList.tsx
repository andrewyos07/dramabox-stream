import type { Book } from '../services/dramaboxApi';
import SeriesCard from './SeriesCard';

interface SeriesListProps {
  series: Book[];
  isLoading?: boolean;
}

export default function SeriesList({ series, isLoading }: SeriesListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-lg aspect-[3/4] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (series.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg text-gray-400">Tidak ada hasil ditemukan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {series.map((item, index) => (
        <SeriesCard key={item.bookId || item.id || `series-${index}`} series={item} />
      ))}
    </div>
  );
}

