'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchFilms, PaginatedFilms } from '@/lib/api';
import FilmCard from '@/components/films/FilmCard';
import { FilmGridSkeleton, LoadError } from '@/components/ui/Skeleton';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8"><FilmGridSkeleton /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const keyword = (searchParams.get('q') || '').trim();

  const [data, setData] = useState<PaginatedFilms | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!keyword) { setData(null); return; }
    setLoading(true);
    setError(false);
    try {
      setData(await searchFilms(keyword));
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [keyword]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    document.title = `Tìm kiếm: ${keyword} - PhimHay`;
  }, [keyword]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-white border-l-4 border-[var(--primary-color)] pl-3 mb-8">
        Kết quả tìm kiếm cho: <span className="text-[var(--primary-color)]">&quot;{keyword}&quot;</span>
      </h1>

      {!keyword && (
        <div className="text-gray-400">Vui lòng nhập từ khóa để tìm kiếm.</div>
      )}

      {loading && <FilmGridSkeleton />}
      {!loading && error && <LoadError onRetry={load} />}

      {keyword && !loading && !error && (!data?.items || data.items.length === 0) && (
        <div className="text-gray-400">Không tìm thấy phim nào phù hợp.</div>
      )}

      {!loading && !error && data?.items && data.items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {data.items.map(film => (
            <FilmCard key={film.slug} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}
