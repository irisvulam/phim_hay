'use client';

import { useCallback, useEffect, useState } from 'react';
import { getFilmsByCategory, getNewFilms, PaginatedFilms } from '@/lib/api';
import HeroSlider from '@/components/films/HeroSlider';
import FilmRow from '@/components/films/FilmRow';
import { PageLoading, LoadError } from '@/components/ui/Skeleton';

// Trang chủ fetch API trực tiếp từ trình duyệt người dùng —
// server chỉ serve shell tĩnh, không gọi API nguonc.

type HomeData = {
  newFilms: PaginatedFilms | null;
  cinemaFilms: PaginatedFilms | null;
  seriesFilms: PaginatedFilms | null;
  animeFilms: PaginatedFilms | null;
};

const safe = (p: Promise<PaginatedFilms>) => p.catch(() => null);

export default function HomePage() {
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [newFilms, cinemaFilms, seriesFilms, animeFilms] = await Promise.all([
      safe(getNewFilms(1)),
      safe(getFilmsByCategory('phim-dang-chieu', 1)),
      safe(getFilmsByCategory('phim-bo', 1)),
      safe(getFilmsByCategory('hoat-hinh', 1)),
    ]);
    setData({ newFilms, cinemaFilms, seriesFilms, animeFilms });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageLoading label="Đang tải phim..." />;

  const allFailed = !data?.newFilms && !data?.cinemaFilms && !data?.seriesFilms && !data?.animeFilms;
  if (allFailed) return <LoadError onRetry={load} />;

  return (
    <>
      {data?.newFilms?.items && <HeroSlider films={data.newFilms.items.slice(0, 8)} />}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <FilmRow title="Phim Mới Cập Nhật"  films={data?.newFilms?.items || []}    moreLink="/danh-sach/phim-moi-cap-nhat" />
        <FilmRow title="Đang Chiếu Rạp"     films={data?.cinemaFilms?.items || []} moreLink="/danh-sach/phim-dang-chieu"  />
        <FilmRow title="Phim Bộ Hot"        films={data?.seriesFilms?.items || []} moreLink="/danh-sach/phim-bo"          />
        <FilmRow title="Anime Mới Nhất"     films={data?.animeFilms?.items || []}  moreLink="/danh-sach/hoat-hinh"        />
      </div>
    </>
  );
}
