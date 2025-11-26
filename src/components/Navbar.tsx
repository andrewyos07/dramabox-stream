import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Headphones, User, Play, ChevronDown } from 'lucide-react';
import type { Book } from '../services/dramaboxApi';
import { useSearchSuggestions } from '../hooks/useSearchSuggestions';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const { suggestions, isLoading } = useSearchSuggestions(searchKeyword, 8);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideSearch = (event: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setIsDesktopSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(event.target as Node)) {
        setIsMobileSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideSearch);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
      setShowSearch(false);
      setSearchKeyword('');
      setIsDesktopSearchFocused(false);
      setIsMobileSearchFocused(false);
    }
  };

  const handleSuggestionClick = (book: Book) => {
    const id = book.bookId || book.id;
    if (!id) return;
    navigate(`/series/${id}`);
    setSearchKeyword('');
    setShowSearch(false);
    setIsDesktopSearchFocused(false);
    setIsMobileSearchFocused(false);
  };

  const shouldShowSuggestions = (variant: 'desktop' | 'mobile') => {
    const hasQuery = searchKeyword.trim().length > 0;
    const isFocused =
      variant === 'desktop' ? isDesktopSearchFocused : showSearch && isMobileSearchFocused;
    if (!isFocused) return false;
    return hasQuery || isLoading;
  };

  const renderSuggestions = (variant: 'desktop' | 'mobile') => {
    if (!shouldShowSuggestions(variant)) {
      return null;
    }

    const positionClasses =
      variant === 'desktop'
        ? 'absolute left-0 right-0 top-full mt-2'
        : 'absolute left-0 right-0 top-full mt-2';

    return (
      <div
        className={`${positionClasses} bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50`}
      >
        {isLoading ? (
          <div className="px-4 py-4 text-sm text-gray-400">Mencari rekomendasi...</div>
        ) : suggestions.length === 0 ? (
          <div className="px-4 py-4 text-sm text-gray-500">Tidak ada hasil ditemukan</div>
        ) : (
          <ul className="max-h-96 overflow-y-auto divide-y divide-gray-800">
            {suggestions.map((item) => (
              <li key={item.bookId || item.id}>
                <button
                  onClick={() => handleSuggestionClick(item)}
                  className="flex gap-3 w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                >
                  <img
                    src={item.cover || '/placeholder.jpg'}
                    alt={item.bookName || item.title || 'Drama'}
                    className="w-12 h-16 object-cover rounded-md"
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
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="bg-pink-500 rounded-full p-1.5 group-hover:bg-pink-600 transition-colors">
              <Play className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-white">DramaBox</span>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-pink-500'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Browse
            </button>
            <button
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              App
            </button>
            <div className="relative" ref={languageMenuRef}>
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                English
                <ChevronDown className="w-4 h-4" />
              </button>
              {showLanguageMenu && (
                <div className="absolute top-full mt-2 right-0 bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[120px] z-50">
                  <button
                    onClick={() => setShowLanguageMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-t-lg"
                  >
                    English
                  </button>
                  <button
                    onClick={() => setShowLanguageMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Bahasa Indonesia
                  </button>
                  <button
                    onClick={() => setShowLanguageMenu(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-b-lg"
                  >
                    Español
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={desktopSearchRef}>
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => setIsDesktopSearchFocused(true)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400"
              />
            </form>
            {renderSuggestions('desktop')}
          </div>

          {/* Mobile Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="md:hidden text-gray-300 hover:text-white p-2"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <button
              className="text-gray-300 hover:text-white transition-colors p-2"
              aria-label="Notifications"
            >
              <Headphones className="w-5 h-5" />
            </button>
            <button
              className="text-gray-300 hover:text-white transition-colors p-2"
              aria-label="Profile"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="md:hidden pb-4 relative" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => setIsMobileSearchFocused(true)}
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent placeholder-gray-400"
                autoFocus
              />
            </form>
            {renderSuggestions('mobile')}
          </div>
        )}
      </div>
    </nav>
  );
}

