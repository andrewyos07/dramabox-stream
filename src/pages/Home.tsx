import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SeriesList from '../components/SeriesList';
import DramaCarousel from '../components/DramaCarousel';
import CategorySection from '../components/CategorySection';
import { dramaboxApi } from '../services/dramaboxApi';
import type { Book } from '../services/dramaboxApi';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [series, setSeries] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get('search') || '');
  const [error, setError] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'untuk-anda' | 'segera-hadir'>('untuk-anda');
  
  // State for category dramas
  const [featuredDramas, setFeaturedDramas] = useState<Book[]>([]);
  const [latestDramas, setLatestDramas] = useState<Book[]>([]);
  const [popularDramas, setPopularDramas] = useState<Book[]>([]);
  const [exclusiveDramas, setExclusiveDramas] = useState<Book[]>([]);
  const [popularSectionDramas, setPopularSectionDramas] = useState<Book[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const handleSearch = useCallback(async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    setSearchKeyword(keyword);
    setShowSearchResults(true);
    setSearchParams({ search: keyword });
    
    try {
      const result = await dramaboxApi.searchBook(keyword);
      const searchList = (result.searchList ?? []) as Book[];
      // Normalize the data to ensure consistent field names
      const normalizedList = searchList.map((item) => ({
        ...item,
        bookId: item.bookId || item.id || '',
        bookName: item.bookName || item.title || 'Untitled',
      }));
      setSeries(normalizedList);
      if (normalizedList.length === 0) {
        setError('Tidak ada hasil ditemukan. Coba kata kunci lain.');
      }
    } catch {
      setSeries([]);
      setError('Terjadi kesalahan saat mencari. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchKeyword(searchParam);
      setShowSearchResults(true);
      handleSearch(searchParam);
    } else {
      setShowSearchResults(false);
      setSeries([]);
      setSearchKeyword('');
    }
  }, [searchParams, handleSearch]);

  // Load category dramas
  useEffect(() => {
    const loadCategoryDramas = async () => {
      setIsLoadingCategories(true);
      try {
        const [foryouResults, latestResults, trendingResults, popularResults, popularSectionResults] = await Promise.all([
          dramaboxApi.getForYou().catch(() => []),
          dramaboxApi.getLatest().catch(() => []),
          dramaboxApi.getTrending().catch(() => []),
          dramaboxApi.getPopular().catch(() => []),
          dramaboxApi.getPopular().catch(() => []), // Popular section
        ]);

        // Normalize data
        const normalize = (item: Book) => ({
          ...item,
          bookId: item.bookId || item.id || '',
          bookName: item.bookName || item.title || 'Untitled',
          cover: item.cover || item.coverWap || '',
        });

        // Extract books from foryou - API returns recommendList.records
        const featuredBooks: Book[] = Array.isArray(foryouResults) ? foryouResults : [];

        setFeaturedDramas(featuredBooks.map(normalize).slice(0, 10));
        setLatestDramas(latestResults.map(normalize).slice(0, 15));
        
        // Sort popular by playCount (convert "11.7M" to number for sorting)
        const parsePlayCount = (count?: string) => {
          if (!count) return 0;
          const replaced = count.replace(/K/g, '000').replace(/M/g, '000000');
          const num = parseFloat(replaced);
          return isNaN(num) ? 0 : num;
        };
        setPopularDramas([...trendingResults.map(normalize)].sort((a, b) => {
          const aCount = parsePlayCount(a.playCount);
          const bCount = parsePlayCount(b.playCount);
          return bCount - aCount;
        }).slice(0, 15));
        
        setExclusiveDramas(popularResults.map(normalize).slice(0, 15));
        setPopularSectionDramas(popularSectionResults.map(normalize).slice(0, 15));
      } catch {
        setFeaturedDramas([]);
        setLatestDramas([]);
        setPopularDramas([]);
        setExclusiveDramas([]);
        setPopularSectionDramas([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (!showSearchResults) {
      loadCategoryDramas();
    }
  }, [showSearchResults]);


  const handleClearSearch = () => {
    setSearchKeyword('');
    setSeries([]);
    setShowSearchResults(false);
    setError(null);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen text-white bg-gray-900">
      <div className="container px-4 py-4 mx-auto md:py-8">
        {!showSearchResults ? (
          <>
            {/* Tabs - Mobile & Desktop */}
            <div className="flex gap-2 items-center mb-6 md:mb-8">
              <button
                onClick={() => setActiveTab('untuk-anda')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'untuk-anda'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Untuk Anda
              </button>
              <button
                onClick={() => setActiveTab('segera-hadir')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === 'segera-hadir'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Segera Hadir
              </button>
            </div>

            {activeTab === 'untuk-anda' ? (
              <>
                {/* Featured Carousel */}
                <DramaCarousel dramas={featuredDramas} isLoading={isLoadingCategories} />

                {/* Category Sections */}
                <CategorySection
                  title="For You"
                  icon="star"
                  dramas={latestDramas}
                  isLoading={isLoadingCategories}
                />

                <CategorySection
                  title="Latest"
                  icon="flame"
                  dramas={popularDramas}
                  isLoading={isLoadingCategories}
                  seeAllPath="/category/terpopular"
                />

                <CategorySection
                  title="Trending"
                  icon="gem"
                  dramas={exclusiveDramas}
                  isLoading={isLoadingCategories}
                  seeAllPath="/category/terbatas"
                />

                <CategorySection
                  title="Popular"
                  icon="flame"
                  dramas={popularSectionDramas}
                  isLoading={isLoadingCategories}
                  seeAllPath="/category/popular"
                />
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-gray-400">Segera hadir...</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    Hasil Pencarian
                  </h2>
                  <p className="text-gray-400">
                    Untuk: <span className="font-semibold text-white">{searchKeyword}</span>
                  </p>
                </div>
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-800 rounded-lg transition-colors hover:bg-gray-700"
                >
                  Kembali ke Home
                </button>
              </div>

              {error && (
                <div className="p-4 mb-4 rounded-lg border border-red-700 bg-red-900/20">
                  <p className="text-red-400">{error}</p>
                </div>
              )}
            </div>

            <SeriesList series={series} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}

