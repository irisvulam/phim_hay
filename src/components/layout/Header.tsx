'use client';

import Link from 'next/link';
import { Search, Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#191b24]/95 backdrop-blur-sm border-b border-[rgba(255,255,255,0.063)]">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-[#ffd875]">
              PhimHay<span className="text-white text-sm">.HD</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8 text-sm font-medium text-[#aaaaaa]">
              <li><Link href="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link href="/danh-sach/phim-moi-cap-nhat" className="hover:text-white transition-colors">Phim Mới</Link></li>
              <li><Link href="/danh-sach/phim-le" className="hover:text-white transition-colors">Phim Lẻ</Link></li>
              <li><Link href="/danh-sach/phim-bo" className="hover:text-white transition-colors">Phim Bộ</Link></li>
              <li><Link href="/danh-sach/hoat-hinh" className="hover:text-white transition-colors">Hoạt Hình</Link></li>
            </ul>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden sm:flex relative">
              <input
                type="text"
                placeholder="Tìm tên phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#282b3a] text-white text-sm rounded-full py-1.5 pl-4 pr-10 border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#ffd875]"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={16} />
              </button>
            </form>
            
            <button className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-[#2f3346] text-gray-400 hover:text-white transition-colors">
              <User size={20} />
            </button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#202331] border-b border-[rgba(255,255,255,0.063)]">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Tìm tên phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#282b3a] text-white rounded-full py-2 pl-4 pr-10 border border-[rgba(255,255,255,0.1)] focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </button>
            </form>
            <ul className="flex flex-col space-y-3 text-white font-medium">
              <li><Link href="/" className="block py-2">Trang chủ</Link></li>
              <li><Link href="/danh-sach/phim-moi-cap-nhat" className="block py-2">Phim Mới</Link></li>
              <li><Link href="/danh-sach/phim-le" className="block py-2">Phim Lẻ</Link></li>
              <li><Link href="/danh-sach/phim-bo" className="block py-2">Phim Bộ</Link></li>
              <li><Link href="/danh-sach/hoat-hinh" className="block py-2">Hoạt Hình</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
