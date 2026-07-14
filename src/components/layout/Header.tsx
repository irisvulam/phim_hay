'use client';

import Link from 'next/link';
import { Search, Menu, User, X, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GENRES, COUNTRIES } from '@/lib/taxonomy';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Mobile: mục accordion nào đang mở (thể loại / quốc gia)
  const [mobileExpanded, setMobileExpanded] = useState<'the-loai' | 'quoc-gia' | null>(null);
  const router = useRouter();

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false); // Close menu after search
      setSearchQuery(''); // Clear search input
    }
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  // Esc đóng dropdown (blur element đang focus bên trong → group-focus-within tắt)
  const closeDropdownOnEscape = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      (document.activeElement as HTMLElement | null)?.blur();
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
            <ul className="flex items-center space-x-6 lg:space-x-8 text-sm font-medium text-[#aaaaaa]">
              <li><Link href="/" className="hover:text-white transition-colors">Trang chủ</Link></li>
              <li><Link href="/danh-sach/phim-moi-cap-nhat" className="hover:text-white transition-colors">Phim Mới</Link></li>
              <li><Link href="/danh-sach/phim-le" className="hover:text-white transition-colors">Phim Lẻ</Link></li>
              <li><Link href="/danh-sach/phim-bo" className="hover:text-white transition-colors">Phim Bộ</Link></li>

              {/* Dropdown: Thể loại — mở bằng hover HOẶC focus (keyboard/TV remote) */}
              <li className="relative group" onKeyDown={closeDropdownOnEscape}>
                <button className="flex items-center gap-1 hover:text-white focus:text-white transition-colors py-2" aria-haspopup="true">
                  Thể loại <ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-150 z-50">
                  <div className="bg-[#202331] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl p-4 w-[560px] grid grid-cols-4 gap-x-4 gap-y-1">
                    {GENRES.map((g) => (
                      <Link
                        key={g.slug}
                        href={`/the-loai/${g.slug}`}
                        className="text-sm text-[#aaaaaa] hover:text-[var(--primary-color)] transition-colors py-1.5 truncate"
                      >
                        {g.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Dropdown: Quốc gia — mở bằng hover HOẶC focus (keyboard/TV remote) */}
              <li className="relative group" onKeyDown={closeDropdownOnEscape}>
                <button className="flex items-center gap-1 hover:text-white focus:text-white transition-colors py-2" aria-haspopup="true">
                  Quốc gia <ChevronDown size={14} className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 transition-all duration-150 z-50">
                  <div className="bg-[#202331] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl p-4 w-[420px] grid grid-cols-3 gap-x-4 gap-y-1">
                    {COUNTRIES.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/quoc-gia/${c.slug}`}
                        className="text-sm text-[#aaaaaa] hover:text-[var(--primary-color)] transition-colors py-1.5 truncate"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              <li><Link href="/danh-sach/hoat-hinh" className="hover:text-white transition-colors">Hoạt Hình</Link></li>
              <li><Link href="/loc-phim" className="hover:text-white transition-colors">Lọc Phim</Link></li>
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
                className="bg-[#282b3a] text-white text-sm rounded-full py-1.5 pl-4 pr-10 border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#ffd875] focus:ring-2 focus:ring-[#ffd875]/50"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                <Search size={16} />
              </button>
            </form>

            <button className="hidden sm:flex items-center justify-center p-2 rounded-full hover:bg-[#2f3346] text-gray-400 hover:text-white transition-colors">
              <User size={20} />
            </button>

            {/* Mobile menu button — 44x44px touch target */}
            <button
              className="md:hidden flex items-center justify-center w-11 h-11 text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Mở menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Panel */}
      {isMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Slide-in menu panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#191b24] z-50 md:hidden shadow-xl overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Header with close button */}
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.063)]">
                <Link
                  href="/"
                  onClick={handleNavClick}
                  className="text-xl font-bold text-[#ffd875]"
                >
                  PhimHay<span className="text-white text-xs">.HD</span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-11 h-11 rounded-full hover:bg-[#2f3346] text-gray-400 hover:text-white transition-colors"
                  aria-label="Đóng menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search form */}
              <div className="p-4 border-b border-[rgba(255,255,255,0.063)]">
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    placeholder="Tìm tên phim..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#282b3a] text-white text-sm rounded-full py-2.5 pl-4 pr-10 border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[#ffd875] focus:ring-2 focus:ring-[#ffd875]/50"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ffd875] transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>

              {/* Navigation links */}
              <nav className="flex-1 overflow-y-auto">
                <ul className="p-4 space-y-1">
                  <li>
                    <Link
                      href="/"
                      onClick={handleNavClick}
                      className="block py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                    >
                      Trang chủ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/danh-sach/phim-moi-cap-nhat"
                      onClick={handleNavClick}
                      className="block py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                    >
                      Phim Mới
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/danh-sach/phim-le"
                      onClick={handleNavClick}
                      className="block py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                    >
                      Phim Lẻ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/danh-sach/phim-bo"
                      onClick={handleNavClick}
                      className="block py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                    >
                      Phim Bộ
                    </Link>
                  </li>

                  {/* Accordion: Thể loại */}
                  <li>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === 'the-loai' ? null : 'the-loai')}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                      aria-expanded={mobileExpanded === 'the-loai'}
                    >
                      Thể loại
                      <ChevronDown size={18} className={`transition-transform ${mobileExpanded === 'the-loai' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileExpanded === 'the-loai' && (
                      <div className="grid grid-cols-2 gap-1 px-2 pb-2 pt-1">
                        {GENRES.map((g) => (
                          <Link
                            key={g.slug}
                            href={`/the-loai/${g.slug}`}
                            onClick={handleNavClick}
                            className="py-2.5 px-3 rounded-lg text-sm text-[#aaaaaa] hover:bg-[#2f3346] hover:text-white transition-colors truncate"
                          >
                            {g.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  {/* Accordion: Quốc gia */}
                  <li>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === 'quoc-gia' ? null : 'quoc-gia')}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                      aria-expanded={mobileExpanded === 'quoc-gia'}
                    >
                      Quốc gia
                      <ChevronDown size={18} className={`transition-transform ${mobileExpanded === 'quoc-gia' ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileExpanded === 'quoc-gia' && (
                      <div className="grid grid-cols-2 gap-1 px-2 pb-2 pt-1">
                        {COUNTRIES.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/quoc-gia/${c.slug}`}
                            onClick={handleNavClick}
                            className="py-2.5 px-3 rounded-lg text-sm text-[#aaaaaa] hover:bg-[#2f3346] hover:text-white transition-colors truncate"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>

                  <li>
                    <Link
                      href="/danh-sach/hoat-hinh"
                      onClick={handleNavClick}
                      className="block py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                    >
                      Hoạt Hình
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/loc-phim"
                      onClick={handleNavClick}
                      className="block py-3 px-4 rounded-lg text-white font-medium hover:bg-[#2f3346] transition-colors min-h-11"
                    >
                      Lọc Phim
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
