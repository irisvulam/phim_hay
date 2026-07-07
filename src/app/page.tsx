import { getFilmsByCategory, getNewFilms, PaginatedFilms } from '@/lib/api';
import HeroSlider from '@/components/films/HeroSlider';
import FilmRow from '@/components/films/FilmRow';

// Không prerender lúc build — API nguonc chặn IP của build server (403),
// render lúc request và cache theo revalidate của từng fetch.
export const dynamic = 'force-dynamic';

const safe = (p: Promise<PaginatedFilms>) => p.catch(() => null);

export default async function HomePage() {
  const [newFilms, cinemaFilms, seriesFilms, animeFilms] = await Promise.all([
    safe(getNewFilms(1)),
    safe(getFilmsByCategory('phim-dang-chieu', 1)),
    safe(getFilmsByCategory('phim-bo', 1)),
    safe(getFilmsByCategory('hoat-hinh', 1)),
  ]);

  const allFailed = !newFilms && !cinemaFilms && !seriesFilms && !animeFilms;

  if (allFailed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <h1 className="text-2xl font-bold text-white">Không tải được dữ liệu phim</h1>
        <p className="text-[var(--text-base)]">
          Nguồn phim tạm thời không truy cập được, vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <>
      {newFilms?.items && <HeroSlider films={newFilms.items.slice(0, 8)} />}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
        <FilmRow title="Phim Mới Cập Nhật"  films={newFilms?.items || []}    moreLink="/danh-sach/phim-moi-cap-nhat" />
        <FilmRow title="Đang Chiếu Rạp"     films={cinemaFilms?.items || []} moreLink="/danh-sach/phim-dang-chieu"  />
        <FilmRow title="Phim Bộ Hot"        films={seriesFilms?.items || []} moreLink="/danh-sach/phim-bo"          />
        <FilmRow title="Anime Mới Nhất"     films={animeFilms?.items || []}  moreLink="/danh-sach/hoat-hinh"        />
      </div>
    </>
  );
}
