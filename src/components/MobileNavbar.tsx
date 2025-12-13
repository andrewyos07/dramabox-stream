import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film } from 'lucide-react';
import type { Book } from '../services/dramaboxApi';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

export default function MobileNavbar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { suggestions, isLoading } = useSearchSuggestions(searchKeyword, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
      setShowSearch(false);
      setSearchKeyword('');
      setIsSearchFocused(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (book: Book) => {
    const id = book.bookId || book.id;
    if (!id) return;
    navigate(`/series/${id}`);
    setShowSearch(false);
    setSearchKeyword('');
    setIsSearchFocused(false);
  };

  const shouldShowSuggestions = showSearch && isSearchFocused && searchKeyword.trim().length > 0;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="bg-gray-900 border-b border-gray-800 md:hidden">
        {/* Status Bar Area */}
        <div className="flex justify-between items-center px-4 h-6 text-xs text-gray-400 bg-gray-950">
          <span>9:41</span>
          <div className="flex gap-1 items-center">
            <div className="w-4 h-2 rounded-sm border border-gray-400">
              <div className="w-3 h-1.5 bg-gray-400 m-0.5 rounded-sm" />
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex justify-between items-center px-4 py-2 bg-gray-900">
          <div className="flex flex-1 justify-center items-center">
            <span className="text-xs text-gray-400">dramabox.com</span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white"
            >
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Logo & Tabs */}
        <div className="px-4 py-3 bg-gray-900">
          <div className="flex gap-2 items-center mb-3">
            <div className="bg-blue-500 rounded-full p-1.5">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DramaBox</span>
          </div>
        </div>

        {/* Search Bar (when toggled) */}
        {showSearch && (
          <div className="relative px-4 pb-3" ref={searchContainerRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Cari drama..."
                className="py-2 pr-4 pl-10 w-full text-sm text-white bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </form>
            {shouldShowSuggestions && (
              <div className="absolute right-0 left-0 top-full z-50 mt-2 bg-gray-900 rounded-xl border border-gray-800 shadow-2xl">
                {isLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-400">Mencari rekomendasi...</div>
                ) : suggestions.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Tidak ada hasil</div>
                ) : (
                  <ul className="overflow-y-auto max-h-80 divide-y divide-gray-800">
                    {suggestions.map((item) => (
                      <li key={item.bookId || item.id}>
                        <button
                          onClick={() => handleSuggestionClick(item)}
                          className="flex gap-3 px-4 py-3 w-full text-left transition-colors hover:bg-gray-800"
                        >
                          <img
                            src={item.cover || '/placeholder.jpg'}
                            alt={item.bookName || item.title || 'Drama'}
                            className="object-cover w-10 h-14 rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white line-clamp-1">
                              {item.bookName || item.title || 'Untitled'}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {item.introduction || 'Lihat detail selengkapnya'}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu (when toggled) */}
        {showMenu && (
          <div className="px-4 pb-3 border-t border-gray-800">
            <div className="flex flex-col gap-2 pt-3">
              <button
                onClick={() => {
                  navigate('/');
                  setShowMenu(false);
                }}
                className="px-3 py-2 text-left text-gray-300 rounded-lg hover:text-white hover:bg-gray-800"
              >
                Home
              </button>
              <button className="px-3 py-2 text-left text-gray-300 rounded-lg hover:text-white hover:bg-gray-800">
                Browse
              </button>
              <button className="px-3 py-2 text-left text-gray-300 rounded-lg hover:text-white hover:bg-gray-800">
                App
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

