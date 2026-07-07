'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFilmDetail, getFilmsByGenre, FilmDetail, PaginatedFilms } from '@/lib/api';
import FilmCard from '@/components/films/FilmCard';
import { PageLoading, LoadError } from '@/components/ui/Skeleton';

export default function FilmDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [data, setData] = useState<FilmDetail | null>(null);
  const [related, setRelated] = useState<PaginatedFilms | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    try {
      const detail = await getFilmDetail(slug);
      if (!detail?.film) { setError(true); setLoading(false); return; }
      setData(detail);
      document.title = `${detail.film.name} (${detail.film.original_name}) - Vietsub - PhimHay`;
      setLoading(false);

      const genreSlug = detail.film.category?.[0]?.slug;
      if (genreSlug) {
        getFilmsByGenre(genreSlug, 1).then(setRelated).catch(() => null);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoading label="Đang tải thông tin phim..." />;
  if (error || !data) return <LoadError onRetry={load} message="Không tìm thấy phim hoặc nguồn dữ liệu tạm thời lỗi." />;

  const { film, episodes } = data;
  const firstEp = episodes?.[0]?.server_data?.[0];

  return (
    <div className="relative min-h-screen">
      {/* Background Blur */}
      <div
        className="absolute top-0 left-0 w-full h-[60vh] opacity-20 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: `url(${film.poster_url || film.thumb_url})`, filter: 'blur(20px)', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
      />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl relative z-10 py-6 text-[var(--text-base)]">
        <nav className="mb-6 flex items-center text-sm gap-2">
          <Link href="/" className="hover:text-white">Trang chủ</Link>
          <span>&rsaquo;</span>
          <span className="text-white truncate">{film.name}</span>
        </nav>

        {/* Header phim */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-full md:w-1/4 shrink-0">
            <div className="rounded-xl overflow-hidden shadow-2xl relative aspect-[2/3]">
              <img src={film.poster_url || film.thumb_url} alt={film.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{film.name}</h1>
            <h2 className="text-xl md:text-2xl text-gray-400 mb-4">{film.original_name}</h2>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="tag-model">{film.current_episode}</span>
              <span className="tag-quality">{film.quality}</span>
              <span className="tag-classic">{film.language}</span>
              <span className="tag-classic">{film.time}</span>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              {film.category?.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-24 shrink-0">Thể loại:</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {film.category.map(c => <span key={c.slug} className="text-white">{c.name}</span>)}
                  </div>
                </div>
              )}
              {film.country?.length > 0 && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-24 shrink-0">Quốc gia:</span>
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {film.country.map(c => <span key={c.slug} className="text-white">{c.name}</span>)}
                  </div>
                </div>
              )}
              {film.director && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-24 shrink-0">Đạo diễn:</span>
                  <span className="text-white">{film.director}</span>
                </div>
              )}
              {film.casts && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-24 shrink-0">Diễn viên:</span>
                  <span className="text-white">{film.casts}</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h3 className="text-white font-bold mb-2">Nội dung phim:</h3>
              <p className="leading-relaxed text-gray-300" dangerouslySetInnerHTML={{ __html: film.description }} />
            </div>

            <div>
              {firstEp && (
                <Link className="btn btn-xl btn-rounded button-play md:px-10" href={`/xem-phim/${film.slug}/${firstEp.slug}`}>
                  <span className="text-xl">▶</span> Xem phim
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Danh sách tập */}
        {episodes?.map((server, idx) => (
          <div key={idx} className="mb-8 bg-[var(--bg-2)] rounded-xl p-6 border border-white/5">
            <div className="text-white font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[var(--primary-color)] rounded-full inline-block"></span>
              {server.server_name}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {server.server_data.map(ep => (
                <Link key={ep.slug}
                   href={`/xem-phim/${film.slug}/${ep.slug}?server=${idx}`}
                   className="bg-[#202331] hover:bg-[var(--primary-color)] hover:text-[var(--primary-button-text)] text-sm text-center py-2 px-3 rounded transition-colors text-white truncate"
                   title={ep.name}>
                  {ep.name}
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Phim liên quan */}
        {related && related.items?.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center mb-6">
              <h3 className="text-2xl font-bold uppercase text-white border-l-4 border-[var(--primary-color)] pl-3">Phim tương tự</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {related.items.filter(f => f.slug !== film.slug).slice(0, 6).map(f => (
                <FilmCard key={f.slug} film={f} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
