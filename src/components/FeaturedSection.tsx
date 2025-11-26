import { useState, useEffect } from 'react';
import type { Book } from '../services/dramaboxApi';
import { dramaboxApi } from '../services/dramaboxApi';
import FeaturedDrama from './FeaturedDrama';

export default function FeaturedSection() {
  const [featuredDramas, setFeaturedDramas] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedDramas = async () => {
      try {
        // Search for popular keywords to get featured dramas
        const keywords = ['drama', 'romance', 'love'];
        const allResults: Book[] = [];
        let successCount = 0;

        for (const keyword of keywords) {
          try {
            const result = await dramaboxApi.searchBook(keyword);
            const searchList = (result.searchList ?? []) as Book[];
            const normalized = searchList
              .slice(0, 5)
              .map((item) => ({
                ...item,
                bookId: item.bookId || item.id || '',
                bookName: item.bookName || item.title || 'Untitled',
              }));
            allResults.push(...normalized);
            successCount++;
            // If we got results, we can break early
            if (allResults.length >= 3) break;
          } catch {
            // Silently fail and try next keyword
          }
        }

        // Remove duplicates and take first 3
        const unique = allResults.filter(
          (item, index, self) =>
            index === self.findIndex((t) => (t.bookId || t.id) === (item.bookId || item.id))
        );
        setFeaturedDramas(unique.slice(0, 3));
      } catch {
        // Set empty array so component doesn't show loading forever
        setFeaturedDramas([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedDramas();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg aspect-video animate-pulse" />
        </div>
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg aspect-[3/4] animate-pulse" />
          <div className="bg-gray-800 rounded-lg aspect-[3/4] animate-pulse" />
        </div>
      </div>
    );
  }

  if (featuredDramas.length === 0) {
    return null;
  }

  const [mainDrama, ...sideDramas] = featuredDramas;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
      {/* Main Featured Drama */}
      {mainDrama && (
        <div className="lg:col-span-2">
          <FeaturedDrama drama={mainDrama} isLarge />
        </div>
      )}

      {/* Side Featured Dramas */}
      <div className="space-y-6">
        {sideDramas.map((drama) => (
          <FeaturedDrama key={drama.bookId || drama.id} drama={drama} />
        ))}
      </div>
    </div>
  );
}

