import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeriesCard from '../components/SeriesCard';
import type { Book } from '../services/dramaboxApi';
import { enrichBooksWithViewCounts, fetchDramasByKeywords } from '../utils/dramaData';

const ITEMS_PER_PAGE = 50;
const MAX_PAGES = 3;

const categoryConfigs = {
  terpopular: {
    title: 'Drama Terpopular',
    description: 'Daftar drama dengan jumlah views terbanyak di DramaBox.',
    keywords: ['popular', 'trending', 'favorite', 'hits', 'top rated', 'most viewed'],
    sort: (a: Book, b: Book) => (b.viewCount ?? 0) - (a.viewCount ?? 0),
  },
  terbatas: {
    title: 'Drama Terbatas',
    description: 'Pilihan eksklusif yang hanya tersedia untuk waktu terbatas.',
    keywords: ['exclusive', 'premium', 'original', 'vip', 'must watch', 'special'],
    sort: (a: Book, b: Book) => (b.followCount ?? 0) - (a.followCount ?? 0),
  },
};

type CategoryKey = keyof typeof categoryConfigs;

const formatNumber = (value?: number) => {
  if (!value) return '0';
  return value.toLocaleString('id-ID');
};

export default function CategoryListPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const category = useMemo(() => {
    if (!type) return null;
    const key = type.toLowerCase() as CategoryKey;
    return categoryConfigs[key] ? { key, ...categoryConfigs[key] } : null;
  }, [type]);

  useEffect(() => {
    const load = async () => {
      if (!category) {
        setIsLoading(false);
        setError('Kategori tidak ditemukan.');
        return;
      }

      setIsLoading(true);
      setError(null);
      setCurrentPage(1);

      try {
        const desiredCount = ITEMS_PER_PAGE * MAX_PAGES;
        let results = await fetchDramasByKeywords(category.keywords, desiredCount * 2);

        if (category.key === 'terpopular') {
          results = await enrichBooksWithViewCounts(results, 8);
        }

        const sorted = category.sort ? [...results].sort(category.sort) : results;
        setItems(sorted.slice(0, desiredCount));
      } catch {
        setError('Gagal memuat data kategori. Silakan coba lagi.');
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [category]);

  const totalPages = useMemo(() => {
    if (!items.length) return 1;
    return Math.max(1, Math.min(MAX_PAGES, Math.ceil(items.length / ITEMS_PER_PAGE)));
  }, [items]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return items.slice(start, end);
  }, [items, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!category) {
    return (
      <div className="min-h-screen text-white bg-gray-900">
        <div className="container px-4 py-8 mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-sm text-blue-400 hover:text-blue-300"
          >
            &larr; Kembali
          </button>
          <p className="text-gray-300">Kategori tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gray-900">
      <div className="container px-4 py-8 mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-blue-400 hover:text-blue-300"
        >
          &larr; Kembali
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">{category.title}</h1>
          <p className="text-gray-400">{category.description}</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="w-full h-72 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-red-300 rounded-lg border border-red-500 bg-red-500/10">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {paginatedItems.map((drama) => (
                <div key={drama.bookId || drama.id} className="space-y-1">
                  <SeriesCard series={drama} />
                  {category.key === 'terpopular' && (
                    <p className="text-xs text-gray-400">
                      Views:{' '}
                      {drama.viewCount != null ? formatNumber(drama.viewCount) : 'Memuat...'}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 justify-center items-center mt-10">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === 1
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-9 h-9 rounded-full text-sm ${
                      currentPage === page
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === totalPages
                    ? 'border-gray-700 text-gray-600 cursor-not-allowed'
                    : 'border-white/30 text-white hover:bg-white/10'
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


