import { searchFilms } from '@/lib/api';
import FilmCard from '@/components/films/FilmCard';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  return {
    title: `Tìm kiếm: ${q || ''} - PhimHay`,
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const keyword = q?.trim() || '';
  const data = keyword ? await searchFilms(keyword).catch(() => null) : null;

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl py-8 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-white border-l-4 border-[var(--primary-color)] pl-3 mb-8">
        Kết quả tìm kiếm cho: <span className="text-[var(--primary-color)]">"{keyword}"</span>
      </h1>

      {!keyword && (
        <div className="text-gray-400">Vui lòng nhập từ khóa để tìm kiếm.</div>
      )}

      {keyword && (!data || !data.items || data.items.length === 0) && (
        <div className="text-gray-400">Không tìm thấy phim nào phù hợp.</div>
      )}
      
      {data?.items && data.items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {data.items.map(film => (
            <FilmCard key={film.slug} film={film} />
          ))}
        </div>
      )}
    </div>
  );
}
