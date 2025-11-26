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
        // Load featured dramas for carousel
        const featuredKeywords = ['drama', 'romance', 'love'];
        const featuredResults: Book[] = [];
        for (const keyword of featuredKeywords) {
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
            featuredResults.push(...normalized);
            if (featuredResults.length >= 5) break;
          } catch {
            // Continue
          }
        }
        const uniqueFeatured = featuredResults.filter(
          (item, index, self) =>
            index === self.findIndex((t) => (t.bookId || t.id) === (item.bookId || item.id))
        );
        setFeaturedDramas(uniqueFeatured.slice(0, 5));

        // Load latest dramas
        try {
          const latestResult = await dramaboxApi.searchBook('drama');
          const latestList = (latestResult.searchList ?? []) as Book[];
          const normalized = latestList
            .slice(0, 10)
            .map((item) => ({
              ...item,
              bookId: item.bookId || item.id || '',
              bookName: item.bookName || item.title || 'Untitled',
            }));
          setLatestDramas(normalized);
          setPopularDramas(normalized.slice(0, 10));
          setExclusiveDramas(normalized.slice(0, 10));
        } catch {
          // Silently fail
        }
      } catch {
        // Silently fail
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
                  title="TERBARU"
                  icon="star"
                  dramas={latestDramas}
                  isLoading={isLoadingCategories}
                />

                <CategorySection
                  title="TERPOPULAR"
                  icon="flame"
                  dramas={popularDramas}
                  isLoading={isLoadingCategories}
                />

                <CategorySection
                  title="TERBATAS"
                  icon="gem"
                  dramas={exclusiveDramas}
                  isLoading={isLoadingCategories}
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

