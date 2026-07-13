'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getFilmsByGenre, PaginatedFilms } from '@/lib/api';
import { GENRES } from '@/lib/taxonomy';
import FilmCard from '@/components/films/FilmCard';
import { FilmGridSkeleton, LoadError } from '@/components/ui/Skeleton';

export default function GenrePage() {
  return (
    <Suspense fallback={<div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8"><FilmGridSkeleton /></div>}>
      <GenrePageInner />
    </Suspense>
  );
}

function GenrePageInner() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug;
  const currentPage = Number(searchParams.get('page') || 1);

  const genreInfo = GENRES.find((g) => g.slug === slug);
  const title = genreInfo?.name || slug?.replace(/-/g, ' ');

  const [data, setData] = useState<PaginatedFilms | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const res = await getFilmsByGenre(slug, currentPage);
      if (!res?.items) { setError(true); } else { setData(res); }
    } catch {
      setError(true);
    }
    setLoading(false);
  }, [slug, currentPage]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    document.title = `Phim ${title} - PhimHay`;
  }, [title]);

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 min-h-screen">
      <nav className="mb-4 flex items-center text-sm gap-2 text-[var(--text-base)]">
        <Link href="/" className="hover:text-white">Trang chủ</Link>
        <span>&rsaquo;</span>
        <span className="text-white">Thể loại</span>
        <span>&rsaquo;</span>
        <span className="text-white">{title}</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold uppercase text-white border-l-4 border-[var(--primary-color)] pl-3 mb-8">
        Phim {title}
      </h1>

      {loading && <FilmGridSkeleton />}
      {!loading && error && <LoadError onRetry={load} />}

      {!loading && !error && data?.items && (
        <>
          {data.items.length === 0 ? (
            <p className="text-[var(--text-base)] text-center py-16">Chưa có phim nào thuộc thể loại này.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {data.items.map((film) => (
                  <FilmCard key={film.slug} film={film} />
                ))}
              </div>

              <div className="flex justify-center items-center gap-4 mt-12">
                {currentPage > 1 && (
                  <Link href={`/the-loai/${slug}?page=${currentPage - 1}`} className="btn btn-secondary px-6">
                    Trang Trước
                  </Link>
                )}
                <span className="text-white">Trang {currentPage}</span>
                {currentPage < (data.paginate?.total_page || 1) && (
                  <Link href={`/the-loai/${slug}?page=${currentPage + 1}`} className="btn btn-primary px-6">
                    Trang Sau
                  </Link>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
