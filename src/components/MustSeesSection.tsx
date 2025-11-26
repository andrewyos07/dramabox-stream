import { useState, useEffect } from 'react';
import type { Book } from '../services/dramaboxApi';
import { dramaboxApi } from '../services/dramaboxApi';
import SeriesCard from './SeriesCard';

export default function MustSeesSection() {
  const [dramas, setDramas] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMustSees = async () => {
      try {
        // Try multiple keywords if one fails
        const keywords = ['drama', 'romance', 'love', 'revenge'];
        let dramasLoaded = false;

        for (const keyword of keywords) {
          try {
            const result = await dramaboxApi.searchBook(keyword);
            const searchList = (result.searchList ?? []) as Book[];
            const normalized = searchList
              .slice(0, 12)
              .map((item) => ({
                ...item,
                bookId: item.bookId || item.id || '',
                bookName: item.bookName || item.title || 'Untitled',
              }));
            setDramas(normalized);
            dramasLoaded = true;
            break; // Success, exit loop
          } catch {
            // Continue to next keyword
          }
        }

        if (!dramasLoaded) {
          // If all keywords failed, set empty array
          setDramas([]);
        }
      } catch {
        setDramas([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMustSees();
  }, []);

  if (isLoading) {
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Must-sees</h2>
          <div className="w-16 h-6 bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-48 bg-gray-800 rounded-lg aspect-[3/4] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Must-sees</h2>
        <button className="text-pink-500 hover:text-pink-400 font-medium transition-colors">
          More &gt;
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {dramas.map((drama) => (
          <div key={drama.bookId || drama.id} className="flex-shrink-0 w-48">
            <SeriesCard series={drama} />
          </div>
        ))}
      </div>
    </div>
  );
}

