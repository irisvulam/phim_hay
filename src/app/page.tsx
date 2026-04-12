import { getFilmsByCategory, getNewFilms } from '@/lib/api';
import HeroSlider from '@/components/films/HeroSlider';
import FilmRow from '@/components/films/FilmRow';

export default async function HomePage() {
  const [newFilms, cinemaFilms, seriesFilms, animeFilms] = await Promise.all([
    getNewFilms(1),
    getFilmsByCategory('phim-dang-chieu', 1),
    getFilmsByCategory('phim-bo', 1),
    getFilmsByCategory('hoat-hinh', 1),
  ]);

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
