'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getFilmsByCategory, PaginatedFilms } from '@/lib/api';
import { fetchDbFilms } from '@/lib/dbFilms';
import FilmCard from '@/components/films/FilmCard';
import { FilmGridSkeleton, LoadError } from '@/components/ui/Skeleton';

// Các danh mục đọc được từ DB nội bộ (nhiều dữ liệu hơn, không giới hạn bởi cache
// API gốc). "tv-shows", "phim-dang-chieu", "phim-sap-chieu" vẫn gọi NguonC trực
// tiếp vì không có nhãn tương ứng đáng tin cậy trong DB (xem ghi chú ở /api/loc-phim).
function loadFromDb(category: string, page: number): Promise<PaginatedFilms> | null {
  if (category === 'phim-moi-cap-nhat') return fetchDbFilms({ sort: 'new', page });
  if (category === 'phim-bo') return fetchDbFilms({ 'dinh-dang': 'phim-bo', sort: 'new', page });
  if (category === 'phim-le') return fetchDbFilms({ 'dinh-dang': 'phim-le', sort: 'new', page });
  if (category === 'hoat-hinh') return fetchDbFilms({ 'the-loai': 'hoat-hinh', sort: 'new', page });
  return null;
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8"><FilmGridSkeleton /></div>}>
      <CategoryPageInner />
    </Suspense>
  );
}

function CategoryPageInner() {
  const params = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  const category = params?.category;
  const currentPage = Number(searchParams.get('page') || 1);

  const [data, setData] = useState<PaginatedFilms | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!category) return;
    setLoading(true);
    setError(false);
    try {
      const dbPromise = loadFromDb(category, currentPage);
      const res = dbPromise ? await dbPromise : await getFilmsByCategory(category, currentPage);
      if (!res?.items) { setError(true); } else { setData(res); }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [category, currentPage]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (category) document.title = `Danh sách phim ${category.replace(/-/g, ' ')} - PhimHay`;
  }, [category]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold uppercase text-white border-l-4 border-[var(--primary-color)] pl-3 mb-8">
        Danh sách phim: {category?.replace(/-/g, ' ')}
      </h1>

      {loading && <FilmGridSkeleton />}
      {!loading && error && <LoadError onRetry={load} />}

      {!loading && !error && data?.items && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {data.items.map(film => (
              <FilmCard key={film.slug} film={film} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-12">
            {currentPage > 1 && (
              <Link href={`/danh-sach/${category}?page=${currentPage - 1}`} className="btn btn-secondary px-6">
                Trang Trước
              </Link>
            )}
            <span className="text-white">Trang {currentPage}</span>
            {currentPage < (data.paginate?.total_page || 1) && (
              <Link href={`/danh-sach/${category}?page=${currentPage + 1}`} className="btn btn-primary px-6">
                Trang Sau
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
