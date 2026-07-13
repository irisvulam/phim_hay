'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { PaginatedFilms } from '@/lib/api';
import { GENRES, COUNTRIES } from '@/lib/taxonomy';
import FilmCard from '@/components/films/FilmCard';
import { FilmGridSkeleton, LoadError } from '@/components/ui/Skeleton';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR - i);

export default function LocPhimPage() {
  return (
    <Suspense fallback={<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8"><FilmGridSkeleton /></div>}>
      <LocPhimPageInner />
    </Suspense>
  );
}

function LocPhimPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const keyword = searchParams.get('q') || '';
  const genre = searchParams.get('the-loai') || '';
  const country = searchParams.get('quoc-gia') || '';
  const year = searchParams.get('nam') || '';
  const sort = searchParams.get('sort') || 'new';
  const currentPage = Number(searchParams.get('page') || 1);

  // Ô nhập tìm kiếm dùng state riêng + debounce, tránh push URL mỗi lần gõ 1 ký tự
  const [keywordInput, setKeywordInput] = useState(keyword);
  useEffect(() => { setKeywordInput(keyword); }, [keyword]);

  const [data, setData] = useState<PaginatedFilms | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const qs = new URLSearchParams();
      if (keyword) qs.set('q', keyword);
      if (genre) qs.set('the-loai', genre);
      if (country) qs.set('quoc-gia', country);
      if (year) qs.set('nam', year);
      if (sort) qs.set('sort', sort);
      qs.set('page', String(currentPage));

      const res = await fetch(`/api/loc-phim?${qs.toString()}`);
      const json = await res.json();
      if (json?.status !== 'success') {
        setError(true);
      } else {
        setData(json);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [keyword, genre, country, year, sort, currentPage]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    document.title = 'Lọc phim nâng cao - PhimHay';
  }, []);

  // Đổi 1 filter, reset về trang 1, giữ nguyên các filter khác trên URL
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete('page');
    router.push(`/loc-phim?${params.toString()}`);
  };

  // Gõ từ khoá — chờ 400ms sau khi ngừng gõ mới cập nhật URL/gọi API
  useEffect(() => {
    if (keywordInput === keyword) return;
    const timer = setTimeout(() => updateFilter('q', keywordInput.trim()), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordInput]);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`/loc-phim?${params.toString()}`);
  };

  const selectClass =
    'bg-[var(--bg-2)] text-white text-sm rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[var(--primary-color)] cursor-pointer';

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold uppercase text-white border-l-4 border-[var(--primary-color)] pl-3 mb-6">
        Lọc phim nâng cao
      </h1>

      {/* Bộ lọc — kết hợp nhiều điều kiện cùng lúc, thứ mà API gốc không hỗ trợ */}
      <div className="flex flex-wrap gap-3 mb-8 bg-[var(--bg-2)]/50 p-4 rounded-xl">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Tìm theo tên phim..."
            className="w-full bg-[var(--bg-2)] text-white text-sm rounded-lg py-2 pl-9 pr-3 border border-[rgba(255,255,255,0.1)] focus:outline-none focus:border-[var(--primary-color)]"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>

        <select className={selectClass} value={genre} onChange={(e) => updateFilter('the-loai', e.target.value)}>
          <option value="">Tất cả thể loại</option>
          {GENRES.map((g) => <option key={g.slug} value={g.slug}>{g.name}</option>)}
        </select>

        <select className={selectClass} value={country} onChange={(e) => updateFilter('quoc-gia', e.target.value)}>
          <option value="">Tất cả quốc gia</option>
          {COUNTRIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>

        <select className={selectClass} value={year} onChange={(e) => updateFilter('nam', e.target.value)}>
          <option value="">Tất cả năm</option>
          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select className={selectClass} value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
          <option value="new">Mới đồng bộ nhất</option>
          <option value="name">Tên A-Z</option>
        </select>

        {(keyword || genre || country || year || sort !== 'new') && (
          <button
            onClick={() => { setKeywordInput(''); router.push('/loc-phim'); }}
            className="text-sm text-[var(--text-base)] hover:text-white underline px-2"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {loading && <FilmGridSkeleton />}
      {!loading && error && <LoadError onRetry={load} message="Không truy vấn được dữ liệu từ database." />}

      {!loading && !error && data?.items && (
        <>
          {data.items.length === 0 ? (
            <p className="text-[var(--text-base)] text-center py-16">
              Chưa có phim nào khớp bộ lọc trong DB — thử chạy thêm{' '}
              <code className="bg-[var(--bg-2)] px-1.5 py-0.5 rounded">npm run sync:nguonc</code> để đồng bộ thêm dữ liệu.
            </p>
          ) : (
            <>
              <p className="text-[var(--text-base)] text-sm mb-4">{data.paginate.total_items} phim phù hợp</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {data.items.map((film) => (
                  <FilmCard key={film.slug} film={film} />
                ))}
              </div>

              <div className="flex justify-center items-center gap-4 mt-12">
                {currentPage > 1 && (
                  <button onClick={() => goToPage(currentPage - 1)} className="btn btn-secondary px-6">
                    Trang Trước
                  </button>
                )}
                <span className="text-white">Trang {currentPage} / {data.paginate.total_page}</span>
                {currentPage < data.paginate.total_page && (
                  <button onClick={() => goToPage(currentPage + 1)} className="btn btn-primary px-6">
                    Trang Sau
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}

      <p className="text-xs text-[var(--text-base)] mt-10">
        Dữ liệu trang này lấy từ database riêng của PhimHay (đồng bộ thủ công từ NguonC),
        cho phép kết hợp nhiều điều kiện lọc cùng lúc. Xem{' '}
        <Link href="/" className="underline hover:text-white">trang chủ</Link> nếu muốn duyệt phim mới nhất trực tiếp từ nguồn.
      </p>
    </div>
  );
}
