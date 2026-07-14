'use client';

import { useCallback, useEffect, useState } from 'react';
import { getFilmsByCategory, PaginatedFilms } from '@/lib/api';
import { fetchDbFilms } from '@/lib/dbFilms';
import HeroSlider from '@/components/films/HeroSlider';
import FilmRow from '@/components/films/FilmRow';
import { PageLoading, LoadError } from '@/components/ui/Skeleton';

// Trang chủ: "Phim Mới", "Phim Bộ Hot", "Anime" đọc từ DB nội bộ (nhiều dữ liệu hơn,
// kết hợp được điều kiện) — riêng "Đang Chiếu Rạp" vẫn gọi thẳng NguonC vì đây là
// danh mục mang tính thời điểm (đang chiếu rạp lúc này), không có nhãn tương ứng
// đáng tin cậy trong DB để suy luận.

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
      safe(fetchDbFilms({ sort: 'new', page: 1 })),
      safe(getFilmsByCategory('phim-dang-chieu', 1)),
      safe(fetchDbFilms({ 'dinh-dang': 'phim-bo', sort: 'new', page: 1 })),
      safe(fetchDbFilms({ 'the-loai': 'hoat-hinh', sort: 'new', page: 1 })),
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
