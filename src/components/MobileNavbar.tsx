import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film } from 'lucide-react';

export default function MobileNavbar() {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/?search=${encodeURIComponent(searchKeyword.trim())}`);
      setShowSearch(false);
      setSearchKeyword('');
    }
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800">
        {/* Status Bar Area */}
        <div className="h-6 bg-gray-950 flex items-center justify-between px-4 text-xs text-gray-400">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 border border-gray-400 rounded-sm">
              <div className="w-3 h-1.5 bg-gray-400 m-0.5 rounded-sm" />
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
          </div>
        </div>

        {/* URL Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
          <div className="flex-1 flex items-center justify-center">
            <span className="text-xs text-gray-400">dramabox.com</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="text-gray-400 hover:text-white p-1"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-white p-1"
            >
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Logo & Tabs */}
        <div className="px-4 py-3 bg-gray-900">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500 rounded-full p-1.5">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">DramaBox</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
              Untuk Anda
            </button>
            <button className="px-4 py-1.5 text-gray-400 rounded-full text-sm font-medium">
              Segera Hadir
            </button>
          </div>
        </div>

        {/* Search Bar (when toggled) */}
        {showSearch && (
          <div className="px-4 pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Cari drama..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                autoFocus
              />
            </form>
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
                className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                Home
              </button>
              <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                Browse
              </button>
              <button className="text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                App
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

