import { useState, useEffect } from 'react';
import type { Book } from '../services/dramaboxApi';
import { fetchDramasByKeywords } from '../utils/dramaData';
import FeaturedDrama from './FeaturedDrama';

export default function FeaturedSection() {
  const [featuredDramas, setFeaturedDramas] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedDramas = async () => {
      try {
        // Search for popular keywords to get featured dramas
        const keywords = ['drama', 'romance', 'love'];
        const results = await fetchDramasByKeywords(keywords, 3);
        setFeaturedDramas(results.slice(0, 3));
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
      <div className="grid grid-cols-1 gap-6 mb-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg animate-pulse aspect-video" />
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
    <div className="grid grid-cols-1 gap-6 mb-12 lg:grid-cols-3">
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

